import { scoreNow, scoreWorst } from '../report'
import { R } from '../reports'
import { C, F } from '../theme'
import type { Node, Slide } from '../types'

const INK = '#1E1810'
const COLS = [63, 555, 840, 1117, 1394, 1987]

/** 表の縦位置。見出し帯のあと、所見の数＋合計行を等分する。
 *  元画像は所見3件で 487/585/682 だったので、等分（492/588/684）とは 5px ほどずれる。
 *  件数が変わっても崩れないことを優先した。 */
const TABLE_TOP = 333
const HEAD_BOT = 397
const TABLE_BOT = 780
const N_ROWS = R.findings.length + 1
const ROW_Y = [
  TABLE_TOP,
  ...Array.from({ length: N_ROWS + 1 }, (_, i) => HEAD_BOT + ((TABLE_BOT - HEAD_BOT) * i) / N_ROWS),
]

/** 表の1行。num 列はセリフ数字で大きく出す。 */
function row(key: string, i: number, cells: [string, string, string, string, string]): Node[] {
  const top = ROW_Y[i + 1]
  const bot = ROW_Y[i + 2]
  const mid = (top + bot) / 2
  const c = (n: number) => (COLS[n] + COLS[n + 1]) / 2
  return [
    { kind: 'text', id: `${key}.a`, label: `行${i + 1} 状態`, x: c(0), y: mid, origin: 'center', originY: 'center',
      text: cells[0], font: F.sans, size: 30, weight: 400, fill: INK },
    { kind: 'text', id: `${key}.b`, label: `行${i + 1} 確認状況`, x: c(1), y: mid, origin: 'center', originY: 'center',
      text: cells[1], font: F.sans, size: 30, weight: 400, fill: INK },
    { kind: 'text', id: `${key}.c`, label: `行${i + 1} 現時点`, x: c(2), y: mid, origin: 'center', originY: 'center',
      text: cells[2], font: F.serifLatin, size: 54, weight: 500, fill: '#6B4E22' },
    { kind: 'text', id: `${key}.d`, label: `行${i + 1} 事実なら`, x: c(3), y: mid, origin: 'center', originY: 'center',
      text: cells[3], font: F.serifLatin, size: 54, weight: 500, fill: '#6B4E22' },
    { kind: 'text', id: `${key}.e`, label: `行${i + 1} 理由`, x: COLS[4] + 32, y: mid, originY: 'center', w: 560,
      text: cells[4], font: F.sans, size: 28, weight: 400, lh: 1.4, fill: INK },
    // 合計行の下には引かない（表の外枠と重なる）
    ...(i < N_ROWS - 1 ? [{ kind: 'rule', x: COLS[0] + 16, y: bot, w: COLS[5] - COLS[0] - 32, stroke: 'rgba(120,95,60,0.45)' } as Node] : []),
  ]
}

/** 下段の注記ブロック（紋章＋見出し＋本文） */
function noteBlock(key: string, y: number, emblem: 'shieldC' | 'chart', title: string, body: string): Node[] {
  return [
    { kind: 'emblem', shape: emblem, x: 120, y: y + 46, size: 104, fill: C.gold, opacity: 0.95 },
    { kind: 'text', id: `${key}.t`, label: `${title.slice(0, 6)} 見出し`, x: 270, y, 
      text: title, font: F.sans, size: 34, weight: 700, fill: C.gold },
    { kind: 'text', id: `${key}.b`, label: `${title.slice(0, 6)} 本文`, x: 270, y: 50 + y, w: 1600,
      text: body, font: F.sans, size: 28, weight: 300, lh: 1.5, fill: C.paperWhite },
  ]
}

/** 5枚目：危険度スコアの根拠 */
export const s5: Slide = {
  id: 's5',
  name: '05 スコアの根拠',
  nodes: [
    { kind: 'frame', variant: 'none' },
    { kind: 'emblem', shape: 'scales', x: 98, y: 86, size: 150, fill: C.gold, opacity: 0.95 },
    { kind: 'text', id: 's5.title', label: 'タイトル', x: 210, y: 30,
      text: '危険度スコアの根拠', font: F.serif, size: 82, weight: 700, fill: C.cream },
    { kind: 'rule', x: 22, y: 152, w: 1966, stroke: C.goldLine, thickness: 2 },

    { kind: 'card', x: 57, y: 187, w: 1937, h: 118, variant: 'notched' },
    { kind: 'text', id: 's5.note', label: 'リード文', x: 1025, y: 206, origin: 'center', w: 1800,
      text: '確認済みの事実だけを現時点のスコアに入れ、簡易診断で断定できない項目は0点にしています。\n未確認項目が事実だった場合だけ、最悪想定へ加算します。',
      font: F.sans, size: 31, weight: 400, lh: 1.5, fill: INK, align: 'center' },

    // ── 表 ──────────────────────────────────────────────
    { kind: 'card', x: COLS[0], y: ROW_Y[0], w: COLS[5] - COLS[0], h: TABLE_BOT - TABLE_TOP, variant: 'notched' },
    { kind: 'box', x: COLS[0], y: ROW_Y[0], w: COLS[5] - COLS[0], h: ROW_Y[1] - ROW_Y[0], fill: '#15110B' },
    ...(['今回見えた状態', '確認状況', '現時点', '事実なら', 'なぜ急ぐか'].map((t, i) => ({
      kind: 'text' as const, id: `s5.h${i}`, label: `列見出し${i + 1}`,
      x: (COLS[i] + COLS[i + 1]) / 2, y: (ROW_Y[0] + ROW_Y[1]) / 2, origin: 'center' as const, originY: 'center' as const,
      text: t, font: F.serif, size: 32, weight: 700, fill: C.gold,
    }))),
    ...[1, 2, 3, 4].map((i) => ({
      kind: 'vrule' as const, x: COLS[i], y: TABLE_TOP + 10, h: TABLE_BOT - TABLE_TOP - 20, stroke: 'rgba(120,95,60,0.5)', thickness: 2,
    })),

    ...R.findings.flatMap((f, i) => row(`s5.r${i + 1}`, i,
      [f.state, f.status, String(f.now), String(f.worst), f.why])),
    ...row(`s5.r${R.findings.length + 1}`, R.findings.length,
      ['合計', '', String(scoreNow(R)), String(scoreWorst(R)), '表紙のスコアと一致']),

    ...noteBlock('s5.n1', 812, 'shieldC', 'C判定の読み違いを防ぐために',
      'Cは安全判定ではありません。確認済みの事実だけで計算した暫定区分です。\n表の要確認が事実なら、同じレポート内で最悪Aへ変わります。'),
    { kind: 'rule', x: 63, y: 962, w: 1924, stroke: C.goldLineFaint },
    ...noteBlock('s5.n2', 984, 'chart', 'ランクが変わる条件',
      '確認済みの状態がすでに解消されていれば、再確認後にスコアは下がります。\n要確認の候補が現在も使われ、外部から悪用できる状態なら、最悪想定のスコアを採用します。'),

    { kind: 'pagenum', id: 's5.page', text: '05', total: '/ 08', variant: 'notch', size: 96 },
  ],
}
