import type { Ticket } from './orders.mjs'
import { mergeTickets } from './orders.mjs'

const TICKETS_KEY = 'bbq-order-tickets-v1'
const OUTBOX_KEY = 'bbq-order-outbox-v1'
const CART_KEY = 'bbq-order-cart-v1'

export type CartState = {
  table: string
  lines: Ticket['lines']
}

export const EMPTY_CART: CartState = { table: '', lines: [] }

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function loadCart(): CartState {
  const cart = readJson<CartState>(CART_KEY, EMPTY_CART)
  if (!cart || !Array.isArray(cart.lines)) return EMPTY_CART
  return { table: typeof cart.table === 'string' ? cart.table : '', lines: cart.lines }
}

export function saveCart(cart: CartState) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart))
  } catch {
    // The cart still lives in memory for this visit.
  }
}

export function loadTickets(): Ticket[] {
  const tickets = readJson<Ticket[]>(TICKETS_KEY, [])
  return Array.isArray(tickets) ? tickets : []
}

function saveTickets(tickets: Ticket[]) {
  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets))
  window.dispatchEvent(new Event('bbq-tickets'))
}

function loadOutbox(): Ticket[] {
  const tickets = readJson<Ticket[]>(OUTBOX_KEY, [])
  return Array.isArray(tickets) ? tickets : []
}

function saveOutbox(tickets: Ticket[]) {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(tickets))
}

let retryTimer: number | null = null

function ensureRetry() {
  if (retryTimer != null) return
  retryTimer = window.setInterval(() => {
    void flushOutbox().then((state) => {
      if (state === 'saved' && loadOutbox().length === 0 && retryTimer != null) {
        window.clearInterval(retryTimer)
        retryTimer = null
      }
    })
  }, 2000)
}

export async function publishTicket(ticket: Ticket): Promise<'saved' | 'waiting'> {
  const tickets = mergeTickets(loadTickets(), [ticket])
  saveTickets(tickets)
  const outbox = mergeTickets(loadOutbox(), [ticket])
  saveOutbox(outbox)
  const state = await flushOutbox()
  if (state === 'waiting') ensureRetry()
  return state
}

export async function flushOutbox(): Promise<'saved' | 'waiting'> {
  const pending = loadOutbox()
  if (pending.length === 0) return 'saved'
  try {
    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets: pending }),
    })
    if (!response.ok) return 'waiting'
    const body = (await response.json()) as { tickets?: Ticket[] }
    const serverTickets = Array.isArray(body.tickets) ? body.tickets : []
    const stillPending = loadOutbox().filter(
      (ticket) => !pending.some((sent) => sent.id === ticket.id && sent.updatedAt === ticket.updatedAt),
    )
    saveOutbox(stillPending)
    saveTickets(mergeTickets(serverTickets, stillPending))
    return stillPending.length === 0 ? 'saved' : 'waiting'
  } catch {
    return 'waiting'
  }
}

export async function pullTickets(): Promise<Ticket[]> {
  const response = await fetch('/api/tickets', { cache: 'no-store' })
  if (!response.ok) throw new Error('Ticket read failed')
  const body = (await response.json()) as { tickets?: Ticket[] }
  const serverTickets = Array.isArray(body.tickets) ? body.tickets : []
  const pending = loadOutbox()
  const merged = mergeTickets(serverTickets, pending)
  saveTickets(merged)
  return merged
}
