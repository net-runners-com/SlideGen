import { headline, lead, scoreNow, scoreWorst } from '../../report'
import { R } from '../../reports'
import { C, F } from '../../theme'
import type { Node, Slide } from '../../types'

/** 別案の表紙：紋章・飾り罫をやめ、面と級差だけで組む。
 *
 *  いまの版は欧州の紋章様式（盾・月桂樹・二重の金罫）で格式を出している。
 *  こちらは逆に装飾を全部外し、**色面の対比と文字の大きさ**だけで強弱を付ける。
 *  スコアは大きな欧文1文字ではなく、0-100 の帯の上の位置で見せる。 */

const BG = '#0B0B0D'
const PANEL = '#15151A'
const LINE = '#2A2A33'
const FG = '#F2F0EA'
const DIM = '#8C8C99'
const NOW = '#C9452F'
const WORST = '#D9A441'

/** 0-100 の帯。現時点と最悪想定を同じ軸に乗せて差を見せる。 */
function track(x: number, y: number, w: number, now: number, worst: number): Node[] {
  const h = 18
  const at = (v: number) => x + (w * Math.max(0, Math.min(100, v))) / 100
  return [
    { kind: 'box', x, y, w, h, fill: '#23232B' },
    { kind: 'box', x, y, w: at(worst) - x, h, fill: '#3A2F22' },
    { kind: 'box', x, y, w: at(now) - x, h, fill: NOW },
    // 目盛は両端と中央だけ。細かい刻みは経営判断に要らない。
    ...[0, 50, 100].map((v): Node => ({
      kind: 'text', id: `alt.tick${v}`, x: at(v), y: y + h + 14, origin: 'center',
      text: String(v), font: F.mono, size: 20, fill: DIM,
    })),
    { kind: 'vrule', x: at(worst), y: y - 16, h: h + 32, stroke: WORST, thickness: 3 },
    { kind: 'vrule', x: at(now), y: y - 16, h: h + 32, stroke: FG, thickness: 3 },
    // 現時点の位置に下向きの三角。帯のどこを見ればよいかを示す。
    { kind: 'image', src: 'marker', x: at(now), y: y - 26, w: 30, origin: 'center', originY: 'bottom' },
  ]
}

/** 見出し＋値の一組。罫で仕切らず、余白と級差で分ける。 */
function stat(key: string, x: number, y: number, label: string, value: string,
  color: string, size = 150): Node[] {
  return [
    { kind: 'text', id: `${key}.l`, label, x, y,
      text: label, font: F.sans, size: 24, weight: 500, ls: 80, fill: DIM },
    { kind: 'text', id: `${key}.v`, label: `${label} 値`, x, y: y + 38,
      text: value, font: F.sans, size, weight: 700, ls: -20, fill: color },
  ]
}

export const alt: Slide = {
  id: 'alt',
  extra: true,
  name: '別案 表紙',
  nodes: [
    { kind: 'box', x: 0, y: 0, w: 2048, h: 1152, fill: BG },
    // 左端の帯。飾りではなく、判定の色をページの端に出して一目で分かるようにする。
    { kind: 'box', x: 0, y: 0, w: 24, h: 1152, fill: NOW },

    // ── 生成したパーツ（public/parts） ──────────────────
    // 斜線ハッチを右上の地に薄く敷く。面を割って余白の間延びを止める。
    { kind: 'image', src: 'hatch', x: 1668, y: 76, w: 260, opacity: 0.10 },
    // 角のブラケットで版面の内側を示す
    { kind: 'image', src: 'bracket-tl', x: 120, y: 60, w: 58, opacity: 0.85 },
    { kind: 'image', src: 'bracket-br', x: 1928, y: 1132, w: 48, origin: 'right', originY: 'bottom', opacity: 0.85 },

    { kind: 'text', id: 'alt.eyebrow', label: 'アイブロウ', x: 120, y: 96,
      text: 'CUSTOMER SECURITY REVIEW', font: F.mono, size: 24, weight: 500, ls: 300, fill: DIM },
    { kind: 'text', id: 'alt.sub', label: 'サブタイトル', x: 120, y: 142,
      text: '顧客向け セキュリティー診断レポート｜経営判断版', font: F.sans, size: 30, weight: 500, fill: DIM },

    { kind: 'text', id: 'alt.headline', label: '大見出し', x: 120, y: 226, w: 1500,
      text: headline(R), font: F.sans, size: 96, weight: 700, lh: 1.32, fill: FG },

    { kind: 'rule', x: 120, y: 520, w: 1808, stroke: LINE, thickness: 2 },

    { kind: 'text', id: 'alt.lead', label: 'リード文', x: 120, y: 556, w: 1180,
      text: lead(R), font: F.sans, size: 30, weight: 300, lh: 1.5, fill: DIM },

    // ── 数値 ──────────────────────────────────────────
    { kind: 'box', x: 1360, y: 540, w: 568, h: 300, fill: PANEL },
    { kind: 'image', src: 'ring', x: 1884, y: 572, w: 44, origin: 'right', opacity: 0.55 },
    ...stat('alt.now', 1404, 572, '確認済み', `${R.rank.now} ${scoreNow(R)}`, NOW, 120),
    { kind: 'rule', x: 1404, y: 726, w: 480, stroke: LINE },
    ...stat('alt.worst', 1404, 746, '未確認が事実なら', `${R.rank.worst} ${scoreWorst(R)}`, WORST, 60),

    // ── 帯 ────────────────────────────────────────────
    { kind: 'text', id: 'alt.trackLabel', label: '帯の見出し', x: 120, y: 790,
      text: '危険度スコア', font: F.sans, size: 24, weight: 500, ls: 80, fill: DIM },
    ...track(120, 836, 1180, scoreNow(R), scoreWorst(R)),

    // ── 宛先 ──────────────────────────────────────────
    { kind: 'rule', x: 120, y: 980, w: 1808, stroke: LINE, thickness: 2 },
    { kind: 'text', id: 'alt.m1', label: '対象', x: 120, y: 1012,
      text: R.client.name, font: F.sans, size: 26, weight: 500, fill: FG },
    { kind: 'text', id: 'alt.m2', label: 'ドメイン', x: 120, y: 1058,
      text: R.client.domain, font: F.mono, size: 24, fill: DIM },
    { kind: 'text', id: 'alt.m3', label: '実施日', x: 1928, y: 1012, origin: 'right',
      text: R.client.date, font: F.mono, size: 24, fill: DIM },
    { kind: 'text', id: 'alt.page', x: 1928, y: 1052, origin: 'right',
      text: '01 / 08', font: F.mono, size: 24, weight: 500, fill: DIM },
  ],
}
