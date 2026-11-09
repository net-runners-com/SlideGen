/** スライド1枚の宣言的な記述。描画は render/buildSlide.ts が担当する。
 *  座標はすべて 2048x1152 のスライド座標系（左上原点）。 */

export type Align = 'left' | 'center' | 'right'

/** 編集可能なテキスト。id を持つものが Inspector に出る。 */
export interface TextNode {
  kind: 'text'
  id: string
  /** Inspector に出す項目名 */
  label?: string
  x: number
  y: number
  /** 折り返し幅。未指定なら折り返さない */
  w?: number
  text: string
  font: string
  size: number
  weight?: number
  fill: string
  align?: Align
  /** 行送り倍率 */
  lh?: number
  /** 字送り（em の 1/1000） */
  ls?: number
  opacity?: number
  /** 原点を中央/右に取る */
  origin?: Align
  /** 縦方向の原点 */
  originY?: 'top' | 'center' | 'bottom'
  /** 編集不可（装飾文字など） */
  locked?: boolean
}

export interface RuleNode {
  kind: 'rule'
  x: number
  y: number
  w: number
  stroke?: string
  thickness?: number
  /** 中央に菱形を置く */
  diamond?: boolean
}

export interface VRuleNode {
  kind: 'vrule'
  x: number
  y: number
  h: number
  stroke?: string
  thickness?: number
}

export interface BoxNode {
  kind: 'box'
  x: number
  y: number
  w: number
  h: number
  fill?: string
  stroke?: string
  thickness?: number
  radius?: number
  opacity?: number
}

/** 紙のカード。variant で縁の装飾が変わる。 */
export interface CardNode {
  kind: 'card'
  x: number
  y: number
  w: number
  h: number
  variant?: 'plain' | 'notched' | 'ornate' | 'double'
  fill?: string
}

/** 0-100 のグラデーションゲージ＋三角マーカー */
export interface GaugeNode {
  kind: 'gauge'
  x: number
  y: number
  w: number
  value: number
  id?: string
}

export interface ArrowNode {
  kind: 'arrow'
  points: [number, number][]
  dashed?: boolean
  stroke?: string
  /** 矢尻を描かない */
  plain?: boolean
}

export type EmblemKind = 'shield' | 'wreath' | 'scales' | 'chart' | 'shieldC' | 'snowflake' | 'diamond'

export interface EmblemNode {
  kind: 'emblem'
  shape: EmblemKind
  x: number
  y: number
  size: number
  fill?: string
  opacity?: number
}

/** public/parts に置いた図形パーツを貼る。
 *  w か h の片方だけ指定すると、もう片方は元画像の比で決まる。 */
export interface ImageNode {
  kind: 'image'
  id?: string
  /** parts.ts の PART_NAMES のどれか */
  src: string
  x: number
  y: number
  w?: number
  h?: number
  opacity?: number
  origin?: Align
  originY?: 'top' | 'center' | 'bottom'
}

/** 構成図。箱の位置は格子の列・行で指定し、画素座標は描画側が出す。
 *  矢印は箱の縁どうしを自動で結ぶので、箱を足しても手で座標を直さなくてよい。 */
export interface FlowNode {
  kind: 'flow'
  id?: string
  /** 作図領域（この中に格子を敷く） */
  x: number
  y: number
  w: number
  h: number
  /** 格子の分割数。col/row は 0 から cols-1 / rows-1、小数も可 */
  cols: number
  rows: number
  boxes: {
    id: string
    text: string
    col: number
    row: number
    /** 既定は格子1マスの 0.86 倍 */
    w?: number
    h?: number
    size?: number
  }[]
  edges: {
    from: string
    to: string
    label?: string
    dashed?: boolean
    /** 矢尻を描かない */
    plain?: boolean
  }[]
  /** 箱の中の文字の既定級数 */
  size?: number
  fill?: string
  stroke?: string
}

/** 円グラフ。値はそのまま比率に使う（合計で割る）。 */
export interface PieNode {
  kind: 'pie'
  id?: string
  /** 中心 */
  x: number
  y: number
  r: number
  slices: { label: string; value: number; fill?: string }[]
  /** 扇の外に出す注記の文字級数 */
  size?: number
}

/** 縦棒グラフ。max は縦軸の上限。value が 0 の項目は棒を描かない。 */
export interface BarNode {
  kind: 'bar'
  id?: string
  /** 作図領域の左上 */
  x: number
  y: number
  w: number
  h: number
  max: number
  bars: { label: string; value: number; fill?: string }[]
  size?: number
}

/** 折れ線グラフ。max は縦軸の上限。 */
export interface LineChartNode {
  kind: 'linechart'
  id?: string
  x: number
  y: number
  w: number
  h: number
  max: number
  points: { label: string; value: number }[]
  stroke?: string
  size?: number
}

/** ページ全体の枠飾り */
export interface FrameNode {
  kind: 'frame'
  variant: 'cover' | 'brackets' | 'thin' | 'none'
}

/** 右下のページ番号ブロック（斜め切り欠き付き） */
export interface PageNumNode {
  kind: 'pagenum'
  id: string
  text: string
  total: string
  variant?: 'plain' | 'notch' | 'boxed'
  /** 「NN」の級数。元画像はページごとに大きさが違う。 */
  size?: number
}

export type Node =
  | TextNode
  | RuleNode
  | VRuleNode
  | BoxNode
  | CardNode
  | GaugeNode
  | ArrowNode
  | EmblemNode
  | ImageNode
  | FlowNode
  | PieNode
  | BarNode
  | LineChartNode
  | FrameNode
  | PageNumNode

export interface Slide {
  id: string
  /** サイドバーに出す名前 */
  name: string
  /** 本編ではない見本ページ。画面では見られるが PDF には入れない。 */
  extra?: boolean
  nodes: Node[]
}
