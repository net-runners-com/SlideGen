# SlideGen

版面はコードで組み、飾りは画像生成に作らせるスライド制作ツール。

16:9（2048×1152）のスライドを宣言的なノード列で書き、Fabric.js で描く。
画面上で文字と色を直接編集でき、PNG / SVG / PDF で書き出す。

## なぜ分けるか

画像生成に版面ごと作らせると**文字が壊れる**。実測した結果はこう。

| 作らせたもの | 結果 |
|---|---|
| 文字の載った版面 8 枚 | **4 枚が壊れた**。`HIGH候補41件`→`4件`、`重大候補`→`重大債権`、`根拠`→`桿槻` |
| 飾りのパーツ 12 点 | 問題なし。文字が入らないので壊れようがない |
| 文字見本表 40 字（1 マス 1 文字） | **40 字すべて正確**。文章にしなければ壊れない |
| グラフ（数値を指定） | 円の扇 42°指定に対し実測 42.2°、棒は 19.3 / 15.4 / 50.0（指定 20 / 15 / 50） |

切り分けは**文字と数字が入るかどうか**。入るものはコードで描く。

| | 作るもの | どこ |
|---|---|---|
| 画像生成 | 飾りのパーツ、文字の原図 | `tools/gen/` で生成、`tools/assets/` で取り込み |
| コード | 配置、図、グラフ | `src/slides/` `src/render/` |

## 使い方

```bash
npm install
npm run dev          # http://localhost:5173
```

- 左：ページ切り替え（URL の `#1`〜 でも指定できる）
- 中央：キャンバス。**文字をダブルクリックするとその場で書き換えられる**
- 右：そのページの編集可能テキストと、要素ごとの色
- 上：書体の差し替え、配色のつまみ 6 つ、書き出し

`?layout=1` を付けると白地に文字だけの下書きを出す。画像生成へ渡す版下用。

## パーツを作る

```bash
# 1. 画像生成に見本表を作らせる（opengpt 経由）
node tools/gen/parts.mjs out/ "#C9452F"

# 2. マスごとに切り、白地を抜いて public/parts へ
python3 tools/assets/parts.py out/<画像>.png 4 3 public/parts \
  "bracket-tl,scale,marker,bars,target,hatch,arrow-turn,dotgrid,bracket-br,rules,squares,ring" "#C9452F"
```

版面からは名前で引く。

```ts
{ kind: 'image', src: 'hatch', x: 1668, y: 76, w: 260, opacity: 0.10 }
```

パーツは**色を引数で差し替えられる**。インクの濃さを不透明度にして色だけ乗せているので、
`parts.py` の最後の引数を変えれば別配色のセットが作れる。

## 文字の原図を作る

```bash
node tools/gen/glyphs.mjs out/ "0123456789ABCDEFGHIJ" 10
python3 tools/assets/sheet.py out/<画像>.png "0123456789ABCDEFGHIJ" 10 2 out/glyphs
```

格子が明示されているので、文章から字を抜くときのような位相の推定が要らない。
**マスの位置が文字を決める**ので、取り違えも起きない。

## 構成

```
src/
  types.ts            スライド記述の型（text / card / rule / flow / pie / bar / image …）
  theme.ts            配色・書体トークン
  palette.ts          配色の差し替え。群ごとの HSL 差分で濃淡・罫まで追従させる
  useTheme.ts         書体・配色・要素ごとの色の上書き
  parts.ts            public/parts の図形パーツを先読みする
  report.ts           案件データの型と導出（スコアの合計など）
  reports/            案件ごとの中身。_template.ts をコピーして使う
  slides/             1 ページ = 1 ファイル。s1..s8 が本編、charts/alt が見本
  render/
    buildSlide.ts     スライド定義 → Fabric オブジェクト
    common.ts         DECOR（選択も編集もさせない飾りの印）
    decor.ts          背景・枠・紙カード・ゲージ・矢印・ページ番号
    charts.ts         円／棒／折れ線。値から角度と高さを出す
    flow.ts           構成図。箱は格子、矢印は箱の縁どうしを自動で結ぶ
    image.ts          図形パーツの貼り付け
    emblems.ts        盾／月桂樹／天秤／棒グラフ／雪花の紋章（コードで描く版）
  export.ts           PNG / SVG / PDF 書き出し
tools/
  gen/                画像生成に見本表を作らせる（opengpt CLI を叩く）
  assets/             出てきた見本表を切って素材にする
  capture.mjs         CDP でヘッドレス Chrome から原寸 PNG を吸い出す
public/parts/         図形パーツ。image ノードから名前で引く
```

## レイアウトテンプレート

座標を 1 つずつ書かずに、型とデータでページを組む。`src/layout.ts`。

```ts
import { bullets, cards, diagram, statement } from '../layout'

bullets(
  { id: 'p3', name: '03 正式確認', page: '03', total: '/ 08' },
  {
    title: '正式確認で決めること',
    sub: '見出し＋箇条書き',
    items: ['実際に使われているものは何か', 'どの順番で止めるか'],
  },
)
```

| | 中身 |
|---|---|
| `statement` | 大きな一文だけ。中扉や締め |
| `bullets` | 見出し＋箇条書き。上から字の分だけ送る |
| `cards` | 紙カード 1〜4 枚。枚数で段組が決まる |
| `split` | 左右 2 段。比率は段数で指定 |
| `diagram` | 構成図 1 枚＋下の注記 |

下敷きは `GRID`（左右余白 96、12 段、段間 24、見出し帯 196、下余白 104）と
`BODY`（本文領域）。`col(n, span)` で段の x と幅、`band(i, n)` で縦の帯が出る。
テンプレートに無い組みは、この 2 つを使って書く。

`src/slides/templates.ts` が 4 種の見本。画面の `#11`〜`#14`。

## 案件ごとの差し替え

版面（座標・級数・飾り）と、案件ごとに変わる値を分けてある。
`src/reports/_template.ts` をコピーし、`src/reports/index.ts` の import を差し替える。

**スコアは findings から合計する。** 表紙と表に同じ数字が出るので、
直書きすると片方だけ直して食い違う。

## 本編と見本ページ

`slides/index.ts` は 3 つ出す。

- `DECK` … 本編。**PDF に入るのはこれだけ**
- `EXTRAS` … 見本。画面では見られるが書き出さない（`extra: true` を付ける）
- `SLIDES` … 両方

## 構成図の作り方

箱は格子の列・行で置き、矢印は箱の縁どうしを自動で結ぶ。

```ts
boxes: [
  { id: 'user', text: 'エンドユーザ /\nブラウザ', col: 0, row: 0 },
  { id: 'cms',  text: 'WordPress コア', col: 3, row: 1, h: 140 },
],
edges: [
  { from: 'user', to: 'dns', label: '名前解決' },
  { from: 'cms', to: 'plugins', dashed: true, plain: true },
]
```

重なりは**自動では避けない**。`col` / `row` は小数を受けるので手で逃がす。
重なったときは console に出る。

## 既知の弱点

- 別案の意匠（`slides/alt.ts`）は表紙 1 枚だけ。他は未着手
- 紙カードの影が固定色。背景を明るくすると浮く
- 配色はセッション限り。保存・読み込みは未実装
- `tools/gen/` は opengpt CLI に依存する。無料プランだと画像生成に回数制限がある
