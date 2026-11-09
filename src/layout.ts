import { C, F, SLIDE_H, SLIDE_W } from './theme'
import type { Node, Slide } from './types'

/** 版面の下敷き。
 *
 *  いままで座標を 1 つずつ測って置いていたので、ページを 1 枚足すたびに
 *  余白も級数も揃わなかった。段組と帯をここで決めて、型から組む。 */
export const GRID = {
  /** 左右の余白 */
  margin: 96,
  /** 段数と段間 */
  cols: 12,
  gutter: 24,
  /** 見出し帯の高さ（上端から） */
  header: 196,
  /** 下の余白（ページ番号の帯） */
  footer: 104,
} as const

/** 本文が使える領域 */
export const BODY = {
  x: GRID.margin,
  y: GRID.header,
  w: SLIDE_W - GRID.margin * 2,
  h: SLIDE_H - GRID.header - GRID.footer,
} as const

/** n 段目から span 段ぶんの x と幅 */
export function col(n: number, span = 1) {
  const unit = (BODY.w - GRID.gutter * (GRID.cols - 1)) / GRID.cols
  return {
    x: BODY.x + (unit + GRID.gutter) * n,
    w: unit * span + GRID.gutter * (span - 1),
  }
}

/** 本文の縦を n 段に割る。gap は段どうしの空き。 */
export function band(i: number, n: number, gap = 24) {
  const h = (BODY.h - gap * (n - 1)) / n
  return { y: BODY.y + (h + gap) * i, h }
}

/* ── 型 ─────────────────────────────────────────────── */

export interface PageMeta {
  id: string
  name: string
  /** 右下に出す「03」。省くと番号を出さない */
  page?: string
  total?: string
  extra?: boolean
}

export interface HeadOpts {
  title: string
  sub?: string
  /** 見出しの色。省略時はクリーム */
  fill?: string
}

/** 見出し帯。どのテンプレートも同じ組みにする。自作のテンプレートからも呼べる。 */
export function head(id: string, o: HeadOpts): Node[] {
  const out: Node[] = [
    { kind: 'text', id: `${id}.title`, label: 'タイトル',
      x: GRID.margin, y: 42, w: BODY.w,
      text: o.title, font: F.serif, size: 72, weight: 700, fill: o.fill ?? C.cream },
  ]
  if (o.sub) {
    out.push({ kind: 'text', id: `${id}.sub`, label: 'サブ',
      x: GRID.margin, y: 130, w: BODY.w,
      text: o.sub, font: F.sans, size: 28, weight: 300, fill: C.paperWhite })
  }
  out.push({ kind: 'rule', x: GRID.margin, y: GRID.header - 24, w: BODY.w, stroke: C.goldLine, thickness: 2 })
  return out
}

/** 右下のページ番号。page を省いたページには出ない。 */
export function foot(id: string, m: PageMeta): Node[] {
  if (!m.page) return []
  return [{ kind: 'pagenum', id: `${id}.page`, text: m.page, total: m.total ?? '', variant: 'plain' }]
}

/** メタ情報とノード列から 1 ページを作る。自作テンプレートの最後はこれで包む。 */
export const page = (m: PageMeta, nodes: Node[]): Slide => ({
  id: m.id, name: m.name, extra: m.extra, nodes,
})

/**
 * 自分で版面を組むときの入れ物。見出し帯とページ番号だけ共通にして、
 * 中身は呼ぶ側が好きに置く。body は BODY 領域の座標で書く。
 *
 *   custom({ id: 'p9', name: '09 独自', page: '09' },
 *     { title: '見出し' },
 *     [{ kind: 'text', id: 'p9.a', x: col(0, 6).x, y: band(0, 2).y, … }])
 */
export function custom(m: PageMeta, h: HeadOpts | null, body: Node[]): Slide {
  return page(m, [
    { kind: 'frame', variant: 'none' },
    ...(h ? head(m.id, h) : []),
    ...body,
    ...foot(m.id, m),
  ])
}

/* ── テンプレート ───────────────────────────────────── */

/** 大きな一文だけを置く。中扉や締めのページ。 */
export function statement(m: PageMeta, o: { text: string; note?: string }): Slide {
  return page(m, [
    { kind: 'frame', variant: 'none' },
    { kind: 'text', id: `${m.id}.body`, label: '本文',
      x: SLIDE_W / 2, y: SLIDE_H / 2, origin: 'center', originY: 'center', w: BODY.w - 200,
      text: o.text, font: F.serif, size: 72, weight: 700, lh: 1.5, align: 'center', fill: C.cream },
    ...(o.note ? [{ kind: 'text', id: `${m.id}.note`, label: '注記',
      x: SLIDE_W / 2, y: SLIDE_H - GRID.footer - 40, origin: 'center', w: BODY.w - 300,
      text: o.note, font: F.sans, size: 26, weight: 300, align: 'center', fill: C.paperWhite } as Node] : []),
    ...foot(m.id, m),
  ])
}

