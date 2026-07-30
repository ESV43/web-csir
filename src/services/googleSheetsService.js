import { PYQ_DATABASE } from '../data/pyqDatabase';

const STORAGE_KEY_SCRIPT_URL = 'vibephysics_gas_url';
const STORAGE_KEY_MISTAKES = 'vibephysics_mistakes';
const STORAGE_KEY_PROGRESS = 'vibephysics_progress';

export const googleSheetsService = {
  getScriptUrl() {
    return localStorage.getItem(STORAGE_KEY_SCRIPT_URL) || '';
  },

  setScriptUrl(url) {
    localStorage.setItem(STORAGE_KEY_SCRIPT_URL, url.trim());
  },

  async fetchAppData() {
    const url = this.getScriptUrl();
    if (!url) {
      return {
        pyqs: PYQ_DATABASE,
        capsules: [],
        chapters: [],
        mistakes: this.getLocalMistakes(),
        progress: this.getLocalProgress()
      };
    }

    try {
      const res = await fetch(`${url}?action=getAppData`);
      const json = await res.json();
      if (json.status === 'success') {
        return {
          pyqs: json.data.pyqs.length > 0 ? json.data.pyqs : PYQ_DATABASE,
          capsules: json.data.capsules || [],
          chapters: json.data.chapters || [],
          mistakes: json.data.mistakeVault || this.getLocalMistakes(),
          progress: this.getLocalProgress()
        };
      }
    } catch (e) {
      console.warn('GAS Sync failed, using local database fallback:', e);
    }

    return {
      pyqs: PYQ_DATABASE,
      capsules: [],
      chapters: [],
      mistakes: this.getLocalMistakes(),
      progress: this.getLocalProgress()
    };
  },

  async logMistake(mistakeItem) {
    const mistakes = this.getLocalMistakes();
    const existingIndex = mistakes.findIndex(m => m.questionId === mistakeItem.questionId);
    
    const updatedItem = {
      ...mistakeItem,
      timestamp: new Date().toISOString(),
      reviewDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days spaced repetition
      reviewCount: (existingIndex >= 0 ? mistakes[existingIndex].reviewCount || 0 : 0) + 1
    };

    if (existingIndex >= 0) {
      mistakes[existingIndex] = updatedItem;
    } else {
      mistakes.push(updatedItem);
    }

    localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakes));

    // Try posting to GAS if configured
    const url = this.getScriptUrl();
    if (url) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logMistake', ...updatedItem })
        });
      } catch (err) {
        console.warn('Failed to sync mistake to GAS:', err);
      }
    }

    return mistakes;
  },

  getLocalMistakes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_MISTAKES)) || [];
    } catch {
      return [];
    }
  },

  saveLocalMistakes(mistakes) {
    localStorage.setItem(STORAGE_KEY_MISTAKES, JSON.stringify(mistakes));
  },

  getLocalProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_PROGRESS)) || {
        completedTopics: [],
        solvedPyqIds: [],
        streakCount: 5,
        lastActiveDate: new Date().toISOString()
      };
    } catch {
      return {
        completedTopics: [],
        solvedPyqIds: [],
        streakCount: 5,
        lastActiveDate: new Date().toISOString()
      };
    }
  },

  saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  }
};
