// js/steps/ext2-deltav.js
// 発展「変位ベクトルを拡張すると見えてくること 〜斜方投射を題材に〜」より、速度ベクトルの始点をそろえて Δv を描く。
// 問題データ（data/problems.js の ext2）を共通エンジンで実行するだけ。

export default {
  id: 'ext2',
  label: 'Δv を見る',
  async mount(root, ctx) {
    this._ctx = ctx;
    await ctx.runItems();
    await ctx.complete(true);
  },
  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
