import { renderToStaticMarkup } from 'react-dom/server'
import { CartPanel } from './components/CartPanel.tsx'
import { Dock } from './components/Dock.tsx'
import { ItemSheet } from './components/ItemSheet.tsx'
import { KitchenScreen } from './components/KitchenScreen.tsx'
import { MenuGrid } from './components/MenuGrid.tsx'
import { RegisterScreen } from './components/RegisterScreen.tsx'
import { TopBar } from './components/TopBar.tsx'
import { MENU, itemsIn } from './data/menu.ts'
import {
  addSelection,
  kitchenQueue,
  markPaid,
  openTickets,
  recallTickets,
  ringIn,
  sendToRegister,
} from './orders.mjs'

const chips = MENU[0]
const ribs = MENU.find((item) => item.id === 'ribs')
if (!chips || !ribs) throw new Error('Menu is missing the demo plates')

const cart = addSelection([], chips, { id: 'line-1' })

const openTicket = sendToRegister({
  cart,
  table: 'Patio',
  now: '2026-11-08T20:00:00.000Z',
  id: 'ticket-1',
})
const fired = ringIn(
  sendToRegister({
    cart: addSelection([], ribs, { id: 'line-2', sauceOnSide: true }),
    table: 'Bar',
    now: '2026-11-08T20:01:00.000Z',
    id: 'ticket-2',
  }),
  '2026-11-08T20:02:00.000Z',
)
const paid = markPaid({ ...fired, id: 'ticket-3' }, '2026-11-08T20:03:00.000Z')

export function guestHtml() {
  return renderToStaticMarkup(
    <div>
      <TopBar station="guest" />
      <MenuGrid items={itemsIn('Platters')} category="Platters" onCategory={() => undefined} onOpen={() => undefined} />
      <ItemSheet
        item={chips}
        note=""
        sauce={false}
        onNote={() => undefined}
        onSauce={() => undefined}
        onClose={() => undefined}
        onSelect={() => undefined}
      />
      <ItemSheet
        item={ribs ?? null}
        note=""
        sauce={false}
        onNote={() => undefined}
        onSauce={() => undefined}
        onClose={() => undefined}
        onSelect={() => undefined}
      />
      <CartPanel
        lines={cart}
        table=""
        sent={null}
        onTable={() => undefined}
        onQty={() => undefined}
        onRemove={() => undefined}
        onSend={() => undefined}
      />
      <Dock tab="cart" lines={cart} onTab={() => undefined} />
    </div>,
  )
}

export function registerHtml() {
  return renderToStaticMarkup(
    <RegisterScreen
      open={openTickets([openTicket])}
      fired={kitchenQueue([fired, paid])}
      onRing={() => undefined}
      onPaid={() => undefined}
    />,
  )
}

export function kitchenHtml() {
  return renderToStaticMarkup(
    <KitchenScreen
      fired={kitchenQueue([fired])}
      bumped={recallTickets([])}
      now="2026-11-08T20:04:00.000Z"
      onBump={() => undefined}
      onRecall={() => undefined}
    />,
  )
}
