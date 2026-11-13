import { Icon } from '../../../../components/Icon/Icon'
import { useIsUploading } from '../../hooks/useUploadFiles'
import './SidebarHeader.css'

/** Brand + live upload status pill. */
export function SidebarHeader() {
  const uploading = useIsUploading()

  return (
    <div className="sidebar-header">
      <div className="brand">
        <span className="brand__logo">
          <Icon name="folder" size={16} />
        </span>
        <h1 className="brand__name">File Manager</h1>
      </div>
      <span className={`status-pill${uploading ? ' is-busy' : ''}`} role="status">
        {uploading ? 'Uploading…' : 'Ready'}
      </span>
    </div>
  )
}
