import { StorageQuota } from '../../../../components/StorageQuota/StorageQuota'
import { useStorage } from '../../hooks/useStorage'
import './StorageSummary.css'

/** Storage quota card fed by the /storage endpoint. */
export function StorageSummary() {
  const { data, isPending, isError } = useStorage()

  if (isPending) return <div className="storage-summary__skeleton" aria-label="Loading storage quota" />
  if (isError) return <p className="storage-summary__error">Couldn't load storage quota.</p>

  return <StorageQuota used={data.used} total={data.total} />
}
