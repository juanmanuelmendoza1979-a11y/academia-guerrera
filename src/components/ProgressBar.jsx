export default function ProgressBar({ value, max = 100, color = 'orange', label, showPercent = true, height = 'h-2' }) {
  const percentage = Math.min(100, Math.round((value / max) * 100))

  const colorMap = {
    orange: 'bg-brand-orange',
    green: 'bg-brand-green',
    yellow: 'bg-brand-yellow',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
  }

  const barColor = colorMap[color] || 'bg-brand-orange'

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-400">{label}</span>}
          {showPercent && (
            <span className="text-xs font-bold" style={{ color: color === 'orange' ? '#FF6100' : color === 'green' ? '#19C37D' : '#FFD166' }}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-brand-medium rounded-full ${height} overflow-hidden`}>
        <div
          className={`${barColor} ${height} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
