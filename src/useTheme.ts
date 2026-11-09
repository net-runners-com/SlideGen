import { useCallback, useMemo, useRef, useState } from 'react'
import type { Canvas, FabricObject } from 'fabric'
import { findByNodeId } from './render/buildSlide'
import {
  applyPalette, DEFAULT_PICKS, makeColorResolver, type ColorResolver, type Picks,
} from './palette'
import { F } from './theme'

/** 役割ごとの書体。ここを差し替えると全スライドの字面が変わる。 */
export type FontRoles = {
  serif: string
  serifAlt: string
  serifLatin: string
  sans: string
  mono: string
}

const DEFAULT_ROLES: FontRoles = {
  serif: F.serif,
  serifAlt: F.serifAlt,
  serifLatin: F.serifLatin,
  sans: F.sans,
  mono: F.mono,
}

/** 元の family 名 → 現在の family 名 */
function makeFontResolver(roles: FontRoles) {
  const table: Record<string, string> = {
    [F.serif]: roles.serif,
    [F.serifAlt]: roles.serifAlt,
    [F.serifLatin]: roles.serifLatin,
    [F.sans]: roles.sans,
    [F.sansAlt]: roles.sans,
    [F.mono]: roles.mono,
  }
  return (f: string) => table[f] ?? f
}

/**
 * 書体・配色・要素ごとの色の上書きをまとめて持つ。
 *
 * 色の上書きを ref にも持つのは、配色を変えたときの再描画が
 * state の反映より先に走って上書きが消えるのを防ぐため。
 * ref は setFills と**同時に**書き換える（effect で遅らせると実際に消えた）。
 */
export function useTheme(canvasRef: { current: Canvas | null }) {
  const [roles, setRoles] = useState<FontRoles>(DEFAULT_ROLES)
  const [picks, setPicks] = useState<Picks>(DEFAULT_PICKS)
  const [fills, setFills] = useState<Record<string, string>>({})
  const fillsRef = useRef(fills)

  const fontOf = useMemo(() => makeFontResolver(roles), [roles])

  // applyPalette は theme.ts の C を書き換える。decor/charts は描画時に C を読むので、
  // 再描画より前にここで確定させておく必要がある。
  const palette = useMemo(() => applyPalette(picks), [picks])

  const colorOf = useMemo<ColorResolver>(() => {
    const base = makeColorResolver(palette)
    return (color, nodeId) => {
      const own = nodeId ? fillsRef.current[nodeId] : undefined
      return own ?? base(color, nodeId)
    }
  }, [palette])

  /** 選択中の要素だけ色を変える。再描画せずその場で塗り替える。 */
  const setFill = useCallback((nodeId: string, color: string) => {
    fillsRef.current = { ...fillsRef.current, [nodeId]: color }
    setFills(fillsRef.current)
    const c = canvasRef.current
    const obj = c && findByNodeId(c, nodeId)
    if (c && obj) {
      obj.set({ fill: color } as Partial<FabricObject>)
      c.requestRenderAll()
    }
  }, [canvasRef])

  /** 上書きを外す。配色どおりに戻すには組み直しが要る。 */
  const clearFill = useCallback((nodeId: string, redraw: () => void) => {
    const next = { ...fillsRef.current }
    delete next[nodeId]
    fillsRef.current = next
    setFills(next)
    redraw()
  }, [])

  return { roles, setRoles, picks, setPicks, fills, setFill, clearFill, fontOf, colorOf, palette }
}
