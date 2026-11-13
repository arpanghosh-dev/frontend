import { useState } from 'react'
import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import type { FileType } from '../../types/file'
import { isPreviewable } from '../../utils/file'
import './FilePreview.css'

export interface PreviewDetail {
  label: string
  value: string
}

interface FilePreviewProps {
  name: string
  type: FileType
  /** URL the browser can display (e.g. a presigned inline URL) */
  url?: string
  isLoading?: boolean
  error?: string
  onRetry?: () => void
  /** Info boxes under the preview; image dimensions are appended automatically */
  details?: PreviewDetail[]
}

/**
 * Content rendered inside the shared Modal.
 * Supports exactly three types: PNG, JPG/JPEG and PDF.
 */
export function FilePreview({ name, type, url, isLoading, error, onRetry, details = [] }: FilePreviewProps) {
  const [naturalSize, setNaturalSize] = useState<string>()

  let stage
  if (!isPreviewable(type)) {
    stage = (
      <div className="preview__stage">
        <div className="preview__message">
          <Icon name="file" size={28} />
          <strong>Preview not available</strong>
          <span>Only PNG, JPG and PDF files can be previewed.</span>
        </div>
      </div>
    )
  } else if (error) {
    stage = (
      <div className="preview__stage">
        <div className="preview__message preview__message--error" role="alert">
          <Icon name="alert" size={28} />
          <strong>Couldn't load preview</strong>
          <span>{error}</span>
          {onRetry && (
            <Button variant="secondary" size="sm" icon="refresh" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    )
  } else if (isLoading || !url) {
    stage = (
      <div className="preview__stage">
        <div className="preview__message" aria-busy="true">
          <span className="preview__spinner" />
          <span>Loading preview…</span>
        </div>
      </div>
    )
  } else if (type === 'pdf') {
    stage = (
      <div className="preview__stage preview__stage--pdf">
        <iframe className="preview__pdf" title={`PDF preview of ${name}`} src={`${url}#toolbar=1&view=FitH`} />
      </div>
    )
  } else {
    stage = (
      <div className="preview__stage">
        <img
          className="preview__image"
          src={url}
          alt={`Preview of ${name}`}
          onLoad={(e) => setNaturalSize(`${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight}`)}
        />
      </div>
    )
  }

  const allDetails = type === 'png' || type === 'jpg' ? [...details, { label: 'Dimensions', value: naturalSize ?? '—' }] : details

  return (
    <div className="preview">
      {stage}
      {allDetails.length > 0 && (
        <dl className="preview__details">
          {allDetails.map(({ label, value }) => (
            <div className="preview__detail" key={label}>
              <dt>{label}</dt>
              <dd title={value}>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
