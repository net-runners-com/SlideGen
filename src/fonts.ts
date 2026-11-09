import { SLIDES } from './slides'
import type { Node } from './types'

/**
 * Google Fonts の日本語フォントは unicode-range で 100 以上に分割配信される。
 * document.fonts.ready だけでは「実際に使う字のサブセット」が落ちてこないまま
 * Fabric が描画してしまい、フォールバック書体で焼き付く。
 * そこで全スライドの文字を集め、font-family × weight ごとに
 * document.fonts.load(font, text) を明示的に呼んで必要なサブセットを取り切る。
 */

function collectUsage(): Map<string, Set<string>> {
  const byKey = new Map<string, Set<string>>()
  const add = (font: string, weight: number, text: string) => {
    const key = `${weight} 100px ${font}`
    const set = byKey.get(key) ?? new Set<string>()
    for (const ch of text) set.add(ch)
    byKey.set(key, set)
  }
  const walk = (n: Node) => {
    if (n.kind === 'text') add(n.font, n.weight ?? 400, n.text)
    if (n.kind === 'pagenum') add('"Noto Serif JP"', 500, n.text + n.total)
  }
  for (const s of SLIDES) s.nodes.forEach(walk)
  // 紋章の "C" と、編集で後から打たれ得る基本文字
  add('"Noto Serif JP"', 500, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/.')
  return byKey
}

/** 全スライドが必要とするグリフを読み込み切るまで待つ */
export async function loadSlideFonts(): Promise<void> {
  if (!('fonts' in document)) return
  const jobs: Promise<unknown>[] = []
  for (const [key, chars] of collectUsage()) {
    const text = [...chars].join('')
    // 1 回の load で渡せる文字数には実装上の上限があるため分割する
    for (let i = 0; i < text.length; i += 400) {
      jobs.push(document.fonts.load(key, text.slice(i, i + 400)).catch(() => undefined))
    }
  }
  await Promise.all(jobs)
  await document.fonts.ready
}
