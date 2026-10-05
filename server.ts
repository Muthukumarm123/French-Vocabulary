import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Initialize GoogleGenAI client with AI Studio credentials & headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to safely call Gemini with fallback models
async function callGemini(params: { contents: string; systemInstruction?: string; responseSchema?: any; responseMimeType?: string }) {
  const modelsToTry = ['gemini-flash-latest', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const config: any = {};
      if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
      if (params.responseSchema) config.responseSchema = params.responseSchema;
      if (params.responseMimeType) config.responseMimeType = params.responseMimeType;

      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed, trying next. Error:`, err?.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models unavailable');
}

function parseJSONSafely(text: string | undefined): any {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) return JSON.parse(match[0]);
      throw new Error('Failed to parse AI JSON response');
    }
  }
}

// -------------------------------------------------------------
// Endpoint 1: AI French Doubt Clearing & Tutor (/api/ai/doubt)
// -------------------------------------------------------------
app.post('/api/ai/doubt', async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required' });
    }

    const systemInstruction = `You are an expert, encouraging, and highly pedagogical French linguistic tutor and grammarian.
The user is asking a doubt or question about French vocabulary, grammar, pronunciation, nuance, cultural context, or sentence building.
Your goal is to provide a crystal-clear, structured, and insightful explanation.
Rules:
1. Explain clearly in friendly English, using authentic French examples.
2. Highlight distinct differences if comparing words (e.g. savoir vs connaître, an vs année).
3. Always provide example sentences in French with direct English translations.
4. Give a practical mnemonic or memory tip if applicable.
5. Keep explanations direct, engaging, and well-structured with clear bullet points.`;

    const prompt = context
      ? `User question: "${question}"\nContext/Selected word: "${context}"`
      : `User question: "${question}"`;

    const answer = await callGemini({
      contents: prompt,
      systemInstruction,
    });

    res.json({ success: true, answer });
  } catch (err: any) {
    console.error('Error in /api/ai/doubt:', err);
    res.status(500).json({
      error: 'Unable to process doubt with AI tutor at this moment. Please try again shortly.',
      details: err?.message,
    });
  }
});

// -------------------------------------------------------------
// Endpoint 2: Add Word if Not Present (/api/ai/add-word)
// -------------------------------------------------------------
app.post('/api/ai/add-word', async (req, res) => {
  try {
    const { word, hint } = req.body;
    if (!word || typeof word !== 'string') {
      return res.status(400).json({ error: 'Word is required' });
    }

    const systemInstruction = `You are a French lexicographer and linguist.
Analyze the given French word or expression and generate a complete, rigorous linguistic entry matching the French Vocabulary Library schema.
Always provide authentic accents, accurate CEFR level (A1 to C2), IPA pronunciation, part of speech, gender, definite article, concise definition, natural context sentence in French with English translation, and present tense conjugation table if it is a verb.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        word: { type: Type.STRING, description: 'The proper French word with correct accents' },
        translation: { type: Type.STRING, description: 'English translation or primary meanings' },
        type: {
          type: Type.STRING,
          enum: ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'expression', 'other'],
          description: 'Grammatical part of speech',
        },
        level: {
          type: Type.STRING,
          enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
          description: 'CEFR proficiency level based on frequency',
        },
        category: { type: Type.STRING, description: 'One of: Food & Drink, Home, People & Family, School, Work & Careers, Travel, Transport, Places, Nature, Animals, Body & Health, Clothes, Colours, Numbers, Time & Dates, Weather, Sports, Hobbies, Technology, Communication, Emotions, Personality, Common Verbs, Adjectives, Adverbs, Prepositions, Conjunctions, Pronouns, Question Words, Useful Expressions, Everyday Phrases, General Lexicon' },
        subcategory: { type: Type.STRING, description: 'Specific subcategory' },
        gender: { type: Type.STRING, enum: ['masculine', 'feminine', 'none'], description: 'Grammatical gender for nouns' },
        article: { type: Type.STRING, description: "Definite article: le, la, l', or null" },
        plural: { type: Type.STRING, description: 'Plural form if applicable' },
        pronunciation: { type: Type.STRING, description: 'IPA phonetics e.g. /.../' },
        definition: { type: Type.STRING, description: 'Clear concise definition in English' },
        exampleFrench: { type: Type.STRING, description: 'Natural French example sentence' },
        exampleEnglish: { type: Type.STRING, description: 'English translation of the example sentence' },
        notes: { type: Type.STRING, description: 'Usage tips, grammatical nuances, or etymology' },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Keywords and semantic tags' },
        verbDetails: {
          type: Type.OBJECT,
          properties: {
            infinitive: { type: Type.STRING },
            auxiliary: { type: Type.STRING, enum: ['avoir', 'être', 'none'] },
            group: { type: Type.STRING },
            irregular: { type: Type.BOOLEAN },
            present: {
              type: Type.OBJECT,
              properties: {
                je: { type: Type.STRING },
                tu: { type: Type.STRING },
                il_elle: { type: Type.STRING },
                nous: { type: Type.STRING },
                vous: { type: Type.STRING },
                ils_elles: { type: Type.STRING },
              },
            },
            pastParticiple: { type: Type.STRING },
          },
        },
      },
      required: ['word', 'translation', 'type', 'level', 'category', 'definition', 'exampleFrench', 'exampleEnglish'],
    };

    const prompt = `Analyze this word and return complete lexical data: "${word}"${hint ? ` (Hint: ${hint})` : ''}`;

    const rawJson = await callGemini({
      contents: prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
    });

    const parsed = parseJSONSafely(rawJson);
    // Normalize gender and article
    if (parsed.gender === 'none') parsed.gender = null;
    if (parsed.verbDetails?.auxiliary === 'none') parsed.verbDetails.auxiliary = null;

    res.json({ success: true, entry: parsed });
  } catch (err: any) {
    console.error('Error in /api/ai/add-word:', err);
    res.status(500).json({
      error: 'Failed to analyze word with AI. Please check the spelling and try again.',
      details: err?.message,
    });
  }
});

