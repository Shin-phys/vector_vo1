// js/main.js
// エントリ。ステップの読み込みと進行制御、および問題タイプ別の共通実行エンジン（runItems）を持つ。
// 授業時間が足りないときは STEP_ORDER の1行をコメントアウトするだけでそのステップを飛ばせる。

import { problems } from '../data/problems.js';
import { FLOW, HINTS, TEXT, CANVAS } from '../data/config.js';
import { GridCanvas } from './canvas.js';
import * as vec from './vector.js';
import { ui } from './ui.js';
import { storage } from './storage.js';
import { layout } from './layout.js';

/* ===== ステップの並び順（1行コメントアウトで飛ばせる） ===== */
const STEP_ORDER = [
  'intro',
  'step1',
  'step2',
  'step25a',
  'step25b',
  'step3',
  'step4',
  'step5',
  'reflection'
];

const STEP_FILES = {
  step1: './steps/step1-position.js',
  step2: './steps/step2-displacement.js',
  step25a: './steps/step25a-relocate.js',
  step25b: './steps/step25b-origin.js',
  step3: './steps/step3-chain.js',
  step4: './steps/step4-velocity.js',
  step5: './steps/step5-compose.js',
  reflection: './steps/reflection.js'
};

const INTRO_STEP = {
  id: 'intro',
  label: '導入',
  async mount(root, ctx) {
    const p = ctx.problems || {};
    ui.showCanvas(true);
    ui.setScale(p.scaleLabel || '');
    ui.setPrompt(p.prompt || '');
    ctx.buildScene(p.scene || { points: {}, vectors: [] });
    ui.actions([{ label: p.startLabel || 'はじめる', variant: 'primary', onClick: () => ctx.complete(true) }]);
  },
  unmount() {}
};

const state = {
  steps: [],       // {id,label,module,problems}
  index: 0,
  current: null,
  canvas: null,
  scene: null,
  ctx: null
};

/* ---------- 起動 ---------- */
async function boot() {
  ui.init();
  layout.init();
  layout.onChange(() => {
    if (state.canvas) {
      const gs = phoneAware(state.currentProblems, 'gridSize') || layout.profile.gridSize;
      state.canvas.setGridSize(gs);
      if (state.scene) state.scene.render();
      if (layout.profile.name === 'tablet') state.canvas.enableHover();
      else state.canvas.disableHover();
    }
  });

  for (const id of STEP_ORDER) {
    if (id === 'intro') {
      state.steps.push({ id, label: INTRO_STEP.label, module: INTRO_STEP, problems: problems.intro });
      continue;
    }
    const file = STEP_FILES[id];
    if (!file) continue;
    const mod = await import(file);
    state.steps.push({ id, label: mod.default.label || id, module: mod.default, problems: problems[id] });
  }

  setupSettings();

  const saved = storage.getCurrentStep();
  const savedIdx = state.steps.findIndex(s => s.id === saved);
  if (savedIdx > 0) {
    const go = await ui.modal({
      title: '前回の続きから',
      body: `<p>前回は「${state.steps[savedIdx].label}」まで進んでいました。続きから始めますか？</p>`,
      actions: [{ label: '最初から', value: 'restart' }, { label: '続きから', value: 'resume', variant: 'primary' }]
    });
    if (go === 'resume') state.index = savedIdx;
    else { storage.reset(); state.index = 0; }
  }
  await mountStep(state.index);
}

function phoneAware(prob, key) {
  if (!prob) return null;
  if (layout.profile.name === 'phone' && prob.phone && prob.phone[key] != null) return prob.phone[key];
  return prob[key] != null ? prob[key] : null;
}

/* ---------- ステップの mount / unmount ---------- */
async function mountStep(i) {
  if (i >= state.steps.length) return finish();
  state.index = i;
  const step = state.steps[i];
  state.currentProblems = step.problems;
  storage.setCurrentStep(step.id);

  if (state.current && state.current.module.unmount) {
    try { state.current.module.unmount(); } catch (e) { console.warn(e); }
  }
  ui.reset();
  ui.renderSteps(state.steps, step.id);

  const gridSize = phoneAware(step.problems, 'gridSize') || layout.profile.gridSize;
  state.canvas = new GridCanvas(ui.el.canvasHost, { gridSize });
  if (layout.profile.name === 'tablet') state.canvas.enableHover();
  state.scene = null;

  const ctx = makeContext(step);
  state.ctx = ctx;
  state.current = step;
  await step.module.mount(ui.el.stage, ctx);
}

