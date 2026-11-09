export type Station = 'guest' | 'register' | 'kitchen'

export function stationFromPath(pathname: string): Station {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/register' || path.endsWith('/register')) return 'register'
  if (path === '/kitchen' || path.endsWith('/kitchen')) return 'kitchen'
  return 'guest'
}

function siteBase(): string {
  const raw = import.meta.env.BASE_URL || '/'
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

export function stationHref(station: Station): string {
  const base = siteBase()
  if (station === 'register') return `${base}/register`
  if (station === 'kitchen') return `${base}/kitchen`
  return `${base}/`
}
