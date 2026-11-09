import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer as createViteServer } from 'vite'

const root = path.dirname(fileURLToPath(import.meta.url))
const ticketsFile = path.join(root, 'data', 'tickets.json')
const indexFile = path.join(root, 'index.html')
const port = 8791

/** @type {Promise<void>} */
let chain = Promise.resolve()

/**
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {Promise<T>}
 */
function exclusive(fn) {
  const run = chain.then(fn, fn)
  chain = run.then(
    () => undefined,
    () => undefined,
  )
  return run
}

/** @returns {Promise<any[]>} */
async function readTickets() {
  try {
    const raw = await readFile(ticketsFile, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed.tickets) ? parsed.tickets : []
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return []
    throw error
  }
}

/** @param {any[]} tickets */
async function writeTickets(tickets) {
  await mkdir(path.dirname(ticketsFile), { recursive: true })
  const tmp = `${ticketsFile}.tmp`
  await writeFile(tmp, JSON.stringify({ tickets }, null, 2))
  await rename(tmp, ticketsFile)
}

/** @param {any} ticket */
function cleanTicket(ticket) {
  if (!ticket || typeof ticket !== 'object') return null
  if (typeof ticket.id !== 'string' || ticket.id.length === 0 || ticket.id.length > 80) return null
  if (typeof ticket.updatedAt !== 'string') return null
  if (!['open', 'fired', 'bumped'].includes(ticket.status)) return null
  if (!Array.isArray(ticket.lines)) return null
  const {
    price: _price,
    total: _total,
    ...rest
  } = ticket
  return rest
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
async function handleApi(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }
  if (req.method === 'GET') {
    const tickets = await readTickets()
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ tickets }))
    return
  }
  if (req.method === 'POST') {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    let body
    try {
      body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
    } catch {
      res.statusCode = 400
      res.end('Bad JSON')
      return
    }
    const incoming = Array.isArray(body.tickets) ? body.tickets : []
    const cleaned = incoming.map(cleanTicket).filter(Boolean)
    const tickets = await exclusive(async () => {
      const current = await readTickets()
      const map = new Map(current.map((ticket) => [ticket.id, ticket]))
      for (const ticket of cleaned) {
        const prev = map.get(ticket.id)
        if (!prev || String(ticket.updatedAt) > String(prev.updatedAt)) map.set(ticket.id, ticket)
      }
      const next = [...map.values()]
      await writeTickets(next)
      return next
    })
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ tickets }))
    return
  }
  res.statusCode = 405
  res.end()
}

function lanUrls() {
  /** @type {string[]} */
  const urls = []
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family === 'IPv4' && !entry.internal) {
        urls.push(`http://${entry.address}:${port}/`)
      }
    }
  }
  return urls
}

/** @param {string} url */
function isAsset(url) {
  const pathname = new URL(url, 'http://127.0.0.1').pathname
  return (
    pathname.startsWith('/src/') ||
    pathname.startsWith('/@') ||
    pathname.startsWith('/node_modules/') ||
    pathname.startsWith('/photos/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  )
}

const server = http.createServer()
const vite = await createViteServer({
  root,
  configFile: path.join(root, 'vite.config.ts'),
  server: {
    middlewareMode: true,
    hmr: { server },
  },
  appType: 'custom',
})

server.on('request', (req, res) => {
  const url = req.url || '/'
  const pathname = new URL(url, 'http://127.0.0.1').pathname
  if (pathname === '/api/tickets') {
    handleApi(req, res).catch((error) => {
      res.statusCode = 500
      res.end(error instanceof Error ? error.message : 'Ticket save failed')
    })
    return
  }
  if (req.method === 'GET' && !isAsset(url)) {
    readFile(indexFile, 'utf8')
      .then((template) => vite.transformIndexHtml(url, template))
      .then((html) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        res.end(html)
      })
      .catch((error) => {
        vite.ssrFixStacktrace(error)
        res.statusCode = 500
        res.end(error instanceof Error ? error.message : 'Page failed')
      })
    return
  }
  vite.middlewares(req, res, () => {
    res.statusCode = 404
    res.end('Not found')
  })
})

server.listen(port, '0.0.0.0', () => {
  console.log(`Barbecue demo`)
  console.log(`Menu     http://127.0.0.1:${port}/`)
  console.log(`Register http://127.0.0.1:${port}/register`)
  console.log(`Kitchen  http://127.0.0.1:${port}/kitchen`)
  for (const url of lanUrls()) console.log(`On Wi-Fi ${url}`)
})
