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
      { label: declare.startLabel, variant: 'primary', onClick: () => ctx.complete() }
    ]);
  },

  unmount() {}
};
