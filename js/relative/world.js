// js/relative/world.js
// 「本当の運動」だけを持つ層。物体の位置・速度・時刻。
// このファイルは「どの基準から見るか」を一切知らない。
// 観測者のために別の world を作ってはいけない。基準の乗り換えは camera.js の仕事。

/* ---------- ベクトル演算（core/vector.js の V と同じ規約） ---------- */
export const add   = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub   = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const neg   = (a)    => ({ x: -a.x, y: -a.y });
export const scale = (a, k) => ({ x: a.x * k, y: a.y * k });
export const len   = (a)    => Math.hypot(a.x, a.y);
export const isZero = (a, eps = 1e-9) => Math.hypot(a.x, a.y) < eps;
export const lerp  = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });

/**
 * 問題データ（problems-relative.js の1問）から world を作る。
 * @returns {{t:number, grid:{w,h}, bodies:Array, landmarks:Array, gridOffset:{x,y}}}
 */
export function createWorld(problem) {
  return {
    id: problem.id,
    t: 0,
    duration: problem.duration ?? 4,
    dimension: problem.dimension || '1d',
    grid: { w: problem.grid.w, h: problem.grid.h },
    road: problem.road || null,
    unit: problem.unit || 'm/s',
    unitScale: problem.unitScale ?? 10,   // 矢印1マス = この値［unit］
    // gridOffset は「背景（方眼・地面・樹木）をどれだけずらして描くか」。
    // 地面から見ているあいだは 0。camera.transform が観測者系のとき値を入れる。
    gridOffset: { x: 0, y: 0 },
    bodies: (problem.bodies || []).map(b => ({
      ...b,
      start: { ...b.pos },
      pos: { ...b.pos },
      vel: { ...b.vel }
    })),
    landmarks: (problem.landmarks || []).map(l => ({
      ...l,
      start: { ...l.pos },
      pos: { ...l.pos },
      vel: { x: 0, y: 0 }          // 地面に固定された目印（樹木・標識）
    }))
  };
}

/** 時刻 t（秒）の世界。等速なので位置は start + vel*t。 */
export function atTime(world, t) {
  const tt = Math.max(0, Math.min(world.duration, t));
  return {
    ...world,
    t: tt,
    bodies: world.bodies.map(b => ({
      ...b,
      pos: { x: b.start.x + b.vel.x * tt, y: b.start.y + b.vel.y * tt }
    })),
    landmarks: world.landmarks.map(l => ({ ...l, pos: { ...l.start } }))
  };
}

export function advance(world, dt) { return atTime(world, world.t + dt); }
export function reset(world)       { return atTime(world, 0); }
export function isFinished(world)  { return world.t >= world.duration - 1e-6; }

export function body(world, id) {
  return (world.bodies || []).find(b => b.id === id) || null;
}

/* ---------- 表示用の文字列 ---------- */

/** 矢印の長さ［マス］→ 速さの数値 */
export function speedValue(world, v) {
  return Math.round(len(v) * world.unitScale * 10) / 10;
}

/** 向きは方角ではなく ±x / ±y で言う（第1話からの表記に合わせる）。 */
export function directionWord(world, v) {
  if (isZero(v, 1e-6)) return '動かない';
  if (world.dimension === '1d') return v.x > 0 ? '+x 向き' : '−x 向き';
  const ew = v.x === 0 ? '' : (v.x > 0 ? '+x' : '−x');
  const ns = v.y === 0 ? '' : (v.y > 0 ? '+y' : '−y');
  if (ew && ns) return `${ew}・${ns} の向き`;
  return (ew || ns) + ' 向き';
}

/** 「+x 向き 30 m/s」 */
export function velocityText(world, v) {
  if (isZero(v, 1e-6)) return `0 ${world.unit}`;
  return `${directionWord(world, v)} ${speedValue(world, v)} ${world.unit}`;
}
