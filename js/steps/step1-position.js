// js/steps/step1-position.js
// ステップ「①」。問題データ（data/problems.js の step1）を共通エンジンで実行するだけ。

export default {
  id: 'step1',
  label: '①',
  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    await ctx.complete(true);
  },
  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
