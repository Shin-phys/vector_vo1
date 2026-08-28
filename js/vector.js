// js/vector.js
// 矢印の生成・ドラッグ・スナップ・判定と、宣言的な「シーン」（点と矢印の集合）の管理。
// 束縛ベクトル（錠前つき）のスナップバック挙動もここに実装する。

import { svgEl } from './canvas.js';
import { VECTOR_STYLES, COLORS, JUDGE, CANVAS } from '../data/config.js';

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

/** 成分と大きさの日本語表記 */
export function describe(vec, unit = '') {
  const dx = Math.round(vec.x * 100) / 100;
  const dy = Math.round(vec.y * 100) / 100;
  const ew = dx === 0 ? '' : (dx > 0 ? `東へ ${Math.abs(dx)}` : `西へ ${Math.abs(dx)}`);
  const ns = dy === 0 ? '' : (dy > 0 ? `北へ ${Math.abs(dy)}` : `南へ ${Math.abs(dy)}`);
  const parts = [ew, ns].filter(Boolean);
  const mag = Math.round(V.len(vec) * 100) / 100;
  return {
    components: `(${dx}, ${dy})`,
    words: parts.length ? parts.join('、') : '移動なし',
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

/* ---------- 作図ツール（ドラッグで矢印を1本描く） ---------- */
export class DrawTool {
  /**
   * @param {GridCanvas} canvas
   * @param {{profile:object, styleName:string, onPreview:Function, onComplete:Function, onStart:Function}} opts
   */
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.opts = opts;
    this.profile = opts.profile || { touchOffsetY: 0, magnifier: false };
    this.arrow = null;
    this.cross = null;
    this.active = false;
    this._down = this._onDown.bind(this);
    this._move = this._onMove.bind(this);
    this._up = this._onUp.bind(this);
    canvas.svg.addEventListener('pointerdown', this._down);
  }

  _pt(ev) {
    const offY = (ev.pointerType === 'touch') ? this.profile.touchOffsetY : 0;
    const raw = this.canvas.fromClient(ev.clientX, ev.clientY - offY);
    return this.canvas.snap(raw);
  }

  _onDown(ev) {
    if (this.disabled) return;
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
    this._emitPreview(null, null);
  }

  destroy() {
    this.clear();
    if (this.cross) this.cross.remove();
    this.canvas.svg.removeEventListener('pointerdown', this._down);
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
