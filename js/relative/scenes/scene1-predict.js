// js/relative/scenes/scene1-predict.js
// シーン1｜予測を描く（3分）。
//
// このシーンの存在意義は「再生させないこと」にある。
// 予測を描くまで再生ボタンは押せない。ここを飛ばすと、このアプリはただの綺麗な映像になる。
// 正解判定はここではしない。予測は保存だけして次へ渡す。

import { PaneGroup } from '../view.js';
import { DrawTool } from '../../core/vector.js';
import { createWorld, sub, len, isZero, velocityText } from '../world.js';
import { RELATIVE_TEXT } from '../../../data/config.js';

let group = null, tool = null, view = null;

export default {
  id: 'predict',
  label: '予測',

  async mount(host, ctx) {
    const { ui } = ctx;
    const p = ctx.problem;
    const world = createWorld(p);
    const obsId = p.observer || 'A';
    const obs = world.bodies.find(b => b.id === obsId);
    const other = world.bodies.find(b => b.id !== obsId);
    const actual = sub(other.vel, obs.vel);

    ui.setScale(p.scaleLabel);
    ui.setPrompt(`${p.setup}<br>${p.question}`, { badge: '予測' });

    group = new PaneGroup(host).single();
    view = group.add({
      world,
      frame: 'ground',
      label: '地面から見た運動（いまは止めてあります）',
      tone: 'ground',
      showVectors: true,
      profile: ctx.profile
    });

    const saved = ctx.store.getPrediction(p.id);
    let drawn = saved && saved.from ? { from: saved.from, to: saved.to } : null;

    const applyDrawn = () => {
      if (!drawn) { view.setExtras([]); return; }
      // ラベルは付けない。描いた矢印はこれ1本だけで、数値は下の readout に出る。
      // 図の上に文字を足すと、物体の速度ラベルと重なることがある。
      view.setExtras([{
        from: drawn.from, to: drawn.to, space: 'screen', style: 'predict'
      }]);
    };

    const showReadout = () => {
      if (!drawn) { ui.setReadout([]); return; }
      const v = sub(drawn.to, drawn.from);
      ui.setReadout([
        { id: 'pred', label: 'あなたが描いた矢印', value: isZero(v) ? '長さ0' : velocityText(world, v) }
      ]);
    };

    let phase = 'start';
    const howTo = () => {
      const tap = ctx.profile.drawMode === 'tap';
      if (phase === 'end') return 'つぎに、<b>矢印の先</b>をタップ。やり直すなら同じ点をもう一度タップ。';
      return tap
        ? `<b>${RELATIVE_TEXT.drawFirst}</b>　${other.label} のところを<b>タップ</b>して、矢印の根もとを決めます。`
        : `<b>${RELATIVE_TEXT.drawFirst}</b>　${other.label} のところから矢印をドラッグして描きます。`;
    };

    const setGate = () => {
      ui.setActionState('play', { disabled: !drawn });
      ui.setActionState('clear', { disabled: !drawn });
      if (drawn) ui.feedback('描けました。再生して確かめましょう。', 'info');
      else ui.feedback(howTo(), phase === 'end' ? 'info' : 'wrong');
    };

    tool = new DrawTool(view.canvas, {
      profile: ctx.profile,
      styleName: 'predict',
      onPhase: (ph) => { phase = ph; if (!drawn) setGate(); },
      onComplete: (res, arrow) => {
        arrow.remove();                       // 以後は view の extras として持たせる
        drawn = { from: res.from, to: res.to };
        const v = sub(drawn.to, drawn.from);
        ctx.store.savePrediction(p.id, {
          title: p.title,
          from: drawn.from, to: drawn.to, vec: v,
          drawnText: isZero(v) ? '長さ0' : velocityText(world, v),
          actualVec: actual,
          actualText: velocityText(world, actual)
        });
        applyDrawn();
        showReadout();
        setGate();
      }
    });

    applyDrawn();
    showReadout();

    ui.actions([
      { id: 'clear', label: '描き直す', disabled: !drawn, onClick: () => { drawn = null; tool.clear(); applyDrawn(); showReadout(); setGate(); } },
      { id: 'play', label: '▶ 再生して確かめる', variant: 'primary', disabled: !drawn, onClick: () => ctx.complete() }
    ]);
    setGate();

    ui.startHints({
      hints: [`${obs.label} と一緒に動きながら ${other.label} を見たら、${other.label} は前へ進む？　それとも後ろへ下がる？`],
      onLevel: () => {}
    });

    this._ctx = ctx;
  },

  onLayout() { if (view) view.render(); },

  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
    if (tool) { tool.destroy(); tool = null; }
    if (group) { group.destroy(); group = null; }
    view = null;
  }
};
