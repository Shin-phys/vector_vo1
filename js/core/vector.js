// js/core/vector.js
// 矢印の生成・ドラッグ・スナップ・判定と、宣言的な「シーン」（点と矢印の集合）の管理。
// 束縛ベクトル（錠前つき）のスナップバック挙動もここに実装する。

import { svgEl } from './canvas.js';
import { VECTOR_STYLES, COLORS, JUDGE, CANVAS } from '../../data/config.js';

/* ---------- ベクトル演算 ---------- */
export const V = {
  sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y }),
  add: (a, b) => ({ x: a.x + b.x, y: a.y + b.y }),
  len: (a) => Math.hypot(a.x, a.y),
  dist: (a, b) => Math.hypot(a.x - b.x, a.y - b.y),
  angleDeg: (a) => Math.atan2(a.y, a.x) * 180 / Math.PI,
  same: (a, b, eps = 1e-6) => Math.abs(a.x - b.x) < eps && Math.abs(a.y - b.y) < eps
};

export function angleBetween(a, b) {
  const la = V.len(a), lb = V.len(b);
  if (la < 1e-9 || lb < 1e-9) return 180;
  let c = (a.x * b.x + a.y * b.y) / (la * lb);
  c = Math.max(-1, Math.min(1, c));
  return Math.acos(c) * 180 / Math.PI;
}

/** 符号つきの数。0 は符号なし。マイナスは見やすい「−」を使う。 */
export function sgn(n) {
  const v = Math.round(n * 100) / 100;
  if (v > 0) return '+' + v;
  if (v < 0) return '−' + Math.abs(v);
  return '0';
}

/**
 * 成分と大きさの表記。
 * 東西南北は使わず、±x / ±y で書く（方角の言い換えを挟まずに符号を読ませるため）。
 */
export function describe(vec, unit = '') {
  const mag = Math.round(V.len(vec) * 100) / 100;
  return {
    components: `(${sgn(vec.x)}, ${sgn(vec.y)})`,
    words: `x ${sgn(vec.x)}　y ${sgn(vec.y)}`,
    magnitude: `${mag}${unit ? ' ' + unit : ''}`
  };
}

/* ---------- 矢印の描画 ---------- */
export class Arrow {
  constructor(canvas, layerName, styleName, opts = {}) {
    this.canvas = canvas;
    this.style = { ...(VECTOR_STYLES[styleName] || VECTOR_STYLES.draft), ...(opts.styleOverride || {}) };
    this.g = svgEl('g', { class: 'arrow arrow-' + styleName }, canvas.layers[layerName] || canvas.layers.dynamic);
    this.line = svgEl('line', {
      stroke: this.style.color,
      'stroke-width': this.style.width,
      'stroke-linecap': 'round',
      'stroke-dasharray': this.style.dash
    }, this.g);
    this.head = svgEl('path', { fill: this.style.color }, this.g);
    this.hit = svgEl('line', {
      class: 'arrow-hit',
      stroke: 'transparent',
      'stroke-width': opts.hitWidth || 0.5,
      'stroke-linecap': 'round',
      'pointer-events': opts.interactive ? 'stroke' : 'none'
    }, this.g);
    this.labelEl = null;
    if (opts.label) {
      this.labelEl = svgEl('text', {
        'font-size': CANVAS.fontSize, fill: this.style.color,
        'paint-order': 'stroke', stroke: COLORS.bg, 'stroke-width': 0.14, 'stroke-linejoin': 'round',
        'text-anchor': 'middle', 'pointer-events': 'none'
      }, this.g);
      this.labelEl.textContent = opts.label;
    }
    this.from = { x: 0, y: 0 };
    this.to = { x: 0, y: 0 };
  }