function finish() {
  ui.reset();
  ui.showCanvas(false);
  ui.setPrompt('<b>おつかれさまでした。</b>');
  ui.feedback('次回は、基準を「動いている物体」に取り替えます。', 'info');
  ui.actions([{ label: 'もう一度最初から', onClick: () => { storage.reset(); location.reload(); } }]);
}

/* ---------- ステップに渡す ctx ---------- */
function makeContext(step) {
  return {
    stepId: step.id,
    label: step.label,
    problems: step.problems,
    canvas: state.canvas,
    vector: vec,
    ui,
    storage,
    get profile() { return layout.profile; },
    buildScene: (decl, opts) => buildScene(decl, opts),
    get scene() { return state.scene; },
    runItems: (items, opts) => runItems(step, items || (step.problems && step.problems.items) || [], opts),
    complete: (ok) => completeStep(step, ok),
    next: () => mountStep(state.index + 1)
  };
}

function buildScene(decl, opts = {}) {
  state.scene = new vec.Scene(state.canvas, decl, {
    profile: layout.profile,
    onChange: opts.onChange || (() => {})
  });
  return state.scene;
}

function completeStep(step, ok = true) {
  storage.markStepDone(step.id);
  return mountStep(state.index + 1);
}

/* ===================================================================== */
/* 共通実行エンジン：problems.js の item.type を見て適切なUIと判定を組み立てる。 */
/* 新しい問題を既存の type で足すときはコードを触らなくてよい。                 */
/* ===================================================================== */
async function runItems(step, items, opts = {}) {
  const passLine = (step.problems && step.problems.passLine) || FLOW.passLineDefault;
  let correctCount = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const res = await runItem(step, item, { index: i, total: items.length });
    if (res && res.correct) correctCount++;
    const remaining = items.length - i - 1;
    if (remaining > 0 && correctCount >= (passLine.correct || 99)) {
      const choice = await ui.modal({
        title: 'このステップは通過です',
        body: `<p>${correctCount}問正解しました。残り${remaining}問に挑戦することもできます。</p>`,
        actions: [{ label: 'もう1問やる', value: 'more' }, { label: '次のステップへ', value: 'next', variant: 'primary' }]
      });
      if (choice === 'next') break;
    }
  }
  if (opts.onDone) await opts.onDone(correctCount);
  return correctCount;
}

/** スマホでは item.phone の内容で上書きできる（座標やシーンの差し替え用） */
function phoneVariant(item) {
  if (layout.profile.name === 'phone' && item.phone) return { ...item, ...item.phone };
  return item;
}

function runItem(step, rawItem, meta) {
  const item = phoneVariant(rawItem);
  const handler = HANDLERS[item.type];
  if (!handler) {
    console.warn('未対応の type:', item.type);
    return Promise.resolve({ correct: false });
  }
  ui.reset();
  ui.setScale(step.problems && step.problems.scaleLabel ? step.problems.scaleLabel : '');
  if (item.scaleLabel) ui.setScale(item.scaleLabel);
  const badge = `${meta.index + 1} / ${meta.total}`;
  ui.setPrompt(item.prompt || '', { badge: item.hideBadge ? null : badge });
  state.canvas.clear();
  state.canvas.drawGrid();
  return new Promise(resolve => handler(step, item, meta, resolve));
}

/* ---------- 誤答フィードバックの取り出し ---------- */
function feedbackFor(item, pattern) {
  const list = item.feedback || [];
  const hit = list.find(f => f.when === pattern) || list.find(f => f.when === 'default');
  if (hit) return hit.text;
  const DEFAULTS = {
    reversed: '向きが逆のようです。出発点から到着点へ、の順で描いていますか？',
    wrongStart: '描き始めの点を確かめましょう。',
    fromOrigin: '基準点から描いていませんか？ いま知りたいのは、どこからどこへの移動でしょう。',
    wrongLength: '向きは合っています。長さ（マスの数）をもう一度数えてみましょう。',
    wrongDirection: '向きをもう一度確かめましょう。東西と南北、それぞれ何マスですか？',
    sumOfLengths: '長さをそのまま足していませんか？ 矢印を継ぎ足したとき、終点はどこにありますか？'
  };
  return DEFAULTS[pattern] || 'もう一度考えてみましょう。';
}

