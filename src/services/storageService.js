/**
 * Local persistence + spaced repetition manager for Mistake Vault.
 */

const KEYS = {
  MISTAKES: 'vibephysics_mistakes',
  PROGRESS: 'vibephysics_progress',
  HEATMAP: 'vibephysics_heatmap',
  LAST_VIEWED: 'vibephysics_last_viewed',
  ACTIVE_MOCK: 'vibephysics_active_mock',
  THEME: 'vibephysics_theme',
  STREAK: 'vibephysics_streak'
};

export const storageService = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  // --- Mistake Vault (Spaced Repetition SM-2 simplified) ---
  getMistakes() {
    return this.get(KEYS.MISTAKES, []);
  },

  addMistake(question) {
    const mistakes = this.getMistakes();
    const existing = mistakes.find(m => m.id === question.id);
    if (existing) {
      existing.reviewCount += 1;
      existing.lastReviewed = new Date().toISOString();
      // SM-2 simplified: interval grows as 3 * (reviewCount) days
      existing.nextReviewDate = new Date(Date.now() + 3 * existing.reviewCount * 24 * 60 * 60 * 1000).toISOString();
    } else {
      mistakes.push({
        ...question,
        addedDate: new Date().toISOString(),
        lastReviewed: new Date().toISOString(),
        reviewCount: 1,
        nextReviewDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    this.set(KEYS.MISTAKES, mistakes);
    return mistakes;
  },

  getDueMistakes() {
    const mistakes = this.getMistakes();
    const now = Date.now();
    return mistakes.filter(m => new Date(m.nextReviewDate).getTime() <= now);
  },

  markMistakeResolved(questionId) {
    const mistakes = this.getMistakes();
    const updated = mistakes.filter(m => m.id !== questionId);
    this.set(KEYS.MISTAKES, updated);
    return updated;
  },

  // --- Progress / Heatmap ---
  getProgress() {
    return this.get(KEYS.PROGRESS, {
      solvedPyqIds: [],
      completedCapsules: [],
      topicCoverage: {} // { subtopicId: count }
    });
  },

  recordPyqSolved(questionId, subtopicId) {
    const p = this.getProgress();
    if (!p.solvedPyqIds.includes(questionId)) p.solvedPyqIds.push(questionId);
    if (subtopicId) p.topicCoverage[subtopicId] = (p.topicCoverage[subtopicId] || 0) + 1;
    this.set(KEYS.PROGRESS, p);
    this._recordHeatmap();
    return p;
  },

  recordCapsuleRead(capsuleId) {
    const p = this.getProgress();
    if (!p.completedCapsules.includes(capsuleId)) p.completedCapsules.push(capsuleId);
    this.set(KEYS.PROGRESS, p);
    this._recordHeatmap();
    return p;
  },

  _recordHeatmap() {
    const today = new Date().toISOString().split('T')[0];
    const map = this.get(KEYS.HEATMAP, {});
    map[today] = (map[today] || 0) + 1;
    this.set(KEYS.HEATMAP, map);
  },

  getHeatmap() {
    return this.get(KEYS.HEATMAP, {});
  },

  // --- Quick Resume ---
  setLastViewed(payload) {
    this.set(KEYS.LAST_VIEWED, { ...payload, timestamp: Date.now() });
  },

  getLastViewed() {
    return this.get(KEYS.LAST_VIEWED, null);
  },

  // --- Active Mock Test ---
  saveActiveMock(state) {
    this.set(KEYS.ACTIVE_MOCK, state);
  },

  getActiveMock() {
    return this.get(KEYS.ACTIVE_MOCK, null);
  },

  clearActiveMock() {
    this.remove(KEYS.ACTIVE_MOCK);
  },

  // --- Theme ---
  getTheme() {
    return localStorage.getItem(KEYS.THEME) || 'deepspace';
  },

  setTheme(theme) {
    localStorage.setItem(KEYS.THEME, theme);
  },

  // --- Streak ---
  getStreak() {
    return this.get(KEYS.STREAK, { count: 0, lastDate: null });
  },

  updateStreak() {
    const s = this.getStreak();
    const today = new Date().toISOString().split('T')[0];
    if (s.lastDate === today) return s;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (s.lastDate === yesterday) s.count += 1;
    else s.count = 1;
    s.lastDate = today;
    this.set(KEYS.STREAK, s);
    return s;
  }
};
