// js/steps/stepv-velocity-dir.js
// 「速度はどの向き？」。変位の話が済んだ直後に、平均の速度の向きだけを先に押さえる。
// v = Δr / Δt なので、v は Δr と同じ向き。ここで向きだけ決めておくと、
// ④で速度の矢印を描くときに「スケールだけが変わる」話に集中できる。
// 最後に problems.stepv.summary があれば、ここまでの整理を全画面で出す。

export default {
  id: 'stepv',
  label: 'v の向き',

  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    const sum = ctx.problems && ctx.problems.summary;
    if (sum) {
      await ctx.ui.modal({
        title: sum.title || 'ここまでの整理',
        body: sum.body || '',
        actions: [{ label: sum.button || '先へ進む', variant: 'primary' }]
      });
    }
    await ctx.complete(true);
  },

  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
