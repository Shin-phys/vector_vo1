// js/steps/step6-symbol.js
// 「記号へ」。日本語で理解したことを、記号に渡す。変位の話が続いているうちに置く（速度に入る前）。
//
// 図はふつうの方眼。式を並べる枠も、タップで光る仕掛けも持たない。
// 画面にあるのは「図」と「いま答える問い」だけ。スマホでも図のすぐ下に問いが来る。
//
// 進め方：① Δr（図を見て）→ ② r_bef → ③ r_aft → ④ 式を選ぶ。
// 先に答えを持っている状態で式を選ばせるので、式が「答えを再現する道具」になる。
// bef / aft のきまりは、このステップの最後に summary として出す（⑦の前）。

export default {
  id: 'step6',
  label: '記号',

  async mount(root, ctx) {
    this._ctx = ctx;
    const ui = ctx.ui;
    const p = ctx.problems;
    const O = p.origin;
    const st = p.places.find(x => x.id === 'station');
    const pk = p.places.find(x => x.id === 'park');

    ui.showCanvas(true);
    ui.setScale(p.scaleLabel);
    ui.setPrompt(p.prompt, { badge: '記号へ' });

    ctx.buildScene({
      points: {
        O:       { x: O.x,  y: O.y,  label: O.label, role: 'origin' },
        station: { x: st.x, y: st.y, label: st.label },
        park:    { x: pk.x, y: pk.y, label: pk.label }
      },
      vectors: [
        { id: 'rbef', from: 'O',       to: 'station', style: 'position',     locked: true,
          label: 'r', labelSub: 'bef', vec: true },
        { id: 'raft', from: 'O',       to: 'park',    style: 'position',     locked: true,
          label: 'r', labelSub: 'aft', vec: true },
        { id: 'disp', from: 'station', to: 'park',    style: 'displacement', locked: false,
          label: 'Δr', vec: true }
      ]
    });

    const box = ui.el.interact;
    box.style.display = '';

    // これまでに出した答え。④はこれが無いと解けない。
    const logs = [];
    const sgn = (n) => (n > 0 ? '+' + n : n < 0 ? '−' + Math.abs(n) : '0');
    const logHtml = () => logs.length
      ? `<div class="bridge-log"><div style="font-weight:700;margin-bottom:4px">ここまでに出した答え</div>${logs.map(l => `<div>${l}</div>`).join('')}</div>`
      : '';

    const stages = ['value', 'bef', 'aft'].filter(k => !!p[cfgKey(k)]);
    let stage = 0;
    function cfgKey(k) { return k === 'value' ? 'quizValue' : k === 'bef' ? 'coordBef' : 'coordAft'; }

    /* ---- 成分を答える。向きはボタン、大きさは数値。
           スマホの数字キーボードにマイナスが無いので、符号は打たせない。 ---- */
    const askComponents = (cfg, key, onDone) => {
      box.innerHTML = `<p class="choice-question">${cfg.question}</p>` + logHtml();
      let dirX = null, dirY = null;
      const gate = () => ui.setActionState('check', {
        disabled: !(ix.value !== '' && iy.value !== '' && dirX && dirY)
      });
      const mkAxis = (label, onPick) => {
        const row = document.createElement('div');
        row.className = 'numeric';
        const lab = document.createElement('span');
        lab.className = 'axis-label'; lab.textContent = label;
        const pick = document.createElement('div');
        pick.className = 'dir-choice';
        for (const d of [{ id: 'plus', label: label === 'x' ? '＋（右）' : '＋（上）' },
                         { id: 'minus', label: label === 'x' ? '−（左）' : '−（下）' }]) {
          const b = document.createElement('button');
          b.type = 'button'; b.textContent = d.label; b.dataset.dir = d.id;
          b.addEventListener('click', () => {
            onPick(d.id);
            pick.querySelectorAll('button').forEach(x => x.classList.toggle('is-on', x.dataset.dir === d.id));
            gate();
          });
          pick.appendChild(b);
        }
        const inp = document.createElement('input');
        inp.type = 'number'; inp.inputMode = 'numeric'; inp.min = '0'; inp.step = '1'; inp.placeholder = '?';
        inp.addEventListener('input', gate);
        const unit = document.createElement('span');
        unit.className = 'unit'; unit.textContent = cfg.unit || 'km';
        row.append(lab, pick, inp, unit);
        box.insertBefore(row, box.querySelector('.bridge-log'));
        return inp;
      };
      const ix = mkAxis('x', v => dirX = v);
      const iy = mkAxis('y', v => dirY = v);

      let tries = 0, done = false;
      const settle = (ok) => {
        done = true;
        ctx.storage.recordAttempt('step6', key, ok);
        ui.feedback(cfg.explain, ok ? 'correct' : 'wrong');
        logs.push(`${cfg.logLabel || ''} <b>(${sgn(cfg.answer.x)}, ${sgn(cfg.answer.y)})</b>`);
        ui.setActionState('check', { disabled: true });
        ui.setActionState('next', { disabled: false });
      };
      ui.actions([
        { id: 'check', label: '判定する', variant: 'primary', disabled: true, onClick: () => {
            if (done) return;
            tries++;
            const vx = Math.abs(Number(ix.value)) * (dirX === 'minus' ? -1 : 1);
            const vy = Math.abs(Number(iy.value)) * (dirY === 'minus' ? -1 : 1);
            if (vx === cfg.answer.x && vy === cfg.answer.y) settle(true);
            else if (tries >= 3) settle(false);
            else ui.feedback(cfg.retryHint || 'もう一度、成分ごとに数えよう。', 'wrong');
          } },
        { id: 'next', label: '次へ', disabled: true, onClick: () => onDone() }
      ]);
      gate();
    };

    /* ---- ④ 式を選ぶ ---- */
    const askOrder = () => {
      const q = p.quizOrder;
      box.innerHTML = `<p class="choice-question">${q.question}</p>` + logHtml();
      const list = document.createElement('div');
      list.className = 'choice-list';
      let attempts = 0, closed = false;
      const shut = () => { closed = true; [...list.children].forEach(c => c.disabled = true); };
      (q.options || []).forEach((opt, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'choice';
        b.innerHTML = `<span class="choice-key">${opt.key || ''}</span><span class="choice-text">${opt.text}</span>`;
        b.addEventListener('click', () => {
          if (closed) return;
          attempts++;
          if (i === q.correct) {
            b.classList.add('is-correct'); shut();
            ctx.storage.recordAttempt('step6', 'order', true);
            ui.feedback(q.explain, 'correct');
            ui.setActionState('next', { disabled: false });
          } else {
            b.classList.add('is-wrong'); b.disabled = true;
            if (attempts >= 2) {
              ctx.storage.recordAttempt('step6', 'order', false);
              shut();
              list.children[q.correct].classList.add('is-correct');
              ui.feedback(q.explain, 'wrong');
              ui.setActionState('next', { disabled: false });
            } else {
              ui.feedback(opt.feedback || 'もう一度、出発（bef）と到着（aft）はどちらか考えよう。', 'wrong');
            }
          }
        });
        list.appendChild(b);
      });
      box.insertBefore(list, box.querySelector('.bridge-log'));
      ui.actions([{ id: 'next', label: '次へ', variant: 'primary', disabled: true, onClick: finish }]);
    };

    const finish = async () => {
      if (p.summary) {
        await ui.modal({
          title: p.summary.title || '',
          body: p.summary.body || '',
          actions: [{ label: p.summary.button || 'わかった', variant: 'primary' }]
        });
      }
      ctx.complete(true);
    };

    const nextStage = () => {
      const key = stages[stage];
      if (!key) return askOrder();
      stage++;
      askComponents(p[cfgKey(key)], key, nextStage);
    };

    ui.feedback('図を見て答えよう。式はあとで確かめる。', 'info');
    nextStage();
  },

  unmount() {
    document.body.classList.remove('layout-bridge');
    if (this._ctx) this._ctx.ui.stopHints();
  }
};
