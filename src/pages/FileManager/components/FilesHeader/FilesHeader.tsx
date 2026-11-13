import { Dropdown } from '../../../../components/Dropdown/Dropdown'
import { SearchInput } from '../../../../components/SearchInput/SearchInput'
import { ThemeToggle } from '../../../../components/ThemeToggle/ThemeToggle'
import { SORT_OPTIONS } from '../../constants/fileManager.constants'
import { useVisibleFiles } from '../../hooks/useFiles'
import { useFileManagerStore } from '../../store/useFileManagerStore'
import './FilesHeader.css'

/** Title, total file count, search and sort. */
export function FilesHeader() {
  const { total, isFetching, isPending } = useVisibleFiles()
  const sort = useFileManagerStore((s) => s.sort)
  const setSort = useFileManagerStore((s) => s.setSort)
  const search = useFileManagerStore((s) => s.search)
  const setSearch = useFileManagerStore((s) => s.setSearch)

  return (
    <header className="files-header">
      <div>
        <div className="files-header__title-row">
          <h2 className="files-header__title">Uploaded Files</h2>
          {total !== undefined && (
            <span className="count-pill">
              {total} {total === 1 ? 'file' : 'files'}
            </span>
          )}
          {isFetching && !isPending && <span className="files-header__syncing" aria-label="Refreshing" />}
        </div>
        <p className="files-header__subtitle">Manage, preview, and organize your company documents and visual assets</p>
      </div>
      <div className="files-header__controls">
        <SearchInput value={search} onChange={setSearch} placeholder="Search files…" aria-label="Search files by name" />
        <Dropdown
          prefix="Sort by:"
          size="sm"
          align="right"
          aria-label="Sort files"
          value={sort}
          onChange={setSort}
          options={SORT_OPTIONS}
        />
        <ThemeToggle />
      </div>
    </header>
  )
}
