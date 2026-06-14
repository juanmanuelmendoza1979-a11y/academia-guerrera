const BLOQUES = [
  {
    label: 'HOY EN MI POS',
    items: [
      { icon: '📅', label: 'Calendario de Partidos',   desc: 'Hoy y próximos 3 días · En vivo · Por liga',         page: 'calendario',  highlight: true },
      { icon: '🛒', label: 'Cómo ofrecer en POS',    desc: '12 situaciones · Objeciones · Plan del día',         page: 'puntoventa',  highlight: true },
      { icon: '💬', label: 'Speech Listo',             desc: 'Frases · Objeciones en chat · Venta cruzada',        page: 'speech' },
    ],
  },
  {
    label: 'APRENDE TE APUESTO',
    items: [
      { icon: '📚', label: 'Aprende TE APUESTO',      desc: 'Deportes · Terminal Pro · Plan de turno',             page: 'learn' },
      { icon: '🛠️', label: 'Herramientas TE APUESTO', desc: 'La Yapa · BetBuilder · Cashout · Pago Anticipado',   page: 'bettools', highlight: true },
      { icon: '🌍', label: 'Mundial 2026',             desc: 'Grupos · Estadios · Datos Calientes · Trivia',        page: 'worldcup2026', highlight: true },
      { icon: '🔤', label: 'Glosario Fácil',           desc: 'Busca cualquier término en segundos',                page: 'glossary' },
    ],
  },
  {
    label: 'PRACTICA Y GANA PUNTOS',
    items: [
      { icon: '🎮', label: 'Practica Jugando',         desc: 'Trivias · Casos reales · Retos por herramienta',     page: 'games' },
      { icon: '💡', label: 'Tips de Atención',         desc: '9 claves para atender mejor al cliente',             page: 'tips' },
    ],
  },
  {
    label: 'MI AVANCE',
    items: [
      { icon: '🛤️', label: 'Mi Ruta Guerrera',        desc: 'Tu progreso por niveles: Inicial → Experta',         page: 'path' },
      { icon: '🏅', label: 'Ranking de Guerreras',     desc: 'Puntos · Racha · Insignias · Posición',              page: 'ranking' },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { icon: '🔐', label: 'Zona Supervisor',          desc: 'Dashboard · Radar de avance · Alertas al equipo',    page: 'supervisor' },
    ],
  },
]

export default function More({ onNavigate, isSupervisor, isJefe }) {
  const puedeVerGestion = isSupervisor || isJefe

  return (
    <div className="px-4 py-4 pb-24 max-w-4xl mx-auto animate-fade-in space-y-5">
      <div className="mb-2">
        <h2 className="text-xl font-black text-white">Todas las secciones</h2>
        <p className="text-sm text-gray-500">Organizadas por bloques de uso</p>
      </div>

      {BLOQUES.filter(b => b.label !== 'GESTIÓN' || puedeVerGestion).map(bloque => (
        <div key={bloque.label}>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 px-1">
            {bloque.label}
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {bloque.items.map(item => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`w-full rounded-2xl p-4 text-left flex items-center gap-4 transition-all hover:scale-[1.01] ${
                  item.highlight
                    ? 'bg-brand-orange/10 border-2 border-brand-orange/50 hover:border-brand-orange'
                    : 'bg-brand-dark border border-white/5 hover:border-brand-orange/30'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-brand-medium flex items-center justify-center text-2xl flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{item.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{item.desc}</p>
                </div>
                <span className="text-brand-orange text-xl flex-shrink-0">›</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
