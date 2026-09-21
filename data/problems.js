// data/problems.js
// 全問題データ。教員が編集するのはこのファイルだけでよい。
// 座標は「左下が原点、右が +x、上が +y」の方眼の格子点。
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
    prompt: '学校から +x に 3 km、そこから +y に 4 km 進みました。<br><b>学校からどれだけ離れているでしょう？</b>',
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
        prompt: '駅は、学校から <b>+x に 3、+y に 1</b> の位置にある。<b>学校から駅への矢印</b>を描こう。',
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
        explanation: '学校を出発点にして、+x に 3 マス・+y に 1 マス進んだ先が駅です。',
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
        explanation: '公園から +x に 5 マス、−y に 2 マス進んだ先が駅です。',
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
          + '<ul><li><b>位置ベクトル</b>（学校→駅）…「駅は、学校から x に +3・y に +1 のところにある」</li>'
          + '<li><b>変位ベクトル</b>（駅→公園）…「x に −5・y に +2 動いた」</li></ul>'
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
            disp: '<b>変位ベクトル</b>：動かした場所に、そのまま置いておけましたね。しかも「x −5・y +2」は変わっていません。'
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
          { key: 'エ', text: '何も困らない', feedback: '「駅は学校から x +3・y +1 にある」——この文がもう言えません。困りませんか？' }
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
        hintText: '2つの矢印の「x にいくつ・y にいくつ」をそろえてみましょう。',
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
            { id: 'l1', from: 'A', to: 'B', style: 'displacement', label: '① x に +3' },
            { id: 'l2', from: 'C', to: 'D', style: 'displacement', label: '② y に +4', draggable: true, locked: false }
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
            { id: 'l1', from: 'A', to: 'B', style: 'displacement', label: '① x に +3', appearDelay: 0.2 },
            { id: 'l2', from: 'B', to: 'C', style: 'displacement', label: '② y に +4', appearDelay: 1.0 }
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
            { id: 'l1', from: 'A', to: 'B', style: 'displacement', label: '① x に +4', appearDelay: 0.2 },
            { id: 'l2', from: 'B', to: 'C', style: 'displacement', label: '② y に +3', appearDelay: 0.9 },
            { id: 'l3', from: 'C', to: 'D', style: 'displacement', label: '③ x に −3', appearDelay: 1.6 }
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
          { when: 'wrongLength', text: '向きは合っています。x と y、それぞれ何マス動いた結果でしょう。' }
        ],
        explanation: 'x +4・y +3・x −3 の結果、最初の点から見て x +1・y +3 の場所にいます。'
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
        prompt: '<b>+x に 6 km</b> の移動に 2 時間かかった。<b>速度の矢印</b>を描こう。<br>（1マスの意味が「km」から「km/h」に変わっています）',
        style: 'velocity',
        unit: 'km/h',
        scene: { points: { P: { x: 1, y: 1, label: 'スタート' } }, vectors: [] },
        answer: { from: { x: 1, y: 1 }, to: { x: 4, y: 1 } },
        hints: ['6 km を 2 時間で進んだので、1 時間あたり何 km 進みますか？'],
        feedback: [
          { when: 'wrongLength', text: '向きは合っています。6 ÷ 2 は何になりますか？' },
          { when: 'reversed', text: '+x は右向きです。' }
        ],
        explanation: '6 km ÷ 2 時間 ＝ 3 km/h。向きは移動と同じ +x で、長さが 3 マスになります。',
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
        // 第2弾（Aから見ると B が −x へ下がって見える）の準備でもある。
        id: 's4west',
        type: 'draw-vector',
        prompt: '今度は<b>−x に 6 km</b> の移動に 2 時間かかった。速度の矢印を描こう。',
        style: 'velocity',
        unit: 'km/h',
        scene: { points: { P: { x: 7, y: 1, label: 'スタート' } }, vectors: [] },
        answer: { from: { x: 7, y: 1 }, to: { x: 4, y: 1 } },
        hints: ['速さは前の問題と同じです。ちがうのは向きだけ。'],
        feedback: [
          { when: 'reversed', text: '−x は左向きです。矢印はどちらを向きますか？' },
          { when: 'wrongLength', text: '向きは合っています。6 ÷ 2 は何になりますか？' }
        ],
        explanation: '速さは 6 ÷ 2 ＝ 3 km/h。前の問題と同じ大きさで、向きだけが反対です。',
        reveal: {
          title: '右向きを +x と決めると、左向きは「−」',
          body: '<p>矢印の<b>長さは前の問題と同じ</b>で、向きだけが反対でした。'
              + '成分の表示も <b>(−3, 0)</b> になっています。</p>'
              + '<p>直線上の運動では、いちいち「左向きに 3」と書くかわりに、'
              + '<b>右向きを +x と決めて −3 km/h</b> と書くことがあります。'
              + '<b>符号が向きを表している</b>わけです。</p>'
              + '<p class="sym-note">この書き方は、あとで「相手から見ると後ろへ下がって見える」'
              + 'という場面でそのまま使います。</p>'
        }
      },
      {
        id: 's4q2',
        type: 'draw-vector',
        prompt: '<b>x に +4 km・y に +2 km</b> の移動に 2 時間かかった。<b>速度の矢印</b>を描こう。',
        style: 'velocity',
        unit: 'km/h',
        scene: { points: { P: { x: 1, y: 1, label: 'スタート' } }, vectors: [] },
        answer: { from: { x: 1, y: 1 }, to: { x: 3, y: 2 } },
        hints: ['x と y を、それぞれ 2 で割ってみましょう。'],
        feedback: [
          { when: 'wrongLength', text: '向きは合っています。x も y も、2 時間で割るといくつですか？' },
          { when: 'wrongDirection', text: 'x にいくつ、y にいくつになるか、別々に計算してみましょう。' }
        ],
        explanation: 'x は 4 ÷ 2 = 2、y は 2 ÷ 2 = 1。斜めでも、向きは移動と同じままです。'
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
        prompt: '動く歩道が +x に 2 m/s で動いている。その上を人が +x に 3 m/s で歩いた。<b>地面から見た人の速度</b>を描こう。',
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
          { when: 'reversed', text: 'どちらも +x 向きです。' }
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
        prompt: '舟が川を +y に 4 m/s で進もうとしている。川の流れは +x に 3 m/s。<b>地面から見た舟の速度</b>を描こう。',
        style: 'velocity',
        unit: 'm/s',
        scene: {
          points: { P: { x: 2, y: 1, label: '出発' } },
          vectors: []
        },
        answer: { from: { x: 2, y: 1 }, to: { x: 5, y: 5 } },
        hints: ['y に +4 の矢印の先端から、x に +3 の矢印を継ぎ足してみましょう。'],
        feedback: [
          { when: 'sumOfLengths', text: '4 + 3 = 7 にはなりません。向きが直角のときは、継ぎ足した先端がどこにくるかを見ましょう。' },
          { when: 'wrongDirection', text: 'y に +4、x に +3 の両方を満たす先端はどこですか？' }
        ],
        explanation: 'y に +4・x に +3 を継ぎ足すと、地面から見た速度は x +3・y +4。大きさは 5 m/s になります。',
        revealVectors: [
          { from: { x: 2, y: 1 }, to: { x: 2, y: 5 }, style: 'velocity', label: '舟 4' },
          { from: { x: 2, y: 5 }, to: { x: 5, y: 5 }, style: 'velocity', label: '流れ 3' }
        ],
        revealPath: [{ x: 2, y: 1 }, { x: 5, y: 5 }],
        reveal: {
          title: '舟の航跡',
          body: '<p>点線が、舟が実際に通る道すじ（航跡）です。舟は +y を向いているのに、地面から見ると斜めに進みます。</p>'
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
      { id: 'rPark', tex: 'r<sub>公園</sub>', label: '公園＝<b>到着（aft）</b>の位置ベクトル（O から）' },
      { id: 'rStation', tex: 'r<sub>駅</sub>', label: '駅＝<b>出発（bef）</b>の位置ベクトル（O から）' }
    ],
    rule: '出発を <b>bef</b>、到着を <b>aft</b> と呼びます。'
        + '<b>矢印は bef → aft、式は aft − bef。</b>'
        + 'つまり <b>Δr ＝ r<sub>aft</sub> − r<sub>bef</sub></b>。添字は「基準 → 対象」の順に書きます。',
    quizOrder: {
      question: 'では、<b>公園から駅へ</b>の変位を式で書くと？',
      options: [
        { key: 'ア', text: 'r<sub>公園</sub> − r<sub>駅</sub>', feedback: 'それは「駅から公園へ」の式です。いまは公園が bef、駅が aft ですよ。' },
        { key: 'イ', text: 'r<sub>駅</sub> − r<sub>公園</sub>', feedback: '' },
        { key: 'ウ', text: 'r<sub>駅</sub> ＋ r<sub>公園</sub>', feedback: '足すと、どちらの地点でもない場所を指してしまいます。' }
      ],
      correct: 1,
      explain: '出発（bef）が公園、到着（aft）が駅。<b>aft − bef</b> なので r<sub>駅</sub> − r<sub>公園</sub> です。矢印も 公園→駅 の向きになります。'
    },
    quizValue: {
      question: '駅から公園への変位を、<b>向きと大きさ</b>で答えよう。',
      answer: { x: -5, y: 2 },
      explain: 'aft − bef ＝ r<sub>公園</sub> − r<sub>駅</sub> ＝ (−2, 3) − (3, 1) ＝ <b>(−5, 2)</b>。'
             + 'つまり <b>x に −5 km、y に +2 km</b>。引き算の答えが負になれば、その向きは −x（左）・−y（下）です。'
    }
  },


  /* ===================== 発展：斜方投射（第1話と第2話のあいだ） =====================
     位置ベクトルは描画済み。基準点 O はどの画面でもドラッグできる（第1話の確認）。
     P0〜P3 は 1 秒ごとの位置。v01=(2,4) v12=(2,2) v23=(2,0) なので Δv はどちらも (0,−2)。 */

  ext1: {
    title: '位置ベクトルから速度ベクトルをつくる',
    minutes: 5,
    passLine: { correct: 2, of: 4 },
    scaleLabel: '1マス = 1 m　／　コマの間隔は Δt = 1 秒',
    items: [
      {
        id: 'ext1-t0',
        type: 'explore-drag',
        prompt: 'ボールを斜めに投げ上げ、<b>1秒ごと</b>の位置を記録しました。まず<b>基準点 O をドラッグ</b>して、2か所以上に動かしてみよう。',
        unit: 'm',
        scene: {
          points: {
            O:  { x: 0, y: 0, label: 'O', role: 'origin', draggable: true },
            P0: { x: 1, y: 1, label: 'P₀' },
            P1: { x: 3, y: 5, label: 'P₁' },
            P2: { x: 5, y: 7, label: 'P₂' },
            P3: { x: 7, y: 7, label: 'P₃' }
          },
          vectors: [
            { id: 'r0',  from: 'O',  to: 'P0', style: 'position',     locked: true, label: 'r₀' },
            { id: 'r1',  from: 'O',  to: 'P1', style: 'position',     locked: true, label: 'r₁' },
            { id: 'd01', from: 'P0', to: 'P1', style: 'displacement', locked: false, label: 'P₀→P₁' }
          ]
        },
        readouts: [
          { id: 'r0',  label: '位置ベクトル r₀',   vector: 'r0',  watch: true },
          { id: 'r1',  label: '位置ベクトル r₁',   vector: 'r1',  watch: true },
          { id: 'd01', label: '変位 P₀→P₁',        vector: 'd01', watch: true, unchangedBadge: true }
        ],
        requirement: { kind: 'distinctPositions', point: 'O', count: 2 },
        progress: {
          remaining: 'あと {n} か所、O を動かしてみましょう。どれが赤く光りますか。',
          done: '第1話と同じです。<b>r は変わり、変位は変わりません。</b>これから描く矢印も、O の場所に左右されません。'
        },
        hints: ['第1話でやったことと同じです。基準を動かすと何が変わり、何が変わらなかったでしょう。'],
        reveal: {
          title: 'だから安心して描けます',
          body: '<p>これから点と点のあいだに矢印を描いていきます。それらは <b>O をどこに置いても変わりません</b>。</p>'
        }
      },
      {
        id: 'ext1-v01',
        type: 'draw-vector',
        prompt: '<b>P₀ から P₁ への変位</b>を描こう。Δt = 1 秒なので、この矢印がそのまま<b>速度ベクトル v₀₁</b>になります。',
        style: 'velocity',
        unit: 'm/s',
        scene: {
          points: {
            O:  { x: 0, y: 0, label: 'O', role: 'origin', draggable: true },
            P0: { x: 1, y: 1, label: 'P₀' },
            P1: { x: 3, y: 5, label: 'P₁' },
            P2: { x: 5, y: 7, label: 'P₂' },
            P3: { x: 7, y: 7, label: 'P₃' }
          },
          vectors: [
            { id: 'r0', from: 'O', to: 'P0', style: 'position', locked: true, label: 'r₀' },
            { id: 'r1', from: 'O', to: 'P1', style: 'position', locked: true, label: 'r₁' },
            { id: 'r2', from: 'O', to: 'P2', style: 'position', locked: true, label: 'r₂' },
            { id: 'r3', from: 'O', to: 'P3', style: 'position', locked: true, label: 'r₃' }
          ]
        },
        answer: { from: { x: 1, y: 1 }, to: { x: 3, y: 5 } },
        hints: ['位置ベクトルの先端どうしを結びます。P₀ から P₁ へ。'],
        feedback: [
          { when: 'reversed', text: 'P₀ から P₁ へ、時間の進む順に描きます。' },
          { when: 'fromOrigin', text: 'O からではありません。P₀ から描き始めます。' }
        ],
        explanation: 'P₀ から P₁ へ、x +2・y +4。Δt = 1 秒なので v₀₁ = (2, 4) m/s です。',
        reveal: {
          title: 'Δt = 1 秒のとき、変位と速度は同じ矢印',
          body: '<p>v = Δr / Δt でした。1 秒あたりで見ているので、<b>変位の矢印がそのまま速度の矢印</b>になります。</p><p>ただし目盛の意味は m から m/s に変わっています。</p>'
        }
      },
      {
        id: 'ext1-v12',
        type: 'draw-vector',
        prompt: '同じように、<b>v₁₂</b>（P₁ から P₂ へ）を描こう。',
        style: 'velocity',
        unit: 'm/s',
        scene: {
          points: {
            O:  { x: 0, y: 0, label: 'O', role: 'origin', draggable: true },
            P0: { x: 1, y: 1, label: 'P₀' },
            P1: { x: 3, y: 5, label: 'P₁' },
            P2: { x: 5, y: 7, label: 'P₂' },
            P3: { x: 7, y: 7, label: 'P₃' }
          },
          vectors: [
            { id: 'r0',  from: 'O',  to: 'P0', style: 'position', locked: true, label: 'r₀' },
            { id: 'r1',  from: 'O',  to: 'P1', style: 'position', locked: true, label: 'r₁' },
            { id: 'r2',  from: 'O',  to: 'P2', style: 'position', locked: true, label: 'r₂' },
            { id: 'r3',  from: 'O',  to: 'P3', style: 'position', locked: true, label: 'r₃' },
            { id: 'v01', from: 'P0', to: 'P1', style: 'velocity', locked: false, label: 'v₀₁' }
          ]
        },
        answer: { from: { x: 3, y: 5 }, to: { x: 5, y: 7 } },
        hints: ['P₁ から P₂ へ。x にいくつ、y にいくつでしょう。'],
        feedback: [
          { when: 'wrongStart', text: '描き始めは P₁ です。' },
          { when: 'wrongLength', text: '向きは合っています。y に何マスでしょう。' }
        ],
        explanation: 'v₁₂ = (2, 2) m/s。x 成分は変わらず、y 成分が 4 から 2 に減りました。'
      },
      {
        id: 'ext1-v23',
        type: 'draw-vector',
        prompt: 'もう1本、<b>v₂₃</b>（P₂ から P₃ へ）を描こう。',
        style: 'velocity',
        unit: 'm/s',
        scene: {
          points: {
            O:  { x: 0, y: 0, label: 'O', role: 'origin', draggable: true },
            P0: { x: 1, y: 1, label: 'P₀' },
            P1: { x: 3, y: 5, label: 'P₁' },
            P2: { x: 5, y: 7, label: 'P₂' },
            P3: { x: 7, y: 7, label: 'P₃' }
          },
          vectors: [
            { id: 'r0',  from: 'O',  to: 'P0', style: 'position', locked: true, label: 'r₀' },
            { id: 'r1',  from: 'O',  to: 'P1', style: 'position', locked: true, label: 'r₁' },
            { id: 'r2',  from: 'O',  to: 'P2', style: 'position', locked: true, label: 'r₂' },
            { id: 'r3',  from: 'O',  to: 'P3', style: 'position', locked: true, label: 'r₃' },
            { id: 'v01', from: 'P0', to: 'P1', style: 'velocity', locked: false, label: 'v₀₁' },
            { id: 'v12', from: 'P1', to: 'P2', style: 'velocity', locked: false, label: 'v₁₂' }
          ]
        },
        answer: { from: { x: 5, y: 7 }, to: { x: 7, y: 7 } },
        hints: ['P₂ と P₃ は同じ高さです。y 成分はいくつでしょう。'],
        feedback: [
          { when: 'wrongLength', text: '高さが変わっていません。y 成分は 0 です。' }
        ],
        explanation: 'v₂₃ = (2, 0) m/s。y 成分が 0 になりました。',
        reveal: {
          title: '3本ならびました',
          body: '<p>x 成分はずっと 2 のまま。y 成分だけが <b>4 → 2 → 0</b> と減っています。</p><p>この「減り方」を矢印で取り出してみましょう。</p>'
        }
      }
    ]
  },

  ext2: {
    title: '速度の変化を矢印で取り出す',
    minutes: 3,
    passLine: { correct: 2, of: 3 },
    scaleLabel: '1マス = 1 m/s　（速度の目盛）',
    transition: {
      title: '変位のときと、同じことをします',
      body: '<p>変位は「2本の位置ベクトルの<b>先端どうしを結んだ</b>矢印」でした。</p><p>速度でも同じことをします。そのためにまず、<b>3本の速度ベクトルの始点をそろえます</b>。</p><p>速度ベクトルは置き直してよい矢印（自由ベクトル）でしたね。</p>',
      button: 'やってみる'
    },
    items: [
      {
        id: 'ext2-align',
        type: 'free-place',
        prompt: '3本の速度ベクトルをドラッグして、<b>始点を点 A にそろえよう</b>。',
        unit: 'm/s',
        scene: {
          points: {
            A:  { x: 2, y: 1, label: 'A（そろえる点）', role: 'origin' },
            P0: { x: 1, y: 1, label: 'P₀' },
            P1: { x: 3, y: 5, label: 'P₁' },
            P2: { x: 5, y: 7, label: 'P₂' },
            P3: { x: 7, y: 7, label: 'P₃' }
          },
          vectors: [
            { id: 'v01', from: 'P0', to: 'P1', style: 'velocity', locked: false, draggable: true, label: 'v₀₁' },
            { id: 'v12', from: 'P1', to: 'P2', style: 'velocity', locked: false, draggable: true, label: 'v₁₂' },
            { id: 'v23', from: 'P2', to: 'P3', style: 'velocity', locked: false, draggable: true, label: 'v₂₃' }
          ]
        },
        readouts: [
          { id: 'v01', label: 'v₀₁', vector: 'v01', watch: true, unchangedBadge: true },
          { id: 'v12', label: 'v₁₂', vector: 'v12', watch: true, unchangedBadge: true },
          { id: 'v23', label: 'v₂₃', vector: 'v23', watch: true, unchangedBadge: true }
        ],
        conditions: [{ kind: 'vectorsShareStart', of: ['v01', 'v12', 'v23'], at: 'A' }],
        hintText: '矢印の線をつかんで運びます。運んでも成分（右の数値）は変わりません。',
        successText: '3本そろいました。成分はどれも変わっていませんね。',
        hints: ['速度ベクトルは自由ベクトルです。どこに置いても同じことを言っています。'],
        reveal: {
          title: 'そろえると、変化が見える',
          body: '<p>始点をそろえると、3本の先端が<b>一直線に並んで下りていく</b>のが見えます。</p><p>この先端から先端への矢印を描けば、それが「速度の変化」です。</p>'
        }
      },
      {
        id: 'ext2-dv1',
        type: 'draw-vector',
        prompt: '<b>v₀₁ の先端から v₁₂ の先端へ</b>、矢印を描こう。これが <b>Δv₁</b>（速度の変化）です。',
        style: 'displacement',
        unit: 'm/s',
        scene: {
          points: {
            A:  { x: 2, y: 1, label: 'A', role: 'origin' },
            T1: { x: 4, y: 5, label: '' },
            T2: { x: 4, y: 3, label: '' },
            T3: { x: 4, y: 1, label: '' }
          },
          vectors: [
            { id: 'v01', from: 'A', to: 'T1', style: 'velocity', locked: false, label: 'v₀₁', appearDelay: 0.1 },
            { id: 'v12', from: 'A', to: 'T2', style: 'velocity', locked: false, label: 'v₁₂', appearDelay: 0.5 },
            { id: 'v23', from: 'A', to: 'T3', style: 'velocity', locked: false, label: 'v₂₃', appearDelay: 0.9 }
          ]
        },
        answer: { from: { x: 4, y: 5 }, to: { x: 4, y: 3 }, origin: { x: 2, y: 1 } },
        hints: ['変位のときと同じです。先端から先端へ。'],
        feedback: [
          { when: 'reversed', text: '時間の進む順です。v₀₁ の先端から v₁₂ の先端へ。' },
          { when: 'fromOrigin', text: 'A からではありません。v₀₁ の<b>先端</b>から描き始めます。' }
        ],
        explanation: 'Δv₁ = v<sub>aft</sub> − v<sub>bef</sub> = v₁₂ − v₀₁ = (2, 2) − (2, 4) = <b>(0, −2)</b>。真下を向いた矢印になります。'
      },
      {
        id: 'ext2-dv2',
        type: 'draw-vector',
        prompt: 'もう1本、<b>v₁₂ の先端から v₂₃ の先端へ</b>。これが <b>Δv₂</b> です。',
        style: 'displacement',
        unit: 'm/s',
        scene: {
          points: {
            A:  { x: 2, y: 1, label: 'A', role: 'origin' },
            T1: { x: 4, y: 5, label: '' },
            T2: { x: 4, y: 3, label: '' },
            T3: { x: 4, y: 1, label: '' }
          },
          vectors: [
            { id: 'v01', from: 'A',  to: 'T1', style: 'velocity',     locked: false, label: 'v₀₁' },
            { id: 'v12', from: 'A',  to: 'T2', style: 'velocity',     locked: false, label: 'v₁₂' },
            { id: 'v23', from: 'A',  to: 'T3', style: 'velocity',     locked: false, label: 'v₂₃' },
            { id: 'dv1', from: 'T1', to: 'T2', style: 'displacement', locked: false, label: 'Δv₁' }
          ]
        },
        answer: { from: { x: 4, y: 3 }, to: { x: 4, y: 1 }, origin: { x: 2, y: 1 } },
        hints: ['1本目とまったく同じ描き方です。'],
        feedback: [
          { when: 'reversed', text: 'v₁₂ の先端から v₂₃ の先端へ、の順です。' }
        ],
        explanation: 'Δv₂ = v<sub>aft</sub> − v<sub>bef</sub> = v₂₃ − v₁₂ = (2, 0) − (2, 2) = <b>(0, −2)</b>。1本目とまったく同じ矢印です。'
      }
    ]
  },

  ext3: {
    title: 'Δv が表しているもの',
    minutes: 2,
    passLine: { correct: 1, of: 2 },
    scaleLabel: '1マス = 1 m/s',
    items: [
      {
        id: 'ext3-q1',
        type: 'choice',
        prompt: '2本の Δv を見くらべよう。',
        question: '2本の Δv に共通していることは何ですか？',
        scene: {
          points: {
            A:  { x: 2, y: 1, label: 'A', role: 'origin' },
            T1: { x: 4, y: 5, label: '' },
            T2: { x: 4, y: 3, label: '' },
            T3: { x: 4, y: 1, label: '' }
          },
          vectors: [
            { id: 'v01', from: 'A',  to: 'T1', style: 'velocity',     locked: false, label: 'v₀₁' },
            { id: 'v12', from: 'A',  to: 'T2', style: 'velocity',     locked: false, label: 'v₁₂' },
            { id: 'v23', from: 'A',  to: 'T3', style: 'velocity',     locked: false, label: 'v₂₃' },
            { id: 'dv1', from: 'T1', to: 'T2', style: 'displacement', locked: false, label: 'Δv₁' },
            { id: 'dv2', from: 'T2', to: 'T3', style: 'displacement', locked: false, label: 'Δv₂' }
          ]
        },
        options: [
          { key: 'ア', text: '向きは同じだが、長さがちがう', feedback: '長さを数えてみましょう。どちらも 2 マスです。' },
          { key: 'イ', text: '向きも長さも同じ（どちらも真下に 2）' },
          { key: 'ウ', text: '向きが逆で、長さが同じ', feedback: 'どちらも下を向いています。逆ではありません。' },
          { key: 'エ', text: '共通することは何もない', feedback: '2本を見くらべてみましょう。ぴったり重なりませんか。' }
        ],
        correctIndex: 1,
        correctText: 'そのとおり。1秒ごとに、速度は<b>いつも同じだけ、同じ向きに</b>変わっています。',
        explanation: 'どちらも (0, −2)。速度の変わり方が、ずっと一定だということです。'
      },
      {
        id: 'ext3-name',
        type: 'text-answer',
        prompt: '<b>Δv ÷ Δt</b>（1秒あたりの速度の変化）を表す量には、名前がついています。',
        question: '漢字三文字で入力しよう。',
        placeholder: '漢字三文字',
        scene: {
          points: {
            A:  { x: 2, y: 1, label: 'A', role: 'origin' },
            T1: { x: 4, y: 5, label: '' },
            T2: { x: 4, y: 3, label: '' },
            T3: { x: 4, y: 1, label: '' }
          },
          vectors: [
            { id: 'v01', from: 'A',  to: 'T1', style: 'velocity',     locked: false, label: 'v₀₁' },
            { id: 'v12', from: 'A',  to: 'T2', style: 'velocity',     locked: false, label: 'v₁₂' },
            { id: 'v23', from: 'A',  to: 'T3', style: 'velocity',     locked: false, label: 'v₂₃' },
            { id: 'dv1', from: 'T1', to: 'T2', style: 'displacement', locked: false, label: 'Δv₁' },
            { id: 'dv2', from: 'T2', to: 'T3', style: 'displacement', locked: false, label: 'Δv₂' }
          ]
        },
        accept: ['加速度'],
        nearMiss: [
          { text: '重力', feedback: '向きは合っています。でも重力は「力」の名前です。いま聞いているのは、1秒あたりに速度がどれだけ変わるか、という量の名前です。' },
          { text: '速度', feedback: '速度そのものではなく、その<b>変化の割合</b>のほうです。' },
          { text: '落下', feedback: '現象の名前ではなく、量の名前です。' }
        ],
        wrongText: '漢字三文字です。「1秒あたりに速度がどれだけ変わるか」を表す量の名前を思い出してみましょう。',
        correctText: '正解。Δv ÷ Δt が <b>加速度</b>です。',
        explanation: 'v = Δr / Δt と同じ形です。位置の変化率が速度、速度の変化率が加速度。',
        hints: ['v = Δr / Δt でした。では a = Δv / Δt の a は？'],
        reveal: {
          title: '同じ操作が、二度きいた',
          body: '<ul><li>位置ベクトルの先端どうしを結ぶ → <b>変位</b>　これを Δt で割ると <b>速度</b></li><li>速度ベクトルの先端どうしを結ぶ → <b>速度の変化</b>　これを Δt で割ると <b>加速度</b></li></ul><p>矢印の先端どうしを結ぶという、たった一つの操作でした。</p><p>そして加速度の矢印は、ずっと<b>真下</b>を向いていました。この先で意味がわかります。</p>'
        }
      }
    ]
  },

  /* ===================== 第2話の振り返り ===================== */
  reflection2: {
    title: '振り返り',
    minutes: 3,
    passLine: { correct: 1, of: 1 },
    items: [
      {
        id: 'reflect2',
        type: 'free-text',
        hideBadge: true,
        prompt: 'ベクトルの足し算は、どんな時に出てきましたか。<b>2つ挙げて</b>、それぞれ何と何を足したのか書いてみよう。',
        rows: 3,
        placeholder: '例：①…のとき、…と…を足した。②…のとき、…と…を足した。'
      }
    ],
    nextPreview: '<p>次は、基準を「<b>動いている物体</b>」に取り替えます。</p>'
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
