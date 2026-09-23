'use client'

import * as React from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type TagInputProps = {
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  suggestions?: string[]
  max?: number
  className?: string
  id?: string
}

/** Chip-style editor for list fields (services used, skills, applications). */
function TagInput({
  value,
  onChange,
  placeholder = 'Type and press Enter',
  suggestions = [],
  max = 30,
  className,
  id,
}: TagInputProps) {
  const [draft, setDraft] = React.useState('')

  function add(raw: string) {
    const entry = raw.trim()
    if (!entry) return
    if (value.length >= max) return
    if (value.some((item) => item.toLowerCase() === entry.toLowerCase())) {
      setDraft('')
      return
    }
    onChange([...value, entry])
    setDraft('')
  }

  const unusedSuggestions = suggestions.filter(
    (suggestion) => !value.some((item) => item.toLowerCase() === suggestion.toLowerCase()),
  )

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(value.filter((entry) => entry !== item))}
                aria-label={`Remove ${item}`}
                className="text-muted-foreground transition-colors hover:text-destructive"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex gap-2">
        <Input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault()
              add(draft)
            }
            if (event.key === 'Backspace' && !draft && value.length > 0) {
              onChange(value.slice(0, -1))
            }
          }}
        />
        <Button type="button" variant="outline" size="lg" onClick={() => add(draft)} disabled={!draft.trim()}>
          <Plus /> Add
        </Button>
      </div>

      {unusedSuggestions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Quick add:</span>
          {unusedSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="rounded-full border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-amber-500 hover:text-foreground"
            >
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export { TagInput }
