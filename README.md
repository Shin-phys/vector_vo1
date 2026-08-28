# ベクトル作図ステップ学習アプリ（第1弾：運動の表し方）

高校「物理基礎」の授業用。生徒1人1台の端末で、40分の授業内に最初から最後まで到達することを想定しています。

- ビルド不要のバニラJS（ES Modules）＋素のSVG。npm・バンドラ・フレームワーク・外部ライブラリは一切使いません。
- タッチとマウスの両対応（Pointer Events）。iPad・Chromebook・PCで動きます。
- 進捗は `localStorage` に保存され、リロードしても途中から再開できます。

**公開ページ**：<https://shin-phys.github.io/vector_vo1/>

---

## 1. ローカルで確認する

ES Modules を使っているため、`index.html` をダブルクリックして `file://` で開くと動きません（ブラウザがモジュールの読み込みを拒否します）。かならず簡易サーバを立ててください。

```bash
cd ベクトル図学習_vol.1
python3 -m http.server 8000
```

ブラウザで <http://localhost:8000> を開きます。停止は `Ctrl+C`。

> ファイルを編集したら、ブラウザで **スーパーリロード**（Windows: `Ctrl+Shift+R` / Mac: `Cmd+Shift+R`）してください。ふつうのリロードだと古いJSがキャッシュから読まれることがあります。

## 2. GitHub Pages に公開する

リポジトリ：<https://github.com/Shin-phys/vector_vo1>

### はじめて公開するとき

```bash
cd ベクトル図学習_vol.1
git init
git add .
git commit -m "ベクトル作図ステップ学習アプリ 第1弾"
git branch -M main
git remote add origin https://github.com/Shin-phys/vector_vo1.git
git push -u origin main
```

そのあと GitHub のリポジトリページで：

1. **Settings** →左メニューの **Pages**
2. **Source** を `Deploy from a branch` にする
3. **Branch** を `main` ／ フォルダを `/ (root)` にして **Save**
4. 1〜2分待つと <https://shin-phys.github.io/vector_vo1/> で開けるようになります

### 2回目以降（問題を直したとき）

```bash
git add .
git commit -m "①の問2を差し替え"
git push
```

push すると自動で再公開されます。反映まで1分ほどかかります。生徒側で古い画面が出るときはスーパーリロードしてもらってください。

---

## 3. ファイル構成

```
/
├─ index.html          画面の骨格（ここは基本さわりません）
├─ README.md
├─ css/
│   └─ style.css       見た目。端末プロファイルごとのレイアウトもここ
├─ data/
│   ├─ problems.js     ★ 全問題データ。教員が編集する唯一のファイル
│   └─ config.js       色・スナップ・判定許容・ヒント秒数・時間配分
└─ js/
    ├─ main.js         エントリ。ステップの並び順と、問題タイプ別の共通エンジン
    ├─ canvas.js       方眼描画・座標変換
    ├─ vector.js       矢印の生成・ドラッグ・スナップ・判定・シーン管理
    ├─ ui.js           進捗バー・ヒント・フィードバック・モーダル
    ├─ layout.js       端末プロファイルの判定とレイアウト切替
    ├─ storage.js      localStorage・学習ログ
    └─ steps/          各ステップ（中身は data/problems.js を読んで動くだけ）
```

## 4. 授業の流れ（目安 40分）

| | 内容 | 分 | 問題数 |
|---|---|---|---|
| 導入 | 教師が説明 | 3 | — |
| ① | 位置を矢印で表す | 4 | 2問 |
| ② | 変位＝先端から先端へ | 6 | 3問 |
| ②.5a | 置き直してみる | 4 | 2課題 |
| ②.5b | **基準を取り替えてみる（本アプリの核）** | 3 | 1課題＋1問 |
| ③ | 変位をつなぐ | 5 | 2問 |
| ④ | 速度の矢印 | 4 | 2問 |
| ⑤ | 速度の合成 | 6 | 2問＋スライダー |
| 振り返り | 自由記述・コピー提出 | 5 | 1 |

