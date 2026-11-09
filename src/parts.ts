/** 画像生成に作らせた図形パーツ（public/parts/*.png）を先に読み込んでおく。
 *
 *  Fabric の画像読み込みは非同期だが、描画側は同期で組み立てている。
 *  フォントと同じく、キャンバスを作る前に一度だけ読み、以後はキャッシュから引く。 */

const cache = new Map<string, HTMLImageElement>()

/** public/parts に置いたパーツ名。tools/parts.py の出力と対応する。 */
export const PART_NAMES = [
  'bracket-tl', 'scale', 'marker', 'bars',
  'target', 'hatch', 'arrow-turn', 'dotgrid',
  'bracket-br', 'rules', 'squares', 'ring',
] as const

export type PartName = (typeof PART_NAMES)[number]

export function loadParts(names: readonly string[] = PART_NAMES): Promise<void> {
  return Promise.all(names.map((n) => new Promise<void>((done) => {
    const el = new Image()
    // 読めなくても描画は続ける。足りないパーツは単に出ない。
    el.onload = () => { cache.set(n, el); done() }
    el.onerror = () => done()
    el.src = `/parts/${n}.png`
  }))).then(() => undefined)
}

export const getPart = (name: string) => cache.get(name)
