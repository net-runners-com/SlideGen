import { R } from '../reports'
import { C, F } from '../theme'
import type { Node, Slide } from '../types'

const INK = '#2A2118'
const LINE = 'rgba(150,118,74,0.9)'

/** 図版の箱（枠＋中央寄せテキスト） */
function dbox(id: string, x: number, y: number, w: number, h: number, text: string, size = 22): Node[] {
  return [
    { kind: 'box', x, y, w, h, fill: 'rgba(255,255,255,0.03)', stroke: LINE, thickness: 2 },
    { kind: 'text', id, x: x + w / 2, y: y + h / 2, origin: 'center', originY: 'center', w: w - 10,
      text, font: F.serifAlt, size, weight: 400, lh: 1.3, fill: INK, align: 'center' },
  ]
}

/** 危険信号の1項目（番号・縦罫・見出し・本文で1行分） */
function signal(key: string, n: string, x: number, y: number, w: number, head: string, body: string): Node[] {
  return [
    { kind: 'text', id: `${key}.n`, x: x + 34, y: y + 2, origin: 'center',
      text: n, font: F.serifLatin, size: 52, weight: 400, fill: 'rgba(160,126,80,0.95)' },
    { kind: 'vrule', x: x + 72, y: y + 2, h: 74, stroke: 'rgba(120,95,60,0.45)', thickness: 2 },
    { kind: 'text', id: `${key}.h`, label: `危険信号${n} 見出し`, x: x + 94, y: y + 4,
      text: head, font: F.serifAlt, size: 26, weight: 700, fill: INK },
    { kind: 'text', id: `${key}.b`, label: `危険信号${n} 本文`, x: x + 94, y: y + 42, w: w - 100,
      text: body, font: F.serifAlt, size: 23, weight: 400, lh: 1.35, fill: INK },
  ]
}

/** 4枚目：外部から読み取れた公開構成 */
export const s4: Slide = {
  id: 's4',
  name: '04 公開構成図',
  nodes: [
    { kind: 'frame', variant: 'none' },

    { kind: 'text', id: 's4.title', label: 'タイトル', x: 42, y: 34,
      text: '外部から読み取れた公開構成', font: F.serif, size: 54, weight: 700, fill: C.cream },
    { kind: 'text', id: 's4.sub', label: 'サブ', x: 44, y: 108,
      text: '図は元の診断資料より再構成', font: F.sans, size: 26, weight: 300, fill: C.paperWhite },

    // ── 図版カード ───────────────────────────────────────
    { kind: 'card', x: 63, y: 166, w: 1924, h: 496, variant: 'plain' },
    { kind: 'box', x: 90, y: 182, w: 1010, h: 462, stroke: 'rgba(150,118,74,0.35)', thickness: 2 },
    { kind: 'box', x: 1112, y: 182, w: 858, h: 462, stroke: 'rgba(150,118,74,0.35)', thickness: 2 },
    { kind: 'text', id: 's4.zone1', label: 'ゾーン名1', x: 345, y: 198,
      text: 'Edge / ネットワーク', font: F.serifAlt, size: 27, weight: 500, fill: '#8A6A3C' },
    { kind: 'text', id: 's4.zone2', label: 'ゾーン名2', x: 1360, y: 198,
      text: 'アプリケーション層', font: F.serifAlt, size: 27, weight: 500, fill: '#8A6A3C' },

    // 構成図。箱の位置は reports/ の col/row、矢印は箱の縁どうしを自動で結ぶ。
    {
      kind: 'flow', id: 's4.flow',
      x: 100, y: 190, w: 1850, h: 455,
      cols: 5, rows: 3, size: 22,
      boxes: R.diagram.boxes,
      edges: R.diagram.edges,
    },

    // ── 右上：検出リスク（図版カードの上に重ねる） ──────
    { kind: 'box', x: 1657, y: 30, w: 352, h: 284, fill: '#5C1B18', stroke: 'rgba(194,162,121,0.5)', thickness: 2 },
    { kind: 'text', id: 's4.riskT', label: 'リスク見出し', x: 1833, y: 44, origin: 'center',
      text: '検出された構成上リスク', font: F.serifAlt, size: 26, weight: 700, fill: C.cream },
    { kind: 'text', id: 's4.riskB', label: 'リスク一覧', x: 1676, y: 86, w: 322,
      text: R.risks.map((t) => `△ ${t}`).join('\n'),
      font: F.serifAlt, size: 24, weight: 400, lh: 1.3, fill: C.paper },

    { kind: 'card', x: 63, y: 668, w: 1924, h: 54, variant: 'plain' },
    { kind: 'text', id: 's4.cap', label: '図の注記', x: 1025, y: 681, origin: 'center',
      text: '元の診断資料にある構成図です。外部から見える経路と、今回優先して確認すべき箇所を示しています。内部の設定や保存情報まで確認できた図ではありません。',
      font: F.serifAlt, size: 25, weight: 400, fill: INK },

    // ── 危険信号 ─────────────────────────────────────────
    { kind: 'card', x: 63, y: 736, w: 1924, h: 240, variant: 'plain' },
    { kind: 'box', x: 63, y: 736, w: 1924, h: 48, fill: '#2A2118' },
    { kind: 'text', id: 's4.sigT', label: '危険信号 見出し', x: 86, y: 746,
      text: 'この構成から読み取れる危険信号', font: F.serifAlt, size: 29, weight: 700, fill: C.gold },
    { kind: 'vrule', x: 1030, y: 790, h: 178, stroke: 'rgba(120,95,60,0.4)', thickness: 2 },
    { kind: 'rule', x: 86, y: 882, w: 1878, stroke: 'rgba(120,95,60,0.4)' },

    // 2 列 2 段。左上・右上・左下・右下の順に流す。
    ...R.signals.flatMap((sig, i) => signal(
      `s4.s${i + 1}`, String(i + 1),
      i % 2 ? 1060 : 86, i < 2 ? 798 : 892, 930,
      sig.title, sig.body,
    )),

    // ── 読み方 ───────────────────────────────────────────
    { kind: 'card', x: 63, y: 986, w: 1924, h: 142, variant: 'plain' },
    { kind: 'text', id: 's4.readT', label: '読み方 見出し', x: 86, y: 998,
      text: '構成図の読み方', font: F.serifAlt, size: 31, weight: 700, fill: INK },
    { kind: 'text', id: 's4.readB', label: '読み方 本文', x: 86, y: 1046, w: 1700,
      text: '外から見える入口が一つあるだけで直ちに侵入されたとは断定しません。ただし、管理用の入口、更新が必要な仕組み、\n公開してはいけない情報が重なるほど、攻撃者は次に試す場所を絞り込みやすくなります。',
      font: F.serifAlt, size: 25, weight: 400, lh: 1.4, fill: INK },

    { kind: 'pagenum', id: 's4.page', text: '04', total: '/ 08', variant: 'plain', size: 54 },
  ],
}
