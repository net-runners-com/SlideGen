import type { Report } from '../report'

/** 社会保険労務士法人オフィスなべ様（2026年10月）
 *
 *  件数はここで1度だけ決めて、本文へは差し込む。
 *  表紙・構成図・表の3か所に同じ数字が出るので、直書きすると必ず食い違う。 */
const CRITICAL = 7
const HIGH = 41
const TOTAL = 48
const PLATFORM = 'WordPress'

export const officeNabe: Report = {
  client: {
    name: '社会保険労務士法人オフィスなべ様',
    domain: 'www.office-nabe.com',
    date: '2026年10月24日',
  },
  platform: PLATFORM,
  candidates: { total: TOTAL, critical: CRITICAL, high: HIGH },
  rank: { now: 'C', worst: 'A' },

  confirmed: '通常の閲覧には不要な古い連携用入口と、御社名を使う偽メールを止めにくい状態を',

  findings: [
    {
      state: '古い連携用入口の公開',
      status: '確認済み',
      now: 20, worst: 20,
      why: '不正利用を試される対象になる',
    },
    {
      state: '偽メール対策の不足',
      status: '確認済み',
      now: 15, worst: 15,
      why: '取引先を狙う偽装に使われ得る',
    },
    {
      state: `重大候補${TOTAL}件`,
      status: '要確認',
      now: 0, worst: 50,
      why: `CRITICAL ${CRITICAL}件、HIGH ${HIGH}件。\n確認されれば最優先Aへ上がる`,
    },
  ],

  risks: [
    'CDN なし',
    'HSTS 未設定',
    'DMARC 不備',
    'DNSSEC なし',
    'クラウド公開',
    '旧仕様の WP プラグイン多数',
  ],

  // 構成図。col/row は格子の位置。高さは行数に合わせて指定する。
  diagram: {
    boxes: [
      { id: 'user', text: 'エンドユーザ /\nブラウザ', col: 0, row: 0 },
      { id: 'dns', text: '公開DNS /\nDMARC未設定', col: 1, row: 0 },
      { id: 'proxy', text: 'Nginx / リバースプロキシ\nHTTP/2・TLSv1.2 以上', col: 2, row: 0, size: 21 },
      { id: 'plugins', text: 'CMS拡張プラグイン群\n（SEO・分析系）', col: 4, row: 0.55 },
      { id: 'cdn', text: 'クラウドストレージ\n（CDN）', col: 1, row: 1 },
      { id: 'cms', text: `${PLATFORM} コア /\nコーポレートテーマ\n＋ 多数の追加プラグイン`, col: 3, row: 1, h: 140, size: 21 },
      { id: 'db', text: 'データベース\nコンテンツ・\nユーザー・\n設定情報', col: 4, row: 1.35, h: 130, size: 21 },
      { id: 'host', text: 'Webホスティング基盤', col: 2, row: 2 },
    ],
    edges: [
      { from: 'user', to: 'dns', label: '名前解決' },
      { from: 'dns', to: 'proxy', label: 'HTTPS' },
      { from: 'cdn', to: 'dns' },
      { from: 'cdn', to: 'cms', label: '資産配信' },
      { from: 'host', to: 'cms', label: 'PHP 実行' },
      { from: 'cms', to: 'plugins', dashed: true, plain: true },
      { from: 'cms', to: 'db', label: 'SQL' },
    ],
  },

  signals: [
    { title: '「古い連携用の入口」', body: '「連帯の閲覧者には不要な、サイト管理と連携する入口へ外部から到達可能」' },
    { title: '「偽メール対策」', body: '「なりすましメールを受信側で拒否する設定を確認できない状態」' },
    { title: '「最重要区分の候補」', body: `「CRITICAL候補${CRITICAL}件。実際に使われているかは未確定」` },
    { title: '「高い危険区分の候補」', body: `「HIGH候補${HIGH}件。実際に使われているかは未確定」` },
  ],
}