生徒を足止めしない設計です。各ステップは合格ライン（例「3問中2問」）に達した時点で次へ進めますし、誤答のまま3回試行したら解説を出して必ず通します。ヒントの使用回数は記録しますが、生徒には減点として見せません。

### 授業時間が足りないとき

`js/main.js` の先頭にステップの並び順があります。**1行コメントアウトするだけ**でそのステップを飛ばせます。

```js
const STEP_ORDER = [
  'intro',
  'step1',
  'step2',
  'step25a',
  'step25b',
  // 'step3',   ← ③を飛ばす
  'step4',
  'step5',
  'reflection'
];
```

削る場合の優先度は、③問2 → ⑤問1 → ④問2 の順です。**②.5a と ②.5b は削らないでください。**

なお③は「継ぎ足す課題 → 2本の和 → 3本の和」の3つで構成しています。最初の課題で生徒が自分の手で2本目を運んで継ぐので、ここを飛ばすと「継ぎ足す＝和」がただの主張になります。削るなら3本のほうです。

---

## 5. 問題を追加・修正したいとき

さわるのは **`data/problems.js` だけ** です。他のファイルを開く必要はありません。

### 5-1. 座標の決まり

方眼は左下が原点で、**右が東（+x）・上が北（+y）**。矢印の端は必ず格子点（整数）にスナップします。

タブレット・PCは 10×10、スマホは 8×8 の方眼になります。**座標は 0〜8 の範囲に収めておく**と、どちらの端末でもはみ出しません。

ファイルの先頭に共通の地図があります。地点を足したいときはここに追記してください。

```js
const MAP = {
  school:  { x: 3, y: 3, label: '学校' },
  station: { x: 6, y: 4, label: '駅' },
  park:    { x: 1, y: 6, label: '公園' },
  library: { x: 4, y: 1, label: '図書館' },
  post:    { x: 7, y: 2, label: '郵便局' }   // ← こんなふうに追加できます
};
```

### 5-2. 矢印を1本描かせる問題を足す（`draw-vector`）

いちばんよく使う型です。該当ステップの `items:` の配列に、次のかたまりを追加します。**カンマの付け忘れに注意してください。**

```js
{
  id: 's1q3',                       // 他と重複しない名前なら何でもよい
  type: 'draw-vector',
  prompt: '郵便局は、学校から東に 4、南に 1 の位置にある。<b>学校から郵便局への矢印</b>を描こう。',
  style: 'position',                // position（グレー実線・🔒）/ displacement（グレー破線）/ velocity（青）
  unit: 'km',
  origin: { ...MAP.school },        // 基準点として輪つきで表示する点（省略可）
  landmarks: [{ ...MAP.post }],     // 目印として表示する点（省略可）
  answer: { from: { x: 3, y: 3 }, to: { x: 7, y: 2 } },
  hints: ['矢印はどこから描き始めますか？'],
  feedback: [
    { when: 'reversed',   text: '向きが逆です。学校から郵便局へ、の順で描いていますか？' },
    { when: 'wrongStart', text: '描き始めの点を確かめましょう。' }
  ],
  explanation: '3回まちがえたときに出す解説文です。'
}
```

`feedback` の `when` に書けるのは、アプリが**ずれ方から推定した誤答パターン**の名前です。

| `when` | どんなときに出るか |
|---|---|
| `reversed` | 向きがほぼ逆（150°以上ずれている） |
| `fromOrigin` | 基準点から描いてしまっている（`answer` に `origin` を書いたときだけ判定します） |
| `wrongStart` | 描き始めの点がちがう |
| `wrongLength` | 向きは合っているが長さがちがう |
| `wrongDirection` | 向きがちがう |
| `sumOfLengths` | 長さをそのまま足している（`answer` に `legs` を書いたときだけ判定します） |
| `default` | 上のどれにも書いていないとき |

書かなかったパターンには、アプリの標準メッセージが出ます。消しても壊れません。

正解したあとに用語を出したいときは `reveal` を足します。

```js
reveal: {
  title: 'この矢印を「位置ベクトル」といいます',
  body: '<p>ある基準点から見て…</p>'
}
```

