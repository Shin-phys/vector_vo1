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
    prompt: '<b>Sさん</b>が学校を出て、+x に 3 km、そこから +y に 4 km 進みました。<br>'
          + '<b>Sさんは、学校からどれだけ離れただろうか。</b><br>'
          + '<span style="font-size:15px;color:#4b5563">この時間は、Sさんの動きを矢印で表していく。</span>',
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
    // ①②（駅・公園の位置ベクトル）は必ず描かせる。
    // 3問目「基準を変えると矢印が変わる」は②.5bの伏線なので、時間があればやる。
    passLine: { correct: 2, of: 3 },
    scaleLabel: '1マス = 1 km',
    items: [
      {
        id: 's1q1',
        type: 'draw-vector',
        prompt: 'Sさんは<b>駅</b>にいる。駅は学校から <b>+x に 3、+y に 1</b>。'
              + '<b>学校から駅への矢印</b>を描こう。',
        style: 'position',
        unit: 'km',
        origin: { ...MAP.school },
        landmarks: [{ ...MAP.station }],
        answer: { from: { x: 3, y: 3 }, to: { x: 6, y: 4 } },
        hints: ['どこから描き始めるだろうか。「学校から駅へ」。'],
        feedback: [
          { when: 'reversed', text: '向きが逆。学校から駅へ、の順に。' },
          { when: 'wrongStart', text: '描き始めは学校。' }
        ],
        explanation: '学校から +x に 3、+y に 1 進んだ先が駅。',
        reveal: {
          title: 'この矢印が「位置ベクトル」',
          body: '<p>基準点から見て、その地点がどこにあるかを表す矢印を <b>位置ベクトル</b> という。</p>'
              + '<p>始点の 🔒 は「置き直せない」印。</p>'
        }
      },
      {
        // ② 同じ基準点から、もう1つの地点へ。この2本の先端どうしを結ぶのが次の変位。
        id: 's1q2',
        type: 'draw-vector',
        prompt: 'Sさんはこれから<b>公園</b>へ向かう。公園は学校から <b>−x に 2、+y に 3</b>。'
              + '同じ基準点から、<b>学校から公園への矢印</b>を描こう。',
        style: 'position',
        unit: 'km',
        origin: { ...MAP.school },
        landmarks: [{ ...MAP.park }],
        // 1問目で描いた「学校→駅」は残したまま。同じ基準点から2本そろうところを見せる。
        scene: {
          points: {
            school:  { ...MAP.school, hidden: true },   // 点は item.origin が描くので二重にしない
            station: { ...MAP.station }
          },
          vectors: [
            { id: 'rSta', from: 'school', to: 'station', style: 'position', locked: true, label: 'r⃗駅' }
          ]
        },
        answer: { from: { x: 3, y: 3 }, to: { x: 1, y: 6 } },
        hints: ['基準点はさっきと同じ学校。−x は左向き。'],
        feedback: [
          { when: 'reversed', text: '向きが逆。学校から公園へ。' },
          { when: 'wrongStart', text: '描き始めは学校。基準点は変わっていない。' },
          { when: 'wrongLength', text: '向きは合っている。−x に 2、+y に 3。数え直そう。' }
        ],
        explanation: '学校から −x に 2、+y に 3 進んだ先が公園。',
        reveal: {
          title: '同じ基準点から、2本',
          body: '<p><b>学校→駅</b> と <b>学校→公園</b>。同じ基準点から2本そろった。</p>'
              + '<p>次は、この<b>2本の先端どうし</b>。</p>'
        }
      },
      {
        // 1問目で描いた「学校→駅」を残したまま、基準点だけを公園に変える。
        // 同じ「駅」を指しているのに矢印が変わることを、その場で見せるのがねらい。
        id: 's1q3',
        type: 'draw-vector',
        prompt: '基準を<b>公園</b>に取り替える。<b>公園から駅</b>はどうなるだろうか。'
              + '矢印を引いて、<b>向きと成分</b>を確かめよう。',
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
        hints: ['基準が学校から公園に変わった。どこから描き始めるか。'],
        feedback: [
          { when: 'reversed', text: '向きが逆。公園から駅へ。' },
          { when: 'fromOrigin', text: '学校からではない。いまの基準は公園。' },
          { when: 'wrongStart', text: '描き始めは公園。' }
        ],
        explanation: '公園から +x に 5、−y に 2 進んだ先が駅。',
        reveal: {
          title: '駅は動いていないのに、矢印は変わった',
          body: '<p><b>駅の位置は変わっていない。</b>それでも基準点を学校から公園に変えると、'
              + '矢印は<b>向きも長さも成分も</b>変わった。</p>'
              + '<p>位置ベクトル r は、<b>基準点</b>と<b>その先の地点</b>の、どちらの情報も持っている。'
              + 'だから基準が変われば、矢印も変わる。</p>'
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
        prompt: '①で描いた2本を残してある。'
              + '<br>Sさんが<b>駅から公園へ</b>移動した。<b>この移動を表す矢印</b>を描こう。'
              + '<br><span style="font-size:15px;color:#4b5563">どの向きに、どれだけ位置が変わったか。</span>',
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
            { id: 'rSta',  from: 'school', to: 'station', style: 'position', locked: true, label: 'r⃗駅' },
            { id: 'rPark', from: 'school', to: 'park',    style: 'position', locked: true, label: 'r⃗公園' }
          ]
        },
        answer: { from: { x: 6, y: 4 }, to: { x: 1, y: 6 }, origin: { x: 3, y: 3 } },
        hints: ['出発点は学校ではない。「駅から公園へ」の移動。'],
        feedback: [
          { when: 'reversed', text: '向きが逆。出発点から到着点へ。' },
          { when: 'fromOrigin', text: '知りたいのは「駅から公園へ」。どこから描き始めるか。' },
          { when: 'wrongStart', text: '出発点は駅。' }
        ],
        explanation: '駅から公園へまっすぐ引いた矢印が、この移動を表す。',
        reveal: {
          title: 'この矢印が「変位ベクトル」',
          body: '<p>出発点から到着点へ向かう矢印を <b>変位ベクトル</b> という。</p>'
              + '<p><b>2本の位置ベクトルの、先端どうしを結んだ矢印</b>でもある。</p>'
              + '<p class="sym-note">記号では、学校を基準とした駅の位置ベクトルを <b><span class="vec">r</span><sub>駅</sub></b>、'
              + '公園の位置ベクトルを <b><span class="vec">r</span><sub>公園</sub></b> と書く。'
              + 'いま描いた「駅から公園へ」の変位 <b>Δ<span class="vec">r</span></b> は '
              + '<b><span class="vec">r</span><sub>公園</sub> − <span class="vec">r</span><sub>駅</sub></b>。'
              + '出発が <b>bef</b>、到着が <b>aft</b>。'
              + '<b>矢印は bef → aft、式は aft − bef</b>。</p>'
        }
      },
      {
        // さっきと同じ「駅から公園へ」を、今度はぐねぐね道で。
        // 例をそろえることで、変わったのは道筋だけだと分かる。
        id: 's2q3',
        type: 'draw-vector',
        prompt: '★ 今度はSさんが<b>ぐねぐねした道</b>を通って、さっきと同じ<b>駅から公園へ</b>移動しました。'
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
        hints: ['道筋の長さではなく、「どこからどこへ」だけ。'],
        feedback: [
          { when: 'wrongLength', text: '道筋の長さを描いていないか。見るのは出発点と到着点だけ。' },
          { when: 'reversed', text: '駅から公園へ、の順。' }
        ],
        explanation: '道筋がどれだけ曲がっていても、変位は出発点と到着点だけで決まる。',
        reveal: {
          title: '道筋がちがっても、変位は同じ',
          body: '<p>さっきの1問目と<b>まったく同じ矢印</b>になった。道筋はぜんぜん違うのに。</p>'
              + '<p>変位が表しているのは「移動の道のり」ではなく「<b>どこからどこへ</b>動いたか」だけだから。</p>'
        }
      }
    ]
  },

  /* ===================== 速度はどの向き？（②の直後） =====================
     平均の速度の「向き」だけを先に押さえる。v = Δ<span class="vec">r</span> / Δt なので向きは Δ<span class="vec">r</span> と同じ。
     ここで向きを決めておくと、④では「スケールだけが変わる」話に集中できる。 */
  stepv: {
    title: '速度はどの向き？',
    minutes: 3,
    passLine: { correct: 1, of: 1 },
    scaleLabel: '1マス = 1 km',
    items: [
      {
        id: 'sv-tap',
        type: 'tap-select',
        prompt: 'Sさんは駅から公園へ、30分かけて移動しました。<br>'
              + '<b>このときの（平均の）速度と同じ向きの矢印</b>を、画面からタップして選ぼう。',
        hintText: '矢印の線そのものをタップしてください。',
        scene: {
          points: {
            school:  { ...MAP.school, role: 'origin' },
            station: { ...MAP.station },
            park:    { ...MAP.park },
            library: { ...MAP.library }
          },
          vectors: [
            { id: 'rSta',  from: 'school',  to: 'station', style: 'position',     locked: true, label: 'r⃗駅' },
            { id: 'rPark', from: 'school',  to: 'park',    style: 'position',     locked: true, label: 'r⃗公園' },
            { id: 'rLib',  from: 'school',  to: 'library', style: 'position',     locked: true, label: 'r図書館' },
            { id: 'disp',  from: 'station', to: 'park',    style: 'displacement',               label: '駅→公園' }
          ]
        },
        options: [
          { vector: 'rSta',  feedback: 'それは「学校から見て駅がどこか」の矢印。Sさんの<b>移動</b>ではない。' },
          { vector: 'rPark', feedback: 'それは「学校から見て公園がどこか」の矢印。動いた向きとは別もの。' },
          { vector: 'rLib',  feedback: 'Sさんは図書館へは行っていない。' },
          { vector: 'disp',  correct: true }
        ],
        correctText: '正解。速度の向きは<b>変位の向きと同じ</b>。',
        explanation: '速度の向きは、動いた向き。つまり変位の向き。',
        hints: ['Sさんが「どの向きに動いたか」を表す矢印はどれか。'],
        reveal: {
          title: 'なぜ v と Δ<span class="vec">r</span> は同じ向きなのか',
          body: '<p style="text-align:center;font-size:21px;margin:.2em 0 .6em"><span class="eq"><span class="vec">v</span> ＝ <span class="frac"><span class="num">Δ<span class="vec">r</span></span><span class="den">Δt</span></span></span></p>'
              + '<p>Δt は必ず正の数。<b>正の数で割っただけ</b>なので向きは変わらない。</p>'
              + '<p>変わるのは<b>長さ</b>だけ。「1マスが何を表すか」が変わる。</p>'
        }
      }
    ],
    summary: {
      title: 'ここまでの整理',
      body: '<ol style="line-height:1.9">'
          + '<li><b>r（位置ベクトル）</b>は、<b>基準点</b>と<b>その地点</b>の、どちらの情報も持っている</li>'
          + '<li>はじめの r の先端から、あとの r の先端へ結んだ矢印を <b>Δ<span class="vec">r</span>（変位ベクトル）</b> という</li>'
          + '<li>Δ<span class="vec">r</span> は「位置が<b>どれだけ変化したか</b>」の情報を持つ</li>'
          + '<li><b><span class="vec">v</span> の向きは Δ<span class="vec">r</span> と同じ</b>（<span class="eq"><span class="vec">v</span> ＝ <span class="frac"><span class="num">Δ<span class="vec">r</span></span><span class="den">Δt</span></span></span>　だから）</li>'
          + '</ol>',
      button: '先へ進む'
    }
  },

  /* ===================== ②.5a 置き直してみる（最重要） ===================== */
  step25a: {
    title: '置き直してみる',
    minutes: 4,
    passLine: { correct: 6, of: 6 },
    scaleLabel: '1マス = 1 km',
    intro: {
      title: '動かしてよい矢印と、動かしてはいけない矢印',
      body: '<p>ベクトルには2つの種類がある。</p>'
          + '<ul><li><b>自由ベクトル</b>　…　置き直して（平行移動して）よいもの</li>'
          + '<li><b>束縛ベクトル</b>　…　置き直すと意味が壊れるもの</li></ul>'
          + '<p>画面の2本が、それぞれ持っている情報を確かめておく。</p>'
          + '<ul><li><b>位置ベクトル</b> r（学校→駅）…　<b>基準点</b>（学校）と<b>その地点</b>（駅）の、'
          + '<b>どちらの情報も</b>持っている</li>'
          + '<li><b>変位ベクトル</b> Δ<span class="vec">r</span>（駅→公園）…　<b>位置がどれだけ変化したか</b>の情報を持っている</li></ul>'
          + '<p>どちらが自由で、どちらが束縛だろうか。まず予想し、そのあと<b>実際に動かして</b>確かめる。</p>'
    },
    items: [
      {
        // 名前を先に与え、予想を立てさせてから動かす。
        // ここで当たるかどうかは重要ではなく、「動かして確かめる」動機をつくるのが目的。
        id: 's25a-q0',
        type: 'choice',
        prediction: true,                 // 予想。正誤は出さない（動かしたあとで、もう一度聞く）
        prompt: '予想してみよう',
        question: '画面の2本は、どちらが<b>自由ベクトル</b>（動かしてよい）で、どちらが<b>束縛ベクトル</b>（動かせない）だろうか。',
        scene: {
          points: {
            school:  { ...MAP.school,  role: 'origin' },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            { id: 'pos',  from: 'school',  to: 'station', style: 'position',     locked: true, label: '位置ベクトル' },
            { id: 'disp', from: 'station', to: 'park',    style: 'displacement',               label: '変位ベクトル' }
          ]
        },
        options: [
          { key: 'ア', text: '位置ベクトルが自由、変位ベクトルが束縛' },
          { key: 'イ', text: '位置ベクトルが束縛、変位ベクトルが自由' },
          { key: 'ウ', text: 'どちらも自由（どちらも動かしてよい）' },
          { key: 'エ', text: 'どちらも束縛（どちらも動かせない）' }
        ],
        afterPick: 'では、実際にやってみましょう。'
      },
      {
        id: 's25a-t1',
        type: 'explore-drag',
        prompt: '課題1｜2本の矢印を<b>それぞれ動かして</b>みよう。',
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
            pos:  '<b>位置ベクトル</b>：動かせたが、手を離すと元に戻った。動かしているあいだ、矢印の先は「駅」を指していない。',
            disp: '<b>変位ベクトル</b>：動かした場所にそのまま置けた。「x −5・y +2」も変わらない。'
          },
          remaining: 'あと {n} 本、動かしてみましょう。',
          done: '2本とも試せた。ただし<b>起きたことは同じではない</b>。'
        },
        hints: ['まず 🔒 のついた矢印（学校→駅）をつかんで動かしてみましょう。'],
        reveal: {
          title: '長さも向きも変わっていないのに',
          body: '<p>数字を見ると、<b>どちらも成分は変わっていない</b>。長さも向きもそのまま。</p>'
              + '<p>それでも位置ベクトルだけは元に戻る。</p>'
              + '<p>位置ベクトル r は、<b>基準点</b>と<b>その先の地点</b>の、どちらの情報も持っていました。'
              + 'これを移動すると<b>基準点もその先の地点も変わる</b>。つまり <b>別ものどうしをつないでいる</b>。</p>'
              + '<p>変位ベクトル Δ<span class="vec">r</span> が持つのは「位置がどれだけ変化したか」だけ。'
              + '移動しても<b>描く位置が変わるだけで、中身は同じ</b>。</p>'
        }
      },
      {
        // 予想 →（動かして確かめる）→ ここでもう一度。ここは採点する。
        id: 's25a-q0b',
        type: 'choice',
        prompt: '動かしてみた結果から答えよう',
        question: 'では、あらためて。どちらが<b>自由ベクトル</b>で、どちらが<b>束縛ベクトル</b>でしたか？',
        scene: {
          points: {
            school:  { ...MAP.school,  role: 'origin' },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            { id: 'pos',  from: 'school',  to: 'station', style: 'position',     locked: true, label: '位置ベクトル' },
            { id: 'disp', from: 'station', to: 'park',    style: 'displacement',               label: '変位ベクトル' }
          ]
        },
        options: [
          { key: 'ア', text: '位置ベクトルが自由、変位ベクトルが束縛',
            feedback: '手を離したとき、元に戻ってしまったのはどちらでしたか？' },
          { key: 'イ', text: '位置ベクトルが束縛、変位ベクトルが自由' },
          { key: 'ウ', text: 'どちらも自由（どちらも動かしてよい）',
            feedback: '片方は、手を離すと元に戻ってしまいました。' },
          { key: 'エ', text: 'どちらも束縛（どちらも動かせない）',
            feedback: '片方は、動かした場所にそのまま置いておけました。' }
        ],
        correctIndex: 1,
        correctText: 'そのとおり。位置ベクトルが<b>束縛</b>、変位ベクトルが<b>自由</b>でした。',
        explanation: '元に戻らなかった変位ベクトルが自由、戻った位置ベクトルが束縛。'
      },
      {
        id: 's25a-q1',
        type: 'choice',
        prompt: '課題1のつづき',
        question: '位置ベクトルを平行移動すると、何が言えなくなるだろうか。',
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
          { key: 'ア', text: '矢印の長さがわからなくなる', feedback: '長さは動かしても変わらなかった。数値表示も「変化なし」。' },
          { key: 'イ', text: '矢印の向きがわからなくなる', feedback: '向きも変わらなかった。では、変わったのは何か。' },
          { key: 'ウ', text: 'どの地点を指しているのかがわからなくなる' },
          { key: 'エ', text: '何も困らない', feedback: '「駅は学校から x +3・y +1 にある」——この文がもう言えない。困らないだろうか。' }
        ],
        correctIndex: 2,
        correctText: 'そのとおり。位置ベクトルは「基準から見てどこか」を言う矢印。置き場所を変えると、それが言えなくなる。',
        explanation: '位置ベクトルは基準点から出ていることに意味がある。動かすと「どの地点か」が言えなくなる。'
      },
      {
        id: 's25a-t2',
        type: 'choice',
        prompt: '課題2｜2つの物体が、それぞれ別の点へ移動した。',
        question: '離れた場所にいる2つの物体の変位が、<b>等しくなる</b>ことはあり得るだろうか。',
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
          { key: 'イ', text: 'あり得ない', feedback: '本当にそうだろうか。次の画面で、自分で作れるか試そう。' }
        ],
        correctIndex: 0,
        correctText: 'では、本当に作れるか試そう。',
        explanation: '実際に作れる。次の画面で確かめる。'
      },
      {
        id: 's25a-t2b',
        type: 'free-place',
        prompt: '課題2｜4つの点を動かして、<b>2つの変位を等しく</b>してみよう。出発点は離したままでよい。',
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
        hintText: '2つの矢印の「x にいくつ・y にいくつ」をそろえよう。',
        successText: '離れた場所にいても、2つの変位は等しくできる。',
        hints: ['片方の成分を読み取り、もう片方を同じ成分にする。'],
        reveal: {
          title: '🔒 のルール',
          body: '<ul><li><b>位置ベクトル</b> r ＝ 基準点とその先の地点、どちらの情報も持つ。置き直すと別ものになる（🔒 がつく）</li><li><b>変位ベクトル</b> Δ<span class="vec">r</span> ＝ 位置の変化の情報だけを持つ。どこに置いてもよい</li></ul><p>この先も、🔒 のついた矢印は動かしても元に戻る。</p>'
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
      title: 'なぜ Δ<span class="vec">r</span> は、動かしてよかったのか',
      body: '<p>Δ<span class="vec">r</span> は置き直してよい矢印でした。それは、<b>Δ<span class="vec">r</span> が持っている情報が「置き場所」によらない</b>、'
          + 'ということ。</p>'
          + '<p>本当にそう言い切れるだろうか。もっと乱暴なことをして確かめる。'
          + '——<b>測る基準そのものを動かす。</b></p>',
      button: 'やってみる'
    },
    items: [
      {
        id: 's25b-t3',
        type: 'explore-drag',
        prompt: '課題3｜Sさんが駅から公園へ移動した。<b>基準点 O</b> を 3 か所以上に動かしてみよう。',
        unit: 'km',
        scene: {
          points: {
            O0:      { x: 3, y: 3, label: 'はじめの O' },
            O:       { x: 3, y: 3, label: '基準点 O', role: 'origin', draggable: true },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            // はじめの基準点から引いた2本を、薄く残しておく。動かした結果と見くらべるため。
            { id: 'g1',   from: 'O0',      to: 'station', style: 'position',     locked: false, opacity: 0.22 },
            { id: 'g2',   from: 'O0',      to: 'park',    style: 'position',     locked: false, opacity: 0.22 },
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
          remaining: 'あと {n} か所。上の2つと下の1つ、どちらが赤く光るか。',
          done: '位置ベクトルは<b>2本とも</b>変わった。変位ベクトルだけが変わらない。'
        },
        hints: ['数値表示を見ながら O を動かす。赤く光る数と「変化なし」の数がある。'],
        reveal: {
          title: '2本が、同じだけずれている',
          body: '<p>基準点が変われば、位置ベクトル r は<b>向きも長さも変わる</b>。'
              + 'もとの r が持っていた情報は<b>何ひとつ残らない</b>。</p>'
              + '<p>それでも、O→駅 と O→公園 の<b>2本は同じだけずれる</b>。'
              + '変位はその先端どうしを結んだ矢印なので、動かない。</p>'
              + '<p>Δ<span class="vec">r</span> が持つのは「位置の変化」だけ。基準点とは関わりがない。</p>'
        }
      },
      {
        id: 's25b-q',
        type: 'choice',
        prompt: 'なぜ変位は変わらないのだろう',
        question: '基準点 O を動かしても変位ベクトルが変わらないのは、なぜだろうか。',
        scene: {
          points: {
            O0:      { x: 3, y: 3, label: 'はじめの O' },
            O:       { x: 6, y: 1, label: '基準点 O', role: 'origin' },
            station: { ...MAP.station },
            park:    { ...MAP.park }
          },
          vectors: [
            { id: 'g1',   from: 'O0',      to: 'station', style: 'position',     locked: false, opacity: 0.22 },
            { id: 'g2',   from: 'O0',      to: 'park',    style: 'position',     locked: false, opacity: 0.22 },
            { id: 'pos1', from: 'O',       to: 'station', style: 'position',     locked: true, label: 'O→駅' },
            { id: 'pos2', from: 'O',       to: 'park',    style: 'position',     locked: true, label: 'O→公園' },
            { id: 'disp', from: 'station', to: 'park',    style: 'displacement', label: '駅→公園' }
          ]
        },
        options: [
          { key: 'ア', text: '変位は長さも向きも決まっている量なので、基準を動かしても変わらないから', feedback: '「決まっている」のは結果。なぜ決まるのかを、画面で起きたことから考えよう。' },
          { key: 'イ', text: '基準を動かすと2本の位置ベクトルが同じだけずれるので、その差は変わらないから' },
          { key: 'ウ', text: '変位は基準点から離れた場所にあるので、基準の影響を受けないから', feedback: '場所の遠さの問題ではない。O を駅のすぐ隣に置いても変位は変わらなかった。' },
          { key: 'エ', text: '今回はたまたま変わらなかっただけで、いつも変わらないとは限らないから', feedback: '3か所以上動かしても変わらなかった。偶然ではなさそうだ。' }
        ],
        correctIndex: 1,
        correctText: 'そのとおり。O→駅 と O→公園 が同じだけずれるので、先端どうしを結んだ変位は動かない。',
        explanation: '変位は2本の位置ベクトルの差。基準を動かすと2本とも同じだけずれるので、差は変わらない。',
        reveal: {
          title: 'ポイント：変化を表すベクトルは、移動できる',
          body: '<p>Δ<span class="vec">r</span> が持つのは「<b>位置がどれだけ変化したか</b>」だけ。'
              + '基準をどこに置こうと、その情報は変わらない。</p>'
              + '<p>だから <b>Δ<span class="vec">r</span> はどこに置き直してもよい</b>。'
              + '②.5a で動かせた理由がこれ。</p>'
              + '<p><b>変化を表すベクトルは、移動できる。</b>'
              + 'Δ<span class="vec">r</span> だけの話ではない。<b>速度ベクトルも、加速度ベクトルも移動できる。</b>'
              + 'どれも「変化」を表す量だから。</p>'
              + '<p class="sym-note">基準を取り替えるという考え方は、<b>第3話でもう一度出てくる</b>。</p>'
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
        hintText: '② をつかんで、① の先端まで運ぶ。運んでも成分は変わらない。',
        successText: '① の先端に ② を継ぎ足せた。',
        hints: ['変位ベクトルは置き直してよい矢印だった。'],
        reveal: {
          title: 'なぜ運んでよいのか',
          body: '<p>②.5a のとおり、<b>変位は置き直してよい矢印</b>。だから2本目を1本目の先端まで運んで継ぎ足せる。</p>'
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
        hints: ['聞かれているのは「最初から最後へ」の1本。途中の点は通らない。'],
        feedback: [
          { when: 'sumOfLengths', text: '3 + 4 = 7 になっていないか。継ぎ足したとき、終点はどこか。' },
          { when: 'wrongStart', text: '描き始めはスタートの点。' },
          { when: 'reversed', text: 'スタートからゴールへ、の順。' }
        ],
        explanation: '継ぎ足したとき、最初の点から最後の点へ引いた矢印が答え。長さは 7 ではなく 5。',
        reveal: {
          title: 'これが「ベクトルの和」',
          body: '<p>矢印を継ぎ足して、最初から最後へ引く操作を <b>和</b> という。</p><p>変位は置き直してよいので、この操作がいつでもできる。</p>'
        }
      },
      {
        id: 's3q2',
        type: 'draw-vector',
        prompt: '別の例。今度は3つ続けて動いた。同じように<b>最初から最後への矢印</b>を描こう。',
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
        hints: ['何本つないでも同じ。見るのは最初の点と最後の点だけ。'],
        feedback: [
          { when: 'sumOfLengths', text: '4 + 3 + 3 = 10 になっていないか。最後にいる場所はどこか。' },
          { when: 'wrongLength', text: '向きは合っている。x と y、それぞれ何マス動いた結果か。' }
        ],
        explanation: 'x +4・y +3・x −3 の結果、最初の点から見て x +1・y +3 の場所にいる。'
      }
    ]
  },

  /* ===================== ④ 速度の矢印 ===================== */
  step4: {
    title: '速度の矢印',
    minutes: 6,
    passLine: { correct: 4, of: 4 },
    scaleLabel: '1マス = 1 km/h　①〜③とはスケールが変わる',
    transition: {
      title: 'ここから、速度の話',
      body: '<p>ここまでは「<b>どこからどこへ動いたか</b>」＝変位を見てきました。</p>'
          + '<p>ここからは「<b>どれくらいの速さで動いているか</b>」を矢印で表す。</p>'
          + '<p>方眼の1マスの意味が <b>km から km/h へ</b> 変わる。描き方はこれまでと同じ。</p>',
      button: 'わかった'
    },
    items: [
      {
        id: 's4q1',
        type: 'draw-vector',
        prompt: '<b>+x に 6 km</b> の移動に 2 時間かかった。<b>速度の矢印</b>を描こう。<br>（1マスの意味が「km」から「km/h」へ）',
        style: 'velocity',
        unit: 'km/h',
        scene: { points: { P: { x: 1, y: 1, label: 'スタート' } }, vectors: [] },
        answer: { from: { x: 1, y: 1 }, to: { x: 4, y: 1 } },
        hints: ['6 km を 2 時間。1 時間あたり何 km か。'],
        feedback: [
          { when: 'wrongLength', text: '向きは合っている。6 ÷ 2 は。' },
          { when: 'reversed', text: '+x は右向き。' }
        ],
        explanation: '6 km ÷ 2 時間 ＝ 3 km/h。向きは移動と同じ +x、長さは 3 マス。',
        revealVectors: [
          { from: { x: 1, y: 1 }, to: { x: 7, y: 1 }, style: 'displacement', label: '変位 6 km' },
          { from: { x: 1, y: 1 }, to: { x: 4, y: 1 }, style: 'velocity', label: '速度 3 km/h' }
        ],
        reveal: {
          title: '向きは同じ。変わるのはスケールだけ',
          body: '<p>速度の矢印は<b>変位と同じ向き</b>。ちがうのは「1マスが何を表すか」だけ。</p><p>速度ベクトルに 🔒 はつかない。<b>置き直してよい矢印</b>。</p>'
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
        hints: ['速さは前の問題と同じ。ちがうのは向きだけ。'],
        feedback: [
          { when: 'reversed', text: '−x は左向き。矢印はどちらを向くか。' },
          { when: 'wrongLength', text: '向きは合っている。6 ÷ 2 は。' }
        ],
        explanation: '速さは 6 ÷ 2 ＝ 3 km/h。前と同じ大きさで、向きだけが反対。',
        reveal: {
          title: '右向きを +x と決めると、左向きは「−」',
          body: '<p>矢印の<b>長さは前の問題と同じ</b>で、向きだけが反対でした。'
              + '成分の表示も <b>(−3, 0)</b>。</p>'
              + '<p>直線上の運動では、いちいち「左向きに 3」と書くかわりに、'
              + '<b>右向きを +x と決めて −3 km/h</b> と書くことがある。'
              + '<b>符号が向きを表す</b>。</p>'
              + '<p class="sym-note">この書き方は、あとで「相手から見ると後ろへ下がって見える」'
              + 'という場面でそのまま使う。</p>'
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
        hints: ['x と y を、それぞれ 2 で割る。'],
        feedback: [
          { when: 'wrongLength', text: '向きは合っている。x も y も 2 で割るといくつか。' },
          { when: 'wrongDirection', text: 'x と y を別々に計算する。' }
        ],
        explanation: 'x は 4 ÷ 2 ＝ 2、y は 2 ÷ 2 ＝ 1。斜めでも向きは移動と同じ。'
      },
      {
        // 第1話の締めくくり。①の +3 と②の −3 を、先端どうしで結ぶ。
        // ここでは「加速度」と名乗らない。発展ページの山場を残す。
        id: 's4dv',
        type: 'draw-vector',
        prompt: '①で描いた <b>+3</b> と、②で描いた <b>−3</b> を、同じ点からそろえて並べた。<br>'
              + '<b>v bef の先端から v aft の先端へ</b>、矢印を描こう。これが<b>速度の変化 Δ<span class="vec">v</span></b>。',
        style: 'displacement',
        unit: 'km/h',
        scene: {
          points: {
            A:  { x: 4, y: 2, label: 'A', role: 'origin' },
            Tb: { x: 7, y: 2, label: '' },
            Ta: { x: 1, y: 2, label: '' }
          },
          vectors: [
            { id: 'vbef', from: 'A', to: 'Tb', style: 'velocity', locked: false, label: 'v⃗ bef ＝ +3', appearDelay: 0.1 },
            { id: 'vaft', from: 'A', to: 'Ta', style: 'velocity', locked: false, label: 'v⃗ aft ＝ −3', appearDelay: 0.6 }
          ]
        },
        answer: { from: { x: 7, y: 2 }, to: { x: 1, y: 2 }, origin: { x: 4, y: 2 } },
        hints: ['変位のときと同じ。先端から先端へ。'],
        feedback: [
          { when: 'reversed', text: 'bef の先端から aft の先端へ。逆になっている。' },
          { when: 'fromOrigin', text: 'A からではない。<b>先端</b>から引く。' },
          { when: 'wrongLength', text: '+3 の先端は x＝7、−3 の先端は x＝1。' }
        ],
        explanation: 'Δ<span class="vec">v</span> ＝ v aft − v bef ＝ (−3) − (+3) ＝ <b>−6</b> km/h。',
        reveal: {
          title: 'では、これを時間で割ると？',
          body: '<p>速度が <b>+3 → −3</b> と変わった。その変化が <b>Δ<span class="vec">v</span> ＝ −6</b>。</p>'
              + '<p>この Δ<span class="vec">v</span> を、<b>変化にかかった時間</b>で割ると何になるだろう。</p>'
              + '<p>答えは<b>発展のページ</b>で確かめる。</p>'
        }
      }
    ]
  },

  /* ===================== ⑤ 速度の合成 ===================== */
  step5: {
    title: '速度の合成',
    transition: {
      title: '動いているものが、2つ',
      body: '<p>ここまでは、動いているものは<b>1つ</b>でした。</p>'
          + '<p>ここからは、<b>動く歩道の上を人が歩く</b>、<b>流れる川を舟が進む</b>——のように、'
          + '<b>2つの動きが重なる</b>場面。</p>'
          + '<p>問いはいつも「地面から見ると、どう動いて見えるか」。</p>',
      button: 'わかった'
    },
    minutes: 6,
    passLine: { correct: 2, of: 3 },
    scaleLabel: '1マス = 1 m/s　すべて「地面から見た速度」',
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
        hints: ['同じ向き。2本を継ぎ足すだけ。'],
        feedback: [
          { when: 'wrongLength', text: '2 と 3 を継ぎ足すと、先端はどこか。' },
          { when: 'reversed', text: 'どちらも +x 向き。' }
        ],
        explanation: '同じ向きなので 2 + 3 ＝ 5 m/s。③の「継ぎ足し」と同じ。',
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
          { when: 'sumOfLengths', text: '4 + 3 = 7 にはならない。直角のときは、継ぎ足した先端がどこにくるかを見る。' },
          { when: 'wrongDirection', text: 'y に +4、x に +3 の両方を満たす先端はどこか。' }
        ],
        explanation: 'y に +4・x に +3 を継ぎ足すと、地面から見た速度は x +3・y +4。大きさは 5 m/s。',
        revealVectors: [
          { from: { x: 2, y: 1 }, to: { x: 2, y: 5 }, style: 'velocity', label: '舟 4' },
          { from: { x: 2, y: 5 }, to: { x: 5, y: 5 }, style: 'velocity', label: '流れ 3' }
        ],
        revealPath: [{ x: 2, y: 1 }, { x: 5, y: 5 }],
        reveal: {
          title: '舟の航跡',
          body: '<p>点線が、舟が実際に通る道すじ（航跡）。舟は +y を向いているのに、地面から見ると斜めに進む。</p>'
        }
      },
      {
        id: 's5slider',
        type: 'slider-explore',
        prompt: '大きさ 4 と大きさ 3 を合成したとき、答えは<b>いつでも 7</b> だろうか。角度を動かして確かめよう。',
        unit: 'm/s',
        sliderLabel: '2つの速度がなす角',
        compose: {
          origin: { x: 1, y: 2 },
          a: { mag: 4 }, aLabel: '4',
          b: { mag: 3 }, bLabel: '3',
          rLabel: '合成'
        },
        checkpoints: [0, 90, 180],
        hints: ['0°、90°、180° の3か所は必ず確かめる。'],
        reveal: {
          title: '足し算のようで、足し算ではない',
          body: '<p>0°で 7、90°で 5、180°で 1。<b>大きさは単純に足せない</b>。</p><p>合成した速度は、継ぎ足した先端で決まる。</p>'
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
    prompt: '基準点 <b>O</b> は学校。<b>まず図を見て答え、あとから式で確かめる。</b>'
          + '<br><span style="font-size:15px;color:#4b5563">式や記号をタップすると、図の矢印が光る。</span>',
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
    rule: '出発が <b>bef</b>、到着が <b>aft</b>。'
        + '<b>矢印は bef → aft、式は aft − bef。</b>'
        + 'つまり <b>Δ<span class="vec">r</span> ＝ <span class="vec">r</span><sub>aft</sub> − <span class="vec">r</span><sub>bef</sub></b>。添字は「基準 → 対象」の順。',
    // ①直感 → ②bef → ③aft → ④式、の順で進む（js/steps/step6-symbol.js が順に出す）
    quizValue: {
      question: '① まず直感で。Sさんの<b>駅から公園への変位 Δ<span class="vec">r</span></b> を、向きと大きさで答えよう。',
      logLabel: '① Δ<span class="vec">r</span>（駅→公園）　＝',
      answer: { x: -5, y: 2 },
      retryHint: '図のマスを数えるだけ。x はどちらへいくつ、y はどちらへいくつか。',
      explain: '図のとおり <b>x に −5、y に +2</b>。これが答え。'
             + 'この答えを<b>式でも出せるか</b>を確かめていく。'
    },
    coordBef: {
      question: '② 出発（<b>bef</b>）は駅。基準点 O から見た <b><span class="vec">r</span><sub>bef</sub></b>（＝<span class="vec">r</span><sub>駅</sub>）の成分は？',
      logLabel: '② <span class="vec">r</span><sub>bef</sub>（O→駅）　＝',
      answer: { x: 3, y: 1 },
      lit: 'rStation',
      retryHint: 'O から駅へ、x にいくつ、y にいくつか。',
      explain: '<b><span class="vec">r</span><sub>駅</sub> ＝ (+3, +1)</b>。O から駅への位置ベクトル。'
    },
    coordAft: {
      question: '③ 到着（<b>aft</b>）は公園。基準点 O から見た <b><span class="vec">r</span><sub>aft</sub></b>（＝<span class="vec">r</span><sub>公園</sub>）の成分は？',
      logLabel: '③ <span class="vec">r</span><sub>aft</sub>（O→公園）　＝',
      answer: { x: -2, y: 3 },
      lit: 'rPark',
      retryHint: 'O から公園へ。x は左向きなので −、y は上向きなので ＋。',
      explain: '<b><span class="vec">r</span><sub>公園</sub> ＝ (−2, +3)</b>。O から公園への位置ベクトル。'
    },
    quizOrder: {
      question: '④ 下の「ここまでに出した答え」を見くらべよう。Δ<span class="vec">r</span>（駅 → 公園）を<b>式</b>で書くと？',
      options: [
        { key: 'ア', text: '<span class="vec">r</span><sub>駅</sub> − <span class="vec">r</span><sub>公園</sub>　（bef − aft）',
          feedback: '計算すると (+3, +1) − (−2, +3) ＝ (+5, −2)。①の答えと<b>符号が逆</b>。' },
        { key: 'イ', text: '<span class="vec">r</span><sub>公園</sub> − <span class="vec">r</span><sub>駅</sub>　（aft − bef）' },
        { key: 'ウ', text: '<span class="vec">r</span><sub>駅</sub> ＋ <span class="vec">r</span><sub>公園</sub>',
          feedback: '足すと、駅でも公園でもない場所を指す。' }
      ],
      correct: 1,
      explain: '③ − ② ＝ (−2, +3) − (+3, +1) ＝ <b>(−5, +2)</b>。'
             + '①で直感的に出した答えと、ぴったり一致した。<br>'
             + '<b>Δ<span class="vec">r</span> ＝ <span class="vec">r</span><sub>aft</sub> − <span class="vec">r</span><sub>bef</sub>。矢印は bef → aft、式は aft − bef</b>。'
    }
  },


  /* ===================== 発展：斜方投射（第1話と第2話のあいだ） =====================
     位置ベクトルは描画済み。基準点 O はどの画面でもドラッグできる。
     P0〜P4 は 1 秒ごとの位置。v は (2,4)(2,2)(2,0)(2,−2) なので Δ<span class="vec">v</span> はすべて (0,−2)。
     頂点をまたいで 3 本そろうので、「上りでも下りでも同じ」が見える。
     各ステップは passLine を満問にしてある（通過モーダルで飛ばさせない）。 */

  ext1: {
    title: '速度ベクトルをつくる',
    minutes: 5,
    passLine: { correct: 2, of: 2 },
    scaleLabel: '1マス = 1 m　／　コマの間隔は Δt = 1 秒',
    items: [
      {
        id: 'ext1-t0',
        type: 'explore-drag',
        prompt: 'ボールを斜めに投げ上げ、<b>1秒ごと</b>の位置を記録した。<br>まず<b>基準点 O</b> を 2 か所以上に動かしてみよう。',
        unit: 'm',
        scene: {
          points: {
            O:  { x: 0, y: 0, label: 'O', role: 'origin', draggable: true },
            P0: { x: 0, y: 1, label: 'P₀' },
            P1: { x: 2, y: 5, label: 'P₁' },
            P2: { x: 4, y: 7, label: 'P₂' },
            P3: { x: 6, y: 7, label: 'P₃' },
            P4: { x: 8, y: 5, label: 'P₄' }
          },
          vectors: [
            { id: 'r0',  from: 'O',  to: 'P0', style: 'position',     locked: true, label: 'r⃗₀' },
            { id: 'r1',  from: 'O',  to: 'P1', style: 'position',     locked: true, label: 'r⃗₁' },
            { id: 'd01', from: 'P0', to: 'P1', style: 'displacement', locked: false, label: 'P₀→P₁' }
          ]
        },
        readouts: [
          { id: 'r0',  label: '位置ベクトル r₀', vector: 'r0',  watch: true },
          { id: 'r1',  label: '位置ベクトル r₁', vector: 'r1',  watch: true },
          { id: 'd01', label: '変位 P₀→P₁',      vector: 'd01', watch: true, unchangedBadge: true }
        ],
        requirement: { kind: 'distinctPositions', point: 'O', count: 2 },
        progress: {
          remaining: 'あと {n} か所。どれが赤く光るか見ておこう。',
          done: '第1話と同じ。<b>r は変わる。変位は変わらない。</b>'
        },
        hints: ['基準を動かすと何が変わり、何が変わらなかっただろうか。'],
        reveal: {
          title: 'O をどこに置いても同じ',
          body: '<p>これから点と点のあいだに矢印を描く。それらは <b>O の場所に左右されない</b>。</p>'
        }
      },
      {
        id: 'ext1-v',
        type: 'draw-multi',
        prompt: '<b>P₀→P₁、P₁→P₂、P₂→P₃、P₃→P₄</b> の変位を、<b>4本まとめて</b>描こう。<br>'
              + 'Δt = 1 秒なので、これがそのまま<b>速度ベクトル</b>になる。',
        style: 'velocity',
        unit: 'm/s',
        scene: {
          points: {
            O:  { x: 0, y: 0, label: 'O', role: 'origin', draggable: true },
            P0: { x: 0, y: 1, label: 'P₀' },
            P1: { x: 2, y: 5, label: 'P₁' },
            P2: { x: 4, y: 7, label: 'P₂' },
            P3: { x: 6, y: 7, label: 'P₃' },
            P4: { x: 8, y: 5, label: 'P₄' }
          },
          vectors: [
            { id: 'r0', from: 'O', to: 'P0', style: 'position', locked: true, label: 'r⃗₀' },
            { id: 'r1', from: 'O', to: 'P1', style: 'position', locked: true, label: 'r⃗₁' },
            { id: 'r2', from: 'O', to: 'P2', style: 'position', locked: true, label: 'r⃗₂' },
            { id: 'r3', from: 'O', to: 'P3', style: 'position', locked: true, label: 'r⃗₃' },
            { id: 'r4', from: 'O', to: 'P4', style: 'position', locked: true, label: 'r⃗₄' }
          ]
        },
        targets: [
          { name: 'v⃗₀₁', label: 'v⃗₀₁', answer: { from: { x: 0, y: 1 }, to: { x: 2, y: 5 } } },
          { name: 'v⃗₁₂', label: 'v⃗₁₂', answer: { from: { x: 2, y: 5 }, to: { x: 4, y: 7 } } },
          { name: 'v⃗₂₃', label: 'v⃗₂₃', answer: { from: { x: 4, y: 7 }, to: { x: 6, y: 7 } } },
          { name: 'v⃗₃₄', label: 'v⃗₃₄', answer: { from: { x: 6, y: 7 }, to: { x: 8, y: 5 } } }
        ],
        progressText: 'あと {n} 本。順番はどれからでもよい。',
        doneText: '4本そろった。x 成分はずっと 2、y 成分だけが <b>4 → 2 → 0 → −2</b>。',
        feedback: [
          { when: 'reversed', text: '時間の進む順に描く。' },
          { when: 'fromOrigin', text: 'O からではない。点と点のあいだを結ぶ。' },
          { when: 'default', text: '位置ベクトルの先端どうしを結ぶ。' }
        ],
        explanation: '<span class="vec">v</span>₀₁=(2,4)　<span class="vec">v</span>₁₂=(2,2)　<span class="vec">v</span>₂₃=(2,0)　<span class="vec">v</span>₃₄=(2,−2)。',
        hints: ['先端から先端へ。第1話の変位と同じ引き方。'],
        reveal: {
          title: '減り方が、ずっと同じ',
          body: '<p>x 成分は 2 のまま。y 成分だけが <b>4 → 2 → 0 → −2</b> と、<b>1秒ごとに 2 ずつ</b>減っている。</p>'
              + '<p>この「減り方」を矢印で取り出す。</p>'
        }
      }
    ]
  },

  ext2: {
    title: '速度の変化を取り出す',
    minutes: 4,
    passLine: { correct: 2, of: 2 },
    scaleLabel: '1マス = 1 m/s　（速度の目盛）',
    transition: {
      title: '変位のときと同じことをする',
      body: '<p>変位は「2本の位置ベクトルの<b>先端どうしを結んだ</b>矢印」だった。</p>'
          + '<p>速度でも同じことをする。まず<b>4本の始点をそろえる</b>。速度ベクトルは自由ベクトルなので運べる。</p>',
      button: 'やってみる'
    },
    items: [
      {
        id: 'ext2-align',
        type: 'free-place',
        prompt: '4本の速度ベクトルを、<b>始点が点 A に重なるまで</b>ドラッグしよう。',
        unit: 'm/s',
        scene: {
          points: {
            A:  { x: 2, y: 3, label: 'A', role: 'origin' },
            P0: { x: 0, y: 1, label: 'P₀' },
            P1: { x: 2, y: 5, label: 'P₁' },
            P2: { x: 4, y: 7, label: 'P₂' },
            P3: { x: 6, y: 7, label: 'P₃' },
            P4: { x: 8, y: 5, label: 'P₄' }
          },
          vectors: [
            { id: 'v01', from: 'P0', to: 'P1', style: 'velocity', locked: false, draggable: true, label: 'v⃗₀₁' },
            { id: 'v12', from: 'P1', to: 'P2', style: 'velocity', locked: false, draggable: true, label: 'v⃗₁₂' },
            { id: 'v23', from: 'P2', to: 'P3', style: 'velocity', locked: false, draggable: true, label: 'v⃗₂₃' },
            { id: 'v34', from: 'P3', to: 'P4', style: 'velocity', locked: false, draggable: true, label: 'v⃗₃₄' }
          ]
        },
        readouts: [
          { id: 'v01', label: 'v⃗₀₁', vector: 'v01', watch: true, unchangedBadge: true },
          { id: 'v12', label: 'v⃗₁₂', vector: 'v12', watch: true, unchangedBadge: true },
          { id: 'v23', label: 'v⃗₂₃', vector: 'v23', watch: true, unchangedBadge: true },
          { id: 'v34', label: 'v⃗₃₄', vector: 'v34', watch: true, unchangedBadge: true }
        ],
        conditions: [{ kind: 'vectorsShareStart', of: ['v01', 'v12', 'v23', 'v34'], at: 'A' }],
        hintText: '矢印の線をつかんで運ぶ。運んでも成分は変わらない。',
        successText: '4本そろった。成分はどれも変わっていない。',
        hints: ['自由ベクトルなので、どこに置いても同じことを表す。'],
        reveal: {
          title: '先端が一直線に下りていく',
          body: '<p>そろえると、4本の先端が<b>等間隔に下りていく</b>のが見える。</p>'
              + '<p>この先端から先端への矢印が「速度の変化」。</p>'
        }
      },
      {
        id: 'ext2-dv',
        type: 'draw-multi',
        prompt: '先端から先端へ、<b>Δ<span class="vec">v</span> を3本まとめて</b>描こう。<br>'
              + '<span class="vec">v</span>₀₁→<span class="vec">v</span>₁₂、<span class="vec">v</span>₁₂→<span class="vec">v</span>₂₃、<span class="vec">v</span>₂₃→<span class="vec">v</span>₃₄ の順に対応する。',
        style: 'displacement',
        unit: 'm/s',
        scene: {
          points: {
            A:  { x: 2, y: 3, label: 'A', role: 'origin' },
            T1: { x: 4, y: 7, label: '' },
            T2: { x: 4, y: 5, label: '' },
            T3: { x: 4, y: 3, label: '' },
            T4: { x: 4, y: 1, label: '' }
          },
          vectors: [
            { id: 'v01', from: 'A', to: 'T1', style: 'velocity', locked: false, label: 'v⃗₀₁', appearDelay: 0.1 },
            { id: 'v12', from: 'A', to: 'T2', style: 'velocity', locked: false, label: 'v⃗₁₂', appearDelay: 0.4 },
            { id: 'v23', from: 'A', to: 'T3', style: 'velocity', locked: false, label: 'v⃗₂₃', appearDelay: 0.7 },
            { id: 'v34', from: 'A', to: 'T4', style: 'velocity', locked: false, label: 'v⃗₃₄', appearDelay: 1.0 }
          ]
        },
        targets: [
          { name: 'Δv⃗₁', label: 'Δv⃗₁', answer: { from: { x: 4, y: 7 }, to: { x: 4, y: 5 } } },
          { name: 'Δv⃗₂', label: 'Δv⃗₂', answer: { from: { x: 4, y: 5 }, to: { x: 4, y: 3 } } },
          { name: 'Δv⃗₃', label: 'Δv⃗₃', answer: { from: { x: 4, y: 3 }, to: { x: 4, y: 1 } } }
        ],
        progressText: 'あと {n} 本。',
        doneText: '3本とも、真下に 2。',
        feedback: [
          { when: 'reversed', text: '時間の進む順。前の先端から、あとの先端へ。' },
          { when: 'fromOrigin', text: 'A からではない。<b>先端</b>から引く。' },
          { when: 'default', text: '先端どうしを結ぶ。' }
        ],
        explanation: 'Δ<span class="vec">v</span> ＝ v aft − v bef。どれも (0, −2)。',
        hints: ['変位のときと同じ。先端から先端へ。'],
        reveal: {
          title: '3本とも同じ矢印',
          body: '<p>Δ<span class="vec">v</span>₁ ＝ Δ<span class="vec">v</span>₂ ＝ Δ<span class="vec">v</span>₃ ＝ (0, −2)。</p>'
              + '<p><b>上っている間も、頂点をこえた後も、同じ。</b></p>'
        }
      }
    ]
  },

  ext3: {
    title: 'Δ<span class="vec">v</span> が表すもの',
    minutes: 3,
    passLine: { correct: 2, of: 2 },
    scaleLabel: '1マス = 1 m/s',
    items: [
      {
        id: 'ext3-q1',
        type: 'choice',
        prompt: '3本の Δ<span class="vec">v</span> を見くらべよう。',
        question: '3本の Δ<span class="vec">v</span> に共通していることは？',
        scene: {
          points: {
            A:  { x: 2, y: 3, label: 'A', role: 'origin' },
            T1: { x: 4, y: 7, label: '' },
            T2: { x: 4, y: 5, label: '' },
            T3: { x: 4, y: 3, label: '' },
            T4: { x: 4, y: 1, label: '' }
          },
          vectors: [
            { id: 'v01', from: 'A',  to: 'T1', style: 'velocity',     locked: false, label: 'v⃗₀₁' },
            { id: 'v12', from: 'A',  to: 'T2', style: 'velocity',     locked: false, label: 'v⃗₁₂' },
            { id: 'v23', from: 'A',  to: 'T3', style: 'velocity',     locked: false, label: 'v⃗₂₃' },
            { id: 'v34', from: 'A',  to: 'T4', style: 'velocity',     locked: false, label: 'v⃗₃₄' },
            { id: 'dv1', from: 'T1', to: 'T2', style: 'displacement', locked: false, label: 'Δv⃗₁' },
            { id: 'dv2', from: 'T2', to: 'T3', style: 'displacement', locked: false, label: 'Δv⃗₂' },
            { id: 'dv3', from: 'T3', to: 'T4', style: 'displacement', locked: false, label: 'Δv⃗₃' }
          ]
        },
        options: [
          { key: 'ア', text: '向きは同じだが、長さがちがう', feedback: 'どれも 2 マス。' },
          { key: 'イ', text: '向きも長さも同じ（どれも真下に 2）' },
          { key: 'ウ', text: '上りと下りで向きが逆', feedback: '頂点をこえた後も、下を向いたまま。' },
          { key: 'エ', text: '共通することはない', feedback: '3本を重ねてみよう。' }
        ],
        correctIndex: 1,
        correctText: '1秒ごとに、<b>いつも同じ向きに、同じだけ</b>速度が変わっている。',
        explanation: '3本とも (0, −2)。速度の変わり方が一定だということ。'
      },
      {
        id: 'ext3-name',
        type: 'text-answer',
        prompt: '<b>Δ<span class="vec">v</span> ÷ Δt</b>（1秒あたりの速度の変化）を表す量には名前がある。',
        question: '漢字三文字で入力しよう。',
        placeholder: '漢字三文字',
        scene: {
          points: {
            A:  { x: 2, y: 3, label: 'A', role: 'origin' },
            T1: { x: 4, y: 7, label: '' },
            T2: { x: 4, y: 5, label: '' },
            T3: { x: 4, y: 3, label: '' },
            T4: { x: 4, y: 1, label: '' }
          },
          vectors: [
            { id: 'v01', from: 'A',  to: 'T1', style: 'velocity',     locked: false, label: 'v⃗₀₁' },
            { id: 'v12', from: 'A',  to: 'T2', style: 'velocity',     locked: false, label: 'v⃗₁₂' },
            { id: 'v23', from: 'A',  to: 'T3', style: 'velocity',     locked: false, label: 'v⃗₂₃' },
            { id: 'v34', from: 'A',  to: 'T4', style: 'velocity',     locked: false, label: 'v⃗₃₄' },
            { id: 'dv1', from: 'T1', to: 'T2', style: 'displacement', locked: false, label: 'Δv⃗₁' },
            { id: 'dv2', from: 'T2', to: 'T3', style: 'displacement', locked: false, label: 'Δv⃗₂' },
            { id: 'dv3', from: 'T3', to: 'T4', style: 'displacement', locked: false, label: 'Δv⃗₃' }
          ]
        },
        accept: ['加速度'],
        nearMiss: [
          { text: '重力', feedback: '向きは合っている。ただし重力は「力」の名前。ここで聞いているのは、1秒あたりに速度がどれだけ変わるかという量の名前。' },
          { text: '速度', feedback: '速度そのものではなく、その<b>変化の割合</b>。' },
          { text: '落下', feedback: '現象ではなく、量の名前。' }
        ],
        wrongText: '漢字三文字。「1秒あたりに速度がどれだけ変わるか」を表す量。',
        correctText: '正解。Δ<span class="vec">v</span> ÷ Δt が <b>加速度</b>。',
        explanation: 'v ＝ Δ<span class="vec">r</span> ÷ Δt と同じ形。位置の変化率が速度、速度の変化率が加速度。',
        hints: ['v ＝ Δ<span class="vec">r</span> ÷ Δt だった。では a ＝ Δ<span class="vec">v</span> ÷ Δt の a は？'],
        reveal: {
          title: '同じ操作が、二度きいた',
          body: '<ul><li>位置ベクトルの先端どうしを結ぶ → <b>変位</b>　÷Δt で <b>速度</b></li>'
              + '<li>速度ベクトルの先端どうしを結ぶ → <b>速度の変化</b>　÷Δt で <b>加速度</b></li></ul>'
              + '<p>やったことは「先端どうしを結ぶ」だけ。</p>'
              + '<p>そして加速度は、上りでも下りでも<b>ずっと真下に同じ大きさ</b>だった。'
              + '空気の抵抗を考えなければ、斜方投射の加速度は<b>運動の間じゅう変わらない</b>。'
              + 'これが、重力だけがはたらく運動の特徴。</p>'
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
        prompt: 'ベクトルの足し算は、どんな時に出てきただろうか。<b>2つ挙げて</b>、それぞれ何と何を足したのか書こう。',
        rows: 3,
        placeholder: '例：①…のとき、…と…を足した。②…のとき、…と…を足した。'
      }
    ],
    nextPreview: '<p>次は、基準を「<b>動いている物体</b>」に取り替える。</p>'
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
        prompt: '基準点の場所を変えたとき、変わるものと変わらないものがあった。<b>それぞれ何か。なぜそうなるのか。</b>',
        rows: 3,
        placeholder: '例：変わったのは…。変わらなかったのは…。なぜなら…。'
      }
    ],
    nextPreview: '<p>次回は、基準を「<b>動いている物体</b>」に取り替える。</p>'
  }
};