// -------------------------------------------------------------
// Endpoint 3: Bilingual French <-> English Translator (/api/ai/translate)
// -------------------------------------------------------------
app.post('/api/ai/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text to translate is required' });
    }

    const systemInstruction = `You are a professional literary and practical French-English translator and linguistic assistant.
Translate the text accurately between French and English. Provide the natural, contextually appropriate translation.
In addition, extract key French vocabulary words used in the text/translation, identifying their part of speech, CEFR level, and English gloss.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        detectedSourceLang: { type: Type.STRING, enum: ['fr', 'en'] },
        translatedText: { type: Type.STRING, description: 'The accurate, natural translation' },
        alternativeTranslation: { type: Type.STRING, description: 'An optional alternative or more colloquial/formal phrasing' },
        notes: { type: Type.STRING, description: 'Linguistic nuances or cultural notes regarding the translation' },
        vocabularyBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              frenchWord: { type: Type.STRING },
              englishWord: { type: Type.STRING },
              type: { type: Type.STRING },
              level: { type: Type.STRING },
              explanation: { type: Type.STRING },
            },
            required: ['frenchWord', 'englishWord', 'type', 'level'],
          },
          description: 'Key French vocabulary terms extracted from the translation',
        },
      },
      required: ['detectedSourceLang', 'translatedText', 'vocabularyBreakdown'],
    };

    const prompt = `Translate this text from ${sourceLang || 'auto'} to ${targetLang || 'fr'}:
"${text}"`;

    const rawJson = await callGemini({
      contents: prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
    });

    const parsed = parseJSONSafely(rawJson);
    res.json({ success: true, translation: parsed });
  } catch (err: any) {
    console.error('Error in /api/ai/translate:', err);
    res.status(500).json({
      error: 'Translation service error. Please try again shortly.',
      details: err?.message,
    });
  }
});

// -------------------------------------------------------------
// Endpoint 4: Google Translate Style Instant Translator (/api/ai/quick-translate)
// -------------------------------------------------------------
app.post('/api/ai/quick-translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text to translate is required' });
    }

    const systemInstruction = `You are a high-speed, accurate bilingual French-English translator mimicking the behavior and quality of Google Translate.
Translate the input text immediately and naturally between French and English.
If the input text is a single word or short phrase, provide dictionary meanings with parts of speech and common alternate translations like Google Translate does.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        detectedLang: { type: Type.STRING, enum: ['fr', 'en', 'auto'] },
        translatedText: { type: Type.STRING, description: 'The direct translated text' },
        phonetic: { type: Type.STRING, description: 'Phonetic pronunciation transcription' },
        dictionary: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              partOfSpeech: { type: Type.STRING },
              meanings: { type: Type.ARRAY, items: { type: Type.STRING } },
              synonyms: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['partOfSpeech', 'meanings'],
          },
          description: 'Dictionary definitions and alternate translations (if single word or short expression)',
        },
      },
      required: ['detectedLang', 'translatedText'],
    };

    const prompt = `Translate this text from ${sourceLang || 'auto'} to ${targetLang || 'fr'}:
"${text}"`;

    const rawJson = await callGemini({
      contents: prompt,
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema,
    });

    const parsed = parseJSONSafely(rawJson);
    res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error('Error in /api/ai/quick-translate:', err);
    res.status(500).json({
      error: 'Quick translation error. Please try again.',
      details: err?.message,
    });
  }
});

// Always serve vocabulary.json statically
app.use('/vocabulary.json', express.static(path.join(__dirname, 'vocabulary.json')));

// Mount Vite in development or serve dist in production
if (process.env.NODE_ENV === 'production' && !process.env.DEV_MODE) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Vite dev middleware mode
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`French Vocabulary Library server running at http://0.0.0.0:${port}`);
});
