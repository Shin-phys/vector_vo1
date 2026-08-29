// data/problems-relative.js
// 第2弾（相対速度）の問題データ。
//
// 速度は「方眼のマス／秒」で持つ。表示上の速さは  |v| × unitScale [unit]。
// 例：vel {x:2,y:0} かつ unitScale:10 → 東向き 20 m/s
//
// dimension は data/config.js の relativeConfig.dimension で切り替える（既定 "1d"）。

const ROAD = { y0: 1.6, y1: 6.4 };

// 道路わきの目印。地面に固定されているので、観測者系では一緒に流れる。
// 「背景が流れる」ことが視点の乗り換えの証拠になるので、必ず置くこと。
const ROADSIDE = [
  { id: 't1', kind: 'tree', pos: { x: 2,  y: 6.6 } },
  { id: 't2', kind: 'tree', pos: { x: 8,  y: 6.6 } },
  { id: 's1', kind: 'sign', pos: { x: 14, y: 6.6 } },
  { id: 't3', kind: 'tree', pos: { x: 20, y: 6.6 } },
  { id: 't4', kind: 'tree', pos: { x: 26, y: 6.6 } },
  { id: 't5', kind: 'tree', pos: { x: 32, y: 6.6 } },
  { id: 't6', kind: 'tree', pos: { x: -4, y: 6.6 } }
];

const BASE_1D = {
  dimension: '1d',
  grid: { w: 24, h: 8 },
  road: ROAD,
  unit: 'm/s',
  unitScale: 10,
  duration: 3.6,
  landmarks: ROADSIDE,
  scaleLabel: '方眼1マス＝10 m　／　速度の矢印は1マス＝10 m/s',
  observer: 'A'
};

/* ---------- 1d：直線上（道路を2台が走る） ---------- */
const PROBLEMS_1D = [
  {
    ...BASE_1D,
    id: 'r1',
    title: '同じ向き・Aが遅い',
    setup: '車Aと車Bが、同じ向き（東）に走っています。<b>Aは20 m/s、Bは30 m/s</b>。',
    question: '<b>Aに乗っている人</b>から見ると、Bはどちら向きに、どれくらいの速さで動いて見えるか。矢印を描こう。',
    bodies: [
      { id: 'A', label: '車A', kind: 'car', color: '#2563eb', pos: { x: 6, y: 2.6 }, vel: { x: 2, y: 0 } },
      { id: 'B', label: '車B', kind: 'car', color: '#dc2626', pos: { x: 9, y: 5.2 }, vel: { x: 3, y: 0 } }
    ],
    answer: { x: 1, y: 0 },            // v_AB = v_B - v_A
    expectWord: 'Bは前へ、ゆっくり進んで見える',
    reveal: 'Bの方が速いので、Aから見るとBは<b>前へ 10 m/s</b> で離れていきます。'
  },
  {
    ...BASE_1D,
    id: 'r2',
    title: '同じ向き・Aが速い（予測を裏切る問題）',
    setup: '車Aと車Bが、同じ向き（東）に走っています。<b>Aは30 m/s、Bは20 m/s</b>。',
    question: '<b>Aに乗っている人</b>から見ると、Bはどちら向きに、どれくらいの速さで動いて見えるか。矢印を描こう。',
    bodies: [
      { id: 'A', label: '車A', kind: 'car', color: '#2563eb', pos: { x: 6, y: 2.6 }, vel: { x: 3, y: 0 } },
      { id: 'B', label: '車B', kind: 'car', color: '#dc2626', pos: { x: 9, y: 5.2 }, vel: { x: 2, y: 0 } }
    ],
    answer: { x: -1, y: 0 },
    expectWord: 'Bは後ろへ下がって見える',
    reveal: 'Bは東へ進んでいるのに、Aから見ると<b>後ろ（西）へ 10 m/s</b> で下がって見えます。'
  },
  {
    ...BASE_1D,
    id: 'r3',
    title: '向かい合う',
    setup: '車Aは東へ<b>20 m/s</b>、車Bは西へ<b>10 m/s</b>。向かい合って近づきます。',
    question: '<b>Aに乗っている人</b>から見ると、Bはどちら向きに、どれくらいの速さで動いて見えるか。矢印を描こう。',
    bodies: [
      { id: 'A', label: '車A', kind: 'car', color: '#2563eb', pos: { x: 6,  y: 2.6 }, vel: { x: 2,  y: 0 } },
      { id: 'B', label: '車B', kind: 'car', color: '#dc2626', pos: { x: 18, y: 5.2 }, vel: { x: -1, y: 0 } }
    ],
    answer: { x: -3, y: 0 },
    expectWord: 'どちらの速さより速く近づいて見える',
    reveal: 'Aから見るとBは<b>西向き 30 m/s</b>。どちらの車の速さよりも速く近づいて見えます。'
  }
];

