export default function Badge({ icon, name, earned = false, size = 'md' }) {
  const sizes = {
    sm: { outer: 'w-10 h-10 text-xl', text: 'text-xs' },
    md: { outer: 'w-14 h-14 text-2xl', text: 'text-xs' },
    lg: { outer: 'w-20 h-20 text-4xl', text: 'text-sm' },
  }

  const s = sizes[size] || sizes.md

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${s.outer} rounded-2xl flex items-center justify-center relative transition-all duration-300 ${
          earned
            ? 'bg-gradient-to-br from-brand-orange to-yellow-500 shadow-lg shadow-brand-orange/30'
            : 'bg-brand-medium opacity-40 grayscale'
        }`}
      >
        <span>{icon}</span>
        {earned && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-green rounded-full flex items-center justify-center">
            <span className="text-xs">✓</span>
          </div>
        )}
      </div>
      {name && (
        <span className={`${s.text} text-center font-medium leading-tight ${earned ? 'text-white' : 'text-gray-500'}`}>
          {name}
        </span>
      )}
    </div>
  )
}
