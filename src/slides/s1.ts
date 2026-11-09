import { headline, lead, scoreNow, scoreWorst } from '../report'

import { R } from '../reports'
import { C, F } from '../theme'
import type { Slide } from '../types'

/**
 * 表紙：大見出し＋2系統のスコア（確認済み / 最悪想定）
 * 座標・級数は元画像 pg-000.png の字面バウンディングボックス実測に合わせてある。
 * 例）見出し2行目は 16 字で 1436px → 1字 89.8px なので size 90。
 */
/** スコアの級数。元画像の「85」は字面 92x72px で、Noto Serif JP の
 *  ライニング数字（キャップハイト約 0.71em）だと 101 にあたる。
 *  元の数字はこれより 2 割ほど幅が詰まっているので、右端を分母の手前に
 *  固定して逃がす。3 桁になると左のラベルに当たるので級数を落とす。 */
const scoreSize = (v: number) => (String(v).length >= 3 ? 86 : 101)

export const s1: Slide = {
  id: 's1',
  name: '01 表紙',
  nodes: [
    { kind: 'frame', variant: 'cover' },
    { kind: 'emblem', shape: 'shield', x: 1775, y: 300, size: 400, fill: C.gold, opacity: 0.13 },
    { kind: 'emblem', shape: 'wreath', x: 1775, y: 400, size: 450, fill: C.gold, opacity: 0.16 },

    { kind: 'text', id: 's1.eyebrow', label: 'アイブロウ', x: 100, y: 92,
      text: 'CUSTOMER SECURITY REVIEW', font: F.sans, size: 26, weight: 500, ls: 270, fill: C.goldDeep },

    { kind: 'text', id: 's1.subtitle', label: 'サブタイトル', x: 98, y: 136,
      text: '顧客向け セキュリティー診断レポート｜経営判断版', font: F.sans, size: 39, weight: 700, fill: C.cream },

    { kind: 'text', id: 's1.headline', label: '大見出し', x: 94, y: 216, w: 1820,
      text: headline(R),
      font: F.serif, size: 90, weight: 700, lh: 1.48, fill: C.cream },

    { kind: 'text', id: 's1.lead', label: 'リード文', x: 93, y: 489, w: 1460,
      text: lead(R),
      font: F.sans, size: 36, weight: 300, lh: 1.33, fill: C.paperWhite },

    // ── 左：確認済みの状態 ───────────────────────────────
    { kind: 'text', id: 's1.bigLeft', label: '大文字（左）', x: 258, y: 816, origin: 'center', originY: 'center',
      text: R.rank.now, font: F.serifLatin, size: 340, weight: 500, fill: C.crimson },

    { kind: 'text', id: 's1.leftTitle', label: '左ラベル', x: 438, y: 666,
      text: '確認済みの状態', font: F.sans, size: 38, weight: 700, fill: C.crimsonSoft },
    { kind: 'rule', x: 438, y: 726, w: 302, stroke: C.goldLine },
    { kind: 'text', id: 's1.leftK1', label: '左 項目1', x: 441, y: 752,
      text: '緊急度', font: F.sans, size: 37, weight: 400, fill: C.cream },
    { kind: 'text', id: 's1.leftV1', label: '左 値1', x: 630, y: 736,
      text: R.rank.now, font: F.serifLatin, size: 70, weight: 500, fill: C.crimson },
    { kind: 'rule', x: 438, y: 817, w: 302, stroke: C.goldLine },
    { kind: 'text', id: 's1.leftK2', label: '左 項目2', x: 439, y: 843,
      text: '危険度スコア', font: F.sans, size: 25, weight: 700, fill: C.goldDeep },
    { kind: 'text', id: 's1.leftV2', label: '左 スコア', x: 734, y: 890, origin: 'right', originY: 'center',
      text: String(scoreNow(R)), font: F.serifLatin, size: scoreSize(scoreNow(R)), weight: 500, fill: C.crimson },
    { kind: 'text', id: 's1.leftV2u', label: '左 分母', x: 744, y: 846,
      text: '/ 100', font: F.serifLatin, size: 54, weight: 400, fill: C.cream },

    // ── 中央の仕切り ────────────────────────────────────
    { kind: 'vrule', x: 983, y: 680, h: 254, stroke: C.goldLineFaint },
    { kind: 'emblem', shape: 'diamond', x: 983, y: 671, size: 22, fill: C.gold, opacity: 0.85 },
    { kind: 'emblem', shape: 'diamond', x: 983, y: 942, size: 22, fill: C.gold, opacity: 0.85 },

    // ── 右：未確認が事実だった場合 ──────────────────────
    { kind: 'text', id: 's1.bigRight', label: '大文字（右）', x: 1182, y: 816, origin: 'center', originY: 'center',
      text: R.rank.worst, font: F.serifLatin, size: 340, weight: 500, fill: C.gold },

    { kind: 'text', id: 's1.rightTitle', label: '右ラベル', x: 1468, y: 670,
      text: '未確認が事実だった場合', font: F.sans, size: 33, weight: 700, fill: C.gold },
    { kind: 'rule', x: 1468, y: 726, w: 360, stroke: C.goldLine },
    { kind: 'text', id: 's1.rightK1', label: '右 項目1', x: 1483, y: 752,
      text: '緊急度', font: F.sans, size: 37, weight: 400, fill: C.cream },
    { kind: 'text', id: 's1.rightV1', label: '右 値1', x: 1672, y: 736,
      text: R.rank.worst, font: F.serifLatin, size: 70, weight: 500, fill: C.gold },
    { kind: 'rule', x: 1468, y: 817, w: 360, stroke: C.goldLine },
    { kind: 'text', id: 's1.rightK2', label: '右 項目2', x: 1481, y: 843,
      text: '危険度スコア', font: F.sans, size: 25, weight: 700, fill: C.goldDeep },
    { kind: 'text', id: 's1.rightV2', label: '右 スコア', x: 1740, y: 890, origin: 'right', originY: 'center',
      text: String(scoreWorst(R)), font: F.serifLatin, size: scoreSize(scoreWorst(R)), weight: 500, fill: C.gold },
    { kind: 'text', id: 's1.rightV2u', label: '右 分母', x: 1786, y: 846,
      text: '/ 100', font: F.serifLatin, size: 54, weight: 400, fill: C.cream },

    // ── フッター（3行、行送り 33.5px の実測に合わせる） ──
    { kind: 'text', id: 's1.fk1', x: 137, y: 975, text: '対　象:', font: F.sans, size: 26, weight: 400, fill: C.cream },
    { kind: 'text', id: 's1.fv1', label: '対象', x: 267, y: 975, text: R.client.name, font: F.sans, size: 26, weight: 400, fill: C.cream },
    { kind: 'text', id: 's1.fk2', x: 137, y: 1011, text: 'ドメイン:', font: F.sans, size: 26, weight: 400, fill: C.cream },
    { kind: 'text', id: 's1.fv2', label: 'ドメイン', x: 267, y: 1011, text: R.client.domain, font: F.mono, size: 26, weight: 400, fill: C.cream },
    { kind: 'text', id: 's1.fk3', x: 137, y: 1047, text: '実施日:', font: F.sans, size: 26, weight: 400, fill: C.cream },
    { kind: 'text', id: 's1.fv3', label: '実施日', x: 267, y: 1047, text: R.client.date, font: F.sans, size: 26, weight: 400, fill: C.cream },

    { kind: 'pagenum', id: 's1.page', text: '01', total: '/ 08', variant: 'plain' },
  ],
}
