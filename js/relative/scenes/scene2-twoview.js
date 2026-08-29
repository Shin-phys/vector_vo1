// js/relative/scenes/scene2-twoview.js
// シーン2｜二画面で確認（4分）。
//
// 左：地面から見た運動（frame: "ground"）。背景は静止。
// 右：Aから見た運動（frame: 観測者id）。Aは画面上の位置に固定され、背景が一緒に流れる。
// 同じ world を同時に再生する。観測者用の world は作らない。

import { PaneGroup } from '../view.js';
import { createWorld, atTime, sub, add, len, isZero, velocityText } from '../world.js';
import { angleBetween } from '../../core/vector.js';
import { RELATIVE_TEXT, JUDGE } from '../../../data/config.js';

let group = null, raf = 0, els = null;

export default {
  id: 'twoview',
  label: '確認',

  async mount(host, ctx) {
    const { ui } = ctx;
    const p = ctx.problem;
    const base = createWorld(p);
    const obsId = p.observer || 'A';
    const obs = base.bodies.find(b => b.id === obsId);
    const other = base.bodies.find(b => b.id !== obsId);
    const actual = sub(other.vel, obs.vel);
    const pred = ctx.store.getPrediction(p.id);

    ui.setScale(p.scaleLabel);
    ui.setPrompt(`${p.setup}<br>同じ運動を、<b>地面から</b>と<b>${obs.label}から</b>、同時に見てみよう。`, { badge: '確認' });

    /* ---- 道具立て（速度ベクトルの表示トグル＋時間バー） ---- */
    host.innerHTML = '';
    const tools = document.createElement('div');
    tools.className = 'pane-tools';
    tools.innerHTML = `
      <label class="toggle"><input type="checkbox" id="vecToggle" checked><span>${RELATIVE_TEXT.showVectors}</span></label>
      <span class="timebar"><i id="timeFill"></i></span>`;
    host.appendChild(tools);
    const gridHost = document.createElement('div');
    host.appendChild(gridHost);

    group = new PaneGroup(gridHost);
    const leftView = group.add({
      world: base, frame: 'ground', tone: 'ground',
      label: '地面から見た運動', showVectors: true, profile: ctx.profile
    });
    const rightView = group.add({
      world: base, frame: obsId, tone: 'observer',
      label: `${obs.label}から見た運動`, showVectors: true, profile: ctx.profile
    });

    els = {
      toggle: tools.querySelector('#vecToggle'),
      fill: tools.querySelector('#timeFill')
    };
    els.toggle.addEventListener('change', () => group.showVectors(els.toggle.checked));

    /* ---- 再生 ---- */
    let t = 0, playing = false, rate = 1, last = 0, finishedOnce = false;

    const setTime = (nt) => {
      t = Math.max(0, Math.min(base.duration, nt));
      const w = atTime(base, t);
      group.setWorld(w);
      els.fill.style.width = (t / base.duration * 100) + '%';
    };

    const stop = () => {
      playing = false;
      cancelAnimationFrame(raf); raf = 0;
      ui.setActionState('play', { label: '▶ 再生' });
    };

    const step = (now) => {
      if (!playing) return;
      const dt = Math.min(0.05, (now - last) / 1000) * rate;
      last = now;
      setTime(t + dt);
      if (t >= base.duration - 1e-6) { stop(); onFinish(); return; }
      raf = requestAnimationFrame(step);
    };

    const play = () => {
      if (playing) { stop(); return; }
      if (t >= base.duration - 1e-6) { clearOverlay(); setTime(0); }
      playing = true;
      last = performance.now();
      ui.setActionState('play', { label: '❚❚ 停止' });
      raf = requestAnimationFrame(step);
    };

    const restart = (slow) => {
      stop(); clearOverlay(); rate = slow ? 0.35 : 1; setTime(0); play();
    };

    const clearOverlay = () => { rightView.setExtras([]); };

    /* ---- 再生後：予測と実際を重ねて見せる ---- */
    const onFinish = () => {
      // 生徒の予測を、いま画面に出ている「実際の矢印」のすぐ上に重ねる。
      // 同じ始点・同じ縮尺で並ぶので、合っていたか外れていたかが一目で分かる。
      let matched = null;
      if (pred && pred.vec) {
        const cw = rightView.camWorld;
        const b = cw.bodies.find(x => x.id === other.id);
        const origin = { x: b.pos.x + cw.anchor.x, y: b.pos.y + cw.anchor.y + 1.75 };
        const pv = pred.vec;
        rightView.setExtras([{
          from: origin, to: add(origin, pv), space: 'screen',
          style: 'predict', label: 'あなたの予測'
        }]);
        matched = !isZero(pv) &&
          angleBetween(pv, actual) <= JUDGE.angleToleranceDeg &&
          Math.abs(len(pv) - len(actual)) <= JUDGE.lengthTolerance;
        ctx.store.savePrediction(p.id, { matched });
      }

      ui.setReadout([
        { id: 'pred', label: 'あなたの予測', value: pred && pred.drawnText ? pred.drawnText : '（未記録）' },
        { id: 'real', label: `${obs.label}から見た ${other.label}`, value: velocityText(base, actual), flash: true }
      ]);

      if (!finishedOnce) {
        finishedOnce = true;
        askSelfReport();
      }
      ui.setActionState('next', { disabled: false });
    };

    const askSelfReport = () => {
      const list = ui.renderChoice(
        { question: '予測と、実際の見え方は合っていましたか？', options: [
          { key: '○', text: '合っていた' },
          { key: '×', text: '予測と違った' }
        ] },
        (i) => {
          ctx.store.savePrediction(p.id, { selfReport: i === 0 ? '合っていた' : '違った' });
          if (i === 0) {
            ui.feedback(`そのとおり。${p.reveal}`, 'correct');
          } else {
            ui.feedback(`${p.reveal}<br><b>${p.expectWord}</b>　もう一度、ゆっくり見てみましょう。`, 'wrong');
            ui.setActionState('slow', { disabled: false });
            const b = ui.el.actions.querySelector('[data-id="slow"]');
            if (b) b.style.display = '';
          }
          [...list.children].forEach(c => c.disabled = true);
          list.children[i].classList.add(i === 0 ? 'is-correct' : 'is-wrong');
        }
      );
    };

    ui.actions([
      { id: 'play', label: '▶ 再生', variant: 'primary', onClick: play },
      { id: 'restart', label: '↺ 最初から', onClick: () => restart(false) },
      { id: 'slow', label: '🐢 ゆっくり', disabled: true, onClick: () => restart(true) },
      { id: 'next', label: '次へ', disabled: true, onClick: () => ctx.complete() }
    ]);
    const slowBtn = ui.el.actions.querySelector('[data-id="slow"]');
    if (slowBtn) slowBtn.style.display = 'none';

    ui.feedback(`右の画面では <b>${obs.label} が止まって見え、背景（方眼・木・道路の線）が流れます</b>。これが「${obs.label}に乗って見る」ということ。`, 'info');
    setTime(0);
    this._ctx = ctx;
  },

  onLayout() { if (group) group.views.forEach(v => v.render()); },

  unmount() {
    cancelAnimationFrame(raf); raf = 0;
    if (group) { group.destroy(); group = null; }
    els = null;
  }
};
