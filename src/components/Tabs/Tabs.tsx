import { useRef, type KeyboardEvent } from 'react'
import './Tabs.css'

export interface TabItem<T extends string> {
  value: T
  label: string
}

interface TabsProps<T extends string> {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  'aria-label'?: string
}

/** Reusable segmented filter with arrow-key navigation. */
export function Tabs<T extends string>({ items, value, onChange, 'aria-label': ariaLabel = 'Filter' }: TabsProps<T>) {
  const listRef = useRef<HTMLDivElement>(null)

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const i = items.findIndex((t) => t.value === value)
    const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
    onChange(items[next].value)
    listRef.current?.querySelectorAll<HTMLButtonElement>('.tabs__tab')[next]?.focus()
  }

  return (
    <div className="tabs" role="tablist" aria-label={ariaLabel} ref={listRef} onKeyDown={onKeyDown}>
      {items.map((item) => {
        const selected = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            className="tabs__tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => !selected && onChange(item.value)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
