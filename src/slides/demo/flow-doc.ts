import { diagram } from '../../layout'
import type { Slide } from '../../types'

/** SlideGen 自身の作り方を、SlideGen の構成図テンプレートで描いたもの。
 *  箱と矢印はデータで、配置は格子に任せている。 */
export const flowDoc: Slide = diagram(
  { id: 'flow-doc', name: 'F スライド生成フロー', extra: true },
  {
    title: 'スライドができるまで',
    sub: '画像生成に作らせるもの（上段）と、コードで持つもの（下段）',
    cols: 5,
    rows: 3,
    boxes: [
      { id: 'gpt', text: 'opengpt\n（画像生成）', col: 0, row: 0, h: 96 },
      { id: 'sheetP', text: 'パーツ見本表\n4×3 の1枚絵', col: 1, row: 0, h: 96, size: 20 },
      { id: 'sheetL', text: '装飾文字 見本表\n1マス1文字', col: 1, row: 1, h: 96, size: 20 },
      { id: 'cut', text: 'tools/assets\n切って白地を抜く', col: 2, row: 0.5, h: 96, size: 20 },
      { id: 'parts', text: 'public/parts\n透過PNG', col: 3, row: 0.5, h: 96, size: 20 },

      { id: 'report', text: 'reports/\n案件データ', col: 0, row: 2, h: 90, size: 20 },
      { id: 'layout', text: 'layout.ts\nテンプレート', col: 1.6, row: 2, h: 90, size: 20 },
      { id: 'slides', text: 'slides/\n1ページ=1ファイル', col: 3.2, row: 2, h: 90, size: 20 },
      { id: 'out', text: 'render → 画面\nPNG / PDF', col: 4, row: 1.25, h: 96, size: 20 },
    ],
    edges: [
      { from: 'gpt', to: 'sheetP' },
      { from: 'gpt', to: 'sheetL' },
      { from: 'sheetP', to: 'cut' },
      { from: 'sheetL', to: 'cut' },
      { from: 'cut', to: 'parts' },
      { from: 'parts', to: 'out', label: 'image ノード' },
      { from: 'report', to: 'layout', label: '値' },
      { from: 'layout', to: 'slides', label: '版面' },
      { from: 'slides', to: 'out' },
    ],
    note: '文字と数字が入るものはコードで描く。画像生成に版面ごと作らせると、8枚中4枚で字が壊れた。',
  },
)
