import { useToastStore } from '../../store/useToastStore'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './Toast.css'

const ICONS = { success: 'check', error: 'alert', info: 'inbox' } as const

/** Renders toasts from the toast store. Mount once at the app root. */
export function ToastViewport() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`} role={t.tone === 'error' ? 'alert' : 'status'}>
          <span className="toast__icon">
            <Icon name={ICONS[t.tone]} size={16} />
          </span>
          <div className="toast__body">
            <p className="toast__title">{t.title}</p>
            {t.message && <p className="toast__message">{t.message}</p>}
          </div>
          <Button variant="icon" icon="x" aria-label="Dismiss notification" onClick={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  )
}
