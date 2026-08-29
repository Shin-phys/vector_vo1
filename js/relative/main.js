// js/relative/main.js
// 第2弾（相対速度）のエントリ。シーンの読み込みと進行だけを担当する。
// 授業時間が足りないときは SCENE_PLAN の1行をコメントアウトすればそのシーンを飛ばせる。

import { relativeProblems } from '../../data/problems-relative.js';
import { relativeConfig, RELATIVE_STORAGE_KEY, JUDGE } from '../../data/config.js';
import { ui } from '../core/ui.js';
import { layout } from '../core/layout.js';
import { storage } from '../core/storage.js';   // レイアウトと先生モードの設定は第1弾と共有

/* =========================================================================
   進行の設計図。'predict' と 'twoview' は問題数だけ繰り返す。
   ========================================================================= */
const SCENE_PLAN = [
  { kind: 'declare' },
  { kind: 'perProblem', scenes: ['predict', 'twoview'] },
  { kind: 'switch' },
  { kind: 'symbol' }
];

const SCENE_FILES = {
  declare: './scenes/scene0-declare.js',
  predict: './scenes/scene1-predict.js',
  twoview: './scenes/scene2-twoview.js',
  switch:  './scenes/scene3-switch.js',
  symbol:  './scenes/scene4-symbol.js'
};

const CIRCLED = ['①', '②', '③', '④', '⑤'];

/* =========================================================================
   保存（第1弾とはキーを分ける。レイアウト設定だけは core/storage と共有）
   ========================================================================= */
const EMPTY = { predictions: {}, choices: {}, quiz: {}, settings: {}, currentScene: null, startedAt: null };

function loadState() {
  try {
    const raw = localStorage.getItem(RELATIVE_STORAGE_KEY);
    if (!raw) return { ...EMPTY, startedAt: Date.now() };
    return { ...EMPTY, ...JSON.parse(raw) };
  } catch (e) { return { ...EMPTY, startedAt: Date.now() }; }
}

let s = loadState();
function persist() {
  try { localStorage.setItem(RELATIVE_STORAGE_KEY, JSON.stringify(s)); } catch (e) { /* 続行 */ }
}

export const store = {
  get state() { return s; },
  getSetting(k, d = null) { return Object.prototype.hasOwnProperty.call(s.settings, k) ? s.settings[k] : d; },
  setSetting(k, v) { s.settings[k] = v; persist(); },
  setCurrentScene(id) { s.currentScene = id; persist(); },

  savePrediction(problemId, rec) { s.predictions[problemId] = { ...(s.predictions[problemId] || {}), ...rec }; persist(); },
  getPrediction(problemId) { return s.predictions[problemId] || null; },

  recordChoice(qid, correct, attempts) { s.choices[qid] = { correct: !!correct, attempts: attempts || 1 }; persist(); },
  recordQuiz(qid, correct, value) { s.quiz[qid] = { correct: !!correct, value }; persist(); },

  reset() { s = { ...EMPTY, startedAt: Date.now(), settings: s.settings }; persist(); },

  /** 生徒がコピーして提出する学習ログ */
  buildLog() {
    const L = ['【相対速度 学習ログ】', '日時: ' + new Date().toLocaleString('ja-JP'), ''];
    L.push('■ 予測（シーン1）と結果（シーン2）');
    const preds = Object.entries(s.predictions);
    if (!preds.length) L.push('　（記録なし）');
    for (const [id, p] of preds) {
      const parts = [`　${p.title || id}`];
      if (p.drawnText) parts.push(`予測: ${p.drawnText}`);
      if (p.actualText) parts.push(`実際: ${p.actualText}`);
      if (p.matched != null) parts.push(p.matched ? '判定: 合っていた' : '判定: 外れた');
      if (p.selfReport) parts.push(`自己申告: ${p.selfReport}`);
      L.push(parts.join('　／　'));
    }
    L.push('');
    L.push('■ 選択問題（シーン3）');
    const cs = Object.entries(s.choices);
    if (!cs.length) L.push('　（記録なし）');
    for (const [id, c] of cs) L.push(`　${id}: ${c.correct ? '正解' : '不正解'}（${c.attempts}回目で決定）`);
    L.push('');
    L.push('■ 記号の問題（シーン4）');
    const qs = Object.entries(s.quiz);
    if (!qs.length) L.push('　（記録なし）');
    for (const [id, q] of qs) L.push(`　${id}: ${q.correct ? '正解' : '不正解'}　入力: ${q.value ?? '-'}`);
    return L.join('\n');
  }
};

/* ========================================================================= */
const state = { scenes: [], index: 0, maxReached: 0, current: null, ctx: null };

/** 先生モード（どのシーンにも移動できる）。第1弾と同じ設定を共有する。 */
function teacherMode() { return storage.getSetting('teacherMode', false) === true; }

/**
 * 進捗チップ。生徒は「通過済みに戻る」だけ。
 * 先に飛べると、シーン1の「予測を描くまで再生できない」制約が意味を失う。
 */
function renderSceneBar(currentKey) {
  ui.renderSteps(state.scenes.map(x => ({ id: x.key, label: x.label })), currentKey, {
    canJump: (i) => teacherMode() || i <= state.maxReached,
    onJump: (i) => mountScene(i)
  });
}

function dimension() {
  const override = store.getSetting('dimension', null);
  const d = override || relativeConfig.dimension || '1d';
  return relativeProblems[d] ? d : '1d';
}

