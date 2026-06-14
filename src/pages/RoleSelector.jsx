export default function RoleSelector({ onSelectPromotera, onSelectSupervisor, onSelectJefe }) {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center text-3xl mx-auto mb-3">🥊</div>
        <h1 className="text-2xl font-black text-white">Academia Guerrera</h1>
        <p className="text-xs text-gray-500 mt-1">TE APUESTO · Formación interna</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <div className="text-center mb-4">
          <h2 className="text-lg font-black text-white">¿Cómo ingresas?</h2>
          <p className="text-sm text-gray-500 mt-1">Selecciona tu rol para continuar</p>
        </div>

        {/* Promotora */}
        <button onClick={onSelectPromotera}
          className="w-full bg-brand-dark border-2 border-brand-orange/40 hover:border-brand-orange rounded-2xl p-5 text-left transition-all active:scale-95 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-orange/20 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-brand-orange/30 transition-all">🦁</div>
            <div className="flex-1">
              <p className="font-black text-white text-base">Soy Promotora</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Accede a tu academia, gana puntos y sube en el ranking</p>
            </div>
            <span className="text-brand-orange text-lg ml-auto">→</span>
          </div>
        </button>

        {/* Supervisor */}
        <button onClick={onSelectSupervisor}
          className="w-full bg-brand-dark border-2 border-purple-500/40 hover:border-purple-400 rounded-2xl p-5 text-left transition-all active:scale-95 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-purple-500/30 transition-all">📊</div>
            <div className="flex-1">
              <p className="font-black text-white text-base">Soy Supervisor/a</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Aprende y gestiona el avance de tus promotoras</p>
            </div>
            <span className="text-purple-400 text-lg ml-auto">→</span>
          </div>
        </button>

        {/* Jefe Regional */}
        <button onClick={onSelectJefe}
          className="w-full bg-brand-dark border-2 border-yellow-500/40 hover:border-yellow-400 rounded-2xl p-5 text-left transition-all active:scale-95 group">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-yellow-500/20 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-yellow-500/30 transition-all">🏆</div>
            <div className="flex-1">
              <p className="font-black text-white text-base">Soy Jefe Regional</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">Vista completa de supervisores, rankings y usabilidad de tu región</p>
            </div>
            <span className="text-yellow-400 text-lg ml-auto">→</span>
          </div>
        </button>

        <p className="text-xs text-gray-600 text-center pt-2">🛡️ Contenido interno · Solo personal autorizado adulto</p>
      </div>
    </div>
  )
}
