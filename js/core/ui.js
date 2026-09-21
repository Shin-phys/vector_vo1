// js/core/ui.js
// 進捗バー・問題文・数値表示・フィードバック・ヒント（3段階）・モーダル・選択肢/スライダー/自由記述のUI。
// 画面の骨格は index.html にあり、ここはその中身を書き換えるだけ。

import { HINTS, TEXT, COLORS } from '../../data/config.js';

const $ = (sel) => document.querySelector(sel);

export const ui = {
  el: {},

  init() {
    this.el = {
      topbar: $('#topbar'),
      steps: $('#steps'),
      scale: $('#scalebar'),
      prompt: $('#prompt'),
      canvasHost: $('#canvasHost'),
      stage: $('#stage'),
      readout: $('#readout'),
      feedback: $('#feedback'),
      interact: $('#interact'),
      hintBox: $('#hintBox'),
      actions: $('#actionbar'),
      modalRoot: $('#modalRoot')
    };
    this._idleHandler = () => this.resetIdle();
    ['pointerdown', 'keydown', 'input'].forEach(ev =>
      document.addEventListener(ev, this._idleHandler, { passive: true }));
    this._bindKeys();
    return this;
  },

  /* ---------- キーボード（教室のプロジェクタ操作用） ----------
     スペース と N ＝「次へ」。ボタンを押すのと同じなので、
     無効になっているボタン（例：予測を描くまでの再生）はキーでも押せない。 */
  _bindKeys() {
    if (this._keysBound) return;
    this._keysBound = true;
    document.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = (e.key || '').toLowerCase();
      if (k !== 'n' && k !== ' ' && e.code !== 'Space') return;
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' ||
                t.tagName === 'SELECT' || t.isContentEditable)) return;   // 入力中は無効
      // ボタンにフォーカスがあるとき、スペースはそのボタンを押す動作なので任せる
      if ((k === ' ' || e.code === 'Space') && t && t.tagName === 'BUTTON') return;
      const btn = this.advanceButton();
      if (!btn) return;
      e.preventDefault();
      btn.click();
    });
  },

  /** いま「次へ」に当たるボタン。モーダルが開いていればそちらを優先する。 */
  advanceButton() {
    const modalOpen = this.el.modalRoot && this.el.modalRoot.style.display !== 'none'
      && this.el.modalRoot.childElementCount > 0;
    const root = modalOpen ? this.el.modalRoot : this.el.actions;
    if (!root) return null;
    const byId = root.querySelector('[data-id="next"]:not(:disabled)');
    if (byId) return byId;
    const prim = [...root.querySelectorAll('.btn-primary:not(:disabled)')].pop();
    return prim || null;
  },

  /* ---------- 進捗バー ---------- */
  /**
   * @param {Array<{id:string,label:string}>} steps
   * @param {string} currentId
   * @param {{onJump?:(index:number)=>void, canJump?:(index:number)=>boolean}} [opts]
   *
   * タップで移動できるのは canJump が true を返すステップだけ。
   * 既定は「通過済みにだけ戻れる」。先に飛べるようにすると、
   * 第2弾の「予測を描くまで再生できない」制約が意味を失うので、
   * 全解放は先生モード（呼び出し側の canJump）でのみ許すこと。
   */
  renderSteps(steps, currentId, opts = {}) {
    const box = this.el.steps;
    box.innerHTML = '';
    const idx = steps.findIndex(x => x.id === currentId);
    const jumpable = (i) => !!opts.onJump && i !== idx &&
      (opts.canJump ? opts.canJump(i) : i < idx);

    steps.forEach((s, i) => {
      const can = jumpable(i);
      const b = document.createElement(can ? 'button' : 'span');
      b.className = 'step-chip';
      if (s.id === currentId) b.classList.add('is-current');
      else if (i < idx) b.classList.add('is-done');
      b.textContent = s.label;
      if (can) {
        b.type = 'button';
        b.classList.add('is-jumpable');
        b.title = `${s.label} へもどる`;
        b.setAttribute('aria-label', `${s.label} へ移動`);
        b.addEventListener('click', () => opts.onJump(i));
      }
      box.appendChild(b);
    });
    const rest = document.createElement('span');
    rest.className = 'step-rest';
    rest.textContent = `のこり ${Math.max(0, steps.length - idx - 1)}`;
    box.appendChild(rest);

    // 現在地が画面外にあるとどこにいるか分からないので、見える位置へ寄せる
    const cur = box.querySelector('.step-chip.is-current');
    if (cur && box.scrollWidth > box.clientWidth) {
      const left = cur.offsetLeft - (box.clientWidth - cur.offsetWidth) / 2;
      box.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }
  },

  /* ---------- 画面パーツ ---------- */
  setScale(text) {
    this.el.scale.textContent = text || '';
    this.el.scale.style.display = text ? '' : 'none';
  },

  setPrompt(text, opts = {}) {
    const p = this.el.prompt;
    p.innerHTML = '';
    if (!text) { p.style.display = 'none'; return; }
    p.style.display = '';
    // 問題文は課題そのもの。折りたたむと生徒が何をすべきか分からなくなるので、
    // スマホでも省略せずに全文を出す。長さは問題データ側で短く保つこと。
    const body = document.createElement('div');
    body.className = 'prompt-body';
    body.innerHTML = text;
    p.appendChild(body);
    if (opts.badge) {
      const b = document.createElement('span');
      b.className = 'prompt-badge';
      b.textContent = opts.badge;
      p.prepend(b);
    }
  },

  /**
   * トップページ（話の選択）。レッスンの画面部品を隠して、カードだけを出す。
   * chapters: [{key,label,title,lead,minutes,href,done}]
   */
  renderHome({ title, lead, chapters = [], onPick } = {}) {
    document.body.classList.add('is-home');
    this.el.steps.innerHTML = '';
    this.setScale('');
    this.showCanvas(false);
    this.setReadout([]);
    this.feedback('');
    this.actions([]);
    this.setPrompt('');

    const box = this._interact();
    box.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'home-head';
    head.innerHTML = `<h1>${title || ''}</h1>${lead ? `<p>${lead}</p>` : ''}`;
    box.appendChild(head);

    const list = document.createElement('div');
    list.className = 'home-list';
    for (const c of chapters) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'home-card' + (c.done ? ' is-done' : '');
      card.innerHTML =
        `<span class="home-label">${c.label}</span>` +
        `<span class="home-title">${c.title}</span>` +
        (c.lead ? `<span class="home-lead">${c.lead}</span>` : '') +
        `<span class="home-meta">${c.minutes ? `約${c.minutes}分` : ''}${c.done ? '　✓ 通過' : ''}</span>`;
      card.addEventListener('click', () => onPick && onPick(c));
      list.appendChild(card);
    }
    box.appendChild(list);
    return list;
  },

  exitHome() { document.body.classList.remove('is-home'); },

  showCanvas(show) {
    this.el.canvasHost.style.display = show ? '' : 'none';
    this.el.scale.style.display = show && this.el.scale.textContent ? '' : 'none';
  },

  /**
   * 数値表示。キャンバス外の固定位置に置くので、指で隠れない。
   * items: [{id,label,value,flash:boolean,badge:'変化なし'}]
   */
  setReadout(items) {
    const box = this.el.readout;
    box.innerHTML = '';
    if (!items || !items.length) { box.style.display = 'none'; return; }
    box.style.display = '';
    for (const it of items) {
      const row = document.createElement('div');
      row.className = 'readout-row';
      if (it.id) row.dataset.id = it.id;
      const lab = document.createElement('span');
      lab.className = 'readout-label';
      lab.textContent = it.label;
      const val = document.createElement('span');
      val.className = 'readout-value';
      val.textContent = it.value;
      row.append(lab, val);
      if (it.badge) {
        const bd = document.createElement('span');
        bd.className = 'readout-badge';
        bd.textContent = it.badge;
        row.appendChild(bd);
      }
      if (it.flash) row.classList.add('is-flash');
      box.appendChild(row);
    }
  },

  flashReadout(id) {
    const row = this.el.readout.querySelector(`.readout-row[data-id="${id}"]`);
    if (!row) return;
    row.classList.remove('is-flash');
    void row.offsetWidth;
    row.classList.add('is-flash');
  },

  feedback(text, kind = 'info') {
    const f = this.el.feedback;
    f.className = 'feedback is-' + kind;
    f.innerHTML = text ? `<p>${text}</p>` : '';
    f.style.display = text ? '' : 'none';
  },

  clearFeedback() { this.feedback(''); },

  /* ---------- 操作ボタン（スマホでは画面下部に固定） ---------- */
  actions(buttons) {
    const bar = this.el.actions;
    bar.innerHTML = '';
    for (const b of (buttons || [])) {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'btn btn-' + (b.variant || 'default');
      el.textContent = b.label;
      if (b.id) el.dataset.id = b.id;
      if (b.id === 'next' || b.variant === 'primary') el.title = 'スペース／N キーでも進めます';
      el.disabled = !!b.disabled;
      el.addEventListener('click', () => b.onClick && b.onClick(el));
      bar.appendChild(el);
    }
    bar.style.display = (buttons && buttons.length) ? '' : 'none';
  },

  setActionState(id, { disabled, label } = {}) {
    const el = this.el.actions.querySelector(`[data-id="${id}"]`);
    if (!el) return;
    if (disabled !== undefined) el.disabled = disabled;
    if (label !== undefined) el.textContent = label;
  },

  /* ---------- ヒント（30秒／60秒で自動出現、手動で答え表示） ---------- */
  startHints({ hints = [], onLevel = () => {}, onCount = () => {} } = {}) {
    this.stopHints();
    this._hintCfg = { hints, onLevel, onCount };
    this._hintLevel = 0;
    this.el.hintBox.innerHTML = '';
    this.el.hintBox.style.display = 'none';
    this._armIdle();
  },

  _armIdle() {
    if (!this._hintCfg) return;
    clearTimeout(this._t1); clearTimeout(this._t2);
    if (this._hintLevel < 1) {
      this._t1 = setTimeout(() => this.showHint(1), HINTS.level1Sec * 1000);
    }
    if (this._hintLevel < 2) {
      this._t2 = setTimeout(() => this.showHint(2), HINTS.level2Sec * 1000);
    }
  },

  resetIdle() { this._armIdle(); },

  showHint(level) {
    if (!this._hintCfg || level <= this._hintLevel) return;
    this._hintLevel = level;
    const { hints, onLevel, onCount } = this._hintCfg;
    if (level === 1) {
      const text = hints[0] || 'まず、矢印をどこから描き始めるか考えてみましょう。';
      const box = this.el.hintBox;
      box.style.display = '';
      box.innerHTML = `<div class="hint hint-1"><b>ヒント</b><span>${text}</span></div>`;
    }
    onLevel(level);
    onCount(level);
    this._armIdle();
  },

  stopHints() {
    clearTimeout(this._t1); clearTimeout(this._t2);
    this._hintCfg = null;
    if (this.el.hintBox) { this.el.hintBox.innerHTML = ''; this.el.hintBox.style.display = 'none'; }
  },

  /* ---------- 選択肢・スライダー・自由記述 ---------- */
  clearInteract() { this.el.interact.innerHTML = ''; this.el.interact.style.display = 'none'; },

  _interact() { this.el.interact.style.display = ''; return this.el.interact; },

  /** 4択など。◯×形式にはしない。 */
  renderChoice(item, onPick) {
    const box = this._interact();
    box.innerHTML = '';
    const q = document.createElement('p');
    q.className = 'choice-question';
    q.innerHTML = item.question || '';
    box.appendChild(q);
    const list = document.createElement('div');
    list.className = 'choice-list';
    (item.options || []).forEach((opt, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'choice';
      b.innerHTML = `<span class="choice-key">${opt.key || String.fromCharCode(12450 + i)}</span><span class="choice-text">${opt.text}</span>`;
      b.addEventListener('click', () => onPick(i, opt, b));
      list.appendChild(b);
    });
    box.appendChild(list);
    return list;
  },

  markChoice(listEl, index, state) {
    const b = listEl.children[index];
    if (b) b.classList.add(state === 'correct' ? 'is-correct' : 'is-wrong');
  },

  renderSlider(cfg, onInput) {
    const box = this._interact();
    const wrap = document.createElement('div');
    wrap.className = 'slider-wrap';
    const label = document.createElement('div');
    label.className = 'slider-label';
    const input = document.createElement('input');
    input.type = 'range';
    input.className = 'slider';
    input.min = cfg.min; input.max = cfg.max; input.step = cfg.step || 1;
    input.value = cfg.value ?? cfg.min;
    const update = () => {
      label.textContent = `${cfg.label}：${input.value}${cfg.unit || ''}`;
      onInput(Number(input.value));
    };
    input.addEventListener('input', update);
    wrap.append(label, input);
    box.appendChild(wrap);
    update();
    return input;
  },

  renderTextarea(cfg, onInput) {
    const box = this._interact();
    const ta = document.createElement('textarea');
    ta.className = 'free-text';
    ta.rows = cfg.rows || 3;
    ta.placeholder = cfg.placeholder || '';
    ta.value = cfg.value || '';
    ta.addEventListener('input', () => onInput(ta.value));
    box.appendChild(ta);
    return ta;
  },

  /* ---------- モーダル・トースト ---------- */
  modal({ title, body, actions = [{ label: 'OK' }] }) {
    return new Promise(resolve => {
      const root = this.el.modalRoot;
      root.innerHTML = '';
      root.style.display = '';
      const back = document.createElement('div');
      back.className = 'modal-back';
      const card = document.createElement('div');
      card.className = 'modal-card';
      if (title) {
        const h = document.createElement('h2');
        h.textContent = title;
        card.appendChild(h);
      }
      const b = document.createElement('div');
      b.className = 'modal-body';
      b.innerHTML = body || '';
      card.appendChild(b);
      const acts = document.createElement('div');
      acts.className = 'modal-actions';
      actions.forEach((a, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-' + (a.variant || (i === actions.length - 1 ? 'primary' : 'default'));
        btn.textContent = a.label;
        btn.addEventListener('click', () => {
          root.style.display = 'none'; root.innerHTML = '';
          resolve(a.value ?? i);
        });
        acts.appendChild(btn);
      });
      card.appendChild(acts);
      back.appendChild(card);
      root.appendChild(back);
    });
  },

  toast(text, ms = 1800) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('is-out'), ms - 300);
    setTimeout(() => t.remove(), ms);
  },

  /** クリップボードへコピー（失敗時は選択状態にして案内） */
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.toast('コピーしました');
      return true;
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); this.toast('コピーしました'); }
      catch (e2) { this.toast('コピーできませんでした。手で選択してください'); }
      ta.remove();
      return false;
    }
  },

  reset() {
    this.stopHints();
    this.clearFeedback();
    this.clearInteract();
    this.setReadout([]);
    this.actions([]);
    this.showCanvas(true);
  }
};

export { COLORS, TEXT };
