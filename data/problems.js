// data/problems.js
// 全問題データ。教員が編集するのはこのファイルだけでよい。
// 座標は「左下が原点、右が東（+x）、上が北（+y）」の方眼の格子点。
// 共通の地図：学校(3,3) 駅(6,4) 公園(1,6) 図書館(4,1)

const MAP = {
  school:  { x: 3, y: 3, label: '学校' },
  station: { x: 6, y: 4, label: '駅' },
  park:    { x: 1, y: 6, label: '公園' },
  library: { x: 4, y: 1, label: '図書館' }
};

export const problems = {

  /* ===================== 導入（教師が説明・3分） ===================== */
  intro: {
    title: '運動の表し方',
    minutes: 3,
    scaleLabel: '1マス = 1 km',
    prompt: '学校から東へ 3 km、そこから北へ 4 km 進みました。<br><b>学校からどれだけ離れているでしょう？</b>',
    startLabel: 'はじめる',
    scene: {
      points: {
        school:  { ...MAP.school,  label: '🏫 学校', role: 'origin' },
        station: { ...MAP.station, label: '🚉 駅' },
        park:    { ...MAP.park,    label: '🌳 公園' },
        library: { ...MAP.library, label: '📚 図書館' }
      },
      vectors: []
    }
  },

  /* ===================== ① 位置を矢印で表す ===================== */
  step1: {
    title: '位置を矢印で表す',
    minutes: 4,
    passLine: { correct: 1, of: 2 },
    scaleLabel: '1マス = 1 km',
    items: [
      {
        id: 's1q1',
        type: 'draw-vector',
        prompt: '駅は、学校から東に 3、北に 1 の位置にある。<b>学校から駅への矢印</b>を描こう。',
        style: 'position',
        unit: 'km',
        origin: { ...MAP.school },
        landmarks: [{ ...MAP.station }],
        answer: { from: { x: 3, y: 3 }, to: { x: 6, y: 4 } },
        hints: ['矢印はどこから描き始めますか？ 「学校から駅へ」です。'],
        feedback: [
          { when: 'reversed', text: '向きが逆です。学校から駅へ、の順で描いていますか？' },
          { when: 'wrongStart', text: '描き始めの点を確かめましょう。基準は学校です。' }
        ],
        explanation: '学校を出発点にして、東へ3マス・北へ1マス進んだ先が駅です。',
        reveal: {
          title: 'この矢印を「位置ベクトル」といいます',
          body: '<p>ある基準点から見て、その地点がどこにあるかを表す矢印を <b>位置ベクトル</b> といいます。</p><p>始点についている 🔒 は「置き直せない」という印です。</p>'
        }
      },
      {
        id: 's1q2',
        type: 'draw-vector',
        prompt: '公園は、学校から西に 2、北に 3 の位置にある。同じように<b>学校から公園への矢印</b>を描こう。',
        style: 'position',
        unit: 'km',
        origin: { ...MAP.school },
        landmarks: [{ ...MAP.park }],
        answer: { from: { x: 3, y: 3 }, to: { x: 1, y: 6 } },
        hints: ['西は左向きです。マスをいくつ戻りますか？'],
        feedback: [
          { when: 'reversed', text: '向きが逆です。学校から公園へ、の順で描きましょう。' },
          { when: 'wrongLength', text: '向きは合っています。西に2マス、北に3マス、数え直してみましょう。' }
        ],
        explanation: '学校から西へ2マス、北へ3マス進んだ先が公園です。'
      }
    ]
  },

  /* ===================== ② 変位＝先端から先端へ ===================== */
  step2: {
    title: '変位を矢印で表す',
    minutes: 6,
    passLine: { correct: 2, of: 3 },
    scaleLabel: '1マス = 1 km',
    items: [
      {
        id: 's2q1',
        type: 'draw-vector',
        prompt: '駅から公園へ移動した。<b>この移動を表す矢印</b>を描こう。',
        style: 'displacement',
        unit: 'km',
        landmarks: [{ ...MAP.station }, { ...MAP.park }],
        scene: {
          points: { school: { ...MAP.school, role: 'origin' } },
          vectors: []
        },
        answer: { from: { x: 6, y: 4 }, to: { x: 1, y: 6 }, origin: { x: 3, y: 3 } },
        hints: ['出発点は学校ではありません。「駅から公園へ」の移動です。'],
        feedback: [
          { when: 'reversed', text: '向きが逆です。出発点から到着点へ向かう矢印になっていますか？' },
          { when: 'fromOrigin', text: 'いま知りたいのは「駅から公園へ」の移動です。どこから描き始めますか？' },
          { when: 'wrongStart', text: '描き始めの点を確かめましょう。出発点は駅です。' }
        ],
        explanation: '駅の位置から公園の位置へ、まっすぐ引いた矢印がこの移動を表します。',
        reveal: {
          title: 'この矢印を「変位ベクトル」といいます',
          body: '<p>出発点から到着点へ向かう矢印を <b>変位ベクトル</b> といいます。</p><p>位置ベクトルの「先端から先端へ」引いた矢印だ、と見ることもできます。</p>'
        }
      },
      {
        id: 's2q2',
        type: 'draw-vector',
        prompt: '今度は<b>図書館から公園へ</b>移動した。この移動を表す矢印を描こう。',
        style: 'displacement',
        unit: 'km',
        landmarks: [{ ...MAP.library }, { ...MAP.park }],
        scene: { points: { school: { ...MAP.school, role: 'origin' } }, vectors: [] },
        answer: { from: { x: 4, y: 1 }, to: { x: 1, y: 6 }, origin: { x: 3, y: 3 } },
        hints: ['出発点は図書館、到着点は公園です。'],
        feedback: [
          { when: 'reversed', text: '出発点から到着点へ向かっていますか？' },
          { when: 'fromOrigin', text: '学校からではありません。図書館から描き始めます。' }
        ],
        explanation: '図書館から公園へ、まっすぐ引いた矢印が変位です。'
      },
      {
        id: 's2q3',
        type: 'draw-vector',
        prompt: '★ ぐねぐねした道を通って、<b>駅から図書館へ</b>移動しました。この移動を表す矢印を描こう。',
        style: 'displacement',
        unit: 'km',
        landmarks: [{ ...MAP.station }, { ...MAP.library }],
        scene: { points: { school: { ...MAP.school, role: 'origin' } }, vectors: [] },
        path: [
          { x: 6, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 2 }, { x: 5, y: 3 },
          { x: 3, y: 2 }, { x: 5, y: 1 }, { x: 4, y: 1 }
        ],
        answer: { from: { x: 6, y: 4 }, to: { x: 4, y: 1 }, origin: { x: 3, y: 3 } },
        hints: ['通った道筋の長さではなく、「どこからどこへ」だけを見ます。'],
        feedback: [
          { when: 'wrongLength', text: '道筋の長さを描いていませんか？ 見るのは出発点と到着点だけです。' },
          { when: 'reversed', text: '駅から図書館へ、の順です。' }
        ],
        explanation: '通った道筋がどれだけ曲がっていても、変位は出発点と到着点だけで決まります。',
        reveal: {
          title: '道筋がちがっても、変位は同じ',
          body: '<p>通った道筋が違っても、<b>同じ2点の間なら同じ矢印</b>になります。変位が表しているのは「移動の道のり」ではなく「どこからどこへ動いたか」です。</p>'
        }
      }
    ]
  },

  /* ===================== ②.5a 置き直してみる（最重要） ===================== */
  step25a: {
    title: '置き直してみる',
    minutes: 4,
    passLine: { correct: 4, of: 4 },
    scaleLabel: '1マス = 1 km',
    intro: {
      title: '矢印は、置き直してよいのだろうか',
      body: '<p>画面には <b>位置ベクトル</b>（学校→駅）と <b>変位ベクトル</b>（駅→公園）があります。</p><p>どちらも指でつかんで動かせます。動かすと何が起きるか、両方ためしてみましょう。</p>'
    },
    items: [
      {
        id: 's25a-t1',
        type: 'explore-drag',
        prompt: '課題1｜2本の矢印を<b>それぞれ動かして</b>みよう。動かすと何が変わるだろう。',
        unit: 'km',
        scene: {
          points: {
            school:  { ...MAP.school,  role: 'origin' },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            { id: 'pos',  from: 'school',  to: 'station', style: 'position',     locked: true,  draggable: true, showTipLabel: true },
            { id: 'disp', from: 'station', to: 'park',    style: 'displacement', locked: false, draggable: true }
          ]
        },
        readouts: [
          { id: 'pos',  label: '位置ベクトルの先が指す場所', vector: 'pos',  show: 'tip', watch: true },
          { id: 'disp', label: '変位ベクトルの成分',         vector: 'disp', watch: true, unchangedBadge: true }
        ],
        requirement: { kind: 'eachDragged', ids: ['pos', 'disp'] },
        hints: ['まず 🔒 のついた矢印（学校→駅）をつかんで動かしてみましょう。'],
        reveal: {
          title: '気づいたこと',
          body: '<p>位置ベクトルを動かすと、先が指す場所がどんどん変わってしまいました。指を離すと元に戻ります。</p><p>変位ベクトルを動かしても、成分（東へ何、北へ何）は変わりませんでした。</p>'
        }
      },
      {
        id: 's25a-q1',
        type: 'choice',
        prompt: '課題1のつづき',
        question: '位置ベクトルを平行移動すると、何が言えなくなりますか？',
        showCanvas: false,
        options: [
          { key: 'ア', text: '矢印の長さがわからなくなる', feedback: '長さは動かしても変わりませんでした。もう一度考えてみましょう。' },
          { key: 'イ', text: '矢印の向きがわからなくなる', feedback: '向きも動かしても変わりませんでした。変わってしまったのは何でしたか？' },
          { key: 'ウ', text: 'どの地点を指しているのかがわからなくなる' },
          { key: 'エ', text: '何も困らない', feedback: '先が指す場所が「駅」から「なにもない場所」に変わってしまいました。困りませんか？' }
        ],
        correctIndex: 2,
        correctText: 'そのとおり。位置ベクトルは「基準から見てどこか」を表すので、置き場所を変えると意味が壊れます。',
        explanation: '位置ベクトルは、基準点から出ていることに意味があります。動かすと「どの地点か」がわからなくなります。'
      },
      {
        id: 's25a-t2',
        type: 'choice',
        prompt: '課題2｜考えてみよう',
        question: '離れた場所にいる2つの物体が、それぞれ別の点へ移動しました。2つの変位が等しいことはあり得ますか？',
        showCanvas: false,
        options: [
          { key: 'ア', text: 'あり得る' },
          { key: 'イ', text: 'あり得ない', feedback: '本当にそうでしょうか。次の画面で、自分で作れるか試してみましょう。' }
        ],
        correctIndex: 0,
        correctText: '予想できましたね。では、本当に作れるか試してみましょう。',
        explanation: '実際に作れます。次の画面で確かめましょう。'
      },
      {
        id: 's25a-t2b',
        type: 'free-place',
        prompt: '課題2｜4つの点を動かして、<b>2つの変位を等しく</b>してみよう。',
        unit: 'km',
        scene: {
          points: {
            a1: { x: 1, y: 1, label: '物体A 出発', draggable: true },
            a2: { x: 3, y: 2, label: 'A 到着',   draggable: true },
            b1: { x: 5, y: 5, label: '物体B 出発', draggable: true },
            b2: { x: 6, y: 7, label: 'B 到着',   draggable: true }
          },
          vectors: [
            { id: 'va', from: 'a1', to: 'a2', style: 'displacement' },
            { id: 'vb', from: 'b1', to: 'b2', style: 'displacement' }
          ]
        },
        readouts: [
          { id: 'va', label: 'Aの変位', vector: 'va', watch: true },
          { id: 'vb', label: 'Bの変位', vector: 'vb', watch: true }
        ],
        conditions: [
          { kind: 'vectorsEqual', of: [['a1', 'a2'], ['b1', 'b2']], minLength: 1 },
          { kind: 'pointsApart', of: ['a1', 'b1'], minDistance: 2 }
        ],
        animation: 'parallelMove',
        animatePairs: [['a1', 'a2'], ['b1', 'b2']],
        hintText: '2つの矢印の「東へ何・北へ何」をそろえてみましょう。出発点は離したままで大丈夫です。',
        successText: '離れた場所にいても、2つの変位を等しくできました。',
        hints: ['まず片方の矢印の成分を読み取り、もう片方を同じ成分にしてみましょう。'],
        reveal: {
          title: '🔒 のルール',
          body: '<ul><li><b>位置ベクトル</b>＝置き直すと意味が壊れる（🔒 がつく）</li><li><b>変位ベクトル</b>＝置き直してよい</li></ul><p>これから先も、🔒 のついた矢印は動かしても元に戻ります。</p>'
        }
      }
    ]
  },

  /* ===================== ②.5b 基準を取り替えてみる（本アプリの核） ===================== */
  step25b: {
    title: '基準を取り替えてみる',
    minutes: 3,
    passLine: { correct: 2, of: 2 },
    scaleLabel: '1マス = 1 km',
    transition: {
      title: 'ここから、話が変わります',
      body: '<p>ここまでは「<b>矢印の置き場所</b>」の話でした。</p><p>ここからは「<b>基準そのものを取り替える</b>」話です。別の話なので、切り替えてください。</p>',
      button: '切り替えました'
    },
    items: [
      {
        id: 's25b-t3',
        type: 'explore-drag',
        prompt: '課題3｜<b>基準点 O をドラッグ</b>して、3か所以上に動かしてみよう。何が変わって、何が変わらないだろう。',
        unit: 'km',
        scene: {
          points: {
            O:       { x: 3, y: 3, label: '基準点 O', role: 'origin', draggable: true },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            { id: 'pos',  from: 'O',       to: 'station', style: 'position',     locked: true },
            { id: 'disp', from: 'station', to: 'park',    style: 'displacement', locked: false }
          ]
        },
        readouts: [
          { id: 'pos',  label: '位置ベクトル O→駅',     vector: 'pos',  watch: true },
          { id: 'posm', label: '　　　　　　の大きさ',   vector: 'pos',  show: 'magnitude', watch: true },
          { id: 'disp', label: '変位ベクトル 駅→公園',   vector: 'disp', watch: true, unchangedBadge: true }
        ],
        requirement: { kind: 'distinctPositions', point: 'O', count: 3 },
        hints: ['数値表示を見ながら O を動かしましょう。赤く光った数と、「変化なし」の数があります。'],
        reveal: {
          title: '見えたこと',
          body: '<p>基準点 O を動かすと、<b>位置ベクトルは長さも向きも変わりました</b>。</p><p>いっぽう <b>変位ベクトルはまったく変わりませんでした</b>。</p>'
        }
      },
      {
        id: 's25b-q',
        type: 'choice',
        prompt: 'なぜ変位は変わらないのだろう',
        question: '基準点 O を動かしても変位ベクトルが変わらないのは、なぜですか？',
        showCanvas: false,
        options: [
          { key: 'ア', text: '変位は長さが決まっているから', feedback: '長さが決まっているのは結果です。なぜ決まるのか、を考えてみましょう。' },
          { key: 'イ', text: '変位は2点の位置の差なので、共通の基準がなくなるから' },
          { key: 'ウ', text: '変位は基準点と関係ない場所にあるから', feedback: '場所の問題ではありません。2つの位置ベクトルの関係を思い出しましょう。' },
          { key: 'エ', text: 'たまたま変わらなかっただけ', feedback: '3か所以上動かしても変わりませんでした。偶然ではなさそうです。' }
        ],
        correctIndex: 1,
        correctText: 'そのとおり。変位は「到着点の位置ベクトル − 出発点の位置ベクトル」なので、共通の基準は引き算で消えてしまいます。',
        explanation: '変位は2点の位置の差です。どちらの位置ベクトルにも同じ基準が入っているので、差をとると基準が消えます。',
        reveal: {
          title: '次の時間の予告',
          body: '<p>基準を取り替えるという考え方は、<b>次の時間にもう一度出てきます</b>。</p>'
        }
      }
    ]
  },

  /* ===================== ③ 変位をつなぐ ===================== */
  step3: {
    title: '変位をつなぐ',
    minutes: 5,
    passLine: { correct: 1, of: 2 },
    scaleLabel: '1マス = 1 km',
    items: [
      {
        id: 's3q1',
        type: 'draw-vector',
        prompt: '東へ 3 進み、つづけて北へ 4 進んだ。<b>最初の点から最後の点への矢印</b>を描こう。',
        style: 'displacement',
        unit: 'km',
        scene: {
          points: {
            A: { x: 1, y: 1, label: 'スタート' },
            B: { x: 4, y: 1, label: '' },
            C: { x: 4, y: 5, label: 'ゴール' }
          },
          vectors: [
            { id: 'l1', from: 'A', to: 'B', style: 'displacement', label: '東へ3' },
            { id: 'l2', from: 'B', to: 'C', style: 'displacement', label: '北へ4' }
          ]
        },
        answer: {
          from: { x: 1, y: 1 }, to: { x: 4, y: 5 },
          legs: [{ from: { x: 1, y: 1 }, to: { x: 4, y: 1 } }, { from: { x: 4, y: 1 }, to: { x: 4, y: 5 } }]
        },
        hints: ['聞かれているのは「最初から最後へ」の1本です。途中の点は通りません。'],
        feedback: [
          { when: 'sumOfLengths', text: '3 + 4 = 7 になっていませんか？ 矢印を継ぎ足したとき、終点はどこにありますか？' },
          { when: 'wrongStart', text: '描き始めはスタートの点です。' },
          { when: 'reversed', text: 'スタートからゴールへ、の順で描きましょう。' }
        ],
        explanation: '2本の矢印を継ぎ足したとき、最初の点から最後の点へ引いた矢印が答えです。長さは 7 ではなく 5 になります。',
        reveal: {
          title: 'これが「ベクトルの和」です',
          body: '<p>矢印を継ぎ足して、最初から最後へ引く操作を <b>和</b> といいます。</p><p>②.5a で確かめたとおり、変位は置き直してよいので、2本目を1本目の先端まで持ってきて継ぎ足せます。</p>'
        }
      },
      {
        id: 's3q2',
        type: 'draw-vector',
        prompt: '今度は 3 つ続けて動いた。同じように<b>最初から最後への矢印</b>を描こう。',
        style: 'displacement',
        unit: 'km',
        scene: {
          points: {
            A: { x: 1, y: 1, label: 'スタート' },
            B: { x: 5, y: 1, label: '' },
            C: { x: 5, y: 4, label: '' },
            D: { x: 2, y: 4, label: 'ゴール' }
          },
          vectors: [
            { id: 'l1', from: 'A', to: 'B', style: 'displacement', label: '東へ4' },
            { id: 'l2', from: 'B', to: 'C', style: 'displacement', label: '北へ3' },
            { id: 'l3', from: 'C', to: 'D', style: 'displacement', label: '西へ3' }
          ]
        },
        answer: {
          from: { x: 1, y: 1 }, to: { x: 2, y: 4 },
          legs: [
            { from: { x: 1, y: 1 }, to: { x: 5, y: 1 } },
            { from: { x: 5, y: 1 }, to: { x: 5, y: 4 } },
            { from: { x: 5, y: 4 }, to: { x: 2, y: 4 } }
          ]
        },
        hints: ['何本つないでも同じです。見るのは最初の点と最後の点だけ。'],
        feedback: [
          { when: 'sumOfLengths', text: '4 + 3 + 3 = 10 になっていませんか？ 最後にいる場所はどこですか？' },
          { when: 'wrongLength', text: '向きは合っています。東西と南北、それぞれ何マス動いた結果でしょう。' }
        ],
        explanation: '東へ4・北へ3・西へ3の結果、最初の点から見て東へ1・北へ3の場所にいます。'
      }
    ]
  },

  /* ===================== ④ 速度の矢印 ===================== */
  step4: {
    title: '速度の矢印',
    minutes: 4,
    passLine: { correct: 1, of: 2 },
    scaleLabel: '1マス = 1 km/h（①〜③とはスケールが変わります）',
    items: [
      {
        id: 's4q1',
        type: 'draw-vector',
        prompt: '東へ 6 km の移動に 2 時間かかった。<b>速度の矢印</b>を描こう。<br>（1マスの意味が「km」から「km/h」に変わっています）',
        style: 'velocity',
        unit: 'km/h',
        scene: { points: { P: { x: 1, y: 1, label: 'スタート' } }, vectors: [] },
        answer: { from: { x: 1, y: 1 }, to: { x: 4, y: 1 } },
        hints: ['6 km を 2 時間で進んだので、1 時間あたり何 km 進みますか？'],
        feedback: [
          { when: 'wrongLength', text: '向きは合っています。6 ÷ 2 は何になりますか？' },
          { when: 'reversed', text: '東は右向きです。' }
        ],
        explanation: '6 km ÷ 2 時間 ＝ 3 km/h。向きは移動と同じ東で、長さが 3 マスになります。',
        revealVectors: [
          { from: { x: 1, y: 1 }, to: { x: 7, y: 1 }, style: 'displacement', label: '変位 6 km' },
          { from: { x: 1, y: 1 }, to: { x: 4, y: 1 }, style: 'velocity', label: '速度 3 km/h' }
        ],
        reveal: {
          title: '向きは同じ。変わるのはスケールだけ',
          body: '<p>速度の矢印は、<b>変位と同じ向き</b>です。ちがうのは「1マスが何を表すか」だけ。</p><p>速度ベクトルにも 🔒 はつきません。<b>置き直してよい矢印</b>です。</p>'
        }
      },
      {
        id: 's4q2',
        type: 'draw-vector',
        prompt: '東へ 4 km・北へ 2 km の移動に 2 時間かかった。<b>速度の矢印</b>を描こう。',
        style: 'velocity',
        unit: 'km/h',
        scene: { points: { P: { x: 1, y: 1, label: 'スタート' } }, vectors: [] },
        answer: { from: { x: 1, y: 1 }, to: { x: 3, y: 2 } },
        hints: ['東西と南北を、それぞれ 2 で割ってみましょう。'],
        feedback: [
          { when: 'wrongLength', text: '向きは合っています。東も北も、2 時間で割るといくつですか？' },
          { when: 'wrongDirection', text: '東へ何、北へ何になるか、別々に計算してみましょう。' }
        ],
        explanation: '東へ 4 ÷ 2 = 2、北へ 2 ÷ 2 = 1。斜めでも、向きは移動と同じままです。'
      }
    ]
  },

  /* ===================== ⑤ 速度の合成 ===================== */
  step5: {
    title: '速度の合成',
    minutes: 6,
    passLine: { correct: 2, of: 3 },
    scaleLabel: '1マス = 1 m/s（すべて「地面から見た速度」です）',
    items: [
      {
        id: 's5q1',
        type: 'draw-vector',
        prompt: '動く歩道が東へ 2 m/s で動いている。その上を人が東へ 3 m/s で歩いた。<b>地面から見た人の速度</b>を描こう。',
        style: 'velocity',
        unit: 'm/s',
        scene: {
          points: { P: { x: 1, y: 1, label: 'スタート' } },
          vectors: []
        },
        answer: { from: { x: 1, y: 1 }, to: { x: 6, y: 1 } },
        hints: ['同じ向きなので、2本の矢印を継ぎ足すだけです。'],
        feedback: [
          { when: 'wrongLength', text: '2 と 3 を継ぎ足すと、先端はどこにきますか？' },
          { when: 'reversed', text: 'どちらも東向きです。' }
        ],
        explanation: '同じ向きなので 2 + 3 = 5 m/s。③でやった「継ぎ足し」と同じです。',
        revealVectors: [
          { from: { x: 1, y: 2.6 }, to: { x: 3, y: 2.6 }, style: 'velocity', label: '歩道 2' },
          { from: { x: 3, y: 2.6 }, to: { x: 6, y: 2.6 }, style: 'velocity', label: '人 3' }
        ]
      },
      {
        id: 's5q2',
        type: 'draw-vector',
        prompt: '舟が川を北へ 4 m/s で進もうとしている。川の流れは東へ 3 m/s。<b>地面から見た舟の速度</b>を描こう。',
        style: 'velocity',
        unit: 'm/s',
        scene: {
          points: { P: { x: 2, y: 1, label: '出発' } },
          vectors: []
        },
        answer: { from: { x: 2, y: 1 }, to: { x: 5, y: 5 } },
        hints: ['北へ4の矢印の先端から、東へ3の矢印を継ぎ足してみましょう。'],
        feedback: [
          { when: 'sumOfLengths', text: '4 + 3 = 7 にはなりません。向きが直角のときは、継ぎ足した先端がどこにくるかを見ましょう。' },
          { when: 'wrongDirection', text: '北へ4、東へ3 の両方を満たす先端はどこですか？' }
        ],
        explanation: '北へ4・東へ3 を継ぎ足すと、地面から見た速度は東へ3・北へ4。大きさは 5 m/s になります。',
        revealVectors: [
          { from: { x: 2, y: 1 }, to: { x: 2, y: 5 }, style: 'velocity', label: '舟 4' },
          { from: { x: 2, y: 5 }, to: { x: 5, y: 5 }, style: 'velocity', label: '流れ 3' }
        ],
        revealPath: [{ x: 2, y: 1 }, { x: 5, y: 5 }],
        reveal: {
          title: '舟の航跡',
          body: '<p>点線が、舟が実際に通る道すじ（航跡）です。舟は北を向いているのに、地面から見ると斜めに進みます。</p>'
        }
      },
      {
        id: 's5slider',
        type: 'slider-explore',
        prompt: '大きさ 4 と大きさ 3 を合成したとき、答えは<b>いつでも 7</b> になりますか？　角度を動かして確かめよう。',
        unit: 'm/s',
        sliderLabel: '2つの速度がなす角',
        compose: {
          origin: { x: 1, y: 2 },
          a: { mag: 4 }, aLabel: '4',
          b: { mag: 3 }, bLabel: '3',
          rLabel: '合成'
        },
        checkpoints: [0, 90, 180],
        hints: ['0°、90°、180° の3か所は必ず確かめましょう。'],
        reveal: {
          title: '足し算のようで、足し算ではない',
          body: '<p>0°では 7、90°では 5、180°では 1。<b>大きさは単純に足せません</b>。</p><p>合成した速度は、矢印を継ぎ足した先端で決まります。</p>'
        }
      }
    ]
  },

  /* ===================== 振り返り ===================== */
  reflection: {
    title: '振り返り',
    minutes: 5,
    passLine: { correct: 1, of: 1 },
    items: [
      {
        id: 'reflect1',
        type: 'free-text',
        hideBadge: true,
        prompt: '基準点の場所を変えたとき、変わるものと変わらないものがありました。<b>それぞれ何で、なぜそうなるのでしょうか。</b>',
        rows: 3,
        placeholder: '例：変わったのは…。変わらなかったのは…。なぜなら…。'
      }
    ],
    nextPreview: '<p>次回は、基準を「<b>動いている物体</b>」に取り替えます。</p>'
  }
};
