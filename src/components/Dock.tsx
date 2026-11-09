import { cartCount } from '../orders.mjs'
import type { CartLine } from '../orders.mjs'
import { PRICE } from '../data/menu.ts'

export function Dock({
  tab,
  lines,
  onTab,
}: {
  tab: 'menu' | 'cart'
  lines: CartLine[]
  onTab: (tab: 'menu' | 'cart') => void
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
      <nav className="dock" aria-label="Menu and cart">
        <button type="button" className={tab === 'menu' ? 'on' : ''} aria-current={tab === 'menu' ? 'page' : undefined} onClick={() => onTab('menu')}>
          Menu
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
