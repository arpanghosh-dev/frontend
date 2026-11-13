import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { formatBytes, getFileType } from '../../utils/file'
import './StagedFileList.css'

interface StagedFileListProps {
  files: File[]
  onRemove: (index: number) => void
}

/** Files picked in the dropzone that are waiting to be uploaded. */
export function StagedFileList({ files, onRemove }: StagedFileListProps) {
  if (!files.length) return null

  return (
    <div className="staged" aria-live="polite">
      <p className="staged__title">Ready to upload ({files.length})</p>
      {files.map((file, i) => (
        <div className="staged__item" key={`${file.name}-${file.size}-${i}`}>
          <Icon name={getFileType(file.name) === 'pdf' ? 'file-text' : 'image'} size={15} />
          <span className="staged__name" title={file.name}>
            {file.name}
          </span>
          <span className="staged__size">{formatBytes(file.size)}</span>
          <Button variant="icon" icon="x" aria-label={`Remove ${file.name}`} onClick={() => onRemove(i)} />
        </div>
      ))}
    </div>
  )
}
