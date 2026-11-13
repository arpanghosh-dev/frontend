import { Tabs } from '../../../../components/Tabs/Tabs'
import { TAB_ITEMS } from '../../constants/fileManager.constants'
import { useFileManagerStore } from '../../store/useFileManagerStore'
import './FilesToolbar.css'

/** Type filter tabs + hint text. */
export function FilesToolbar() {
  const tab = useFileManagerStore((s) => s.tab)
  const setTab = useFileManagerStore((s) => s.setTab)

  return (
    <div className="files-toolbar">
      <Tabs aria-label="Filter files by type" value={tab} onChange={setTab} items={TAB_ITEMS} />
      <span className="files-toolbar__hint">Click any file card to preview details</span>
    </div>
  )
}
