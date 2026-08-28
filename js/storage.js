// js/storage.js
// localStorage への進捗・設定・学習ログの保存と復元。リロードしても途中から再開できるようにする。

import { STORAGE_KEY } from '../data/config.js';

const EMPTY = { currentStep: null, steps: {}, settings: {}, reflection: '', startedAt: null };

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY, startedAt: Date.now() };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch (e) {
    return { ...EMPTY, startedAt: Date.now() };
  }
}

let state = load();

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* 保存できなくても続行 */ }
}

export const storage = {
  get state() { return state; },

  getCurrentStep() { return state.currentStep; },
  setCurrentStep(id) { state.currentStep = id; save(); },

  getSetting(key, fallback = null) {
    return Object.prototype.hasOwnProperty.call(state.settings, key) ? state.settings[key] : fallback;
  },
  setSetting(key, value) { state.settings[key] = value; save(); },

  stepRecord(stepId) {
    if (!state.steps[stepId]) state.steps[stepId] = { items: {}, done: false };
    return state.steps[stepId];
  },

  itemRecord(stepId, itemId) {
    const st = this.stepRecord(stepId);
    if (!st.items[itemId]) st.items[itemId] = { attempts: 0, hints: 0, correct: false, passedWithHelp: false };
    return st.items[itemId];
  },

  recordAttempt(stepId, itemId, correct) {
    const r = this.itemRecord(stepId, itemId);
    r.attempts += 1;
    if (correct) r.correct = true;
    save();
    return r;
  },

  recordHint(stepId, itemId) {
    const r = this.itemRecord(stepId, itemId);
    r.hints += 1; save(); return r;
  },

  recordPassedWithHelp(stepId, itemId) {
    const r = this.itemRecord(stepId, itemId);
    r.passedWithHelp = true; save(); return r;
  },

  markStepDone(stepId) { this.stepRecord(stepId).done = true; save(); },
  isStepDone(stepId) { return !!(state.steps[stepId] && state.steps[stepId].done); },

  setReflection(text) { state.reflection = text; save(); },
  getReflection() { return state.reflection || ''; },

  /** 生徒がコピーして提出するための学習ログ（テキスト） */
  buildLog(stepLabels = {}) {
    const lines = ['【ベクトル作図 学習ログ】'];
    lines.push('日時: ' + new Date().toLocaleString('ja-JP'));
    for (const [stepId, rec] of Object.entries(state.steps)) {
      const label = stepLabels[stepId] || stepId;
      const items = Object.entries(rec.items || {});
      const correct = items.filter(([, r]) => r.correct).length;
      const hints = items.reduce((s, [, r]) => s + r.hints, 0);
      lines.push(`${label}: 正解 ${correct}/${items.length}　ヒント ${hints}回　${rec.done ? '通過' : '未通過'}`);
    }
    if (state.reflection) {
      lines.push('');
      lines.push('【振り返り】');
      lines.push(state.reflection);
    }
    return lines.join('\n');
  },

  reset() {
    state = { ...EMPTY, startedAt: Date.now(), settings: state.settings };
    save();
  }
};
