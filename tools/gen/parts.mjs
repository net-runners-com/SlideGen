// 飾りのパーツ集を 1 枚の見本表として作らせる。
//
//   node tools/gen/parts.mjs out/ "#C9452F" "左上のブラケット" "目盛の帯" …
//
// 文字を入れさせないのが肝。文字が入ると字が壊れるので、パーツは図形だけにする。
// 出てきた画像は tools/assets/parts.py でマスごとに切り、public/parts へ置く。
import { mkdirSync } from 'node:fs'
import { generate } from './opengpt.mjs'

const [outDir = 'out', color = '#C9452F', ...items] = process.argv.slice(2)
const list = items.length ? items : [
  '太い直角のブラケット（左上の角）', '目盛が等間隔に刻まれた横長の帯',
  '下向きの三角マーカー', '階段状に高さが増える4本の棒',
  '同心円が3重のターゲット', '45度の斜線を等間隔に並べたハッチ模様の正方形',
  '直角に曲がる太い矢印', '正方形の点を格子状に並べたドットグリッド',
  '右下の直角ブラケット', '太さの違う3本の横線を重ねた区切り',
  '塗りつぶした正方形と線だけの正方形を半分ずつ重ねた図形', '中が空洞の太い円環',
]
const cols = 4
const rows = Math.ceil(list.length / cols)

const prompt = `図形パーツ集を1枚の画像で作ってください。切り抜いてスライドの素材にします。

【形式】厳密に守ってください
- 白背景。図形は ${color} の単色のみ。影・グラデーション・立体感なし
- ${cols}列 × ${rows}行 の格子。細い灰色の罫線でマス目を描く
- 1マスに1パーツだけ。マスの中央に、マスの70%の大きさで
- 文字・数字・ラベル・説明を一切入れない

【各マスのパーツ】左上から右へ、1行ずつ
${list.map((t, i) => `${i + 1}. ${t}`).join('\n')}

【様式】幾何学的、線は太め、装飾的な曲線は使わない。`

mkdirSync(outDir, { recursive: true })
const made = await generate({ prompt, outDir, session: 'parts', account: process.env.ACCOUNT ?? 'me' })
console.log(made.length ? `${outDir}/${made[0]}` : '画像が返らなかった（上限か生成失敗）')
console.log(`次: python3 tools/assets/parts.py <画像> ${cols} ${rows} public/parts "<名前をカンマ区切り>" "${color}"`)
