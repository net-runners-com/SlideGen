// ヘッドレス Chrome を CDP で直接操作し、各スライドのキャンバスを原寸 PNG で取り出す。
// スクリーンショットの切り抜きではなく toDataURL の結果そのものなので、書き出し経路の検証も兼ねる。
import { writeFileSync } from 'node:fs'

const PORT = 9333
const base = `http://127.0.0.1:${PORT}`

const pageList = async () => (await fetch(`${base}/json/list`)).json()

let targets = await pageList()
let page = targets.find((t) => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))

let id = 0
const pending = new Map()
ws.onmessage = (e) => {
  const m = JSON.parse(e.data)
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
}
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })) })

const evalJS = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails))
  return r.result?.result?.value
}

await send('Page.enable')
await send('Runtime.enable')
// 同一 URL でハッシュだけ変えると再読込されずモジュールが古いままになるので毎回クエリを変える
await send('Page.navigate', { url: `http://localhost:5173/?t=${Date.now()}#1` })
await new Promise((r) => setTimeout(r, 9000))

// フォント読み込み完了を待つ
const ready = await evalJS(`document.fonts.ready.then(()=>document.querySelector('canvas.lower-canvas')!=null)`)
console.log('canvas present:', ready)

for (let n = 1; n <= 8; n++) {
  await evalJS(`location.hash='#${n}'`)
  await new Promise((r) => setTimeout(r, 1400))
  const data = await evalJS(`
    (() => {
      const c = document.querySelector('canvas.lower-canvas')
      return c ? c.toDataURL('image/png') : null
    })()`)
  if (!data) { console.log(`slide ${n}: NO CANVAS`); continue }
  const buf = Buffer.from(data.split(',')[1], 'base64')
  writeFileSync(`r${n}.png`, buf)
  console.log(`slide ${n}: ${buf.length} bytes`)
}
ws.close()