  set(from, to) {
    this.from = { ...from }; this.to = { ...to };
    const a = this.canvas.toScreen(from), b = this.canvas.toScreen(to);
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    const h = Math.min(this.style.head, len * 0.5);
    const ux = len ? dx / len : 0, uy = len ? dy / len : 0;
    const tipBase = { x: b.x - ux * h, y: b.y - uy * h };
    this.line.setAttribute('x1', a.x); this.line.setAttribute('y1', a.y);
    this.line.setAttribute('x2', tipBase.x); this.line.setAttribute('y2', tipBase.y);
    this.hit.setAttribute('x1', a.x); this.hit.setAttribute('y1', a.y);
    this.hit.setAttribute('x2', b.x); this.hit.setAttribute('y2', b.y);
    if (h > 0.01 && len > 0.01) {
      const w = h * 0.55;
      const px = -uy, py = ux;
      this.head.setAttribute('d',
        `M ${b.x} ${b.y} L ${tipBase.x + px * w} ${tipBase.y + py * w} L ${tipBase.x - px * w} ${tipBase.y - py * w} Z`);
      this.head.setAttribute('opacity', 1);
    } else {
      this.head.setAttribute('opacity', 0);
    }
    if (this.labelEl) {
      this.labelEl.setAttribute('x', (a.x + b.x) / 2 - uy * 0.42);
      this.labelEl.setAttribute('y', (a.y + b.y) / 2 + ux * 0.42 + 0.14);
    }
    return this;
  }

  setColor(c) {
    this.line.setAttribute('stroke', c);
    this.head.setAttribute('fill', c);
    if (this.labelEl) this.labelEl.setAttribute('fill', c);
  }
  setOpacity(v) { this.g.setAttribute('opacity', v); }
  highlight(on) { this.g.classList.toggle('is-active', !!on); }
  remove() { this.g.remove(); }
}

/* ---------- 判定 ---------- */
/**
 * @param {{from:{x,y},to:{x,y}}} user
 * @param {object} item  problems.js の item（item.answer を見る）
 * @returns {{ok:boolean, pattern:string|null, detail:object}}
 */
export function judge(user, item) {
  const ans = item.answer || {};
  const u = V.sub(user.to, user.from);
  const a = V.sub(ans.to, ans.from);
  const startOk = ans.anyStart ? true : V.dist(user.from, ans.from) <= JUDGE.startTolerance;
  const ang = angleBetween(u, a);
  const lenDiff = Math.abs(V.len(u) - V.len(a));
  const ok = startOk && ang <= JUDGE.angleToleranceDeg && lenDiff <= JUDGE.lengthTolerance;
  let pattern = null;
  if (!ok) {
    if (ang >= JUDGE.reversedAngleDeg) pattern = 'reversed';
    else if (!startOk && ans.origin && V.dist(user.from, ans.origin) <= JUDGE.startTolerance) pattern = 'fromOrigin';
    else if (!startOk) pattern = 'wrongStart';
    else if (Array.isArray(ans.legs) && isSumOfLengths(u, ans.legs)) pattern = 'sumOfLengths';
    else if (ang <= JUDGE.angleToleranceDeg) pattern = 'wrongLength';
    else pattern = 'wrongDirection';
  }
  return { ok, pattern, detail: { angle: ang, lenDiff, startOk } };
}

function isSumOfLengths(u, legs) {
  const total = legs.reduce((s, leg) => s + V.dist(leg.from, leg.to), 0);
  return Math.abs(V.len(u) - total) <= JUDGE.lengthTolerance;
}

