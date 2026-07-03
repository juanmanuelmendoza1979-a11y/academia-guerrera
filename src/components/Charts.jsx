// Componentes de gráficos reutilizables — sin dependencias externas

export function DonutChart({ segments, label, sublabel, size = 110 }) {
  const total = segments.reduce((s, g) => s + g.val, 0)
  let cum = 0
  const segs = segments.map(seg => {
    const pct  = total > 0 ? (seg.val / total) * 100 : 0
    const item = { ...seg, pct, start: cum }
    cum += pct
    return item
  })
  const gradient = total === 0
    ? '#1f2937 0% 100%'
    : segs.filter(s => s.val > 0)
        .map(s => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
        .join(', ')
  const hole = Math.round(size * 0.58)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center"
        style={{ width: size, height: size }}>
        <div className="rounded-full"
          style={{ width: size, height: size, background: `conic-gradient(${gradient})` }} />
        <div className="absolute rounded-full bg-brand-dark flex flex-col items-center justify-center"
          style={{ width: hole, height: hole }}>
          <p className="text-base font-black text-white leading-none">{label}</p>
          {sublabel && <p className="text-[8px] text-gray-500 leading-tight text-center px-1">{sublabel}</p>}
        </div>
      </div>
      <div className="w-full space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <p className="text-[10px] text-gray-400 flex-1 truncate leading-tight">{s.label}</p>
            <p className="text-[10px] font-black text-white">{s.val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BarChart({ items, unit = '', gradientClass = 'from-yellow-500 to-orange-500', showSub = false }) {
  const max = Math.max(...items.map(i => i.val), 1)
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {item.rank && (
                <span className={`text-[10px] font-black w-5 text-center flex-shrink-0 ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-gray-600'
                }`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
              )}
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate leading-tight">{item.label}</p>
                {showSub && item.sub && <p className="text-[9px] text-gray-500 truncate">{item.sub}</p>}
              </div>
            </div>
            <p className="text-xs font-black text-white ml-2 flex-shrink-0">{unit}{item.val.toLocaleString()}</p>
          </div>
          <div className="w-full bg-brand-medium rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full bg-gradient-to-r ${gradientClass} transition-all duration-500`}
              style={{ width: `${Math.max((item.val / max) * 100, 2)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
