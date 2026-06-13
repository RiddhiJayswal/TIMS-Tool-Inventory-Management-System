const STATUS_STYLES = {
  // Requisition statuses
  pending:         'bg-yellow-100 text-yellow-800',
  approved:        'bg-blue-100 text-blue-800',
  rejected:        'bg-red-100 text-red-800',
  issued:          'bg-purple-100 text-purple-800',
  returned:        'bg-green-100 text-green-800',
  cancelled:       'bg-gray-100 text-gray-600',
  // Tool statuses
  active:          'bg-green-100 text-green-800',
  calibration_due: 'bg-amber-100 text-amber-800',
  damaged:         'bg-red-100 text-red-800',
  written_off:     'bg-gray-100 text-gray-500',
  // Return conditions
  good:            'bg-green-100 text-green-800',
  missing:         'bg-red-200 text-red-900',
  partial:         'bg-orange-100 text-orange-800',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status?.replace(/_/g, ' ').toUpperCase()}
    </span>
  )
}
