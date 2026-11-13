import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import './TextField.css'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  /** Helper text under the input */
  hint?: ReactNode
  /** Error message — replaces the hint and marks the input invalid */
  error?: string
  /** Text shown inside the input on the right, e.g. "GB" */
  suffix?: string
}

/** Reusable labelled input with hint / error message. */
export function TextField({ label, hint, error, suffix, id, className = '', ...rest }: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const messageId = `${inputId}-message`

  return (
    <div className={`text-field${error ? ' has-error' : ''} ${className}`.trim()}>
      <label className="text-field__label" htmlFor={inputId}>
        {label}
      </label>
      <div className="text-field__control">
        <input
          id={inputId}
          className="text-field__input"
          aria-invalid={!!error}
          aria-describedby={hint || error ? messageId : undefined}
          {...rest}
        />
        {suffix && <span className="text-field__suffix">{suffix}</span>}
      </div>
      {(error || hint) && (
        <p id={messageId} className="text-field__message" role={error ? 'alert' : undefined}>
          {error || hint}
        </p>
      )}
    </div>
  )
}
