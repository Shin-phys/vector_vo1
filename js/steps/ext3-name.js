// js/steps/ext3-name.js
// 発展「変位ベクトルを拡張すると見えてくること 〜斜方投射を題材に〜」より、Δv が表しているものに名前をつける。
// 問題データ（data/problems.js の ext3）を共通エンジンで実行するだけ。

export default {
  id: 'ext3',
  label: '名前をつける',
  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    await ctx.complete(true);
  },
  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
