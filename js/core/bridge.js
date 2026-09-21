// js/core/bridge.js
// 「図」と「式」を並べ、どちらかをタップすると対応する部分が両方光る画面。
//
// 見て終わりにしないための共通部品。第1弾（変位）と第2弾（相対速度）で同じ見た目にする。
// 生徒が第2弾で v_AB = v_B − v_A を見たとき、
// 「第1弾のあの画面と同じ形だ」と気づけることが大事なので、勝手に見た目を変えないこと。

import { WorldCanvas, svgEl } from './canvas.js';
import { Arrow } from './vector.js';
import { COLORS, CANVAS, VECTOR_STYLES } from '../../data/config.js';

const NS = 'http://www.w3.org/2000/svg';
const FS = 0.38;                 // 図の中の文字サイズ（マス単位。地点名のラベルと揃える）

export class SymbolBridge {
  /**
   * @param {HTMLElement} host
   * @param {{figLabel?:string, w:number, h:number}} opts
   */
  constructor(host, opts = {}) {
    host.innerHTML = '';
    this.root = document.createElement('div');
    this.root.className = 'bridge';

    this.figWrap = document.createElement('div');
    this.figWrap.className = 'bridge-fig pane pane-ground';
    this.figWrap.innerHTML = `<div class="pane-label">${opts.figLabel || '矢印で見ると'}</div>`;
    const figHost = document.createElement('div');
    figHost.className = 'pane-canvas';
    this.figWrap.appendChild(figHost);

    this.panel = document.createElement('div');
    this.panel.className = 'bridge-formula';

    this.root.append(this.figWrap, this.panel);
    host.appendChild(this.root);

    this.canvas = new WorldCanvas(figHost, { w: opts.w, h: opts.h });
    this.items = {};          // id -> {arrow, text, color}
    this.termEls = {};
    this.lit = null;
    this._cleanup = [];
  }

  /* ---------- 図 ---------- */

  /**
   * 矢印1本とその添字ラベル。ラベルは矢印に重ねない。
   * @param {string} id      式の項と対応させるキー
   * @param {{x,y}} from
   * @param {{x,y}} to
   * @param {string} styleName  VECTOR_STYLES のキー
   * @param {{main:string, sub?:string, tail?:string, at:{x,y}, anchor?:string,
   *          styleOverride?:object}} label
   */
  arrow(id, from, to, styleName, label = {}) {
    const style = label.styleOverride || VECTOR_STYLES[styleName] || VECTOR_STYLES.velocity;
    const a = new Arrow(this.canvas, 'static', styleName, {
      styleOverride: style, interactive: true, hitWidth: 0.95
    });
    a.set(from, to);
    a.hit.style.cursor = 'pointer';
    const s = this.canvas.toScreen(label.at || { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 });
    const t = this._subText(this.canvas.layers.labels, label.main || '', label.sub || '', label.tail || '', {
      x: s.x, y: s.y, 'font-size': FS, fill: style.color,
      'text-anchor': label.anchor || 'middle'
    }, label.over);
    this.items[id] = { arrow: a, text: t, color: style.color };
    const on = () => this.setLit(id);
    a.hit.addEventListener('click', on);
    this._cleanup.push(() => a.hit.removeEventListener('click', on));
    return a;
  }

  guide(a, b) { return this.canvas.drawGuideLine(a, b); }
  point(pt, opts) { return this.canvas.drawPoint(pt, { layer: 'points', ...opts }); }

  /** 添字つきの文字（v と AB のような）。over:true でベクトルの上矢印を付ける。 */
  _subText(parent, main, sub, tail, attrs, over) {
    const t = document.createElementNS(NS, 'text');
    for (const [k, v] of Object.entries(attrs)) t.setAttribute(k, v);
    t.setAttribute('paint-order', 'stroke');
    t.setAttribute('stroke', COLORS.bg);
    t.setAttribute('stroke-width', 0.14);
    t.setAttribute('stroke-linejoin', 'round');
    t.setAttribute('pointer-events', 'none');
    const a = document.createElementNS(NS, 'tspan'); a.textContent = main; t.appendChild(a);
    if (sub) {
      const b = document.createElementNS(NS, 'tspan');
      b.setAttribute('font-size', FS * 0.68);
      b.setAttribute('dy', FS * 0.22);
      b.textContent = sub;
      t.appendChild(b);
    }
    if (tail) {
      const c = document.createElementNS(NS, 'tspan');
      if (sub) c.setAttribute('dy', -FS * 0.22);
      c.textContent = tail;
      t.appendChild(c);
    }
    parent.appendChild(t);
    if (over) this._overArrow(parent, t, attrs.fill);
    return t;
  }

