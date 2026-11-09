import { Rect, FabricText, type FabricObject } from 'fabric'
import { C, F } from '../theme'
import type { FlowNode } from '../types'
import { DECOR } from './common'
import { makeArrow } from './decor'

/* ─────────────────────────── 構成図 ─────────────────────────── */

type Box = { id: string; cx: number; cy: number; w: number; h: number }

/** 中心から dx,dy の向きに出たとき、箱の縁と交わる点。 */
function edgePoint(b: Box, dx: number, dy: number): [number, number] {
  if (dx === 0 && dy === 0) return [b.cx, b.cy]
  const hx = b.w / 2
  const hy = b.h / 2
  // 縦横どちらの辺で出るかは、箱の縦横比と向きの比で決まる
  const t = Math.min(
    Math.abs(dx) > 1e-6 ? hx / Math.abs(dx) : Infinity,
    Math.abs(dy) > 1e-6 ? hy / Math.abs(dy) : Infinity,
  )
  return [b.cx + dx * t, b.cy + dy * t]
}

export function makeFlow(n: FlowNode): FabricObject[] {
  const out: FabricObject[] = []
  const size = n.size ?? 22
  const cw = n.w / Math.max(1, n.cols)
  const ch = n.h / Math.max(1, n.rows)
  const boxes = new Map<string, Box>()

  for (const b of n.boxes) {
    const w = b.w ?? cw * 0.86
    const h = b.h ?? ch * 0.52
    boxes.set(b.id, {
      id: b.id,
      cx: n.x + cw * (b.col + 0.5),
      cy: n.y + ch * (b.row + 0.5),
      w, h,
    })
  }

  // 重なりは自動では避けない。col/row を小数で動かして直す前提なので、
  // 気付けるように知らせる（実際に2度やらかした）。
  const list = [...boxes.values()]
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i]
      const b = list[j]
      if (Math.abs(a.cx - b.cx) < (a.w + b.w) / 2 - 2
        && Math.abs(a.cy - b.cy) < (a.h + b.h) / 2 - 2) {
        console.warn(`[flow] 箱が重なっている: ${a.id} / ${b.id}。col か row を小数でずらす`)
      }
    }
  }

  // 矢印を先に敷いて、箱で端を隠す
  for (const e of n.edges) {
    const a = boxes.get(e.from)
    const b = boxes.get(e.to)
    if (!a || !b) continue
    const dx = b.cx - a.cx
    const dy = b.cy - a.cy
    // ほぼ同じ行・列なら直線、そうでなければ L 字に折る
    const straight = Math.abs(dx) < 8 || Math.abs(dy) < 8
    let pts: [number, number][]
    if (straight) {
      pts = [edgePoint(a, dx, dy), edgePoint(b, -dx, -dy)]
    } else if (Math.abs(dx) >= Math.abs(dy)) {
      // 横に出て、縦に寄せて、横から入る
      const mx = (a.cx + b.cx) / 2
      pts = [edgePoint(a, dx, 0), [mx, a.cy], [mx, b.cy], edgePoint(b, -dx, 0)]
    } else {
      const my = (a.cy + b.cy) / 2
      pts = [edgePoint(a, 0, dy), [a.cx, my], [b.cx, my], edgePoint(b, 0, -dy)]
    }
    out.push(...makeArrow({
      kind: 'arrow', points: pts, dashed: e.dashed, plain: e.plain,
      stroke: n.stroke ?? C.arrowLine,
    }))
    if (e.label) {
      // いちばん長い区間の真ん中に置く。折れ目に置くと経路から外れて見える。
      let best = 0
      let bestLen = -1
      for (let i = 0; i < pts.length - 1; i++) {
        const len = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1])
        if (len > bestLen) { bestLen = len; best = i }
      }
      const [p0, p1] = [pts[best], pts[best + 1]]
      const horizontal = Math.abs(p1[0] - p0[0]) >= Math.abs(p1[1] - p0[1])
      out.push(new FabricText(e.label, {
        left: (p0[0] + p1[0]) / 2 + (horizontal ? 0 : size * 1.6),
        top: (p0[1] + p1[1]) / 2 - (horizontal ? size * 1.1 : 0),
        originX: 'center', originY: 'center',
        fontFamily: F.serifAlt, fontSize: size * 0.95, fill: C.ink, ...DECOR,
      }))
    }
  }

  for (const b of n.boxes) {
    const g = boxes.get(b.id)!
    out.push(new Rect({
      left: g.cx - g.w / 2, top: g.cy - g.h / 2, width: g.w, height: g.h,
      fill: n.fill ?? 'rgba(255,255,255,0.03)',
      stroke: n.stroke ?? C.cardEdge, strokeWidth: 2, ...DECOR,
    }))
    out.push(new FabricText(b.text, {
      left: g.cx, top: g.cy, originX: 'center', originY: 'center',
      width: g.w - 12, textAlign: 'center', lineHeight: 1.3 / 1.13,
      fontFamily: F.serifAlt, fontSize: b.size ?? size, fill: C.ink, ...DECOR,
    }))
  }
  return out
}

/** 図形パーツを貼る。読み込めていなければ何も出さない（版面は崩さない）。 */
