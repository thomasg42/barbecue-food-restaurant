import { useEffect } from 'react'
import type { MenuItem } from '../data/menu.ts'
import { PRICE } from '../data/menu.ts'

export function ItemSheet({
  item,
  note,
  sauce,
  onNote,
  onSauce,
  onClose,
  onSelect,
}: {
  item: MenuItem | null
  note: string
  sauce: boolean
  onNote: (note: string) => void
  onSauce: (sauce: boolean) => void
  onClose: () => void
  onSelect: () => void
}) {
  useEffect(() => {
    if (!item) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [item, onClose])

  if (!item) return null

  return (
    <div className="sheet-backdrop">
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="item-title"
      >
        <div className="sheet-scroll">
          <button type="button" className="sheet-close" onClick={onClose}>
            Close
          </button>
          {item.photo ? (
            <span className="photo-frame sheet-frame">
              <img className={`shot shot-${item.id}`} src={item.photo} alt={item.name} />
            </span>
          ) : (
            <div className="sheet-blank">Sample</div>
          )}
          <p className="eyebrow">{item.category}</p>
          <h2 id="item-title">{item.name}</h2>
          <p className="price">
            Price <b>{PRICE}</b>
          </p>
          <p className="origin">
            {item.sample ? 'Sample plate. Not from his kitchen.' : 'From the photo he sent.'}
          </p>
          <h3>Ingredients</h3>
          <ul className="ingredients">
            {item.ingredients.map((ingredient) => (
              <li key={ingredient}>{ingredient}</li>
            ))}
          </ul>
          {item.sauce ? (
            <label className="sauce">
              <input
                type="checkbox"
                checked={sauce}
                onChange={(event) => onSauce(event.target.checked)}
              />
              Sauce on the side
            </label>
          ) : null}
          <label className="note-field">
            Note
            <textarea
              value={note}
              onChange={(event) => onNote(event.target.value)}
              rows={3}
              maxLength={140}
            />
          </label>
        </div>
        <button type="button" className="select-item" onClick={onSelect}>
          Select item
        </button>
      </div>
    </div>
  )
}
