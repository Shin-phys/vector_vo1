// js/steps/step2-displacement.js
// ステップ「②」。問題データ（data/problems.js の step2）を共通エンジンで実行するだけ。

export default {
  id: 'step2',
  label: '変位',
  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    await ctx.complete(true);
  },
  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
