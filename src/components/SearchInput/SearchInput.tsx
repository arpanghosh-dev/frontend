import { Icon } from '../Icon/Icon'
import './SearchInput.css'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  'aria-label'?: string
}

/** Reusable search box with a clear button. */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  maxLength = 255,
  'aria-label': ariaLabel = 'Search',
}: SearchInputProps) {
  return (
    <div className="search-input">
      <span className="search-input__icon">
        <Icon name="search" size={15} />
      </span>
      <input
        type="search"
        className="search-input__field"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.stopPropagation()
            onChange('')
          }
        }}
      />
      {value && (
        <button type="button" className="search-input__clear" aria-label="Clear search" onClick={() => onChange('')}>
          <Icon name="x" size={14} />
        </button>
      )}
    </div>
  )
}
