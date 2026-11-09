import { Group, Path, Rect, Circle, Polygon, FabricText, type FabricObject } from 'fabric'
import type { EmblemKind } from '../types'

const DECOR = { selectable: false, evented: false, objectCaching: false } as const

/** 盾の外形（100x110 のローカル座標） */
const SHIELD_D =
  'M50 2 L96 18 L96 54 C96 84 76 100 50 108 C24 100 4 84 4 54 L4 18 Z'

function shieldPath(fill: string, filled = false) {
  return new Path(SHIELD_D, {
    fill: filled ? fill : 'transparent',
    stroke: fill,
    strokeWidth: filled ? 0 : 4,
    ...DECOR,
  })
}

/** イオニア式の柱（表紙の盾の中身） */
function column(fill: string): FabricObject[] {
  return [
    // 渦巻き柱頭
    new Path('M18 26 C18 14 30 10 36 18 C40 24 34 30 28 28 C24 27 24 22 28 21', {
      fill: 'transparent', stroke: fill, strokeWidth: 3.5, ...DECOR,
    }),
    new Path('M82 26 C82 14 70 10 64 18 C60 24 66 30 72 28 C76 27 76 22 72 21', {
      fill: 'transparent', stroke: fill, strokeWidth: 3.5, ...DECOR,
    }),
    new Rect({ left: 16, top: 30, width: 68, height: 7, fill, ...DECOR }),
    // 柱身の溝
    ...[0, 1, 2, 3].map((i) =>
      new Rect({ left: 30 + i * 13, top: 40, width: 5, height: 36, fill, ...DECOR })),
    new Rect({ left: 16, top: 78, width: 68, height: 7, fill, ...DECOR }),
  ]
}

/** 天秤 */
function scales(fill: string): FabricObject[] {
  return [
    new Rect({ left: 48, top: 24, width: 4, height: 50, fill, ...DECOR }),
    new Rect({ left: 22, top: 36, width: 56, height: 3.5, fill, ...DECOR }),
    new Circle({ left: 46, top: 18, radius: 5, fill, ...DECOR }),
    new Path('M14 40 L34 40 L24 56 Z', { fill, ...DECOR }),
    new Path('M66 40 L86 40 L76 56 Z', { fill, ...DECOR }),
    new Rect({ left: 34, top: 74, width: 32, height: 4, fill, ...DECOR }),
  ]
}

/** 棒グラフ（上昇） */
function barchart(fill: string): FabricObject[] {
  return [0, 1, 2].map((i) =>
    new Rect({ left: 28 + i * 18, top: 72 - i * 16, width: 12, height: 16 + i * 16, fill, ...DECOR }))
}

/**
 * 月桂樹の環。中心 (50,55) から見て左右対称に葉を円弧状に並べ、
 * 各葉は中心から外向き＋進行方向へ傾ける。
 */
function laurel(fill: string): FabricObject[] {
  const leaves: FabricObject[] = []
  const CX = 50, CY = 55, R = 47
  const N = 12
  for (const side of [-1, 1]) {
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1)
      const deg = 158 - t * 120          // 下端 → 側面 → 上寄り
      const rad = (deg * Math.PI) / 180
      const r = R * (1 - t * 0.08)
      const x = CX + side * Math.sin(rad) * r
      const y = CY - Math.cos(rad) * r
      // 中心から外へ向く向き。葉のパスは +x 方向へ伸びる。
      const out = (Math.atan2(y - CY, x - CX) * 180) / Math.PI
      leaves.push(new Path('M0 0 C10 -6 22 -4 27 2 C21 9 9 9 0 0 Z', {
        left: x,
        top: y,
        fill,
        scaleX: 0.62,
        scaleY: 0.62,
        angle: out - side * 34,
        flipY: side < 0,
        originX: 'center',
        originY: 'center',
        ...DECOR,
      }))
    }
  }
  return leaves
}

/** 8方向の装飾星（7枚目の罫飾り） */
function snowflake(fill: string): FabricObject[] {
  const out: FabricObject[] = []
  for (let i = 0; i < 4; i++) {
    out.push(new Rect({
      left: 50, top: 50, width: 4, height: i % 2 === 0 ? 72 : 46,
      fill, angle: i * 45, originX: 'center', originY: 'center', ...DECOR,
    }))
  }
  out.push(new Rect({
    left: 50, top: 50, width: 13, height: 13, fill, angle: 45,
    originX: 'center', originY: 'center', ...DECOR,
  }))
  return out
}

/**
 * 紋章を 1 つの Group として返す。x/y は中心、size は一辺の目安。
 */
export function makeEmblem(shape: EmblemKind, x: number, y: number, size: number, fill: string, opacity = 1) {
  let parts: FabricObject[]

  switch (shape) {
    case 'shield':
      parts = [shieldPath(fill), ...column(fill)]
      break
    case 'scales':
      parts = [shieldPath(fill), ...scales(fill), ...laurel(fill)]
      break
    case 'chart':
      parts = [shieldPath(fill), ...barchart(fill), ...laurel(fill)]
      break
    case 'shieldC':
      parts = [
        shieldPath(fill),
        new FabricText('C', {
          left: 50, top: 50, fontSize: 56, fontFamily: '"Noto Serif JP"', fontWeight: 500,
          fill, originX: 'center', originY: 'center', ...DECOR,
        }),
        ...laurel(fill),
      ]
      break
    case 'wreath':
      parts = laurel(fill)
      break
    case 'snowflake':
      parts = snowflake(fill)
      break
    case 'diamond':
      parts = [new Polygon(
        [{ x: 50, y: 20 }, { x: 80, y: 50 }, { x: 50, y: 80 }, { x: 20, y: 50 }],
        { fill, ...DECOR },
      )]
      break
  }

  const g = new Group(parts, { ...DECOR })
  const base = Math.max(g.width || 100, g.height || 100)
  g.scale(size / base)
  g.set({ left: x, top: y, originX: 'center', originY: 'center', opacity })
  return g
}
