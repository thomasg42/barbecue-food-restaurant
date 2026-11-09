import { useEffect, useState } from 'react'
import { CartPanel } from './components/CartPanel.tsx'
import { Dock } from './components/Dock.tsx'
import type { GuestTab } from './components/Dock.tsx'
import { ItemSheet } from './components/ItemSheet.tsx'
import { StoryPanel } from './components/StoryPanel.tsx'
import { KitchenScreen } from './components/KitchenScreen.tsx'
import { MenuGrid } from './components/MenuGrid.tsx'
import { RegisterScreen } from './components/RegisterScreen.tsx'
import { TopBar } from './components/TopBar.tsx'
import type { Category } from './data/menu.ts'
import { MENU, itemsIn } from './data/menu.ts'
import type { Ticket } from './orders.mjs'
import {
  addSelection,
  bump,
  changeQty,
  kitchenQueue,
  markPaid,
  openTickets,
  recall,
  recallTickets,
  removeLine,
  ringIn,
  sendToRegister,
} from './orders.mjs'
import { stationFromPath } from './station.ts'
import type { CartState } from './storage.ts'
import { loadCart, publishTicket, saveCart } from './storage.ts'
import { useTickets } from './useTickets.ts'

function linkCopy(link: 'saved' | 'waiting') {
  return link === 'saved' ? 'Saved on this Mac' : 'Saved on this phone'
}

function GuestApp() {
  const [tab, setTab] = useState<GuestTab>('menu')
  const [category, setCategory] = useState<Category>('Plates')
  const [cart, setCart] = useState<CartState>(() => loadCart())
  const [openId, setOpenId] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [sauce, setSauce] = useState(false)
  const [sent, setSent] = useState<string | null>(null)
  const item = MENU.find((entry) => entry.id === openId) ?? null

  useEffect(() => {
    saveCart(cart)
  }, [cart])

  function openItem(id: string) {
    setOpenId(id)
    setNote('')
    setSauce(false)
  }

  function selectItem() {
    if (!item) return
    setCart((prev) => ({
      ...prev,
      lines: addSelection(prev.lines, item, {
        note,
        sauceOnSide: item.sauce && sauce,
        id: crypto.randomUUID(),
      }),
    }))
    setOpenId(null)
  }

  async function send() {
    const ticket = sendToRegister({
      cart: cart.lines,
      table: cart.table,
      now: new Date().toISOString(),
      id: crypto.randomUUID(),
    })
    const state = await publishTicket(ticket)
    setCart((prev) => ({ ...prev, lines: [] }))
    setSent(
      state === 'saved'
        ? 'Sent to the register. Saved on this Mac.'
        : 'Sent to the register. Saved on this phone.',
    )
  }

  return (
    <div className="guest-app">
      <TopBar station="guest" />
      <main>
        {tab === 'menu' ? (
          <MenuGrid
            items={itemsIn(category)}
            category={category}
            onCategory={setCategory}
            onOpen={openItem}
          />
        ) : tab === 'story' ? (
          <StoryPanel />
        ) : (
          <CartPanel
            lines={cart.lines}
            table={cart.table}
            sent={sent}
            onTable={(table) => setCart((prev) => ({ ...prev, table }))}
            onQty={(lineId, delta) =>
              setCart((prev) => ({ ...prev, lines: changeQty(prev.lines, lineId, delta) }))
            }
            onRemove={(lineId) =>
              setCart((prev) => ({ ...prev, lines: removeLine(prev.lines, lineId) }))
            }
            onSend={() => {
              void send()
            }}
          />
        )}
      </main>
      <Dock tab={tab} lines={cart.lines} onTab={setTab} />
      <ItemSheet
        item={item}
        note={note}
        sauce={sauce}
        onNote={setNote}
        onSauce={setSauce}
        onClose={() => setOpenId(null)}
        onSelect={selectItem}
      />
    </div>
  )
}

function RegisterApp() {
  const { tickets, link } = useTickets()

  function commit(ticket: Ticket) {
    void publishTicket(ticket)
  }

  return (
    <div className="station-app">
      <TopBar station="register" link={linkCopy(link)} />
      <main>
        <RegisterScreen
          open={openTickets(tickets)}
          fired={kitchenQueue(tickets)}
          onRing={(ticket) => commit(ringIn(ticket, new Date().toISOString()))}
          onPaid={(ticket) => commit(markPaid(ticket, new Date().toISOString()))}
        />
      </main>
    </div>
  )
}

function KitchenApp() {
  const { tickets, link } = useTickets()
  const [now, setNow] = useState(() => new Date().toISOString())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date().toISOString()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  function commit(ticket: Ticket) {
    void publishTicket(ticket)
  }

  return (
    <div className="station-app">
      <TopBar station="kitchen" link={linkCopy(link)} />
      <main>
        <KitchenScreen
          fired={kitchenQueue(tickets)}
          bumped={recallTickets(tickets)}
          now={now}
          onBump={(ticket) => commit(bump(ticket, new Date().toISOString()))}
          onRecall={(ticket) => commit(recall(ticket, new Date().toISOString()))}
        />
      </main>
    </div>
  )
}

export default function App() {
  const station = stationFromPath(window.location.pathname)
  if (station === 'register') return <RegisterApp />
  if (station === 'kitchen') return <KitchenApp />
  return <GuestApp />
}