正解したあとに矢印を重ねて見せたいとき（④の「変位と速度を重ねる」など）は `revealVectors`、道すじを点線で残したいとき（⑤の航跡）は `revealPath` を使います。

```js
revealVectors: [
  { from: { x: 1, y: 1 }, to: { x: 7, y: 1 }, style: 'displacement', label: '変位 6 km' },
  { from: { x: 1, y: 1 }, to: { x: 4, y: 1 }, style: 'velocity',     label: '速度 3 km/h' }
],
revealPath: [{ x: 2, y: 1 }, { x: 5, y: 5 }]
```

### 5-3. 選択肢の問題を足す（`choice`）

◯×形式にはしないでください（手続きの暗記になります）。4択が基本です。

```js
{
  id: 's25a-q2',
  type: 'choice',
  prompt: '画面の上に出る短い見出し',
  question: '位置ベクトルを平行移動すると、何が言えなくなりますか？',
  showCanvas: false,                // 方眼を出さないなら false
  options: [
    { key: 'ア', text: '矢印の長さがわからなくなる', feedback: '選んだときに出る個別のことば' },
    { key: 'イ', text: '矢印の向きがわからなくなる', feedback: '…' },
    { key: 'ウ', text: 'どの地点を指しているのかがわからなくなる' },   // 正答には feedback 不要
    { key: 'エ', text: '何も困らない', feedback: '…' }
  ],
  correctIndex: 2,                  // 0から数えます（この例では「ウ」）
  correctText: '正解したときのことば',
  explanation: '3回まちがえたときの解説'
}
```

### 5-4. 動かして観察させる課題（`explore-drag`）

「点や矢印を動かすと何が変わるか」を体験させる型です。**画面に置くもの（シーン）**と、**通過の条件**を書きます。

```js
{
  id: 's25b-t3',
  type: 'explore-drag',
  prompt: '基準点 O をドラッグして、3か所以上に動かしてみよう。',
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
    { id: 'pos',  label: '位置ベクトル O→駅',   vector: 'pos',  watch: true },
    { id: 'disp', label: '変位ベクトル 駅→公園', vector: 'disp', watch: true, unchangedBadge: true }
  ],
  requirement: { kind: 'distinctPositions', point: 'O', count: 3 }
}
```

- `points` の `draggable: true` … その点を生徒が動かせます
- `vectors` の `locked: true` … **束縛ベクトル**。ドラッグはできますが、指を離すと元に戻り、始点の 🔒 が光ります（この挙動そのものが教材です）
- `vectors` の `draggable: true` … 矢印そのものをつかんで平行移動できます
- `showTipLabel: true` … ドラッグ中、矢印の先が指す場所の名前をリアルタイムに表示します

`readouts`（キャンバスの外に固定表示される数値）に書けるもの：

| 書き方 | 表示されるもの |
|---|---|
| `watch: true` | 値が変わったら**赤くフラッシュ**する |
| `unchangedBadge: true` | 値が変わらなかったら「**変化なし**」バッジを出す |
| `show: 'components'` | `(3, 1)` のような成分だけ |
| `show: 'magnitude'` | 大きさだけ |
| `show: 'tip'` | 矢印の先が指している場所の名前 |
| 省略 | 「東へ3、北へ1　(3, 1)」 |

`requirement`（これを満たすまで次へ進めない）：

| 書き方 | 条件 |
|---|---|
| `{ kind: 'eachDragged', ids: ['pos', 'disp'] }` | 挙げたものを**それぞれ一度ずつ**動かす |
| `{ kind: 'distinctPositions', point: 'O', count: 3 }` | その点を**3か所以上**に動かす |

画面に出すことばは `progress` に書きます。**動かしたものごとに違うことばを返せる**のがポイントで、②.5a では「位置ベクトルは戻ってしまった／変位ベクトルはそのまま置けた」をここで書き分けています。

```js
progress: {
  dragged: {
    pos:  '<b>位置ベクトル</b>：動かせましたが、手を離すと元に戻ってしまいましたね。',
    disp: '<b>変位ベクトル</b>：動かした場所に、そのまま置いておけましたね。'
  },
  remaining: 'あと {n} 本、動かしてみましょう。',   // {n} は残り数に置き換わります
  done: '2本とも試せました。でも、起きたことは同じではありませんでしたね。'
}
```