/* ---------- 2d：平面（俯瞰。斜めに交差する2物体／川を渡る舟） ---------- */
const BASE_2D = {
  dimension: '2d',
  grid: { w: 18, h: 18 },
  road: null,
  unit: 'm/s',
  unitScale: 10,
  duration: 3,
  scaleLabel: '方眼1マス＝10 m　／　速度の矢印は1マス＝10 m/s（上から見た図）',
  observer: 'A',
  landmarks: [
    { id: 'm1', kind: 'tree', pos: { x: 2,  y: 15 } },
    { id: 'm2', kind: 'tree', pos: { x: 9,  y: 16 } },
    { id: 'm3', kind: 'sign', pos: { x: 15, y: 14 } },
    { id: 'm4', kind: 'tree', pos: { x: 4,  y: 2  } },
    { id: 'm5', kind: 'tree', pos: { x: 14, y: 3  } }
  ]
};

const PROBLEMS_2D = [
  {
    ...BASE_2D,
    id: 'r1-2d',
    title: '斜めに交差する（Aは東、Bは北）',
    setup: '上から見た図です。Aは<b>東へ 20 m/s</b>、Bは<b>北へ 20 m/s</b> で進みます。',
    question: '<b>Aに乗っている人</b>から見ると、Bはどちら向きに動いて見えるか。矢印を描こう。',
    bodies: [
      { id: 'A', label: 'A', kind: 'dot', color: '#2563eb', pos: { x: 5, y: 9 }, vel: { x: 2, y: 0 } },
      { id: 'B', label: 'B', kind: 'dot', color: '#dc2626', pos: { x: 12, y: 5 }, vel: { x: 0, y: 2 } }
    ],
    answer: { x: -2, y: 2 },
    expectWord: '北西向きに見える',
    reveal: 'Aから見るとBは<b>北西向き</b>（西へ20、北へ20）に動いて見えます。'
  },
  {
    ...BASE_2D,
    id: 'r2-2d',
    title: '川を渡る舟',
    setup: '川の流れは<b>東へ 10 m/s</b>。舟は水に対して<b>北へ 20 m/s</b> で進みます（岸から見ると斜めに進む）。',
    question: '<b>流れ（川の水）に乗っている人</b>から見ると、舟はどちら向きに動いて見えるか。矢印を描こう。',
    observer: 'W',
    bodies: [
      { id: 'W', label: '流木（水と一緒に流れる）', kind: 'dot',  color: '#0ea5e9', pos: { x: 5, y: 5 }, vel: { x: 1, y: 0 } },
      { id: 'S', label: '舟',                     kind: 'boat', color: '#dc2626', pos: { x: 9, y: 4 }, vel: { x: 1, y: 2 } }
    ],
    answer: { x: 0, y: 2 },
    expectWord: 'まっすぐ北へ進んで見える',
    reveal: '水と一緒に流れている人から見ると、舟は<b>まっすぐ北へ 20 m/s</b>。斜めには見えません。'
  },
  {
    ...BASE_2D,
    id: 'r3-2d',
    title: '追い越しながらすれ違う',
    setup: 'Aは<b>北東</b>へ、Bは<b>東</b>へ進みます。',
    question: '<b>Aに乗っている人</b>から見ると、Bはどちら向きに動いて見えるか。矢印を描こう。',
    bodies: [
      { id: 'A', label: 'A', kind: 'dot', color: '#2563eb', pos: { x: 4, y: 5 }, vel: { x: 2, y: 2 } },
      { id: 'B', label: 'B', kind: 'dot', color: '#dc2626', pos: { x: 5, y: 11 }, vel: { x: 3, y: 0 } }
    ],
    answer: { x: 1, y: -2 },
    expectWord: '南東向きに見える',
    reveal: 'Aから見るとBは<b>南東向き</b>（東へ10、南へ20）に動いて見えます。'
  }
];