/* ---------- 作図ツール（矢印を1本描く） ----------
   2つのやり方を持つ。どちらを使うかは profile.drawMode（'tap' | 'drag'）。

   drag … 押したまま引く。すべての端末の既定。
          「矢印を引く」という動作そのものが学習内容なので、こちらを基本にする。
          スマホで始点・終点がずれる問題は、画面に見えている点への甘い吸着
          （snapPoint / profile.snapRadius）で受け止める。
   tap  … ①始点をタップ → ②終点をタップ。⚙メニューから選べる予備の方式。
          指の震えでドラッグが途切れてしまう生徒のための逃げ道として残してある。
*/
export class DrawTool {
  /**
   * @param {GridCanvas} canvas
   * @param {{profile:object, styleName:string, onPreview:Function, onComplete:Function,
   *          onStart:Function, onPhase:Function}} opts
   *   onPhase(phase, point) … 'start'（1点目待ち）/ 'end'（2点目待ち）。
   *   画面の案内文を切り替えるために使う。
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.opts = opts;
    this.profile = opts.profile || { touchOffsetY: 0, magnifier: false, drawMode: 'drag' };
    this.arrow = null;
    this.cross = null;
    this.startDot = null;
    this.active = false;
    this.pending = null;              // tap 方式で、1点目が決まっている状態
    this._down = this._onDown.bind(this);
    this._move = this._onMove.bind(this);
    this._up = this._onUp.bind(this);
    this._ctx = (e) => e.preventDefault();          // 長押しメニューを出さない
    canvas.svg.addEventListener('pointerdown', this._down);
    canvas.svg.addEventListener('contextmenu', this._ctx);
    // ここで onPhase を呼ばないこと。呼び出し側の `const tool = new DrawTool(...)` が
    // まだ初期化されておらず、コールバックから tool を参照すると落ちる。
  }

  get mode() {
    return this.opts.mode || this.profile.drawMode || 'drag';
  }

  _emitPhase(phase, pt) {
    if (this.opts.onPhase) this.opts.onPhase(phase, pt);
  }

  _pt(ev) {
    // 指で隠れるぶんだけ上にずらす。tap 方式は打ち直せるので、ずらしは控えめでよい。
    const offY = (ev.pointerType === 'touch') ? (this.profile.touchOffsetY || 0) : 0;
    const raw = this.canvas.fromClient(ev.clientX, ev.clientY - offY);
    return this.snapPoint(raw, ev.pointerType);
  }

  /**
   * 吸着。画面に見えている点（基準点・目印・シーンの点）が近くにあれば、そちらを優先して吸いつく。
   * スマホは指が太く先端も隠れるので、半径をかなり甘くとる（profile.snapRadius, px）。
   * 近くに点が無ければ、これまでどおり格子点へ丸める。
   */
  snapPoint(raw, pointerType = 'mouse') {
    const mags = this.opts.magnets || [];
    if (mags.length) {
      let r = this.canvas.pxToUnits(this.profile.snapRadius || 0);
      if (pointerType === 'mouse') r *= 0.6;      // マウスは正確なので控えめに
      let best = null, bd = r;
      for (const m of mags) {
        const d = V.dist(raw, m);
        if (d <= bd) { bd = d; best = m; }
      }
      if (best) return { x: best.x, y: best.y };
    }
    return this.canvas.snap(raw);
  }

  /* ---------- tap 方式 ---------- */
  _onTap(ev) {
    const p = this._pt(ev);
    if (!this.pending) {
      this.setStart(p);
      return;
    }
    if (V.dist(this.pending, p) < 0.4) {   // 同じところをもう一度＝1点目を置き直しただけ
      this.setStart(p);
      return;
    }
    // 2点目：確定
    if (this.arrow) this.arrow.remove();
    this.arrow = new Arrow(this.canvas, 'dynamic', this.opts.styleName || 'draft');
    this.arrow.set(this.pending, p);
    const from = this.pending;
    this.pending = null;
    this._hideStartDot();
    this.canvas.hideMagnifier();
    this._emitPhase('start', null);
    if (this.opts.onComplete) this.opts.onComplete({ from, to: p }, this.arrow);
  }

  /** 1点目を置く（すでに置いてあれば置き直す） */
  setStart(p) {
    this.pending = p;
    if (this.arrow) { this.arrow.remove(); this.arrow = null; }
    this._showStartDot(p);
    this._emitPreview(null, null);
    if (this.opts.onStart) this.opts.onStart(p);
    this._emitPhase('end', p);
    // ルーペは出さない。タップ方式では指が離れていて始点は見えているうえ、
    // ルーペが画面の一角を覆って2点目のタップ先を塞いでしまう。
  }

