import { useImperativeHandle, useRef, useState, type DragEvent, type Ref } from 'react'
import { Icon } from '../Icon/Icon'
import { MB, formatBytes, getExtension } from '../../utils/file'
import './FileDropzone.css'

/** Imperative API exposed through `ref` */
export interface FileDropzoneHandle {
  /** Opens the OS file browser */
  browse: () => void
}

interface FileDropzoneProps {
  /** Comma separated extensions, e.g. ".png,.jpg,.jpeg,.pdf" */
  accept: string
  hint: string
  maxSize?: number
  multiple?: boolean
  /** Message shown under the hint (validation errors etc.) */
  error?: string
  onFiles: (valid: File[], rejected: string[]) => void
  ref?: Ref<FileDropzoneHandle>
}

/** Reusable drag & drop / browse file input. */
export function FileDropzone({
  accept,
  hint,
  maxSize = 25 * MB,
  multiple = true,
  error,
  onFiles,
  ref,
}: FileDropzoneProps) {
  const localInput = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  useImperativeHandle(ref, () => ({ browse: () => localInput.current?.click() }), [])

  function handle(list: FileList | null) {
    const files = Array.from(list ?? [])
    if (!files.length) return
    const allowed = accept.split(',').map((s) => s.trim().toLowerCase())
    const valid: File[] = []
    const rejected: string[] = []
    files.forEach((f) => {
      if (!allowed.includes(`.${getExtension(f.name)}`)) rejected.push(`${f.name} (type not allowed)`)
      else if (f.size > maxSize) rejected.push(`${f.name} (over ${formatBytes(maxSize)})`)
      else valid.push(f)
    })
    onFiles(valid, rejected)
  }

  function onDrag(e: DragEvent, over: boolean) {
    e.preventDefault()
    if (!over && e.currentTarget.contains(e.relatedTarget as Node)) return
    setDragOver(over)
  }

  return (
    <div
      className={`dropzone${dragOver ? ' is-dragover' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Upload files: drag and drop or browse"
      onClick={() => localInput.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          localInput.current?.click()
        }
      }}
      onDragEnter={(e) => onDrag(e, true)}
      onDragOver={(e) => onDrag(e, true)}
      onDragLeave={(e) => onDrag(e, false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        handle(e.dataTransfer.files)
      }}
    >
      <span className="dropzone__icon">
        <Icon name="upload-cloud" size={22} />
      </span>
      <p className="dropzone__title">Drag &amp; drop your files here</p>
      <p className="dropzone__sub">
        or <span className="dropzone__browse">browse from computer</span>
      </p>
      <span className="dropzone__hint">{hint}</span>
      {error && (
        <p className="dropzone__error" role="alert">
          {error}
        </p>
      )}
      <input
        ref={localInput}
        className="dropzone__input"
        type="file"
        accept={accept}
        multiple={multiple}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          handle(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
