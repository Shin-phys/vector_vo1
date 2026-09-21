// js/relative/scenes/scene4-symbol.js
// シーン4｜記号へ渡す（4分）。このアプリで最も重要なシーン。
//
// 見て終わりにしない。視覚的な理解は、記号に橋渡ししないとテストで再現されない。
// 画面の作りは core/bridge.js（第1弾の「記号へ」と共通）。
// 生徒が「第1弾のあの画面と同じ形だ」と気づけることが大事なので、見た目は変えないこと。

import { SymbolBridge } from '../../core/bridge.js';
import { createWorld, velocityText, len } from '../world.js';
import { symbolScene } from '../../../data/problems-relative.js';
import { RELATIVE_STYLES } from '../../../data/config.js';

let bridge = null;

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
    const span = Math.max(len(vA), len(vB), len(vAB));

    ui.setScale('速度の矢印は 1マス ＝ 10 m/s');
    ui.setPrompt(symbolScene.prompt, { badge: '記号へ' });

    bridge = is1d
      ? new SymbolBridge(host, { w: 12, h: 7 })
      : new SymbolBridge(host, { w: Math.max(10, Math.ceil(span) + 4), h: Math.max(10, Math.ceil(span) + 4) });

    if (is1d) {
      // 直線上：重なって見えないよう平行にずらし、差は「先端から先端へ」で示す
      const x0 = 4.6, yB = 5.3, yA = 1.7, yR = 3.5;
      const tipA = x0 + vA.x, tipB = x0 + vB.x;
      bridge.arrow('vB', { x: x0, y: yB }, { x: tipB, y: yB }, 'velocity',
        { main: 'v', sub: 'B', tail: ` ＝ ${velocityText(w, vB)}`, at: { x: x0 - 0.35, y: yB - 0.12 }, anchor: 'end' });
      bridge.arrow('vA', { x: x0, y: yA }, { x: tipA, y: yA }, 'velocity',
        { main: 'v', sub: 'A', tail: ` ＝ ${velocityText(w, vA)}`, at: { x: x0 - 0.35, y: yA - 0.12 }, anchor: 'end' });
      bridge.guide({ x: tipA, y: yA }, { x: tipA, y: yR });
      bridge.guide({ x: tipB, y: yB }, { x: tipB, y: yR });
      bridge.arrow('vAB', { x: tipA, y: yR }, { x: tipB, y: yR }, 'resultant',
        { styleOverride: RELATIVE_STYLES.relative, main: 'v', sub: 'AB',
          tail: ` ＝ ${velocityText(w, vAB)}`, at: { x: (tipA + tipB) / 2, y: yR + 0.55 } });
    } else {
      // 平面：同じ点から v_A, v_B を描き、A の先端から B の先端へが差
      const O = { x: 2.5, y: 2.5 };
      const tipA = { x: O.x + vA.x, y: O.y + vA.y };
      const tipB = { x: O.x + vB.x, y: O.y + vB.y };
      bridge.arrow('vA', O, tipA, 'velocity', { main: 'v', sub: 'A', at: { x: tipA.x + 0.55, y: tipA.y - 0.15 }, anchor: 'start' });
      bridge.arrow('vB', O, tipB, 'velocity', { main: 'v', sub: 'B', at: { x: tipB.x + 0.55, y: tipB.y - 0.15 }, anchor: 'start' });
      bridge.arrow('vAB', tipA, tipB, 'resultant',
        { styleOverride: RELATIVE_STYLES.relative, main: 'v', sub: 'AB',
          at: { x: (tipA.x + tipB.x) / 2, y: (tipA.y + tipB.y) / 2 + 0.6 } });
      bridge.point(O, { label: '同じ点から', labelDx: 0.1, labelDy: -0.85 });
    }

    bridge.tidy();

    bridge.setFormula([
      { id: 'vAB', main: 'v', sub: 'AB' }, { op: '＝' },
      { id: 'vB', main: 'v', sub: 'B' }, { op: '−' },
      { id: 'vA', main: 'v', sub: 'A' }
    ]);
    bridge.setLegend(symbolScene.terms.map(t => ({ id: t.id, tex: t.tex, label: t.label })));

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
    const showLog = () => {
      if (bridge.panel.querySelector('.logbox')) return;
      const pre = document.createElement('div');
      pre.className = 'logbox';
      pre.textContent = ctx.store.buildLog();
      bridge.append(pre);
    };
    const settle = (ok, text) => {
      solved = true;
      ctx.store.recordQuiz('symbol', ok, `${input.value} ${dir === 'east' ? '+x' : '−x'}`);
      ui.feedback(text, ok ? 'correct' : 'wrong');
      bridge.setLit('vAB');
      ui.setActionState('check', { disabled: true });
      ui.setActionState('next', { disabled: false });
      showLog();
    };
    const check = () => {
      if (solved) return;
      tries++;
      const v = Number(input.value);
      const ok = Math.abs(v - q.answerValue) < 1e-6 && dir === q.answerDirection;
      if (ok) settle(true, `${q.explain}　図の <b>v<sub>AB</sub></b> の矢印も、ちょうど1マス分です。`);
      else if (tries >= 3) settle(false, q.explain);
      else ui.feedback(Math.abs(v - q.answerValue) < 1e-6
        ? '大きさは合っています。向きをもう一度考えよう（引き算の符号は＋？−？）。'
        : '式に当てはめてみよう。v<sub>AB</sub> ＝ v<sub>B</sub> − v<sub>A</sub> です。', 'wrong');
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
    if (bridge) { bridge.destroy(); bridge = null; }
  }
};
