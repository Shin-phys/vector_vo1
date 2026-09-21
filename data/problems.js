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
          + '<b>Sさんは、学校からどれだけ離れているでしょう？</b><br>'
          + '<span style="font-size:15px;color:#4b5563">この時間は、Sさんの動きを矢印（ベクトル）で表していきます。</span>',
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
        prompt: 'Sさんは<b>駅</b>にいます。駅は、学校から <b>+x に 3、+y に 1</b> の位置にある。'
              + '<b>学校から駅への矢印</b>を描こう。',
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
        // ② 同じ基準点から、もう1つの地点へ。この2本の先端どうしを結ぶのが次の変位。
        id: 's1q2',
        type: 'draw-vector',
        prompt: 'Sさんはこれから<b>公園</b>へ向かいます。公園は、学校から <b>−x に 2、+y に 3</b> の位置にある。'
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
        hints: ['基準点は さっきと同じ 学校です。−x は左向きです。'],
        feedback: [
          { when: 'reversed', text: '向きが逆です。学校から公園へ、の順で描きましょう。' },
          { when: 'wrongStart', text: '描き始めは学校です。基準点は変わっていません。' },
          { when: 'wrongLength', text: '向きは合っています。−x に 2 マス、+y に 3 マス、数え直してみましょう。' }
        ],
        explanation: '学校から −x に 2 マス、+y に 3 マス進んだ先が公園です。',
        reveal: {
          title: '同じ基準点から、2本',
          body: '<p>これで <b>学校 → 駅</b> と <b>学校 → 公園</b> の2本がそろいました。</p>'
              + '<p>どちらも同じ基準点（学校）から出ています。'
              + '次は、この<b>2本の先端どうし</b>に注目します。</p>'
        }
      },
      {
        // 1問目で描いた「学校→駅」を残したまま、基準点だけを公園に変える。
        // 同じ「駅」を指しているのに矢印が変わることを、その場で見せるのがねらい。
        id: 's1q3',
        type: 'draw-vector',
        prompt: 'では、基準を<b>公園</b>に取り替えてみます。<b>公園から駅</b>はどうでしょうか？'
              + '　矢印を引き、<b>向きと成分</b>を考えてみよう。',
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
        prompt: 'いま描いた2本の位置ベクトルを残してあります。'
              + '<br>Sさんが<b>駅から公園へ</b>移動しました。<b>この移動を表す矢印</b>を描こう。'
              + '<br><span style="font-size:15px;color:#4b5563">どの向きに、どれだけ位置が変わったか、の矢印です。</span>',
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
              + '<p class="sym-note">記号では、学校を基準とした駅の位置ベクトルを <b><span class="vec">r</span><sub>駅</sub></b>、'
              + '公園の位置ベクトルを <b><span class="vec">r</span><sub>公園</sub></b> と書きます。'
              + 'いま描いた「駅から公園へ」の変位 <b>Δ<span class="vec">r</span></b> は '
              + '<b><span class="vec">r</span><sub>公園</sub> − <span class="vec">r</span><sub>駅</sub></b>。'
              + '出発を <b>bef</b>、到着を <b>aft</b> と呼びます。'
              + '<b>矢印は bef → aft、式は aft − bef</b> です。</p>'
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
          { vector: 'rSta',  feedback: 'それは「学校から見て駅がどこか」を表す矢印です。Sさんの<b>移動</b>ではありません。' },
          { vector: 'rPark', feedback: 'それは「学校から見て公園がどこか」を表す矢印です。動いた向きとは別ものです。' },
          { vector: 'rLib',  feedback: 'Sさんは図書館へは行っていません。' },
          { vector: 'disp',  correct: true }
        ],
        correctText: '正解。速度の向きは、<b>変位の向きと同じ</b>です。',
        explanation: '速度の向きは、動いた向き——つまり変位の向きです。',
        hints: ['Sさんが「どの向きに動いたか」を表している矢印はどれでしょう。'],
        reveal: {
          title: 'なぜ v と Δ<span class="vec">r</span> は同じ向きなのか',
          body: '<p style="text-align:center;font-size:21px;margin:.2em 0 .6em"><span class="eq"><span class="vec">v</span> ＝ <span class="frac"><span class="num">Δ<span class="vec">r</span></span><span class="den">Δt</span></span></span></p>'
              + '<p>Δt（かかった時間）は必ず正の数です。矢印を<b>正の数で割っただけ</b>なので、'
              + '向きは変わりません。</p>'
              + '<p>変わるのは<b>長さ</b>だけ。つまり「1マスが何を表すか」だけが変わります。'
              + 'このことは ④ でもう一度出てきます。</p>'
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
      body: '<p>ベクトルには2つの種類があります。</p>'
          + '<ul><li><b>自由ベクトル</b>　…　置き直して（平行移動して）よいもの</li>'
          + '<li><b>束縛ベクトル</b>　…　置き直すと意味が壊れるもの</li></ul>'
          + '<p>いま画面にある2本が、それぞれ持っている情報を確かめておきます。</p>'
          + '<ul><li><b>位置ベクトル</b> r（学校→駅）…　<b>基準点</b>（学校）と<b>その地点</b>（駅）の、'
          + '<b>どちらの情報も</b>持っている</li>'
          + '<li><b>変位ベクトル</b> Δ<span class="vec">r</span>（駅→公園）…　<b>位置がどれだけ変化したか</b>の情報を持っている</li></ul>'
          + '<p>どちらが自由ベクトルで、どちらが束縛ベクトルでしょう。'
          + 'まず予想して、そのあと<b>実際に動かして</b>確かめます。</p>'
    },
    items: [
      {
        // 名前を先に与え、予想を立てさせてから動かす。
        // ここで当たるかどうかは重要ではなく、「動かして確かめる」動機をつくるのが目的。
        id: 's25a-q0',
        type: 'choice',
        prediction: true,                 // 予想。正誤は出さない（動かしたあとで、もう一度聞く）
        prompt: '予想してみよう',
        question: '画面の2本は、どちらが<b>自由ベクトル</b>（動かしてよい）で、どちらが<b>束縛ベクトル</b>（動かせない）でしょう？',
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
        afterPick: 'それが予想です。<b>合っているかどうかは、いまは言いません。</b>次の画面で、実際に両方動かして確かめましょう。'
      },
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
              + '<p>それでも位置ベクトルだけは元に戻ります。</p>'
              + '<p>位置ベクトル r は、<b>基準点</b>と<b>その先の地点</b>の、どちらの情報も持っていました。'
              + 'これを移動すると、<b>基準点も、その先の地点も、どちらも変わってしまいます</b>。'
              + 'つまり <b>別ものどうしをつないでいる</b>ことになります。</p>'
              + '<p>変位ベクトル Δ<span class="vec">r</span> が持っているのは「位置がどれだけ変化したか」だけです。'
              + '移動しても、<b>矢印を描く位置が変わるだけで、中身は同じ</b>です。</p>'
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
        explanation: '手を離しても元に戻らなかった変位ベクトルが自由、戻ってしまった位置ベクトルが束縛です。'
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
          body: '<ul><li><b>位置ベクトル</b> r ＝ 基準点とその先の地点、どちらの情報も持つ。置き直すと別ものになる（🔒 がつく）</li><li><b>変位ベクトル</b>＝向きと大きさだけを言っている。どこに置いてもよい</li></ul><p>これから先も、🔒 のついた矢印は動かしても元に戻ります。</p>'
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
          + 'ということです。</p>'
          + '<p>本当にそう言い切れるでしょうか。もっと乱暴なことをして確かめます。'
          + '——<b>測る基準そのものを動かしてみましょう。</b></p>',
      button: 'やってみる'
    },
    items: [
      {
        id: 's25b-t3',
        type: 'explore-drag',
        prompt: '課題3｜人が駅から公園へ移動しました。<b>基準点 O をドラッグ</b>して、3か所以上に動かしてみよう。',
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
          remaining: '基準点Oを あと {n} か所 に動かしてみましょう。上の2つと下の1つ、どちらが赤く光りますか。',
          done: '2本の位置ベクトルは<b>2本とも</b>変わりました。変位ベクトルだけが変わりませんでしたね。'
        },
        hints: ['数値表示を見ながら O を動かしましょう。赤く光った数と、「変化なし」の数があります。'],
        reveal: {
          title: '2本が、同じだけずれている',
          body: '<p>基準点が変われば、位置ベクトル r は<b>向きも長さも変わります</b>。'
              + 'もとの r が持っていた情報は、<b>何ひとつ残りません</b>。</p>'
              + '<p>それでも、O→駅 と O→公園 の<b>2本は同じだけずれます</b>。'
              + '変位はその2本の<b>先端どうしを結んだ矢印</b>なので、結んだ矢印は動きません。</p>'
              + '<p>Δ<span class="vec">r</span> が持っているのは「位置の変化」だけ。基準点とは関わりがないのです。</p>'
        }
      },
      {
        id: 's25b-q',
        type: 'choice',
        prompt: 'なぜ変位は変わらないのだろう',
        question: '基準点 O を動かしても変位ベクトルが変わらないのは、なぜですか？',
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
          { key: 'ア', text: '変位は長さも向きも決まっている量なので、基準を動かしても変わらないから', feedback: '「決まっている」のは結果です。なぜ決まるのか、画面で起きたことから考えてみましょう。' },
          { key: 'イ', text: '基準を動かすと2本の位置ベクトルが同じだけずれるので、その差は変わらないから' },
          { key: 'ウ', text: '変位は基準点から離れた場所にあるので、基準の影響を受けないから', feedback: '場所の遠さの問題ではありません。O を駅のすぐ隣に置いても変位は変わりませんでした。' },
          { key: 'エ', text: '今回はたまたま変わらなかっただけで、いつも変わらないとは限らないから', feedback: '3か所以上動かしても変わりませんでした。偶然ではなさそうです。' }
        ],
        correctIndex: 1,
        correctText: 'そのとおり。O→駅 と O→公園 が同じだけずれるので、その先端どうしを結んだ変位は動きません。',
        explanation: '変位は2本の位置ベクトルの差です。基準を動かすと2本とも同じだけずれるので、差は変わりません。',
        reveal: {
          title: 'ポイント：変化を表すベクトルは、移動できる',
          body: '<p>Δ<span class="vec">r</span> が持っているのは「<b>位置がどれだけ変化したか</b>」だけです。'
              + '基準をどこに置こうと、その情報は変わりませんでした。</p>'
              + '<p>だから <b>Δ<span class="vec">r</span> は、どこに置き直してもよい</b>のです。'
              + '②.5a で動かせたのは、これが理由でした。</p>'
              + '<p><b>変化を表すベクトルは、移動できる。</b>'
              + 'これは Δ<span class="vec">r</span> だけの話ではありません。<b>速度ベクトルも、加速度ベクトルも移動できます。</b>'
              + '——どれも「変化」を表す量だからです。</p>'
              + '<p class="sym-note">基準を取り替えるという考え方は、<b>第3話でもう一度出てきます</b>。</p>'
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
    prompt: '基準点 <b>O</b> は学校。<b>まず図を見て答え、あとから式で確かめます。</b>'
          + '<br><span style="font-size:15px;color:#4b5563">式や記号をタップすると、図の対応する矢印が光ります。</span>',
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
        + 'つまり <b>Δ<span class="vec">r</span> ＝ <span class="vec">r</span><sub>aft</sub> − <span class="vec">r</span><sub>bef</sub></b>。添字は「基準 → 対象」の順に書きます。',
    // ①直感 → ②bef → ③aft → ④式、の順で進む（js/steps/step6-symbol.js が順に出す）
    quizValue: {
      question: '① まず直感で。Sさんの<b>駅から公園への変位 Δ<span class="vec">r</span></b> を、向きと大きさで答えよう。',
      logLabel: '① Δ<span class="vec">r</span>（駅→公園）　＝',
      answer: { x: -5, y: 2 },
      retryHint: '図のマスを数えるだけで出ます。x はどちらへいくつ、y はどちらへいくつ？',
      explain: '図のとおり <b>x に −5、y に +2</b>。これが答えです。'
             + 'では、この答えを<b>式でも出せるか</b>を確かめていきましょう。'
    },
    coordBef: {
      question: '② 出発（<b>bef</b>）は駅。基準点 O から見た <b><span class="vec">r</span><sub>bef</sub></b>（＝<span class="vec">r</span><sub>駅</sub>）の成分は？',
      logLabel: '② <span class="vec">r</span><sub>bef</sub>（O→駅）　＝',
      answer: { x: 3, y: 1 },
      lit: 'rStation',
      retryHint: 'O から駅へ、x にいくつ、y にいくつでしょう。',
      explain: '<b><span class="vec">r</span><sub>駅</sub> ＝ (+3, +1)</b>。O から駅への位置ベクトルです。'
    },
    coordAft: {
      question: '③ 到着（<b>aft</b>）は公園。基準点 O から見た <b><span class="vec">r</span><sub>aft</sub></b>（＝<span class="vec">r</span><sub>公園</sub>）の成分は？',
      logLabel: '③ <span class="vec">r</span><sub>aft</sub>（O→公園）　＝',
      answer: { x: -2, y: 3 },
      lit: 'rPark',
      retryHint: 'O から公園へ。x は左向きなので −、y は上向きなので ＋ です。',
      explain: '<b><span class="vec">r</span><sub>公園</sub> ＝ (−2, +3)</b>。O から公園への位置ベクトルです。'
    },
    quizOrder: {
      question: '④ 下の「ここまでに出した答え」を見くらべよう。Δ<span class="vec">r</span>（駅 → 公園）を<b>式</b>で書くと？',
      options: [
        { key: 'ア', text: '<span class="vec">r</span><sub>駅</sub> − <span class="vec">r</span><sub>公園</sub>　（bef − aft）',
          feedback: '計算すると (+3, +1) − (−2, +3) ＝ (+5, −2)。①で出した答えと<b>符号が逆</b>になります。' },
        { key: 'イ', text: '<span class="vec">r</span><sub>公園</sub> − <span class="vec">r</span><sub>駅</sub>　（aft − bef）' },
        { key: 'ウ', text: '<span class="vec">r</span><sub>駅</sub> ＋ <span class="vec">r</span><sub>公園</sub>',
          feedback: '足すと、駅でも公園でもない場所を指してしまいます。' }
      ],
      correct: 1,
      explain: '③ − ② ＝ (−2, +3) − (+3, +1) ＝ <b>(−5, +2)</b>。'
             + '①で直感的に出した答えと、ぴったり一致しました。<br>'
             + '<b>Δ<span class="vec">r</span> ＝ <span class="vec">r</span><sub>aft</sub> − <span class="vec">r</span><sub>bef</sub>。矢印は bef → aft、式は aft − bef</b> です。'
    }
  },


  /* ===================== 発展：斜方投射（第1話と第2話のあいだ） =====================
     位置ベクトルは描画済み。基準点 O はどの画面でもドラッグできる（第1話の確認）。
     P0〜P3 は 1 秒ごとの位置。v01=(2,4) v12=(2,2) v23=(2,0) なので Δ<span class="vec">v</span> はどちらも (0,−2)。 */

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
            { id: 'r0',  from: 'O',  to: 'P0', style: 'position',     locked: true, label: 'r⃗₀' },
            { id: 'r1',  from: 'O',  to: 'P1', style: 'position',     locked: true, label: 'r⃗₁' },
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
        prompt: '<b>P₀ から P₁ への変位</b>を描こう。Δt = 1 秒なので、この矢印がそのまま<b>速度ベクトル <span class="vec">v</span>₀₁</b>になります。',
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
            { id: 'r0', from: 'O', to: 'P0', style: 'position', locked: true, label: 'r⃗₀' },
            { id: 'r1', from: 'O', to: 'P1', style: 'position', locked: true, label: 'r⃗₁' },
            { id: 'r2', from: 'O', to: 'P2', style: 'position', locked: true, label: 'r⃗₂' },
            { id: 'r3', from: 'O', to: 'P3', style: 'position', locked: true, label: 'r⃗₃' }
          ]
        },
        answer: { from: { x: 1, y: 1 }, to: { x: 3, y: 5 } },
        hints: ['位置ベクトルの先端どうしを結びます。P₀ から P₁ へ。'],
        feedback: [
          { when: 'reversed', text: 'P₀ から P₁ へ、時間の進む順に描きます。' },
          { when: 'fromOrigin', text: 'O からではありません。P₀ から描き始めます。' }
        ],
        explanation: 'P₀ から P₁ へ、x +2・y +4。Δt = 1 秒なので <span class="vec">v</span>₀₁ = (2, 4) m/s です。',
        reveal: {
          title: 'Δt = 1 秒のとき、変位と速度は同じ矢印',
          body: '<p><span class="eq"><span class="vec">v</span> ＝ <span class="frac"><span class="num">Δ<span class="vec">r</span></span><span class="den">Δt</span></span></span>　でした。1 秒あたりで見ているので、<b>変位の矢印がそのまま速度の矢印</b>になります。</p><p>ただし目盛の意味は m から m/s に変わっています。</p>'
        }
      },
      {
        id: 'ext1-v12',
        type: 'draw-vector',
        prompt: '同じように、<b><span class="vec">v</span>₁₂</b>（P₁ から P₂ へ）を描こう。',
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
            { id: 'r0',  from: 'O',  to: 'P0', style: 'position', locked: true, label: 'r⃗₀' },
            { id: 'r1',  from: 'O',  to: 'P1', style: 'position', locked: true, label: 'r⃗₁' },
            { id: 'r2',  from: 'O',  to: 'P2', style: 'position', locked: true, label: 'r⃗₂' },
            { id: 'r3',  from: 'O',  to: 'P3', style: 'position', locked: true, label: 'r⃗₃' },
            { id: 'v01', from: 'P0', to: 'P1', style: 'velocity', locked: false, label: 'v⃗₀₁' }
          ]
        },
        answer: { from: { x: 3, y: 5 }, to: { x: 5, y: 7 } },
        hints: ['P₁ から P₂ へ。x にいくつ、y にいくつでしょう。'],
        feedback: [
          { when: 'wrongStart', text: '描き始めは P₁ です。' },
          { when: 'wrongLength', text: '向きは合っています。y に何マスでしょう。' }
        ],
        explanation: '<span class="vec">v</span>₁₂ = (2, 2) m/s。x 成分は変わらず、y 成分が 4 から 2 に減りました。'
      },
      {
        id: 'ext1-v23',
        type: 'draw-vector',
        prompt: 'もう1本、<b><span class="vec">v</span>₂₃</b>（P₂ から P₃ へ）を描こう。',
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
            { id: 'r0',  from: 'O',  to: 'P0', style: 'position', locked: true, label: 'r⃗₀' },
            { id: 'r1',  from: 'O',  to: 'P1', style: 'position', locked: true, label: 'r⃗₁' },
            { id: 'r2',  from: 'O',  to: 'P2', style: 'position', locked: true, label: 'r⃗₂' },
            { id: 'r3',  from: 'O',  to: 'P3', style: 'position', locked: true, label: 'r⃗₃' },
            { id: 'v01', from: 'P0', to: 'P1', style: 'velocity', locked: false, label: 'v⃗₀₁' },
            { id: 'v12', from: 'P1', to: 'P2', style: 'velocity', locked: false, label: 'v⃗₁₂' }
          ]
        },
        answer: { from: { x: 5, y: 7 }, to: { x: 7, y: 7 } },
        hints: ['P₂ と P₃ は同じ高さです。y 成分はいくつでしょう。'],
        feedback: [
          { when: 'wrongLength', text: '高さが変わっていません。y 成分は 0 です。' }
        ],
        explanation: '<span class="vec">v</span>₂₃ = (2, 0) m/s。y 成分が 0 になりました。',
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
            { id: 'v01', from: 'P0', to: 'P1', style: 'velocity', locked: false, draggable: true, label: 'v⃗₀₁' },
            { id: 'v12', from: 'P1', to: 'P2', style: 'velocity', locked: false, draggable: true, label: 'v⃗₁₂' },
            { id: 'v23', from: 'P2', to: 'P3', style: 'velocity', locked: false, draggable: true, label: 'v⃗₂₃' }
          ]
        },
        readouts: [
          { id: 'v01', label: 'v⃗₀₁', vector: 'v01', watch: true, unchangedBadge: true },
          { id: 'v12', label: 'v⃗₁₂', vector: 'v12', watch: true, unchangedBadge: true },
          { id: 'v23', label: 'v⃗₂₃', vector: 'v23', watch: true, unchangedBadge: true }
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
        prompt: '<b><span class="vec">v</span>₀₁ の先端から <span class="vec">v</span>₁₂ の先端へ</b>、矢印を描こう。これが <b>Δ<span class="vec">v</span>₁</b>（速度の変化）です。',
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
            { id: 'v01', from: 'A', to: 'T1', style: 'velocity', locked: false, label: 'v⃗₀₁', appearDelay: 0.1 },
            { id: 'v12', from: 'A', to: 'T2', style: 'velocity', locked: false, label: 'v⃗₁₂', appearDelay: 0.5 },
            { id: 'v23', from: 'A', to: 'T3', style: 'velocity', locked: false, label: 'v⃗₂₃', appearDelay: 0.9 }
          ]
        },
        answer: { from: { x: 4, y: 5 }, to: { x: 4, y: 3 }, origin: { x: 2, y: 1 } },
        hints: ['変位のときと同じです。先端から先端へ。'],
        feedback: [
          { when: 'reversed', text: '時間の進む順です。<span class="vec">v</span>₀₁ の先端から <span class="vec">v</span>₁₂ の先端へ。' },
          { when: 'fromOrigin', text: 'A からではありません。<span class="vec">v</span>₀₁ の<b>先端</b>から描き始めます。' }
        ],
        explanation: 'Δ<span class="vec">v</span>₁ = <span class="vec">v</span><sub>aft</sub> − <span class="vec">v</span><sub>bef</sub> = <span class="vec">v</span>₁₂ − <span class="vec">v</span>₀₁ = (2, 2) − (2, 4) = <b>(0, −2)</b>。真下を向いた矢印になります。'
      },
      {
        id: 'ext2-dv2',
        type: 'draw-vector',
        prompt: 'もう1本、<b><span class="vec">v</span>₁₂ の先端から <span class="vec">v</span>₂₃ の先端へ</b>。これが <b>Δ<span class="vec">v</span>₂</b> です。',
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
            { id: 'v01', from: 'A',  to: 'T1', style: 'velocity',     locked: false, label: 'v⃗₀₁' },
            { id: 'v12', from: 'A',  to: 'T2', style: 'velocity',     locked: false, label: 'v⃗₁₂' },
            { id: 'v23', from: 'A',  to: 'T3', style: 'velocity',     locked: false, label: 'v⃗₂₃' },
            { id: 'dv1', from: 'T1', to: 'T2', style: 'displacement', locked: false, label: 'Δv⃗₁' }
          ]
        },
        answer: { from: { x: 4, y: 3 }, to: { x: 4, y: 1 }, origin: { x: 2, y: 1 } },
        hints: ['1本目とまったく同じ描き方です。'],
        feedback: [
          { when: 'reversed', text: '<span class="vec">v</span>₁₂ の先端から <span class="vec">v</span>₂₃ の先端へ、の順です。' }
        ],
        explanation: 'Δ<span class="vec">v</span>₂ = <span class="vec">v</span><sub>aft</sub> − <span class="vec">v</span><sub>bef</sub> = <span class="vec">v</span>₂₃ − <span class="vec">v</span>₁₂ = (2, 0) − (2, 2) = <b>(0, −2)</b>。1本目とまったく同じ矢印です。'
      }
    ]
  },

  ext3: {
    title: 'Δ<span class="vec">v</span> が表しているもの',
    minutes: 2,
    passLine: { correct: 1, of: 2 },
    scaleLabel: '1マス = 1 m/s',
    items: [
      {
        id: 'ext3-q1',
        type: 'choice',
        prompt: '2本の Δ<span class="vec">v</span> を見くらべよう。',
        question: '2本の Δ<span class="vec">v</span> に共通していることは何ですか？',
        scene: {
          points: {
            A:  { x: 2, y: 1, label: 'A', role: 'origin' },
            T1: { x: 4, y: 5, label: '' },
            T2: { x: 4, y: 3, label: '' },
            T3: { x: 4, y: 1, label: '' }
          },
          vectors: [
            { id: 'v01', from: 'A',  to: 'T1', style: 'velocity',     locked: false, label: 'v⃗₀₁' },
            { id: 'v12', from: 'A',  to: 'T2', style: 'velocity',     locked: false, label: 'v⃗₁₂' },
            { id: 'v23', from: 'A',  to: 'T3', style: 'velocity',     locked: false, label: 'v⃗₂₃' },
            { id: 'dv1', from: 'T1', to: 'T2', style: 'displacement', locked: false, label: 'Δv⃗₁' },
            { id: 'dv2', from: 'T2', to: 'T3', style: 'displacement', locked: false, label: 'Δv⃗₂' }
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
        prompt: '<b>Δ<span class="vec">v</span> ÷ Δt</b>（1秒あたりの速度の変化）を表す量には、名前がついています。',
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
            { id: 'v01', from: 'A',  to: 'T1', style: 'velocity',     locked: false, label: 'v⃗₀₁' },
            { id: 'v12', from: 'A',  to: 'T2', style: 'velocity',     locked: false, label: 'v⃗₁₂' },
            { id: 'v23', from: 'A',  to: 'T3', style: 'velocity',     locked: false, label: 'v⃗₂₃' },
            { id: 'dv1', from: 'T1', to: 'T2', style: 'displacement', locked: false, label: 'Δv⃗₁' },
            { id: 'dv2', from: 'T2', to: 'T3', style: 'displacement', locked: false, label: 'Δv⃗₂' }
          ]
        },
        accept: ['加速度'],
        nearMiss: [
          { text: '重力', feedback: '向きは合っています。でも重力は「力」の名前です。いま聞いているのは、1秒あたりに速度がどれだけ変わるか、という量の名前です。' },
          { text: '速度', feedback: '速度そのものではなく、その<b>変化の割合</b>のほうです。' },
          { text: '落下', feedback: '現象の名前ではなく、量の名前です。' }
        ],
        wrongText: '漢字三文字です。「1秒あたりに速度がどれだけ変わるか」を表す量の名前を思い出してみましょう。',
        correctText: '正解。Δ<span class="vec">v</span> ÷ Δt が <b>加速度</b>です。',
        explanation: 'v = Δ<span class="vec">r</span> / Δt と同じ形です。位置の変化率が速度、速度の変化率が加速度。',
        hints: ['v = Δ<span class="vec">r</span> / Δt でした。では a = Δ<span class="vec">v</span> / Δt の a は？'],
        reveal: {
          title: '同じ操作が、二度きいた',
          body: '<p style="text-align:center;font-size:20px;margin:.2em 0 .6em"><span class="eq"><span class="vec">v</span> ＝ <span class="frac"><span class="num">Δ<span class="vec">r</span></span><span class="den">Δt</span></span></span>　　<span class="eq"><span class="vec">a</span> ＝ <span class="frac"><span class="num">Δ<span class="vec">v</span></span><span class="den">Δt</span></span></span></p>'
              + '<ul><li>位置ベクトルの先端どうしを結ぶ → <b>変位</b>　これを Δt で割ると <b>速度</b></li><li>速度ベクトルの先端どうしを結ぶ → <b>速度の変化</b>　これを Δt で割ると <b>加速度</b></li></ul><p>矢印の先端どうしを結ぶという、たった一つの操作でした。</p><p>そして加速度の矢印は、ずっと<b>真下</b>を向いていました。この先で意味がわかります。</p>'
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
