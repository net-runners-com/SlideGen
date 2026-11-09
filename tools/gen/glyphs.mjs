// 文字の原図を 1 マス 1 文字の見本表として作らせる。
//
//   node tools/gen/glyphs.mjs out/ "0123456789ABCDEFGHIJ" 10
//
// 文章として組ませると字が壊れるが、見本表なら壊れない（実測で 40 字すべて正確）。
// 出てきた画像は tools/assets/sheet.py で 1 字ずつ切り出す。
import { mkdirSync } from 'node:fs'
import { generate } from './opengpt.mjs'

const [outDir = 'out', chars = '0123456789', colsArg = '10', style = '日本語の明朝体。太め。横線が細く縦線が太い伝統的な明朝'] =
  process.argv.slice(2)
const cols = Number(colsArg)
const rows = Math.ceil([...chars].length / cols)
const grid = []
for (let i = 0; i < rows; i++) grid.push([...chars].slice(i * cols, (i + 1) * cols).join(' '))

const prompt = `文字見本の表を1枚の画像で作ってください。フォント制作の原図に使います。

【形式】厳密に守ってください
- 白背景、黒の文字のみ。影・グラデーション・装飾なし
- ${cols}列 × ${rows}行 の格子。細い灰色の罫線でマス目を描く
- 1マスに1文字だけ。マスの中央に配置
- すべての文字を同じ字の大きさで。マスの高さの約70%
- 文字以外は何も入れない（番号・ラベル・見出し・説明文を入れない）

【字体】${style}

【入れる文字】左上から右へ、1行ずつ
${grid.map((l, i) => `${i + 1}行目: ${l}`).join('\n')}`

mkdirSync(outDir, { recursive: true })
const made = await generate({ prompt, outDir, session: 'glyphs', account: process.env.ACCOUNT ?? 'me' })
console.log(made.length ? `${outDir}/${made[0]}` : '画像が返らなかった（上限か生成失敗）')
console.log(`次: python3 tools/assets/sheet.py <画像> "${chars}" ${cols} ${rows} out/glyphs`)
