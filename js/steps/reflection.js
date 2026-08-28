// js/steps/reflection.js
// 振り返り。自由記述と、回答／学習ログのコピー。最後に次回予告を出す。

export default {
  id: 'reflection',
  label: '振り返り',

  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    if (ctx.problems && ctx.problems.nextPreview) {
      await ctx.ui.modal({
        title: '次回の予告',
        body: ctx.problems.nextPreview,
        actions: [{ label: '終わる', variant: 'primary' }]
      });
    }
    await ctx.complete(true);
  },

  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
