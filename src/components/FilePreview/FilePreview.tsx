import { useState } from 'react'
import { Icon } from '../Icon/Icon'
import type { FileItem } from '../../types/file'
import { formatBytes, formatDate, isPreviewable } from '../../utils/file'
import './FilePreview.css'

const TYPE_LABELS = { pdf: 'PDF Document', png: 'PNG Image', jpg: 'JPG Image', other: 'Unknown' }

interface FilePreviewProps {
  file: FileItem
}

/**
 * Content rendered inside the shared Modal.
 * Supports exactly three types: PNG, JPG/JPEG and PDF.
 */
export function FilePreview({ file }: FilePreviewProps) {
  const [naturalSize, setNaturalSize] = useState<string>()

  let stage
  if (!isPreviewable(file.type)) {
    stage = (
      <div className="preview__stage">
        <div className="preview__unsupported">
          <Icon name="file" size={28} />
          <strong>Preview not available</strong>
          <span>Only PNG, JPG and PDF files can be previewed.</span>
        </div>
      </div>
    )
  } else if (file.type === 'pdf') {
    stage = (
      <div className="preview__stage preview__stage--pdf">
        <iframe className="preview__pdf" title={`PDF preview of ${file.name}`} src={`${file.url}#toolbar=1&view=FitH`} />
      </div>
    )
  } else {
    stage = (
      <div className="preview__stage">
        <img
          className="preview__image"
          src={file.url}
          alt={`Preview of ${file.name}`}
          onLoad={(e) => setNaturalSize(`${e.currentTarget.naturalWidth} × ${e.currentTarget.naturalHeight}`)}
        />
      </div>
    )
  }

  const details: [string, string][] = [
    ['Type', TYPE_LABELS[file.type]],
    ['Size', formatBytes(file.size)],
    ['Uploaded', formatDate(file.addedAt)],
    file.type === 'pdf' ? ['Format', 'Portable Document'] : ['Dimensions', file.dimensions ?? naturalSize ?? '—'],
  ]

  return (
    <div className="preview">
      {stage}
      <dl className="preview__details">
        {details.map(([label, value]) => (
          <div className="preview__detail" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
