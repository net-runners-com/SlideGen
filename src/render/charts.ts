import { Rect, Line, Polyline, Path, Circle, FabricText, type FabricObject } from 'fabric'
import { C, F } from '../theme'
import type { BarNode, LineChartNode, PieNode } from '../types'
import { DECOR } from './common'

/* ─────────────────────────── グラフ ─────────────────────────── */

/** 既定の系列色。地が濃紺なので金を主役にし、赤と青を添える。 */
const SERIES = [C.crimsonSoft, C.gold, '#4F7FB5', C.goldDeep, C.goldDim]

/** 度 → キャンバス座標。12 時から時計回りに測る。 */
function polar(cx: number, cy: number, r: number, deg: number) {
  const a = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

/** 横軸のラベル。枠に収まらない長さは折り返す。切ると「古い連携用入」になる。 */
function axisLabel(text: string, cx: number, top: number, slot: number, size: number): FabricObject[] {
  const fontSize = size * 0.9
  // 全角は 1 字 ≒ fontSize。入る字数で折る
  const per = Math.max(2, Math.floor((slot - 8) / fontSize))
  const lines: string[] = []
  for (let i = 0; i < text.length; i += per) lines.push(text.slice(i, i + per))
  return [new FabricText(lines.join('\n'), {
    left: cx, top, originX: 'center', textAlign: 'center',
    lineHeight: 1.25 / 1.13,
    fontFamily: F.sans, fontSize, fill: C.cream, ...DECOR,
  })]
}

export function makePie(n: PieNode): FabricObject[] {
  const total = n.slices.reduce((s, v) => s + Math.max(0, v.value), 0)
  if (total <= 0) return []
  const out: FabricObject[] = []
  const size = n.size ?? 22
  let from = 0
  n.slices.forEach((sl, i) => {
    const sweep = (Math.max(0, sl.value) / total) * 360
    if (sweep <= 0) return
    const to = from + sweep
    const a = polar(n.x, n.y, n.r, from)
    const b = polar(n.x, n.y, n.r, to)
    // 180 度を超える扇は large-arc フラグを立てる
    const large = sweep > 180 ? 1 : 0
    out.push(new Path(
      `M ${n.x} ${n.y} L ${a.x} ${a.y} A ${n.r} ${n.r} 0 ${large} 1 ${b.x} ${b.y} Z`,
      { fill: sl.fill ?? SERIES[i % SERIES.length], stroke: C.navyDeep, strokeWidth: 2, ...DECOR },
    ))
    from = to
  })
  // 凡例。扇の外の注記だけだと、扇が細いときにどれがどれか分からない。
  n.slices.forEach((sl, i) => {
    const ly = n.y + n.r + 56 + i * (size * 1.6)
    out.push(new Rect({
      left: n.x - n.r, top: ly, width: size, height: size,
      fill: sl.fill ?? SERIES[i % SERIES.length], ...DECOR,
    }))
    out.push(new FabricText(`${sl.label}  ${sl.value}`, {
      left: n.x - n.r + size * 1.5, top: ly + size / 2, originY: 'center',
      fontFamily: F.sans, fontSize: size * 0.95, fill: C.cream, ...DECOR,
    }))
  })
  return out
}

export function makeBar(n: BarNode): FabricObject[] {
  if (n.max <= 0 || !n.bars.length) return []
  const out: FabricObject[] = []
  const size = n.size ?? 22
  const base = n.y + n.h
  // 目盛は 0 と max を必ず含め、間を 5 等分する
  const steps = 5
  for (let i = 0; i <= steps; i++) {
    const v = (n.max * i) / steps
    const gy = base - (n.h * i) / steps
    out.push(new Line([n.x, gy, n.x + n.w, gy], {
      stroke: i ? C.goldLineFaint : C.goldLine, strokeWidth: i ? 1 : 1.6, ...DECOR,
    }))
    out.push(new FabricText(String(Math.round(v)), {
      left: n.x - 12, top: gy, originX: 'right', originY: 'center',
      fontFamily: F.sans, fontSize: size * 0.85, fill: C.goldDeep, ...DECOR,
    }))
  }
  const slot = n.w / n.bars.length
  const bw = slot * 0.46
  n.bars.forEach((b, i) => {
    const cx = n.x + slot * (i + 0.5)
    const v = Math.max(0, Math.min(n.max, b.value))
    const bh = (n.h * v) / n.max
    // 0 の項目は棒を描かない。数値だけ軸の上に置く。
    if (bh > 0) {
      out.push(new Rect({
        left: cx - bw / 2, top: base - bh, width: bw, height: bh,
        fill: b.fill ?? C.gold, ...DECOR,
      }))
    }
    out.push(new FabricText(String(b.value), {
      left: cx, top: base - bh - size * 0.5, originX: 'center', originY: 'bottom',
      fontFamily: F.serifLatin, fontSize: size * 1.2, fill: C.cream, ...DECOR,
    }))
    out.push(...axisLabel(b.label, cx, base + 10, slot, size))
  })
  return out
}

export function makeLineChart(n: LineChartNode): FabricObject[] {
  if (n.max <= 0 || n.points.length < 2) return []
  const out: FabricObject[] = []
  const size = n.size ?? 22
  const base = n.y + n.h
  const steps = 5
  for (let i = 0; i <= steps; i++) {
    const gy = base - (n.h * i) / steps
    out.push(new Line([n.x, gy, n.x + n.w, gy], {
      stroke: i ? C.goldLineFaint : C.goldLine, strokeWidth: i ? 1 : 1.6, ...DECOR,
    }))
    out.push(new FabricText(String(Math.round((n.max * i) / steps)), {
      left: n.x - 12, top: gy, originX: 'right', originY: 'center',
      fontFamily: F.sans, fontSize: size * 0.85, fill: C.goldDeep, ...DECOR,
    }))
  }
  const slot = n.w / n.points.length
  const at = (i: number, v: number) => ({
    x: n.x + slot * (i + 0.5),
    y: base - (n.h * Math.max(0, Math.min(n.max, v))) / n.max,
  })
  const pts = n.points.map((p, i) => at(i, p.value))
  out.push(new Polyline(pts, {
    fill: 'transparent', stroke: n.stroke ?? C.gold, strokeWidth: 3, ...DECOR,
  }))
  n.points.forEach((p, i) => {
    const q = pts[i]
    out.push(new Circle({
      left: q.x, top: q.y, radius: 7, originX: 'center', originY: 'center',
      fill: C.navyDeep, stroke: n.stroke ?? C.gold, strokeWidth: 3, ...DECOR,
    }))
    out.push(new FabricText(String(p.value), {
      left: q.x, top: q.y - 16, originX: 'center', originY: 'bottom',
      fontFamily: F.serifLatin, fontSize: size * 1.2, fill: C.cream, ...DECOR,
    }))
    out.push(...axisLabel(p.label, q.x, base + 10, slot, size))
  })
  return out
}
