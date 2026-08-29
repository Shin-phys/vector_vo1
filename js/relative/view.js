// js/relative/view.js
// 1つのビューを描画する。world と camera（frame）を受け取って SVG を描くだけ。
// 運動の計算も基準系の判断もここではしない。

import { GridCanvas, svgEl } from '../core/canvas.js';
import { Arrow } from '../core/vector.js';
import { COLORS, CANVAS, VECTOR_STYLES, RELATIVE_STYLES } from '../../data/config.js';
import { transform, applyOffset, frameLabel } from './camera.js';
import { add, len, isZero, velocityText } from './world.js';

/* =========================================================================
   WorldCanvas：GridCanvas を横長（w×h）と「流れる方眼」に拡張したもの。
   core/vector.js の Arrow / DrawTool がそのまま使えるよう、
   toScreen / fromClient / snap / layers / pxToUnits の約束は変えない。
   ========================================================================= */
export class WorldCanvas extends GridCanvas {
  constructor(host, opts = {}) {
    super(host, { gridSize: opts.w || 10 });
    this.w = opts.w || 10;
    this.h = opts.h || 10;
    this.gridSize = this.w;
    this.gridOffset = { x: 0, y: 0 };
    this._initClip();
    this.setExtent(this.w, this.h);
  }

  /** 観測者系では背景が流れるので、枠からはみ出したものは切り落とす。 */
  _initClip() {
    const id = 'wc-clip-' + Math.random().toString(36).slice(2, 9);
    const defs = svgEl('defs', {}, this.svg);
    this._clipRect = svgEl('rect', { x: 0, y: 0, width: 1, height: 1 },
      svgEl('clipPath', { id }, defs));
    for (const [name, g] of Object.entries(this.layers)) {
      if (name === 'grid') continue;            // 方眼は自前で範囲内だけ描く
      g.setAttribute('clip-path', `url(#${id})`);
    }
  }

  setExtent(w, h) {
    this.w = w; this.h = h; this.gridSize = w;
    const p = CANVAS.pad;
    this.svg.setAttribute('viewBox', `${-p} ${-p} ${w + p * 2} ${h + p * 2}`);
    this.wrap.style.aspectRatio = `${w + p * 2} / ${h + p * 2}`;
    if (this._clipRect) { this._clipRect.setAttribute('width', w); this._clipRect.setAttribute('height', h); }
    this.drawGrid();
  }

  setGridSize() { /* 正方形前提の親の実装は使わない */ }

  setGridOffset(off) {
    this.gridOffset = { x: off.x, y: off.y };
    this.drawGrid();
  }

  toScreen(pt) { return { x: pt.x, y: this.h - pt.y }; }

  fromClient(clientX, clientY) {
    const ctm = this.svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = this.svg.createSVGPoint();
    p.x = clientX; p.y = clientY;
    const q = p.matrixTransform(ctm.inverse());
    return { x: q.x, y: this.h - q.y };
  }

  pxToUnits(px) {
    const rect = this.svg.getBoundingClientRect();
    const span = this.w + CANVAS.pad * 2;
    if (!rect.width) return 0;
    return px * span / rect.width;
  }

  snap(pt) {
    return {
      x: Math.max(0, Math.min(this.w, Math.round(pt.x))),
      y: Math.max(0, Math.min(this.h, Math.round(pt.y)))
    };
  }

  clamp(v) { return Math.max(0, Math.min(this.w, v)); }

