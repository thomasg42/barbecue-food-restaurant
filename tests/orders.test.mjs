import assert from 'node:assert/strict'
import test from 'node:test'
import {
  addSelection,
  ageLabel,
  bump,
  cartCount,
  changeQty,
  kitchenQueue,
  markPaid,
  mergeTickets,
  openTickets,
  recall,
  recallTickets,
  removeLine,
  ringIn,
  sendToRegister,
} from '../src/orders.mjs'

const chips = { id: 'chips-salsa', name: 'Chips and salsa platter' }
const ribs = { id: 'ribs', name: 'Ribs' }

test('select item adds one, and the same item counts up', () => {
  const once = addSelection([], chips, { id: 'line-1' })
  assert.equal(cartCount(once), 1)
  assert.equal(once.length, 1)
  const twice = addSelection(once, chips, { id: 'line-2' })
  assert.equal(cartCount(twice), 2)
  assert.equal(twice.length, 1)
  assert.equal(twice[0].qty, 2)
})

test('a note or sauce keeps a separate line', () => {
  const plain = addSelection([], ribs, { id: 'line-1' })
  const sided = addSelection(plain, ribs, { id: 'line-2', sauceOnSide: true, note: 'no onion' })
  assert.equal(sided.length, 2)
  assert.equal(cartCount(sided), 2)
  assert.equal(sided[1].sauceOnSide, true)
  assert.equal(sided[1].note, 'no onion')
})

test('quantity can come off the cart', () => {
  const cart = addSelection([], chips, { id: 'line-1' })
  assert.deepEqual(changeQty(cart, 'line-1', -1), [])
  assert.deepEqual(removeLine(cart, 'line-1'), [])
})

test('send, ring in, pay, bump, and recall', () => {
  assert.throws(() => sendToRegister({ cart: [], table: '1', now: 't0', id: 'x' }))
  const cart = addSelection([], chips, { id: 'line-1' })
  const open = sendToRegister({ cart, table: '   ', now: '2026-11-08T20:00:00.000Z', id: 'ticket-1' })
  assert.equal(open.status, 'open')
  assert.equal(open.table, 'Walk up')
  assert.equal(open.paidAt, null)
  assert.equal('price' in open, false)

  const fired = ringIn(open, '2026-11-08T20:01:00.000Z')
  assert.equal(fired.status, 'fired')
  assert.equal(fired.firedAt, '2026-11-08T20:01:00.000Z')

  const paid = markPaid(fired, '2026-11-08T20:02:00.000Z')
  assert.equal(paid.status, 'fired')
  assert.equal(paid.paidAt, '2026-11-08T20:02:00.000Z')
  assert.equal(markPaid(paid, 'later'), paid)

  const bumped = bump(paid, '2026-11-08T20:03:00.000Z')
  assert.equal(bumped.status, 'bumped')
  assert.deepEqual(kitchenQueue([bumped]), [])
  assert.equal(recallTickets([bumped])[0].id, 'ticket-1')

  const back = recall(bumped, '2026-11-08T20:04:00.000Z')
  assert.equal(back.status, 'fired')
  assert.equal(back.firedAt, fired.firedAt)
  assert.equal(back.bumpedAt, null)
})

test('the kitchen shows the oldest fired ticket first', () => {
  const early = ringIn(
    sendToRegister({
      cart: addSelection([], chips, { id: 'a' }),
      table: 'Early',
      now: '2026-11-08T20:00:00.000Z',
      id: 'early',
    }),
    '2026-11-08T20:01:00.000Z',
  )
  const late = ringIn(
    sendToRegister({
      cart: addSelection([], ribs, { id: 'b' }),
      table: 'Late',
      now: '2026-11-08T20:05:00.000Z',
      id: 'late',
    }),
    '2026-11-08T20:06:00.000Z',
  )
  const waiting = sendToRegister({
    cart: addSelection([], chips, { id: 'c' }),
    table: 'Waiting',
    now: '2026-11-08T19:00:00.000Z',
    id: 'waiting',
  })
  assert.deepEqual(
    kitchenQueue([late, waiting, early]).map((ticket) => ticket.id),
    ['early', 'late'],
  )
  assert.deepEqual(openTickets([late, waiting, early]).map((ticket) => ticket.id), ['waiting'])
})

test('a newer ticket wins the merge', () => {
  const older = sendToRegister({
    cart: addSelection([], chips, { id: 'a' }),
    table: '1',
    now: '2026-11-08T20:00:00.000Z',
    id: 'same',
  })
  const newer = ringIn(older, '2026-11-08T20:05:00.000Z')
  assert.equal(mergeTickets([older], [newer])[0].status, 'fired')
  assert.equal(mergeTickets([newer], [older])[0].status, 'fired')
  assert.equal(mergeTickets([], [older])[0].id, 'same')
})

test('the kitchen clock counts up from the fire time', () => {
  assert.equal(ageLabel('2026-11-08T20:00:00.000Z', '2026-11-08T20:02:05.000Z'), '2:05')
  assert.equal(ageLabel(null, '2026-11-08T20:02:05.000Z'), '0:00')
})
