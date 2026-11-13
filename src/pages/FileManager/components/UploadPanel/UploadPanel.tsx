import { useRef } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import { FileDropzone, type FileDropzoneHandle } from '../../../../components/FileDropzone/FileDropzone'
import { UploadQueue } from '../../../../components/UploadQueue/UploadQueue'
import { MAX_UPLOAD_SIZE, TYPE_FILTERS, TYPE_FILTER_OPTIONS } from '../../constants/fileManager.constants'
import { useIsUploading, useUploadFiles } from '../../hooks/useUploadFiles'
import { useFileManagerStore } from '../../store/useFileManagerStore'
import './UploadPanel.css'

/** Dropzone + type pre-filter + upload button + upload queue. */
export function UploadPanel() {
  const dropzoneRef = useRef<FileDropzoneHandle>(null)
  const typeFilter = useFileManagerStore((s) => s.typeFilter)
  const uploads = useFileManagerStore((s) => s.uploads)
  const dropError = useFileManagerStore((s) => s.dropError)
  const setTypeFilter = useFileManagerStore((s) => s.setTypeFilter)
  const addFiles = useFileManagerStore((s) => s.addFiles)
  const removeUpload = useFileManagerStore((s) => s.removeUpload)

  const { uploadQueued, retry, cancel } = useUploadFiles()
  const uploading = useIsUploading()
  const filter = TYPE_FILTERS[typeFilter]
  const queuedCount = uploads.filter((u) => u.status === 'queued').length

  function handleUpload() {
    // Nothing selected yet → open the file browser instead
    if (!queuedCount) {
      dropzoneRef.current?.browse()
      return
    }
    uploadQueued()
  }

  return (
    <div className="upload-panel">
      <FileDropzone
        ref={dropzoneRef}
        accept={filter.accept}
        hint={filter.hint}
        maxSize={MAX_UPLOAD_SIZE}
        error={dropError}
        onFiles={addFiles}
      />

      <div className="field">
        <span className="field__label">File Type Pre-filter</span>
        <Dropdown
          block
          aria-label="File type pre-filter"
          value={typeFilter}
          onChange={setTypeFilter}
          options={TYPE_FILTER_OPTIONS}
        />
      </div>

      <Button icon="upload" block disabled={uploading && !queuedCount} onClick={handleUpload}>
        {queuedCount > 1 ? `Upload ${queuedCount} Files` : uploading && !queuedCount ? 'Uploading…' : 'Upload Files'}
      </Button>

      <UploadQueue
        items={uploads.map((u) => ({ ...u, name: u.file.name, size: u.file.size }))}
        onRemove={removeUpload}
        onRetry={retry}
        onCancel={cancel}
      />
    </div>
  )
}
