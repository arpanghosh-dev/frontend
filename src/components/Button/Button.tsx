import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import './Button.css'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon'

interface StyleProps {
  variant?: Variant
  size?: 'md' | 'sm'
  icon?: IconName
  /** Full width */
  block?: boolean
  /** Icon variant turns red on hover (delete actions) */
  dangerHover?: boolean
}

function buttonClass({ variant = 'primary', size = 'md', block, dangerHover }: StyleProps, extra = '') {
  return [
    'btn',
    `btn--${variant}`,
    size === 'sm' && 'btn--sm',
    block && 'btn--block',
    dangerHover && 'btn--danger-hover',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}

type ButtonProps = StyleProps & ButtonHTMLAttributes<HTMLButtonElement>

/**
 * Reusable button.
 * <Button icon="upload" block>Upload Files</Button>
 * <Button variant="icon" icon="trash" aria-label="Delete" dangerHover />
 */
export function Button({ variant, size, icon, block, dangerHover, className, children, type = 'button', ...rest }: ButtonProps) {
  const label = rest['aria-label']
  return (
    <button
      type={type}
      className={buttonClass({ variant, size, block, dangerHover }, className)}
      title={variant === 'icon' ? label : undefined}
      {...rest}
    >
      {icon && <Icon name={icon} size={variant === 'icon' ? 15 : 16} />}
      {children && <span>{children}</span>}
    </button>
  )
}

type ButtonLinkProps = StyleProps & AnchorHTMLAttributes<HTMLAnchorElement>

/** Same look as Button, rendered as a link (e.g. downloads). */
export function ButtonLink({ variant, size, icon, block, dangerHover, className, children, ...rest }: ButtonLinkProps) {
  return (
    <a className={buttonClass({ variant, size, block, dangerHover }, className)} {...rest}>
      {icon && <Icon name={icon} size={16} />}
      {children && <span>{children}</span>}
    </a>
  )
}
