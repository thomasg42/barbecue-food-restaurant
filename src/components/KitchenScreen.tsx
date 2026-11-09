import type { Ticket } from '../orders.mjs'
import { ageLabel } from '../orders.mjs'

function tone(from: string | null, now: string) {
  if (!from) return ''
  const minutes = (Date.parse(now) - Date.parse(from)) / 60000
  if (minutes >= 10) return 'age-hot'
  if (minutes >= 5) return 'age-warm'
  return ''
}

function Lines({ ticket }: { ticket: Ticket }) {
  return (
    <ul className="ticket-lines big">
      {ticket.lines.map((line) => (
        <li key={line.lineId}>
          <b>{line.qty}</b>
          <span>
            {line.name}
            {line.sauceOnSide ? <small>Sauce on the side</small> : null}
            {line.note ? <small>{line.note}</small> : null}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function KitchenScreen({
  fired,
  bumped,
  now,
  onBump,
  onRecall,
}: {
  fired: Ticket[]
  bumped: Ticket[]
  now: string
  onBump: (ticket: Ticket) => void
  onRecall: (ticket: Ticket) => void
}) {
  return (
    <div className="board kitchen">
      <section>
        <h2>Fired</h2>
        {fired.length === 0 ? <p className="empty">Nothing fired.</p> : null}
        <div className="ticket-grid">
          {fired.map((ticket) => (
            <article key={ticket.id} className={`ticket ${tone(ticket.firedAt, now)}`}>
              <header>
                <h3>{ticket.table}</h3>
                <time dateTime={ticket.firedAt ?? undefined}>{ageLabel(ticket.firedAt, now)}</time>
              </header>
              <Lines ticket={ticket} />
              <button type="button" className="primary" onClick={() => onBump(ticket)}>
                Bump
              </button>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>Bumped</h2>
        {bumped.length === 0 ? <p className="empty">Nothing to recall.</p> : null}
        <div className="ticket-grid">
          {bumped.map((ticket) => (
            <article key={ticket.id} className="ticket quiet">
              <header>
                <h3>{ticket.table}</h3>
              </header>
              <Lines ticket={ticket} />
              <button type="button" className="primary" onClick={() => onRecall(ticket)}>
                Recall
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