/* ---------- 数値表示の組み立て ---------- */
function readoutItems(scene, item, prev = {}) {
  const unit = item.unit || '';
  const out = [];
  for (const r of (item.readouts || [])) {
    let value, key;
    if (r.show === 'tip') {
      // 矢印の先が指している場所（位置ベクトルを動かすと変わる）
      const ends = scene.vectorEnds(r.vector);
      value = scene.labelAt(ends.to);
      key = value;
    } else {
      const v = scene.vectorComponents(r.vector);
      const d = vec.describe(v, unit);
      key = `${Math.round(v.x * 100)}/${Math.round(v.y * 100)}`;
      if (r.show === 'components') value = d.components;
      else if (r.show === 'magnitude') value = d.magnitude;
      else value = `${d.words}　${d.components}`;
    }
    const changed = prev[r.id] !== undefined && prev[r.id] !== key;
    const unchanged = prev[r.id] !== undefined && prev[r.id] === key;
    out.push({
      id: r.id, label: r.label, value,
      flash: !!(r.watch && changed),
      badge: (r.watch && r.unchangedBadge && unchanged)
        ? (r.unchangedBadge === true ? '変化なし' : r.unchangedBadge) : null
    });
    prev[r.id] = key;
  }
  return out;
}

/** ぐねぐねした道筋のアニメーション（同じ2点間なら道筋が違っても同じ矢印になる、を見せる） */
function animatePath(canvas, path) {
  const pts = path.map(p => canvas.toScreen(p));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  line.setAttribute('d', d);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', '#b6c0cb');
  line.setAttribute('stroke-width', '0.07');
  line.setAttribute('stroke-dasharray', '0.14 0.16');
  canvas.layers.guide.appendChild(line);
  const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  dot.setAttribute('r', '0.16');
  dot.setAttribute('fill', '#dc2626');
  canvas.layers.overlay.appendChild(dot);
  if (typeof line.getTotalLength !== 'function') return;   // 対応していない環境では線だけ表示
  const total = line.getTotalLength();
  const t0 = performance.now();
  const dur = 2600;
  function frame(t) {
    const k = ((t - t0) % dur) / dur;
    const p = line.getPointAtLength(total * k);
    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
    if (dot.isConnected) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ===================== 問題タイプ別ハンドラ ===================== */
const HANDLERS = {};

/* --- draw-vector：矢印を1本描く --- */
HANDLERS['draw-vector'] = (step, item, meta, done) => {
  const canvas = state.canvas;
  const scene = buildScene(item.scene || { points: {}, vectors: [] });
  if (item.origin) canvas.drawPoint(item.origin, { label: item.origin.label, role: 'origin', ring: true });
  for (const lm of (item.landmarks || [])) canvas.drawPoint(lm, { label: lm.label });
  if (item.path && item.path.length > 1) animatePath(canvas, item.path);

  let attempts = 0;
  let answerShown = false;
  let guideShown = false;
  let pending = null;

  const showGuide = () => {
    if (guideShown) return;
    guideShown = true;
    const a = item.answer;
    if (!a) return;
    canvas.drawGuideLine(a.from, { x: a.to.x, y: a.from.y });
    canvas.drawGuideLine({ x: a.to.x, y: a.from.y }, a.to);
    ui.feedback('補助線を出しました。東西に何マス、南北に何マス動くかを見てみましょう。', 'info');
  };

  const showAnswer = () => {
    if (answerShown || !item.answer) return;
    answerShown = true;
    const arrow = new vec.Arrow(canvas, 'answer', 'answer');
    arrow.set(item.answer.from, item.answer.to);
    arrow.setOpacity(0.35);
    storage.recordHint(step.id, item.id);
  };

  const tool = new vec.DrawTool(canvas, {
    profile: layout.profile,
    styleName: item.style || 'displacement',
    onPreview: (v) => {
      if (!v) { ui.setReadout([]); return; }
      const d = vec.describe(vec.V.sub(v.to, v.from), item.unit || '');
      ui.setReadout([
        { id: 'draft', label: '成分', value: `${d.words}　${d.components}` },
        { id: 'mag', label: '大きさ', value: d.magnitude }
      ]);
    },
    onComplete: (v) => {
      pending = v;
      const r = vec.judge(v, item);
      attempts++;
      storage.recordAttempt(step.id, item.id, r.ok);
      if (r.ok) {
        tool.arrow.setColor('#15803d');
        applyReveal();
        ui.feedback(item.correctText || TEXT.correct, 'correct');
        ui.stopHints();
        ui.actions([{ label: '次へ', variant: 'primary', onClick: async () => { await reveal(); finish(true); } }]);
      } else {
        ui.feedback(feedbackFor(item, r.pattern), 'wrong');
        if (attempts >= FLOW.maxAttempts) {
          showAnswer();
          applyReveal();
          storage.recordPassedWithHelp(step.id, item.id);
          ui.feedback((item.explanation || feedbackFor(item, r.pattern)) + '<br>薄い矢印が答えです。確かめたら次へ進みましょう。', 'info');
          ui.actions([
            { label: TEXT.retry, onClick: () => { tool.clear(); ui.clearFeedback(); } },
            { label: '次へ', variant: 'primary', onClick: async () => { await reveal(); finish(false); } }
          ]);
        }
      }
    }
  });

  // 正解後に重ねて見せる矢印（④：変位と速度を重ねる）と道すじ（⑤：舟の航跡）
  const applyReveal = () => {
    for (const rv of (item.revealVectors || [])) {
      const a = new vec.Arrow(canvas, 'answer', rv.style || 'displacement', { label: rv.label });
      a.set(rv.from, rv.to);
      a.g.classList.add('arrow-reveal');
    }
    if (item.revealPath && item.revealPath.length > 1) animatePath(canvas, item.revealPath);
  };

  const reveal = async () => {
    if (item.reveal) {
      await ui.modal({ title: item.reveal.title || '', body: item.reveal.body || '', actions: [{ label: 'わかった', variant: 'primary' }] });
    }
  };

  const finish = (correct) => {
    ui.stopHints();
    tool.destroy();
    done({ correct });
  };

  const baseActions = [
    { label: TEXT.retry, onClick: () => { tool.clear(); ui.clearFeedback(); } }
  ];
  if (HINTS.showAnswerButton) baseActions.push({ label: TEXT.showAnswer, onClick: showAnswer });
  ui.actions(baseActions);

  ui.startHints({
    hints: item.hints || [],
    onLevel: (lv) => { if (lv === 2) showGuide(); },
    onCount: () => storage.recordHint(step.id, item.id)
  });
};

/* --- choice：選択肢から選ぶ --- */
HANDLERS['choice'] = (step, item, meta, done) => {
  if (item.scene) buildScene(item.scene); else ui.showCanvas(!!item.showCanvas);
  if (item.readouts && state.scene) ui.setReadout(readoutItems(state.scene, item, {}));
  let attempts = 0;
  const list = ui.renderChoice(item, async (i, opt, btn) => {
    attempts++;
    const correct = i === item.correctIndex;
    storage.recordAttempt(step.id, item.id, correct);
    ui.markChoice(list, i, correct ? 'correct' : 'wrong');
    if (correct) {
      ui.feedback(item.correctText || '正解です。', 'correct');
      ui.stopHints();
      ui.actions([{ label: '次へ', variant: 'primary', onClick: async () => {
        if (item.reveal) await ui.modal({ title: item.reveal.title || '', body: item.reveal.body || '', actions: [{ label: 'わかった', variant: 'primary' }] });
        done({ correct: true });
      } }]);
    } else {
      ui.feedback(opt.feedback || 'もう一度考えてみましょう。', 'wrong');
      if (attempts >= FLOW.maxAttempts) {
        ui.markChoice(list, item.correctIndex, 'correct');
        storage.recordPassedWithHelp(step.id, item.id);
        ui.feedback(item.explanation || '正しい答えに印をつけました。', 'info');
        ui.actions([{ label: '次へ', variant: 'primary', onClick: async () => {
          if (item.reveal) await ui.modal({ title: item.reveal.title || '', body: item.reveal.body || '', actions: [{ label: 'わかった', variant: 'primary' }] });
          done({ correct: false });
        } }]);
      }
    }
  });
  ui.actions([]);
  ui.startHints({ hints: item.hints || [], onCount: () => storage.recordHint(step.id, item.id) });
};

/* --- explore-drag：動かして観察する（条件を満たすと通過） --- */
HANDLERS['explore-drag'] = (step, item, meta, done) => {
  const prev = {};
  const dragged = new Set();
  const visited = new Set();
  let sceneRef = null;

  const req = item.requirement || { kind: 'eachDragged', ids: [] };

  const updateReadout = () => {
    ui.setReadout(readoutItems(sceneRef, item, prev));
  };

  const progressText = () => {
    if (req.kind === 'eachDragged') {
      const left = (req.ids || []).filter(id => !dragged.has(id));
      return left.length ? `あと ${left.length} つ、動かしてみましょう。` : 'どちらも動かせました。';
    }
    if (req.kind === 'distinctPositions') {
      const left = Math.max(0, (req.count || 3) - visited.size);
      return left ? `基準点Oを あと ${left} か所 に動かしてみましょう。` : '3か所以上に動かせました。';
    }
    return '';
  };

  const checkDone = () => {
    let ok = false;
    if (req.kind === 'eachDragged') ok = (req.ids || []).every(id => dragged.has(id));
    if (req.kind === 'distinctPositions') ok = visited.size >= (req.count || 3);
    ui.setActionState('next', { disabled: !ok });
    ui.feedback(progressText(), ok ? 'correct' : 'info');
    return ok;
  };

  sceneRef = buildScene(item.scene, {
    onChange: (e) => {
      if (e.phase === 'move' || e.phase === 'end') updateReadout();
      if (e.phase === 'end') {
        if (e.type === 'vector' && e.moved) dragged.add(e.id);
        if (e.type === 'point') {
          dragged.add(e.id);
          if (req.point === e.id || !req.point) visited.add(`${e.value.x},${e.value.y}`);
        }
        checkDone();
      }
    }
  });
  updateReadout();

  ui.actions([
    { label: '次へ', id: 'next', variant: 'primary', disabled: true, onClick: async () => {
      ui.stopHints();
      storage.recordAttempt(step.id, item.id, true);
      if (item.reveal) await ui.modal({ title: item.reveal.title || '', body: item.reveal.body || '', actions: [{ label: 'わかった', variant: 'primary' }] });
      done({ correct: true });
    } }
  ]);
  checkDone();
  ui.startHints({ hints: item.hints || [], onCount: () => storage.recordHint(step.id, item.id) });
};

/* --- free-place：自由に配置して条件を満たす --- */
HANDLERS['free-place'] = (step, item, meta, done) => {
  const prev = {};
  let sceneRef = null;
  let solved = false;

  const evaluate = () => {
    const conds = item.conditions || (item.condition ? [item.condition] : []);
    const results = conds.map(c => vec.checkCondition(sceneRef, c));
    const ok = results.length > 0 && results.every(r => r.ok);
    ui.setReadout(readoutItems(sceneRef, item, prev));
    if (ok && !solved) {
      solved = true;
      storage.recordAttempt(step.id, item.id, true);
      ui.feedback(item.successText || '2つの変位が等しくなりました。', 'correct');
      ui.setActionState('next', { disabled: false });
      if (item.animation === 'parallelMove') playParallelMove(sceneRef, item);
    } else if (!ok) {
      solved = false;
      ui.feedback(item.hintText || '点をドラッグして、2つの変位（向きと大きさ）をそろえてみましょう。', 'info');
      ui.setActionState('next', { disabled: true });
    }
  };

  sceneRef = buildScene(item.scene, { onChange: (e) => { if (e.phase !== 'start') evaluate(); } });

  ui.actions([
    { label: '次へ', id: 'next', variant: 'primary', disabled: true, onClick: async () => {
      ui.stopHints();
      if (item.reveal) await ui.modal({ title: item.reveal.title || '', body: item.reveal.body || '', actions: [{ label: 'わかった', variant: 'primary' }] });
      done({ correct: true });
    } }
  ]);
  evaluate();
  ui.startHints({ hints: item.hints || [], onCount: () => storage.recordHint(step.id, item.id) });
};

function playParallelMove(scene, item) {
  const cfg = item.animation === 'parallelMove' ? (item.animatePairs || []) : [];
  const canvas = state.canvas;
  const movers = cfg.map(pair => {
    const from = scene.point(pair[0]);
    const g = canvas.drawPoint(from, { layer: 'overlay', color: '#dc2626', r: CANVAS.pointRadius * 1.4 });
    return { g, from, to: scene.point(pair[1]) };
  });
  const t0 = performance.now();
  const dur = 1200;
  function frame(t) {
    const k = Math.min(1, (t - t0) / dur);
    for (const m of movers) {
      const p = { x: m.from.x + (m.to.x - m.from.x) * k, y: m.from.y + (m.to.y - m.from.y) * k };
      const s = canvas.toScreen(p);
      m.g.setAttribute('transform', `translate(${s.x - canvas.toScreen(m.from).x} ${s.y - canvas.toScreen(m.from).y})`);
    }
    if (k < 1) requestAnimationFrame(frame);
    else setTimeout(() => movers.forEach(m => m.g.remove()), 600);
  }
  requestAnimationFrame(frame);
}

/* --- slider-explore：スライダーで値の変化を観察する --- */
HANDLERS['slider-explore'] = (step, item, meta, done) => {
  const canvas = state.canvas;
  const cfg = item.compose;
  const visited = new Set();
  const origin = cfg.origin || { x: 1, y: 1 };
  const aArrow = new vec.Arrow(canvas, 'static', 'velocity', { label: cfg.aLabel });
  const bArrow = new vec.Arrow(canvas, 'static', 'velocity', { label: cfg.bLabel });
  const rArrow = new vec.Arrow(canvas, 'dynamic', 'resultant', { label: cfg.rLabel });

  const draw = (deg) => {
    const rad = deg * Math.PI / 180;
    const a = { x: cfg.a.mag, y: 0 };
    const b = { x: cfg.b.mag * Math.cos(rad), y: cfg.b.mag * Math.sin(rad) };
    const r = vec.V.add(a, b);
    aArrow.set(origin, vec.V.add(origin, a));
    bArrow.set(origin, vec.V.add(origin, b));
    rArrow.set(origin, vec.V.add(origin, r));
    ui.setReadout([
      { id: 'ang', label: '2つの速度がなす角', value: `${deg}°` },
      { id: 'res', label: '合成した速度の大きさ', value: vec.describe(r, item.unit || '').magnitude }
    ]);
    for (const cp of (item.checkpoints || [])) if (Math.abs(deg - cp) < 1) visited.add(cp);
    const ok = (item.checkpoints || []).every(c => visited.has(c));
    ui.setActionState('next', { disabled: !ok });
    ui.feedback(ok ? 'すべて確かめられました。' :
      `${(item.checkpoints || []).filter(c => !visited.has(c)).join('°、')}° も確かめてみましょう。`, ok ? 'correct' : 'info');
  };

  ui.renderSlider({ min: 0, max: 180, step: 1, value: 0, label: item.sliderLabel || '角度', unit: '°' }, draw);
  ui.actions([{ label: '次へ', id: 'next', variant: 'primary', disabled: true, onClick: async () => {
    ui.stopHints();
    storage.recordAttempt(step.id, item.id, true);
    if (item.reveal) await ui.modal({ title: item.reveal.title || '', body: item.reveal.body || '', actions: [{ label: 'わかった', variant: 'primary' }] });
    done({ correct: true });
  } }]);
  ui.startHints({ hints: item.hints || [] });
};

/* --- free-text：自由記述 --- */
HANDLERS['free-text'] = (step, item, meta, done) => {
  ui.showCanvas(false);
  let text = storage.getReflection();
  ui.renderTextarea({ rows: item.rows || 3, placeholder: item.placeholder || '', value: text }, (v) => {
    text = v; storage.setReflection(v);
  });
  const labels = {};
  state.steps.forEach(s => labels[s.id] = s.label);
  ui.actions([
    { label: '回答をコピー', onClick: () => ui.copy(text) },
    { label: '学習ログをコピー', onClick: () => ui.copy(storage.buildLog(labels)) },
    { label: '次へ', variant: 'primary', onClick: () => done({ correct: true }) }
  ]);
};

/* ---------- 設定（レイアウト手動切替・進捗リセット） ---------- */
function setupSettings() {
  const btn = document.getElementById('settingsBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const mode = layout.mode;
    const v = await ui.modal({
      title: TEXT.settings,
      body: `<p>画面レイアウト（現在：<b>${layout.profile.name}</b>／設定：${mode}）</p>`,
      actions: [
        { label: '自動', value: 'auto' },
        { label: 'スマホ', value: 'phone' },
        { label: 'タブレット・PC', value: 'tablet' },
        { label: '進捗をリセット', value: 'reset' },
        { label: '閉じる', value: 'close', variant: 'primary' }
      ]
    });
    if (v === 'reset') { storage.reset(); location.reload(); return; }
    if (v === 'close') return;
    layout.setMode(v);
    await mountStep(state.index);
  });
}

boot();
