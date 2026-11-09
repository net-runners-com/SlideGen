import { toHex, type ColorResolver } from '../palette'
import type { TextNode } from '../types'

export function Inspector({
  nodes, selectedId, onSelect, onChange, fills, onFill, onResetFill, colorOf,
}: {
  nodes: TextNode[]
  selectedId: string | null
  onSelect: (id: string) => void
  onChange: (id: string, text: string) => void
  /** 節ごとの色の上書き。無い節は配色どおり。 */
  fills: Record<string, string>
  onFill: (id: string, color: string) => void
  onResetFill: (id: string) => void
  /** 現在の配色で実際に出る色を引く */
  colorOf: ColorResolver
}) {
  return (
    <aside className="inspector">
      <div className="rail-head">文字と色の差し替え</div>
      {nodes.map((n) => {
        // 上書きは props から直接読む。colorOf 経由だと ref の更新待ちで一手遅れる。
        const shown = fills[n.id] ?? colorOf(n.fill, n.id) ?? n.fill
        return (
          <div
            key={n.id}
            className={`field ${selectedId === n.id ? 'on' : ''}`}
            onFocus={() => onSelect(n.id)}
          >
            <label htmlFor={n.id}>{n.label}</label>
            <textarea
              id={n.id}
              value={n.text}
              rows={Math.min(8, n.text.split('\n').length + 1)}
              spellCheck={false}
              onChange={(e) => onChange(n.id, e.target.value)}
            />
            <div className="row">
              <input
                type="color"
                aria-label={`${n.label} の文字色`}
                value={toHex(shown)}
                onFocus={() => onSelect(n.id)}
                onChange={(e) => onFill(n.id, e.target.value)}
              />
              <code>{shown}</code>
              {fills[n.id] && (
                <button className="ghost" onClick={() => onResetFill(n.id)}>配色に戻す</button>
              )}
            </div>
          </div>
        )
      })}
      {nodes.length === 0 && <p className="empty">このページに編集項目はありません。</p>}
    </aside>
  )
}
