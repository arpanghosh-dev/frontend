import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { TextField } from '../../../../components/TextField/TextField'
import { GB, formatBytes } from '../../../../utils/file'
import { useStorage, useUpdateStorageLimit } from '../../hooks/useStorage'
import './StorageLimitForm.css'

export const STORAGE_LIMIT_FORM_ID = 'storage-limit-form'

/** Client-side rules; the server re-checks (LIMIT_BELOW_USAGE). */
function limitSchema(minBytes: number) {
  return z
    .string()
    .trim()
    .min(1, 'Enter a limit')
    .pipe(z.coerce.number({ error: 'Enter a number' }))
    .pipe(
      z
        .number()
        .positive('Limit must be greater than 0')
        .max(1_000_000, 'Limit is unrealistically large')
        .refine((gb) => gb * GB >= minBytes, `Can't be lower than what's used or reserved (${formatBytes(minBytes)})`),
    )
}

interface StorageLimitFormProps {
  onDone: () => void
}

/** Body of the "Edit storage limit" modal — PATCH /storage/limit with { limitGB }. */
export function StorageLimitForm({ onDone }: StorageLimitFormProps) {
  const { data: stats } = useStorage()
  const update = useUpdateStorageLimit()
  const [value, setValue] = useState(() => (stats ? String(+(stats.totalLimit / GB).toFixed(2)) : ''))
  const [touched, setTouched] = useState(false)

  const minBytes = stats ? stats.usedStorage + stats.reservedStorage : 0
  const parsed = limitSchema(minBytes).safeParse(value)
  const clientError = parsed.success ? undefined : parsed.error.issues[0]?.message
  const serverError = update.error?.message

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!parsed.success) return
    update.mutate({ limitGB: parsed.data }, { onSuccess: onDone })
  }

  return (
    <form id={STORAGE_LIMIT_FORM_ID} className="storage-limit-form" onSubmit={submit} noValidate>
      {stats && (
        <dl className="storage-limit-form__stats">
          <div>
            <dt>Current limit</dt>
            <dd>{stats.formatted.totalLimit}</dd>
          </div>
          <div>
            <dt>Used</dt>
            <dd>{stats.formatted.usedStorage}</dd>
          </div>
          <div>
            <dt>Reserved</dt>
            <dd>{stats.formatted.reservedStorage}</dd>
          </div>
        </dl>
      )}
      <TextField
        label="New storage limit"
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        suffix="GB"
        value={value}
        data-autofocus
        onChange={(e) => {
          setValue(e.target.value)
          update.reset()
        }}
        onBlur={() => setTouched(true)}
        error={(touched ? clientError : undefined) ?? serverError}
        hint={`Must be at least ${formatBytes(minBytes)} (used + reserved).`}
      />
    </form>
  )
}