  /** 方眼。gridOffset のぶんだけ位相をずらして描く＝背景が流れる。 */
  drawGrid() {
    if (this.w == null) return;              // 親コンストラクタからの呼び出しを無視
    const g = this.layers.grid;
    g.innerHTML = '';
    const w = this.w, h = this.h;
    const off = this.gridOffset || { x: 0, y: 0 };
    svgEl('rect', { x: 0, y: 0, width: w, height: h, fill: COLORS.bg }, g);

    // 縦線：世界座標 x=k を、画面 x = k + off.x に描く
    let k = Math.ceil(-off.x);
    for (; k + off.x <= w + 1e-9; k++) {
      const sx = k + off.x;
      if (sx < -1e-9) continue;
      const major = ((k % 5) + 5) % 5 === 0;
      svgEl('line', {
        x1: sx, y1: 0, x2: sx, y2: h,
        stroke: major ? COLORS.gridMajor : COLORS.grid,
        'stroke-width': major ? 0.035 : 0.02
      }, g);
    }
    // 横線：世界座標 y=k を、画面 y = h - (k + off.y) に描く
    let j = Math.ceil(-off.y);
    for (; j + off.y <= h + 1e-9; j++) {
      const sy = h - (j + off.y);
      if (sy < -1e-9 || sy > h + 1e-9) continue;
      const major = ((j % 5) + 5) % 5 === 0;
      svgEl('line', {
        x1: 0, y1: sy, x2: w, y2: sy,
        stroke: major ? COLORS.gridMajor : COLORS.grid,
        'stroke-width': major ? 0.035 : 0.02
      }, g);
    }
    svgEl('rect', { x: 0, y: 0, width: w, height: h, fill: 'none', stroke: COLORS.axis, 'stroke-width': 0.04 }, g);
  }
}

/* =========================================================================
   WorldView：ラベル付きの1画面。
   ========================================================================= */
export class WorldView {
  /**
   * @param {HTMLElement} host
   * @param {{world:object, frame:string, label?:string, showVectors?:boolean,
   *          profile?:object, tone?:'ground'|'observer'}} opts
   */
  constructor(host, opts = {}) {
    this.world = opts.world;
    this.frame = opts.frame || 'ground';
    this.profile = opts.profile || { minHitSize: 32, touchOffsetY: 0, magnifier: false };
    this._showVectors = opts.showVectors !== false;
    this.offsetOverride = null;
    this.extras = [];                 // 予測矢印など、あとから重ねるもの

    this.root = document.createElement('div');
    this.root.className = 'pane';
    if (opts.tone) this.root.classList.add('pane-' + opts.tone);

    this.labelEl = document.createElement('div');
    this.labelEl.className = 'pane-label';
    this.labelEl.textContent = opts.label || '';
    this.root.appendChild(this.labelEl);

    this.canvasHost = document.createElement('div');
    this.canvasHost.className = 'pane-canvas';
    this.root.appendChild(this.canvasHost);
    host.appendChild(this.root);

    const g = this.world.grid;
    this.canvas = new WorldCanvas(this.canvasHost, { w: g.w, h: g.h });
    this.render();
  }

  setLabel(text) { this.labelEl.textContent = text; }
  setWorld(world) { this.world = world; this.render(); }
  setFrame(frame) { this.frame = frame; this.offsetOverride = null; this.render(); }
  setOffsetOverride(off, frame) { this.offsetOverride = off; if (frame) this.frame = frame; this.render(); }
  showVectors(on) { this._showVectors = !!on; this.render(); }

  /** 現在のカメラ適用後の world（シーン側が数値を読むのに使う） */
  get camWorld() {
    return this.offsetOverride
      ? applyOffset(this.world, this.offsetOverride, this.frame)
      : transform(this.world, this.frame);
  }

  /** 予測矢印などを重ねる。{from:{x,y}, to:{x,y}, style, label, space:'world'|'screen'} */
  setExtras(list) { this.extras = list || []; this.render(); }

