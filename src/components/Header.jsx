export default function Header({ currentPage, userPoints, userLevel, isSupervisor, isJefe, onLogout, session }) {
  const titles = {
    home: null,                              // hero propio en Home
    puntoventa: 'Cómo ofrecer en el POS',
    speech: 'Speech Listo',
    learn: 'Aprende TE APUESTO',
    bettools: 'Herramientas TE APUESTO',
    worldcup2026: 'Mundial 2026',
    glossary: 'Glosario Fácil',
    games: 'Practica Jugando',
    tips: 'Tips de Atención',
    path: 'Mi Ruta Guerrera',
    ranking: 'Ranking de Guerreras',
    supervisor: 'Zona Supervisor',
  }

  const title = titles[currentPage]

  return (
    <header className="sticky top-0 z-40 bg-brand-black/95 backdrop-blur-sm border-b border-white/5">
      <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
        {title ? (
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white">{title}</h1>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className={`font-black text-xl ${isJefe ? 'text-yellow-400' : isSupervisor ? 'text-purple-400' : 'text-brand-orange'}`}>
              {isJefe ? '🏆' : isSupervisor ? '📊' : '⚡'}
            </span>
            <div>
              <p className="text-xs text-gray-500 leading-none">Academia</p>
              <p className={`text-sm font-black leading-tight ${isJefe ? 'text-yellow-400' : isSupervisor ? 'text-purple-400' : 'text-brand-orange'}`}>
                GUERRERA MUNDIALISTA
              </p>
            </div>
            {isJefe && (
              <span className="text-[9px] font-black bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full border border-yellow-500/30">
                JEFE REGIONAL
              </span>
            )}
            {isSupervisor && !isJefe && (
              <span className="text-[9px] font-black bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/30">
                SUPERVISOR
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-brand-medium rounded-full px-3 py-1.5">
            <span className="text-brand-yellow text-sm">⭐</span>
            <span className="text-sm font-bold text-white">{userPoints?.toLocaleString()}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-orange to-yellow-500 flex items-center justify-center text-sm font-bold">
            {userLevel}
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title="Cerrar sesión"
              className="w-8 h-8 rounded-full bg-brand-medium flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
            >
              <span className="text-base leading-none">⏏</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
