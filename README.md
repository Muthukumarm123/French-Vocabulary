# 🇫🇷 French Vocabulary & AI Learning Suite

A comprehensive, full-stack French vocabulary reference library and interactive study platform featuring CEFR levels (A1–C2), dual viewing modes (Book Mode & Row Mode), and a Google Translate–style bilingual translation suite powered by Google Gemini.

---

## ✨ Features

- **📚 Dual View Modes**:
  - **Book Mode**: Interactive card/flashcard layout designed for immersive study with French terms, audio pronunciation, English translations, and CEFR indicators.
  - **Row Mode**: Structured, high-density table view with aligned columns for French words (plus phonetic IPA transcription), English glosses, grammatical parts of speech, CEFR level, and subcategory.
  - **Comprehensive Word Modal**: Click any word or row to inspect full conjugations, example sentences, grammatical gender, definitions, and usage notes.
- **🗂️ Categories & Subcategories**:
  - Filter across thematic categories (Food & Drink, Travel, Work, Daily Life, etc.).
  - Real-time subcategory filter pills with dynamic word count badges.
- **🌐 Google Translate–Style Bilingual Translator**:
  - Instant French $\leftrightarrow$ English dual-pane interface with instant language swapping.
  - Live, debounced translation as you type.
  - Dictionary definitions, alternative translations, and synonyms for words and expressions.
  - Built-in text-to-speech (TTS) pronunciation audio and voice speech recognition.
  - One-click **+ Add to Library** button to save new translated words directly to your personal lexicon.
- **🤖 AI French Linguistic Tutor (Doubt Clearing)**:
  - Ask open-ended grammar and nuance questions (e.g., *passé composé* vs. *imparfait*, *c'est* vs. *il est*, prepositions, gender rules).
  - Get pedagogical explanations, authentic French examples, and pronunciation tips.
- **➕ AI Word Generator**:
  - Add any French word or phrase to the database. AI automatically enriches it with CEFR level, grammar, part of speech, conjugations, examples, and English translation.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18+ or 20+ recommended)
- A [Google Gemini API Key](https://aistudio.google.com/) for the AI tutor and instant translator.

### 1. Clone the Repository

```bash
git clone https://github.com/Muthukumarm123/French-Vocabulary.git
cd French-Vocabulary
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Project Structure

```text
├── index.html           # Main SPA layout with Book/Row modes and Translator views
├── script.js            # Client-side reactivity, speech synthesis, and state handling
├── style.css            # Custom responsive styles, dark/light themes, and UI tokens
├── server.ts            # Express backend with Gemini API proxy endpoints
├── vocabulary.json      # Curated baseline French vocabulary database
├── package.json         # Project scripts and dependencies
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite build configuration
```

---

## 🚢 Deployment Options

Because the application uses an Express server (`server.ts`) to securely proxy Gemini API requests, it can be deployed to any Node.js hosting platform:

### Option A: Render (Free Web Service)
1. Link your GitHub repository `Muthukumarm123/French-Vocabulary` to [Render](https://render.com/).
2. Select **Web Service** with runtime **Node**.
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Add the environment variable `GEMINI_API_KEY` under Environment.

### Option B: Railway
1. Create a new project on [Railway](https://railway.app/) and select your GitHub repo.
2. Under Settings, set the environment variable `GEMINI_API_KEY`.
3. Railway will automatically detect the `package.json` start script and deploy.

### Option C: Vercel or Fly.io
- Deploy using standard Node.js serverless or container deployment with `npm start`.

---

## 📄 License

This project is licensed under the MIT License.
