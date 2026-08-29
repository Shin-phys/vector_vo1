// js/relative/scenes/scene3-switch.js
// シーン3｜基準を切り替える（3分）。
//
// 1つの大きな画面＋「地面／A／B」の切替ボタン。
// 切替は camera.lerpOffset で滑らかに移す。瞬間的に切り替えると、
// 同じ運動を見ていることが伝わらない。

import { PaneGroup } from '../view.js';
import { createWorld, atTime, velocityText } from '../world.js';
import { offsetFor, lerpOffset } from '../camera.js';
import { switchScene } from '../../../data/problems-relative.js';
import { relativeConfig } from '../../../data/config.js';

let group = null, view = null, raf = 0, tRaf = 0;

export default {
  id: 'switch',
  label: '切替',

  async mount(host, ctx) {
    const { ui } = ctx;
    const p = ctx.problems[0];                 // 1問目の設定をそのまま使う
    const base = createWorld(p);
    const ids = base.bodies.map(b => b.id);
    const frames = ['ground', ...ids];
    const labelOf = (f) => f === 'ground' ? '地面' : (base.bodies.find(b => b.id === f).label);

    ui.setScale(p.scaleLabel);
    ui.setPrompt(`${p.setup}<br>${switchScene.prompt}`, { badge: '切替' });

    /* ---- 切替ボタン ---- */
    host.innerHTML = '';
    const tools = document.createElement('div');
    tools.className = 'pane-tools';
    const sw = document.createElement('div');
    sw.className = 'frame-switch';
    sw.innerHTML = '<span class="label">基準：</span>';
    const btns = {};
    for (const f of frames) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'frame-btn';
      b.textContent = labelOf(f);
      b.dataset.frame = f;
      sw.appendChild(b);
      btns[f] = b;
    }
    tools.appendChild(sw);
    host.appendChild(tools);
    const gridHost = document.createElement('div');
    host.appendChild(gridHost);

    group = new PaneGroup(gridHost).single();
    view = group.add({
      world: base, frame: 'ground', tone: 'ground',
      label: '地面から見た運動', showVectors: true, profile: ctx.profile
    });

    /* ---- 時間は止めずに往復させ続ける（切替の効果が見えるように） ---- */
    let t = 0, dir = 1, last = 0;
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000) * 0.55;
      last = now;
      t += dt * dir;
      if (t >= base.duration) { t = base.duration; dir = -1; }
      if (t <= 0) { t = 0; dir = 1; }
      view.world = atTime(base, t);
      view.render();
      showReadout();
      raf = requestAnimationFrame(loop);
    };

    /* ---- 基準の切り替え（0.5秒でカメラを移す） ---- */
    let frame = 'ground';
    let moving = false;
    const seen = new Set(['ground']);

    const paint = () => {
      for (const f of frames) btns[f].classList.toggle('is-on', f === frame);
      view.setLabel(frame === 'ground' ? '地面から見た運動' : `${labelOf(frame)}から見た運動`);
      view.root.classList.toggle('pane-observer', frame !== 'ground');
      view.root.classList.toggle('pane-ground', frame === 'ground');
    };

    const showReadout = () => {
      const cw = view.camWorld;
      ui.setReadout(cw.bodies.map(b => ({
        id: 'v' + b.id,
        label: `${b.label} の速度`,
        value: velocityText(cw, b.vel),
        badge: (cw.frame !== 'ground' && b.id === cw.frame) ? '基準にした物体' : null
      })));
    };

    const goFrame = (next) => {
      if (next === frame || moving) return;
      moving = true;
      const target = next;
      const ms = relativeConfig.transitionMs || 500;
      const t0 = performance.now();
      cancelAnimationFrame(tRaf);
      const anim = (now) => {
        const u = Math.min(1, (now - t0) / ms);
        const e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;   // ease-in-out
        // world は動き続けるので、毎フレーム現在の world から両端のオフセットを取り直す
        const a = offsetFor(view.world, frame);
        const b = offsetFor(view.world, target);
        view.setOffsetOverride(lerpOffset(a, b, e), target);
        if (u < 1) { tRaf = requestAnimationFrame(anim); return; }
        frame = target;
        moving = false;
        seen.add(frame);
        view.setFrame(frame);
        paint();
        checkQ2Ready();
      };
      // 押した手ごたえを先に返す
      for (const f of frames) btns[f].classList.toggle('is-on', f === target);
      tRaf = requestAnimationFrame(anim);
    };

    for (const f of frames) btns[f].addEventListener('click', () => goFrame(f));

    /* ---- 問い（choice型。2問目は A と B の両方を見てから） ---- */
    let qi = 0;
    let attempts = 0;

    const checkQ2Ready = () => {
      const q = switchScene.questions[qi];
      if (!q || !q.requireBothFrames) return;
      const list = ui.el.interact.querySelector('.choice-list');
      if (!list || list.dataset.locked === '1') return;
      const ready = ids.every(id => seen.has(id));
      [...list.children].forEach(c => { c.disabled = !ready; });
      if (ready) ui.feedback('両方を見比べましたね。答えを選びましょう。', 'info');
    };

    const askQuestion = () => {
      const q = switchScene.questions[qi];
      if (!q) {
        ui.clearInteract();
        ui.feedback('基準を取り替えても、見ているのは同じ1つの運動です。次は、これを式に橋渡しします。', 'correct');
        ui.setActionState('next', { disabled: false });
        return;
      }
      attempts = 0;
      const list = ui.renderChoice(q, (i, opt, btn) => {
        attempts++;
        const lock = () => { list.dataset.locked = '1'; [...list.children].forEach(c => c.disabled = true); };
        if (i === q.correct) {
          btn.classList.add('is-correct');
          lock();
          ctx.store.recordChoice(q.id, true, attempts);
          ui.feedback(q.explain, 'correct');
          setTimeout(() => { qi++; askQuestion(); }, 1600);
        } else {
          btn.classList.add('is-wrong');
          btn.disabled = true;
          if (attempts >= 2) {
            ctx.store.recordChoice(q.id, false, attempts);
            lock();
            list.children[q.correct].classList.add('is-correct');
            ui.feedback(q.explain, 'wrong');
            setTimeout(() => { qi++; askQuestion(); }, 2400);
          } else {
            ui.feedback(q.hint, 'wrong');
          }
        }
      });
      if (q.requireBothFrames) {
        [...list.children].forEach(c => { c.disabled = true; });
        ui.feedback(`まず基準を <b>${labelOf(ids[0])}</b> と <b>${labelOf(ids[1])}</b> の両方にして、矢印を見比べよう。`, 'info');
        checkQ2Ready();
      } else {
        ui.feedback('基準を切り替えて、矢印がどうなるか見てから答えよう。', 'info');
      }
    };

    ui.actions([
      { id: 'next', label: '次へ', variant: 'primary', disabled: true, onClick: () => ctx.complete() }
    ]);

    paint();
    last = performance.now();
    raf = requestAnimationFrame(loop);
    askQuestion();
    this._ctx = ctx;
  },

  onLayout() { if (view) view.render(); },

  unmount() {
    cancelAnimationFrame(raf); raf = 0;
    cancelAnimationFrame(tRaf); tRaf = 0;
    if (group) { group.destroy(); group = null; }
    view = null;
  }
};
