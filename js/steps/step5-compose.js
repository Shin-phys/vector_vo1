// js/steps/step5-compose.js
// ステップ「⑤」。問題データ（data/problems.js の step5）を共通エンジンで実行するだけ。

export default {
  id: 'step5',
  label: '⑤',
  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    await ctx.complete(true);
  },
  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