  _showStartDot(p) {
    const s = this.canvas.toScreen(p);
    if (!this.startDot) {
      this.startDot = svgEl('g', { class: 'start-dot', 'pointer-events': 'none' }, this.canvas.layers.overlay);
      svgEl('circle', { r: 0.30, fill: 'none', stroke: COLORS.velocity, 'stroke-width': 0.07 }, this.startDot);
      svgEl('circle', { r: 0.13, fill: COLORS.velocity }, this.startDot);
      const t = svgEl('text', {
        y: 0.78, 'font-size': CANVAS.fontSize, fill: COLORS.velocity, 'text-anchor': 'middle',
        'paint-order': 'stroke', stroke: COLORS.bg, 'stroke-width': 0.16, 'stroke-linejoin': 'round'
      }, this.startDot);
      t.textContent = 'ここから';
    }
    this.canvas.layers.overlay.appendChild(this.startDot);
    this.startDot.setAttribute('transform', `translate(${s.x} ${s.y})`);
    this.startDot.setAttribute('opacity', 1);
  }

  _hideStartDot() { if (this.startDot) this.startDot.setAttribute('opacity', 0); }

  /* ---------- drag 方式 ---------- */
  _onDown(ev) {
    if (this.disabled) return;
    if (this.mode === 'tap') { ev.preventDefault(); this._onTap(ev); return; }
    ev.preventDefault();
    this.canvas.svg.setPointerCapture(ev.pointerId);
    this.active = true;
    this.start = this._pt(ev);
    if (this.arrow) this.arrow.remove();
    this.arrow = new Arrow(this.canvas, 'dynamic', this.opts.styleName || 'draft');
    this.arrow.set(this.start, this.start);
    this._showCross(this.start);
    if (this.opts.onStart) this.opts.onStart(this.start);
    this._emitPreview(this.start, this.start);
    if (this.profile.magnifier && ev.pointerType === 'touch') this.canvas.showMagnifier(this.start);
    this.canvas.svg.addEventListener('pointermove', this._move);
    this.canvas.svg.addEventListener('pointerup', this._up);
    this.canvas.svg.addEventListener('pointercancel', this._up);
  }

  _onMove(ev) {
    if (!this.active) return;
    ev.preventDefault();
    const p = this._pt(ev);
    this.arrow.set(this.start, p);
    this._showCross(p);
    this._emitPreview(this.start, p);
    if (this.profile.magnifier && ev.pointerType === 'touch') this.canvas.showMagnifier(p);
  }

  _onUp(ev) {
    if (!this.active) return;
    this.active = false;
    this.canvas.svg.removeEventListener('pointermove', this._move);
    this.canvas.svg.removeEventListener('pointerup', this._up);
    this.canvas.svg.removeEventListener('pointercancel', this._up);
    this.canvas.hideMagnifier();
    this._hideCross();
    const p = this._pt(ev);
    this.arrow.set(this.start, p);
    if (V.dist(this.start, p) < 0.4) {   // 短すぎる＝誤タップ
      this.arrow.remove(); this.arrow = null;
      this._emitPreview(null, null);
      return;
    }
    if (this.opts.onComplete) this.opts.onComplete({ from: this.start, to: p }, this.arrow);
  }

  _emitPreview(from, to) {
    if (this.opts.onPreview) this.opts.onPreview(from && to ? { from, to } : null);
  }

  _showCross(p) {
    const s = this.canvas.toScreen(p);
    if (!this.cross) {
      this.cross = svgEl('g', { class: 'cross-cursor', 'pointer-events': 'none' }, this.canvas.layers.overlay);
      svgEl('line', { x1: -0.35, y1: 0, x2: 0.35, y2: 0, stroke: COLORS.velocity, 'stroke-width': 0.05 }, this.cross);
      svgEl('line', { x1: 0, y1: -0.35, x2: 0, y2: 0.35, stroke: COLORS.velocity, 'stroke-width': 0.05 }, this.cross);
      svgEl('circle', { r: 0.18, fill: 'none', stroke: COLORS.velocity, 'stroke-width': 0.04 }, this.cross);
    }
    this.cross.setAttribute('transform', `translate(${s.x} ${s.y})`);
    this.cross.setAttribute('opacity', 1);
  }

  _hideCross() { if (this.cross) this.cross.setAttribute('opacity', 0); }