  /** 文字の上に引くベクトルの矢印（→AB の横棒と穂先） */
  _overArrow(parent, textEl, color) {
    // 矢印は「文字そのもの」の上だけに引く。添字（駅・公園・bef・aft）までは覆わない。
    let bb;
    try {
      const head = textEl.firstChild;
      bb = (head && typeof head.getBBox === 'function') ? head.getBBox() : textEl.getBBox();
      if (!bb || !bb.width) bb = textEl.getBBox();
    } catch (e) {
      try { bb = textEl.getBBox(); } catch (e2) { return null; }
    }
    const g = svgEl('g', { class: 'vec-over', 'pointer-events': 'none' }, parent);
    const y = bb.y - 0.04;
    const x1 = bb.x, x2 = bb.x + bb.width;
    svgEl('line', { x1, y1: y, x2: x2 - 0.09, y2: y, stroke: color, 'stroke-width': 0.045 }, g);
    svgEl('path', {
      d: `M ${x2} ${y} L ${x2 - 0.14} ${y - 0.07} L ${x2 - 0.14} ${y + 0.07} Z`, fill: color
    }, g);
    textEl._over = g;
    return g;
  }

  /* ---------- 式 ---------- */

  /**
   * @param {Array<{id?:string, main?:string, sub?:string, op?:string}>} parts
   *   id があればタップできる項、op なら記号（＝ や −）。
   */
  setFormula(parts) {
    const line = document.createElement('div');
    line.className = 'formula-line';
    for (const p of parts) {
      if (p.op) {
        const e = document.createElement('span');
        e.textContent = p.op;
        line.appendChild(e);
        continue;
      }
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'term';
      b.dataset.term = p.id;
      const body = p.sub ? `${p.main}<sub>${p.sub}</sub>` : p.main;
      b.innerHTML = p.over ? `<span class="vec">${body}</span>` : body;
      const on = () => this.setLit(p.id);
      b.addEventListener('click', on);
      this._cleanup.push(() => b.removeEventListener('click', on));
      this.termEls[p.id] = b;
      line.appendChild(b);
    }
    this.panel.appendChild(line);
    return line;
  }

  /** @param {Array<{id:string, tex:string, label:string, color?:string}>} items */
  setLegend(items) {
    const box = document.createElement('div');
    box.className = 'term-legend';
    for (const it of items) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.legend = it.id;
      const color = it.color || (this.items[it.id] && this.items[it.id].color) || COLORS.velocity;
      b.innerHTML = `<span class="term-swatch" style="border-top-color:${color}"></span>${it.tex}：${it.label}`;
      const on = () => this.setLit(it.id);
      b.addEventListener('click', on);
      this._cleanup.push(() => b.removeEventListener('click', on));
      box.appendChild(b);
    }
    this.panel.appendChild(box);
    return box;
  }

  /** ひとつ光らせる（同じものをもう一度呼ぶと消える） */
  setLit(id) {
    this.lit = (this.lit === id) ? null : id;
    for (const [k, it] of Object.entries(this.items)) {
      const on = (this.lit === k);
      it.arrow.g.classList.toggle('is-lit', on);
      it.arrow.setOpacity(!this.lit || on ? 1 : 0.28);
      const o = (!this.lit || on) ? 1 : 0.28;
      it.text.setAttribute('opacity', o);
      if (it.text._over) it.text._over.setAttribute('opacity', o);
    }
    for (const [k, el] of Object.entries(this.termEls)) el.classList.toggle('is-lit', this.lit === k);
    this.panel.querySelectorAll('[data-legend]').forEach(el =>
      el.classList.toggle('is-lit', el.dataset.legend === this.lit));
  }

  /**
   * 図の中の文字が重なっていたらずらす。矢印と地点名を置き終えたあとに1回呼ぶ。
   * 位置を決め打ちで調整するより、描いたあとに実測してほどくほうが確実。
   */
  tidy() {
    const layers = this.canvas.layers;
    const els = [...layers.points.querySelectorAll('text'), ...layers.labels.querySelectorAll('text')];
    if (els.length < 2) return;
    const h = this.canvas.h;
    const bb = (e) => { try { return e.getBBox(); } catch (err) { return null; } };
    const boxes = els.map(bb);
    for (let i = 1; i < els.length; i++) {
      if (!boxes[i]) continue;
      for (let pass = 0; pass < 4; pass++) {
        let moved = false;
        for (let j = 0; j < i; j++) {
          const a = boxes[j], b = boxes[i];
          if (!a || !b) continue;
          const ox = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
          const oy = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
          if (ox <= 0.02 || oy <= 0.02) continue;
          const y0 = Number(els[i].getAttribute('y'));
          let dy = (a.y + a.height) - b.y + 0.12;
          if (y0 + dy > h - 0.15) dy = a.y - (b.y + b.height) - 0.12;
          if (y0 + dy < 0.5) break;
          els[i].setAttribute('y', y0 + dy);
          if (els[i]._over) {                    // 上矢印も一緒に動かす
            const g = els[i]._over;
            g.setAttribute('transform', `translate(0 ${(Number(g.dataset.dy || 0) + dy)})`);
            g.dataset.dy = Number(g.dataset.dy || 0) + dy;
          }
          boxes[i] = { x: b.x, y: b.y + dy, width: b.width, height: b.height };
          moved = true;
          break;
        }
        if (!moved) break;
      }
    }
  }

  /** 右側の欄に自由な要素を足す（学習ログなど） */
  append(el) { this.panel.appendChild(el); return el; }

  destroy() {
    this._cleanup.forEach(fn => { try { fn(); } catch (e) {} });
    this._cleanup = [];
    if (this.canvas) this.canvas.destroy();
    this.items = {}; this.termEls = {};
    if (this.root) this.root.remove();
  }
}
