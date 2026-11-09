import { bullets, cards, diagram, statement } from '../../layout'
import { R } from '../../reports'
import type { Slide } from '../../types'

/** レイアウトテンプレートの見本。
 *  座標を書かずに、型とデータだけでページを組めることを示す。 */
export const templateDemo: Slide[] = [
  statement(
    { id: 'tpl-statement', name: 'T1 一文', extra: true },
    {
      text: '未確認だから安全とは扱えません。',
      note: '中扉や締めのページ。大きな一文だけを置く。',
    },
  ),

  bullets(
    { id: 'tpl-bullets', name: 'T2 箇条書き', extra: true },
    {
      title: '正式確認で決めること',
      sub: '見出し＋箇条書き。項目数で行送りが決まる',
      items: [
        '要確認の候補のうち、実際に使われているものは何か',
        'サイト改ざんや偽ページ掲載につながる入口を、どの順番で止めるか',
        `現在の${R.platform}運用を継続できるか、公開方式を変えるべきか`,
      ],
    },
  ),

  cards(
    { id: 'tpl-cards', name: 'T3 カード', extra: true },
    {
      title: '放置した場合に起きること',
      sub: 'カードは 1〜4 枚。枚数で段組が決まる',
      cards: [
        { title: '問い合わせ情報が流れる', body: '送信先URLだけが改ざんされ、外見は変わらないまま動き続ける。入力された顧客情報が犯人側へ直接送られる。' },
        { title: '偽ページが設置される', body: '本物と同じ見た目の偽ページが併設され、相談者が気づかぬまま情報を送る。' },
        { title: '御社名の偽メールが届く', body: 'SPF・DKIM・DMARCが未設定だと、取引先に御社名を騙るメールが届く。' },
        { title: '踏み台にされる', body: '脆弱性が悪用され、取引先への侵入経路やフィッシングの発信元として使われる。' },
      ],
    },
  ),

  diagram(
    { id: 'tpl-diagram', name: 'T4 構成図', extra: true },
    {
      title: '外部から読み取れた公開構成',
      sub: '箱は格子の列・行。矢印は箱の縁どうしを自動で結ぶ',
      boxes: R.diagram.boxes,
      edges: R.diagram.edges,
      note: '箱を足しても他の箱を手で動かさなくてよい。重なったら console に出る。',
    },
  ),
]