/** 見出し＋箇条書き。番号は出さない（順序でないものに番号を振らない）。 */
export function bullets(m: PageMeta, o: HeadOpts & { items: string[] }): Slide {
  const nodes: Node[] = [{ kind: 'frame', variant: 'none' }, ...head(m.id, o)]
  // 本文の高さを等分すると項目どうしが離れすぎる。上から字の分だけ送る。
  const size = 34
  const lh = 1.5
  const gap = size * 0.9
  let y = BODY.y + 8
  o.items.forEach((t, i) => {
    const lines = Math.max(1, t.split('\n').length)
    nodes.push(
      { kind: 'emblem', shape: 'diamond', x: GRID.margin + 14, y: y + size * 0.6, size: 9, fill: C.gold },
      { kind: 'text', id: `${m.id}.i${i}`, label: `項目${i + 1}`,
        x: GRID.margin + 48, y, w: BODY.w - 48,
        text: t, font: F.sans, size, weight: 400, lh, fill: C.paperWhite },
    )
    y += size * lh * lines + gap
  })
  nodes.push(...foot(m.id, m))
  return page(m, nodes)
}

/** 紙カードを横または格子に並べる。1〜4 枚まで。 */
export function cards(
  m: PageMeta,
  o: HeadOpts & { cards: { title: string; body: string }[]; columns?: number },
): Slide {
  const list = o.cards.slice(0, 4)
  const cols = o.columns ?? (list.length <= 3 ? list.length : 2)
  const rows = Math.ceil(list.length / cols)
  const nodes: Node[] = [{ kind: 'frame', variant: 'none' }, ...head(m.id, o)]
  const gap = 28
  const cw = (BODY.w - gap * (cols - 1)) / cols
  list.forEach((c, i) => {
    const r = Math.floor(i / cols)
    const q = i % cols
    const b = band(r, rows, gap)
    const x = BODY.x + (cw + gap) * q
    nodes.push(
      { kind: 'card', x, y: b.y, w: cw, h: b.h, variant: 'notched' },
      { kind: 'text', id: `${m.id}.c${i}t`, label: `カード${i + 1} 見出し`,
        x: x + cw / 2, y: b.y + 34, origin: 'center', w: cw - 60,
        text: c.title, font: F.serif, size: 38, weight: 700, align: 'center', fill: C.ink },
      { kind: 'rule', x: x + 34, y: b.y + 112, w: cw - 68, stroke: 'rgba(120,95,60,0.45)', diamond: true },
      { kind: 'text', id: `${m.id}.c${i}b`, label: `カード${i + 1} 本文`,
        x: x + 34, y: b.y + 146, w: cw - 68,
        text: c.body, font: F.sans, size: 27, weight: 400, lh: 1.6, fill: C.ink },
    )
  })
  nodes.push(...foot(m.id, m))
  return page(m, nodes)
}

/** 左右 2 段。比率は left の段数で決める（既定は半々）。 */
export function split(
  m: PageMeta,
  o: HeadOpts & { left: Node[]; right: Node[]; at?: number },
): Slide {
  const at = o.at ?? 6
  const l = col(0, at)
  const r = col(at, GRID.cols - at)
  // 子ノードは BODY 原点からの相対で書いてもらい、ここで寄せる
  const shift = (ns: Node[], dx: number) => ns.map((n) => (
    'x' in n ? { ...n, x: (n as { x: number }).x + dx } : n
  )) as Node[]
  return page(m, [
    { kind: 'frame', variant: 'none' },
    ...head(m.id, o),
    ...shift(o.left, l.x),
    { kind: 'vrule', x: (l.x + l.w + r.x) / 2, y: BODY.y, h: BODY.h, stroke: C.goldLineFaint },
    ...shift(o.right, r.x),
    ...foot(m.id, m),
  ])
}

/** 構成図 1 枚＋下の注記。箱は格子で置く（render/flow.ts）。 */
export function diagram(
  m: PageMeta,
  o: HeadOpts & {
    boxes: { id: string; text: string; col: number; row: number; h?: number; size?: number }[]
    edges: { from: string; to: string; label?: string; dashed?: boolean; plain?: boolean }[]
    cols?: number
    rows?: number
    note?: string
  },
): Slide {
  const noteH = o.note ? 92 : 0
  return page(m, [
    { kind: 'frame', variant: 'none' },
    ...head(m.id, o),
    { kind: 'card', x: BODY.x, y: BODY.y, w: BODY.w, h: BODY.h - noteH, variant: 'notched' },
    {
      kind: 'flow', id: `${m.id}.flow`,
      x: BODY.x + 40, y: BODY.y + 32, w: BODY.w - 80, h: BODY.h - noteH - 64,
      cols: o.cols ?? 5, rows: o.rows ?? 3, size: 22,
      boxes: o.boxes, edges: o.edges,
    },
    ...(o.note ? [{ kind: 'text', id: `${m.id}.note`, label: '注記',
      x: SLIDE_W / 2, y: BODY.y + BODY.h - noteH + 24, origin: 'center', w: BODY.w - 80,
      text: o.note, font: F.sans, size: 26, weight: 400, align: 'center', fill: C.paperWhite } as Node] : []),
    ...foot(m.id, m),
  ])
}
