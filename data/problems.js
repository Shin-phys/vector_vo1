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
    // 2問目「基準を変えると矢印が変わる」がこのステップの要なので、
    // 1問正解でも通過モーダルを出さない（＝両方やらせる）。
    passLine: { correct: 2, of: 2 },
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
        // 1問目で描いた「学校→駅」を残したまま、基準点だけを公園に変える。
        // 同じ「駅」を指しているのに矢印が変わることを、その場で見せるのがねらい。
        id: 's1q2',
        type: 'draw-vector',
        prompt: 'では、<b>公園から駅</b>はどうでしょうか？　矢印を引き、<b>向きと成分</b>を考えてみよう。',
        style: 'position',
        unit: 'km',
        origin: { ...MAP.park },
        // 公園は item.origin として描かれるので、ここには入れない（二重描きになる）
        scene: {
          points: {
            school:  { ...MAP.school },
            station: { ...MAP.station }
          },
          vectors: [
            { id: 'r1', from: 'school', to: 'station', style: 'position', locked: true, label: '学校から' }
          ]
        },
        answer: { from: { x: 1, y: 6 }, to: { x: 6, y: 4 }, origin: { x: 3, y: 3 } },
        hints: ['基準が学校から公園に変わりました。どこから描き始めますか？'],
        feedback: [
          { when: 'reversed', text: '向きが逆です。公園から駅へ、の順で描きましょう。' },
          { when: 'fromOrigin', text: '学校からではありません。いまの基準は公園です。' },
          { when: 'wrongStart', text: '描き始めの点を確かめましょう。基準は公園です。' }
        ],
        explanation: '公園から東へ5マス、南へ2マス進んだ先が駅です。',
        reveal: {
          title: '駅は動いていないのに、矢印は変わった',
          body: '<p><b>駅の位置は変わっていません。</b>それでも、基準点を学校から公園に変えると、'
              + '矢印の<b>向きも長さも成分も</b>変わりました。</p>'
              + '<p>位置ベクトルは「その地点そのもの」ではなく、'
              + '<b>ある基準から見たときの、そこまでの行き方</b>を表しています。'
              + 'これがベクトルの特徴のひとつです。</p>'
        }
      }
    ]
  },

  /* ===================== ② 変位＝先端から先端へ ===================== */
  step2: {
    title: '変位を矢印で表す',
    minutes: 5,
    // 2問目「道筋が違っても同じ変位」がこのステップの要なので、両方やらせる。
    passLine: { correct: 2, of: 2 },
    scaleLabel: '1マス = 1 km',
    items: [
      {
        id: 's2q1',
        type: 'draw-vector',
        prompt: '学校から見た2つの位置ベクトルを残してあります。'
              + '<br>駅から公園へ移動した。<b>この移動を表す矢印</b>を描こう。',
        style: 'displacement',
        unit: 'km',
        scene: {
          points: {
            school:  { ...MAP.school, role: 'origin' },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          // ①で描いた「学校から」の矢印を、記号つきで残す。
          // 変位が「先端から先端へ」であることが、この2本があると見えやすい。
          vectors: [
            { id: 'rSta',  from: 'school', to: 'station', style: 'position', locked: true, label: 'r駅' },
            { id: 'rPark', from: 'school', to: 'park',    style: 'position', locked: true, label: 'r公園' }
          ]
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
          body: '<p>出発点から到着点へ向かう矢印を <b>変位ベクトル</b> といいます。</p>'
              + '<p>位置ベクトルの「先端から先端へ」引いた矢印だ、と見ることもできます。</p>'
              + '<p class="sym-note">記号では、学校を基準とした駅の位置ベクトルを <b>r<sub>駅</sub></b>、'
              + '公園の位置ベクトルを <b>r<sub>公園</sub></b> と書きます。'
              + 'いま描いた「駅から公園へ」の変位 <b><span class="vec">駅公園</span></b> は '
              + '<b>r<sub>公園</sub> − r<sub>駅</sub></b>。'
              + '<b>矢印は 前→後、式は 後 − 前</b> です。</p>'
        }
      },
      {
        // さっきと同じ「駅から公園へ」を、今度はぐねぐね道で。
        // 例をそろえることで、変わったのは道筋だけだと分かる。
        id: 's2q3',
        type: 'draw-vector',
        prompt: '★ 今度は<b>ぐねぐねした道</b>を通って、さっきと同じ<b>駅から公園へ</b>移動しました。'
              + '<br>この移動を表す矢印を描こう。',
        style: 'displacement',
        unit: 'km',
        landmarks: [{ ...MAP.station }, { ...MAP.park }],
        scene: { points: { school: { ...MAP.school, role: 'origin' } }, vectors: [] },
        path: [
          { x: 6, y: 4 }, { x: 7, y: 6 }, { x: 5, y: 7 }, { x: 4, y: 4 },
          { x: 2, y: 3 }, { x: 1, y: 4 }, { x: 1, y: 6 }
        ],
        answer: { from: { x: 6, y: 4 }, to: { x: 1, y: 6 }, origin: { x: 3, y: 3 } },
        hints: ['通った道筋の長さではなく、「どこからどこへ」だけを見ます。'],
        feedback: [
          { when: 'wrongLength', text: '道筋の長さを描いていませんか？ 見るのは出発点と到着点だけです。' },
          { when: 'reversed', text: '駅から公園へ、の順です。' }
        ],
        explanation: '通った道筋がどれだけ曲がっていても、変位は出発点と到着点だけで決まります。',
        reveal: {
          title: '道筋がちがっても、変位は同じ',
          body: '<p>さっきの1問目と<b>まったく同じ矢印</b>になりました。道筋はぜんぜん違うのにです。</p>'
              + '<p>変位が表しているのは「移動の道のり」ではなく「<b>どこからどこへ</b>動いたか」だけだからです。</p>'
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
      title: 'その矢印は、何を言っている矢印？',
      body: '<p>画面に2本の矢印があります。課題を行う前に、それぞれが何を言っている矢印なのか、声に出して言ってみましょう。</p>'
          + '<ul><li><b>位置ベクトル</b>（学校→駅）…「駅は、学校から東に3・北に1のところにある」</li>'
          + '<li><b>変位ベクトル</b>（駅→公園）…「西に5・北に2動いた」</li></ul>'
          + '<p>声に出した文が、<b>課題を行った後でも成立しているのか</b>を確かめます。</p>'
    },
    items: [
      {
        id: 's25a-t1',
        type: 'explore-drag',
        prompt: '課題1｜2本の矢印を<b>それぞれ動かして</b>みよう。動かしたあと、さっき声に出した文は<b>成立し続けていますか</b>。',
        unit: 'km',
        scene: {
          points: {
            school:  { ...MAP.school,  role: 'origin' },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            { id: 'pos',  from: 'school',  to: 'station', style: 'position',     locked: true,  draggable: true, showTipLabel: true, label: '位置ベクトル' },
            { id: 'disp', from: 'station', to: 'park',    style: 'displacement', locked: false, draggable: true, label: '変位ベクトル' }
          ]
        },
        readouts: [
          { id: 'postip', label: '位置ベクトルの先が指す場所', vector: 'pos',  show: 'tip', watch: true },
          { id: 'poscmp', label: '位置ベクトルの成分',         vector: 'pos',  watch: true, unchangedBadge: true },
          { id: 'disp',   label: '変位ベクトルの成分',         vector: 'disp', watch: true, unchangedBadge: true }
        ],
        requirement: { kind: 'eachDragged', ids: ['pos', 'disp'] },
        progress: {
          dragged: {
            pos:  '<b>位置ベクトル</b>：動かせましたが、手を離すと元に戻ってしまいましたね。動かしているあいだ、矢印の先は「駅」を指していませんでした。',
            disp: '<b>変位ベクトル</b>：動かした場所に、そのまま置いておけましたね。しかも「西へ5・北へ2」は変わっていません。'
          },
          remaining: 'あと {n} 本、動かしてみましょう。',
          done: '2本とも試せました。でも、<b>起きたことは同じではありません</b>でしたね。'
        },
        hints: ['まず 🔒 のついた矢印（学校→駅）をつかんで動かしてみましょう。'],
        reveal: {
          title: '長さも向きも変わっていないのに',
          body: '<p>数字を見ると、<b>どちらの矢印も成分は変わっていません</b>。長さも向きもそのままです。</p>'
              + '<p>それでも位置ベクトルだけは元に戻ります。変わってしまったのは数字ではなく、'
              + '<b>その矢印が意味していたこと</b>のほうです。</p>'
        }
      },
      {
        id: 's25a-q1',
        type: 'choice',
        prompt: '課題1のつづき',
        question: '位置ベクトルを平行移動すると、何が言えなくなりますか？',
        scene: {
          points: {
            school:  { ...MAP.school,  role: 'origin' },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            { id: 'pos',  from: 'school',  to: 'station', style: 'position',     locked: true, label: '位置ベクトル' },
            { id: 'disp', from: 'station', to: 'park',    style: 'displacement', label: '変位ベクトル' }
          ]
        },
        options: [
          { key: 'ア', text: '矢印の長さがわからなくなる', feedback: '長さは動かしても変わりませんでした。数値表示でも「変化なし」でしたね。' },
          { key: 'イ', text: '矢印の向きがわからなくなる', feedback: '向きも変わりませんでした。では、変わってしまったのは何でしたか？' },
          { key: 'ウ', text: 'どの地点を指しているのかがわからなくなる' },
          { key: 'エ', text: '何も困らない', feedback: '「駅は学校から東3・北1にある」——この文がもう言えません。困りませんか？' }
        ],
        correctIndex: 2,
        correctText: 'そのとおり。位置ベクトルは「基準から見てどこか」を言う矢印なので、置き場所を変えると言えなくなります。',
        explanation: '位置ベクトルは、基準点から出ていることに意味があります。動かすと「どの地点か」が言えなくなります。'
      },
      {
        id: 's25a-t2',
        type: 'choice',
        prompt: '課題2｜2つの物体が、それぞれ別の点へ移動しました。',
        question: '離れた場所にいる2つの物体の変位が、<b>等しくなる</b>ことはあり得ますか？',
        scene: {
          points: {
            a1: { x: 1, y: 1, label: '物体A 出発' },
            a2: { x: 3, y: 2, label: 'A 到着' },
            b1: { x: 5, y: 5, label: '物体B 出発' },
            b2: { x: 6, y: 7, label: 'B 到着' }
          },
          vectors: [
            { id: 'va', from: 'a1', to: 'a2', style: 'displacement', label: 'Aの変位' },
            { id: 'vb', from: 'b1', to: 'b2', style: 'displacement', label: 'Bの変位' }
          ]
        },
        paths: [[{ x: 1, y: 1 }, { x: 3, y: 2 }], [{ x: 5, y: 5 }, { x: 6, y: 7 }]],
        pathLine: false,
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
        prompt: '課題2｜4つの点を動かして、<b>2つの変位を等しく</b>してみよう。（出発点は離したままで大丈夫です）',
        unit: 'km',
        scene: {
          points: {
            a1: { x: 1, y: 1, label: '物体A 出発', draggable: true },
            a2: { x: 3, y: 2, label: 'A 到着',   draggable: true },
            b1: { x: 5, y: 5, label: '物体B 出発', draggable: true },
            b2: { x: 6, y: 7, label: 'B 到着',   draggable: true }
          },
          vectors: [
            { id: 'va', from: 'a1', to: 'a2', style: 'displacement', label: 'Aの変位' },
            { id: 'vb', from: 'b1', to: 'b2', style: 'displacement', label: 'Bの変位' }
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
        hintText: '2つの矢印の「東へ何・北へ何」をそろえてみましょう。',
        successText: '離れた場所にいても、2つの変位を等しくできました。',
        hints: ['まず片方の矢印の成分を読み取り、もう片方を同じ成分にしてみましょう。'],
        reveal: {
          title: '🔒 のルール',
          body: '<ul><li><b>位置ベクトル</b>＝どこから出ているかに意味がある。置き直すと言えなくなる（🔒 がつく）</li><li><b>変位ベクトル</b>＝向きと大きさだけを言っている。どこに置いてもよい</li></ul><p>これから先も、🔒 のついた矢印は動かしても元に戻ります。</p>'
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
        prompt: '課題3｜人が駅から公園へ移動しました。<b>基準点 O をドラッグ</b>して、3か所以上に動かしてみよう。',
        unit: 'km',
        scene: {
          points: {
            O:       { x: 3, y: 3, label: '基準点 O', role: 'origin', draggable: true },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            { id: 'pos1', from: 'O',       to: 'station', style: 'position',     locked: true,  label: 'O→駅' },
            { id: 'pos2', from: 'O',       to: 'park',    style: 'position',     locked: true,  label: 'O→公園' },
            { id: 'disp', from: 'station', to: 'park',    style: 'displacement', locked: false, label: '駅→公園' }
          ]
        },
        paths: [[{ x: 6, y: 4 }, { x: 1, y: 6 }]],
        pathLine: false,
        readouts: [
          { id: 'pos1', label: '位置ベクトル O→駅',   vector: 'pos1', watch: true },
          { id: 'pos2', label: '位置ベクトル O→公園', vector: 'pos2', watch: true },
          { id: 'disp', label: '変位ベクトル 駅→公園', vector: 'disp', watch: true, unchangedBadge: true }
        ],
        requirement: { kind: 'distinctPositions', point: 'O', count: 3 },
        progress: {
          remaining: '基準点Oを あと {n} か所 に動かしてみましょう。上の2つと下の1つ、どちらが赤く光りますか。',
          done: '2本の位置ベクトルは<b>2本とも</b>変わりました。変位ベクトルだけが変わりませんでしたね。'
        },
        hints: ['数値表示を見ながら O を動かしましょう。赤く光った数と、「変化なし」の数があります。'],
        reveal: {
          title: '2本が、同じだけずれている',
          body: '<p>O を動かすと、O→駅 と O→公園 の<b>2本が同じだけずれます</b>。</p><p>変位は、その2本の<b>先端どうしを結んだ矢印</b>です。2本が同じだけずれるのだから、結んだ矢印は動きません。</p>'
        }
      },
      {
        id: 's25b-q',
        type: 'choice',
        prompt: 'なぜ変位は変わらないのだろう',
        question: '基準点 O を動かしても変位ベクトルが変わらないのは、なぜですか？',
        scene: {
          points: {
            O:       { x: 3, y: 3, label: '基準点 O', role: 'origin' },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            { id: 'pos1', from: 'O',       to: 'station', style: 'position',     locked: true, label: 'O→駅' },
            { id: 'pos2', from: 'O',       to: 'park',    style: 'position',     locked: true, label: 'O→公園' },
            { id: 'disp', from: 'station', to: 'park',    style: 'displacement', label: '駅→公園' }
          ]
        },
        options: [
          { key: 'ア', text: '変位は長さも向きも決まっている量なので、基準を動かしても変わらないから', feedback: '「決まっている」のは結果です。なぜ決まるのか、画面で起きたことから考えてみましょう。' },
          { key: 'イ', text: '基準を動かすと2本の位置ベクトルが同じだけずれるので、その差は変わらないから' },
          { key: 'ウ', text: '変位は基準点から離れた場所にあるので、基準の影響を受けないから', feedback: '場所の遠さの問題ではありません。O を駅のすぐ隣に置いても変位は変わりませんでした。' },
          { key: 'エ', text: '今回はたまたま変わらなかっただけで、いつも変わらないとは限らないから', feedback: '3か所以上動かしても変わりませんでした。偶然ではなさそうです。' }
        ],
        correctIndex: 1,
        correctText: 'そのとおり。O→駅 と O→公園 が同じだけずれるので、その先端どうしを結んだ変位は動きません。',
        explanation: '変位は2本の位置ベクトルの差です。基準を動かすと2本とも同じだけずれるので、差は変わりません。',
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
    passLine: { correct: 2, of: 3 },
    scaleLabel: '1マス = 1 km',
    items: [
      {
        id: 's3join',
        type: 'free-place',
        prompt: '課題｜離れた場所にある <b>② の矢印をドラッグして、① の矢印の先端に継ぎ足そう</b>。',
        unit: 'km',
        scene: {
          points: {
            A: { x: 1, y: 1, label: 'スタート' },
            B: { x: 4, y: 1, label: '' },
            C: { x: 6, y: 3, label: '' },
            D: { x: 6, y: 7, label: '' }
          },
          vectors: [
            { id: 'l1', from: 'A', to: 'B', style: 'displacement', label: '① 東へ3' },
            { id: 'l2', from: 'C', to: 'D', style: 'displacement', label: '② 北へ4', draggable: true, locked: false }
          ]
        },
        readouts: [
          { id: 'l2', label: '② の成分', vector: 'l2', watch: true, unchangedBadge: true }
        ],
        conditions: [{ kind: 'vectorsConnected', of: ['l1', 'l2'] }],
        hintText: '② の矢印をつかんで、① の矢印の先端まで運びましょう。運んでも成分は変わりません。',
        successText: '① の先端に ② を継ぎ足せました。',
        hints: ['②.5a でやったとおり、変位ベクトルは置き直してよい矢印です。'],
        reveal: {
          title: 'なぜ運んでよいのか',
          body: '<p>②.5a で確かめたとおり、<b>変位は置き直してよい矢印</b>でした。だから2本目を1本目の先端まで運んできて、継ぎ足すことができます。</p>'
        }
      },
      {
        id: 's3q1',
        type: 'draw-vector',
        prompt: 'いま継ぎ足した2本について、<b>最初の点から最後の点への矢印</b>を描こう。',
        style: 'displacement',
        unit: 'km',
        scene: {
          points: {
            A: { x: 1, y: 1, label: 'スタート' },
            B: { x: 4, y: 1, label: '' },
            C: { x: 4, y: 5, label: 'ゴール' }
          },
          vectors: [
            { id: 'l1', from: 'A', to: 'B', style: 'displacement', label: '① 東へ3', appearDelay: 0.2 },
            { id: 'l2', from: 'B', to: 'C', style: 'displacement', label: '② 北へ4', appearDelay: 1.0 }
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
          body: '<p>矢印を継ぎ足して、最初から最後へ引く操作を <b>和</b> といいます。</p><p>いま自分の手で2本目を運んで継ぎ足したとおり、変位は置き直してよいので、この操作がいつでもできます。</p>'
        }
      },
      {
        id: 's3q2',
        type: 'draw-vector',
        prompt: '別の例です。今度は3つ続けて動きました。同じように<b>最初から最後への矢印</b>を描こう。',
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
            { id: 'l1', from: 'A', to: 'B', style: 'displacement', label: '① 東へ4', appearDelay: 0.2 },
            { id: 'l2', from: 'B', to: 'C', style: 'displacement', label: '② 北へ3', appearDelay: 0.9 },
            { id: 'l3', from: 'C', to: 'D', style: 'displacement', label: '③ 西へ3', appearDelay: 1.6 }
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
    minutes: 6,
    passLine: { correct: 2, of: 3 },
    scaleLabel: '1マス = 1 km/h（①〜③とはスケールが変わります）',
    transition: {
      title: 'ここから、速度の話に入ります',
      body: '<p>ここまでは「<b>どこからどこへ動いたか</b>」＝変位を見てきました。</p>'
          + '<p>ここからは「<b>どれくらいの速さで動いているか</b>」を矢印で表します。</p>'
          + '<p>方眼の1マスの意味が <b>km から km/h へ</b> 変わります。'
          + '矢印の描き方そのものは、これまでとまったく同じです。</p>',
      button: 'わかった'
    },
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
        // 直線上では、向きを符号で表せることをここで見せる。
        // 第2弾（Aから見るとBが西へ下がって見える）の準備でもある。
        id: 's4west',
        type: 'draw-vector',
        prompt: '今度は<b>西へ 6 km</b> の移動に 2 時間かかった。速度の矢印を描こう。',
        style: 'velocity',
        unit: 'km/h',
        scene: { points: { P: { x: 7, y: 1, label: 'スタート' } }, vectors: [] },
        answer: { from: { x: 7, y: 1 }, to: { x: 4, y: 1 } },
        hints: ['速さは前の問題と同じです。ちがうのは向きだけ。'],
        feedback: [
          { when: 'reversed', text: '西は左向きです。矢印はどちらを向きますか？' },
          { when: 'wrongLength', text: '向きは合っています。6 ÷ 2 は何になりますか？' }
        ],
        explanation: '速さは 6 ÷ 2 ＝ 3 km/h。前の問題と同じ大きさで、向きだけが反対です。',
        reveal: {
          title: '東を「＋」と決めると、西向きは「−」',
          body: '<p>矢印の<b>長さは前の問題と同じ</b>で、向きだけが反対でした。'
              + '成分の表示も <b>(−3, 0)</b> になっています。</p>'
              + '<p>直線上の運動では、いちいち「西向きに 3」と書くかわりに、'
              + '<b>東を＋と決めて −3 km/h</b> と書くことがあります。'
              + '<b>符号が向きを表している</b>わけです。</p>'
              + '<p class="sym-note">この書き方は、あとで「相手から見ると後ろへ下がって見える」'
              + 'という場面でそのまま使います。</p>'
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
    transition: {
      title: '動いているものが、2つ登場します',
      body: '<p>ここまでは、動いているものは<b>1つ</b>でした。</p>'
          + '<p>ここからは、<b>動く歩道の上を人が歩く</b>、<b>流れる川を舟が進む</b>——のように、'
          + '<b>2つの動きが重なる</b>場面をあつかいます。</p>'
          + '<p>「地面から見ると、どう動いて見えるか」が問題になります。</p>',
      button: 'わかった'
    },
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

  /* ===================== ⑥ 記号へ渡す ===================== */
  // 第2弾シーン4と同じ形の画面。見た目をそろえることで、
  // 相対速度 v_AB = v_B − v_A が「前にやったのと同じ形」に見えるようにする。
  step6: {
    title: '記号へ渡す',
    minutes: 4,
    scaleLabel: '1マス = 1 km',
    prompt: '基準点 <b>O</b> は学校。図と式を見比べよう。どちらかをタップすると、両方が光ります。',
    // 図は data の座標をそのまま使う（学校＝基準点 O）
    origin: { x: 3, y: 3, label: 'O' },
    places: [
      { id: 'station', x: 6, y: 4, label: '駅' },
      { id: 'park',    x: 1, y: 6, label: '公園' }
    ],
    terms: [
      { id: 'disp', tex: '<span class="vec">駅公園</span>', label: '駅から公園への変位（矢印は 駅→公園）' },
      { id: 'rPark', tex: 'r<sub>公園</sub>', label: '公園の位置ベクトル（O から）' },
      { id: 'rStation', tex: 'r<sub>駅</sub>', label: '駅の位置ベクトル（O から）' }
    ],
    rule: '<b>矢印は 前→後、式は 後 − 前。</b>添字は「基準 → 対象」の順に書きます。',
    quizOrder: {
      question: 'では、<b>公園から駅へ</b>の変位を式で書くと？',
      options: [
        { key: 'ア', text: 'r<sub>公園</sub> − r<sub>駅</sub>', feedback: 'それは「駅から公園へ」の式です。向きが逆になっています。' },
        { key: 'イ', text: 'r<sub>駅</sub> − r<sub>公園</sub>', feedback: '' },
        { key: 'ウ', text: 'r<sub>駅</sub> ＋ r<sub>公園</sub>', feedback: '足すと、どちらの地点でもない場所を指してしまいます。' }
      ],
      correct: 1,
      explain: '出発が公園、到着が駅。<b>後 − 前</b>なので r<sub>駅</sub> − r<sub>公園</sub> です。矢印も 公園→駅 の向きになります。'
    },
    quizValue: {
      question: '駅から公園への変位を、<b>向きと大きさ</b>で答えよう。',
      answer: { x: -5, y: 2 },
      explain: 'r<sub>公園</sub> − r<sub>駅</sub> ＝ (−2, 3) − (3, 1) ＝ <b>(−5, 2)</b>。'
             + 'つまり <b>西へ 5 km、北へ 2 km</b>。引いた答えが負になる向きが「西・南」です。'
    }
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