  render() {
    const cam = this.camWorld;
    const A = cam.anchor || { x: 0, y: 0 };
    const c = this.canvas;
    // 背景の位相 ＝ gridOffset ＋ anchor（地面に固定されたものは全部これで動く）
    c.setGridOffset(add(cam.gridOffset || { x: 0, y: 0 }, A));
    c.clear('guide', 'static', 'dynamic', 'points', 'labels', 'overlay');

    const toView = (p) => add(p, A);

    // ---- 道路（1d のとき。地面に固定） ----
    if (cam.road) {
      const y0 = cam.road.y0 + cam.gridOffset.y + A.y;
      const y1 = cam.road.y1 + cam.gridOffset.y + A.y;
      const top = c.toScreen({ x: 0, y: y1 }), bot = c.toScreen({ x: 0, y: y0 });
      svgEl('rect', {
        x: 0, y: top.y, width: c.w, height: Math.max(0, bot.y - top.y),
        fill: '#eef1f4', stroke: COLORS.axis, 'stroke-width': 0.03
      }, c.layers.guide);
      // センターライン（白破線）：これも地面に固定なので一緒に流れる
      const mid = c.toScreen({ x: 0, y: (y0 + y1) / 2 });
      svgEl('line', {
        x1: 0, y1: mid.y, x2: c.w, y2: mid.y,
        stroke: '#ffffff', 'stroke-width': 0.12, 'stroke-dasharray': '0.8 0.6',
        'stroke-dashoffset': -(cam.gridOffset.x + A.x)
      }, c.layers.guide);
    }

    // ---- 目印（樹木など。地面に固定＝観測者系では流れる） ----
    for (const lm of (cam.landmarks || [])) {
      this._drawLandmark(toView(lm.pos), lm);
    }

    // ---- 物体 ----
    for (const b of (cam.bodies || [])) {
      const p = toView(b.pos);
      this._drawBody(p, b, cam);
    }

    // ---- 速度ベクトル ----
    if (this._showVectors) {
      for (const b of (cam.bodies || [])) {
        const p = toView(b.pos);
        if (isZero(b.vel, 1e-6)) { this._drawZeroMark(p, b); continue; }
        const observed = cam.frame !== 'ground' && b.id !== cam.frame;
        const styleName = observed ? 'relative' : 'velocity';
        const style = observed ? RELATIVE_STYLES.relative : VECTOR_STYLES.velocity;
        const a = new Arrow(c, 'dynamic', styleName, { styleOverride: style });
        a.set(p, add(p, b.vel));
        // ラベルは矢印の中点の下。先端に置くと画面の端で切れてしまう。
        this._label({ x: p.x + b.vel.x / 2, y: p.y + b.vel.y / 2 }, velocityText(cam, b.vel), style.color, 0.62);
      }
    }

    // ---- 重ねもの（予測矢印など） ----
    for (const ex of this.extras) {
      const style = RELATIVE_STYLES[ex.style] || VECTOR_STYLES[ex.style] || RELATIVE_STYLES.predict;
      const a = new Arrow(c, 'overlay', ex.style || 'predict', { styleOverride: style });
      const from = ex.space === 'screen' ? ex.from : toView(ex.from);
      const to = ex.space === 'screen' ? ex.to : toView(ex.to);
      a.set(from, to);
      if (ex.label) this._label({ x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 }, ex.label, style.color, -0.45);
    }
  }

  _drawBody(p, b, cam) {
    const c = this.canvas;
    const s = c.toScreen(p);
    const color = b.color || COLORS.point;
    const g = svgEl('g', { class: 'body body-' + b.id }, c.layers.points);
    if (b.kind === 'car') {
      const w = 1.5, h = 0.62;
      svgEl('rect', { x: s.x - w / 2, y: s.y - h / 2, width: w, height: h, rx: 0.16, fill: color }, g);
      svgEl('rect', { x: s.x - w * 0.22, y: s.y - h * 0.95, width: w * 0.5, height: h * 0.55, rx: 0.1, fill: color, opacity: 0.75 }, g);
      svgEl('circle', { cx: s.x - w * 0.28, cy: s.y + h / 2, r: 0.16, fill: '#374151' }, g);
      svgEl('circle', { cx: s.x + w * 0.28, cy: s.y + h / 2, r: 0.16, fill: '#374151' }, g);
    } else if (b.kind === 'boat') {
      svgEl('path', { d: `M ${s.x - 0.7} ${s.y} L ${s.x + 0.7} ${s.y} L ${s.x + 0.45} ${s.y + 0.42} L ${s.x - 0.45} ${s.y + 0.42} Z`, fill: color }, g);
      svgEl('line', { x1: s.x, y1: s.y, x2: s.x, y2: s.y - 0.8, stroke: color, 'stroke-width': 0.08 }, g);
    } else {
      svgEl('circle', { cx: s.x, cy: s.y, r: 0.34, fill: color }, g);
    }
    // 観測者（基準になっている物体）は目立たせる
    if (cam.frame !== 'ground' && b.id === cam.frame) {
      svgEl('circle', { cx: s.x, cy: s.y, r: 1.05, fill: 'none', stroke: color, 'stroke-width': 0.06, 'stroke-dasharray': '0.2 0.16', opacity: 0.9 }, g);
    }
    const t = svgEl('text', {
      x: s.x, y: s.y - 0.95, 'font-size': CANVAS.fontSize * 1.05, fill: color,
      'text-anchor': 'middle', 'paint-order': 'stroke', stroke: COLORS.bg,
      'stroke-width': 0.16, 'stroke-linejoin': 'round'
    }, g);
    t.textContent = b.label || b.id;
    return g;
  }

