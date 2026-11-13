import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '../Icon/Icon'
import './Dropdown.css'

export interface DropdownOption<T extends string> {
  value: T
  label: string
}

interface DropdownProps<T extends string> {
  options: DropdownOption<T>[]
  value: T
  onChange: (value: T) => void
  /** Muted text before the value, e.g. "Sort by:" */
  prefix?: string
  size?: 'md' | 'sm'
  /** Full width */
  block?: boolean
  align?: 'left' | 'right'
  'aria-label'?: string
}

/** Reusable custom select with keyboard support and outside-click close. */
export function Dropdown<T extends string>({
  options,
  value,
  onChange,
  prefix,
  size = 'md',
  block = false,
  align = 'left',
  'aria-label': ariaLabel,
}: DropdownProps<T>) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const selected = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const onOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  function openMenu() {
    setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)))
    setOpen(true)
  }

  function choose(index: number) {
    const opt = options[index]
    if (opt && opt.value !== value) onChange(opt.value)
    setOpen(false)
    triggerRef.current?.focus()
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      e.stopPropagation()
      setOpen(false)
      triggerRef.current?.focus()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return openMenu()
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((i) => (i + step + options.length) % options.length)
    } else if ((e.key === 'Enter' || e.key === ' ') && open) {
      e.preventDefault()
      choose(activeIndex)
    } else if (e.key === 'Tab' && open) {
      setOpen(false)
    }
  }

  const classes = [
    'dropdown',
    block && 'dropdown--block',
    size === 'sm' && 'dropdown--sm',
    align === 'right' && 'dropdown--align-right',
    open && 'is-open',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} ref={rootRef} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        className="dropdown__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openMenu())}
      >
        <span className="dropdown__text">
          {prefix && <span className="dropdown__prefix">{prefix} </span>}
          <span className={prefix ? 'dropdown__value' : 'dropdown__value dropdown__value--plain'}>{selected?.label}</span>
        </span>
        <span className="dropdown__chevron">
          <Icon name="chevron-down" size={16} />
        </span>
      </button>

      <ul className="dropdown__menu" role="listbox" id={listId}>
        {options.map((opt, i) => (
          <li
            key={opt.value}
            role="option"
            aria-selected={opt.value === value}
            className={`dropdown__option${i === activeIndex ? ' is-active' : ''}`}
            onMouseMove={() => setActiveIndex(i)}
            onClick={() => choose(i)}
          >
            <span>{opt.label}</span>
            <Icon name="check" size={14} />
          </li>
        ))}
      </ul>
    </div>
  )
}
