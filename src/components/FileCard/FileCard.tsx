import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import type { FileItem } from '../../types/file'
import { formatBytes, formatDate } from '../../utils/file'
import './FileCard.css'

interface FileCardProps {
  file: FileItem
  onPreview: (file: FileItem) => void
  onDelete: (file: FileItem) => void
  /** Plays the entry animation (freshly uploaded) */
  isNew?: boolean
}

/** Reusable document card. Clicking the card or the eye icon previews. */
export function FileCard({ file, onPreview, onDelete, isNew = false }: FileCardProps) {
  return (
    <article
      className={`file-card${isNew ? ' is-new' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`Preview ${file.name}`}
      onClick={() => onPreview(file)}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onPreview(file)
        } else if (e.key === 'Delete') {
          e.preventDefault()
          onDelete(file)
        }
      }}
    >
      <div className="file-card__body">
        <span className={`file-card__thumb tone-${file.tone}`}>
          <Icon name={file.icon} size={18} />
        </span>
        <div className="file-card__info">
          <h3 className="file-card__name" title={file.name}>
            {file.name}
          </h3>
          <p className="file-card__meta">
            {formatBytes(file.size)} • {formatDate(file.addedAt)}
          </p>
          <span className={`file-card__badge tone-${file.tone}`}>{file.badge}</span>
        </div>
      </div>

      <div className="file-card__footer">
        <span className="file-card__note">{file.note}</span>
        <div className="file-card__actions">
          <Button
            variant="icon"
            icon="eye"
            aria-label={`Preview ${file.name}`}
            onClick={(e) => {
              e.stopPropagation()
              onPreview(file)
            }}
          />
          <Button
            variant="icon"
            icon="trash"
            dangerHover
            aria-label={`Delete ${file.name}`}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(file)
            }}
          />
        </div>
      </div>
    </article>
  )
}
