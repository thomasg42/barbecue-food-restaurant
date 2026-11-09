import type { Station } from '../station.ts'
import { stationHref } from '../station.ts'

const LINKS: { station: Station; label: string }[] = [
  { station: 'guest', label: 'Menu' },
  { station: 'register', label: 'Register' },
  { station: 'kitchen', label: 'Kitchen' },
]

export function TopBar({ station, link }: { station: Station; link?: string }) {
  return (
    <header className="top">
      <div>
        <p className="brand">Barbecue</p>
        <p className="sub">Demo. Name not in yet.</p>
      </div>
      <div className="top-side">
        {link ? <p className="link-note">{link}</p> : null}
        <nav className="station-links" aria-label="Stations">
          {LINKS.filter((item) => item.station !== station).map((item) => (
            <a key={item.station} href={stationHref(item.station)}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
