import { Icon } from '../../../../components/Icon/Icon'
import { useHealth, type ConnectionState } from '../../hooks/useHealth'
import { useIsUploading } from '../../hooks/useUploadFiles'
import './SidebarHeader.css'

const STATUS: Record<ConnectionState, { label: string; className: string; title: string }> = {
  checking: { label: 'Connecting…', className: 'is-busy', title: 'Checking API health' },
  ok: { label: 'Ready', className: '', title: 'API and database are up' },
  degraded: { label: 'Degraded', className: 'is-warning', title: 'API is up but the database is unreachable' },
  offline: { label: 'Offline', className: 'is-offline', title: "Can't reach the API" },
}

/** Brand + live status pill (upload activity, else API health). */
export function SidebarHeader() {
  const uploading = useIsUploading()
  const { state, refetch } = useHealth()

  const status = uploading
    ? { label: 'Uploading…', className: 'is-busy', title: 'Uploads in progress' }
    : STATUS[state]

  return (
    <div className="sidebar-header">
      <div className="brand">
        <span className="brand__logo">
          <Icon name="folder" size={16} />
        </span>
        <h1 className="brand__name">File Manager</h1>
      </div>
      <button
        type="button"
        className={`status-pill ${status.className}`.trim()}
        title={`${status.title} — click to re-check`}
        onClick={() => refetch()}
      >
        <span role="status">{status.label}</span>
      </button>
    </div>
  )
}
