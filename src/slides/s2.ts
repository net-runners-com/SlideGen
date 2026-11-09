import { C, F } from '../theme'
import type { Node, Slide } from '../types'

/** 緊急度カード1枚分を組み立てる。3枚とも構造は同じで高さだけ違う。 */
function rankCard(
  key: string,
  x: number, y: number, w: number, h: number,
  rank: string, caption: string, value: number,
): Node[] {
  const cx = x + w / 2
  const pad = 46
  return [
    { kind: 'card', x, y, w, h, variant: 'double' },
    { kind: 'text', id: `${key}.k`, label: `${rank} 見出し`, x: cx, y: y + 48, origin: 'center',
      text: '緊急度', font: F.sans, size: 33, weight: 500, fill: C.ink },
    { kind: 'text', id: `${key}.rank`, label: `${rank} 記号`, x: cx, y: y + h * 0.40, origin: 'center', originY: 'center',
      text: rank, font: F.serifLatin, size: Math.round(h * 0.52), weight: 500, fill: C.goldDeep },
    { kind: 'rule', x: x + pad, y: y + h - 196, w: w - pad * 2, stroke: 'rgba(60,48,30,0.45)' },
    { kind: 'text', id: `${key}.cap`, label: `${rank} 区分名`, x: cx, y: y + h - 186, origin: 'center',
      text: caption, font: F.sans, size: 31, weight: 500, fill: C.ink },
    { kind: 'text', id: `${key}.lo`, x: x + pad, y: y + h - 136,
      text: '0', font: F.sans, size: 28, weight: 400, fill: C.ink },
    { kind: 'text', id: `${key}.hi`, x: x + w - pad, y: y + h - 136, origin: 'right',
      text: '100', font: F.sans, size: 28, weight: 400, fill: C.ink },
    { kind: 'gauge', id: `${key}.gauge`, x: x + pad, y: y + h - 84, w: w - pad * 2, value },
  ]
}

/** 2枚目：スコアと緊急度の読み方 */
export const s2: Slide = {
  id: 's2',
  name: '02 読み方',
  nodes: [
    { kind: 'frame', variant: 'none' },
    { kind: 'text', id: 's2.title', label: 'タイトル', x: 58, y: 38,
      text: '点数と緊急度の読み方', font: F.serif, size: 92, weight: 700, fill: C.gold },
    { kind: 'rule', x: 58, y: 181, w: 1911, stroke: C.goldLine, thickness: 2.5 },

    ...rankCard('s2.c', 87, 362, 475, 473, 'C', '早期確認', 10),
    ...rankCard('s2.b', 591, 299, 582, 536, 'B', '優先確認', 45),
    ...rankCard('s2.a', 1189, 205, 752, 630, 'A', '最優先', 86),

    { kind: 'card', x: 92, y: 890, w: 1860, h: 146, variant: 'plain' },
    { kind: 'text', id: 's2.note', label: '補足', x: 1022, y: 912, origin: 'center', w: 1780,
      text: '0に近いほど危険が低く、100に近いほど危険が高いスコアです。\n緊急度Aは最優先、Bは優先確認、Cは早期確認です。',
      font: F.sans, size: 44, weight: 500, lh: 1.5, fill: C.ink, align: 'center' },

    { kind: 'pagenum', id: 's2.page', text: '02', total: '/ 08', variant: 'plain', size: 76 },
  ],
}
