// js/steps/ext1-velocity.js
// 発展「変位ベクトルを拡張すると見えてくること 〜斜方投射を題材に〜」より、位置ベクトルから速度ベクトルをつくる。
// 問題データ（data/problems.js の ext1）を共通エンジンで実行するだけ。

export default {
  id: 'ext1',
  label: 'v をつくる',
  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    await ctx.complete(true);
  },
  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
