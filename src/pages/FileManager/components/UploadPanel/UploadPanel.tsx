import { useRef } from 'react'
import { Button } from '../../../../components/Button/Button'
import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import { FileDropzone, type FileDropzoneHandle } from '../../../../components/FileDropzone/FileDropzone'
import { StagedFileList } from '../../../../components/StagedFileList/StagedFileList'
import { MAX_UPLOAD_SIZE, TYPE_FILTERS, TYPE_FILTER_OPTIONS } from '../../constants/fileManager.constants'
import { useUploadFiles } from '../../hooks/useUploadFiles'
import { useFileManagerStore } from '../../store/useFileManagerStore'
import './UploadPanel.css'

/** Dropzone + type pre-filter + upload button + selected-file list. */
export function UploadPanel() {
  const dropzoneRef = useRef<FileDropzoneHandle>(null)
  const typeFilter = useFileManagerStore((s) => s.typeFilter)
  const staged = useFileManagerStore((s) => s.staged)
  const dropError = useFileManagerStore((s) => s.dropError)
  const setTypeFilter = useFileManagerStore((s) => s.setTypeFilter)
  const addStaged = useFileManagerStore((s) => s.addStaged)
  const removeStaged = useFileManagerStore((s) => s.removeStaged)
  const clearStaged = useFileManagerStore((s) => s.clearStaged)

  const upload = useUploadFiles()
  const filter = TYPE_FILTERS[typeFilter]

  function handleUpload() {
    // Nothing selected yet → open the file browser instead
    if (!staged.length) {
      dropzoneRef.current?.browse()
      return
    }
    upload.mutate(staged, { onSuccess: clearStaged })
  }

  return (
    <div className="upload-panel">
      <FileDropzone
        ref={dropzoneRef}
        accept={filter.accept}
        hint={filter.hint}
        maxSize={MAX_UPLOAD_SIZE}
        error={dropError}
        onFiles={addStaged}
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

      <Button icon="upload" block disabled={upload.isPending} onClick={handleUpload}>
        {upload.isPending ? 'Uploading…' : staged.length > 1 ? `Upload ${staged.length} Files` : 'Upload Files'}
      </Button>

      {upload.isError && (
        <p className="upload-panel__error" role="alert">
          Upload failed: {upload.error.message}
        </p>
      )}

      <StagedFileList files={staged} onRemove={removeStaged} />
    </div>
  )
}
