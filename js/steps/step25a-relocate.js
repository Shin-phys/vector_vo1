// js/steps/step25a-relocate.js
// 「置き直してみる」。位置ベクトル（束縛・錠前つき）と変位ベクトル（自由）を実際に動かして違いを体験させる。
// 問題の中身は data/problems.js の step25a にあり、このファイルは進行だけを担当する。

export default {
  id: 'step25a',
  label: '置き直す',

  async mount(root, ctx) {
    this._ctx = ctx;
    if (ctx.problems && ctx.problems.intro) {
      await ctx.ui.modal({
        title: ctx.problems.intro.title || '',
        body: ctx.problems.intro.body || '',
        actions: [{ label: 'はじめる', variant: 'primary' }]
      });
    }
    await ctx.runItems();
    await ctx.complete(true);
  },

  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
