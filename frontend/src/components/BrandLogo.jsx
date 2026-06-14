import logoUrl from '../assets/ultratech-logo.svg'

export default function BrandLogo({ className = '', compact = false }) {
  return (
    <img
      src={logoUrl}
      alt="Aditya Birla UltraTech"
      className={`object-contain ${className}`}
      loading={compact ? 'eager' : 'lazy'}
    />
  )
}
