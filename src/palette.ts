/** 配色の差し替え。
 *
 *  考え方: 色は「群」で動かす。たとえば金を変えたら、濃い金・金の細罫・カードの縁飾りも
 *  一緒に動かないと画面が壊れる。そこで群ごとに代表色を1つ選ばせ、
 *  他のメンバーは **出荷時の代表色との HSL 差分** を新しい代表色へ足して求める。
 *  代表色が出荷時のままなら差分 0 なので、既定では元の色がそのまま再現される。
 */
import { BASE, C, type ColorKey } from './theme'

export type GroupKey = 'navy' | 'gold' | 'cream' | 'paper' | 'ink' | 'crimson'

export const GROUPS: { key: GroupKey; label: string; members: ColorKey[] }[] = [
  { key: 'navy', label: '背景', members: ['navy', 'navyDeep', 'navyLift', 'navyInner', 'navyPlate', 'gaugeDark'] },
  { key: 'gold', label: '金・罫', members: ['gold', 'goldDeep', 'goldDim', 'goldLine', 'goldLineFaint', 'cardEdge', 'cardEdgeSoft', 'cardEdgeThin', 'cardEdgeFaint', 'arrowLine', 'gaugeTick', 'gaugeBrown', 'gaugeGold'] },
  { key: 'cream', label: '見出し文字', members: ['cream', 'paperWhite'] },
  { key: 'paper', label: '紙カード', members: ['paper', 'paperEdge', 'paperShade'] },
  { key: 'ink', label: '紙上の文字', members: ['ink', 'inkSoft'] },
  { key: 'crimson', label: '赤', members: ['crimson', 'crimsonSoft', 'gaugeRed', 'gaugeRedHot'] },
]

export type Picks = Record<GroupKey, string>

export const DEFAULT_PICKS: Picks = Object.fromEntries(
  GROUPS.map((g) => [g.key, BASE[g.key]]),
) as Picks

/* ── 色の読み書き ─────────────────────────────────────────── */

type RGBA = { r: number; g: number; b: number; a: number }

function parse(c: string): RGBA | null {
  const s = c.trim()
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s)
  if (m) {
    const h = m[1].length === 3 ? m[1].split('').map((x) => x + x).join('') : m[1]
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16), a: 1 }
  }
  const r = /^rgba?\(([^)]+)\)$/i.exec(s)
  if (r) {
    const p = r[1].split(',').map((x) => Number(x.trim()))
    if (p.length >= 3 && p.slice(0, 3).every(Number.isFinite)) {
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 && Number.isFinite(p[3]) ? p[3] : 1 }
    }
  }
  return null
}

// BASE の表記（大文字）に揃える。揃えないと同じ色が「変更あり」と誤判定される。
const hex2 = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0').toUpperCase()

function fmt(c: RGBA): string {
  if (c.a >= 1) return `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}`
  const n = (v: number) => Math.round(Math.max(0, Math.min(255, v)))
  return `rgba(${n(c.r)},${n(c.g)},${n(c.b)},${Math.round(c.a * 100) / 100})`
}

type HSL = { h: number; s: number; l: number }

function toHSL({ r, g, b }: RGBA): HSL {
  const R = r / 255, G = g / 255, B = b / 255
  const mx = Math.max(R, G, B), mn = Math.min(R, G, B)
  const l = (mx + mn) / 2
  if (mx === mn) return { h: 0, s: 0, l }
  const d = mx - mn
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
  const h = mx === R ? ((G - B) / d + (G < B ? 6 : 0))
    : mx === G ? (B - R) / d + 2
      : (R - G) / d + 4
  return { h: h * 60, s, l }
}

function fromHSL({ h, s, l }: HSL, a: number): RGBA {
  const H = ((h % 360) + 360) % 360
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((H / 60) % 2) - 1))
  const m = l - c / 2
  const i = Math.floor(H / 60) % 6
  const t: [number, number, number] =
    i === 0 ? [c, x, 0] : i === 1 ? [x, c, 0] : i === 2 ? [0, c, x]
      : i === 3 ? [0, x, c] : i === 4 ? [x, 0, c] : [c, 0, x]
  return { r: (t[0] + m) * 255, g: (t[1] + m) * 255, b: (t[2] + m) * 255, a }
}

