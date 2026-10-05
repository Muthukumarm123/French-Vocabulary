/**
 * French Vocabulary Library — Pure Vanilla JavaScript Application Logic
 * No external libraries or frameworks.
 */

(function () {
  'use strict';

  // --- 1. Global Application State ---
  const state = {
    database: null,
    currentView: 'home', // 'home' | 'vocabulary' | 'category' | 'level'
    viewContext: null, // Holds category object or level object when applicable
    filters: {
      search: '',
      level: 'all',
      type: 'all',
      category: 'all',
      subcategory: 'all',
      sort: 'fr-asc',
      page: 1,
      perPage: 24
    },
    theme: 'light',
    frenchVoices: [],
    displayMode: localStorage.getItem('french_vocab_display_mode') || 'book', // 'book' | 'row'
    transTab: 'google', // 'google' | 'deep'
    transDirection: 'en-fr', // 'en-fr' | 'fr-en'
    gt: {
      sourceLang: 'auto',
      targetLang: 'fr',
      detectedLang: '',
      lastTranslatedText: '',
      lastTranslatedData: null
    },
    currentModalWord: null,
    pendingCustomWord: null,
    recentDoubts: []
  };

  // --- 2. DOM Elements Cache ---
  const elements = {
    // Theme & Sidebar
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    menuToggleBtn: document.getElementById('menu-toggle-btn'),
    sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
    appSidebar: document.getElementById('app-sidebar'),
    sidebarBackdrop: document.getElementById('sidebar-backdrop'),
    sidebarScrollArea: document.getElementById('sidebar-scroll-area'),
    breadcrumbCurrent: document.getElementById('breadcrumb-current'),

    // AI Header Buttons
    headerDoubtBtn: document.getElementById('header-doubt-btn'),
    headerTranslatorBtn: document.getElementById('header-translator-btn'),
    headerAddWordBtn: document.getElementById('header-add-word-btn'),

    // Search
    headerSearchInput: document.getElementById('header-search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),

    // Views
    viewHome: document.getElementById('view-home'),
    viewVocabulary: document.getElementById('view-vocabulary'),
    viewDoubt: document.getElementById('view-doubt'),
    viewTranslator: document.getElementById('view-translator'),

    // Home Statistics & Grids
    statTotalWords: document.getElementById('stat-total-words'),
    statTotalCategories: document.getElementById('stat-total-categories'),
    statTotalLevels: document.getElementById('stat-total-levels'),
    statTotalVerbs: document.getElementById('stat-total-verbs'),
    statTotalNouns: document.getElementById('stat-total-nouns'),
    statTotalAdjectives: document.getElementById('stat-total-adjectives'),
    homeLevelsGrid: document.getElementById('home-levels-grid'),
    homeCategoriesGrid: document.getElementById('home-categories-grid'),

    // Home Action Cards
    navCardBrowse: document.getElementById('nav-card-browse'),
    navCardLevels: document.getElementById('nav-card-levels'),
    navCardCategories: document.getElementById('nav-card-categories'),
    navCardSearch: document.getElementById('nav-card-search'),
    navCardDoubt: document.getElementById('nav-card-doubt'),
    navCardTranslator: document.getElementById('nav-card-translator'),

    // Vocabulary / Browse Area
    viewMainTitle: document.getElementById('view-main-title'),
    viewDescription: document.getElementById('view-description'),
    subcategoryTabsContainer: document.getElementById('subcategory-tabs'),
    filterLevelSelect: document.getElementById('filter-level-select'),
    filterTypeSelect: document.getElementById('filter-type-select'),
    filterCategorySelect: document.getElementById('filter-category-select'),
    filterSubcategorySelect: document.getElementById('filter-subcategory-select'),
    filterSortSelect: document.getElementById('filter-sort-select'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    resultsCountText: document.getElementById('results-count-text'),
    activeFilterChips: document.getElementById('active-filter-chips'),

    // Display Mode Switcher (Book Mode vs Row Mode)
    btnModeBook: document.getElementById('btn-mode-book'),
    btnModeRow: document.getElementById('btn-mode-row'),
    vocabCardsGrid: document.getElementById('vocab-cards-grid'),
    vocabRowsContainer: document.getElementById('vocab-rows-container'),
    vocabRowsTbody: document.getElementById('vocab-rows-tbody'),

    emptyStateContainer: document.getElementById('empty-state-container'),
    emptyResetBtn: document.getElementById('empty-reset-btn'),
    emptyAiBox: document.getElementById('empty-ai-box'),
    emptyAiBtn: document.getElementById('empty-ai-add-btn'),
    emptySearchWord: document.getElementById('empty-search-word'),

    // Pagination
    paginationContainer: document.getElementById('pagination-container'),
    pagePrevBtn: document.getElementById('page-prev-btn'),
    pageNextBtn: document.getElementById('page-next-btn'),
    paginationPages: document.getElementById('pagination-pages'),
    paginationInfoText: document.getElementById('pagination-info-text'),

    // Word Detail Modal
    wordModalBackdrop: document.getElementById('word-modal-backdrop'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCategoryPath: document.getElementById('modal-category-path'),
    modalFrenchWord: document.getElementById('modal-french-word'),
    modalPronunciation: document.getElementById('modal-pronunciation'),
    modalTranslation: document.getElementById('modal-translation'),
    modalLevelBadge: document.getElementById('modal-level-badge'),
    modalTypeBadge: document.getElementById('modal-type-badge'),
    modalAudioBtn: document.getElementById('modal-audio-btn'),
    modalAskDoubtBtn: document.getElementById('modal-ask-doubt-btn'),
    modalGrammarSection: document.getElementById('modal-grammar-section'),
    modalGrammarGrid: document.getElementById('modal-grammar-grid'),
    modalConjugationSection: document.getElementById('modal-conjugation-section'),
    modalConjugationTableBody: document.getElementById('modal-conjugation-table-body'),
    modalDefinitionSection: document.getElementById('modal-definition-section'),
    modalDefinitionText: document.getElementById('modal-definition-text'),
    modalExampleSection: document.getElementById('modal-example-section'),
    modalExampleFrench: document.getElementById('modal-example-french'),
    modalExampleEnglish: document.getElementById('modal-example-english'),
    modalNotesSection: document.getElementById('modal-notes-section'),
    modalNotesText: document.getElementById('modal-notes-text'),
    modalTagsSection: document.getElementById('modal-tags-section'),
    modalTagsList: document.getElementById('modal-tags-list'),

    // Doubt View Elements
    doubtForm: document.getElementById('doubt-form'),
    doubtQuestionInput: document.getElementById('doubt-question-input'),
    doubtContextInput: document.getElementById('doubt-context-input'),
    doubtSubmitBtn: document.getElementById('doubt-submit-btn'),
    doubtClearBtn: document.getElementById('doubt-clear-btn'),
    doubtLoadingBox: document.getElementById('doubt-loading-box'),
    doubtResponseCard: document.getElementById('doubt-response-card'),
    doubtQueryDisplay: document.getElementById('doubt-query-display'),
    doubtSpeakBtn: document.getElementById('doubt-speak-btn'),
    doubtCopyBtn: document.getElementById('doubt-copy-btn'),
    doubtAnswerDisplay: document.getElementById('doubt-answer-display'),
    doubtQuickPrompts: document.getElementById('doubt-quick-prompts'),
    recentDoubtsSection: document.getElementById('recent-doubts-section'),
    recentDoubtsList: document.getElementById('recent-doubts-list'),

    // Translator Tab Mode Toggles
    tabTransGoogle: document.getElementById('tab-trans-google'),
    tabTransDeep: document.getElementById('tab-trans-deep'),
    googleTransContainer: document.getElementById('google-trans-container'),
    deepTransContainer: document.getElementById('deep-trans-container'),

    // Google Translate Elements
    gtSourceLangs: document.getElementById('gt-source-langs'),
    gtTargetLangs: document.getElementById('gt-target-langs'),
    gtSwapBtn: document.getElementById('gt-swap-btn'),
    gtInputText: document.getElementById('gt-input-text'),
    gtClearBtn: document.getElementById('gt-clear-btn'),
    gtSourceSpeakBtn: document.getElementById('gt-source-speak-btn'),
    gtSourceMicBtn: document.getElementById('gt-source-mic-btn'),
    gtCharCounter: document.getElementById('gt-char-counter'),
    gtTranslateBtn: document.getElementById('gt-translate-btn'),
    gtLoading: document.getElementById('gt-loading'),
    gtOutputText: document.getElementById('gt-output-text'),
    gtPhonetic: document.getElementById('gt-phonetic'),
    gtTargetSpeakBtn: document.getElementById('gt-target-speak-btn'),
    gtTargetCopyBtn: document.getElementById('gt-target-copy-btn'),
    gtSaveBtn: document.getElementById('gt-save-btn'),
    gtDictCard: document.getElementById('gt-dict-card'),
    gtDictWordBadge: document.getElementById('gt-dict-word-badge'),
    gtDictEntries: document.getElementById('gt-dict-entries'),

    // Deep Lexicon Translator Elements
    sourceLangLabel: document.getElementById('source-lang-label'),
    targetLangLabel: document.getElementById('target-lang-label'),
    langSwapBtn: document.getElementById('lang-swap-btn'),
    transClearBtn: document.getElementById('trans-clear-btn'),
    transInputText: document.getElementById('trans-input-text'),
    transCharCount: document.getElementById('trans-char-count'),
    samplePhraseBtn: document.getElementById('sample-phrase-btn'),
    transSubmitBtn: document.getElementById('trans-submit-btn'),
    targetHeaderTitle: document.getElementById('target-header-title'),
    transResultActions: document.getElementById('trans-result-actions'),
    transSpeakBtn: document.getElementById('trans-speak-btn'),
    transCopyBtn: document.getElementById('trans-copy-btn'),
    transLoadingBox: document.getElementById('trans-loading-box'),
    transPlaceholder: document.getElementById('trans-placeholder'),
    transResultContent: document.getElementById('trans-result-content'),
    translatedTextBox: document.getElementById('translated-text-box'),
    transAltBox: document.getElementById('trans-alt-box'),
    transAltText: document.getElementById('trans-alt-text'),
    transNotesBox: document.getElementById('trans-notes-box'),
    transNotesText: document.getElementById('trans-notes-text'),
    vocabBreakdownSection: document.getElementById('vocab-breakdown-section'),
    breakdownCardsGrid: document.getElementById('breakdown-cards-grid'),

    // Add Word Modal Elements
    addWordModalBackdrop: document.getElementById('add-word-modal-backdrop'),
    addWordCloseBtn: document.getElementById('add-word-close-btn'),
    addWordForm: document.getElementById('add-word-form'),
    addWordInput: document.getElementById('add-word-input'),
    addWordHintInput: document.getElementById('add-word-hint-input'),
    addWordSubmitBtn: document.getElementById('add-word-submit-btn'),
    addWordLoadingBox: document.getElementById('add-word-loading-box'),
    addWordPreviewContainer: document.getElementById('add-word-preview-container'),
    addWordPreviewCard: document.getElementById('add-word-preview-card'),
    addWordCancelBtn: document.getElementById('add-word-cancel-btn'),
    addWordConfirmBtn: document.getElementById('add-word-confirm-btn'),

    // Toast & Status
    toastNotification: document.getElementById('toast-notification'),
    loadingOverlay: document.getElementById('loading-overlay'),
    loadingStatusText: document.getElementById('loading-status-text'),
    errorScreenBanner: document.getElementById('error-screen-banner'),
    errorRetryBtn: document.getElementById('error-retry-btn')
  };

  const frCollator = new Intl.Collator('fr', { sensitivity: 'base' });

  // --- 3. Speech Synthesis Audio Setup ---

  function initSpeechSynthesis() {
    if (!('speechSynthesis' in window)) return;

    function populateVoices() {
      const allVoices = window.speechSynthesis.getVoices();
      state.frenchVoices = allVoices.filter(v => v.lang.startsWith('fr'));
    }

    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }
  }

  function speakFrenchWord(wordText) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = wordText.trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.88; // Slight reduction for clear pronunciation study
    utterance.pitch = 1.0;

    if (state.frenchVoices.length > 0) {
      // Prefer standard fr-FR voice if available
      const frVoice = state.frenchVoices.find(v => v.lang === 'fr-FR') || state.frenchVoices[0];
      utterance.voice = frVoice;
    }

    window.speechSynthesis.speak(utterance);
  }

  // --- 4. Theme Management ---
  function initTheme() {
    const savedTheme = localStorage.getItem('french_vocab_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(state.theme);
  }

  function applyTheme(themeName) {
    state.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('french_vocab_theme', themeName);
  }

  function toggleTheme() {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }

  // --- 5. Data Fetching & Caching ---
  async function loadVocabularyDatabase() {
    try {
      elements.errorScreenBanner.classList.remove('active');
      if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.remove('hidden');
      }

      const response = await fetch('./vocabulary.json', { cache: 'default' });
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: Failed to load vocabulary.json`);
      }

      state.database = await response.json();
      loadSavedCustomWords();
      onDatabaseLoaded();
    } catch (err) {
      console.error('Database loading error:', err);
      elements.errorScreenBanner.classList.add('active');
      if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.add('hidden');
      }
    }
  }

  function loadSavedCustomWords() {
    if (!state.database || !Array.isArray(state.database.words)) return;
    try {
      const raw = localStorage.getItem('french_vocab_custom_words');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          // Prepend user custom words to database so they appear first in lists & searches
          state.database.words = [...list, ...state.database.words];
        }
      }
    } catch (e) {
      console.error('Error loading custom words from localStorage:', e);
    }
  }

  let toastTimer = null;
  function showToast(message) {
    if (!elements.toastNotification) return;
    elements.toastNotification.textContent = message;
    elements.toastNotification.classList.add('active');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      elements.toastNotification.classList.remove('active');
    }, 3500);
  }

  function saveCustomWord(entry) {
    if (!entry || !entry.word) return;

    if (!entry.id) {
      entry.id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }

    // Check if word already exists in words array
    const existingIdx = state.database.words.findIndex(
      w => w.word.toLowerCase() === entry.word.toLowerCase()
    );

    if (existingIdx !== -1) {
      // Merge / update existing entry with full generated details
      state.database.words[existingIdx] = { ...state.database.words[existingIdx], ...entry };
    } else {
      // Prepend to database
      state.database.words.unshift(entry);
    }

    // Persist in localStorage
    try {
      const raw = localStorage.getItem('french_vocab_custom_words');
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter(w => w.word.toLowerCase() !== entry.word.toLowerCase());
      list.unshift(entry);
      localStorage.setItem('french_vocab_custom_words', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }

    // Re-index counts and re-render stats & sidebar count
    computeAndRenderHomeStats();
    renderSidebarNav();
    showToast(`✨ Added "${entry.word}" to Vocabulary Library!`);
  }

  function onDatabaseLoaded() {
    // 1. Single pass O(N) indexing for fast lookup over 135,000 words
    computeAndRenderHomeStats();

    // 2. Render navigation sidebar
    renderSidebarNav();

    // 3. Populate filter dropdowns
    populateFilterDropdowns();

    // 4. Render Home Showcase grids
    renderHomeShowcases();

    // 5. Hide loading overlay
    if (elements.loadingOverlay) {
      elements.loadingOverlay.classList.add('hidden');
    }

    // 6. Activate initial view
    switchView('home');
  }

  // --- 6. Home View Calculations & Rendering ---
  function computeAndRenderHomeStats() {
    if (!state.database || !state.database.words) return;

    const words = state.database.words;
    const counts = {
      byLevel: {},
      byCategory: {},
      bySubcategory: {},
      total: words.length,
      verbs: 0,
      nouns: 0,
      adjectives: 0
    };

    // Single-pass O(N) traversal over 135,000 items
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      if (w.level) {
        counts.byLevel[w.level] = (counts.byLevel[w.level] || 0) + 1;
      }
      if (w.category) {
        counts.byCategory[w.category] = (counts.byCategory[w.category] || 0) + 1;
      }
      if (w.category && w.subcategory) {
        const subKey = `${w.category}::${w.subcategory}`;
        counts.bySubcategory[subKey] = (counts.bySubcategory[subKey] || 0) + 1;
      }
      const t = (w.type || '').toLowerCase();
      if (t === 'verb') counts.verbs++;
      else if (t === 'noun') counts.nouns++;
      else if (t === 'adjective') counts.adjectives++;
    }

    state.counts = counts;

    elements.statTotalWords.textContent = counts.total.toLocaleString();
    elements.statTotalCategories.textContent = (state.database.categories || []).length;
    elements.statTotalLevels.textContent = (state.database.levels || []).length;
    elements.statTotalVerbs.textContent = counts.verbs.toLocaleString();
    elements.statTotalNouns.textContent = counts.nouns.toLocaleString();
    elements.statTotalAdjectives.textContent = counts.adjectives.toLocaleString();
  }

  function renderHomeShowcases() {
    if (!state.database) return;

    // 1. Levels Grid
    elements.homeLevelsGrid.innerHTML = '';
    (state.database.levels || []).forEach(lvl => {
      const count = (state.counts && state.counts.byLevel[lvl.id]) || 0;
      const levelCard = document.createElement('button');
      levelCard.className = 'level-card-btn';
      levelCard.setAttribute('type', 'button');
      levelCard.setAttribute('aria-label', `Browse level ${lvl.name}`);

      const badgeClass = `cefr-${lvl.id.toLowerCase()}`;

      levelCard.innerHTML = `
        <div class="level-badge-header">
          <span class="cefr-badge ${badgeClass}">${lvl.id}</span>
          <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${count.toLocaleString()} words</span>
        </div>
        <div class="level-card-title">${escapeHTML(lvl.name)}</div>
        <div class="level-card-desc">${escapeHTML(lvl.description)}</div>
        <div class="level-card-meta">Explore level ${lvl.id} &rarr;</div>
      `;

      levelCard.addEventListener('click', () => {
        openLevelView(lvl.id);
      });

      elements.homeLevelsGrid.appendChild(levelCard);
    });

    // 2. Categories Grid
    elements.homeCategoriesGrid.innerHTML = '';
    (state.database.categories || []).forEach(cat => {
      const count = (state.counts && state.counts.byCategory[cat.name]) || 0;
      const catCard = document.createElement('button');
      catCard.className = 'category-card-btn';
      catCard.setAttribute('type', 'button');
      catCard.setAttribute('aria-label', `Browse category ${cat.name}`);

      const subcatPreviews = (cat.subcategories || [])
        .slice(0, 4)
        .map(s => `<span class="subcat-crumb">${escapeHTML(s)}</span>`)
        .join('<span style="color:var(--border-medium);">&middot;</span>');

      catCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom: 0.25rem;">
          <div class="category-card-name">${escapeHTML(cat.name)}</div>
          <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted);">${count.toLocaleString()}</span>
        </div>
        <div class="category-card-desc">${escapeHTML(cat.description)}</div>
        <div class="category-subcategories-preview">
          ${subcatPreviews}
        </div>
      `;

      catCard.addEventListener('click', () => {
        openCategoryView(cat.name);
      });

      elements.homeCategoriesGrid.appendChild(catCard);
    });
  }

  // --- 7. Sidebar Navigation Rendering ---
  function renderSidebarNav() {
    if (!state.database) return;

    elements.sidebarScrollArea.innerHTML = '';

    // Section 1: Main Links
    const mainSection = document.createElement('div');
    mainSection.innerHTML = `
      <button type="button" class="nav-item-btn" id="side-nav-home">
        <span class="nav-btn-content">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </span>
      </button>
      <button type="button" class="nav-item-btn" id="side-nav-all">
        <span class="nav-btn-content">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
          All Vocabulary
        </span>
        <span class="nav-count-badge">${state.database.words.length.toLocaleString()}</span>
      </button>
      <button type="button" class="nav-item-btn" id="side-nav-doubt">
        <span class="nav-btn-content">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          AI Doubt Tutor
        </span>
        <span class="nav-count-badge" style="background:var(--brand-light);color:var(--brand-primary);font-weight:700;">AI</span>
      </button>
      <button type="button" class="nav-item-btn" id="side-nav-translator">
        <span class="nav-btn-content">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
          AI Translator
        </span>
        <span class="nav-count-badge" style="background:var(--brand-light);color:var(--brand-primary);font-weight:700;">AI</span>
      </button>
      <button type="button" class="nav-item-btn" id="side-nav-add-word">
        <span class="nav-btn-content">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          + Add Word (AI)
        </span>
      </button>
    `;
    elements.sidebarScrollArea.appendChild(mainSection);

    document.getElementById('side-nav-home').addEventListener('click', () => {
      switchView('home');
      closeSidebarMobile();
    });

    document.getElementById('side-nav-all').addEventListener('click', () => {
      resetFilters();
      switchView('vocabulary');
      closeSidebarMobile();
    });

    document.getElementById('side-nav-doubt').addEventListener('click', () => {
      switchView('doubt');
      closeSidebarMobile();
    });

    document.getElementById('side-nav-translator').addEventListener('click', () => {
      switchView('translator');
      closeSidebarMobile();
    });

    document.getElementById('side-nav-add-word').addEventListener('click', () => {
      openAddWordModal();
      closeSidebarMobile();
    });

    // Section 2: BY LEVEL
    const levelTitle = document.createElement('div');
    levelTitle.className = 'nav-section-title';
    levelTitle.textContent = 'By Level';
    elements.sidebarScrollArea.appendChild(levelTitle);

    (state.database.levels || []).forEach(lvl => {
      const count = (state.counts && state.counts.byLevel[lvl.id]) || 0;
      const btn = document.createElement('button');
      btn.className = 'nav-item-btn';
      btn.setAttribute('type', 'button');
      btn.dataset.level = lvl.id;
      btn.innerHTML = `
        <span class="nav-btn-content">
          <span class="cefr-badge cefr-${lvl.id.toLowerCase()}">${lvl.id}</span>
          ${escapeHTML(lvl.name.split('—')[1] || lvl.name)}
        </span>
        <span class="nav-count-badge">${count.toLocaleString()}</span>
      `;
      btn.addEventListener('click', () => {
        openLevelView(lvl.id);
        closeSidebarMobile();
      });
      elements.sidebarScrollArea.appendChild(btn);
    });

    // Section 3: CATEGORIES (with subcategory dropdown accordion)
    const catTitle = document.createElement('div');
    catTitle.className = 'nav-section-title';
    catTitle.textContent = 'Categories';
    elements.sidebarScrollArea.appendChild(catTitle);

    (state.database.categories || []).forEach(cat => {
      const catCount = (state.counts && state.counts.byCategory[cat.name]) || 0;
      const item = document.createElement('div');
      item.className = 'category-accordion-item';

      const hasSubcats = cat.subcategories && cat.subcategories.length > 0;

      const headerBtn = document.createElement('button');
      headerBtn.className = 'category-header-btn';
      headerBtn.setAttribute('type', 'button');
      headerBtn.setAttribute('aria-expanded', 'false');
      headerBtn.dataset.category = cat.name;

      headerBtn.innerHTML = `
        <span class="nav-btn-content" style="gap:0.4rem;">
          ${hasSubcats ? `<svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>` : ''}
          ${escapeHTML(cat.name)}
        </span>
        <span class="nav-count-badge">${catCount.toLocaleString()}</span>
      `;

      item.appendChild(headerBtn);

      if (hasSubcats) {
        const subcatList = document.createElement('div');
        subcatList.className = 'subcategory-list';

        // "All <Category>" sub-item
        const allSubBtn = document.createElement('button');
        allSubBtn.className = 'subcategory-btn';
        allSubBtn.setAttribute('type', 'button');
        allSubBtn.textContent = `All ${cat.name}`;
        allSubBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          openCategoryView(cat.name);
          closeSidebarMobile();
        });
        subcatList.appendChild(allSubBtn);

        cat.subcategories.forEach(sub => {
          const subKey = `${cat.name}::${sub}`;
          const subCount = (state.counts && state.counts.bySubcategory[subKey]) || 0;
          const subBtn = document.createElement('button');
          subBtn.className = 'subcategory-btn';
          subBtn.setAttribute('type', 'button');
          subBtn.innerHTML = `<span>${escapeHTML(sub)}</span> <span style="opacity:0.6;font-size:0.7rem;margin-left:4px;">(${subCount.toLocaleString()})</span>`;
          subBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openCategorySubcategoryView(cat.name, sub);
            closeSidebarMobile();
          });
          subcatList.appendChild(subBtn);
        });

        item.appendChild(subcatList);
      }

      headerBtn.addEventListener('click', (e) => {
        const isExpanded = headerBtn.getAttribute('aria-expanded') === 'true';
        headerBtn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        openCategoryView(cat.name);
        closeSidebarMobile();
      });

      elements.sidebarScrollArea.appendChild(item);
    });
  }


  function updateSidebarActiveStates() {
    // Reset all actives
    document.querySelectorAll('.nav-item-btn, .category-header-btn, .subcategory-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    if (state.currentView === 'home') {
      const homeBtn = document.getElementById('side-nav-home');
      if (homeBtn) homeBtn.classList.add('active');
      elements.breadcrumbCurrent.textContent = 'Home';
    } else if (state.currentView === 'doubt') {
      const doubtBtn = document.getElementById('side-nav-doubt');
      if (doubtBtn) doubtBtn.classList.add('active');
      elements.breadcrumbCurrent.textContent = 'AI Doubt Tutor';
    } else if (state.currentView === 'translator') {
      const transBtn = document.getElementById('side-nav-translator');
      if (transBtn) transBtn.classList.add('active');
      elements.breadcrumbCurrent.textContent = 'AI Translator';
    } else if (state.currentView === 'level') {
      const activeBtn = document.querySelector(`.nav-item-btn[data-level="${state.filters.level}"]`);
      if (activeBtn) activeBtn.classList.add('active');
      elements.breadcrumbCurrent.textContent = `Level ${state.filters.level}`;
    } else if (state.currentView === 'category') {
      const activeBtn = document.querySelector(`.category-header-btn[data-category="${state.filters.category}"]`);
      if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-expanded', 'true');
      }
      elements.breadcrumbCurrent.textContent = state.filters.subcategory !== 'all'
        ? `${state.filters.category} › ${state.filters.subcategory}`
        : state.filters.category;
    } else {
      const allBtn = document.getElementById('side-nav-all');
      if (allBtn) allBtn.classList.add('active');
      elements.breadcrumbCurrent.textContent = 'All Vocabulary';
    }
  }

  // --- 8. Filter Controls Setup ---
  function populateFilterDropdowns() {
    if (!state.database) return;

    // Category Select
    elements.filterCategorySelect.innerHTML = '<option value="all">All Categories</option>';
    (state.database.categories || []).forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.name;
      opt.textContent = cat.name;
      elements.filterCategorySelect.appendChild(opt);
    });

    updateSubcategoryDropdown();
  }

  function updateSubcategoryDropdown() {
    elements.filterSubcategorySelect.innerHTML = '<option value="all">All Subcategories</option>';

    if (state.filters.category === 'all') {
      elements.filterSubcategorySelect.disabled = true;
      return;
    }

    elements.filterSubcategorySelect.disabled = false;
    const catObj = (state.database.categories || []).find(c => c.name === state.filters.category);
    if (catObj && catObj.subcategories) {
      catObj.subcategories.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        if (state.filters.subcategory === sub) opt.selected = true;
        elements.filterSubcategorySelect.appendChild(opt);
      });
    }
  }

  function updateSubcategoryHorizontalTabs() {
    if (state.filters.category === 'all') {
      elements.subcategoryTabsContainer.classList.remove('active');
      elements.subcategoryTabsContainer.innerHTML = '';
      return;
    }

    const catObj = (state.database.categories || []).find(c => c.name === state.filters.category);
    if (!catObj || !catObj.subcategories || catObj.subcategories.length === 0) {
      elements.subcategoryTabsContainer.classList.remove('active');
      elements.subcategoryTabsContainer.innerHTML = '';
      return;
    }

    elements.subcategoryTabsContainer.classList.add('active');
    elements.subcategoryTabsContainer.innerHTML = '';

    const allCatCount = (state.counts && state.counts.byCategory[catObj.name]) || 0;

    // "All" tab
    const allTab = document.createElement('button');
    allTab.type = 'button';
    allTab.className = `subcat-tab-btn ${state.filters.subcategory === 'all' ? 'active' : ''}`;
    allTab.innerHTML = `<span>All ${escapeHTML(catObj.name)}</span> <span style="opacity:0.75; font-size:0.75rem; margin-left:4px; font-weight:600;">(${allCatCount.toLocaleString()})</span>`;
    allTab.addEventListener('click', () => {
      state.filters.subcategory = 'all';
      state.filters.page = 1;
      elements.filterSubcategorySelect.value = 'all';
      updateSubcategoryHorizontalTabs();
      renderFilteredVocabulary();
    });
    elements.subcategoryTabsContainer.appendChild(allTab);

    catObj.subcategories.forEach(sub => {
      const subKey = `${catObj.name}::${sub}`;
      const subCount = (state.counts && state.counts.bySubcategory[subKey]) || 0;
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = `subcat-tab-btn ${state.filters.subcategory === sub ? 'active' : ''}`;
      tab.innerHTML = `<span>${escapeHTML(sub)}</span> <span style="opacity:0.75; font-size:0.75rem; margin-left:4px; font-weight:600;">(${subCount.toLocaleString()})</span>`;
      tab.addEventListener('click', () => {
        state.filters.subcategory = sub;
        state.filters.page = 1;
        elements.filterSubcategorySelect.value = sub;
        updateSubcategoryHorizontalTabs();
        renderFilteredVocabulary();
      });
      elements.subcategoryTabsContainer.appendChild(tab);
    });
  }

  // --- 9. View Switching & Navigation ---
  function switchView(viewName) {
    state.currentView = viewName;

    elements.viewHome.classList.remove('active');
    elements.viewVocabulary.classList.remove('active');
    if (elements.viewDoubt) elements.viewDoubt.classList.remove('active');
    if (elements.viewTranslator) elements.viewTranslator.classList.remove('active');

    if (viewName === 'home') {
      elements.viewHome.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'doubt') {
      if (elements.viewDoubt) elements.viewDoubt.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (viewName === 'translator') {
      if (elements.viewTranslator) elements.viewTranslator.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      elements.viewVocabulary.classList.add('active');
      renderVocabularyView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updateSidebarActiveStates();
  }

  function openCategoryView(categoryName) {
    state.filters.category = categoryName;
    state.filters.subcategory = 'all';
    state.filters.page = 1;
    elements.filterCategorySelect.value = categoryName;
    updateSubcategoryDropdown();
    updateSubcategoryHorizontalTabs();
    switchView('category');
  }

  function openCategorySubcategoryView(categoryName, subcategoryName) {
    state.filters.category = categoryName;
    state.filters.subcategory = subcategoryName;
    state.filters.page = 1;
    elements.filterCategorySelect.value = categoryName;
    updateSubcategoryDropdown();
    elements.filterSubcategorySelect.value = subcategoryName;
    updateSubcategoryHorizontalTabs();
    switchView('category');
  }

  function openLevelView(levelId) {
    state.filters.level = levelId;
    state.filters.page = 1;
    elements.filterLevelSelect.value = levelId;
    switchView('level');
  }

  function resetFilters() {
    state.filters.search = '';
    state.filters.level = 'all';
    state.filters.type = 'all';
    state.filters.category = 'all';
    state.filters.subcategory = 'all';
    state.filters.sort = 'fr-asc';
    state.filters.page = 1;

    elements.headerSearchInput.value = '';
    elements.searchClearBtn.style.display = 'none';
    elements.filterLevelSelect.value = 'all';
    elements.filterTypeSelect.value = 'all';
    elements.filterCategorySelect.value = 'all';
    elements.filterSortSelect.value = 'fr-asc';

    updateSubcategoryDropdown();
    updateSubcategoryHorizontalTabs();
    renderFilteredVocabulary();
  }

  // --- 10. Vocabulary Filtering, Sorting & Rendering ---
  function renderVocabularyView() {
    // Set headline and descriptions based on view context
    if (state.currentView === 'level') {
      const lvlObj = (state.database.levels || []).find(l => l.id === state.filters.level);
      elements.viewMainTitle.textContent = lvlObj ? lvlObj.name : `Level ${state.filters.level}`;
      elements.viewDescription.textContent = lvlObj
        ? lvlObj.description
        : 'Essential French vocabulary grouped by Common European Framework level.';
    } else if (state.currentView === 'category') {
      const catObj = (state.database.categories || []).find(c => c.name === state.filters.category);
      elements.viewMainTitle.textContent = catObj ? catObj.name : state.filters.category;
      elements.viewDescription.textContent = catObj
        ? catObj.description
        : `French vocabulary and expressions for ${state.filters.category}.`;
    } else {
      elements.viewMainTitle.textContent = 'All French Vocabulary';
      elements.viewDescription.textContent =
        'Comprehensive reference library of French vocabulary, verbs, and expressions with grammatical details.';
    }

    updateSubcategoryHorizontalTabs();
    renderFilteredVocabulary();
  }

  function filterAndSortWords() {
    if (!state.database || !state.database.words) return [];

    let result = state.database.words;

    // 1. Search Query
    const query = state.filters.search.trim().toLowerCase();
    if (query) {
      const normQ = removeAccents(query);
      result = result.filter(item => {
        const w = removeAccents(item.word || '');
        if (w.includes(normQ)) return true;
        if (item.translation && removeAccents(item.translation).includes(normQ)) return true;
        if (item.definition && removeAccents(item.definition).includes(normQ)) return true;
        if (item.exampleFrench && removeAccents(item.exampleFrench).includes(normQ)) return true;
        return false;
      });
    }

    // 2. CEFR Level Filter
    if (state.filters.level !== 'all') {
      result = result.filter(item => item.level === state.filters.level);
    }

    // 3. Word Type Filter
    if (state.filters.type !== 'all') {
      result = result.filter(item => (item.type || '').toLowerCase() === state.filters.type.toLowerCase());
    }

    // 4. Category Filter
    if (state.filters.category !== 'all') {
      result = result.filter(item => item.category === state.filters.category);
    }

    // 5. Subcategory Filter
    if (state.filters.subcategory !== 'all') {
      result = result.filter(item => item.subcategory === state.filters.subcategory);
    }

    // 6. Fast Sorting (pre-sorted database avoids heavy sort on fr-asc)
    if (state.filters.sort === 'fr-desc') {
      result = result.slice().reverse();
    } else if (state.filters.sort === 'en-asc') {
      result = result.slice().sort((a, b) => (a.translation || a.word).localeCompare(b.translation || b.word, 'en', { sensitivity: 'base' }));
    } else if (state.filters.sort === 'level') {
      const order = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
      result = result.slice().sort((a, b) => (order[a.level] || 99) - (order[b.level] || 99));
    } else if (state.filters.sort === 'category') {
      result = result.slice().sort((a, b) => frCollator.compare(a.category || '', b.category || ''));
    }

    return result;
  }

  function setDisplayMode(mode) {
    state.displayMode = mode;
    localStorage.setItem('french_vocab_display_mode', mode);

    if (elements.btnModeBook) {
      elements.btnModeBook.classList.toggle('active', mode === 'book');
      elements.btnModeBook.setAttribute('aria-pressed', mode === 'book');
    }
    if (elements.btnModeRow) {
      elements.btnModeRow.classList.toggle('active', mode === 'row');
      elements.btnModeRow.setAttribute('aria-pressed', mode === 'row');
    }

    if (mode === 'book') {
      if (elements.vocabCardsGrid) elements.vocabCardsGrid.style.display = 'grid';
      if (elements.vocabRowsContainer) elements.vocabRowsContainer.style.display = 'none';
    } else {
      if (elements.vocabCardsGrid) elements.vocabCardsGrid.style.display = 'none';
      if (elements.vocabRowsContainer) elements.vocabRowsContainer.style.display = 'block';
    }

    renderFilteredVocabulary();
  }

  function renderFilteredVocabulary() {
    const allFiltered = filterAndSortWords();
    const totalCount = allFiltered.length;

    // Manage Empty State
    if (totalCount === 0) {
      if (elements.vocabCardsGrid) elements.vocabCardsGrid.innerHTML = '';
      if (elements.vocabRowsTbody) elements.vocabRowsTbody.innerHTML = '';
      if (elements.vocabRowsContainer) elements.vocabRowsContainer.style.display = 'none';
      elements.emptyStateContainer.classList.add('active');
      elements.paginationContainer.style.display = 'none';
      elements.resultsCountText.textContent = '0 words found';

      if (state.filters.search && state.filters.search.trim()) {
        if (elements.emptyAiBox) {
          elements.emptyAiBox.style.display = 'block';
          if (elements.emptySearchWord) {
            elements.emptySearchWord.textContent = state.filters.search.trim();
          }
        }
      } else {
        if (elements.emptyAiBox) elements.emptyAiBox.style.display = 'none';
      }

      renderActiveFilterChips();
      return;
    }

    if (elements.emptyAiBox) elements.emptyAiBox.style.display = 'none';
    elements.emptyStateContainer.classList.remove('active');
    elements.paginationContainer.style.display = 'flex';

    // Apply active display mode
    const isBookMode = state.displayMode === 'book';
    if (elements.btnModeBook) elements.btnModeBook.classList.toggle('active', isBookMode);
    if (elements.btnModeRow) elements.btnModeRow.classList.toggle('active', !isBookMode);

    if (isBookMode) {
      if (elements.vocabCardsGrid) elements.vocabCardsGrid.style.display = 'grid';
      if (elements.vocabRowsContainer) elements.vocabRowsContainer.style.display = 'none';
    } else {
      if (elements.vocabCardsGrid) elements.vocabCardsGrid.style.display = 'none';
      if (elements.vocabRowsContainer) elements.vocabRowsContainer.style.display = 'block';
    }

    // Pagination calculations
    const perPage = state.filters.perPage;
    const totalPages = Math.ceil(totalCount / perPage);
    if (state.filters.page > totalPages) {
      state.filters.page = totalPages;
    }
    const startIndex = (state.filters.page - 1) * perPage;
    const endIndex = Math.min(startIndex + perPage, totalCount);
    const pageItems = allFiltered.slice(startIndex, endIndex);

    // Results Summary
    elements.resultsCountText.textContent = `Showing ${startIndex + 1}–${endIndex} of ${totalCount.toLocaleString()} words`;
    renderActiveFilterChips();

    // Render Cards Grid (Book Mode)
    if (elements.vocabCardsGrid) {
      elements.vocabCardsGrid.innerHTML = '';
      pageItems.forEach(item => {
        elements.vocabCardsGrid.appendChild(createVocabularyCard(item));
      });
    }

    // Render Rows Table (Row Mode)
    if (elements.vocabRowsTbody) {
      elements.vocabRowsTbody.innerHTML = '';
      pageItems.forEach(item => {
        elements.vocabRowsTbody.appendChild(createVocabularyRow(item));
      });
    }

    // Render Pagination Controls
    renderPaginationControls(totalPages, totalCount);
  }

  function createVocabularyRow(item) {
    const tr = document.createElement('tr');
    tr.className = 'vocab-row';
    tr.setAttribute('tabindex', '0');
    tr.setAttribute('role', 'button');
    tr.setAttribute('aria-label', `View details for French word ${item.word}`);

    let displayFrench = item.word;
    if (item.type === 'noun' && item.article) {
      displayFrench = item.article.endsWith("'")
        ? `${item.article}${item.word}`
        : `${item.article} ${item.word}`;
    }

    const badgeClass = `cefr-${(item.level || 'a1').toLowerCase()}`;
    const translationDisplay = item.translation ? escapeHTML(item.translation) : '';

    tr.innerHTML = `
      <td style="text-align: center;">
        <button type="button" class="row-audio-btn" aria-label="Pronounce ${escapeHTML(item.word)}" title="Listen to pronunciation">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        </button>
      </td>
      <td>
        <div class="row-french-text">${escapeHTML(displayFrench)}</div>
        ${item.pronunciation ? `<div class="row-phonetic">${escapeHTML(item.pronunciation)}</div>` : ''}
      </td>
      <td>
        <div class="row-english-text">${translationDisplay}</div>
      </td>
      <td>
        <span class="row-type-badge">${escapeHTML(item.type || 'word')}</span>
      </td>
      <td>
        <span class="cefr-badge ${badgeClass}">${escapeHTML(item.level || '')}</span>
      </td>
      <td>
        <span class="row-subcat-badge">${escapeHTML(item.subcategory || item.category || '')}</span>
      </td>
      <td style="text-align: center;">
        <button type="button" class="row-info-btn" title="View details and grammar">Info &rarr;</button>
      </td>
    `;

    // Audio click
    const audioBtn = tr.querySelector('.row-audio-btn');
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakFrenchWord(displayFrench);
    });

    // Row or Info button click -> open modal
    tr.addEventListener('click', () => {
      openWordModal(item);
    });

    tr.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWordModal(item);
      }
    });

    return tr;
  }

  function createVocabularyCard(item) {
    const card = document.createElement('div');
    card.className = 'vocab-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View details for French word ${item.word}`);

    // For nouns, display article + noun (e.g. "le pain", "la maison", "l'eau")
    let displayFrench = item.word;
    if (item.type === 'noun' && item.article) {
      displayFrench = item.article.endsWith("'")
        ? `${item.article}${item.word}`
        : `${item.article} ${item.word}`;
    }

    const badgeClass = `cefr-${(item.level || 'a1').toLowerCase()}`;
    const translationDisplay = item.translation
      ? escapeHTML(item.translation)
      : `<span style="opacity:0.75; font-style:italic;">${escapeHTML(item.type)} &middot; ${escapeHTML(item.category)}</span>`;

    card.innerHTML = `
      <div class="card-top-row">
        <div class="card-word-title">${escapeHTML(displayFrench)}</div>
        <button type="button" class="card-audio-btn" aria-label="Pronounce ${escapeHTML(item.word)}">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        </button>
      </div>
      ${item.pronunciation ? `<div class="card-pronunciation">${escapeHTML(item.pronunciation)}</div>` : ''}
      <div class="card-translation">${translationDisplay}</div>
      <div class="card-footer-meta">
        <div class="card-meta-left">
          <span class="card-type-label">${escapeHTML(item.type || 'word')}</span>
          <span class="meta-separator">&middot;</span>
          <span>${escapeHTML(item.category || '')}</span>
        </div>
        <span class="cefr-badge ${badgeClass}">${item.level || ''}</span>
      </div>
    `;


    // Click on Audio icon
    const audioBtn = card.querySelector('.card-audio-btn');
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakFrenchWord(displayFrench);
    });

    // Click on Card -> Open Modal
    card.addEventListener('click', () => {
      openWordModal(item);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openWordModal(item);
      }
    });

    return card;
  }

  function renderActiveFilterChips() {
    elements.activeFilterChips.innerHTML = '';

    const hasFilters =
      state.filters.search ||
      state.filters.level !== 'all' ||
      state.filters.type !== 'all' ||
      state.filters.category !== 'all' ||
      state.filters.subcategory !== 'all';

    elements.resetFiltersBtn.style.display = hasFilters ? 'inline-flex' : 'none';

    if (state.filters.search) {
      addFilterChip(`Search: "${state.filters.search}"`, () => {
        state.filters.search = '';
        elements.headerSearchInput.value = '';
        elements.searchClearBtn.style.display = 'none';
        renderFilteredVocabulary();
      });
    }

    if (state.filters.level !== 'all') {
      addFilterChip(`Level: ${state.filters.level}`, () => {
        state.filters.level = 'all';
        elements.filterLevelSelect.value = 'all';
        renderFilteredVocabulary();
      });
    }

    if (state.filters.type !== 'all') {
      addFilterChip(`Type: ${state.filters.type}`, () => {
        state.filters.type = 'all';
        elements.filterTypeSelect.value = 'all';
        renderFilteredVocabulary();
      });
    }

    if (state.filters.category !== 'all') {
      addFilterChip(`Category: ${state.filters.category}`, () => {
        state.filters.category = 'all';
        state.filters.subcategory = 'all';
        elements.filterCategorySelect.value = 'all';
        updateSubcategoryDropdown();
        updateSubcategoryHorizontalTabs();
        renderFilteredVocabulary();
      });
    }

    if (state.filters.subcategory !== 'all') {
      addFilterChip(`Subcategory: ${state.filters.subcategory}`, () => {
        state.filters.subcategory = 'all';
        elements.filterSubcategorySelect.value = 'all';
        updateSubcategoryHorizontalTabs();
        renderFilteredVocabulary();
      });
    }
  }

  function addFilterChip(label, onRemove) {
    const chip = document.createElement('span');
    chip.className = 'filter-chip-item';
    chip.innerHTML = `
      <span>${escapeHTML(label)}</span>
      <button type="button" class="filter-chip-remove" aria-label="Remove filter">&times;</button>
    `;
    chip.querySelector('.filter-chip-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      onRemove();
    });
    elements.activeFilterChips.appendChild(chip);
  }

  function renderPaginationControls(totalPages, totalCount) {
    elements.pagePrevBtn.disabled = state.filters.page <= 1;
    elements.pageNextBtn.disabled = state.filters.page >= totalPages;

    elements.paginationInfoText.textContent = `Page ${state.filters.page} of ${totalPages || 1}`;

    elements.paginationPages.innerHTML = '';

    if (totalPages <= 1) return;

    const current = state.filters.page;
    const pageNumbers = getPageNumbers(current, totalPages);

    pageNumbers.forEach(p => {
      if (p === '...') {
        const el = document.createElement('span');
        el.className = 'page-ellipsis';
        el.textContent = '…';
        elements.paginationPages.appendChild(el);
      } else {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `page-btn ${p === current ? 'active' : ''}`;
        btn.textContent = p;
        btn.addEventListener('click', () => {
          state.filters.page = p;
          renderFilteredVocabulary();
          elements.vocabCardsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        elements.paginationPages.appendChild(btn);
      }
    });
  }

  function getPageNumbers(current, total) {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  // --- 11. Word Detail Modal ---
  function openWordModal(item) {
    let fullWord = item.word;
    if (item.type === 'noun' && item.article) {
      fullWord = item.article.endsWith("'")
        ? `${item.article}${item.word}`
        : `${item.article} ${item.word}`;
    }

    elements.modalFrenchWord.textContent = fullWord;
    elements.modalTranslation.textContent = item.translation || `${item.type.charAt(0).toUpperCase() + item.type.slice(1)} &bull; Level ${item.level}`;

    // Pronunciation
    if (item.pronunciation) {
      elements.modalPronunciation.textContent = item.pronunciation;
      elements.modalPronunciation.style.display = 'block';
    } else {
      elements.modalPronunciation.style.display = 'none';
    }

    // Category Path
    const catPath = [item.category, item.subcategory].filter(Boolean).join(' › ');
    elements.modalCategoryPath.textContent = catPath;

    // Badges
    elements.modalLevelBadge.textContent = item.level || 'A1';
    elements.modalLevelBadge.className = `cefr-badge cefr-${(item.level || 'a1').toLowerCase()}`;
    elements.modalTypeBadge.textContent = item.type || 'Word';

    state.currentModalWord = item;

    // Audio Speech Button
    elements.modalAudioBtn.onclick = () => {
      speakFrenchWord(fullWord);
    };

    // Ask AI Tutor Button
    if (elements.modalAskDoubtBtn) {
      elements.modalAskDoubtBtn.onclick = () => {
        closeWordModal();
        switchView('doubt');
        if (elements.doubtQuestionInput) {
          elements.doubtQuestionInput.value = `Can you explain the usage, nuances, common collocations, and grammatical tips for the French word "${item.word}"?`;
        }
        if (elements.doubtContextInput) {
          elements.doubtContextInput.value = item.translation
            ? `${item.word} (${item.translation})`
            : item.word;
        }
        submitDoubt();
      };
    }

    // Grammatical Details Grid (Only non-empty fields!)
    elements.modalGrammarGrid.innerHTML = '';
    let hasGrammarFields = false;

    if (item.type === 'noun') {
      if (item.gender) {
        addGrammarItem('Gender', item.gender);
        hasGrammarFields = true;
      }
      if (item.article) {
        addGrammarItem('Definite Article', item.article);
        hasGrammarFields = true;
      }
      if (item.plural) {
        addGrammarItem('Plural Form', item.plural);
        hasGrammarFields = true;
      }
    } else if (item.type === 'verb') {
      const details = item.verbDetails || {};
      if (details.infinitive || item.word) {
        addGrammarItem('Infinitive', details.infinitive || item.word);
        hasGrammarFields = true;
      }
      if (details.group) {
        addGrammarItem('Verb Group', details.group);
        hasGrammarFields = true;
      }
      if (details.auxiliary) {
        addGrammarItem('Auxiliary', details.auxiliary);
        hasGrammarFields = true;
      }
      if (details.pastParticiple) {
        addGrammarItem('Past Participle', details.pastParticiple);
        hasGrammarFields = true;
      }
      if (details.irregular !== undefined) {
        addGrammarItem('Form', details.irregular ? 'Irregular' : 'Regular');
        hasGrammarFields = true;
      }
    } else if (item.type === 'adjective') {
      if (item.gender) {
        addGrammarItem('Base Gender', item.gender);
        hasGrammarFields = true;
      }
      if (item.feminine) {
        addGrammarItem('Feminine Form', item.feminine);
        hasGrammarFields = true;
      }
      if (item.plural) {
        addGrammarItem('Plural Form', item.plural);
        hasGrammarFields = true;
      }
    }

    elements.modalGrammarSection.style.display = hasGrammarFields ? 'block' : 'none';

    // Verb Conjugation Table (Present tense if available)
    if (item.type === 'verb' && item.verbDetails && item.verbDetails.present) {
      elements.modalConjugationSection.style.display = 'block';
      elements.modalConjugationTableBody.innerHTML = '';
      const present = item.verbDetails.present;
      const pronouns = [
        { key: 'je', label: 'Je' },
        { key: 'tu', label: 'Tu' },
        { key: 'il/elle', label: 'Il / Elle / On' },
        { key: 'nous', label: 'Nous' },
        { key: 'vous', label: 'Vous' },
        { key: 'ils/elles', label: 'Ils / Elles' }
      ];

      pronouns.forEach(p => {
        const val = present[p.key] || present[p.key.replace('/', '_')];
        if (val) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td class="subject-pronoun">${p.label}</td>
            <td class="conjugated-verb">${escapeHTML(val)}</td>
          `;
          elements.modalConjugationTableBody.appendChild(tr);
        }
      });
    } else {
      elements.modalConjugationSection.style.display = 'none';
    }

    // Definition
    elements.modalDefinitionSection.style.display = 'block';
    if (item.definition) {
      elements.modalDefinitionText.textContent = item.definition;
    } else {
      elements.modalDefinitionText.textContent = `Authentic French ${item.type} catalogued in the Lexique national lexical database, classified under ${item.category} at CEFR proficiency level ${item.level}.`;
    }

    // Example Sentences

    if (item.exampleFrench) {
      elements.modalExampleSection.style.display = 'block';
      elements.modalExampleFrench.textContent = item.exampleFrench;
      elements.modalExampleEnglish.textContent = item.exampleEnglish || '';
    } else {
      elements.modalExampleSection.style.display = 'none';
    }

    // Notes
    if (item.notes) {
      elements.modalNotesSection.style.display = 'block';
      elements.modalNotesText.textContent = item.notes;
    } else {
      elements.modalNotesSection.style.display = 'none';
    }

    // Tags
    if (item.tags && item.tags.length > 0) {
      elements.modalTagsSection.style.display = 'block';
      elements.modalTagsList.innerHTML = item.tags
        .map(t => `<span class="tag-item">#${escapeHTML(t)}</span>`)
        .join('<span style="color:var(--border-medium);">&middot;</span>');
    } else {
      elements.modalTagsSection.style.display = 'none';
    }

    // Display modal
    elements.wordModalBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function addGrammarItem(key, val) {
    const div = document.createElement('div');
    div.className = 'grammar-item';
    div.innerHTML = `
      <span class="grammar-key">${escapeHTML(key)}</span>
      <span class="grammar-val">${escapeHTML(val)}</span>
    `;
    elements.modalGrammarGrid.appendChild(div);
  }

  function closeWordModal() {
    elements.wordModalBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  // --- 12. Mobile Sidebar Drawer Controls ---
  function openSidebarMobile() {
    elements.appSidebar.classList.add('open');
    elements.sidebarBackdrop.classList.add('open');
  }

  function closeSidebarMobile() {
    elements.appSidebar.classList.remove('open');
    elements.sidebarBackdrop.classList.remove('open');
  }

  // --- 13. Utilities ---
  function removeAccents(str) {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function debounce(fn, delay) {
    let timer = null;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // --- 13.5 AI Features Implementation ---

  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHTML(text);

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h3>$1</h3>');

    // Horizontal rules
    html = html.replace(/^---$/gim, '<hr>');

    // Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Code / French highlights
    html = html.replace(/`([^`]+)`/gim, '<code style="background:var(--bg-surface);padding:2px 6px;border-radius:4px;color:var(--brand-primary);font-weight:600;">$1</code>');

    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote>$1</blockquote>');
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Bullet points
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

    // Paragraphs
    html = html
      .split('\n\n')
      .map(p => {
        p = p.trim();
        if (!p) return '';
        if (p.startsWith('<h') || p.startsWith('<ul') || p.startsWith('<block') || p.startsWith('<hr')) {
          return p;
        }
        return `<p>${p.replace(/\n/g, '<br>')}</p>`;
      })
      .join('');

    return html;
  }

  // --- Doubt Tutor Functions ---
  async function submitDoubt(overrideQuestion, overrideContext) {
    const question = overrideQuestion !== undefined ? overrideQuestion : elements.doubtQuestionInput.value.trim();
    const context = overrideContext !== undefined ? overrideContext : elements.doubtContextInput.value.trim();

    if (!question) return;

    elements.doubtLoadingBox.style.display = 'flex';
    elements.doubtResponseCard.style.display = 'none';
    elements.doubtSubmitBtn.disabled = true;

    try {
      const response = await fetch('/api/ai/doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.answer) {
        throw new Error(data.error || 'Failed to generate explanation');
      }

      // Display response
      elements.doubtQueryDisplay.textContent = question;
      elements.doubtAnswerDisplay.innerHTML = formatMarkdown(data.answer);
      elements.doubtResponseCard.style.display = 'block';

      // Setup audio speech for French answer
      elements.doubtSpeakBtn.onclick = () => {
        // Extract authentic French phrases or read initial sentences
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = elements.doubtAnswerDisplay.innerHTML;
        const strongs = Array.from(tempDiv.querySelectorAll('strong, em, code')).map(el => el.textContent.trim());
        const frenchSnippet = strongs.length > 0 ? strongs.slice(0, 5).join('. ') : question;
        speakFrenchWord(frenchSnippet);
      };

      // Copy Button
      elements.doubtCopyBtn.onclick = () => {
        navigator.clipboard.writeText(data.answer).then(() => {
          showToast('Copied explanation to clipboard!');
        });
      };

      // Store in recent doubts
      if (!state.recentDoubts.some(d => d.question === question)) {
        state.recentDoubts.unshift({ question, context, answer: data.answer });
        if (state.recentDoubts.length > 6) state.recentDoubts.pop();
        renderRecentDoubts();
      }

      elements.doubtResponseCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      console.error('Error submitting doubt:', err);
      showToast(`Error: ${err.message || 'Unable to connect to AI tutor'}`);
    } finally {
      elements.doubtLoadingBox.style.display = 'none';
      elements.doubtSubmitBtn.disabled = false;
    }
  }

  function renderRecentDoubts() {
    if (!elements.recentDoubtsSection || !elements.recentDoubtsList) return;
    if (state.recentDoubts.length === 0) {
      elements.recentDoubtsSection.style.display = 'none';
      return;
    }

    elements.recentDoubtsSection.style.display = 'block';
    elements.recentDoubtsList.innerHTML = '';

    state.recentDoubts.forEach(d => {
      const item = document.createElement('div');
      item.className = 'recent-doubt-item';
      item.innerHTML = `
        <span>${escapeHTML(d.question)}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
      `;
      item.addEventListener('click', () => {
        elements.doubtQuestionInput.value = d.question;
        elements.doubtContextInput.value = d.context || '';
        elements.doubtQueryDisplay.textContent = d.question;
        elements.doubtAnswerDisplay.innerHTML = formatMarkdown(d.answer);
        elements.doubtResponseCard.style.display = 'block';
        elements.doubtResponseCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      elements.recentDoubtsList.appendChild(item);
    });
  }

  // --- Translator Functions ---
  const samplePhrases = {
    'en-fr': [
      "I would like to order a warm croissant and an espresso, please.",
      "Could you please explain how to get to the Louvre museum by metro?",
      "It is always a pleasure to walk along the Seine on a crisp autumn evening.",
      "This small hilltop village in the south of France has preserved its medieval charm."
    ],
    'fr-en': [
      "J'aimerais réserver une table pour deux personnes ce soir s'il vous plaît.",
      "Pourriez-vous m'indiquer le chemin pour aller à la gare centrale ?",
      "C'est en forgeant qu'on devient forgeron, alors n'ayez pas peur de faire des erreurs.",
      "Ce petit village perché au sommet de la colline offre un panorama à couper le souffle."
    ]
  };

  let samplePhraseIdx = 0;

  function handleLangSwap() {
    state.transDirection = state.transDirection === 'en-fr' ? 'fr-en' : 'en-fr';

    const isEnFr = state.transDirection === 'en-fr';
    elements.sourceLangLabel.textContent = isEnFr ? 'English' : 'French';
    elements.targetLangLabel.textContent = isEnFr ? 'French' : 'English';
    elements.targetHeaderTitle.textContent = isEnFr ? 'Translation (French)' : 'Translation (English)';

    // Swap texts if translated text exists
    const currentInput = elements.transInputText.value;
    const currentTrans = elements.translatedTextBox.textContent;

    if (currentTrans && currentInput) {
      elements.transInputText.value = currentTrans;
      elements.translatedTextBox.textContent = currentInput;
      elements.transCharCount.textContent = `${currentTrans.length} / 2000`;
    }
  }

  async function handleTranslate() {
    const text = elements.transInputText.value.trim();
    if (!text) return;

    elements.transLoadingBox.style.display = 'flex';
    elements.transPlaceholder.style.display = 'none';
    elements.transResultContent.style.display = 'none';
    elements.transResultActions.style.display = 'none';
    elements.transSubmitBtn.disabled = true;

    const isEnFr = state.transDirection === 'en-fr';
    const sourceLang = isEnFr ? 'en' : 'fr';
    const targetLang = isEnFr ? 'fr' : 'en';

    try {
      const response = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, sourceLang, targetLang })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.translation) {
        throw new Error('Failed to retrieve translation');
      }

      const result = data.translation;

      // Render translated text
      elements.translatedTextBox.textContent = result.translatedText;

      // Alternative phrasing
      if (result.alternativeTranslation) {
        elements.transAltBox.style.display = 'block';
        elements.transAltText.textContent = result.alternativeTranslation;
      } else {
        elements.transAltBox.style.display = 'none';
      }

      // Notes
      if (result.notes) {
        elements.transNotesBox.style.display = 'block';
        elements.transNotesText.textContent = result.notes;
      } else {
        elements.transNotesBox.style.display = 'none';
      }

      // Vocabulary Breakdown
      renderVocabBreakdown(result.vocabularyBreakdown || []);

      // Speech audio for French
      elements.transSpeakBtn.onclick = () => {
        const frenchToSpeak = isEnFr ? result.translatedText : text;
        speakFrenchWord(frenchToSpeak);
      };

      // Copy translated text
      elements.transCopyBtn.onclick = () => {
        navigator.clipboard.writeText(result.translatedText).then(() => {
          showToast('Copied translation to clipboard!');
        });
      };

      elements.transResultContent.style.display = 'block';
      elements.transResultActions.style.display = 'flex';
    } catch (err) {
      console.error('Translation error:', err);
      showToast(`Translation error: ${err.message || 'Service unavailable'}`);
      elements.transPlaceholder.style.display = 'flex';
    } finally {
      elements.transLoadingBox.style.display = 'none';
      elements.transSubmitBtn.disabled = false;
    }
  }

  function renderVocabBreakdown(items) {
    if (!elements.vocabBreakdownSection || !elements.breakdownCardsGrid) return;

    if (!items || items.length === 0) {
      elements.vocabBreakdownSection.style.display = 'none';
      return;
    }

    elements.vocabBreakdownSection.style.display = 'block';
    elements.breakdownCardsGrid.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'breakdown-card';

      // Check if word already exists in library
      const existing = state.database && state.database.words.some(
        w => w.word.toLowerCase() === item.frenchWord.toLowerCase()
      );

      card.innerHTML = `
        <div>
          <div class="breakdown-french">${escapeHTML(item.frenchWord)}</div>
          <div class="breakdown-translation">${escapeHTML(item.englishWord)}</div>
          <div style="display:flex; gap:0.35rem; align-items:center; margin-bottom: 0.5rem;">
            <span class="cefr-badge cefr-${(item.level || 'a1').toLowerCase()}">${escapeHTML(item.level || 'A1')}</span>
            <span class="card-type-label" style="font-size:0.75rem;">${escapeHTML(item.type || 'word')}</span>
          </div>
          ${item.explanation ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.4rem;">${escapeHTML(item.explanation)}</div>` : ''}
        </div>
        <div class="breakdown-footer">
          <button type="button" class="card-audio-btn" title="Listen to pronunciation" style="width:24px; height:24px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
          <button type="button" class="btn-add-library ${existing ? 'added' : ''}">
            ${existing ? '✓ In Library' : '+ Add to Library'}
          </button>
        </div>
      `;

      // Audio click
      card.querySelector('.card-audio-btn').onclick = (e) => {
        e.stopPropagation();
        speakFrenchWord(item.frenchWord);
      };

      // Add to Library Click
      const addBtn = card.querySelector('.btn-add-library');
      if (!existing) {
        addBtn.onclick = async () => {
          addBtn.textContent = 'Generating...';
          addBtn.disabled = true;

          try {
            const resp = await fetch('/api/ai/add-word', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ word: item.frenchWord, hint: `${item.type || ''} ${item.englishWord || ''}` })
            });

            if (resp.ok) {
              const resData = await resp.json();
              if (resData.success && resData.entry) {
                saveCustomWord(resData.entry);
                addBtn.className = 'btn-add-library added';
                addBtn.textContent = '✓ In Library';
                addBtn.disabled = false;
                return;
              }
            }

            // Fallback manual entry creation if API error
            const fallbackEntry = {
              id: `user-${Date.now()}`,
              word: item.frenchWord,
              translation: item.englishWord,
              type: item.type || 'word',
              level: item.level || 'A1',
              category: 'General Lexicon',
              subcategory: 'Custom Additions',
              definition: item.explanation || item.englishWord,
              exampleFrench: `C'est un exemple avec le mot ${item.frenchWord}.`,
              exampleEnglish: `This is an example with the word ${item.frenchWord}.`
            };
            saveCustomWord(fallbackEntry);
            addBtn.className = 'btn-add-library added';
            addBtn.textContent = '✓ In Library';
            addBtn.disabled = false;
          } catch (err) {
            console.error('Failed to add word from translation:', err);
            showToast('Unable to add word at this moment.');
            addBtn.textContent = '+ Add to Library';
            addBtn.disabled = false;
          }
        };
      }

      elements.breakdownCardsGrid.appendChild(card);
    });
  }

  // --- Add Word With AI Modal Functions ---
  function openAddWordModal(prefillWord = '', prefillHint = '', autoSubmit = false) {
    if (!elements.addWordModalBackdrop) return;

    elements.addWordModalBackdrop.classList.add('active');
    elements.addWordInput.value = prefillWord || '';
    elements.addWordHintInput.value = prefillHint || '';
    elements.addWordPreviewContainer.style.display = 'none';
    elements.addWordLoadingBox.style.display = 'none';

    if (autoSubmit && prefillWord) {
      handleAnalyzeWord();
    } else {
      setTimeout(() => elements.addWordInput.focus(), 100);
    }
  }

  function closeAddWordModal() {
    if (!elements.addWordModalBackdrop) return;
    elements.addWordModalBackdrop.classList.remove('active');
  }

  async function handleAnalyzeWord() {
    const word = elements.addWordInput.value.trim();
    const hint = elements.addWordHintInput.value.trim();

    if (!word) return;

    elements.addWordLoadingBox.style.display = 'flex';
    elements.addWordPreviewContainer.style.display = 'none';
    elements.addWordSubmitBtn.disabled = true;

    try {
      const response = await fetch('/api/ai/add-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, hint })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.entry) {
        throw new Error('Failed to analyze word with AI');
      }

      state.pendingCustomWord = data.entry;
      renderAddWordPreview(data.entry);
      elements.addWordPreviewContainer.style.display = 'block';
      elements.addWordPreviewContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (err) {
      console.error('Add word error:', err);
      showToast(`Error: ${err.message || 'Failed to analyze word'}`);
    } finally {
      elements.addWordLoadingBox.style.display = 'none';
      elements.addWordSubmitBtn.disabled = false;
    }
  }

  function renderAddWordPreview(entry) {
    if (!elements.addWordPreviewCard) return;

    let displayFrench = entry.word;
    if (entry.type === 'noun' && entry.article) {
      displayFrench = entry.article.endsWith("'")
        ? `${entry.article}${entry.word}`
        : `${entry.article} ${entry.word}`;
    }

    elements.addWordPreviewCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 0.75rem;">
        <div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span style="font-size:1.35rem; font-weight:700; color:var(--text-primary); font-family:var(--font-serif);">${escapeHTML(displayFrench)}</span>
            <button type="button" class="card-audio-btn preview-speak-btn" title="Pronounce" style="width:28px; height:28px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            </button>
          </div>
          ${entry.pronunciation ? `<div style="font-size:0.85rem; font-family:var(--font-mono); color:var(--text-muted); margin-top:2px;">${escapeHTML(entry.pronunciation)}</div>` : ''}
          <div style="font-size:1rem; font-weight:600; color:var(--brand-primary); margin-top:0.35rem;">${escapeHTML(entry.translation)}</div>
        </div>
        <div style="display:flex; gap:0.4rem; align-items:center;">
          <span class="cefr-badge cefr-${(entry.level || 'a1').toLowerCase()}">${escapeHTML(entry.level || 'A1')}</span>
          <span class="card-type-label">${escapeHTML(entry.type || 'word')}</span>
        </div>
      </div>

      <div style="font-size:0.88rem; color:var(--text-secondary); line-height:1.5; margin-bottom:0.75rem;">
        <strong>Definition:</strong> ${escapeHTML(entry.definition || '')}
      </div>

      <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:0.6rem 0.85rem; margin-bottom:0.75rem;">
        <div style="font-style:italic; font-weight:500; color:var(--text-primary); margin-bottom:2px;">&ldquo;${escapeHTML(entry.exampleFrench || '')}&rdquo;</div>
        <div style="font-size:0.82rem; color:var(--text-muted);">&ldquo;${escapeHTML(entry.exampleEnglish || '')}&rdquo;</div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:0.5rem; font-size:0.8rem; color:var(--text-muted);">
        <div><strong>Category:</strong> ${escapeHTML(entry.category || 'General')} › ${escapeHTML(entry.subcategory || '')}</div>
        ${entry.notes ? `<div style="width:100%; margin-top:0.25rem;"><strong>Notes:</strong> ${escapeHTML(entry.notes)}</div>` : ''}
      </div>
    `;

    // Preview speak button
    const speakBtn = elements.addWordPreviewCard.querySelector('.preview-speak-btn');
    if (speakBtn) {
      speakBtn.onclick = () => speakFrenchWord(displayFrench);
    }
  }

  // --- Google Translate Style Translator Suite ---
  function setTranslatorTab(tab) {
    state.transTab = tab;
    if (elements.tabTransGoogle) {
      elements.tabTransGoogle.classList.toggle('active', tab === 'google');
      elements.tabTransGoogle.setAttribute('aria-selected', tab === 'google');
    }
    if (elements.tabTransDeep) {
      elements.tabTransDeep.classList.toggle('active', tab === 'deep');
      elements.tabTransDeep.setAttribute('aria-selected', tab === 'deep');
    }

    if (tab === 'google') {
      if (elements.googleTransContainer) elements.googleTransContainer.style.display = 'block';
      if (elements.deepTransContainer) elements.deepTransContainer.style.display = 'none';
    } else {
      if (elements.googleTransContainer) elements.googleTransContainer.style.display = 'none';
      if (elements.deepTransContainer) elements.deepTransContainer.style.display = 'block';
    }
  }

  function speakText(text, lang = 'fr-FR') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = (text || '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    const allVoices = window.speechSynthesis.getVoices();
    const voice = allVoices.find(v => v.lang.startsWith(lang.split('-')[0])) || null;
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  }

  async function handleGoogleTranslate() {
    if (!elements.gtInputText) return;
    const text = elements.gtInputText.value.trim();

    if (!text) {
      if (elements.gtOutputText) {
        elements.gtOutputText.textContent = 'Translation will appear here';
        elements.gtOutputText.classList.add('placeholder');
      }
      if (elements.gtPhonetic) elements.gtPhonetic.style.display = 'none';
      if (elements.gtDictCard) elements.gtDictCard.style.display = 'none';
      if (elements.gtSaveBtn) elements.gtSaveBtn.style.display = 'none';
      return;
    }

    if (elements.gtLoading) elements.gtLoading.style.display = 'flex';

    try {
      const response = await fetch('/api/ai/quick-translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang: state.gt.sourceLang,
          targetLang: state.gt.targetLang
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.translatedText) {
        throw new Error('No translation returned');
      }

      state.gt.lastTranslatedData = data;
      state.gt.detectedLang = data.detectedLang || (state.gt.sourceLang === 'auto' ? 'en' : state.gt.sourceLang);

      // Render translated text
      if (elements.gtOutputText) {
        elements.gtOutputText.textContent = data.translatedText;
        elements.gtOutputText.classList.remove('placeholder');
      }

      // Render Phonetic pronunciation
      if (elements.gtPhonetic) {
        if (data.phonetic) {
          elements.gtPhonetic.textContent = data.phonetic;
          elements.gtPhonetic.style.display = 'block';
        } else {
          elements.gtPhonetic.style.display = 'none';
        }
      }

      // Show "+ Add to Library" if target is French
      const isTargetFrench = state.gt.targetLang === 'fr' || (state.gt.targetLang === 'auto' && state.gt.detectedLang === 'en');
      if (elements.gtSaveBtn) {
        if (isTargetFrench && text.split(/\s+/).length <= 4) {
          elements.gtSaveBtn.style.display = 'inline-flex';
          elements.gtSaveBtn.className = 'gt-save-btn';
          elements.gtSaveBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            <span>+ Add to Library</span>
          `;
          elements.gtSaveBtn.onclick = () => {
            openAddWordModal(data.translatedText, text, true);
          };
        } else {
          elements.gtSaveBtn.style.display = 'none';
        }
      }

      // Render dictionary meanings if provided
      if (data.dictionary && Array.isArray(data.dictionary) && data.dictionary.length > 0) {
        renderGoogleTranslateDictionary(data.dictionary, text, data.translatedText);
      } else {
        if (elements.gtDictCard) elements.gtDictCard.style.display = 'none';
      }

    } catch (err) {
      console.error('Google Translate error:', err);
      if (elements.gtOutputText) {
        elements.gtOutputText.textContent = 'Translation service currently unavailable. Please try again.';
        elements.gtOutputText.classList.add('placeholder');
      }
      if (elements.gtPhonetic) elements.gtPhonetic.style.display = 'none';
      if (elements.gtDictCard) elements.gtDictCard.style.display = 'none';
    } finally {
      if (elements.gtLoading) elements.gtLoading.style.display = 'none';
    }
  }

  function renderGoogleTranslateDictionary(dictionary, originalWord, translatedWord) {
    if (!elements.gtDictCard || !elements.gtDictEntries) return;

    elements.gtDictEntries.innerHTML = '';
    if (elements.gtDictWordBadge) {
      elements.gtDictWordBadge.textContent = `${originalWord} ↔ ${translatedWord}`;
    }

    dictionary.forEach(entry => {
      const group = document.createElement('div');
      group.className = 'gt-dict-pos-group';

      let meaningsHtml = '';
      if (entry.meanings && entry.meanings.length > 0) {
        meaningsHtml = `<ol class="gt-dict-meanings-list">${entry.meanings.map(m => `<li>${escapeHTML(m)}</li>`).join('')}</ol>`;
      }

      let synonymsHtml = '';
      if (entry.synonyms && entry.synonyms.length > 0) {
        synonymsHtml = `<div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.35rem;"><strong>Synonyms:</strong> ${entry.synonyms.map(s => escapeHTML(s)).join(', ')}</div>`;
      }

      group.innerHTML = `
        <div class="gt-dict-pos-title">${escapeHTML(entry.partOfSpeech || 'definition')}</div>
        ${meaningsHtml}
        ${synonymsHtml}
      `;
      elements.gtDictEntries.appendChild(group);
    });

    elements.gtDictCard.style.display = 'block';
  }

  function handleGoogleLangSwap() {
    let currentSource = state.gt.sourceLang;
    let currentTarget = state.gt.targetLang;

    if (currentSource === 'auto') {
      currentSource = state.gt.detectedLang === 'fr' ? 'fr' : 'en';
    }

    const newSource = currentTarget;
    const newTarget = currentSource;

    state.gt.sourceLang = newSource;
    state.gt.targetLang = newTarget;

    // Update active tab buttons
    if (elements.gtSourceLangs) {
      elements.gtSourceLangs.querySelectorAll('.gt-lang-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === newSource);
      });
    }
    if (elements.gtTargetLangs) {
      elements.gtTargetLangs.querySelectorAll('.gt-lang-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === newTarget);
      });
    }

    // Swap text
    const currentInput = elements.gtInputText ? elements.gtInputText.value.trim() : '';
    const currentOutput = elements.gtOutputText ? elements.gtOutputText.textContent.trim() : '';
    if (currentOutput && elements.gtOutputText && !elements.gtOutputText.classList.contains('placeholder')) {
      if (elements.gtInputText) {
        elements.gtInputText.value = currentOutput;
        elements.gtCharCounter.textContent = `${currentOutput.length} / 3000`;
        elements.gtClearBtn.style.display = 'block';
      }
      handleGoogleTranslate();
    }
  }

  let speechRecognizer = null;
  function toggleSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Speech recognition is not supported in this browser.');
      return;
    }

    if (speechRecognizer) {
      speechRecognizer.stop();
      speechRecognizer = null;
      if (elements.gtSourceMicBtn) elements.gtSourceMicBtn.classList.remove('listening');
      return;
    }

    try {
      speechRecognizer = new SpeechRecognition();
      const lang = state.gt.sourceLang === 'fr' ? 'fr-FR' : 'en-US';
      speechRecognizer.lang = lang;
      speechRecognizer.interimResults = false;

      speechRecognizer.onstart = () => {
        if (elements.gtSourceMicBtn) elements.gtSourceMicBtn.classList.add('listening');
        showToast('Listening... Speak now');
      };

      speechRecognizer.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && elements.gtInputText) {
          elements.gtInputText.value = transcript;
          elements.gtCharCounter.textContent = `${transcript.length} / 3000`;
          elements.gtClearBtn.style.display = 'block';
          handleGoogleTranslate();
        }
      };

      speechRecognizer.onerror = (err) => {
        console.error('Speech recognition error:', err);
        showToast('Voice input stopped.');
        if (elements.gtSourceMicBtn) elements.gtSourceMicBtn.classList.remove('listening');
        speechRecognizer = null;
      };

      speechRecognizer.onend = () => {
        if (elements.gtSourceMicBtn) elements.gtSourceMicBtn.classList.remove('listening');
        speechRecognizer = null;
      };

      speechRecognizer.start();
    } catch (e) {
      console.error(e);
      showToast('Unable to start voice input.');
      if (elements.gtSourceMicBtn) elements.gtSourceMicBtn.classList.remove('listening');
      speechRecognizer = null;
    }
  }

  // --- Setup All AI Event Listeners ---
  function setupAIFeatures() {
    // Header Buttons
    if (elements.headerDoubtBtn) {
      elements.headerDoubtBtn.addEventListener('click', () => switchView('doubt'));
    }
    if (elements.headerTranslatorBtn) {
      elements.headerTranslatorBtn.addEventListener('click', () => switchView('translator'));
    }
    if (elements.headerAddWordBtn) {
      elements.headerAddWordBtn.addEventListener('click', () => openAddWordModal());
    }

    // Hero Action Cards
    if (elements.navCardDoubt) {
      elements.navCardDoubt.addEventListener('click', () => switchView('doubt'));
    }
    if (elements.navCardTranslator) {
      elements.navCardTranslator.addEventListener('click', () => switchView('translator'));
    }

    // Empty Search State Add Button
    if (elements.emptyAiBtn) {
      elements.emptyAiBtn.addEventListener('click', () => {
        openAddWordModal(state.filters.search.trim(), '', true);
      });
    }

    // Doubt Form Handlers
    if (elements.doubtForm) {
      elements.doubtForm.addEventListener('submit', (e) => {
        e.preventDefault();
        submitDoubt();
      });
    }

    if (elements.doubtClearBtn) {
      elements.doubtClearBtn.addEventListener('click', () => {
        elements.doubtQuestionInput.value = '';
        elements.doubtContextInput.value = '';
        elements.doubtResponseCard.style.display = 'none';
      });
    }

    // Quick Prompts
    if (elements.doubtQuickPrompts) {
      elements.doubtQuickPrompts.querySelectorAll('.prompt-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.getAttribute('data-question');
          elements.doubtQuestionInput.value = q;
          elements.doubtContextInput.value = '';
          submitDoubt(q);
        });
      });
    }

    // Translator Mode Tabs (Google Translate vs Deep Lexicon)
    if (elements.tabTransGoogle) {
      elements.tabTransGoogle.addEventListener('click', () => setTranslatorTab('google'));
    }
    if (elements.tabTransDeep) {
      elements.tabTransDeep.addEventListener('click', () => setTranslatorTab('deep'));
    }

    // Google Translate Controls
    if (elements.gtSourceLangs) {
      elements.gtSourceLangs.querySelectorAll('.gt-lang-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          elements.gtSourceLangs.querySelectorAll('.gt-lang-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.gt.sourceLang = btn.dataset.lang;
          if (elements.gtInputText && elements.gtInputText.value.trim()) {
            handleGoogleTranslate();
          }
        });
      });
    }

    if (elements.gtTargetLangs) {
      elements.gtTargetLangs.querySelectorAll('.gt-lang-tab').forEach(btn => {
        btn.addEventListener('click', () => {
          elements.gtTargetLangs.querySelectorAll('.gt-lang-tab').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          state.gt.targetLang = btn.dataset.lang;
          if (elements.gtInputText && elements.gtInputText.value.trim()) {
            handleGoogleTranslate();
          }
        });
      });
    }

    if (elements.gtSwapBtn) {
      elements.gtSwapBtn.addEventListener('click', handleGoogleLangSwap);
    }

    if (elements.gtInputText) {
      const debouncedGtTranslate = debounce(() => {
        handleGoogleTranslate();
      }, 450);

      elements.gtInputText.addEventListener('input', (e) => {
        const len = e.target.value.length;
        if (elements.gtCharCounter) elements.gtCharCounter.textContent = `${len} / 3000`;
        if (elements.gtClearBtn) elements.gtClearBtn.style.display = len > 0 ? 'flex' : 'none';
        debouncedGtTranslate();
      });

      elements.gtInputText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handleGoogleTranslate();
        }
      });
    }

    if (elements.gtClearBtn) {
      elements.gtClearBtn.addEventListener('click', () => {
        if (elements.gtInputText) elements.gtInputText.value = '';
        if (elements.gtCharCounter) elements.gtCharCounter.textContent = '0 / 3000';
        elements.gtClearBtn.style.display = 'none';
        if (elements.gtOutputText) {
          elements.gtOutputText.textContent = 'Translation will appear here';
          elements.gtOutputText.classList.add('placeholder');
        }
        if (elements.gtPhonetic) elements.gtPhonetic.style.display = 'none';
        if (elements.gtDictCard) elements.gtDictCard.style.display = 'none';
        if (elements.gtSaveBtn) elements.gtSaveBtn.style.display = 'none';
      });
    }

    if (elements.gtTranslateBtn) {
      elements.gtTranslateBtn.addEventListener('click', handleGoogleTranslate);
    }

    if (elements.gtSourceSpeakBtn) {
      elements.gtSourceSpeakBtn.addEventListener('click', () => {
        const text = elements.gtInputText ? elements.gtInputText.value : '';
        const lang = state.gt.sourceLang === 'fr' ? 'fr-FR' : 'en-US';
        speakText(text, lang);
      });
    }

    if (elements.gtSourceMicBtn) {
      elements.gtSourceMicBtn.addEventListener('click', toggleSpeechRecognition);
    }

    if (elements.gtTargetSpeakBtn) {
      elements.gtTargetSpeakBtn.addEventListener('click', () => {
        const text = elements.gtOutputText ? elements.gtOutputText.textContent : '';
        const isTargetFrench = state.gt.targetLang === 'fr' || (state.gt.targetLang === 'auto' && state.gt.detectedLang === 'en');
        speakText(text, isTargetFrench ? 'fr-FR' : 'en-US');
      });
    }

    if (elements.gtTargetCopyBtn) {
      elements.gtTargetCopyBtn.addEventListener('click', () => {
        const text = elements.gtOutputText ? elements.gtOutputText.textContent : '';
        if (text && !elements.gtOutputText.classList.contains('placeholder')) {
          navigator.clipboard.writeText(text).then(() => {
            showToast('Copied translation to clipboard!');
          });
        }
      });
    }

    // Deep Translator Handlers
    if (elements.langSwapBtn) {
      elements.langSwapBtn.addEventListener('click', handleLangSwap);
    }

    if (elements.transClearBtn) {
      elements.transClearBtn.addEventListener('click', () => {
        elements.transInputText.value = '';
        elements.transCharCount.textContent = '0 / 2000';
        elements.transResultContent.style.display = 'none';
        elements.transResultActions.style.display = 'none';
        elements.transPlaceholder.style.display = 'flex';
      });
    }

    if (elements.transInputText) {
      elements.transInputText.addEventListener('input', (e) => {
        const len = e.target.value.length;
        elements.transCharCount.textContent = `${len} / 2000`;
      });

      // Submit on Ctrl+Enter or Cmd+Enter
      elements.transInputText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          handleTranslate();
        }
      });
    }

    if (elements.samplePhraseBtn) {
      elements.samplePhraseBtn.addEventListener('click', () => {
        const dir = state.transDirection;
        const list = samplePhrases[dir] || samplePhrases['en-fr'];
        const phrase = list[samplePhraseIdx % list.length];
        samplePhraseIdx++;
        elements.transInputText.value = phrase;
        elements.transCharCount.textContent = `${phrase.length} / 2000`;
        handleTranslate();
      });
    }

    if (elements.transSubmitBtn) {
      elements.transSubmitBtn.addEventListener('click', handleTranslate);
    }

    // Add Word Modal Handlers
    if (elements.addWordCloseBtn) {
      elements.addWordCloseBtn.addEventListener('click', closeAddWordModal);
    }

    if (elements.addWordCancelBtn) {
      elements.addWordCancelBtn.addEventListener('click', closeAddWordModal);
    }

    if (elements.addWordModalBackdrop) {
      elements.addWordModalBackdrop.addEventListener('click', (e) => {
        if (e.target === elements.addWordModalBackdrop) {
          closeAddWordModal();
        }
      });
    }

    if (elements.addWordForm) {
      elements.addWordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleAnalyzeWord();
      });
    }

    if (elements.addWordConfirmBtn) {
      elements.addWordConfirmBtn.addEventListener('click', () => {
        if (state.pendingCustomWord) {
          saveCustomWord(state.pendingCustomWord);
          closeAddWordModal();
          // Open details modal so user immediately enjoys the added word
          openWordModal(state.pendingCustomWord);
          if (state.currentView === 'vocabulary') {
            renderFilteredVocabulary();
          }
        }
      });
    }
  }
  function setupEventListeners() {
    // Theme Toggle
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Sidebar Mobile Toggles
    elements.menuToggleBtn.addEventListener('click', openSidebarMobile);
    elements.sidebarCloseBtn.addEventListener('click', closeSidebarMobile);
    elements.sidebarBackdrop.addEventListener('click', closeSidebarMobile);

    // Header Search Input with debouncing
    const handleSearchInput = debounce((e) => {
      state.filters.search = e.target.value.trim();
      state.filters.page = 1;
      elements.searchClearBtn.style.display = state.filters.search ? 'block' : 'none';

      if (state.currentView === 'home' && state.filters.search) {
        switchView('vocabulary');
      } else {
        renderFilteredVocabulary();
      }
    }, 250);

    elements.headerSearchInput.addEventListener('input', handleSearchInput);

    elements.searchClearBtn.addEventListener('click', () => {
      elements.headerSearchInput.value = '';
      state.filters.search = '';
      state.filters.page = 1;
      elements.searchClearBtn.style.display = 'none';
      renderFilteredVocabulary();
      elements.headerSearchInput.focus();
    });

    // Keyboard shortcut '/' to search
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== elements.headerSearchInput && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        elements.headerSearchInput.focus();
      }
      if (e.key === 'Escape') {
        if (elements.wordModalBackdrop && elements.wordModalBackdrop.classList.contains('active')) {
          closeWordModal();
        }
        if (elements.addWordModalBackdrop && elements.addWordModalBackdrop.classList.contains('active')) {
          closeAddWordModal();
        }
      }
    });

    // Setup All AI Features & Listeners
    setupAIFeatures();

    // Home Action Cards
    elements.navCardBrowse.addEventListener('click', () => {
      resetFilters();
      switchView('vocabulary');
    });

    // Book Mode vs Row Mode Toggles
    if (elements.btnModeBook) {
      elements.btnModeBook.addEventListener('click', () => setDisplayMode('book'));
    }
    if (elements.btnModeRow) {
      elements.btnModeRow.addEventListener('click', () => setDisplayMode('row'));
    }

    elements.navCardLevels.addEventListener('click', () => {
      elements.homeLevelsGrid.scrollIntoView({ behavior: 'smooth' });
    });

    elements.navCardCategories.addEventListener('click', () => {
      elements.homeCategoriesGrid.scrollIntoView({ behavior: 'smooth' });
    });

    elements.navCardSearch.addEventListener('click', () => {
      elements.headerSearchInput.focus();
    });

    // Filter Change Handlers
    elements.filterLevelSelect.addEventListener('change', (e) => {
      state.filters.level = e.target.value;
      state.filters.page = 1;
      renderFilteredVocabulary();
    });

    elements.filterTypeSelect.addEventListener('change', (e) => {
      state.filters.type = e.target.value;
      state.filters.page = 1;
      renderFilteredVocabulary();
    });

    elements.filterCategorySelect.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      state.filters.subcategory = 'all';
      state.filters.page = 1;
      updateSubcategoryDropdown();
      updateSubcategoryHorizontalTabs();
      renderFilteredVocabulary();
    });

    elements.filterSubcategorySelect.addEventListener('change', (e) => {
      state.filters.subcategory = e.target.value;
      state.filters.page = 1;
      updateSubcategoryHorizontalTabs();
      renderFilteredVocabulary();
    });

    elements.filterSortSelect.addEventListener('change', (e) => {
      state.filters.sort = e.target.value;
      state.filters.page = 1;
      renderFilteredVocabulary();
    });

    elements.resetFiltersBtn.addEventListener('click', resetFilters);
    elements.emptyResetBtn.addEventListener('click', resetFilters);

    // Pagination Buttons
    elements.pagePrevBtn.addEventListener('click', () => {
      if (state.filters.page > 1) {
        state.filters.page--;
        renderFilteredVocabulary();
        elements.vocabCardsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    elements.pageNextBtn.addEventListener('click', () => {
      const allFiltered = filterAndSortWords();
      const totalPages = Math.ceil(allFiltered.length / state.filters.perPage);
      if (state.filters.page < totalPages) {
        state.filters.page++;
        renderFilteredVocabulary();
        elements.vocabCardsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    // Modal Events
    elements.modalCloseBtn.addEventListener('click', closeWordModal);
    elements.wordModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.wordModalBackdrop) {
        closeWordModal();
      }
    });

    // Error Retry
    elements.errorRetryBtn.addEventListener('click', loadVocabularyDatabase);
  }

  // --- 15. App Initialization ---
  function initApp() {
    initTheme();
    initSpeechSynthesis();
    setupEventListeners();
    loadVocabularyDatabase();
  }

  // Bootstrap when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