### 5-5. 生徒に配置させる課題（`free-place`）

```js
conditions: [
  { kind: 'vectorsEqual', of: [['a1', 'a2'], ['b1', 'b2']], minLength: 1 },  // 2つの変位が等しい
  { kind: 'pointsApart',  of: ['a1', 'b1'], minDistance: 2 }                 // 2点が離れている
],
animation: 'parallelMove',                 // 成功したら平行に動くアニメを再生
animatePairs: [['a1', 'a2'], ['b1', 'b2']],
successText: '成功したときのことば',
hintText: 'まだのときに出しつづけることば'
```

使える条件は3種類です。

| `kind` | 判定すること | `of` に書くもの |
|---|---|---|
| `vectorsEqual` | 2つの変位が等しい | 点のペア2組 `[['a1','a2'],['b1','b2']]` |
| `pointsApart` | 2点が離れている（`minDistance`） | 点のキー2つ `['a1','b1']` |
| `vectorsConnected` | 2本目の**始点が1本目の終点に重なった**（③の「継ぎ足す」） | 矢印のid2つ `['l1','l2']` |

`vectorsEqual` と `pointsApart` の `of` は `scene.points` のキー名、`vectorsConnected` の `of` は `scene.vectors` の `id` です。条件を全部満たすと「次へ」が押せるようになります。

③の継ぎ足し課題はこの型で作っています。継がせたい矢印に `draggable: true, locked: false` を付けておくのを忘れないでください。

### 5-6. スライダーで観察させる課題（`slider-explore`）

```js
{
  id: 's5slider',
  type: 'slider-explore',
  prompt: '大きさ 4 と大きさ 3 を合成したとき、答えはいつでも 7 になりますか？',
  unit: 'm/s',
  sliderLabel: '2つの速度がなす角',
  compose: {
    origin: { x: 1, y: 2 },
    a: { mag: 4 }, aLabel: '4',
    b: { mag: 3 }, bLabel: '3',
    rLabel: '合成'
  },
  checkpoints: [0, 90, 180]     // この角度を全部通るまで次へ進めない
}
```

### 5-7. 自由記述（`free-text`）

```js
{ id: 'reflect1', type: 'free-text', prompt: '問い', rows: 3, placeholder: '例：…' }
```

生徒は「回答をコピー」「学習ログをコピー」でクリップボードにコピーし、Googleフォーム等に貼り付けて提出します。

### 5-8. どの問題でも使える演出

**移動の様子をアニメーションで見せる（`paths`）**

「この移動を表す矢印を描こう」の前に、実際に動く様子を見せられます。点が経路上を繰り返し動きます。どの `type` でも使えます。

```js
paths: [
  [{ x: 1, y: 1 }, { x: 3, y: 2 }],     // 物体A
  [{ x: 5, y: 5 }, { x: 6, y: 7 }]      // 物体B（複数同時に動かせます）
],
pathLine: false                          // 道すじの点線を出さず、動く点だけにする
```

途中で曲がるぐねぐねした道を見せたいときは、通過点を並べて書きます（②問3がその例）。1本だけなら `path:` と単数でも書けます。

**矢印を順に登場させる（`appearDelay`）**

はじめから全部そこにあると、生徒は「最初からこういう図だった」と受け取ります。③のように「あとから継ぎ足した」と見せたいときは、`scene.vectors` の各矢印に登場の遅れ（秒）を書きます。

```js
vectors: [
  { id: 'l1', from: 'A', to: 'B', style: 'displacement', label: '① 東へ4', appearDelay: 0.2 },
  { id: 'l2', from: 'B', to: 'C', style: 'displacement', label: '② 北へ3', appearDelay: 0.9 },
  { id: 'l3', from: 'C', to: 'D', style: 'displacement', label: '③ 西へ3', appearDelay: 1.6 }
]
```

**選択肢のあいだも図を残す**

