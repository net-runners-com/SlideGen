/** 元スライド(2048x1152 JPEG)から抽出した配色・書体トークン。
 *  色は pg-00*.png の領域ごとの支配色をサンプリングして決めた実測値。 */

export const SLIDE_W = 2048
export const SLIDE_H = 1152

/** 出荷時の配色。ここは書き換えない（復元と差分計算の基準にする）。 */
export const BASE = {
  /** 背景ネイビー（中央寄り／周縁） */
  navy: '#101826',
  navyDeep: '#0A0F18',
  navyLift: '#16202F',
  /** 枠の内側・ページ番号の座面 */
  navyInner: '#0C1119',
  navyPlate: 'rgba(10,15,24,0.92)',

  /** 見出しのクリーム */
  cream: '#E8DCC7',
  /** 本文の白寄り */
  paperWhite: '#F2EFE6',

  /** 金（明→暗） */
  gold: '#C2A279',
  goldDeep: '#A27C4D',
  goldDim: '#8C6E46',
  goldLine: 'rgba(194,162,121,0.55)',
  goldLineFaint: 'rgba(194,162,121,0.22)',
  /** 紙カードの縁飾り */
  cardEdge: 'rgba(120,95,60,0.75)',
  cardEdgeSoft: 'rgba(150,118,74,0.45)',
  cardEdgeThin: 'rgba(120,95,60,0.6)',
  cardEdgeFaint: 'rgba(150,118,74,0.35)',
  /** 矢印・ゲージの目盛 */
  arrowLine: 'rgba(90,72,48,0.85)',
  gaugeTick: 'rgba(40,32,20,0.85)',

  /** 紙カード */
  paper: '#F2ECE0',
  paperEdge: '#E4DED2',
  paperShade: '#DCD3C2',

  /** 紙の上の墨 */
  ink: '#121420',
  inkSoft: '#3A3A44',

  /** 赤 */
  crimson: '#822828',
  crimsonSoft: '#9C3C2C',

  /** 危険度ゲージの帯（暗→茶→金→朱→赤） */
  gaugeDark: '#0D0D10',
  gaugeBrown: '#6B4E22',
  gaugeGold: '#D8B87A',
  gaugeRed: '#9E3A24',
  gaugeRedHot: '#C8232B',
} as const

export type ColorKey = keyof typeof BASE

/** 現在の配色。palette.ts の applyPalette が中身を差し替える。
 *  shapes/emblems は描画のたびにここを読むので、書き換え後に再描画すれば反映される。 */
export const C: Record<ColorKey, string> = { ...BASE }

/** 役割ごとの書体。すべて Google Fonts。
 *  serif    = 明朝見出し
 *  serifAlt = やや硬い明朝（表組み・図版のラベル）
 *  sans     = ゴシック本文
 *  mono     = ドメイン・数値表記 */
export const F = {
  serif: '"Shippori Mincho B1"',
  serifAlt: '"Zen Old Mincho"',
  serifLatin: '"Noto Serif JP"',
  sans: '"Zen Kaku Gothic New"',
  sansAlt: '"Noto Sans JP"',
  mono: '"Roboto Mono"',
} as const

/** 差し替え候補。Inspector のプルダウンに出す。 */
export const FONT_CHOICES = [
  'Shippori Mincho B1',
  'Zen Old Mincho',
  'Noto Serif JP',
  'Zen Kaku Gothic New',
  'Noto Sans JP',
  'Roboto Mono',
] as const

export const GOOGLE_FONT_FAMILIES = [
  'Shippori Mincho B1:wght@400;500;600;700;800',
  'Noto Serif JP:wght@200..900',
  'Zen Kaku Gothic New:wght@300;400;500;700;900',
  'Noto Sans JP:wght@100..900',
  'Zen Old Mincho:wght@400;500;600;700;900',
  'Roboto Mono:wght@300;400;500',
]
