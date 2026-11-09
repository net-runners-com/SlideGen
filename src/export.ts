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
