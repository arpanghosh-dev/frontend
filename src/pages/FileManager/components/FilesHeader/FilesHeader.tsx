import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import { SORT_OPTIONS } from '../../constants/fileManager.constants'
import { useFiles } from '../../hooks/useFiles'
import { useFileManagerStore } from '../../store/useFileManagerStore'
import './FilesHeader.css'

/** Title, file count and sort control. */
export function FilesHeader() {
  const { data: files } = useFiles()
  const sort = useFileManagerStore((s) => s.sort)
  const setSort = useFileManagerStore((s) => s.setSort)
  const count = files?.length

  return (
    <header className="files-header">
      <div>
        <div className="files-header__title-row">
          <h2 className="files-header__title">Uploaded Files</h2>
          {count !== undefined && (
            <span className="count-pill">
              {count} {count === 1 ? 'file' : 'files'}
            </span>
          )}
        </div>
        <p className="files-header__subtitle">Manage, preview, and organize your company documents and visual assets</p>
      </div>
      <Dropdown
        prefix="Sort by:"
        size="sm"
        align="right"
        aria-label="Sort files"
        value={sort}
        onChange={setSort}
        options={SORT_OPTIONS}
      />
    </header>
  )
}