  clear() {
    if (this.arrow) { this.arrow.remove(); this.arrow = null; }
    this.pending = null;
    this._hideStartDot();
    this.canvas.hideMagnifier();
    this._emitPreview(null, null);
    this._emitPhase('start', null);
  }

  destroy() {
    this.clear();
    if (this.cross) this.cross.remove();
    if (this.startDot) { this.startDot.remove(); this.startDot = null; }
    this.canvas.svg.removeEventListener('pointerdown', this._down);
    this.canvas.svg.removeEventListener('contextmenu', this._ctx);
  }
}

/* ---------- シーン（点と矢印の集合。problems.js から宣言的に組み立てる） ---------- */
/**
 * decl = {
 *   points: { O:{x,y,label,role:'origin',draggable:true}, ... },
 *   vectors: [{id, from:'O', to:'S', style:'position', locked:true, draggable:true, label, showTipLabel}],
 *   guides: [{from:'O', to:'S'}]
 * }
 */
export class Scene {
  constructor(canvas, decl, opts = {}) {
    this.canvas = canvas;
    this.decl = JSON.parse(JSON.stringify(decl || { points: {}, vectors: [] }));
    this.profile = opts.profile || { minHitSize: 32, snapRadius: 16, touchOffsetY: 0, magnifier: false };
    this.onChange = opts.onChange || (() => {});
    this.unit = opts.unit || '';
    this.pts = {};
    for (const [id, p] of Object.entries(this.decl.points || {})) this.pts[id] = { ...p };
    this.offsets = {};
    for (const v of (this.decl.vectors || [])) this.offsets[v.id] = { x: 0, y: 0 };
    this.arrows = {};
    this.handles = [];
    this.tipLabelEl = null;
    this.dragging = null;
    this.render();
  }

  point(id) { const p = this.pts[id]; return p ? { x: p.x, y: p.y } : { x: 0, y: 0 }; }
  setPoint(id, pt) { if (this.pts[id]) { this.pts[id].x = pt.x; this.pts[id].y = pt.y; this.render(); } }

  vectorEnds(id) {
    const v = (this.decl.vectors || []).find(v => v.id === id);
    if (!v) return { from: { x: 0, y: 0 }, to: { x: 0, y: 0 } };
    const o = this.offsets[id] || { x: 0, y: 0 };
    return { from: V.add(this.point(v.from), o), to: V.add(this.point(v.to), o) };
  }

  vectorComponents(id) {
    const e = this.vectorEnds(id);
    return V.sub(e.to, e.from);
  }

  /** 矢印の先が指している場所の名前 */
  labelAt(pt) {
    let best = null, bd = 0.45;
    for (const [id, p] of Object.entries(this.pts)) {
      const d = V.dist(pt, p);
      if (d <= bd) { bd = d; best = p.label || id; }
    }
    return best || 'なにもない場所';
  }

  render() {
    const c = this.canvas;
    c.clear('static', 'points', 'guide', 'overlay');
    this.arrows = {};
    this.handles = [];
    const lockDrawn = new Set();          // 同じ始点に錠前を重ねて描かない
    const first = !this._rendered;
    this._rendered = true;

    for (const g of (this.decl.guides || [])) {
      c.drawGuideLine(this.point(g.from), this.point(g.to));
    }

    for (const v of (this.decl.vectors || [])) {
      if (v.hidden) continue;
      const ends = this.vectorEnds(v.id);
      const hitW = Math.max(0.5, c.pxToUnits(this.profile.minHitSize));
      const arrow = new Arrow(c, 'static', v.style || 'displacement', {
        label: v.label, interactive: !!v.draggable, hitWidth: hitW
      });
      arrow.set(ends.from, ends.to);
      if (v.opacity != null) arrow.setOpacity(v.opacity);   // 薄く残す「もとの矢印」用
      this.arrows[v.id] = arrow;
      // 登場アニメーション（③で「あとから継ぎ足した」と見せるため）。初回描画のみ。
      if (first && v.appearDelay) {
        arrow.g.style.animation = `revealin .5s ease-out ${v.appearDelay}s both`;
      }
      const locked = v.locked ?? (VECTOR_STYLES[v.style] || {}).locked;
      if (locked) {
        const key = `${ends.from.x},${ends.from.y}`;
        if (!lockDrawn.has(key)) {
          lockDrawn.add(key);
          arrow.lockIcon = c.drawLock(ends.from, { layer: 'overlay' });
        }
      }
      if (v.draggable) {
        arrow.hit.style.cursor = 'grab';
        arrow.hit.addEventListener('pointerdown', (ev) => this._startVectorDrag(ev, v));
      }
    }

    for (const [id, p] of Object.entries(this.pts)) {
      if (p.hidden) continue;
      c.drawPoint(p, { label: p.label, role: p.role, ring: !!p.draggable });
      if (p.draggable) {
        const s = c.toScreen(p);
        const r = Math.max(CANVAS.hitRadius, c.pxToUnits(this.profile.minHitSize) / 2);
        const hit = svgEl('circle', { cx: s.x, cy: s.y, r, fill: 'transparent', class: 'drag-handle' }, c.layers.points);
        hit.style.cursor = 'grab';
        hit.addEventListener('pointerdown', (ev) => this._startPointDrag(ev, id));
        this.handles.push(hit);
      }
    }
  }

