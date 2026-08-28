// js/canvas.js
// 方眼の描画と座標変換（論理座標 [0..gridSize] 左下原点 ⇔ 画面座標）を担当する。
// 描画そのものは素のSVG。矢印の生成は vector.js の役目。

import { COLORS, CANVAS, SNAP } from '../data/config.js';

const NS = 'http://www.w3.org/2000/svg';

export function svgEl(tag, attrs = {}, parent = null) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    el.setAttribute(k, String(v));
  }
  if (parent) parent.appendChild(el);
  return el;
}

export class GridCanvas {
  /**
   * @param {HTMLElement} host  SVGを差し込む親要素
   * @param {{gridSize:number, scaleLabel?:string}} opts
   */
  constructor(host, opts = {}) {
    this.host = host;
    this.gridSize = opts.gridSize || 10;
    this.scaleLabel = opts.scaleLabel || '';
    this.host.innerHTML = '';

    this.wrap = document.createElement('div');
    this.wrap.className = 'canvas-wrap';
    this.host.appendChild(this.wrap);

    this.svg = svgEl('svg', {
      class: 'grid-canvas',
      xmlns: NS,
      preserveAspectRatio: 'xMidYMid meet'
    }, this.wrap);
    this.svg.style.touchAction = 'none';   // ピンチズームでページが拡大しないように

    this.layers = {};
    for (const name of ['grid', 'guide', 'answer', 'static', 'dynamic', 'points', 'labels', 'overlay']) {
      this.layers[name] = svgEl('g', { class: 'layer layer-' + name }, this.svg);
    }
    this.setGridSize(this.gridSize);
  }

  setGridSize(n) {
    this.gridSize = n;
    const p = CANVAS.pad;
    this.svg.setAttribute('viewBox', `${-p} ${-p} ${n + p * 2} ${n + p * 2}`);
    this.drawGrid();
  }

  setScaleLabel(text) {
    this.scaleLabel = text || '';
  }

  /** 論理座標 → SVGユーザー座標（y反転） */
  toScreen(pt) { return { x: pt.x, y: this.gridSize - pt.y }; }

  /** 画面のクライアント座標 → 論理座標 */
  fromClient(clientX, clientY) {
    const ctm = this.svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = this.svg.createSVGPoint();
    p.x = clientX; p.y = clientY;
    const q = p.matrixTransform(ctm.inverse());
    return { x: q.x, y: this.gridSize - q.y };
  }

  /** ピクセル長 → 論理長 */
  pxToUnits(px) {
    const rect = this.svg.getBoundingClientRect();
    const span = this.gridSize + CANVAS.pad * 2;
    if (!rect.width) return 0;
    return px * span / rect.width;
  }

  snap(pt) {
    if (!SNAP.enabled) return { x: pt.x, y: pt.y };
    const s = SNAP.gridStep;
    return {
      x: this.clamp(Math.round(pt.x / s) * s),
      y: this.clamp(Math.round(pt.y / s) * s)
    };
  }

  clamp(v) { return Math.max(0, Math.min(this.gridSize, v)); }

  clear(...names) {
    const list = names.length ? names : Object.keys(this.layers);
    for (const n of list) {
      if (this.layers[n]) this.layers[n].innerHTML = '';
    }
  }

  drawGrid() {
    const g = this.layers.grid;
    g.innerHTML = '';
    const n = this.gridSize;
    svgEl('rect', { x: 0, y: 0, width: n, height: n, fill: COLORS.bg }, g);
    for (let i = 0; i <= n; i++) {
      const major = i % 5 === 0;
      const col = major ? COLORS.gridMajor : COLORS.grid;
      const w = major ? 0.035 : 0.02;
      svgEl('line', { x1: i, y1: 0, x2: i, y2: n, stroke: col, 'stroke-width': w }, g);
      svgEl('line', { x1: 0, y1: i, x2: n, y2: i, stroke: col, 'stroke-width': w }, g);
    }
    svgEl('rect', { x: 0, y: 0, width: n, height: n, fill: 'none', stroke: COLORS.axis, 'stroke-width': 0.04 }, g);
  }

