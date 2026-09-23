// js/steps/step25b-origin.js
// 「基準を取り替えてみる」。本アプリの核。
// 冒頭に「置き場所の話」から「基準そのものを取り替える話」への区切りを必ず提示してから課題に入る。

export default {
  id: 'step25b',
  label: '基準',

  async mount(root, ctx) {
    this._ctx = ctx;
    // 冒頭の区切り（problems.transition）は main.js が共通で出すので、ここでは出さない。
    await ctx.runItems();
    // summary は 1つでも、配列で何枚か続けても書ける。
    // ここでは「ポイント（変化を表すベクトルは移動できる）」→「🔒 のルール」の2枚。
    const sum = ctx.problems && ctx.problems.summary;
    for (const card of (Array.isArray(sum) ? sum : sum ? [sum] : [])) {
      await ctx.ui.modal({
        title: card.title || '',
        body: card.body || '',
        actions: [{ label: card.button || 'わかった', variant: 'primary' }]
      });
    }
    await ctx.complete(true);
  },

  unmount() {
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
