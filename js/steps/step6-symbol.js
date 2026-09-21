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

    /* ---- 進め方 ----
       ①まず直感で Δr の数値を出す → ② bef の成分 → ③ aft の成分 → ④ 式を選ぶ。
       先に答えを持っている状態で式を選ばせるので、式が「答えを再現する道具」になる。 */

    // データに無い段はとばす（復習コースでは bef / aft の2段を省く）
    let stage = 0;
    const stages = ['value', 'bef', 'aft'].filter(k => {
      const cfg = p[k === 'value' ? 'quizValue' : k === 'bef' ? 'coordBef' : 'coordAft'];
      return !!cfg;
    });

    // 向きはボタン、大きさは数値。スマホの数字キーボードにはマイナスが無く、
    // 符号を打たせると入力できない。向きを選ばせるほうが物理としても自然。
    const askComponents = (cfg, key, onDone) => {
      const box = ui.el.interact;
      box.style.display = '';
      box.innerHTML = `<p class="choice-question">${cfg.question}</p>`;
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
        unit.className = 'unit'; unit.textContent = cfg.unit || 'km';
        row.append(lab, pick, inp, unit);
        box.appendChild(row);
        return inp;
      };
      const ix = mkAxis('x', [{ id: 'plus', label: '＋（右）' }, { id: 'minus', label: '−（左）' }], v => dirX = v);
      const iy = mkAxis('y', [{ id: 'plus', label: '＋（上）' }, { id: 'minus', label: '−（下）' }], v => dirY = v);

      let tries = 0, done = false;
      const settle = (ok) => {
        done = true;
        ctx.storage.recordAttempt('step6', key, ok);
        ui.feedback(cfg.explain, ok ? 'correct' : 'wrong');
        if (cfg.lit) bridge.setLit(cfg.lit);
        ui.setActionState('check', { disabled: true });
        ui.setActionState('next', { disabled: false });
      };
      ui.actions([
        { id: 'check', label: '判定する', variant: 'primary', disabled: true, onClick: () => {
            if (done) return;
            tries++;
            const vx = Math.abs(Number(ix.value)) * (dirX === 'minus' ? -1 : 1);
            const vy = Math.abs(Number(iy.value)) * (dirY === 'minus' ? -1 : 1);
            if (vx === cfg.answer.x && vy === cfg.answer.y) settle(true);
            else if (tries >= 3) settle(false);
            else ui.feedback(cfg.retryHint || 'もう一度、成分ごとに数えてみよう。', 'wrong');
          } },
        { id: 'next', label: '次へ', disabled: true, onClick: () => onDone() }
      ]);
      gate();
    };

    /* ---- ④ 式を選ぶ。①〜③で出した数を根拠に選ばせる ---- */
    const askOrder = () => {
      const q = p.quizOrder;
      ui.clearInteract();
      let attempts = 0;
      const list = ui.renderChoice(q, (i, opt, btn) => {
        if (list.dataset.done) return;
        attempts++;
        if (i === q.correct) {
          btn.classList.add('is-correct');
          list.dataset.done = '1';
          [...list.children].forEach(c => c.disabled = true);
          ctx.storage.recordAttempt('step6', 'order', true);
          ui.feedback(q.explain, 'correct');
          bridge.setLit('disp');
          ui.setActionState('next', { disabled: false });
        } else {
          btn.classList.add('is-wrong'); btn.disabled = true;
          if (attempts >= 2) {
            ctx.storage.recordAttempt('step6', 'order', false);
            list.dataset.done = '1';
            [...list.children].forEach(c => c.disabled = true);
            list.children[q.correct].classList.add('is-correct');
            ui.feedback(q.explain, 'wrong');
            ui.setActionState('next', { disabled: false });
          } else {
            ui.feedback(opt.feedback || 'もう一度、出発（bef）と到着（aft）はどちらか考えよう。', 'wrong');
          }
        }
      });
      ui.actions([{ id: 'next', label: '次へ', variant: 'primary', disabled: true,
                    onClick: () => ctx.complete(true) }]);
    };

    const nextStage = () => {
      const key = stages[stage];
      if (!key) return askOrder();
      const cfg = p[key === 'value' ? 'quizValue' : key === 'bef' ? 'coordBef' : 'coordAft'];
      stage++;
      askComponents(cfg, key, nextStage);
    };

    ui.feedback('まず、いまの図を見て答えてみよう。式はあとで確かめます。', 'info');
    nextStage();
  },

  unmount() {
    document.body.classList.remove('layout-bridge');
    if (this._ctx) this._ctx.ui.stopHints();
    if (bridge) { bridge.destroy(); bridge = null; }
  }
};
