import { cartCount } from '../orders.mjs'
import type { CartLine } from '../orders.mjs'
import { PRICE } from '../data/menu.ts'

export type GuestTab = 'menu' | 'story' | 'cart'

export function Dock({
  tab,
  lines,
  onTab,
}: {
  tab: GuestTab
  lines: CartLine[]
  onTab: (tab: GuestTab) => void
}) {
  const count = cartCount(lines)
  return (
    <>
      {tab === 'cart' ? (
        <div className="cart-strip">
          <span>
            {count} {count === 1 ? 'item' : 'items'}
          </span>
          <span>
            Price <b>{PRICE}</b>
          </span>
        </div>
      ) : null}
      <nav className="dock" aria-label="Menu, Corey, and cart">
        <button type="button" className={tab === 'menu' ? 'on' : ''} aria-current={tab === 'menu' ? 'page' : undefined} onClick={() => onTab('menu')}>
          Menu
        </button>
        <button type="button" className={tab === 'story' ? 'on' : ''} aria-label="Corey story" aria-current={tab === 'story' ? 'page' : undefined} onClick={() => onTab('story')}>
          Corey
        </button>
        <button type="button" className={tab === 'cart' ? 'on' : ''} aria-current={tab === 'cart' ? 'page' : undefined} onClick={() => onTab('cart')}>
          Cart
          <span className="badge">{count}</span>
          <span className="sr">{count === 1 ? '1 item' : `${count} items`}</span>
        </button>
      </nav>
    </>
  )
}
