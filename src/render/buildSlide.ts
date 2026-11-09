import { Canvas, IText, Textbox, type FabricObject } from 'fabric'
import type { ColorResolver } from '../palette'
import type { Node, Slide, TextNode } from '../types'
import { makeEmblem } from './emblems'
import { DECOR } from './common'
import {
  makeArrow, makeBackground, makeBox, makeCard, makeFrame,
  makeGauge, makePageNum, makeRule, makeVRule,
} from './decor'
import { makeBar, makeLineChart, makePie } from './charts'
import { makeFlow } from './flow'
import { makeImage } from './image'
import { C } from '../theme'

/** Fabric オブジェクトに載せる独自プロパティ */
export interface Tagged {
  nodeId?: string
  nodeLabel?: string
}

const ORIGIN_X = { left: 'left', center: 'center', right: 'right' } as const

/** 書体名の差し替え表（役割ごとに別フォントへ振り替えるため） */
export type FontResolver = (family: string) => string

const identity: FontResolver = (f) => f
const keepColor: ColorResolver = (c) => c

/** Fabric は行の高さを fontSize * lineHeight * _fontSizeMult(=1.13) で出す。
 *  仕様の lh は「行ピッチ ÷ 級数」の素直な値にしたいので、ここで割り戻す。 */
const FABRIC_LINE_MULT = 1.13

/** テキストノード → 編集可能な Fabric テキスト */
export function makeText(
  n: TextNode,
  fontOf: FontResolver = identity,
  colorOf: ColorResolver = keepColor,
): FabricObject & Tagged {
  const common = {
    left: n.x,
    top: n.y,
    fontFamily: fontOf(n.font),
    fontSize: n.size,
    fontWeight: n.weight ?? 400,
    fill: colorOf(n.fill, n.id) ?? n.fill,
    textAlign: n.align ?? 'left',
    lineHeight: (n.lh ?? 1.4) / FABRIC_LINE_MULT,
    charSpacing: n.ls ?? 0,
    opacity: n.opacity ?? 1,
    originX: ORIGIN_X[n.origin ?? 'left'],
    originY: n.originY ?? 'top',
    objectCaching: false,
    // 編集中のハンドルは出さない。文字の差し替えだけを許す。
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
    hasControls: false,
    borderColor: '#4C8DFF',
    editingBorderColor: '#4C8DFF',
    padding: 4,
  }

  const obj = n.w
    // 日本語は単語区切りが無いので、字単位で折り返す
    ? new Textbox(n.text, { ...common, width: n.w, splitByGrapheme: true })
    : new IText(n.text, common)

  if (n.locked) {
    obj.set({ selectable: false, evented: false })
  }
  const tagged = obj as FabricObject & Tagged
  tagged.nodeId = n.id
  tagged.nodeLabel = n.label
  return tagged
}

/** 節が持つ色の欄を現在の配色へ引き直す。元の節は書き換えない。 */
function recolor<T extends Node>(n: T, colorOf: ColorResolver): T {
  const id = 'id' in n ? (n as { id?: string }).id : undefined
  const out = { ...n } as T & { fill?: string; stroke?: string }
  if ('fill' in out && out.fill) out.fill = colorOf(out.fill, id)
  if ('stroke' in out && out.stroke) out.stroke = colorOf(out.stroke, id)
  return out
}

/** 1 ノード → Fabric オブジェクト列 */
function build(n: Node, fontOf: FontResolver, colorOf: ColorResolver): FabricObject[] {
  if (n.kind === 'text') return [makeText(n, fontOf, colorOf)]
  const r = recolor(n, colorOf)
  switch (r.kind) {
    case 'rule': return makeRule(r)
    case 'vrule': return makeVRule(r)
    case 'box': return makeBox(r)
    case 'card': return makeCard(r)
    case 'gauge': return makeGauge(r)
    case 'arrow': return makeArrow(r)
    case 'frame': return makeFrame(r)
    case 'pagenum': return makePageNum(r)
    case 'emblem': return [makeEmblem(r.shape, r.x, r.y, r.size, r.fill ?? C.gold, r.opacity ?? 1)]
    case 'image': return makeImage(r)
    case 'flow': return makeFlow(r)
    case 'pie': return makePie(r)
    case 'bar': return makeBar(r)
    case 'linechart': return makeLineChart(r)
  }
}

/**
 * スライド定義をキャンバスへ描き直す。
 * 既存の内容は破棄するので、テキスト編集後は呼ばずに差分更新すること。
 */
export function renderSlide(
  canvas: Canvas,
  slide: Slide,
  fontOf: FontResolver = identity,
  colorOf: ColorResolver = keepColor,
  /** 下書き: 白地に文字だけを置く。画像生成へ渡す版面として使う。 */
  layout = false,
) {
  canvas.remove(...canvas.getObjects())
  if (layout) {
    canvas.backgroundColor = '#FFFFFF'
    const inkOnly: ColorResolver = (c, id) => (id && colorOf(c, id) ? '#111111' : '#111111')
    for (const n of slide.nodes) {
      if (n.kind !== 'text') continue
      for (const o of build(n, fontOf, inkOnly)) canvas.add(o)
    }
    canvas.requestRenderAll()
    return
  }
  canvas.backgroundColor = C.navyDeep
  for (const o of makeBackground()) canvas.add(o)
  for (const n of slide.nodes) {
    for (const o of build(n, fontOf, colorOf)) canvas.add(o)
  }
  canvas.requestRenderAll()
}

/** nodeId からキャンバス上のテキストを引く */
export function findByNodeId(canvas: Canvas, nodeId: string) {
  return canvas.getObjects().find((o) => (o as Tagged).nodeId === nodeId)
}

export { DECOR }
