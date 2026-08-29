// js/relative/scenes/scene4-symbol.js
// シーン4｜記号へ渡す（4分）。このアプリで最も重要なシーン。
//
// 見て終わりにしない。視覚的な理解は、記号に橋渡ししないとテストで再現されない。
// 左に矢印の図、右に式 v_AB = v_B − v_A を並べ、
// どちらかをタップすると対応する部分が両方同時に光るようにする。

import { WorldCanvas } from '../view.js';
import { Arrow } from '../../core/vector.js';
import { createWorld, velocityText, len } from '../world.js';
import { symbolScene } from '../../../data/problems-relative.js';
import { COLORS, CANVAS, VECTOR_STYLES, RELATIVE_STYLES } from '../../../data/config.js';

let canvas = null, arrows = {}, cleanup = [];

export default {
  id: 'symbol',
  label: '式へ',

  async mount(host, ctx) {
    const { ui } = ctx;
    const p = ctx.problems[0];
    const w = createWorld(p);
    const obsId = p.observer || 'A';
    const A = w.bodies.find(b => b.id === obsId);
    const B = w.bodies.find(b => b.id !== obsId);
    const vA = A.vel, vB = B.vel;
    const vAB = { x: vB.x - vA.x, y: vB.y - vA.y };
    const is1d = w.dimension === '1d';

    ui.setScale('速度の矢印は 1マス ＝ 10 m/s');
    ui.setPrompt(symbolScene.prompt, { badge: '記号へ' });

    /* ---- 左：図　右：式 ---- */
    host.innerHTML = '';
    const bridge = document.createElement('div');
    bridge.className = 'bridge';
    const figWrap = document.createElement('div');
    figWrap.className = 'bridge-fig pane pane-ground';
    figWrap.innerHTML = '<div class="pane-label">矢印で見ると</div>';
    const figHost = document.createElement('div');
    figHost.className = 'pane-canvas';
    figWrap.appendChild(figHost);
    const formula = document.createElement('div');
    formula.className = 'bridge-formula';
    bridge.append(figWrap, formula);
    host.appendChild(bridge);

    /* ---- 図を描く ---- */
    // 記号の読みやすさを優先し、方眼は「速度の目盛」として使う。
    // ラベルは矢印に重ねず、外側に置く。
    const NS = 'http://www.w3.org/2000/svg';
    const FS = 0.30;                       // ラベルの文字サイズ（マス単位）

    const sub = (parent, main, sub_, extra) => {
      const t = document.createElementNS(NS, 'text');
      for (const [k, v] of Object.entries(extra)) t.setAttribute(k, v);
      t.setAttribute('paint-order', 'stroke');
      t.setAttribute('stroke', COLORS.bg);
      t.setAttribute('stroke-width', 0.14);
      t.setAttribute('stroke-linejoin', 'round');
      t.setAttribute('pointer-events', 'none');
      const a = document.createElementNS(NS, 'tspan');
      a.textContent = main;
      const b = document.createElementNS(NS, 'tspan');
      b.setAttribute('font-size', FS * 0.68);
      b.setAttribute('dy', FS * 0.22);
      b.textContent = sub_;
      t.append(a, b);
      if (extra.tail) {
        const c = document.createElementNS(NS, 'tspan');
        c.setAttribute('dy', -FS * 0.22);
        c.textContent = extra.tail;
        t.appendChild(c);
      }
      parent.appendChild(t);
      return t;
    };

    const span = Math.max(len(vA), len(vB), len(vAB));
    canvas = is1d
      ? new WorldCanvas(figHost, { w: 12, h: 7 })
      : new WorldCanvas(figHost, { w: Math.max(10, Math.ceil(span) * 2 + 4), h: Math.max(10, Math.ceil(span) * 2 + 4) });

    arrows = {};

    /** 矢印1本＋ラベル。ラベルは矢印と重ねない。 */
    const put = (key, from, to, styleName, main, subTxt, tail, labelAt) => {
      const style = styleName === 'relative' ? RELATIVE_STYLES.relative : VECTOR_STYLES.velocity;
      const a = new Arrow(canvas, 'static', styleName, {
        styleOverride: style, interactive: true, hitWidth: 0.95
      });
      a.set(from, to);
      a.hit.style.cursor = 'pointer';
      const s0 = canvas.toScreen(labelAt.at);
      const txt = sub(canvas.layers.labels, main, subTxt, {
        x: s0.x, y: s0.y, 'font-size': FS, fill: style.color,
        'text-anchor': labelAt.anchor || 'middle', tail
      });
      arrows[key] = { arrow: a, text: txt, color: style.color };
      const on = () => setLit(key);
      a.hit.addEventListener('click', on);
      cleanup.push(() => a.hit.removeEventListener('click', on));
      return a;
    };

    if (is1d) {
      // 直線上：重なって見えないよう平行にずらし、差は「先端から先端へ」で示す
      const x0 = 4.6, yB = 5.3, yA = 1.7, yR = 3.5;
      const tipA = x0 + vA.x, tipB = x0 + vB.x;
      put('vB', { x: x0, y: yB }, { x: tipB, y: yB }, 'velocity',
          'v', 'B', ` ＝ ${velocityText(w, vB)}`, { at: { x: x0 - 0.35, y: yB - 0.12 }, anchor: 'end' });
      put('vA', { x: x0, y: yA }, { x: tipA, y: yA }, 'velocity',
          'v', 'A', ` ＝ ${velocityText(w, vA)}`, { at: { x: x0 - 0.35, y: yA - 0.12 }, anchor: 'end' });
      canvas.drawGuideLine({ x: tipA, y: yA }, { x: tipA, y: yR });
      canvas.drawGuideLine({ x: tipB, y: yB }, { x: tipB, y: yR });
      put('vAB', { x: tipA, y: yR }, { x: tipB, y: yR }, 'relative',
          'v', 'AB', ` ＝ ${velocityText(w, vAB)}`, { at: { x: (tipA + tipB) / 2, y: yR + 0.55 } });
    } else {
      // 平面：同じ点から v_A, v_B を描き、A の先端から B の先端へが差
      const k = 1;                                   // 方眼の意味（1マス＝10 m/s）を崩さない
      const O2 = { x: 2.5, y: 2.5 };
      const tipA = { x: O2.x + vA.x * k, y: O2.y + vA.y * k };
      const tipB = { x: O2.x + vB.x * k, y: O2.y + vB.y * k };
      put('vA', O2, tipA, 'velocity', 'v', 'A', '', { at: { x: tipA.x + 0.55, y: tipA.y - 0.15 }, anchor: 'start' });
      put('vB', O2, tipB, 'velocity', 'v', 'B', '', { at: { x: tipB.x + 0.55, y: tipB.y - 0.15 }, anchor: 'start' });
      put('vAB', tipA, tipB, 'relative', 'v', 'AB', '',
          { at: { x: (tipA.x + tipB.x) / 2, y: (tipA.y + tipB.y) / 2 + 0.6 } });
      canvas.drawPoint(O2, { label: '同じ点から', layer: 'points', labelDx: 0.1, labelDy: -0.85 });
    }

    /* ---- 式 ---- */
    const line = document.createElement('div');
    line.className = 'formula-line';
    const termEls = {};
    const mk = (id, html) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'term';
      b.dataset.term = id;
      b.innerHTML = html;
      const on = () => setLit(id);
      b.addEventListener('click', on);
      cleanup.push(() => b.removeEventListener('click', on));
      termEls[id] = b;
      return b;
    };
    const plain = (s) => { const e = document.createElement('span'); e.textContent = s; return e; };
    line.append(mk('vAB', 'v<sub>AB</sub>'), plain('＝'), mk('vB', 'v<sub>B</sub>'), plain('−'), mk('vA', 'v<sub>A</sub>'));
    formula.appendChild(line);

    const legend = document.createElement('div');
    legend.className = 'term-legend';
    for (const t of symbolScene.terms) {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.legend = t.id;
      const color = t.id === 'vAB' ? RELATIVE_STYLES.relative.color : VECTOR_STYLES.velocity.color;
      b.innerHTML = `<span class="term-swatch" style="border-top-color:${color}"></span>${t.tex}：${t.label}`;
      const on = () => setLit(t.id);
      b.addEventListener('click', on);
      cleanup.push(() => b.removeEventListener('click', on));
      legend.appendChild(b);
    }
    formula.appendChild(legend);

    /* ---- 光らせる（矢印⇔式を同時に） ---- */
    let lit = null;
    function setLit(id) {
      lit = (lit === id) ? null : id;
      for (const [k, a] of Object.entries(arrows)) {
        const on = (lit === k);
        a.arrow.g.classList.toggle('is-lit', on);
        a.arrow.setOpacity(!lit || on ? 1 : 0.28);
        a.text.setAttribute('opacity', !lit || on ? 1 : 0.28);
      }
      for (const [k, el] of Object.entries(termEls)) el.classList.toggle('is-lit', lit === k);
      formula.querySelectorAll('[data-legend]').forEach(el =>
        el.classList.toggle('is-lit', el.dataset.legend === lit));
    }

    /* ---- 数値の問い ---- */
    const q = symbolScene.quiz;
    const box = ui.el.interact;
    box.style.display = '';
    const qLead = is1d ? '' : '<span class="q-note">（ここは直線上で考えます）</span><br>';
    box.innerHTML = `<p class="choice-question">${qLead}${q.question}</p>`;
    const row = document.createElement('div');
    row.className = 'numeric';
    const input = document.createElement('input');
    input.type = 'number'; input.inputMode = 'numeric'; input.step = '1'; input.placeholder = '?';
    const unit = document.createElement('span');
    unit.className = 'unit'; unit.textContent = q.unit;
    const dirs = document.createElement('div');
    dirs.className = 'dir-choice';
    let dir = null;
    for (const d of q.directions) {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = d.label; b.dataset.dir = d.id;
      b.addEventListener('click', () => {
        dir = d.id;
        dirs.querySelectorAll('button').forEach(x => x.classList.toggle('is-on', x.dataset.dir === dir));
        ui.setActionState('check', { disabled: !(input.value !== '' && dir) });
      });
      dirs.appendChild(b);
    }
    input.addEventListener('input', () =>
      ui.setActionState('check', { disabled: !(input.value !== '' && dir) }));
    row.append(input, unit, dirs);
    box.appendChild(row);

    let tries = 0, solved = false;
    const check = () => {
      if (solved) return;
      tries++;
      const v = Number(input.value);
      const ok = Math.abs(v - q.answerValue) < 1e-6 && dir === q.answerDirection;
      if (ok) {
        solved = true;
        ctx.store.recordQuiz('symbol', true, `${v} ${dir === 'east' ? '東' : '西'}`);
        ui.feedback(`${q.explain}　図の <b>v<sub>AB</sub></b> の矢印も、ちょうど1マス分です。`, 'correct');
        setLit('vAB');
        ui.setActionState('check', { disabled: true });
        ui.setActionState('next', { disabled: false });
        showLog();
      } else if (tries >= 3) {
        solved = true;
        ctx.store.recordQuiz('symbol', false, `${input.value} ${dir === 'east' ? '東' : '西'}`);
        ui.feedback(q.explain, 'wrong');
        setLit('vAB');
        ui.setActionState('check', { disabled: true });
        ui.setActionState('next', { disabled: false });
        showLog();
      } else {
        ui.feedback(Math.abs(v - q.answerValue) < 1e-6
          ? '大きさは合っています。向きをもう一度考えよう（引き算の符号は＋？−？）。'
          : '式に当てはめてみよう。v<sub>AB</sub> ＝ v<sub>B</sub> − v<sub>A</sub> です。', 'wrong');
      }
    };

    const showLog = () => {
      if (formula.querySelector('.logbox')) return;
      const pre = document.createElement('div');
      pre.className = 'logbox';
      pre.textContent = ctx.store.buildLog();
      formula.appendChild(pre);
    };

    ui.actions([
      { id: 'check', label: '判定する', variant: 'primary', disabled: true, onClick: check },
      { id: 'log', label: 'ログをコピー', onClick: () => { showLog(); ui.copy(ctx.store.buildLog()); } },
      { id: 'next', label: 'おわり', disabled: true, onClick: () => ctx.complete() }
    ]);

    ui.feedback('矢印か式をタップすると、対応する部分が両方光ります。', 'info');
    this._ctx = ctx;
  },

  onLayout() {},

  unmount() {
    cleanup.forEach(fn => { try { fn(); } catch (e) {} });
    cleanup = [];
    if (canvas) { canvas.destroy(); canvas = null; }
    arrows = {};
  }
};
