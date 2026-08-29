// js/core/layout.js
// 端末プロファイル（phone / tablet）の判定と適用。手動トグルの設定も保持する。
// アプリは1つ。切り替わるのはレイアウトと操作パラメータだけ。

import { layoutProfiles, LAYOUT } from '../../data/config.js';
import { storage } from './storage.js';

const listeners = new Set();
let current = null;

function detect() {
  const manual = storage.getSetting('layoutMode', 'auto');
  if (manual === 'phone' || manual === 'tablet') return manual;
  const w = window.innerWidth, h = window.innerHeight;
  const landscape = w / h >= LAYOUT.landscapeMinAspect;
  // スマホを横にしたら tablet レイアウトへ（高さが足りないので進捗バーは隠す）
  if (w < LAYOUT.phoneMaxWidth) return landscape ? 'tablet' : 'phone';
  if (landscape && h < LAYOUT.landscapeMaxHeight) return 'tablet';
  return 'tablet';
}

function apply() {
  const name = detect();
  const changed = name !== (current && current.name);
  const compact = window.innerHeight < LAYOUT.landscapeMaxHeight &&
                  window.innerWidth / window.innerHeight >= LAYOUT.landscapeMinAspect;
  current = { name, ...layoutProfiles[name], compact };
  // 作図の入力方式は、⚙から手動でも選べる（auto なら端末の既定）
  const dm = storage.getSetting('drawMode', 'auto');
  if (dm === 'tap' || dm === 'drag') current.drawMode = dm;
  document.body.classList.toggle('profile-phone', name === 'phone');
  document.body.classList.toggle('profile-tablet', name === 'tablet');
  document.body.classList.toggle('is-compact', compact);
  if (changed || true) listeners.forEach(fn => fn(current));
  return current;
}

export const layout = {
  init() {
    apply();
    let t = null;
    const onResize = () => { clearTimeout(t); t = setTimeout(apply, 120); };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return current;
  },
  get profile() { return current || apply(); },
  get mode() { return storage.getSetting('layoutMode', 'auto'); },
  setMode(mode) { storage.setSetting('layoutMode', mode); return apply(); },
  get drawMode() { return storage.getSetting('drawMode', 'auto'); },
  setDrawMode(mode) { storage.setSetting('drawMode', mode); return apply(); },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
};
