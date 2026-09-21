// js/main.js
// エントリ。ステップの読み込みと進行制御、および問題タイプ別の共通実行エンジン（runItems）を持つ。
// 授業時間が足りないときは STEP_ORDER の1行をコメントアウトするだけでそのステップを飛ばせる。

import { problems } from '../data/problems.js';
import { FLOW, HINTS, TEXT, CANVAS, COLORS } from '../data/config.js';
import { GridCanvas } from './core/canvas.js';
import * as vec from './core/vector.js';
import { ui } from './core/ui.js';
import { storage } from './core/storage.js';
import { layout } from './core/layout.js';

/* ===== 全ステップの並び（各話はここから必要な分を取り出して使う） ===== */
const STEP_ORDER = [
  'intro',
  'step1',
  'step2',
  'stepv',
  'step25a',
  'step25b',
  'step6',      // 変位の記号。変位の話が続いているうちに固める（速度に入る前）
  'step4',
  'ext1', 'ext2', 'ext3',
  'step3',
  'step5',
  'reflection'
];

/* ===== トップページに並べる「話」 =====
   カードの順番がそのまま授業の順番。minutes は目安。
   href を書いたものは別ページ（相対速度）へ飛ぶ。 */
const CHAPTERS = [
  {
    key: 'ch1', label: '第1話', minutes: 34,
    title: 'Sさんは、どこにいる？　どれだけ動いた？',
    lead: '位置ベクトルと変位ベクトル。動かしてよい矢印はどちらか。基準を取り替えると何が変わるか。'
  },
  {
    key: 'ext', label: '発展', minutes: 10,
    title: '変位ベクトルを拡張すると見えてくること 〜斜方投射を題材に〜',
    lead: '「先端どうしを結ぶ」を速度にも使ってみる。そこから見えてくるものに、名前をつけます。'
  },
  {
    key: 'ch2', label: '第2話', minutes: 11,
    title: 'ベクトルの足し算はどんな時にでてくるの？',
    lead: '変位をつなぐ。速度を合成する。足し算が必要になる場面を自分で作ります。'
  },
  {
    key: 'relative', label: '第3話', minutes: 15, href: 'relative.html',
    title: '相対速度 — 基準を「動いている物体」に取り替える',
    lead: '止まって見ているか、一緒に動きながら見ているか。同じ運動が違って見えます。'
  }
];

/* ===== 話ごとのステップの並び =====
   授業時間が足りないときは、該当する話の steps から1行コメントアウトするだけで飛ばせる。 */
const COURSES = {
  ch1: {
    label: '第1話',
    steps: ['intro', 'step1', 'step2', 'stepv', 'step25a', 'step25b', 'step6', 'step4', 'reflection'],
    endText: '<b>第1話おわり。</b>位置ベクトルと変位ベクトル、そして基準の話でした。',
    endHint: '矢印を動かしてよいかどうかは、その矢印が何を言っているかで決まりました。',
    next: { label: '発展へ進む →', href: 'index.html?course=ext' }
  },

  ext: {
    label: '発展',
    intro: `<b>変位ベクトルを拡張すると見えてくること</b><br>
            〜斜方投射を題材に〜<br><br>
            第1話で、変位は「2つの位置ベクトルの先端どうしを結んだ矢印」でした。<br>
            同じことを <b>速度ベクトル</b> にもやってみます。何が出てくるでしょう。`,
    startLabel: 'はじめる',
    steps: ['ext1', 'ext2', 'ext3'],
    endText: '<b>発展おわり。</b>速度の変化をつないだ先に、加速度がありました。',
    endHint: '同じ「先端どうしを結ぶ」が、位置にも速度にも使えました。',
    next: { label: '第2話へ進む →', href: 'index.html?course=ch2' }
  },

  ch2: {
    label: '第2話',
    intro: `<b>ベクトルの足し算は、どんな時にでてくるの？</b><br><br>
            第1話で、変位ベクトルは置き直してよい矢印だと確かめました。<br>
            置き直してよいなら、<b>つなげる</b>こともできるはずです。<br>
            足し算が必要になる場面を、自分で作ってみましょう。`,
    startLabel: 'はじめる',
    steps: ['step3', 'step5', 'reflection2'],
    endText: '<b>第2話おわり。</b>矢印を継ぎ足すこと ＝ 足し算でした。',
    endHint: '変位でも速度でも、継ぎ足し方は同じでした。',
    next: { label: '第3話：相対速度へ進む →', href: 'relative.html' }
  },

  relative: {
    label: '確認',
    intro: `今日は <b>相対速度</b> を学びます。<br>
            その前に、必要になることを確認します（7分）。<br>
            ① 基準点を変えても変位は変わらない　② 速度を矢印で表す<br>
            ③ 矢印の差の作図　④ それを記号で書くと どうなるか`,
    startLabel: 'はじめる',
    steps: ['step25b', 'step6', 'step4', 'step5'],
    endText: '<b>復習おわり。</b>ここまでが相対速度の前提です。',
    endHint: '基準点を変えても変位は変わりませんでした。つぎは、基準そのものを動いている物体に取り替えます。',
    next: { label: '相対速度へ進む →', href: 'relative.html' }
  }
};

