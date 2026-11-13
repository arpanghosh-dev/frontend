import { Button } from '../../../../components/Button/Button'
import { FileCard } from '../../../../components/FileCard/FileCard'
import { Icon } from '../../../../components/Icon/Icon'
import { useVisibleFiles } from '../../hooks/useFiles'
import { useFileManagerStore } from '../../store/useFileManagerStore'
import './FileGrid.css'

const SKELETON_COUNT = 6

/** Card grid with loading, error and empty states. */
export function FileGrid() {
  const { files, isPending, isError, error, refetch } = useVisibleFiles()
  const recentIds = useFileManagerStore((s) => s.recentIds)
  const openPreview = useFileManagerStore((s) => s.openPreview)
  const openDelete = useFileManagerStore((s) => s.openDelete)

  if (isPending) {
    return (
      <div className="file-grid" aria-busy="true" aria-label="Loading files">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div className="file-grid__skeleton" key={i} />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="file-grid__state file-grid__state--error" role="alert">
        <span className="file-grid__state-icon">
          <Icon name="alert" size={22} />
        </span>
        <p className="file-grid__state-title">Couldn't load files</p>
        <p className="file-grid__state-text">{error.message}</p>
        <Button variant="secondary" size="sm" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  if (!files.length) {
    return (
      <div className="file-grid__state">
        <span className="file-grid__state-icon">
          <Icon name="inbox" size={22} />
        </span>
        <p className="file-grid__state-title">No files here yet</p>
        <p className="file-grid__state-text">Upload a file from the panel on the left, or switch filters.</p>
      </div>
    )
  }

  return (
    <div className="file-grid">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          isNew={recentIds.includes(file.id)}
          onPreview={openPreview}
          onDelete={openDelete}
        />
      ))}
    </div>
  )
}
