// js/steps/step6-symbol.js
// ②.5b の後の「記号へ」。日本語で理解したことを、記号に橋渡しする。
// 変位の話が続いているうちに置く（速度に入る前）。
//
// 画面の作りは core/bridge.js（第2弾シーン4と共通）。
// 生徒が第2弾で v_AB = v_B − v_A を見たとき「あのときと同じ形だ」と気づけることが
// このステップの目的なので、見た目を第2弾と変えないこと。

import { SymbolBridge } from '../core/bridge.js';
import { VECTOR_STYLES } from '../../data/config.js';

let bridge = null;

export default {
  id: 'step6',
  label: '記号',

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
      // 向きはボタン、大きさは数値。スマホの数字キーボードにはマイナスが無く、
      // 符号を打たせると入力できない。向きを選ばせるほうが物理としても自然。
      let dirX = null, dirY = null;
      const gate = () => ui.setActionState('check', {
        disabled: !(ix.value !== '' && iy.value !== '' && dirX && dirY)
      });
      const mkAxis = (label, dirs, onPick) => {
        const row = document.createElement('div');
        row.className = 'numeric';
        const lab = document.createElement('span');
        lab.className = 'axis-label'; lab.textContent = label;
        const pick = document.createElement('div');
        pick.className = 'dir-choice';
        for (const d of dirs) {
          const b = document.createElement('button');
          b.type = 'button'; b.textContent = d.label; b.dataset.dir = d.id;
          b.addEventListener('click', () => {
            onPick(d.id);
            pick.querySelectorAll('button').forEach(x => x.classList.toggle('is-on', x.dataset.dir === d.id));
            gate();
          });
          pick.appendChild(b);
        }
        const inp = document.createElement('input');
        inp.type = 'number'; inp.inputMode = 'numeric'; inp.min = '0'; inp.step = '1'; inp.placeholder = '?';
        inp.addEventListener('input', gate);
        const unit = document.createElement('span');
        unit.className = 'unit'; unit.textContent = 'km';
        row.append(lab, pick, inp, unit);
        box.appendChild(row);
        return inp;
      };
      const ix = mkAxis('x', [{ id: 'plus', label: '＋（右）' }, { id: 'minus', label: '−（左）' }], v => dirX = v);
      const iy = mkAxis('y', [{ id: 'plus', label: '＋（上）' }, { id: 'minus', label: '−（下）' }], v => dirY = v);
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
            const vx = Math.abs(Number(ix.value)) * (dirX === 'minus' ? -1 : 1);
            const vy = Math.abs(Number(iy.value)) * (dirY === 'minus' ? -1 : 1);
            const ok = vx === q2.answer.x && vy === q2.answer.y;
            if (ok) settle(true);
            else if (tries >= 3) settle(false);
            else ui.feedback('r<sub>公園</sub> − r<sub>駅</sub> を、成分ごとに引いてみよう。引き算の答えが負なら、その向きは −x（左）や −y（下）です。', 'wrong');
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
