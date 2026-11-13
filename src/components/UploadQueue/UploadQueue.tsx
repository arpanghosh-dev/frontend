import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { formatBytes, getFileType } from '../../utils/file'
import './UploadQueue.css'

export interface UploadQueueItem {
  id: string
  name: string
  size: number
  status: 'queued' | 'uploading' | 'completing' | 'done' | 'error'
  /** 0–100 */
  progress: number
  error?: string
}

interface UploadQueueProps {
  items: UploadQueueItem[]
  /** Remove a queued / failed item */
  onRemove: (id: string) => void
  /** Retry a failed item */
  onRetry: (id: string) => void
  /** Abort an in-flight item */
  onCancel: (id: string) => void
}

const STATUS_TEXT: Record<UploadQueueItem['status'], (item: UploadQueueItem) => string> = {
  queued: (i) => formatBytes(i.size),
  uploading: (i) => `${i.progress}%`,
  completing: () => 'Verifying…',
  done: () => 'Uploaded',
  error: () => 'Failed',
}

/** Files selected for upload, with per-file progress, errors and actions. */
export function UploadQueue({ items, onRemove, onRetry, onCancel }: UploadQueueProps) {
  if (!items.length) return null
  const queued = items.filter((i) => i.status === 'queued').length

  return (
    <div className="upload-queue" aria-live="polite">
      <p className="upload-queue__title">
        {queued === items.length ? `Ready to upload (${queued})` : `Uploads (${items.length})`}
      </p>
      {items.map((item) => {
        const busy = item.status === 'uploading' || item.status === 'completing'
        return (
          <div className={`upload-queue__item is-${item.status}`} key={item.id}>
            <div className="upload-queue__row">
              <Icon
                name={item.status === 'done' ? 'check' : getFileType(item.name) === 'pdf' ? 'file-text' : 'image'}
                size={15}
              />
              <span className="upload-queue__name" title={item.name}>
                {item.name}
              </span>
              <span className="upload-queue__status">{STATUS_TEXT[item.status](item)}</span>
              {item.status === 'error' && (
                <Button variant="icon" icon="refresh" aria-label={`Retry ${item.name}`} onClick={() => onRetry(item.id)} />
              )}
              {busy && item.status === 'uploading' && (
                <Button variant="icon" icon="x" aria-label={`Cancel ${item.name}`} onClick={() => onCancel(item.id)} />
              )}
              {(item.status === 'queued' || item.status === 'error') && (
                <Button variant="icon" icon="x" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item.id)} />
              )}
            </div>
            {(busy || item.status === 'done') && (
              <div className="upload-queue__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}>
                <div className="upload-queue__bar" style={{ width: `${item.progress}%` }} />
              </div>
            )}
            {item.error && <p className="upload-queue__error">{item.error}</p>}
          </div>
        )
      })}
    </div>
  )
}
