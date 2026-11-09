import { scoreNow, scoreWorst } from '../report'
import { R } from '../reports'
import { C, F } from '../theme'
import type { Slide } from '../types'

/** グラフの見本。数値は report.ts から引くので、案件を替えれば図も変わる。
 *  画像生成に描かせると比率が合わないので、図形として描く。 */
export const charts: Slide = {
  id: 'charts',
  extra: true,
  name: '図版 グラフ',
  nodes: [
    { kind: 'frame', variant: 'thin' },
    { kind: 'text', id: 'ch.title', label: 'タイトル', x: 58, y: 34,
      text: '図版サンプル（数値から作図）', font: F.serif, size: 54, weight: 700, fill: C.gold },
    { kind: 'rule', x: 58, y: 126, w: 1930, stroke: C.goldLine, thickness: 2 },

    // ── 円グラフ ──
    { kind: 'text', id: 'ch.t1', x: 340, y: 176, origin: 'center',
      text: '危険度の内訳', font: F.serif, size: 36, weight: 700, fill: C.cream },
    { kind: 'pie', id: 'ch.pie', x: 340, y: 470, r: 180, size: 24,
      slices: [
        { label: 'CRITICAL', value: R.candidates.critical },
        { label: 'HIGH', value: R.candidates.high },
        { label: 'MEDIUM', value: Math.max(0, R.candidates.total - R.candidates.critical - R.candidates.high) },
      ] },
    { kind: 'text', id: 'ch.pieTotal', x: 340, y: 836, origin: 'center',
      text: `合計 ${R.candidates.total}件`, font: F.sans, size: 28, weight: 500, fill: C.goldDeep },

    // ── 棒グラフ ──
    { kind: 'text', id: 'ch.t2', x: 1024, y: 176, origin: 'center',
      text: '項目別スコア', font: F.serif, size: 36, weight: 700, fill: C.cream },
    { kind: 'bar', id: 'ch.bar', x: 800, y: 260, w: 460, h: 460, max: 50, size: 22,
      bars: [
        ...R.findings.map((f) => ({ label: f.state, value: f.worst })),
      ] },

    // ── 折れ線グラフ ──
    { kind: 'text', id: 'ch.t3', x: 1680, y: 176, origin: 'center',
      text: 'スコアの振れ幅', font: F.serif, size: 36, weight: 700, fill: C.cream },
    { kind: 'linechart', id: 'ch.line', x: 1460, y: 260, w: 460, h: 460, max: 100, size: 22,
      points: [
        { label: '現時点', value: scoreNow(R) },
        { label: '最悪想定', value: scoreWorst(R) },
      ] },

    { kind: 'text', id: 'ch.note', label: '注記', x: 1024, y: 880, origin: 'center', w: 1700,
      text: '扇の角度・棒の高さ・点の位置は値から計算している。値が 0 の項目は棒を描かない。',
      font: F.sans, size: 26, weight: 400, fill: C.paperWhite, align: 'center' },
  ],
}
