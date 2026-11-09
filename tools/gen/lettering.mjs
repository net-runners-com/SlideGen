// 装飾した文字を 1 マス 1 文字の見本表として作らせる。
//
//   node tools/gen/lettering.mjs out/ "未確認" 6 "金の箔押し。縁に細い金の輪郭"
//
// 文章として組ませると字が壊れるが、見本表なら壊れない。装飾を効かせたい
// 見出しは、1 字ずつ作らせて版面側で並べる。
//
// 出てきた画像は parts.py の keep モードで切る（色を落とさないため）。
import { mkdirSync } from 'node:fs'
import { generate } from './opengpt.mjs'

const [outDir = 'out', text = '未確認', colsArg = '6',
  decor = '濃い金（#C2A279）の箔押し。縁に一回り細い金の輪郭。面はなめらかに'] = process.argv.slice(2)

const chars = [...text]
const cols = Math.min(Number(colsArg), chars.length)
const rows = Math.ceil(chars.length / cols)
const grid = []
for (let i = 0; i < rows; i++) grid.push(chars.slice(i * cols, (i + 1) * cols).join(' '))

const prompt = `装飾した文字の見本表を1枚の画像で作ってください。切り抜いて見出しに使います。

【形式】厳密に守ってください
- 白背景。${cols}列 × ${rows}行 の格子。細い灰色の罫線でマス目を描く
- 1マスに1文字だけ。マスの中央に、マスの高さの約75%で
- すべての文字を同じ大きさ・同じ装飾で
- 文字以外は何も入れない（番号・ラベル・説明文・影の床を入れない）
- 影は文字の輪郭の中だけ。マスの外へはみ出さない

【字体】日本語の明朝体。太め。横線が細く縦線が太い伝統的な明朝

【装飾】${decor}

【入れる文字】左上から右へ、1行ずつ
${grid.map((l, i) => `${i + 1}行目: ${l}`).join('\n')}`

const names = chars.map((c) => `g-${c.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`)

mkdirSync(outDir, { recursive: true })
const made = await generate({ prompt, outDir, session: 'lettering', account: process.env.ACCOUNT ?? 'me', size: '1024x1024' })
console.log(made.length ? `${outDir}/${made[0]}` : '画像が返らなかった（上限か生成失敗）')
console.log(`次: python3 tools/assets/parts.py <画像> ${cols} ${rows} public/parts "${names.join(',')}" keep`)
console.log(`版面では lettering('${text}', …) で並べる`)
