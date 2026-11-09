import type { Canvas } from 'fabric'
import { jsPDF } from 'jspdf'
import { SLIDE_H, SLIDE_W } from './theme'

/** 選択枠や編集カーソルを含めずに書き出すため、一旦選択を解除する */
function deselect(canvas: Canvas) {
  canvas.discardActiveObject()
  canvas.renderAll()
}

export function slideToPNG(canvas: Canvas, multiplier = 1): string {
  deselect(canvas)
  return canvas.toDataURL({ format: 'png', multiplier, enableRetinaScaling: false })
}

export function downloadPNG(canvas: Canvas, filename: string, multiplier = 1) {
  const a = document.createElement('a')
  a.href = slideToPNG(canvas, multiplier)
  a.download = filename
  a.click()
}

/** 全スライドの PNG データ URL を 1 つの横長 PDF にまとめる */
export function buildPDF(pngs: string[], filename: string) {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [SLIDE_W, SLIDE_H] })
  pngs.forEach((png, i) => {
    if (i > 0) pdf.addPage([SLIDE_W, SLIDE_H], 'landscape')
    pdf.addImage(png, 'PNG', 0, 0, SLIDE_W, SLIDE_H)
  })
  pdf.save(filename)
}

/* ───────────────────────── SVG 書き出し ───────────────────────── */

const FACES = [
  { file: 'Slide-mincho.otf', family: 'Slide Mincho', weight: '100 900' },
  { file: 'Slide-gothic.otf', family: 'Slide Gothic', weight: '100 500' },
  { file: 'Slide-gothic-bold.otf', family: 'Slide Gothic', weight: '600 900' },
]

let faceCSS: string | null = null

/** 自家製フォントを base64 で SVG に埋め込む。1 度読んだら使い回す。 */
async function embeddedFaces(): Promise<string> {
  if (faceCSS !== null) return faceCSS
  const parts = await Promise.all(FACES.map(async (f) => {
    const buf = await (await fetch(`/fonts/${f.file}`)).arrayBuffer()
    let bin = ''
    const bytes = new Uint8Array(buf)
    for (let i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    }
    return `@font-face{font-family:'${f.family}';font-weight:${f.weight};`
      + `src:url(data:font/otf;base64,${btoa(bin)}) format('opentype');}`
  }))
  faceCSS = parts.join('\n')
  return faceCSS
}

/**
 * キャンバスを SVG にする。文字は <text> のまま残るので、書き出した後でも
 * エディタや Illustrator で文字を打ち替えられる。
 * 自家製フォントは base64 で中に抱えるため、相手の環境にインストールが要らない。
 * ただし自家製フォントに無い字は閲覧側のフォントに委ねられる。
 */
export async function slideToSVG(canvas: Canvas): Promise<string> {
  deselect(canvas)
  const svg = canvas.toSVG()
  const css = await embeddedFaces()
  const defs = `<defs><style type="text/css"><![CDATA[\n${css}\n]]></style></defs>`
  return svg.replace(/(<svg\b[^>]*>)/, `$1\n${defs}`)
}

export async function downloadSVG(canvas: Canvas, filename: string) {
  const blob = new Blob([await slideToSVG(canvas)], { type: 'image/svg+xml' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