export const relativeProblems = {
  '1d': PROBLEMS_1D,
  '2d': PROBLEMS_2D
};

/* ---------- シーン0：宣言 ---------- */
export const declare = {
  title: '基準を、動いているものに取り替える',
  body: `
    <p>前回、基準点の場所を変えても<b>変位は変わりません</b>でした。
       （はじめての人は、下の「前提を復習してから」へ）</p>
    <p>今日は、基準を<b>動いている物体</b>に取り替えます。</p>
    <p class="lead-note">同じ運動でも、どこから見るかで見え方が変わります。</p>
  `,
  startLabel: 'はじめる'
};

/* ---------- シーン3：基準を切り替える ---------- */
export const switchScene = {
  prompt: '基準を「地面／A／B」に切り替えて、同じ運動を見比べよう。',
  questions: [
    {
      id: 'q1',
      question: '基準をAにしたとき、Aの速度はどうなりますか？',
      options: [
        { key: 'ア', text: '変わらない' },
        { key: 'イ', text: '0 になる' },
        { key: 'ウ', text: '逆向きになる' }
      ],
      correct: 1,
      hint: '基準をAにするということは、A に乗って見るということ。乗っている自分は動いて見えますか？',
      explain: '基準にした物体は、その基準から見ると<b>必ず速度0</b>です。自分は自分から見れば止まっています。'
    },
    {
      id: 'q2',
      question: '「Aから見たB」と「Bから見たA」の矢印を比べると？',
      options: [
        { key: 'ア', text: '同じ' },
        { key: 'イ', text: '大きさは同じで向きが逆' },
        { key: 'ウ', text: '無関係' }
      ],
      correct: 1,
      requireBothFrames: true,     // AとBの両方に切り替えてから答えさせる
      hint: '実際に基準をAにして矢印を見て、つぎにBにして見比べてから答えよう。',
      explain: 'v<sub>AB</sub> = v<sub>B</sub> − v<sub>A</sub>、v<sub>BA</sub> = v<sub>A</sub> − v<sub>B</sub>。引く順が逆なので<b>大きさは同じで向きが逆</b>になります。'
    }
  ]
};

/* ---------- シーン4：記号へ渡す ---------- */
export const symbolScene = {
  prompt: '矢印の図と式を見比べよう。どちらかをタップすると、対応する部分が両方光ります。',
  formula: 'v_AB = v_B − v_A',
  terms: [
    { id: 'vAB', tex: 'v<sub>AB</sub>', label: 'Aから見たBの速度', arrow: 'relative' },
    { id: 'vB',  tex: 'v<sub>B</sub>',  label: 'Bの速度（地面から見て）', arrow: 'B' },
    { id: 'vA',  tex: 'v<sub>A</sub>',  label: 'Aの速度（地面から見て）', arrow: 'A' }
  ],
  quiz: {
    question: 'Aの速度が<b>東向き 20 m/s</b>、Bの速度が<b>東向き 30 m/s</b> のとき、Aから見たBの速度は？',
    unit: 'm/s',
    answerValue: 10,
    answerDirection: 'east',
    directions: [
      { id: 'east', label: '東向き' },
      { id: 'west', label: '西向き' }
    ],
    explain: 'v<sub>AB</sub> = v<sub>B</sub> − v<sub>A</sub> = 30 − 20 = <b>10</b>。符号が＋なので<b>東向き</b>。'
  }
};
