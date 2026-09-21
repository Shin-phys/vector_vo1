// data/config.js
// 色・線種・スナップ・判定許容・ヒント秒数・端末プロファイルなど、全設定の一元管理。
// 数値や色をコード側に直接書かず、必ずこのファイルの定数を参照すること。

export const COLORS = {
  bg: '#ffffff',
  grid: '#dde3ea',
  gridMajor: '#c2ccd6',
  axis: '#94a3b8',
  position: '#6b7280',      // 位置ベクトル：グレー
  displacement: '#6b7280',  // 変位ベクトル：グレー（破線）
  velocity: '#2563eb',      // 速度ベクトル：青
  resultant: '#1d4ed8',     // 合成ベクトル：同色の太線
  guide: '#b6c0cb',         // 補助線：薄いグレー点線
  answer: '#16a34a',
  point: '#0f172a',
  origin: '#b45309',
  landmark: '#0f172a',
  correct: '#15803d',
  wrong: '#b91c1c',
  flash: '#dc2626',
  lock: '#b45309'
};

// 矢印の見た目。style 名は problems.js の item.style / vector.style から参照する。
export const VECTOR_STYLES = {
  position:     { color: COLORS.position,     width: 0.075, dash: null,      head: 0.34, locked: true  },
  displacement: { color: COLORS.displacement, width: 0.075, dash: '0.26 0.2', head: 0.34, locked: false },
  velocity:     { color: COLORS.velocity,     width: 0.085, dash: null,      head: 0.36, locked: false },
  resultant:    { color: COLORS.resultant,    width: 0.14,  dash: null,      head: 0.46, locked: false },
  guide:        { color: COLORS.guide,        width: 0.05,  dash: '0.08 0.16', head: 0,   locked: false },
  answer:       { color: COLORS.answer,       width: 0.16,  dash: null,      head: 0.42, locked: false },
  draft:        { color: COLORS.velocity,     width: 0.09,  dash: null,      head: 0.36, locked: false }
};

// 判定許容
export const JUDGE = {
  angleToleranceDeg: 10,   // 向きの許容
  lengthTolerance: 0.5,    // 大きさの許容（マス）
  startTolerance: 0.5,     // 始点位置の許容（マス）
  reversedAngleDeg: 150    // これ以上開いていたら「向きが逆」と推定
};

// ヒント
export const HINTS = {
  level1Sec: 30,   // 無操作30秒 → 言葉のヒント
  level2Sec: 60,   // 無操作60秒 → 補助線
  showAnswerButton: true
};

// 進行
export const FLOW = {
  maxAttempts: 3,              // 3回誤答したら解説を出して通す
  passLineDefault: { correct: 2, of: 3 },
  advanceDelayMs: 700
};

export const SNAP = {
  enabled: true,               // 方眼スナップは全ステップでON
  gridStep: 1
};

// 端末プロファイル（レイアウトと操作パラメータのみを切り替える。アプリは1つ）
// drawMode: 'tap'（①始点→②終点）／ 'drag'（押したまま引く）
// スマホは tap が既定。ドラッグは指を離した瞬間に確定してしまい、
// 始点が指で隠れたまま決まってしまうため。⚙から手動で変えられる。
export const layoutProfiles = {
  // snapRadius は「画面に見えている点」への吸着半径(px)。スマホはかなり甘くとる。
  phone:  { gridSize: 8,  snapRadius: 46, touchOffsetY: 18, minHitSize: 44, orientation: 'portrait', magnifier: true,  drawMode: 'drag' },
  tablet: { gridSize: 10, snapRadius: 24, touchOffsetY: 0,  minHitSize: 32, orientation: 'any',      magnifier: false, drawMode: 'drag' }
};

export const LAYOUT = {
  phoneMaxWidth: 600,       // ビューポート幅がこれ未満なら phone
  landscapeMinAspect: 1.2,  // 横持ち判定（幅/高さ）
  landscapeMaxHeight: 560   // 横持ちで高さが足りないときは進捗バーを隠す
};

export const CANVAS = {
  pad: 0.9,             // 方眼の外側余白（マス単位）
  fontSize: 0.42,
  pointRadius: 0.13,
  hitRadius: 0.55,
  magnifierZoom: 2
};

export const STORAGE_KEY = 'vec1.progress.v1';

export const TEXT = {
  next: '次へ',
  retry: 'やり直し',
  hint: 'ヒント',
  showAnswer: '答えを見る',
  check: '判定する',
  correct: '正解！',
  passed: 'このステップは通過です',
  settings: '設定'
};

/* =========================================================================
   第2弾（相対速度）用の設定。
   色・錠前・レイアウトプロファイル・判定許容は上の共通定義をそのまま使う。
   ここには「第2弾でしか使わない」ものだけを置く。
   ========================================================================= */

export const relativeConfig = {
  dimension: '1d',        // "1d" | "2d"　既定は 1d（直線上のみ）
  tickMs: 16,             // アニメーションの更新間隔の目安
  speedScale: 0.25,       // 速度[マス/秒表示] → 実際の移動速度の倍率（授業で見やすい速さ）
  transitionMs: 500,      // シーン3のカメラ移動（削ってよい要素）
  predictTolerance: {     // 予測矢印の「合っていたか」表示に使う許容（判定はしないが色分けに使う）
    angleDeg: JUDGE.angleToleranceDeg,
    length: JUDGE.lengthTolerance
  }
};

// 第2弾で使う追加の矢印スタイル。色の規約は第1弾と共通。
export const RELATIVE_STYLES = {
  predict:  { color: '#7c3aed', width: 0.10, dash: '0.3 0.22', head: 0.38, locked: false }, // 生徒の予測
  relative: { color: COLORS.resultant, width: 0.14, dash: null, head: 0.46, locked: false } // 相対速度（差＝太線）
};

export const RELATIVE_TEXT = {
  play: '再生',
  pause: '一時停止',
  restart: '最初から',
  slow: 'ゆっくり見る',
  showVectors: '速度ベクトルを表示',
  frameGround: '地面',
  drawFirst: 'まず予測を描こう'
};

export const RELATIVE_STORAGE_KEY = 'vec2.relative.v1';
