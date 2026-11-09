import { STORY } from '../data/menu.ts'

export function StoryPanel() {
  return (
    <article className="story">
      <span className="photo-frame story-frame">
        <img className="shot shot-corey-skinner" src={STORY.photo} alt="Corey Skinner cutting ribs" />
      </span>
      <h1>Meet {STORY.name}</h1>
      {STORY.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </article>
  )
}
