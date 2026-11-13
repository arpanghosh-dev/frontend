import { formatBytes } from '../../utils/file'
import './StorageQuota.css'

interface StorageQuotaProps {
  used: number
  total: number
  title?: string
}

/** Reusable usage meter. Turns amber at 75% and red at 90%. */
export function StorageQuota({ used, total, title = 'Storage Quota' }: StorageQuotaProps) {
  const pct = Math.min(100, (Math.max(0, used) / total) * 100)
  const level = pct >= 90 ? ' is-critical' : pct >= 75 ? ' is-warning' : ''

  return (
    <section className={`quota${level}`} aria-label={title}>
      <div className="quota__head">
        <span className="quota__title">{title}</span>
        <span className="quota__percent">{pct.toFixed(1)}%</span>
      </div>
      <div className="quota__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(pct.toFixed(1))}>
        <div className="quota__bar" style={{ width: `${pct}%` }} />
      </div>
      <div className="quota__foot">
        <span>{formatBytes(used)} used</span>
        <span>{formatBytes(total)} total</span>
      </div>
    </section>
  )
}