function activeCourse() {
  const key = new URLSearchParams(location.search).get('course');
  return COURSES[key] ? { key, ...COURSES[key] } : null;
}

const STEP_FILES = {
  step1: './steps/step1-position.js',
  step2: './steps/step2-displacement.js',
  step25a: './steps/step25a-relocate.js',
  step25b: './steps/step25b-origin.js',
  step3: './steps/step3-chain.js',
  step4: './steps/step4-velocity.js',
  step5: './steps/step5-compose.js',
  stepv: './steps/stepv-velocity-dir.js',
  step6: './steps/step6-symbol.js',
  ext1: './steps/ext1-velocity.js',
  ext2: './steps/ext2-deltav.js',
  ext3: './steps/ext3-name.js',
  reflection: './steps/reflection.js',
  reflection2: './steps/reflection.js'   // 第2話の振り返り（問いは problems.reflection2）
};

/** 復習コースの冒頭。第1弾を通してやらない日に、いま何をするのかを先に伝える。 */
const COURSE_INTRO_STEP = {
  id: 'courseIntro',
  label: '確認',
  async mount(root, ctx) {
    ui.showCanvas(false);
    ui.setScale('');
    ui.setPrompt(state.course.intro);
    ui.actions([{
      id: 'next', label: state.course.startLabel || 'はじめる',
      variant: 'primary', onClick: () => ctx.complete(true)
    }]);
  },
  unmount() {}
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
  maxReached: 0,   // ここまでは進捗チップから戻れる
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

  state.course = activeCourse();
  if (!state.course) return renderHome();     // ?course= が無ければ話の選択画面
  ui.exitHome();
  const order = state.course.steps;

  if (state.course && state.course.intro) {
    state.steps.push({
      id: 'courseIntro', label: state.course.label || '確認',
      module: COURSE_INTRO_STEP, problems: null
    });
  }

  for (const id of order) {
    if (id === 'intro') {
      state.steps.push({ id, label: INTRO_STEP.label, module: INTRO_STEP, problems: problems.intro });
      continue;
    }
    const file = STEP_FILES[id];
    if (!file) continue;
    const mod = await import(file);
    let prob = problems[id];
    // 復習コースでは、②.5b の「ここから話が変わります」だけ出さない。
    // 直前のステップを前提にした文で、コース冒頭の説明と重複するため。
    // ④⑤の「速度の話に入ります」「動くものが2つ」は復習コースでも必要なので残す。
    if (state.course.key === 'relative' && id === 'step25b' && prob && prob.transition) prob = { ...prob, transition: null };
    // 復習コースは7分しかないので、⑥は「直感 → 式」の2段だけにする。
    // bef / aft の成分を1つずつ打たせる2段は、第1話で通っている前提。
    if (state.course.key === 'relative' && id === 'step6' && prob) {
      prob = { ...prob, coordBef: null, coordAft: null };
    }
    state.steps.push({ id, label: mod.default.label || id, module: mod.default, problems: prob });
  }

  setupSettings();

  const saved = storage.getCurrentStep(state.course.key);
  const savedIdx = state.steps.findIndex(s => s.id === saved);
  if (savedIdx > 0) {
    const go = await ui.modal({
      title: '前回の続きから',
      body: `<p>前回は「${state.steps[savedIdx].label}」まで進んでいました。続きから始めますか？</p>`,
      actions: [{ label: '最初から', value: 'restart' }, { label: '続きから', value: 'resume', variant: 'primary' }]
    });
    if (go === 'resume') { state.index = savedIdx; state.maxReached = savedIdx; }
    else { storage.reset(); state.index = 0; }
  }
  await mountStep(state.index);
}

