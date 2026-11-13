import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '../Button/Button'
import { Icon, type IconName } from '../Icon/Icon'
import type { Tone } from '../../types/file'
import './Modal.css'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: IconName
  tone?: Tone
  size?: 'sm' | 'md' | 'lg'
  footer?: ReactNode
  children?: ReactNode
}

/**
 * The single reusable modal. The page renders ONE instance and swaps its
 * content — used for both the file preview and the delete confirmation.
 *
 * Focus goes to the element marked `data-autofocus`, otherwise the first
 * footer button. Esc, backdrop click and the × button close it.
 */
export function Modal({ open, onClose, title, subtitle, icon, tone = 'indigo', size = 'md', footer, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  })

  // Remember where focus was, lock body scroll, restore on close
  useEffect(() => {
    if (!open) return
    restoreFocus.current = document.activeElement as HTMLElement | null
    document.body.classList.add('modal-open')
    return () => {
      document.body.classList.remove('modal-open')
      restoreFocus.current?.focus?.()
    }
  }, [open])

  // Move focus into the dialog whenever it opens or its content changes
  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const dialog = dialogRef.current
      const target =
        dialog?.querySelector<HTMLElement>('[data-autofocus]') ??
        dialog?.querySelector<HTMLElement>('.modal__footer button, .modal__footer a') ??
        dialog?.querySelector<HTMLElement>('button')
      target?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open, title])

  // Esc to close + simple focus trap
  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <div className={`modal modal--${size}${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={dialogRef}>
        <header className="modal__header">
          {icon && (
            <span className={`modal__icon tone-${tone}`}>
              <Icon name={icon} size={18} />
            </span>
          )}
          <div className="modal__titles">
            <h2 className="modal__title" id="modal-title">
              {title}
            </h2>
            {subtitle && <p className="modal__subtitle">{subtitle}</p>}
          </div>
          <Button variant="icon" icon="x" aria-label="Close" onClick={onClose} />
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>
  )
}
