import {
  Rect, Line, Polygon, Polyline, Group, Gradient, Shadow, Pattern, FabricText,
  type FabricObject,
} from 'fabric'
import { C, F, SLIDE_W, SLIDE_H } from '../theme'
import type {
  ArrowNode, BoxNode, CardNode, FrameNode, GaugeNode, PageNumNode, RuleNode, VRuleNode,
} from '../types'
import { DECOR } from './common'

/* ─────────────────────────── 背景 ─────────────────────────── */

let noiseTile: HTMLCanvasElement | null = null

/** 元画像にある紙やすり状のざらつきを再現する 128px タイル */
function getNoiseTile() {
  if (noiseTile) return noiseTile
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(128, 128)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random()
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255
    img.data[i + 3] = v > 0.86 ? 10 + Math.random() * 16 : 0
  }
  ctx.putImageData(img, 0, 0)
  noiseTile = c
  return c
}

export function makeBackground(): FabricObject[] {
  const base = new Rect({
    left: 0, top: 0, width: SLIDE_W, height: SLIDE_H, ...DECOR,
    fill: new Gradient({
      type: 'radial',
      gradientUnits: 'pixels',
      coords: { x1: SLIDE_W * 0.42, y1: SLIDE_H * 0.4, r1: 0, x2: SLIDE_W * 0.42, y2: SLIDE_H * 0.4, r2: SLIDE_W * 0.78 },
      colorStops: [
        { offset: 0, color: C.navyLift },
        { offset: 0.55, color: C.navy },
        { offset: 1, color: C.navyDeep },
      ],
    }),
  })
  const grain = new Rect({
    left: 0, top: 0, width: SLIDE_W, height: SLIDE_H, opacity: 0.5, ...DECOR,
    fill: new Pattern({ source: getNoiseTile(), repeat: 'repeat' }),
  })
  return [base, grain]
}

/* ─────────────────────────── 罫・枠 ─────────────────────────── */

function diamond(x: number, y: number, s: number, fill: string) {
  return new Polygon(
    [{ x: 0, y: -s }, { x: s, y: 0 }, { x: 0, y: s }, { x: -s, y: 0 }],
    { left: x, top: y, originX: 'center', originY: 'center', fill, ...DECOR },
  )
}

export function makeRule(n: RuleNode): FabricObject[] {
  const stroke = n.stroke ?? C.goldLine
  const out: FabricObject[] = [
    new Line([n.x, n.y, n.x + n.w, n.y], { stroke, strokeWidth: n.thickness ?? 1.6, ...DECOR }),
  ]
  if (n.diamond) {
    out.push(diamond(n.x + n.w / 2, n.y, 7, C.gold))
  }
  return out
}

export function makeVRule(n: VRuleNode): FabricObject[] {
  return [new Line([n.x, n.y, n.x, n.y + n.h], {
    stroke: n.stroke ?? C.goldLine, strokeWidth: n.thickness ?? 1.6, ...DECOR,
  })]
}

export function makeBox(n: BoxNode): FabricObject[] {
  return [new Rect({
    left: n.x, top: n.y, width: n.w, height: n.h,
    fill: n.fill ?? 'transparent',
    stroke: n.stroke, strokeWidth: n.thickness ?? 0,
    rx: n.radius ?? 0, ry: n.radius ?? 0,
    opacity: n.opacity ?? 1,
    ...DECOR,
  })]
}

