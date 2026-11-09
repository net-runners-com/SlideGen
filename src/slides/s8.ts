import { C, F } from '../theme'
import type { Slide } from '../types'

/** 8枚目：評価の前提 */
export const s8: Slide = {
  id: 's8',
  name: '08 評価の前提',
  nodes: [
    { kind: 'frame', variant: 'none' },
    { kind: 'text', id: 's8.title', label: 'タイトル', x: 100, y: 52,
      text: '評価の前提', font: F.serif, size: 140, weight: 700, fill: C.gold },

    { kind: 'card', x: 105, y: 262, w: 1844, h: 714, variant: 'double' },
    { kind: 'text', id: 's8.body', label: '本文', x: 213, y: 448, w: 1700,
      text: '本レポートは、外部から実施した簡易診断と公開情報を\n基にした一次判定です。実際にサイトへ入る検査、管理\n画面内の確認、負荷をかける検査は含みません。確認済\nみと候補を区別し、断定できない内容は断定していません。',
      font: F.sans, size: 61, weight: 500, lh: 1.67, fill: C.ink },

    { kind: 'pagenum', id: 's8.page', text: '08', total: '/ 08', variant: 'boxed', size: 118 },
  ],
}
