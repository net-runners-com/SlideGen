import { C, F } from '../theme'
import type { Node, Slide } from '../types'

const INK = '#1E1810'

/** 事例カード：見出し＋「起こることの例」「民事上のリスク」の2段 */
function caseCard(
  key: string, x: number, y: number, w: number, h: number,
  title: string, example: string, risk: string, split4 = 0.56,
): Node[] {
  const split = y + h * split4
  const labX = x + 30
  const bodyX = x + 220
  return [
    { kind: 'card', x, y, w, h, variant: 'ornate' },
    { kind: 'text', id: `${key}.t`, label: '事例 見出し', x: x + w / 2, y: y + 22, origin: 'center',
      text: title, font: F.serif, size: 40, weight: 700, fill: INK },
    { kind: 'rule', x: x + 26, y: y + 92, w: w - 52, stroke: 'rgba(120,95,60,0.4)' },
    { kind: 'vrule', x: x + 198, y: y + 102, h: h - 128, stroke: 'rgba(120,95,60,0.4)', thickness: 2 },

    { kind: 'text', id: `${key}.l1`, x: labX, y: (y + 92 + split) / 2, originY: 'center',
      text: '起こることの例', font: F.serif, size: 22, weight: 500, fill: '#8A6A3C' },
    { kind: 'text', id: `${key}.b1`, label: '起こることの例', x: bodyX, y: (y + 92 + split) / 2, originY: 'center', w: w - 250,
      text: example, font: F.sans, size: 26, weight: 400, lh: 1.46, fill: INK },

    { kind: 'rule', x: x + 26, y: split, w: w - 52, stroke: 'rgba(120,95,60,0.4)' },
    { kind: 'text', id: `${key}.l2`, x: labX, y: (split + y + h - 20) / 2, originY: 'center',
      text: '民事上のリスク', font: F.serif, size: 22, weight: 500, fill: '#8A6A3C' },
    { kind: 'text', id: `${key}.b2`, label: '民事上のリスク', x: bodyX, y: (split + y + h - 20) / 2, originY: 'center', w: w - 250,
      text: risk, font: F.sans, size: 26, weight: 400, lh: 1.46, fill: INK },
  ]
}

/** 6枚目：放置すれば実際に起きていること */
export const s6: Slide = {
  id: 's6',
  name: '06 放置した場合',
  nodes: [
    { kind: 'frame', variant: 'thin' },
    { kind: 'text', id: 's6.title', label: 'タイトル', x: 45, y: 32,
      text: '放置すれば実際に起きていること', font: F.serif, size: 74, weight: 700, fill: C.gold },
    { kind: 'text', id: 's6.sub', label: 'サブ', x: 45, y: 132,
      text: '企業規模を問わず、民事上の責任を負う可能性があります', font: F.serif, size: 36, weight: 500, fill: C.cream },

    ...caseCard('s6.a', 45, 225, 952, 360, '問い合わせ情報が犯人側へ流れる',
      '問い合わせフォームの送信先URLだけが改ざんされ、\n外見は変わらないまま動き続ける事例。入力された\n顧客情報が犯人側へ直接送られる。',
      '顧客が誤振込などの実損を受けた場合、送信元として\n損害賠償を求められることがある。情報保護条例違反\nに問われた事例も報告されています。'),

    ...caseCard('s6.b', 1024, 225, 955, 360, '偽の問い合わせページが設置される',
      '本物のフォームと同じ見た目の偽ページが併設され、\n相談者が気づかぬまま犯人側へ情報を送る事例。',
      '流出した個人情報の被害者ごとに個別対応が必要になる。\n対応費用と信用回復のため公表コストが発生する。'),

    ...caseCard('s6.c', 45, 607, 952, 368, '御社名の偽メールが届く',
      'SPF・DKIM・DMARCが未設定のドメインから、取引先に\n「御社名」を語るメールが届く事例。振込先変更や\n添付ファイル付きで誤振込やマルウェア感染が起きる。',
      '取引先が実損を受けた場合、なりすましを許した運営者\nとして損害賠償責任を問われる可能性がある。'),

    ...caseCard('s6.d', 1024, 607, 955, 368, '自社サイトが踏み台にされる',
      '自社サイトの脆弱性が悪用され、取引先大手企業のシステム\nへの侵入経路やフィッシング攻撃のばら撒き発信元として\n使われる事例。中小企業は監視が手薄なため攻撃側にとって\n都合の良い経由地になりやすい。',
      '被害を受けた取引先から損害賠償を求められることがある。\n社内に侵入されていた場合のフォレンジック調査費用、\n公的報告対応コストが発生する。', 0.64),

    { kind: 'text', id: 's6.note', label: '結びの一文', x: 1000, y: 1052, origin: 'center',
      text: '実際の中小企業サイトでも、放置中に上記4件は並行で発生しています。',
      font: F.serif, size: 36, weight: 500, fill: C.cream },

    { kind: 'pagenum', id: 's6.page', text: '06', total: '/ 08', variant: 'boxed', size: 78 },
  ],
}