/** 表記ゆれ（大文字小文字・空白）を無視して同じ色か */
export const same = (a: string, b: string) =>
  a.trim().toLowerCase().replace(/\s+/g, '') === b.trim().toLowerCase().replace(/\s+/g, '')

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
/** 色相差は近い方向で取る（350°と10°は -20° ではなく +20°） */
const hueDelta = (a: number, b: number) => ((a - b + 540) % 360) - 180

/** base の群代表色 from を to へ動かしたとき、member がどこへ行くか。 */
function shift(member: string, from: string, to: string): string {
  const M = parse(member), A = parse(from), B = parse(to)
  if (!M || !A || !B) return member
  const hm = toHSL(M), ha = toHSL(A), hb = toHSL(B)
  return fmt(fromHSL({
    h: hb.h + hueDelta(hm.h, ha.h),
    s: clamp01(hb.s + (hm.s - ha.s)),
    l: clamp01(hb.l + (hm.l - ha.l)),
  }, M.a))
}

/* ── 適用 ─────────────────────────────────────────────────── */

/** 配色の適用結果。exact は出荷時の色、approx はスライド側の独自リテラル用。 */
export interface Palette {
  /** 出荷時の色文字列 → 新しい色文字列 */
  exact: Map<string, string>
  /** トークンに載っていない色を、いちばん近いトークンと同じ向きへ動かす */
  approx: (color: string) => string
}

/** HSL 上の距離。灰色どうしが色相のノイズで結びつかないよう、色相は彩度で重み付けする。 */
function dist(a: HSL, b: HSL): number {
  const dh = Math.abs(hueDelta(a.h, b.h)) / 180
  return dh * Math.min(a.s, b.s) * 1.2 + Math.abs(a.s - b.s) * 0.6 + Math.abs(a.l - b.l)
}

/**
 * C を書き換え、描画時に色を引き直すための対応表を作る。
 *
 * スライド定義(s1.ts…)は読み込み時に C の値をリテラルとして抱えているので、
 * 出荷時の色は exact で引く。ただし各スライドには `'#8A6A3C'` のような
 * その場限りの色も多く、これらは exact に載らない。放っておくと
 * 「金を青に変えたのに一部だけ金のまま」になるので、近いトークンと
 * 同じ変換を当てて追従させる。
 */
export function applyPalette(picks: Picks): Palette {
  const exact = new Map<string, string>()
  const moved: { from: HSL; to: string; base: string }[] = []
  for (const g of GROUPS) {
    const to = picks[g.key] ?? BASE[g.key]
    const changed = !same(to, BASE[g.key])
    for (const k of g.members) {
      const next = shift(BASE[k], BASE[g.key], to)
      C[k] = next
      if (!same(next, BASE[k])) exact.set(BASE[k], next)
      if (changed) {
        const rgba = parse(BASE[k])
        if (rgba) moved.push({ from: toHSL(rgba), to: next, base: BASE[k] })
      }
    }
  }

  const cache = new Map<string, string>()
  const approx = (color: string): string => {
    const hit = exact.get(color)
    if (hit) return hit
    if (!moved.length) return color
    const cached = cache.get(color)
    if (cached !== undefined) return cached
    const c = parse(color)
    if (!c) { cache.set(color, color); return color }
    const h = toHSL(c)
    let best = moved[0]
    let bestD = Infinity
    for (const m of moved) {
      const d = dist(h, m.from)
      if (d < bestD) { bestD = d; best = m }
    }
    const out = shift(color, best.base, best.to)
    cache.set(color, out)
    return out
  }
  return { exact, approx }
}

export type ColorResolver = (color: string | undefined, nodeId?: string) => string | undefined

/**
 * 描画時に色を引き直す関数を作る。
 * overrides は「この要素だけ別の色」という節単位の指定で、配色より優先する。
 */
export function makeColorResolver(
  palette: Palette,
  overrides: Record<string, string> = {},
): ColorResolver {
  return (color, nodeId) => {
    if (nodeId && overrides[nodeId]) return overrides[nodeId]
    if (!color) return color
    return palette.approx(color)
  }
}

/** 色が明るいか（文字色を黒白どちらにするかの判定に使う） */
export function isLight(color: string): boolean {
  const c = parse(color)
  if (!c) return false
  return (c.r * 299 + c.g * 587 + c.b * 114) / 1000 > 140
}

/** <input type="color"> は #rrggbb しか受け付けないので落とし込む */
export function toHex(color: string): string {
  const c = parse(color)
  return c ? `#${hex2(c.r)}${hex2(c.g)}${hex2(c.b)}` : '#000000'
}
