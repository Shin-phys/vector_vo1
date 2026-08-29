// js/steps/step6-symbol.js
// ⑤の後の「記号へ」。日本語で理解したことを、記号に橋渡しする。
//
// 画面の作りは core/bridge.js（第2弾シーン4と共通）。
// 生徒が第2弾で v_AB = v_B − v_A を見たとき「あのときと同じ形だ」と気づけることが
// このステップの目的なので、見た目を第2弾と変えないこと。

import { SymbolBridge } from '../core/bridge.js';
import { VECTOR_STYLES } from '../../data/config.js';

let bridge = null;

export default {
  id: 'step6',
  label: '⑥',

  async mount(root, ctx) {
    this._ctx = ctx;
    const ui = ctx.ui;
    const p = ctx.problems;
    const O = p.origin;
    const st = p.places.find(x => x.id === 'station');
    const pk = p.places.find(x => x.id === 'park');

    document.body.classList.add('layout-bridge');   // 図と式を横に並べるため1カラムに
    ui.showCanvas(true);
    ui.setScale(p.scaleLabel);
    ui.setPrompt(p.prompt, { badge: '記号へ' });

    bridge = new SymbolBridge(ui.el.canvasHost, { w: 10, h: 10, figLabel: '矢印で見ると' });

    // 位置ベクトル（基準 O から）と、その先端どうしを結ぶ変位
    bridge.arrow('rStation', O, st, 'position',
      { main: 'r', sub: '駅', at: { x: (O.x + st.x) / 2 + 0.2, y: (O.y + st.y) / 2 - 0.6 } });
    bridge.arrow('rPark', O, pk, 'position',
      { main: 'r', sub: '公園', at: { x: (O.x + pk.x) / 2 - 0.55, y: (O.y + pk.y) / 2 + 0.45 } });
    bridge.arrow('disp', st, pk, 'resultant',
      { styleOverride: { ...VECTOR_STYLES.resultant, color: VECTOR_STYLES.displacement.color },
        main: '駅公園', over: true,
        at: { x: (st.x + pk.x) / 2, y: (st.y + pk.y) / 2 + 0.7 } });

    bridge.point(O, { label: O.label, role: 'origin' });
    bridge.point(st, { label: st.label });
    bridge.point(pk, { label: pk.label });

    bridge.tidy();

    bridge.setFormula([
      { id: 'disp', main: '駅公園', over: true }, { op: '＝' },
      { id: 'rPark', main: 'r', sub: '公園' }, { op: '−' },
      { id: 'rStation', main: 'r', sub: '駅' }
    ]);
    bridge.setLegend(p.terms);

    const rule = document.createElement('p');
    rule.className = 'bridge-rule';
    rule.innerHTML = p.rule;
    bridge.append(rule);

    /* ---- 問1：式の順（後 − 前） ---- */
    const q1 = p.quizOrder;
    let attempts = 0;
    const list = ui.renderChoice(q1, (i, opt, btn) => {
      attempts++;
      if (i === q1.correct) {
        btn.classList.add('is-correct');
        [...list.children].forEach(c => c.disabled = true);
        ctx.storage.recordAttempt('step6', 'order', true);
        ui.feedback(q1.explain, 'correct');
        setTimeout(askValue, 1500);
      } else {
        btn.classList.add('is-wrong'); btn.disabled = true;
        if (attempts >= 2) {
          ctx.storage.recordAttempt('step6', 'order', false);
          [...list.children].forEach(c => c.disabled = true);
          list.children[q1.correct].classList.add('is-correct');
          ui.feedback(q1.explain, 'wrong');
          setTimeout(askValue, 2400);
        } else {
          ui.feedback(opt.feedback || 'もう一度、出発と到着はどちらか考えよう。', 'wrong');
        }
      }
    });
    ui.feedback('まず、いまの図と式を見比べてから答えよう。', 'info');

    /* ---- 問2：成分（数値で確かめる） ---- */
    const q2 = p.quizValue;
    let solved = false;
    const askValue = () => {
      const box = ui.el.interact;
      box.style.display = '';
      box.innerHTML = `<p class="choice-question">${q2.question}</p>`;
      const row = document.createElement('div');
      row.className = 'numeric';
      const ix = document.createElement('input');
      const iy = document.createElement('input');
      for (const el of [ix, iy]) { el.type = 'number'; el.inputMode = 'numeric'; el.step = '1'; el.placeholder = '?'; }
      const s1 = document.createElement('span'); s1.className = 'unit'; s1.textContent = '（東西';
      const s2 = document.createElement('span'); s2.className = 'unit'; s2.textContent = '、南北';
      const s3 = document.createElement('span'); s3.className = 'unit'; s3.textContent = '）km';
      row.append(s1, ix, s2, iy, s3);
      box.appendChild(row);
      const gate = () => ui.setActionState('check', { disabled: !(ix.value !== '' && iy.value !== '') });
      ix.addEventListener('input', gate); iy.addEventListener('input', gate);
      let tries = 0;
      const settle = (ok) => {
        solved = true;
        ctx.storage.recordAttempt('step6', 'value', ok);
        ui.feedback(q2.explain, ok ? 'correct' : 'wrong');
        bridge.setLit('disp');
        ui.setActionState('check', { disabled: true });
        ui.setActionState('next', { disabled: false });
      };
      ui.actions([
        { id: 'check', label: '判定する', variant: 'primary', disabled: true, onClick: () => {
            if (solved) return;
            tries++;
            const ok = Number(ix.value) === q2.answer.x && Number(iy.value) === q2.answer.y;
            if (ok) settle(true);
            else if (tries >= 3) settle(false);
            else ui.feedback('r<sub>公園</sub> − r<sub>駅</sub> を、成分ごとに引いてみよう。西は −、南は − です。', 'wrong');
          } },
        { id: 'next', label: '次へ', disabled: true, onClick: () => ctx.complete(true) }
      ]);
      gate();
    };

    ui.actions([{ id: 'next', label: '次へ', disabled: true, onClick: () => ctx.complete(true) }]);
  },

  unmount() {
    document.body.classList.remove('layout-bridge');
    if (this._ctx) this._ctx.ui.stopHints();
    if (bridge) { bridge.destroy(); bridge = null; }
  }
};