`choice` の問題に `scene:` を書くと、選ばせているあいだも方眼と矢印が出たままになります。**書かないと図が消えます。** さっき見たものについて問うときは、必ず書いてください（`showCanvas: false` は、図がいらない問いのときだけ）。

### 5-9. ステップ全体の設定

各ステップの先頭に書けるもの。

```js
step1: {
  title: '位置を矢印で表す',
  minutes: 4,
  passLine: { correct: 1, of: 2 },        // 何問正解したら次へ進めるか
  scaleLabel: '1マス = 1 km',             // 画面上部に常時表示するスケール
  items: [ ... ]
}
```

`scaleLabel` は問題ごとに `item.scaleLabel` で上書きできます（④でkmからkm/hに切り替えているのがその例）。

### 5-10. スマホだけ座標を変えたいとき

問題の中に `phone:` を書くと、スマホ（8×8）のときだけその内容で上書きされます。省略すれば共通の座標が使われます。

```js
{
  id: 's2q1',
  type: 'draw-vector',
  answer: { from: { x: 6, y: 4 }, to: { x: 1, y: 6 } },
  phone: {
    answer: { from: { x: 5, y: 3 }, to: { x: 1, y: 5 } },
    landmarks: [ /* 詰めた配置 */ ]
  }
}
```

### 5-11. 直したあとの確認

`data/problems.js` はカンマや括弧を1つ落とすと**画面が真っ白**になります。そうなったらブラウザの開発者ツール（F12）のコンソールに赤いエラーが出ているので、そこに書かれた行番号を見てください。

保存前に構文だけ確かめるなら、ターミナルで次を実行します（エラーがなければ何も出ません）。

```bash
node --check data/problems.js
```

---

## 6. 設定を変えたいとき（`data/config.js`）

コードの中に数値を散らしていません。変えたいものはここにあります。

| 定数 | 中身 |
|---|---|
| `COLORS` | 各ベクトルの色 |
| `VECTOR_STYLES` | 線の太さ・破線パターン・矢じりの大きさ・🔒 の有無 |
| `JUDGE` | 判定の許容（向き ±10°、大きさ ±0.5マス、始点 ±0.5マス） |
| `HINTS` | ヒントの出現秒数（30秒 / 60秒）、答え表示ボタンの有無 |
| `FLOW` | 何回まちがえたら通すか（既定3回）、標準の合格ライン |
| `SNAP` | 方眼スナップの有無（既定ON） |
| `layoutProfiles` | スマホ／タブレットの方眼サイズ・スナップ半径・指のオフセット・最小ヒット領域 |
| `LAYOUT` | phone と判定するビューポート幅（既定 600px 未満） |

## 7. 端末別レイアウトについて

アプリは1つで、レイアウトと操作パラメータだけを2プロファイルで切り替えています。

- **タブレット・PC**：横並び2カラム（左に方眼、右に問題文・数値・ボタン）。方眼10×10。マウスホバーで格子点がハイライトされます。
- **スマホ**：縦1カラム。方眼8×8で画面幅いっぱい。操作ボタンは画面下部に固定。ドラッグ中は矢印の先端を指より上にずらし、実際の位置に十字カーソルを出し、上部にルーペ（2倍）を表示します。数値表示は必ずキャンバスの外なので、指で隠れません。
- **スマホの横持ち**：タブレットのレイアウトに切り替わり、高さを稼ぐため進捗バーを隠します。

画面右上の **⚙** から、**自動 / スマホ / タブレット・PC** を手動で切り替えられます（実機の判定が外れたときや、教員が挙動を確認したいときに使ってください）。選択は端末に保存されます。同じメニューから**進捗のリセット**もできます。

## 8. 生徒がつまずいたときに教員が知っておくこと

- 矢印は**ドラッグして描きます**（始点でタップ→引っぱる→離す）。タップだけでは描けません。
- 描いた矢印は「やり直し」で消せます。
- 30秒さわらないとヒント、60秒で補助線が自動的に出ます。「答えを見る」はいつでも押せます。
- 🔒 のついた矢印は動かしても元に戻ります。**故障ではありません。** ②.5a でそれを体験させるのがねらいです。
- 進捗は端末ごとに保存されます。別の端末で続きからは開けません。
