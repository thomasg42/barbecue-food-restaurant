import type { Category, MenuItem } from '../data/menu.ts'
import { CATEGORIES } from '../data/menu.ts'

export function MenuGrid({
  items,
  category,
  onCategory,
  onOpen,
}: {
  items: MenuItem[]
  category: Category
  onCategory: (category: Category) => void
  onOpen: (id: string) => void
}) {
  return (
    <div>
      <div className="chips" role="tablist" aria-label="Menu categories">
        {CATEGORIES.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={name === category}
            className={name === category ? 'on' : ''}
            onClick={() => onCategory(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="grid">
        {items.map((item) => (
          <button key={item.id} type="button" className="tile" onClick={() => onOpen(item.id)}>
            {item.photo ? (
              <img src={item.photo} alt={item.name} />
            ) : (
              <span className="tile-blank">Sample</span>
            )}
            <span className="tile-name">
              {item.name}
              {item.sample ? <small>Sample plate. Not from his kitchen.</small> : null}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