  _clientToLogical(ev) {
    const offY = (ev.pointerType === 'touch') ? this.profile.touchOffsetY : 0;
    return this.canvas.fromClient(ev.clientX, ev.clientY - offY);
  }

  _startPointDrag(ev, id) {
    ev.preventDefault(); ev.stopPropagation();
    // 受け皿は SVG 本体。render() でハンドル要素が作り直されてもドラッグが切れない。
    const target = this.canvas.svg;
    target.setPointerCapture(ev.pointerId);
    const startLogical = this._clientToLogical(ev);
    const orig = this.point(id);
    this.dragging = { kind: 'point', id };
    this.onChange({ type: 'point', id, phase: 'start' });

    const move = (e) => {
      const cur = this._clientToLogical(e);
      const p = this.canvas.snap({ x: orig.x + (cur.x - startLogical.x), y: orig.y + (cur.y - startLogical.y) });
      if (p.x !== this.pts[id].x || p.y !== this.pts[id].y) {
        this.pts[id].x = p.x; this.pts[id].y = p.y;
        this.render();
        this.onChange({ type: 'point', id, phase: 'move', value: p });
      }
      if (this.profile.magnifier && e.pointerType === 'touch') this.canvas.showMagnifier(p);
    };
    const up = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
      this.canvas.hideMagnifier();
      this.dragging = null;
      this.onChange({ type: 'point', id, phase: 'end', value: this.point(id) });
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  }

  _startVectorDrag(ev, v) {
    ev.preventDefault(); ev.stopPropagation();
    const target = this.canvas.svg;
    target.setPointerCapture(ev.pointerId);
    const startLogical = this._clientToLogical(ev);
    const orig = { ...this.offsets[v.id] };
    const locked = v.locked ?? (VECTOR_STYLES[v.style] || {}).locked;
    this.dragging = { kind: 'vector', id: v.id };
    this.onChange({ type: 'vector', id: v.id, phase: 'start', locked });

    const move = (e) => {
      const cur = this._clientToLogical(e);
      const raw = { x: orig.x + (cur.x - startLogical.x), y: orig.y + (cur.y - startLogical.y) };
      const next = { x: Math.round(raw.x), y: Math.round(raw.y) };
      const changed = !V.same(next, this.offsets[v.id]);
      this.offsets[v.id] = next;
      if (changed) this.render();
      const ends = this.vectorEnds(v.id);
      if (v.showTipLabel || locked) this._showTipLabel(ends.to, this.labelAt(ends.to));
      if (changed) this.onChange({ type: 'vector', id: v.id, phase: 'move', locked, offset: next, ends });
      if (this.profile.magnifier && e.pointerType === 'touch') this.canvas.showMagnifier(ends.to);
    };
    const up = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', up);
      target.removeEventListener('pointercancel', up);
      this.canvas.hideMagnifier();
      this._hideTipLabel();
      const moved = !V.same(this.offsets[v.id], { x: 0, y: 0 });
      if (locked) {
        this.offsets[v.id] = { x: 0, y: 0 };   // 束縛ベクトルは元の位置にスナップバック
        this.render();
        if (moved) this._flashLock(v.id);
      }
      this.dragging = null;
      this.onChange({ type: 'vector', id: v.id, phase: 'end', locked, moved, offset: { ...this.offsets[v.id] } });
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', up);
    target.addEventListener('pointercancel', up);
  }