/* ---------- トップページ ---------- */
function renderHome() {
  ui.renderHome({
    title: 'ベクトルで運動を表す',
    lead: 'やりたい話をえらんでください。順番どおりに進むのがおすすめです。',
    chapters: CHAPTERS.map(c => ({ ...c, done: storage.getSetting('done.' + c.key, false) === true })),
    onPick: (c) => { location.href = c.href || ('index.html?course=' + c.key); }
  });
  setupSettings();
}

function phoneAware(prob, key) {
  if (!prob) return null;
  if (layout.profile.name === 'phone' && prob.phone && prob.phone[key] != null) return prob.phone[key];
  return prob[key] != null ? prob[key] : null;
}

/* ---------- ステップの mount / unmount ---------- */
/** 先生モード（どのステップにも移動できる）。教員機で一度ONにすれば端末に残る。 */
function teacherMode() { return storage.getSetting('teacherMode', false) === true; }

/**
 * 進捗チップ。生徒は「通過済みに戻る」だけ。
 * 先に飛べるようにすると、順を追って考えさせる設計が崩れるため、
 * 全解放は先生モードのときだけ。
 */
function renderStepBar(currentId) {
  ui.renderSteps(state.steps, currentId, {
    canJump: (i) => teacherMode() || i <= state.maxReached,
    onJump: (i) => mountStep(i)
  });
}

async function mountStep(i) {
  if (i >= state.steps.length) return finish();
  state.index = i;
  state.maxReached = Math.max(state.maxReached, i);
  const step = state.steps[i];
  state.currentProblems = step.problems;
  storage.setCurrentStep(step.id, state.course.key);   // 話ごとに別々に覚える

  if (state.current && state.current.module.unmount) {
    try { state.current.module.unmount(); } catch (e) { console.warn(e); }
  }
  ui.reset();
  renderStepBar(step.id);

  const gridSize = phoneAware(step.problems, 'gridSize') || layout.profile.gridSize;
  state.canvas = new GridCanvas(ui.el.canvasHost, { gridSize });
  if (layout.profile.name === 'tablet') state.canvas.enableHover();
  state.scene = null;

  const ctx = makeContext(step);
  state.ctx = ctx;
  state.current = step;

  // 話が切り替わるところで、大きく宣言する。
  // problems.transition があればどのステップでも出せる（step25b / ④ / ⑤ で使用）。
  const tr = step.problems && step.problems.transition;
  if (tr) {
    await ui.modal({
      title: tr.title || '',
      body: tr.body || '',
      actions: [{ label: tr.button || 'わかった', variant: 'primary' }]
    });
  }

  await step.module.mount(ui.el.stage, ctx);
}

