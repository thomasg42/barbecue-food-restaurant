export type CartLine = {
  lineId: string
  itemId: string
  name: string
  qty: number
  note: string
  sauceOnSide: boolean
}

export type TicketStatus = 'open' | 'fired' | 'bumped'

export type Ticket = {
  id: string
  table: string
  lines: CartLine[]
  status: TicketStatus
  createdAt: string
  firedAt: string | null
  bumpedAt: string | null
  paidAt: string | null
  updatedAt: string
}

export type Selection = {
  id: string
  name: string
}

export function lineKey(line: CartLine): string

export function addSelection(
  cart: CartLine[],
  item: Selection,
  input: { note?: string; sauceOnSide?: boolean; id: string },
): CartLine[]

export function cartCount(cart: CartLine[]): number

export function changeQty(cart: CartLine[], lineId: string, delta: number): CartLine[]

export function removeLine(cart: CartLine[], lineId: string): CartLine[]

export function sendToRegister(input: {
  cart: CartLine[]
  table: string
  now: string
  id: string
}): Ticket

export function ringIn(ticket: Ticket, now: string): Ticket

export function markPaid(ticket: Ticket, now: string): Ticket

export function bump(ticket: Ticket, now: string): Ticket

export function recall(ticket: Ticket, now: string): Ticket

export function kitchenQueue(tickets: Ticket[]): Ticket[]

export function openTickets(tickets: Ticket[]): Ticket[]

export function recallTickets(tickets: Ticket[]): Ticket[]

export function mergeTickets(server: Ticket[], local: Ticket[]): Ticket[]

export function ageLabel(from: string | null, now: string): string