/** ページ四隅・上辺の飾り */
export function makeFrame(n: FrameNode): FabricObject[] {
  if (n.variant === 'none') return []
  const g = C.goldLine
  const out: FabricObject[] = []

  if (n.variant === 'cover') {
    out.push(new Line([56, 46, 1992, 46], { stroke: g, strokeWidth: 1.6, ...DECOR }))
    out.push(new Line([56, 52, 1992, 52], { stroke: C.goldLineFaint, strokeWidth: 1.2, ...DECOR }))
    out.push(diamond(60, 49, 9, C.gold), diamond(1988, 49, 9, C.gold))
    out.push(diamond(1024, 49, 7, C.goldDeep))
    // 下隅の鉤括弧
    for (const [cx, dir] of [[56, 1], [1992, -1]] as const) {
      out.push(new Line([cx, 1040, cx, 1106], { stroke: g, strokeWidth: 1.6, ...DECOR }))
      out.push(new Line([cx, 1106, cx + dir * 66, 1106], { stroke: g, strokeWidth: 1.6, ...DECOR }))
      out.push(diamond(cx + dir * 84, 1106, 5, C.goldDeep))
    }
  }

  if (n.variant === 'thin' || n.variant === 'brackets') {
    out.push(new Rect({
      left: 24, top: 24, width: SLIDE_W - 48, height: SLIDE_H - 48,
      fill: 'transparent', stroke: C.goldLineFaint, strokeWidth: 1.4, ...DECOR,
    }))
  }
  return out
}

/* ─────────────────────────── 紙カード ─────────────────────────── */

/** 角を落とした八角形の点列 */
function notchPts(x: number, y: number, w: number, h: number, c: number) {
  return [
    { x: x + c, y }, { x: x + w - c, y }, { x: x + w, y: y + c },
    { x: x + w, y: y + h - c }, { x: x + w - c, y: y + h },
    { x: x + c, y: y + h }, { x, y: y + h - c }, { x, y: y + c },
  ]
}

export function makeCard(n: CardNode): FabricObject[] {
  const fill = n.fill ?? C.paper
  const shadow = new Shadow({ color: 'rgba(0,0,0,0.55)', blur: 26, offsetX: 0, offsetY: 8 })
  const out: FabricObject[] = []
  const v = n.variant ?? 'plain'
  const rounded = v === 'notched' || v === 'ornate'

  // 元画像のカードは「金の細罫 → 黒帯 → 紙」の三層。外側から順に敷く。
  const band = 9
  const shape = (dx: number, opts: Record<string, unknown>) => (rounded
    ? new Polygon(notchPts(n.x - dx, n.y - dx, n.w + dx * 2, n.h + dx * 2, 18 + dx), { ...opts, ...DECOR })
    : new Rect({ left: n.x - dx, top: n.y - dx, width: n.w + dx * 2, height: n.h + dx * 2, ...opts, ...DECOR }))

  out.push(shape(band + 3, { fill: 'transparent', stroke: C.goldLine, strokeWidth: 2 }))
  out.push(shape(band, { fill: C.navyInner, shadow }))
  out.push(shape(0, { fill }))

  if (v === 'double') {
    out.push(new Rect({
      left: n.x + 12, top: n.y + 12, width: n.w - 24, height: n.h - 24,
      fill: 'transparent', stroke: C.cardEdge, strokeWidth: 3, ...DECOR,
    }))
    out.push(new Rect({
      left: n.x + 22, top: n.y + 22, width: n.w - 44, height: n.h - 44,
      fill: 'transparent', stroke: C.cardEdgeSoft, strokeWidth: 1.4, ...DECOR,
    }))
  }

  if (v === 'ornate') {
    out.push(new Polygon(notchPts(n.x + 12, n.y + 12, n.w - 24, n.h - 24, 14), {
      fill: 'transparent', stroke: C.cardEdgeThin, strokeWidth: 2.4, ...DECOR,
    }))
    out.push(new Polygon(notchPts(n.x + 20, n.y + 20, n.w - 40, n.h - 40, 10), {
      fill: 'transparent', stroke: C.cardEdgeFaint, strokeWidth: 1.2, ...DECOR,
    }))
  }

  return out
}

/* ─────────────────────────── ゲージ ─────────────────────────── */

