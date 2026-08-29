// js/relative/camera.js
// 本アプリの心臓部。「どの基準から見るか」だけを担当する。
//
// 大原則：
//   world.js は本当の運動だけを持つ。camera.js がそれを座標変換する。
//   view.js は world と camera を受け取って描くだけ。
//   観測者系のために別の world を作ってはいけない。
//
// gridOffset がこのアプリで最も重要な値。
// 観測者系では、背景の方眼・地面・樹木も一緒に流れなければならない。
// これがないと「球だけが違う速さで動く映像」になり、視点の乗り換えが伝わらない。

import { sub, neg, lerp } from './world.js';

const ZERO = { x: 0, y: 0 };

/**
 * 基準系のオフセット。
 * pos    … 観測者の現在位置（これを引くと観測者が原点に来る）
 * vel    … 観測者の速度（これを引いたものが相対速度）
 * anchor … 画面上のどこに原点を置くか。観測者の「出発点」に置く。
 *          こうすると t=0 では地面ビューと観測者ビューが完全に一致し、
 *          時間が進むにつれて違いが現れる。二画面比較にはこれが効く。
 * @param {object} world
 * @param {"ground"|string} frame
 */
export function offsetFor(world, frame) {
  if (frame === 'ground') return { pos: { ...ZERO }, vel: { ...ZERO }, anchor: { ...ZERO } };
  const obs = (world.bodies || []).find(b => b.id === frame);
  if (!obs) return offsetFor(world, 'ground');
  return { pos: { ...obs.pos }, vel: { ...obs.vel }, anchor: { ...obs.start } };
}

/** オフセットを world 全体に適用する。transform / トランジションの共通実装。 */
export function applyOffset(world, off, frame = 'ground') {
  return {
    ...world,
    frame,
    bodies: (world.bodies || []).map(b => ({
      ...b,
      pos: sub(b.pos, off.pos),     // 観測者を原点に
      vel: sub(b.vel, off.vel)      // これが相対速度
    })),
    landmarks: (world.landmarks || []).map(l => ({
      ...l,
      pos: sub(l.pos, off.pos),
      vel: sub(l.vel, off.vel)
    })),
    gridOffset: neg(off.pos),       // ★背景も一緒に動かす
    anchor: { ...off.anchor }
  };
}

/**
 * frame: "ground" | 物体のid
 * 戻り値は world と同じ形。view.js はこれをそのまま描けばよい。
 */
export function transform(world, frame) {
  if (frame === 'ground') {
    return { ...world, frame: 'ground', gridOffset: { ...ZERO }, anchor: { ...ZERO } };
  }
  return applyOffset(world, offsetFor(world, frame), frame);
}

/** 基準を切り替えるときの中間状態（0→1 で滑らかに移る） */
export function lerpOffset(a, b, u) {
  return {
    pos:    lerp(a.pos,    b.pos,    u),
    vel:    lerp(a.vel,    b.vel,    u),
    anchor: lerp(a.anchor, b.anchor, u)
  };
}

/** 基準の表示名 */
export function frameLabel(world, frame) {
  if (frame === 'ground') return '地面';
  const b = (world.bodies || []).find(x => x.id === frame);
  return b ? (b.label || b.id) : '地面';
}