  _flashLock(id) {
    const a = this.arrows[id];
    if (a && a.lockIcon) {
      a.lockIcon.classList.add('lock-flash');
      setTimeout(() => a.lockIcon && a.lockIcon.classList.remove('lock-flash'), 900);
    }
    if (a) {
      a.g.classList.add('snap-back');
      setTimeout(() => a.g.classList.remove('snap-back'), 500);
    }
  }

  _showTipLabel(pt, text) {
    const s = this.canvas.toScreen(pt);
    if (!this.tipLabelEl) {
      this.tipLabelEl = svgEl('text', {
        'font-size': CANVAS.fontSize * 1.1, fill: COLORS.flash, 'text-anchor': 'middle',
        'paint-order': 'stroke', stroke: COLORS.bg, 'stroke-width': 0.2, 'stroke-linejoin': 'round',
        'pointer-events': 'none', class: 'tip-label'
      }, this.canvas.layers.overlay);
    } else {
      this.canvas.layers.overlay.appendChild(this.tipLabelEl);
    }
    this.tipLabelEl.setAttribute('x', s.x);
    this.tipLabelEl.setAttribute('y', s.y - 0.55);
    this.tipLabelEl.textContent = '→ ' + text;
    this.tipLabelEl.setAttribute('opacity', 1);
  }

  _hideTipLabel() { if (this.tipLabelEl) this.tipLabelEl.setAttribute('opacity', 0); }

  destroy() { this.canvas.clear(); }
}

/* ---------- 条件判定（free-place 用。名前で宣言する） ---------- */
export const CONDITIONS = {
  /** 2つの変位（点のペアで指定）が等しいか */
  vectorsEqual(scene, cfg) {
    const [a, b] = cfg.of;
    const va = V.sub(scene.point(a[1]), scene.point(a[0]));
    const vb = V.sub(scene.point(b[1]), scene.point(b[0]));
    const okLen = V.len(va) >= (cfg.minLength ?? 1);
    return { ok: okLen && V.same(va, vb, 1e-6), va, vb, reason: !okLen ? 'tooShort' : null };
  },
  /** 2本目の矢印の始点が、1本目の矢印の終点に重なっているか（③の「継ぎ足す」） */
  vectorsConnected(scene, cfg) {
    const [a, b] = cfg.of;
    const ea = scene.vectorEnds(a), eb = scene.vectorEnds(b);
    const d = V.dist(ea.to, eb.from);
    return { ok: d <= (cfg.tolerance ?? 0.01), distance: d };
  },
  /** 指定した矢印の始点がすべて同じ点にそろっているか（発展：速度ベクトルの始点そろえ） */
  vectorsShareStart(scene, cfg) {
    const ids = cfg.of || [];
    if (ids.length < 2) return { ok: false };
    const tol = cfg.tolerance ?? 0.01;
    const target = cfg.at ? scene.point(cfg.at) : scene.vectorEnds(ids[0]).from;
    let worst = 0;
    for (const id of ids) {
      const d = V.dist(scene.vectorEnds(id).from, target);
      if (d > worst) worst = d;
    }
    return { ok: worst <= tol, worst };
  },
  /** 2つの出発点が離れているか（課題2で「離れた場所」を担保する） */
  pointsApart(scene, cfg) {
    const d = V.dist(scene.point(cfg.of[0]), scene.point(cfg.of[1]));
    return { ok: d >= (cfg.minDistance ?? 2), distance: d };
  }
};

export function checkCondition(scene, cfg) {
  const fn = CONDITIONS[cfg.kind];
  if (!fn) return { ok: false };
  return fn(scene, cfg);
}
