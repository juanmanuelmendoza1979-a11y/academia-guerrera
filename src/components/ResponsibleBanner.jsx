export default function ResponsibleBanner({ compact = false }) {
  if (compact) {
    return (
      <div className="bg-brand-medium border border-brand-orange/20 rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-gray-400">
        <span>🛡️</span>
        <span>Capacitación interna · Personal autorizado adulto</span>
      </div>
    )
  }

  return (
    <div className="bg-brand-dark border border-brand-orange/30 rounded-2xl p-4 mb-4">
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">🛡️</div>
        <div>
          <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">
            Aviso importante
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Capacitación interna para personal autorizado adulto. La información debe usarse para orientar
            de manera clara y responsable.{' '}
            <span className="text-brand-yellow font-semibold">
              Ningún resultado deportivo puede garantizarse.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
