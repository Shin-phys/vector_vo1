// js/relative/scenes/scene0-declare.js
// シーン0｜宣言（1分）。文章だけ。作図もアニメーションもしない。

import { declare } from '../../../data/problems-relative.js';

export default {
  id: 'declare',
  label: '宣言',

  async mount(host, ctx) {
    const { ui } = ctx;
    ui.setScale('');
    ui.setPrompt('');
    ui.setReadout([]);
    host.innerHTML = `
      <div class="declare">
        <h1>${declare.title}</h1>
        ${declare.body}
      </div>`;
    ui.actions([
      // 相対速度だけを単独で扱う授業のための入口。前提（②.5b・④・⑤）だけを短く復習する。
      { label: '前提を復習してから（5分）', onClick: () => { location.href = 'index.html?course=relative'; } },
      { id: 'next', label: declare.startLabel, variant: 'primary', onClick: () => ctx.complete() }
    ]);
  },

  unmount() {}
};