function buildScenes() {
  const dim = dimension();
  const problems = (relativeProblems[dim] || []).map(p => ({ ...p, dimension: dim }));
  const list = [];
  for (const plan of SCENE_PLAN) {
    if (plan.kind === 'perProblem') {
      problems.forEach((p, i) => {
        for (const k of plan.scenes) {
          list.push({
            key: `${k}-${p.id}`,
            kind: k,
            problem: p,
            label: (k === 'predict' ? '予測' : '確認') + (CIRCLED[i] || (i + 1))
          });
        }
      });
    } else {
      list.push({ key: plan.kind, kind: plan.kind, problems, label: null });
    }
  }
  return { list, problems, dim };
}

async function boot() {
  ui.init();
  layout.init();

  const built = buildScenes();
  state.problems = built.problems;
  state.dim = built.dim;

  for (const item of built.list) {
    const file = SCENE_FILES[item.kind];
    if (!file) continue;
    try {
      const mod = await import(file);
      item.module = mod.default;
      item.label = item.label || mod.default.label || item.kind;
      state.scenes.push(item);
    } catch (e) {
      console.error('シーンを読み込めませんでした:', item.kind, e);
    }
  }

  layout.onChange(() => {
    if (state.current && state.current.module.onLayout) {
      try { state.current.module.onLayout(layout.profile); } catch (e) { console.warn(e); }
    }
  });

  setupSettings();
  await mountScene(0);
}

function makeCtx(scene) {
  return {
    ui,
    layout,
    store,
    scene,
    problem: scene.problem || null,
    problems: state.problems,
    dimension: state.dim,
    host: ui.el.canvasHost,
    get profile() { return layout.profile; },
    complete: () => mountScene(state.index + 1),
    goTo: (key) => {
      const i = state.scenes.findIndex(x => x.key === key);
      if (i >= 0) mountScene(i);
    },
    judgeTolerance: JUDGE
  };
}

async function mountScene(i) {
  if (i >= state.scenes.length) return finish();
  state.index = i;
  state.maxReached = Math.max(state.maxReached, i);
  const scene = state.scenes[i];

  if (state.current && state.current.module.unmount) {
    try { state.current.module.unmount(); } catch (e) { console.warn(e); }
  }
  ui.reset();
  ui.el.canvasHost.innerHTML = '';
  ui.el.canvasHost.style.display = '';
  renderSceneBar(scene.key);
  store.setCurrentScene(scene.key);

  state.current = scene;
  state.ctx = makeCtx(scene);
  await scene.module.mount(ui.el.canvasHost, state.ctx);
}

function finish() {
  ui.el.canvasHost.innerHTML = '';
  ui.setScale('');
  ui.setPrompt('');
  ui.feedback('おつかれさま。基準を取り替えると、同じ運動でも見え方が変わることを確かめました。', 'correct');
  ui.actions([
    { label: '学習ログをコピー', onClick: () => ui.copy(store.buildLog()) },
    { label: '第1弾へ', onClick: () => { location.href = 'index.html'; } },
    { label: 'もう一度', variant: 'primary', onClick: () => { store.reset(); state.maxReached = 0; mountScene(0); } }
  ]);
}

/* ---------- 設定 ---------- */
function setupSettings() {
  const btn = document.getElementById('settingsBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const cur = dimension();
    const teacher = teacherMode();
    const v = await ui.modal({
      title: '設定',
      body: `
        <p>表示：<b>${layout.profile.name === 'phone' ? 'スマホ' : 'タブレット／PC'}</b>　
           次元：<b>${cur === '1d' ? '直線上（1d）' : '平面（2d）'}</b></p>
        <p style="color:#4b5563;font-size:15px">次元を変えると最初からやり直します。教科書に合わせて選んでください。</p>
        <p>先生モード：<b>${teacher ? 'ON' : 'OFF'}</b>
           <span style="color:#4b5563;font-size:15px">
           ONにすると、上の進捗バーからどのシーンにも移動できます。
           OFFのときは通過済みのシーンにだけ戻れます。</span></p>
        <p style="color:#4b5563;font-size:15px"><b>N</b> キーでも「次へ」に進めます。</p>`,
      actions: [
        { label: 'レイアウトを切替', value: 'layout' },
        { label: cur === '1d' ? '平面（2d）にする' : '直線（1d）にする', value: 'dim' },
        { label: teacher ? '先生モードをOFF' : '先生モードをON', value: 'teacher' },
        { label: '前提を復習する（第1弾）', value: 'course' },
        { label: '第1弾（運動の表し方）へ', value: 'vol1' },
        { label: '最初からやり直す', value: 'reset' },
        { label: '閉じる', value: 'close', variant: 'primary' }
      ]
    });
    if (v === 'vol1') { location.href = 'index.html'; return; }
    if (v === 'course') { location.href = 'index.html?course=relative'; return; }
    if (v === 'teacher') {
      storage.setSetting('teacherMode', !teacher);
      renderSceneBar(state.scenes[state.index].key);
      ui.toast(!teacher ? '先生モード ON' : '先生モード OFF');
      return;
    }
    if (v === 'layout') {
      layout.setMode(layout.profile.name === 'phone' ? 'tablet' : 'phone');
    } else if (v === 'dim') {
      store.setSetting('dimension', cur === '1d' ? '2d' : '1d');
      location.reload();
    } else if (v === 'reset') {
      store.reset();
      location.reload();
    }
  });
}

boot();
