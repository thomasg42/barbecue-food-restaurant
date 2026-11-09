/** @typedef {{
 *   lineId: string,
 *   itemId: string,
 *   name: string,
 *   qty: number,
 *   note: string,
 *   sauceOnSide: boolean,
 * }} CartLine */

/** @typedef {'open' | 'fired' | 'bumped'} TicketStatus */

/** @typedef {{
 *   id: string,
 *   table: string,
 *   lines: CartLine[],
 *   status: TicketStatus,
 *   createdAt: string,
 *   firedAt: string | null,
 *   bumpedAt: string | null,
 *   paidAt: string | null,
 *   updatedAt: string,
 * }} Ticket */

/** @param {CartLine} line */
export function lineKey(line) {
  return `${line.itemId}|${line.note.trim()}|${line.sauceOnSide ? '1' : '0'}`
}

/**
 * @param {CartLine[]} cart
 * @param {{ id: string, name: string }} item
 * @param {{ note?: string, sauceOnSide?: boolean, id: string }} input
 * @returns {CartLine[]}
 */
export function addSelection(cart, item, input) {
  const draft = {
    lineId: input.id,
    itemId: item.id,
    name: item.name,
    qty: 1,
    note: (input.note ?? '').trim(),
    sauceOnSide: Boolean(input.sauceOnSide),
  }
  const key = lineKey(draft)
  const existing = cart.find((line) => lineKey(line) === key)
  if (!existing) return [...cart, draft]
  return cart.map((line) =>
    line.lineId === existing.lineId ? { ...line, qty: line.qty + 1 } : line,
  )
}

/** @param {CartLine[]} cart */
export function cartCount(cart) {
  return cart.reduce((sum, line) => sum + line.qty, 0)
}

/**
 * @param {CartLine[]} cart
 * @param {string} lineId
 * @param {number} delta
 */
export function changeQty(cart, lineId, delta) {
  return cart.flatMap((line) => {
    if (line.lineId !== lineId) return [line]
    const qty = line.qty + delta
    if (qty <= 0) return []
    return [{ ...line, qty }]
  })
}

/** @param {CartLine[]} cart @param {string} lineId */
export function removeLine(cart, lineId) {
  return cart.filter((line) => line.lineId !== lineId)
}

/**
 * @param {{ cart: CartLine[], table: string, now: string, id: string }} input
 * @returns {Ticket}
 */
export function sendToRegister(input) {
  if (input.cart.length === 0) {
    throw new Error('Cart is empty')
  }
  const table = input.table.trim() || 'Walk up'
  return {
    id: input.id,
    table,
    lines: input.cart.map((line) => ({ ...line })),
    status: 'open',
    createdAt: input.now,
    firedAt: null,
    bumpedAt: null,
    paidAt: null,
    updatedAt: input.now,
  }
}

/** @param {Ticket} ticket @param {string} now */
export function ringIn(ticket, now) {
  if (ticket.status !== 'open') return ticket
  return { ...ticket, status: 'fired', firedAt: now, updatedAt: now }
}

/** @param {Ticket} ticket @param {string} now */
export function markPaid(ticket, now) {
  if (ticket.paidAt) return ticket
  return { ...ticket, paidAt: now, updatedAt: now }
}

/** @param {Ticket} ticket @param {string} now */
export function bump(ticket, now) {
  if (ticket.status !== 'fired') return ticket
  return { ...ticket, status: 'bumped', bumpedAt: now, updatedAt: now }
}

/** @param {Ticket} ticket @param {string} now */
export function recall(ticket, now) {
  if (ticket.status !== 'bumped') return ticket
  return { ...ticket, status: 'fired', bumpedAt: null, updatedAt: now }
}

/** @param {Ticket[]} tickets */
export function kitchenQueue(tickets) {
  return tickets
    .filter((ticket) => ticket.status === 'fired')
    .slice()
    .sort((a, b) => {
      const byTime = String(a.firedAt).localeCompare(String(b.firedAt))
      if (byTime !== 0) return byTime
      return a.id.localeCompare(b.id)
    })
}

/** @param {Ticket[]} tickets */
export function openTickets(tickets) {
  return tickets
    .filter((ticket) => ticket.status === 'open')
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
}

/** @param {Ticket[]} tickets */
export function recallTickets(tickets) {
  return tickets
    .filter((ticket) => ticket.status === 'bumped')
    .slice()
    .sort((a, b) => String(b.bumpedAt).localeCompare(String(a.bumpedAt)))
}

/**
 * Newer updatedAt wins. A ticket that exists on only one side is kept.
 * @param {Ticket[]} server
 * @param {Ticket[]} local
 */
export function mergeTickets(server, local) {
  /** @type {Map<string, Ticket>} */
  const map = new Map()
  for (const ticket of server) map.set(ticket.id, ticket)
  for (const ticket of local) {
    const prev = map.get(ticket.id)
    if (!prev || String(ticket.updatedAt) > String(prev.updatedAt)) map.set(ticket.id, ticket)
  }
  return [...map.values()]
}

/** @param {string | null} from @param {string} now */
export function ageLabel(from, now) {
  if (!from) return '0:00'
  const ms = Date.parse(now) - Date.parse(from)
  const sec = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(sec / 60)
  const seconds = sec % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
