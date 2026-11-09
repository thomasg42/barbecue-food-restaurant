import type { CartLine } from '../orders.mjs'
import { PRICE } from '../data/menu.ts'
import { cartCount } from '../orders.mjs'

export function CartPanel({
  lines,
  table,
  sent,
  onTable,
  onQty,
  onRemove,
  onSend,
}: {
  lines: CartLine[]
  table: string
  sent: string | null
  onTable: (table: string) => void
  onQty: (lineId: string, delta: number) => void
  onRemove: (lineId: string) => void
  onSend: () => void
}) {
  const count = cartCount(lines)
  return (
    <div className="cart">
      <label className="table-field">
        Table or name
        <input
          value={table}
          onChange={(event) => onTable(event.target.value)}
          maxLength={40}
          autoComplete="off"
        />
      </label>
      {lines.length === 0 ? <p className="empty">Nothing selected yet.</p> : null}
      <ul className="cart-lines">
        {lines.map((line) => (
          <li key={line.lineId}>
            <div>
              <strong>{line.name}</strong>
              {line.sauceOnSide ? <span>Sauce on the side</span> : null}
              {line.note ? <span>{line.note}</span> : null}
            </div>
            <div className="qty">
              <button type="button" aria-label={`Remove one ${line.name}`} onClick={() => onQty(line.lineId, -1)}>
                −
              </button>
              <span>{line.qty}</span>
              <button type="button" aria-label={`Add one ${line.name}`} onClick={() => onQty(line.lineId, 1)}>
                +
              </button>
              <button type="button" className="text" onClick={() => onRemove(line.lineId)}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      {sent ? (
        <p className="sent" role="status">
          {sent}
        </p>
      ) : null}
      <button type="button" className="send" disabled={count === 0} onClick={onSend}>
        Send to register
      </button>
      <p className="fine">Price {PRICE}. Nothing is charged here.</p>
    </div>
  )
}