  /** マウスホバーで格子点をハイライト（PC/タブレット用。呼び出し側で有効化） */
  enableHover() {
    if (this._hoverDot) return;
    const dot = svgEl('circle', { r: 0.16, fill: 'none', stroke: COLORS.velocity, 'stroke-width': 0.05, opacity: 0 }, this.layers.overlay);
    this._hoverDot = dot;
    this._hoverMove = (ev) => {
      if (ev.pointerType && ev.pointerType !== 'mouse') return;
      const p = this.snap(this.fromClient(ev.clientX, ev.clientY));
      const s = this.toScreen(p);
      dot.setAttribute('cx', s.x); dot.setAttribute('cy', s.y); dot.setAttribute('opacity', 1);
    };
    this._hoverLeave = () => dot.setAttribute('opacity', 0);
    this.svg.addEventListener('pointermove', this._hoverMove);
    this.svg.addEventListener('pointerleave', this._hoverLeave);
  }

  disableHover() {
    if (!this._hoverDot) return;
    this.svg.removeEventListener('pointermove', this._hoverMove);
    this.svg.removeEventListener('pointerleave', this._hoverLeave);
    this._hoverDot.remove();
    this._hoverDot = null;
  }

  /** 目印の点＋ラベル */
  drawPoint(pt, opts = {}) {
    const layer = opts.layer ? this.layers[opts.layer] : this.layers.points;
    const s = this.toScreen(pt);
    const g = svgEl('g', { class: 'pt' }, layer);
    const color = opts.color || (opts.role === 'origin' ? COLORS.origin : COLORS.point);
    svgEl('circle', { cx: s.x, cy: s.y, r: opts.r || CANVAS.pointRadius, fill: color }, g);
    if (opts.ring) {
      svgEl('circle', { cx: s.x, cy: s.y, r: (opts.r || CANVAS.pointRadius) * 2.1, fill: 'none', stroke: color, 'stroke-width': 0.045 }, g);
    }
    if (opts.label) {
      const t = svgEl('text', {
        x: s.x + (opts.labelDx ?? 0.22),
        y: s.y - (opts.labelDy ?? 0.24),
        'font-size': CANVAS.fontSize,
        fill: color,
        'paint-order': 'stroke',
        stroke: COLORS.bg,
        'stroke-width': 0.14,
        'stroke-linejoin': 'round'
      }, g);
      t.textContent = opts.label;
    }
    return g;
  }

  /** 錠前アイコン（束縛ベクトルの始点に置く） */
  drawLock(pt, opts = {}) {
    const s = this.toScreen(pt);
    const g = svgEl('g', { class: 'lock-icon', transform: `translate(${s.x - 0.42} ${s.y - 0.5})` }, opts.layer ? this.layers[opts.layer] : this.layers.overlay);
    const c = opts.color || COLORS.lock;
    svgEl('rect', { x: -0.02, y: 0.12, width: 0.42, height: 0.32, rx: 0.07, fill: c }, g);
    svgEl('path', { d: 'M 0.07 0.12 L 0.07 0.02 A 0.12 0.12 0 0 1 0.31 0.02 L 0.31 0.12', fill: 'none', stroke: c, 'stroke-width': 0.06 }, g);
    return g;
  }

  /** 補助線（薄いグレー点線） */
  drawGuideLine(a, b) {
    const p = this.toScreen(a), q = this.toScreen(b);
    return svgEl('line', {
      x1: p.x, y1: p.y, x2: q.x, y2: q.y,
      stroke: COLORS.guide, 'stroke-width': 0.05, 'stroke-dasharray': '0.12 0.16'
    }, this.layers.guide);
  }

  /** 拡大ビュー（ルーペ）。スマホでドラッグ中に先端まわりを表示する。 */
  showMagnifier(center) {
    if (!this._mag) {
      const box = document.createElement('div');
      box.className = 'magnifier';
      const svg = svgEl('svg', { xmlns: NS }, box);
      const use = svgEl('use', {}, svg);
      use.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '');
      this._mag = { box, svg, use };
      this.wrap.appendChild(box);
    }
    const z = CANVAS.magnifierZoom;
    const span = (this.gridSize + CANVAS.pad * 2) / (z * 2.2);
    const s = this.toScreen(center);
    this._mag.svg.setAttribute('viewBox', `${s.x - span / 2} ${s.y - span / 2} ${span} ${span}`);
    if (!this._magCloned) {
      this._mag.svg.innerHTML = '';
      this._magCloned = true;
    }
    // 現在の内容を複製して表示（軽量化のためドラッグ中のみ）
    this._mag.svg.innerHTML = this.svg.innerHTML;
    this._mag.box.style.display = 'block';
  }

  hideMagnifier() {
    if (this._mag) this._mag.box.style.display = 'none';
  }

  destroy() {
    this.disableHover();
    this.host.innerHTML = '';
  }
}