function finish() {
  const c = state.course;
  if (c) storage.setSetting('done.' + c.key, true);
  ui.reset();
  ui.showCanvas(false);
  ui.setPrompt(c ? c.endText : '<b>おつかれさまでした。</b>');
  ui.feedback(c ? c.endHint : '', 'info');
  const acts = [
    { label: 'トップへもどる', onClick: () => { location.href = 'index.html'; } },
    { label: 'この話をもう一度', onClick: () => {
        if (c) storage.setCurrentStep(null, c.key);
        location.reload();
      } }
  ];
  if (c && c.next) {
    acts.push({ id: 'next', label: c.next.label, variant: 'primary',
                onClick: () => { location.href = c.next.href; } });
  }
  ui.actions(acts);
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
  return new Promise(resolve => {
    handler(step, item, meta, resolve);
    // 移動の様子を見せるアニメーション。どの type でも item.path / item.paths で使える。
    const paths = item.paths || (item.path ? [item.path] : []);
    for (const path of paths) {
      if (path && path.length > 1) animatePath(state.canvas, path, { line: item.pathLine !== false });
    }
  });
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
    wrongDirection: '向きをもう一度確かめましょう。x に何マス、y に何マスですか？',
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
      else value = d.words;
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
function animatePath(canvas, path, opts = {}) {
  const pts = path.map(p => canvas.toScreen(p));
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  line.setAttribute('d', d);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', '#b6c0cb');
  line.setAttribute('stroke-width', '0.07');
  line.setAttribute('stroke-dasharray', '0.14 0.16');
  if (opts.line === false) line.setAttribute('stroke', 'transparent');
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
    ui.feedback('補助線を出しました。x に何マス、y に何マス動くかを見てみましょう。', 'info');
  };

  const showAnswer = () => {
    if (answerShown || !item.answer) return;
    answerShown = true;
    const arrow = new vec.Arrow(canvas, 'answer', 'answer');
    arrow.set(item.answer.from, item.answer.to);
    arrow.setOpacity(0.35);
    storage.recordHint(step.id, item.id);
  };

  // 吸着先は「画面に見えている点」だけ。答えの端点を混ぜると当てられてしまう。
  const magnets = collectMagnets(item);

  const tool = new vec.DrawTool(canvas, {
    profile: layout.profile,
    magnets,
    styleName: item.style || 'displacement',
    // タップ方式のとき、いま何をすればよいかを示す
    onPhase: (phase) => {
      if (layout.profile.drawMode !== 'tap') return;
      if (phase === 'end') ui.feedback('つぎに、<b>矢印の先（到着点）</b>をタップ。ここからやり直すなら、同じ点をもう一度タップ。', 'info');
      else ui.clearFeedback();
    },
    onPreview: (v) => {
      if (!v) { ui.setReadout([]); return; }
      const d = vec.describe(vec.V.sub(v.to, v.from), item.unit || '');
      ui.setReadout([
        { id: 'draft', label: '成分', value: d.words },
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

/* --- draw-multi：1つの画面で複数の矢印を描き切る ---
   targets を1本ずつ別問題にすると「このステップは通過です」で飛ばせてしまい、
   そろった絵が最後まで出てこない。ここでは全部描くまで先へ進ませない。 */
HANDLERS['draw-multi'] = (step, item, meta, done) => {
  const canvas = state.canvas;
  buildScene(item.scene || { points: {}, vectors: [] });

  const magnets = collectMagnets(item);
  const remaining = (item.targets || []).map((t, i) => ({ ...t, index: i }));
  const total = remaining.length;
  const drawn = [];
  let attempts = 0;

  const status = () => {
    const left = remaining.length;
    if (!left) return item.doneText || 'すべて描けました。';
    const next = remaining[0];
    return (item.progressText || 'あと {n} 本。つぎは <b>{name}</b> です。')
      .replace('{n}', left).replace('{name}', next.name || '');
  };

  const refresh = (kind = 'info') => {
    ui.feedback(status(), remaining.length ? kind : 'correct');
    ui.setActionState('next', { disabled: remaining.length > 0 });
  };

  const showAnswerAll = () => {
    for (const t of remaining.slice()) {
      const a = new vec.Arrow(canvas, 'answer', 'answer');
      a.set(t.answer.from, t.answer.to);
      a.setOpacity(0.35);
    }
    remaining.length = 0;
    storage.recordPassedWithHelp(step.id, item.id);
  };

  const tool = new vec.DrawTool(canvas, {
    profile: layout.profile,
    magnets,
    styleName: item.style || 'velocity',
    onPreview: (v) => {
      if (!v) { ui.setReadout([]); return; }
      const d = vec.describe(vec.V.sub(v.to, v.from), item.unit || '');
      ui.setReadout([
        { id: 'draft', label: '成分', value: d.words },
        { id: 'mag', label: '大きさ', value: d.magnitude }
      ]);
    },
    onComplete: (v) => {
      attempts++;
      // 残っている的のうち、どれかに当たれば受け付ける（描く順番は問わない）
      const hitIdx = remaining.findIndex(t => vec.judge(v, { answer: t.answer }).ok);
      if (hitIdx >= 0) {
        const t = remaining.splice(hitIdx, 1)[0];
        const keep = new vec.Arrow(canvas, 'static', item.style || 'velocity', { label: t.label });
        keep.set(t.answer.from, t.answer.to);
        drawn.push(t.name || t.label || '');
        tool.clear();
        storage.recordAttempt(step.id, item.id, true);
        ui.toast((t.name || '1本') + ' OK');
        refresh('correct');
        return;
      }
      // 外れたときは、いちばん近い的の誤答パターンで返す
      const near = remaining[0];
      const r = near ? vec.judge(v, { answer: near.answer, feedback: item.feedback }) : { pattern: null };
      ui.feedback(feedbackFor({ feedback: item.feedback }, r.pattern) + '<br>' + status(), 'wrong');
      storage.recordAttempt(step.id, item.id, false);
      if (attempts >= total + FLOW.maxAttempts) {
        showAnswerAll();
        ui.feedback((item.explanation || '') + '<br>残りは薄い矢印で出しました。確かめたら次へ進みましょう。', 'info');
        refresh('info');
      }
    }
  });

  const acts = [
    { label: TEXT.retry, onClick: () => { tool.clear(); refresh(); } },
    { label: TEXT.showAnswer, onClick: () => { showAnswerAll(); refresh('info'); } },
    { label: '次へ', id: 'next', variant: 'primary', disabled: true, onClick: async () => {
        ui.stopHints(); tool.destroy();
        if (item.reveal) {
          await ui.modal({ title: item.reveal.title || '', body: item.reveal.body || '',
                           actions: [{ label: 'わかった', variant: 'primary' }] });
        }
        done({ correct: true });
      } }
  ];
  ui.actions(acts);
  refresh();
  ui.startHints({ hints: item.hints || [], onCount: () => storage.recordHint(step.id, item.id) });
};

/** 画面に見えている点を吸着先として集める（答えの端点は入れない） */
function collectMagnets(item) {
  const magnets = [];
  if (item.origin) magnets.push({ x: item.origin.x, y: item.origin.y });
  for (const lm of (item.landmarks || [])) magnets.push({ x: lm.x, y: lm.y });
  const pts = (item.scene && item.scene.points) || {};
  for (const p of Object.values(pts)) if (!p.hidden) magnets.push({ x: p.x, y: p.y });
  for (const v of ((item.scene && item.scene.vectors) || [])) {
    if (v.hidden) continue;
    const a = pts[v.from], b = pts[v.to];
    if (a) magnets.push({ x: a.x, y: a.y });
    if (b) magnets.push({ x: b.x, y: b.y });
  }
  return magnets;
}

/* --- choice：選択肢から選ぶ --- */
HANDLERS['choice'] = (step, item, meta, done) => {
  if (item.scene) buildScene(item.scene); else ui.showCanvas(!!item.showCanvas);
  if (item.readouts && state.scene) ui.setReadout(readoutItems(state.scene, item, {}));
  let attempts = 0;

  // prediction: true … 予想を立てさせるだけ。正誤は出さず、どれを選んでも先へ進める。
  // 確かめたあとで、同じことをもう一度（採点ありで）聞く。
  if (item.prediction) {
    const plist = ui.renderChoice(item, (i, opt, btn) => {
      btn.classList.add('is-picked');
      [...plist.children].forEach(c => c.disabled = true);
      storage.recordAttempt(step.id, item.id, true);
      ui.feedback(opt.note || item.afterPick || 'では、実際に確かめてみましょう。', 'info');
      ui.actions([{ label: '確かめる', variant: 'primary', onClick: () => done({ correct: true }) }]);
    });
    ui.actions([]);
    return;
  }
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

  // 画面に出す文言は problems.js の item.progress に置く（コードにベタ書きしない）
  const P = item.progress || {};
  let lastDragged = null;

  const statusText = (ok) => {
    if (ok) return P.done || 'すべて確かめられました。';
    if (req.kind === 'eachDragged') {
      const left = (req.ids || []).filter(id => !dragged.has(id)).length;
      return (P.remaining || 'あと {n} つ、動かしてみましょう。').replace('{n}', left);
    }
    if (req.kind === 'distinctPositions') {
      const left = Math.max(0, (req.count || 3) - visited.size);
      return (P.remaining || 'あと {n} か所、動かしてみましょう。').replace('{n}', left);
    }
    return '';
  };

  const checkDone = () => {
    let ok = false;
    if (req.kind === 'eachDragged') ok = (req.ids || []).every(id => dragged.has(id));
    if (req.kind === 'distinctPositions') ok = visited.size >= (req.count || 3);
    ui.setActionState('next', { disabled: !ok });
    // 直前に動かしたものへの個別のことば（「戻ってしまいましたね」「そのまま置けましたね」）を先に出す
    const own = lastDragged && P.dragged ? P.dragged[lastDragged] : null;
    const status = statusText(ok);
    ui.feedback([own, status].filter(Boolean).join('<br>'), ok ? 'correct' : 'info');
    return ok;
  };

  sceneRef = buildScene(item.scene, {
    onChange: (e) => {
      if (e.phase === 'move' || e.phase === 'end') updateReadout();
      if (e.phase === 'end') {
        if (e.type === 'vector' && e.moved) { dragged.add(e.id); lastDragged = e.id; }
        if (e.type === 'point') {
          dragged.add(e.id); lastDragged = e.id;
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

/* --- tap-select：画面の矢印をタップして選ぶ --- */
HANDLERS['tap-select'] = (step, item, meta, done) => {
  const scene = buildScene(item.scene);
  const opts = item.options || [];
  let attempts = 0;
  let settled = false;

  const finishItem = (correct) => {
    settled = true;
    ui.stopHints();
    ui.actions([{ label: '次へ', variant: 'primary', onClick: async () => {
      if (item.reveal) {
        await ui.modal({ title: item.reveal.title || '', body: item.reveal.body || '',
                         actions: [{ label: 'わかった', variant: 'primary' }] });
      }
      done({ correct });
    } }]);
  };

  const pick = (id) => {
    if (settled) return;
    const opt = opts.find(o => o.vector === id);
    if (!opt) return;
    attempts++;
    storage.recordAttempt(step.id, item.id, !!opt.correct);
    const arrow = scene.arrows[id];
    if (opt.correct) {
      if (arrow) arrow.setColor(COLORS.correct);
      ui.feedback(item.correctText || '正解です。', 'correct');
      finishItem(true);
      return;
    }
    if (arrow) {
      const back = arrow.style.color;
      arrow.setColor(COLORS.wrong);
      setTimeout(() => { const a = scene.arrows[id]; if (a) a.setColor(back); }, 900);
    }
    ui.feedback(opt.feedback || 'それではありません。もう一度見てみましょう。', 'wrong');
    if (attempts >= FLOW.maxAttempts) {
      const right = opts.find(o => o.correct);
      const ra = right && scene.arrows[right.vector];
      if (ra) ra.setColor(COLORS.correct);
      storage.recordPassedWithHelp(step.id, item.id);
      ui.feedback(item.explanation || '正しい矢印に印をつけました。', 'info');
      finishItem(false);
    }
  };

  for (const o of opts) {
    const arrow = scene.arrows[o.vector];
    if (!arrow) continue;
    arrow.hit.style.pointerEvents = 'stroke';
    arrow.hit.style.cursor = 'pointer';
    arrow.hit.addEventListener('pointerdown', (ev) => { ev.preventDefault(); pick(o.vector); });
  }
  ui.actions([]);
  ui.feedback(item.hintText || '矢印そのものをタップしてください。', 'info');
  ui.startHints({ hints: item.hints || [], onCount: () => storage.recordHint(step.id, item.id) });
};

/* --- text-answer：ことばを入力して答える（発展の「漢字三文字」など） --- */
HANDLERS['text-answer'] = (step, item, meta, done) => {
  if (item.scene) buildScene(item.scene); else ui.showCanvas(!!item.showCanvas);
  const accept = (item.accept || []).map(normalizeAnswer);
  let text = '';
  let attempts = 0;

  const finishItem = (correct) => {
    ui.stopHints();
    ui.actions([{ label: '次へ', variant: 'primary', onClick: async () => {
      if (item.reveal) {
        await ui.modal({ title: item.reveal.title || '', body: item.reveal.body || '',
                         actions: [{ label: 'わかった', variant: 'primary' }] });
      }
      done({ correct });
    } }]);
  };

  const check = () => {
    attempts++;
    const ok = accept.includes(normalizeAnswer(text));
    storage.recordAttempt(step.id, item.id, ok);
    if (ok) {
      ui.feedback(item.correctText || '正解です。', 'correct');
      finishItem(true);
      return;
    }
    const near = (item.nearMiss || []).find(n => normalizeAnswer(text) === normalizeAnswer(n.text));
    ui.feedback(near ? near.feedback : (item.wrongText || 'ちがうようです。もう一度考えてみましょう。'), 'wrong');
    if (attempts >= FLOW.maxAttempts) {
      storage.recordPassedWithHelp(step.id, item.id);
      ui.feedback((item.explanation || '') + `<br>答えは <b>${item.accept[0]}</b> です。`, 'info');
      finishItem(false);
    }
  };

  if (item.question) {
    const q = document.createElement('p');
    q.className = 'choice-question';
    q.innerHTML = item.question;
    ui.el.interact.style.display = '';
    ui.el.interact.appendChild(q);
  }
  const ta = ui.renderTextarea({
    rows: 1,
    placeholder: item.placeholder || '',
    value: ''
  }, (v) => { text = v; });
  ta.classList.add('short-answer');

  ui.actions([{ id: 'check', label: '答え合わせ', variant: 'primary', onClick: check }]);
  ui.startHints({ hints: item.hints || [], onCount: () => storage.recordHint(step.id, item.id) });
};

/** 全角・半角・空白のゆれを吸収してから比べる */
function normalizeAnswer(t) {
  return String(t == null ? '' : t)
    .replace(/[\s\u3000]/g, '')
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .toLowerCase();
}

/* ---------- 設定（レイアウト手動切替・進捗リセット） ---------- */
function setupSettings() {
  const btn = document.getElementById('settingsBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const mode = layout.mode;
    const dmode = layout.drawMode;
    const teacher = teacherMode();
    const v = await ui.modal({
      title: TEXT.settings,
      body: `<p>画面レイアウト（現在：<b>${layout.profile.name}</b>／設定：${mode}）</p>
             <p>作図の操作：<b>${layout.profile.drawMode === 'tap' ? '①始点→②終点をタップ' : '押したままドラッグ'}</b>
                （設定：${dmode === 'auto' ? '自動' : dmode}）</p>
             <p>先生モード：<b>${teacher ? 'ON' : 'OFF'}</b>
                <span style="color:#4b5563;font-size:15px">
                ONにすると、上の進捗バーからどのステップにも移動できます。
                OFFのときは通過済みのステップにだけ戻れます。</span></p>`,
      actions: [
        { label: '自動', value: 'auto' },
        { label: 'スマホ', value: 'phone' },
        { label: 'タブレット・PC', value: 'tablet' },
        { label: '作図：タップ', value: 'draw-tap' },
        { label: '作図：ドラッグ', value: 'draw-drag' },
        { label: '作図：自動', value: 'draw-auto' },
        { label: teacher ? '先生モードをOFF' : '先生モードをON', value: 'teacher' },
        { label: 'トップ（話の選択）へ', value: 'home' },
        { label: '第3話（相対速度）へ', value: 'vol2' },
        { label: '相対速度の前提だけ復習する', value: 'course' },
        { label: '進捗をリセット', value: 'reset' },
        { label: '閉じる', value: 'close', variant: 'primary' }
      ]
    });
    if (v && v.startsWith('draw-')) {
      layout.setDrawMode(v.slice(5));
      ui.toast('作図の操作：' + (v === 'draw-tap' ? 'タップ' : v === 'draw-drag' ? 'ドラッグ' : '自動'));
      if (state.course) await mountStep(state.index);
      return;
    }
    if (v === 'home') { location.href = 'index.html'; return; }
    if (v === 'vol2') { location.href = 'relative.html'; return; }
    if (v === 'course') { location.href = 'index.html?course=relative'; return; }
    if (v === 'teacher') {
      storage.setSetting('teacherMode', !teacher);
      if (state.course && state.steps[state.index]) renderStepBar(state.steps[state.index].id);
      ui.toast(!teacher ? '先生モード ON' : '先生モード OFF');
      return;
    }
    if (v === 'reset') { storage.reset(); location.reload(); return; }
    if (v === 'close') return;
    layout.setMode(v);
    if (state.course) await mountStep(state.index); else renderHome();
  });
}

boot();
