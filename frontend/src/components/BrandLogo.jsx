import logoUrl from '../assets/ultratech-logo.svg'

const VARIANTS = {
  default: 'brand-logo',
  sidebar: 'brand-logo brand-logo-sidebar',
  navbar: 'brand-logo brand-logo-navbar',
  login: 'brand-logo brand-logo-login',
}

export default function BrandLogo({ className = '', compact = false, variant = 'default' }) {
  return (
    <img
      src={logoUrl}
      alt="Aditya Birla UltraTech"
      className={`${VARIANTS[variant] || VARIANTS.default} ${className}`}
      loading={compact ? 'eager' : 'lazy'}
    />
  )
}
