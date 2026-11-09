/** 診断レポート1本ぶんの中身。
 *
 *  版面（座標・級数・飾り）は slides/ に、案件ごとに変わる値はここに置く。
 *  新しい案件は reports/ に 1 ファイル足して reports/index.ts の REPORT を差し替える。
 *
 *  スコアは findings から合計する。表紙と5枚目の表に同じ数字を二度書くと、
 *  片方だけ直して食い違う。 */

/** 5枚目の表の1行。表紙のスコアはこの合計。 */
export interface Finding {
  /** 今回見えた状態 */
  state: string
  /** 確認状況。'確認済み' は現時点のスコアに入り、'要確認' は最悪想定にだけ入る。 */
  status: '確認済み' | '要確認'
  /** 現時点の点 */
  now: number
  /** 事実だった場合の点 */
  worst: number
  /** なぜ急ぐか */
  why: string
}

/** 4枚目の構成図。格子の列・行で置き、画素座標は描画側が出す。
 *  箱を足しても他の箱を手で動かさなくてよい。 */
export interface Diagram {
  boxes: { id: string; text: string; col: number; row: number; h?: number; size?: number }[]
  edges: { from: string; to: string; label?: string; dashed?: boolean; plain?: boolean }[]
}

export interface Report {
  client: {
    /** 「様」まで含めた宛名 */
    name: string
    domain: string
    /** 実施日。和暦にしないこと（元の版面に合わせる） */
    date: string
  }
  /** 「WordPress本体や追加プラグイン」のように本文へ差し込む基盤の名前 */
  platform: string
  candidates: {
    /** 重大候補の総数。表紙の見出しに出る */
    total: number
    critical: number
    high: number
  }
  rank: {
    /** 確認済みの事実だけで付けた区分 */
    now: string
    /** 未確認が事実だった場合の区分 */
    worst: string
  }
  /** 表紙リード文の1文目。確認済みの状態を 1 文で言う。 */
  confirmed: string
  findings: Finding[]
  /** 4枚目の右上「検出された構成上リスク」 */
  risks: string[]
  /** 4枚目の構成図 */
  diagram: Diagram
  /** 4枚目の下段「この構成から読み取れる危険信号」 */
  signals: { title: string; body: string }[]
}

/* ── 導出 ───────────────────────────────────────────── */

export const scoreNow = (r: Report) => r.findings.reduce((s, f) => s + f.now, 0)
export const scoreWorst = (r: Report) => r.findings.reduce((s, f) => s + f.worst, 0)

/** 表紙の大見出し。件数だけが案件ごとに変わる。 */
export const headline = (r: Report) =>
  `${r.candidates.total}件の重大候補を、\n未確認だから安全とは扱えません。`

/** 表紙のリード文。確認済みの状態 → 候補の内訳、の順。 */
export const lead = (r: Report) =>
  `${r.confirmed}\n確認しています。加えて、${r.platform}本体や追加プラグインに、\n`
  + `CRITICAL候補${r.candidates.critical}件、HIGH候補${r.candidates.high}件が見えています。`
