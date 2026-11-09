import type { FontRoles } from '../useTheme'
import { DEFAULT_PICKS, GROUPS, same, toHex, type Picks } from '../palette'

const ROLE_LABEL: Record<keyof FontRoles, string> = {
  serif: '見出し（明朝）',
  serifAlt: '図版・表（明朝）',
  serifLatin: '数字・欧文（明朝）',
  sans: '本文（ゴシック）',
  mono: 'ドメイン（等幅）',
}

export function Toolbar({
  roles, onRoles, picks, onPicks, choices, onExportPNG, onExportAll, busy,
}: {
  roles: FontRoles
  onRoles: (r: FontRoles) => void
  picks: Picks
  onPicks: (p: Picks) => void
  choices: readonly string[]
  onExportPNG: () => void
  onExportAll: () => void
  busy: string | null
}) {
  const changed = GROUPS.some((g) => !same(picks[g.key], DEFAULT_PICKS[g.key]))
  return (
    <div className="toolbar">
      <div className="fonts">
        {(Object.keys(ROLE_LABEL) as (keyof FontRoles)[]).map((k) => (
          <label key={k} className="font-pick">
            <span>{ROLE_LABEL[k]}</span>
            <select
              value={roles[k].replace(/"/g, '')}
              onChange={(e) => onRoles({ ...roles, [k]: `"${e.target.value}"` })}
            >
              {choices.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        ))}
      </div>

      <div className="colors">
        {GROUPS.map((g) => (
          <label key={g.key} className="color-pick" title={`${g.label}（濃淡や罫も一緒に動きます）`}>
            <input
              type="color"
              value={toHex(picks[g.key])}
              onChange={(e) => onPicks({ ...picks, [g.key]: e.target.value })}
            />
            <span>{g.label}</span>
          </label>
        ))}
        <button className="ghost" onClick={() => onPicks(DEFAULT_PICKS)} disabled={!changed}>
          配色を戻す
        </button>
      </div>

      <div className="actions">
        {busy && <span className="busy">{busy}</span>}
        <button onClick={onExportPNG} disabled={!!busy}>このページを PNG</button>
        <button onClick={onExportAll} disabled={!!busy}>全8ページを PDF</button>
      </div>
    </div>
  )
}
