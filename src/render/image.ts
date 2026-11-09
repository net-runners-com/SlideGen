import { FabricImage, type FabricObject } from 'fabric'
import { getPart } from '../parts'
import type { ImageNode } from '../types'
import { DECOR } from './common'

export function makeImage(n: ImageNode): FabricObject[] {
  const el = getPart(n.src)
  if (!el) return []
  const ratio = el.naturalHeight / el.naturalWidth || 1
  const w = n.w ?? (n.h ? n.h / ratio : el.naturalWidth)
  const h = n.h ?? w * ratio
  return [new FabricImage(el, {
    left: n.x, top: n.y, scaleX: w / el.naturalWidth, scaleY: h / el.naturalHeight,
    originX: n.origin ?? 'left', originY: n.originY ?? 'top',
    opacity: n.opacity ?? 1, ...DECOR,
  })]
}