  _drawZeroMark(p, b) {
    const c = this.canvas;
    const s = c.toScreen(p);
    const g = svgEl('g', {}, c.layers.dynamic);
    const t = svgEl('text', {
      x: s.x, y: s.y + 1.75, 'font-size': CANVAS.fontSize * 1.15,
      fill: COLORS.velocity, 'text-anchor': 'middle', 'paint-order': 'stroke',
      stroke: COLORS.bg, 'stroke-width': 0.18, 'stroke-linejoin': 'round'
    }, g);
    t.textContent = '速度 0（動いて見えない）';
    return g;
  }

  _drawLandmark(p, lm) {
    const c = this.canvas;
    const s = c.toScreen(p);
    const g = svgEl('g', { class: 'landmark' }, c.layers.static);
    if (lm.kind === 'sign') {
      svgEl('line', { x1: s.x, y1: s.y, x2: s.x, y2: s.y - 0.9, stroke: '#94a3b8', 'stroke-width': 0.09 }, g);
      svgEl('rect', { x: s.x - 0.34, y: s.y - 1.4, width: 0.68, height: 0.5, rx: 0.08, fill: '#cbd5e1' }, g);
    } else {   // tree
      svgEl('line', { x1: s.x, y1: s.y, x2: s.x, y2: s.y - 0.5, stroke: '#8a6d3b', 'stroke-width': 0.12 }, g);
      svgEl('circle', { cx: s.x, cy: s.y - 0.82, r: 0.46, fill: '#86b992' }, g);
    }
    return g;
  }

  _label(pt, text, color, dy) {
    const c = this.canvas;
    const s = c.toScreen(pt);
    const t = svgEl('text', {
      x: s.x, y: s.y + (dy ?? 0.55), 'font-size': CANVAS.fontSize,
      fill: color, 'text-anchor': 'middle', 'paint-order': 'stroke',
      stroke: COLORS.bg, 'stroke-width': 0.16, 'stroke-linejoin': 'round',
      'pointer-events': 'none'
    }, c.layers.labels);
    t.textContent = text;
    return t;
  }

  destroy() {
    this.canvas.destroy();
    this.root.remove();
  }
}

/* =========================================================================
   PaneGroup：二画面（スマホでは上下）をまとめて扱う。
   ========================================================================= */
export class PaneGroup {
  constructor(host) {
    host.innerHTML = '';
    this.el = document.createElement('div');
    this.el.className = 'pane-grid';
    host.appendChild(this.el);
    this.views = [];
  }
  add(opts) {
    const v = new WorldView(this.el, opts);
    this.views.push(v);
    return v;
  }
  setWorld(world) { this.views.forEach(v => v.setWorld(world)); }
  showVectors(on) { this.views.forEach(v => v.showVectors(on)); }
  single() { this.el.classList.add('is-single'); return this; }
  destroy() { this.views.forEach(v => v.destroy()); this.views = []; this.el.remove(); }
}

export { frameLabel };
