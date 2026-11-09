import { useEffect, useState } from 'react'
import type { Ticket } from './orders.mjs'
import { flushOutbox, loadTickets, pullTickets } from './storage.ts'

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets())
  const [link, setLink] = useState<'saved' | 'waiting'>('saved')

  useEffect(() => {
    const read = () => setTickets(loadTickets())
    window.addEventListener('bbq-tickets', read)
    window.addEventListener('storage', read)
    const tick = window.setInterval(() => {
      void flushOutbox()
        .then(async (state) => {
          const next = await pullTickets()
          setTickets(next)
          setLink(state)
        })
        .catch(() => {
          setLink('waiting')
          setTickets(loadTickets())
        })
    }, 2000)
    void pullTickets()
      .then((next) => {
        setTickets(next)
        setLink('saved')
      })
      .catch(() => setLink('waiting'))
    return () => {
      window.removeEventListener('bbq-tickets', read)
      window.removeEventListener('storage', read)
      window.clearInterval(tick)
    }
  }, [])

  return { tickets, link }
}
