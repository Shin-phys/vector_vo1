// js/steps/step4-velocity.js
// ステップ「④」。問題データ（data/problems.js の step4）を共通エンジンで実行するだけ。

export default {
  id: 'step4',
  label: '④',
  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    await ctx.complete(true);
  },
  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
