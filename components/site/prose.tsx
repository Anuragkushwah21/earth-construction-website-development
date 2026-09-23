import { cn } from '@/lib/utils'

/**
 * Renders admin-authored text. Blank lines become paragraphs and the content
 * is rendered as text, never as HTML, so nothing stored in the database can
 * inject markup into the page.
 */
export function Prose({ text, className }: { text: string; className?: string }) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  if (paragraphs.length === 0) return null

  return (
    <div className={cn('prose-block', className)}>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  )
}
