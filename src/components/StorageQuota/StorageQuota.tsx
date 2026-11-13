import type { ReactNode } from 'react'
import { formatBytes } from '../../utils/file'
import './StorageQuota.css'

interface StorageQuotaProps {
  used: number
  total: number
  /** Space held for uploads in progress — drawn as a lighter segment */
  reserved?: number
  title?: string
  /** Optional control in the header (e.g. an "Edit" button) */
  action?: ReactNode
  /** Optional extra line under the bar */
  caption?: ReactNode
}

/** Reusable usage meter. Turns amber at 75% and red at 90% (used + reserved). */
export function StorageQuota({ used, total, reserved = 0, title = 'Storage Quota', action, caption }: StorageQuotaProps) {
  const safeTotal = Math.max(total, 1)
  const usedPct = Math.min(100, (Math.max(0, used) / safeTotal) * 100)
  const reservedPct = Math.min(100 - usedPct, (Math.max(0, reserved) / safeTotal) * 100)
  const committedPct = usedPct + reservedPct
  const level = committedPct >= 90 ? ' is-critical' : committedPct >= 75 ? ' is-warning' : ''

  return (
    <section className={`quota${level}`} aria-label={title}>
      <div className="quota__head">
        <span className="quota__title">{title}</span>
        <span className="quota__head-end">
          <span className="quota__percent">{usedPct.toFixed(1)}%</span>
          {action}
        </span>
      </div>
      <div
        className="quota__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(usedPct.toFixed(1))}
      >
        <div className="quota__bar" style={{ width: `${usedPct}%` }} />
        {reservedPct > 0 && <div className="quota__bar quota__bar--reserved" style={{ width: `${reservedPct}%` }} />}
      </div>
      <div className="quota__foot">
        <span>{formatBytes(used)} used</span>
        <span>{formatBytes(total)} total</span>
      </div>
      {caption && <p className="quota__caption">{caption}</p>}
    </section>
  )
}
