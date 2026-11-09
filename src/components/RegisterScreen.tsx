import type { Ticket } from '../orders.mjs'

function when(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function Lines({ ticket }: { ticket: Ticket }) {
  return (
    <ul className="ticket-lines">
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

export function RegisterScreen({
  open,
  fired,
  onRing,
  onPaid,
}: {
  open: Ticket[]
  fired: Ticket[]
  onRing: (ticket: Ticket) => void
  onPaid: (ticket: Ticket) => void
}) {
  return (
    <div className="board">
      <section>
        <h2>Waiting to ring</h2>
        {open.length === 0 ? <p className="empty">No orders waiting.</p> : null}
        <div className="ticket-grid">
          {open.map((ticket) => (
            <article key={ticket.id} className="ticket">
              <header>
                <h3>{ticket.table}</h3>
                <time dateTime={ticket.createdAt}>{when(ticket.createdAt)}</time>
              </header>
              <Lines ticket={ticket} />
              <button type="button" className="primary" onClick={() => onRing(ticket)}>
                Ring in
              </button>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h2>On the kitchen</h2>
        {fired.length === 0 ? <p className="empty">Nothing fired yet.</p> : null}
        <div className="ticket-grid">
          {fired.map((ticket) => (
            <article key={ticket.id} className="ticket">
              <header>
                <h3>{ticket.table}</h3>
                <time dateTime={ticket.firedAt ?? ticket.createdAt}>{when(ticket.firedAt ?? ticket.createdAt)}</time>
              </header>
              <Lines ticket={ticket} />
              {ticket.paidAt ? (
                <p className="paid">Paid outside the app</p>
              ) : (
                <>
                  <button type="button" className="primary" onClick={() => onPaid(ticket)}>
                    Mark paid
                  </button>
                  <p className="fine">Money was taken outside this demo. No card is charged.</p>
                </>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
