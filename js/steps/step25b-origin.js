// js/steps/step25b-origin.js
// ②.5b「基準を取り替えてみる」。本アプリの核。
// 冒頭に「置き場所の話」から「基準そのものを取り替える話」への区切りを必ず提示してから課題に入る。

export default {
  id: 'step25b',
  label: '②.5b',

  async mount(root, ctx) {
    this._ctx = ctx;
    // 冒頭の区切り（problems.transition）は main.js が共通で出すので、ここでは出さない。
    await ctx.runItems();
    await ctx.complete(true);
  },

  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