export function makeGauge(n: GaugeNode): FabricObject[] {
  const h = 26
  const bar = new Rect({
    left: n.x, top: n.y, width: n.w, height: h, ...DECOR,
    fill: new Gradient({
      type: 'linear',
      gradientUnits: 'percentage',
      coords: { x1: 0, y1: 0, x2: 1, y2: 0 },
      colorStops: [
        { offset: 0, color: C.gaugeDark },
        { offset: 0.42, color: C.gaugeBrown },
        { offset: 0.62, color: C.gaugeGold },
        { offset: 0.80, color: C.gaugeRed },
        { offset: 1, color: C.gaugeRedHot },
      ],
    }),
  })
  const ticks: FabricObject[] = []
  for (let i = 0; i <= 40; i++) {
    const tx = n.x + (n.w * i) / 40
    const long = i % 5 === 0
    ticks.push(new Line([tx, n.y - (long ? 16 : 9), tx, n.y - 1], {
      stroke: C.gaugeTick, strokeWidth: long ? 2 : 1.2, ...DECOR,
    }))
  }
  const mx = n.x + (n.w * Math.max(0, Math.min(100, n.value))) / 100
  const marker = new Polygon(
    [{ x: 0, y: 0 }, { x: 15, y: 24 }, { x: -15, y: 24 }],
    { left: mx, top: n.y + h + 4, originX: 'center', fill: C.goldDeep, ...DECOR },
  )
  return [...ticks, bar, marker]
}

/* ─────────────────────────── 矢印 ─────────────────────────── */

export function makeArrow(n: ArrowNode): FabricObject[] {
  const stroke = n.stroke ?? C.arrowLine
  const pts = n.points.map(([x, y]) => ({ x, y }))
  const line = new Polyline(pts, {
    fill: 'transparent', stroke, strokeWidth: 2,
    strokeDashArray: n.dashed ? [8, 6] : undefined, ...DECOR,
  })
  if (n.plain) return [line]

  // 最終区間の向きから矢尻の3点を直接求める（回転指定だと向きがずれる）
  const [ax, ay] = n.points[n.points.length - 2]
  const [bx, by] = n.points[n.points.length - 1]
  const len = Math.hypot(bx - ax, by - ay) || 1
  const ux = (bx - ax) / len, uy = (by - ay) / len
  const L = 17, Wd = 7
  const back = { x: bx - ux * L, y: by - uy * L }
  const head = new Polygon(
    [
      { x: bx, y: by },
      { x: back.x - uy * Wd, y: back.y + ux * Wd },
      { x: back.x + uy * Wd, y: back.y - ux * Wd },
    ],
    { fill: stroke, ...DECOR },
  )
  return [line, head]
}

/* ─────────────────────────── ページ番号 ─────────────────────────── */

export function makePageNum(n: PageNumNode): FabricObject[] {
  const out: FabricObject[] = []
  // 元画像はページごとに番号の大きさが違うので size で受ける。
  // 表紙(size 112)のとき字面が実測 x 1752..2000, y 1022..1099 に載る係数。
  const big = n.size ?? 112
  const small = Math.round(big * 0.59)
  const bx = 2000 - Math.round(big * 1.18) - Math.round(small * 1.75)
  const by = 1100 - Math.round(big * 0.82)

  if (n.variant === 'notch') {
    const top = by - 16
    out.push(new Polygon(
      [{ x: bx - 90, y: 1152 }, { x: bx - 24, y: top }, { x: 2048, y: top }, { x: 2048, y: 1152 }],
      { fill: C.navyPlate, stroke: C.goldLine, strokeWidth: 2, ...DECOR },
    ))
  }
  if (n.variant === 'boxed') {
    const bw = 2010 - (bx - 26)
    out.push(new Rect({
      left: bx - 26, top: by - 20, width: bw, height: Math.round(big * 1.18),
      fill: 'transparent', stroke: C.goldLine, strokeWidth: 2, ...DECOR,
    }))
    out.push(new Rect({
      left: bx - 16, top: by - 10, width: bw - 20, height: Math.round(big * 1.18) - 20,
      fill: 'transparent', stroke: C.goldLineFaint, strokeWidth: 1.2, ...DECOR,
    }))
  }

  out.push(new FabricText(n.text, {
    left: bx, top: by, fontFamily: F.serifLatin, fontSize: big,
    fontWeight: 500, fill: C.gold, ...DECOR,
  }))
  out.push(new FabricText(n.total, {
    left: bx + Math.round(big * 1.30), top: by + Math.round(big * 0.33), fontFamily: F.serifLatin, fontSize: small,
    fontWeight: 400, fill: C.goldDeep, ...DECOR,
  }))
  return out
}
