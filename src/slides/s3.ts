import { R } from '../reports'
import { C, F } from '../theme'
import type { Node, Slide } from '../types'

/** 番号付きカード1枚 */
function numCard(
  key: string, n: string, x: number, y: number, w: number, h: number,
  title: string, body: string, accent: string,
): Node[] {
  return [
    { kind: 'card', x, y, w, h, variant: 'notched' },
    // 元画像の実測: 番号の字面は 76px 幅 / 126px 高、本文は 1 字 32px・行ピッチ 55px
    { kind: 'text', id: `${key}.n`, label: `${n} 番号`, x: x + 34, y: y + 30,
      text: n, font: F.serifLatin, size: 158, weight: 400, fill: 'rgba(168,134,86,0.95)' },
    { kind: 'vrule', x: x + 126, y: y + 48, h: 128, stroke: 'rgba(120,95,60,0.6)', thickness: 2 },
    { kind: 'text', id: `${key}.t`, label: `${n} 見出し`, x: x + 160, y: y + 50, w: w - 172,
      text: title, font: F.serif, size: 43, weight: 700, lh: 1.4, fill: accent },
    { kind: 'rule', x: x + 30, y: y + 225, w: w - 60, stroke: 'rgba(150,118,74,0.55)', diamond: true },
    { kind: 'text', id: `${key}.b`, label: `${n} 本文`, x: x + 12, y: y + 276, w: w - 16,
      text: body, font: F.sans, size: 31, weight: 400, lh: 1.78, fill: C.ink },
  ]
}

/** 3枚目：今回のまとめ */
export const s3: Slide = {
  id: 's3',
  name: '03 まとめ',
  nodes: [
    { kind: 'frame', variant: 'none' },

    // タイトルを囲む二重罫
    { kind: 'box', x: 57, y: 44, w: 610, h: 196, stroke: 'rgba(194,162,121,0.45)', thickness: 2 },
    { kind: 'rule', x: 48, y: 56, w: 640, stroke: C.goldLine, thickness: 2, diamond: true },
    { kind: 'rule', x: 48, y: 228, w: 640, stroke: C.goldLine, thickness: 2, diamond: true },
    { kind: 'text', id: 's3.title', label: 'タイトル', x: 86, y: 92,
      text: '今回のまとめ', font: F.serif, size: 84, weight: 700, fill: C.cream },

    ...numCard('s3.a', '1', 76, 276, 607, 724,
      '今回の簡易診断で、\nまだ断定できないこと',
      `${R.candidates.total}件は危険候補であり、実際に\n使われ、外部から悪用できる状態かは\n未確定です。しかし1件でも該当\nすれば被害につながり得ます。\n確認結果次第で、緊急度は${R.rank.now}から\n最優先${R.rank.worst}へ上がります。`,
      C.crimsonSoft),

    ...numCard('s3.b', '2', 724, 276, 607, 724,
      'このレポートの結論',
      '簡易診断で確定していない項目は、\n安全だったという意味ではありません。\n確認できた事実と、確認結果によって\n最悪Aへ上がる条件を分けて\n示しています。次に必要なのは、\n未確認項目を正式確認し、対応の\n優先順位を決めることです。',
      '#7C5A32'),

    ...numCard('s3.c', '3', 1370, 276, 607, 724,
      '詳細な直し方を\n載せていない理由',
      'この資料は、公開情報から見えた危険と\n経営上の判断を伝える一次レポートです。\n具体的な設定値、侵入に使える情報、\n修正手順は載せていません。\n正式確認の結果を基に、必要な範囲\nだけを関係者へ共有します。',
      '#5E4226'),

    { kind: 'pagenum', id: 's3.page', text: '03', total: '/ 08', variant: 'notch', size: 108 },
  ],
}
