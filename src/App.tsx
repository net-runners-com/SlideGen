import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, type FabricObject } from 'fabric'
import { SLIDES } from './slides'
import { SLIDE_H, SLIDE_W, C, FONT_CHOICES } from './theme'
import type { Slide, TextNode } from './types'
import { findByNodeId, renderSlide, type Tagged } from './render/buildSlide'
import { loadSlideFonts } from './fonts'
import { loadParts } from './parts'
import { buildPDF, downloadPNG, downloadSVG, slideToPNG } from './export'
import { useTheme, type FontRoles } from './useTheme'
import { Inspector } from './components/Inspector'
import { Toolbar } from './components/Toolbar'

/** 構造を壊さない深いコピー（JSON で十分な素直なデータのみ） */
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

export default function App() {
  const elRef = useRef<HTMLCanvasElement>(null)
  const canvasRef = useRef<Canvas | null>(null)
  const [ready, setReady] = useState(false)
  const [slides, setSlides] = useState<Slide[]>(() => clone(SLIDES))
  // #2 のようなハッシュで初期ページを指定できる（検証・スクリーンショット用）
  const [index, setIndex] = useState(() => {
    const n = Number(location.hash.slice(1))
    return Number.isInteger(n) && n >= 1 && n <= SLIDES.length ? n - 1 : 0
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  /** ?layout=1 で白地に文字だけの下書きを出す。画像生成へ渡す版面を作るため。 */
  const layout = new URLSearchParams(location.search).has('layout')

  const slide = slides[index]
  const { roles, setRoles, picks, setPicks, fills, setFill, clearFill, fontOf, colorOf } =
    useTheme(canvasRef)
  const resolver = fontOf

  /* ── キャンバス生成 & フォント読み込み ─────────────────── */
  useEffect(() => {
    if (!elRef.current) return
    const c = new Canvas(elRef.current, {
      width: SLIDE_W,
      height: SLIDE_H,
      backgroundColor: C.navyDeep,
      selection: false,
      preserveObjectStacking: true,
    })
    canvasRef.current = c

    // キャンバス上で直接編集された内容を state へ戻す
    const sync = (e: { target?: FabricObject }) => {
      const t = e.target as (FabricObject & Tagged) | undefined
      const id = t?.nodeId
      if (!id) return
      const text = (t as unknown as { text: string }).text
      setSlides((prev) => prev.map((s, i) => (i !== indexRef.current ? s : {
        ...s,
        nodes: s.nodes.map((n) => (n.kind === 'text' && n.id === id ? { ...n, text } : n)),
      })))
    }
    c.on('text:changed', sync)
    c.on('selection:created', (e) => setSelectedId(((e.selected?.[0]) as Tagged)?.nodeId ?? null))
    c.on('selection:updated', (e) => setSelectedId(((e.selected?.[0]) as Tagged)?.nodeId ?? null))
    c.on('selection:cleared', () => setSelectedId(null))

    Promise.all([loadSlideFonts(), loadParts()]).then(() => setReady(true))
    return () => { c.dispose(); canvasRef.current = null }
  }, [])

  useEffect(() => {
    const onHash = () => {
      const n = Number(location.hash.slice(1))
      if (Number.isInteger(n) && n >= 1 && n <= SLIDES.length) setIndex(n - 1)
    }
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  // sync コールバックから最新の index を読むための参照
  const indexRef = useRef(index)
  useEffect(() => { indexRef.current = index }, [index])

  /* ── スライド / 書体が変わったら描き直す ────────────────── */
  useEffect(() => {
    if (!ready || !canvasRef.current) return
    renderSlide(canvasRef.current, slide, resolver, colorOf, layout)
    setSelectedId(null)
  }, [ready, index, resolver, slide, colorOf, layout])

  /* ── テキスト差し替え ───────────────────────────────── */
  const setText = useCallback((nodeId: string, text: string) => {
    setSlides((prev) => prev.map((s, i) => (i !== index ? s : {
      ...s,
      nodes: s.nodes.map((n) => (n.kind === 'text' && n.id === nodeId ? { ...n, text } : n)),
    })))
    const c = canvasRef.current
    const obj = c && findByNodeId(c, nodeId)
    if (c && obj) {
      obj.set({ text } as Partial<FabricObject>)
      c.requestRenderAll()
    }
  }, [index])

  /** 上書きを外して配色どおりに戻す。 */
  const resetFill = useCallback((nodeId: string) => {
    clearFill(nodeId, () => {
      const c = canvasRef.current
      if (c) renderSlide(c, slides[indexRef.current], resolver, colorOf, layout)
    })
  }, [clearFill, slides, resolver, colorOf, layout])

  /* ── 書き出し ───────────────────────────────────────── */
  const exportPNG = useCallback(() => {
    if (canvasRef.current) downloadPNG(canvasRef.current, `${slide.id}.png`)
  }, [slide.id])

  const exportSVG = useCallback(async () => {
    const c = canvasRef.current
    if (!c) return
    setBusy('SVG を書き出し中…')
    try {
      await downloadSVG(c, `${slide.id}.svg`)
    } finally {
      setBusy(null)
    }
  }, [slide.id])

  const exportAll = useCallback(async () => {
    const c = canvasRef.current
    if (!c) return
    setBusy('全ページを書き出し中…')
    const pngs: string[] = []
    // 見本ページは本編ではないので書き出さない
    for (const s of slides.filter((x) => !x.extra)) {
      renderSlide(c, s, resolver, colorOf)
      // フォント適用後のレイアウトが確定するまで 1 フレーム待つ
      await new Promise((r) => requestAnimationFrame(r))
      pngs.push(slideToPNG(c))
    }
    renderSlide(c, slide, resolver, colorOf)
    buildPDF(pngs, 'slides.pdf')
    setBusy(null)
  }, [slides, resolver, slide, colorOf])

  const textNodes = slide.nodes.filter(
    (n): n is TextNode => n.kind === 'text' && !!n.label,
  )

  return (
    <div className="app">
      <aside className="rail">
        <div className="rail-head">スライド</div>
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={`rail-item ${i === index ? 'on' : ''}`}
            onClick={() => setIndex(i)}
          >
            {s.name}{s.extra ? '（見本）' : ''}
          </button>
        ))}
      </aside>

      <main className="stage">
        <Toolbar
          roles={roles}
          onRoles={setRoles}
          picks={picks}
          onPicks={setPicks}
          choices={FONT_CHOICES}
          onExportPNG={exportPNG}
          onExportSVG={exportSVG}
          onExportAll={exportAll}
          busy={busy}
        />
        <div className="canvas-wrap">
          <div className="canvas-fit">
            <canvas ref={elRef} />
          </div>
          {!ready && <div className="loading">フォント読み込み中…</div>}
        </div>
        <p className="hint">
          キャンバス上の文字をダブルクリックすると、その場で直接書き換えられます。
        </p>
      </main>

      <Inspector
        nodes={textNodes}
        selectedId={selectedId}
        onSelect={(id) => {
          const c = canvasRef.current
          const obj = c && findByNodeId(c, id)
          if (c && obj) { c.setActiveObject(obj); c.requestRenderAll() }
          setSelectedId(id)
        }}
        onChange={setText}
        fills={fills}
        onFill={setFill}
        onResetFill={resetFill}
        colorOf={colorOf}
      />
    </div>
  )
}
