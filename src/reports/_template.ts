import type { Report } from '../report'

/** 新しい案件のひな形。このファイルをコピーして reports/<案件>.ts を作り、
 *  reports/index.ts の import を差し替える。値はすべて差し替え前提の仮置き。
 *
 *  触らなくてよいもの（版面側に残してある）:
 *    2 枚目（緊急度の読み方）、6 枚目（放置した場合の事例）、
 *    7 枚目の手順、8 枚目（評価の前提）。どの案件でも同じ文面。 */
const CRITICAL = 0
const HIGH = 0
const TOTAL = 0
const PLATFORM = 'WordPress'

export const template: Report = {
  client: {
    name: '〇〇株式会社様',
    domain: 'example.com',
    date: '2026年1月1日',
  },
  platform: PLATFORM,
  candidates: { total: TOTAL, critical: CRITICAL, high: HIGH },
  rank: { now: 'C', worst: 'A' },

  // 表紙リード文の1文目。「確認しています。」へ続く形で書く。
  confirmed: '（確認済みの状態を1文で）',

  // 5 枚目の表。現時点スコアと最悪想定スコアはこの合計。表紙にも同じ数字が出る。
  findings: [
    { state: '（見えた状態）', status: '確認済み', now: 0, worst: 0, why: '（なぜ急ぐか）' },
    { state: `重大候補${TOTAL}件`, status: '要確認', now: 0, worst: 0,
      why: `CRITICAL ${CRITICAL}件、HIGH ${HIGH}件。\n確認されれば最優先Aへ上がる` },
  ],

  // 4 枚目 右上。「△ 」は版面側で付く。
  risks: ['（構成上のリスク）'],

  // 4 枚目 構成図。col/row は格子の位置。箱を足しても他は動かさなくてよい。
  diagram: {
    boxes: [
      { id: 'user', text: 'エンドユーザ /\nブラウザ', col: 0, row: 0 },
      { id: 'dns', text: '公開DNS', col: 1, row: 0 },
      { id: 'proxy', text: '（リバースプロキシ）', col: 2, row: 0 },
      { id: 'cdn', text: '（CDN）', col: 1, row: 1 },
      { id: 'cms', text: `${PLATFORM} コア`, col: 3, row: 1 },
      { id: 'db', text: 'データベース', col: 4, row: 1 },
      { id: 'host', text: '（ホスティング基盤）', col: 2, row: 2 },
    ],
    edges: [
      { from: 'user', to: 'dns' },
      { from: 'dns', to: 'proxy' },
      { from: 'cdn', to: 'cms' },
      { from: 'host', to: 'cms' },
      { from: 'cms', to: 'db' },
    ],
  },

  // 4 枚目 下段。2 列 2 段に流すので 4 件を前提にしている。
  signals: [
    { title: '「（危険信号1）」', body: '「（内容）」' },
    { title: '「（危険信号2）」', body: '「（内容）」' },
    { title: '「最重要区分の候補」', body: `「CRITICAL候補${CRITICAL}件。実際に使われているかは未確定」` },
    { title: '「高い危険区分の候補」', body: `「HIGH候補${HIGH}件。実際に使われているかは未確定」` },
  ],
}
