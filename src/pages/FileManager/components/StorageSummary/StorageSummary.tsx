import { Button } from '../../../../components/Button/Button'
import { StorageQuota } from '../../../../components/StorageQuota/StorageQuota'
import { formatBytes } from '../../../../utils/file'
import { useStorage } from '../../hooks/useStorage'
import { useFileManagerStore } from '../../store/useFileManagerStore'
import './StorageSummary.css'

/** Storage quota card fed by GET /storage, with an entry point to edit the limit. */
export function StorageSummary() {
  const { data, isPending, isError, error, refetch } = useStorage()
  const openStorageLimit = useFileManagerStore((s) => s.openStorageLimit)

  if (isPending) return <div className="storage-summary__skeleton" aria-label="Loading storage quota" />

  if (isError) {
    return (
      <div className="storage-summary__error" role="alert">
        <span>Couldn't load storage: {error.message}</span>
        <Button variant="secondary" size="sm" icon="refresh" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const caption = (
    <>
      {data.fileCount} {data.fileCount === 1 ? 'file' : 'files'}
      {data.reservedStorage > 0 && ` · ${formatBytes(data.reservedStorage)} reserved`}
      {data.pendingUploads > 0 && ` · ${data.pendingUploads} pending`}
    </>
  )

  return (
    <StorageQuota
      used={data.usedStorage}
      reserved={data.reservedStorage}
      total={data.totalLimit}
      caption={caption}
      action={<Button variant="icon" icon="edit" aria-label="Edit storage limit" onClick={openStorageLimit} />}
    />
  )
}
