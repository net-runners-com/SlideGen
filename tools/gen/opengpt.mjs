// opengpt CLI の薄い包み。画像を 1 枚作って保存するだけ。
//
// CLI の場所は OPENGPT_DIR で差し替えられる。アカウントは --account で選ぶ。
// 無料プランには画像生成の回数制限があり、上限に当たると本文だけが返る
// （そのときは画像が保存されないので、戻り値の配列が空になる）。
import { execFile } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { promisify } from 'node:util'

const run = promisify(execFile)

const CLI = process.env.OPENGPT_DIR
  ?? `${process.env.HOME}/.superset/projects/opengpt`
const AUTH = process.env.OPENGPT_AUTH_DIR
  ?? `${process.env.HOME}/.claude/plugins/data/opengpt-skills-dir/auth`

/** 画像を 1 枚作って outDir に保存し、保存されたファイル名を返す。 */
export async function generate({ prompt, outDir, account = 'me', size = '1024x1024', session }) {
  const args = [
    'cli.mjs', 'chat', '--account', account, '--daemon', '--new',
    '--session', session ?? `gen-${Date.now()}`,
    '--size', size, '--save-images', outDir, prompt,
  ]
  const before = new Set(safeList(outDir))
  const { stdout } = await run('node', args, {
    cwd: CLI,
    env: { ...process.env, OPENGPT_AUTH_DIR: AUTH },
    maxBuffer: 1 << 24,
    timeout: 9 * 60 * 1000,
  })
  const made = safeList(outDir).filter((f) => !before.has(f))
  if (!made.length) console.error(stdout.trim().slice(0, 400))
  return made
}

function safeList(dir) {
  try { return readdirSync(dir) } catch { return [] }
}
