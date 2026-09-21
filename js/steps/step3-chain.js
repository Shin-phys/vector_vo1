// js/steps/step3-chain.js
// ステップ「③」。問題データ（data/problems.js の step3）を共通エンジンで実行するだけ。

export default {
  id: 'step3',
  label: 'つなぐ',
  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    await ctx.complete(true);
  },
  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
