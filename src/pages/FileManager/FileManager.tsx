import { FileGrid } from './components/FileGrid/FileGrid'
import { FileManagerModal } from './components/FileManagerModal/FileManagerModal'
import { FilesHeader } from './components/FilesHeader/FilesHeader'
import { FilesToolbar } from './components/FilesToolbar/FilesToolbar'
import { SidebarHeader } from './components/SidebarHeader/SidebarHeader'
import { StorageSummary } from './components/StorageSummary/StorageSummary'
import { UploadPanel } from './components/UploadPanel/UploadPanel'
import './FileManager.css'

/** File Manager page — layout only; each section owns its own data. */
export function FileManager() {
  return (
    <div className="file-manager">
      <aside className="file-manager__sidebar" aria-label="Upload panel">
        <SidebarHeader />
        <UploadPanel />
        <div className="file-manager__sidebar-footer">
          <StorageSummary />
        </div>
      </aside>

      <main className="file-manager__main">
        <FilesHeader />
        <FilesToolbar />
        <section className="file-manager__content" aria-label="Files">
          <FileGrid />
        </section>
      </main>

      <FileManagerModal />
    </div>
  )
}
