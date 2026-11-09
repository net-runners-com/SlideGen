import { C, F } from '../theme'
import type { Node, Slide } from '../types'

const INK = '#1E1810'

/** 左カードの番号付き項目 */
function step(key: string, n: string, x: number, y: number, w: number, text: string): Node[] {
  return [
    { kind: 'emblem', shape: 'snowflake', x: x + 18, y: y + 30, size: 30, fill: '#8A6A3C', opacity: 0.9 },
    { kind: 'text', id: `${key}.n`, x: x + 70, y: y + 2,
      text: n, font: F.serifLatin, size: 58, weight: 400, fill: '#8A6A3C' },
    { kind: 'vrule', x: x + 114, y: y + 10, h: 58, stroke: 'rgba(120,95,60,0.55)', thickness: 2 },
    { kind: 'text', id: `${key}.t`, label: `項目${n}`, x: x + 140, y: y + 8, w: w - 160,
      text, font: F.sans, size: 28, weight: 400, lh: 1.5, fill: INK },
  ]
}

/** 7枚目：次に必要なのは、修正ではなく判断です */
export const s7: Slide = {
  id: 's7',
  name: '07 次の判断',
  nodes: [
    { kind: 'frame', variant: 'none' },
    { kind: 'emblem', shape: 'snowflake', x: 50, y: 88, size: 58, fill: C.gold, opacity: 0.95 },
    { kind: 'text', id: 's7.title', label: 'タイトル', x: 105, y: 38,
      text: '次に必要なのは、修正ではなく判断です', font: F.serif, size: 78, weight: 700, fill: C.cream },
    { kind: 'rule', x: 105, y: 140, w: 1590, stroke: C.goldLine, thickness: 2 },
    { kind: 'vrule', x: 72, y: 150, h: 170, stroke: C.goldLine, thickness: 2 },

    { kind: 'card', x: 105, y: 177, w: 1874, h: 136, variant: 'notched' },
    { kind: 'text', id: 's7.lead', label: 'リード文', x: 215, y: 200, w: 1700,
      text: '現時点の判定は、確認済み項目のみを対象としています。実際には要確認の項目が\n多数あり、その一部でも問題が確認できた場合は、最重要のA判定に切り替わります。',
      font: F.serif, size: 34, weight: 700, lh: 1.5, fill: INK },

    // ── 左：正式確認で決める3つ ─────────────────────────
    { kind: 'card', x: 120, y: 355, w: 877, h: 512, variant: 'ornate' },
    { kind: 'text', id: 's7.lt', label: '左 見出し', x: 558, y: 390, origin: 'center',
      text: '正式確認で決める3つ', font: F.serif, size: 42, weight: 700, fill: '#5E4226' },
    { kind: 'rule', x: 156, y: 466, w: 805, stroke: 'rgba(120,95,60,0.5)', diamond: true },
    ...step('s7.s1', '1', 150, 490, 820, '要確認の候補のうち、実際に\n使われているものは何か'),
    ...step('s7.s2', '2', 150, 604, 820, 'サイト改ざんや偽ページ掲載につながる入口を、\nどの順番で止めるか'),
    ...step('s7.s3', '3', 150, 718, 820, '現在のWordPress運用を継続できるか、\n公開方式を変えるべきか'),

    // ── 右：管理会社に問い合わせる場合 ──────────────────
    { kind: 'card', x: 1042, y: 355, w: 937, h: 512, variant: 'ornate' },
    { kind: 'text', id: 's7.rt', label: '右 見出し', x: 1510, y: 390, origin: 'center',
      text: '管理会社に問い合わせる場合', font: F.serif, size: 42, weight: 700, fill: '#5E4226' },
    { kind: 'rule', x: 1078, y: 466, w: 865, stroke: 'rgba(120,95,60,0.5)', diamond: true },
    { kind: 'text', id: 's7.rb', label: '右 本文', x: 1096, y: 494, w: 860,
      text: '最初に、現在の保守会社または制作会社へ、\n現在使われている WordPress 本体と追加プラグイン、\n管理用入口、メール設定の担当者の確認を\n依頼してください。確認済みの事実はそのままで、\n要確認候補が実在するかの切り分けを\n優先してもらいます。',
      font: F.sans, size: 30, weight: 400, lh: 1.62, fill: INK },

    { kind: 'rule', x: 105, y: 907, w: 1874, stroke: C.goldLineFaint, diamond: true },

    { kind: 'card', x: 97, y: 948, w: 1702, h: 88, variant: 'notched' },
    { kind: 'text', id: 's7.ct', x: 130, y: 968,
      text: 'ご希望の場合', font: F.serif, size: 32, weight: 500, fill: '#5E4226' },
    { kind: 'vrule', x: 352, y: 962, h: 60, stroke: 'rgba(120,95,60,0.6)', thickness: 2 },
    { kind: 'text', id: 's7.cb', label: '結び', x: 384, y: 972,
      text: '候補の実在調査・評級確定診断まで含めた支援を、当方にご相談いただくことも可能です。',
      font: F.sans, size: 30, weight: 400, fill: INK },

    { kind: 'pagenum', id: 's7.page', text: '07', total: '/ 08', variant: 'notch', size: 100 },
  ],
}
