import { useState, useMemo } from 'react'
import ResponsibleBanner from '../components/ResponsibleBanner'

/* ─── DATA ─── */
const BET_TYPES = [
  {
    id: 'ganador',
    name: 'Ganador del Partido',
    icon: '🏆',
    category: 'Básicas',
    what: 'El cliente apuesta por el equipo que ganará el partido.',
    example: 'Alianza Lima gana.',
    howToOffer: '"Señor, esta es la opción más simple: elegimos qué equipo gana el partido."',
    whenToUse: 'Cuando el cliente es nuevo o quiere una apuesta fácil.',
    mistake: 'Prometer que el equipo va a ganar.',
    responsible: '"Podemos revisar una opción interesante, pero toda apuesta tiene riesgo."',
  },
  {
    id: 'doble',
    name: 'Doble Oportunidad',
    icon: '2️⃣',
    category: 'Básicas',
    what: 'El cliente cubre dos posibles resultados a la vez.',
    example: 'Perú gana O empata.',
    howToOffer: '"Esta opción le da mayor cobertura, porque no depende solo de que gane; también le sirve el empate."',
    whenToUse: 'En partidos parejos o cuando el cliente busca algo más conservador.',
    mistake: 'Decir que no hay riesgo.',
    responsible: '"Cubre más escenarios, pero igual sigue siendo una apuesta."',
  },
  {
    id: 'mas-goles',
    name: 'Más de Goles',
    icon: '⬆️',
    category: 'Goles',
    what: 'El cliente apuesta a que habrá más goles que una línea definida.',
    example: 'Más de 1.5 goles = deben caer 2 goles o más.',
    howToOffer: '"No necesitamos saber quién gana. Solo que el partido tenga goles."',
    whenToUse: 'Cuando juegan equipos ofensivos o con tendencia a muchos goles.',
    mistake: 'No explicar qué significa 1.5, 2.5 o 3.5.',
    responsible: '"Revisemos la línea de goles antes de jugar."',
  },
  {
    id: 'menos-goles',
    name: 'Menos de Goles',
    icon: '⬇️',
    category: 'Goles',
    what: 'El cliente apuesta a que habrá menos goles que una línea definida.',
    example: 'Menos de 3.5 goles = el partido termina con 3 goles o menos.',
    howToOffer: '"Esta opción sirve cuando esperamos un partido cerrado o con pocos goles."',
    whenToUse: 'En clásicos, finales o partidos donde los equipos suelen cuidarse.',
    mistake: 'Confundir "menos de 3.5" con máximo 4 goles.',
    responsible: '"Hay que entender bien la línea antes de confirmar."',
  },
  {
    id: 'ambos-anotan',
    name: 'Ambos Equipos Anotan',
    icon: '🥅',
    category: 'Goles',
    what: 'El cliente apuesta a que los dos equipos harán al menos un gol.',
    example: 'Ambos equipos anotan: Sí.',
    howToOffer: '"No importa quién gane. Solo necesitamos que los dos equipos marquen."',
    whenToUse: 'Cuando ambos equipos suelen atacar o recibir goles.',
    mistake: 'Creer que también importa el resultado final del partido.',
    responsible: '"El resultado no importa, solo que ambos anoten."',
  },
  {
    id: 'exacto',
    name: 'Resultado Exacto',
    icon: '🎯',
    category: 'Especiales',
    what: 'El cliente apuesta por el marcador final exacto.',
    example: 'Perú 2 - 1 Chile.',
    howToOffer: '"Esta opción puede tener cuota más alta, pero debemos acertar el marcador exacto."',
    whenToUse: 'Con clientes que buscan cuotas altas y entienden el riesgo.',
    mistake: 'Ofrecerlo como opción fácil o frecuente.',
    responsible: '"Puede pagar mejor, pero es más difícil de acertar."',
  },
  {
    id: 'handicap',
    name: 'Handicap',
    icon: '⚖️',
    category: 'Especiales',
    what: 'Ventaja o desventaja virtual que se aplica a un equipo para efectos de la apuesta.',
    example: 'Equipo A +1.5 = empieza con 1.5 goles de ventaja virtual.',
    howToOffer: '"El handicap ayuda cuando creemos que un equipo puede competir bien, aunque no gane."',
    whenToUse: 'Cuando hay un favorito claro pero el otro equipo puede dar pelea.',
    mistake: 'No explicar que es una ventaja virtual, no real.',
    responsible: '"Primero revisemos qué significa el handicap antes de jugar."',
  },
  {
    id: 'corners',
    name: 'Total de Corners',
    icon: '🚩',
    category: 'Especiales',
    what: 'El cliente apuesta a la cantidad total de tiros de esquina en el partido.',
    example: 'Más de 8.5 corners = deben haber 9 corners o más.',
    howToOffer: '"Esta opción sirve cuando esperamos un partido con muchos ataques por las bandas."',
    whenToUse: 'Cuando hay equipos que atacan mucho por los costados.',
    mistake: 'Ofrecer corners sin explicar que no depende de goles.',
    responsible: '"Esta apuesta depende de los tiros de esquina, no del marcador."',
  },
  {
    id: 'tarjetas',
    name: 'Tarjetas',
    icon: '🟨',
    category: 'Especiales',
    what: 'El cliente apuesta a la cantidad de tarjetas del partido.',
    example: 'Más de 3.5 tarjetas = deben mostrarse 4 tarjetas o más.',
    howToOffer: '"Esta opción es interesante en partidos intensos, clásicos o de mucha rivalidad."',
    whenToUse: 'En clásicos, finales o partidos muy disputados.',
    mistake: 'No revisar si cuenta amarilla, roja o las condiciones exactas del mercado.',
    responsible: '"Siempre revisemos las condiciones antes de confirmar."',
  },
  {
    id: 'anotador',
    name: 'Anotador',
    icon: '⚽',
    category: 'Jugador',
    what: 'El cliente apuesta a que un jugador específico marcará gol.',
    example: 'Jugador X anota en cualquier momento.',
    howToOffer: '"Si el cliente sigue a algún jugador, podemos revisar la opción de anotador."',
    whenToUse: 'Cuando el cliente conoce jugadores, ligas o goleadores del torneo.',
    mistake: 'No validar si el jugador será titular o si el mercado está disponible.',
    responsible: '"Primero revisemos si el jugador y la opción están activos."',
  },
]

const CATEGORIES = ['Todas', 'Básicas', 'Goles', 'Especiales', 'Jugador']

const MINI_RETO = {
  situation: 'Un cliente dice: "Quiero ganar más con mi apuesta, ¿qué me recomiendas?"',
  options: [
    { text: 'Le ofrezco una Combinada corta (2-3 opciones de distintos partidos)', correct: true, feedback: '✅ Correcto. La combinada une varias selecciones y puede tener cuota más atractiva.' },
    { text: 'Le digo que apueste al resultado exacto porque paga más', correct: false, feedback: '❌ El resultado exacto es muy difícil. No es la mejor opción para alguien que quiere más sin saber el riesgo.' },
    { text: 'Le prometo que con BetBuilder "seguro gana más"', correct: false, feedback: '❌ Nunca prometas resultados. Toda apuesta tiene riesgo.' },
  ],
}

/* ─── MAIN COMPONENT ─── */
export default function BetTools({ onUpdatePoints }) {
  const [activeSection, setActiveSection] = useState('betbuilder')

  return (
    <div className="pb-24 animate-fade-in overflow-x-hidden w-full">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-orange via-orange-700 to-yellow-700 px-5 py-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 text-8xl opacity-10 rotate-12 translate-x-4 -translate-y-2">🛠️</div>
        <p className="text-xs font-bold text-orange-200 uppercase tracking-widest mb-1">Centro de Herramientas</p>
        <h1 className="text-2xl font-black text-white leading-tight">TE APUESTO</h1>
        <p className="text-sm text-orange-100 mt-1">Domina los mercados y explícalos con seguridad</p>
      </div>

      {/* Section tabs */}
      <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm px-4 py-2 border-b border-white/5">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection('betbuilder')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSection === 'betbuilder' ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}
          >
            🔄 BetBuilder vs Combinada
          </button>
          <button
            onClick={() => setActiveSection('types')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeSection === 'types' ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}
          >
            🎰 10 Tipos de Apuestas
          </button>
        </div>
      </div>

      <div className="px-4 py-4 max-w-4xl mx-auto">
        {activeSection === 'betbuilder' && <BetBuilderSection onPoints={onUpdatePoints} />}
        {activeSection === 'types' && <BetTypesSection onPoints={onUpdatePoints} />}
      </div>
    </div>
  )
}

/* ─── SECTION 1: BetBuilder vs Combinada ─── */
function BetBuilderSection({ onPoints }) {
  const [retoAnswer, setRetoAnswer] = useState(null)
  const [showTable, setShowTable] = useState(false)

  function handleReto(idx) {
    if (retoAnswer !== null) return
    setRetoAnswer(idx)
    if (MINI_RETO.options[idx].correct) onPoints && onPoints(20)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-black text-white">BetBuilder vs Combinada</h2>
        <p className="text-sm text-gray-500">¿Cuándo ofrecer cada una?</p>
      </div>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* COMBINADA */}
        <div className="bg-brand-dark rounded-2xl border border-blue-500/30 overflow-hidden">
          <div className="bg-blue-700/30 px-4 py-3 flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <p className="font-black text-white text-base">Combinada</p>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs font-bold text-blue-400 mb-1">¿Qué es?</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Une varias selecciones en un solo boleto. Pueden ser de distintos partidos. Para ganar, <span className="text-white font-semibold">todas deben acertar.</span>
              </p>
            </div>
            <div className="bg-brand-medium rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-2">📋 Ejemplo</p>
              <div className="space-y-1.5">
                {['✅ Real Madrid gana', '✅ Barcelona gana o empata', '✅ Más de 1.5 goles en Bayern vs Dortmund'].map((e, i) => (
                  <p key={i} className="text-xs text-gray-300">{e}</p>
                ))}
              </div>
            </div>
            <div className="bg-blue-900/30 border border-blue-600/20 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-300 mb-1">💬 Speech</p>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "Señor, podemos combinar 2 o 3 opciones para buscar una cuota más atractiva. Lo importante es que todas deben acertar."
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Distintos partidos', 'Cuota más alta', 'Todo debe acertar'].map(tag => (
                <span key={tag} className="text-xs bg-blue-700/20 text-blue-300 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* BETBUILDER */}
        <div className="bg-brand-dark rounded-2xl border border-brand-orange/30 overflow-hidden">
          <div className="bg-brand-orange/20 px-4 py-3 flex items-center gap-2">
            <span className="text-2xl">🏗️</span>
            <p className="font-black text-white text-base">BetBuilder</p>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs font-bold text-brand-orange mb-1">¿Qué es?</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Arma una jugada <span className="text-white font-semibold">más personalizada</span> combinando opciones permitidas de <span className="text-white font-semibold">un mismo partido.</span>
              </p>
            </div>
            <div className="bg-brand-medium rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-1">📋 Ejemplo (mismo partido)</p>
              <p className="text-xs text-gray-400 mb-2">Real Madrid vs Barcelona</p>
              <div className="space-y-1.5">
                {['✅ Real Madrid gana o empata', '✅ Más de 1.5 goles', '✅ Ambos equipos anotan'].map((e, i) => (
                  <p key={i} className="text-xs text-gray-300">{e}</p>
                ))}
              </div>
            </div>
            <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3">
              <p className="text-xs font-bold text-brand-orange mb-1">💬 Speech</p>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "Señor, con BetBuilder podemos armar una jugada más completa, eligiendo varias opciones permitidas del mismo partido."
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Un solo partido', 'Más personalizado', 'Opciones del sistema'].map(tag => (
                <span key={tag} className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table toggle */}
      <button
        onClick={() => setShowTable(!showTable)}
        className="w-full py-3 bg-brand-medium rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
      >
        <span>{showTable ? '▲' : '▼'}</span>
        {showTable ? 'Ocultar tabla comparativa' : 'Ver tabla comparativa'}
      </button>

      {showTable && (
        <div className="bg-brand-dark rounded-2xl border border-white/10 overflow-hidden animate-fade-in">
          <div className="grid grid-cols-3 text-xs font-bold text-center">
            <div className="p-3 bg-brand-medium text-gray-400 uppercase tracking-wider">Característica</div>
            <div className="p-3 bg-blue-700/30 text-blue-300">Combinada</div>
            <div className="p-3 bg-brand-orange/20 text-brand-orange">BetBuilder</div>
          </div>
          {[
            ['Partidos', 'Varios', 'Uno solo'],
            ['Personalización', 'Normal', 'Alta'],
            ['Para ganar', 'Todas acertan', 'Todas acertan'],
            ['Ideal para', 'Varias opciones', 'Jugada elaborada'],
            ['Cuota', 'Se multiplica', 'Se construye'],
          ].map(([feat, com, bet], i) => (
            <div key={i} className={`grid grid-cols-3 text-xs text-center ${i % 2 === 0 ? 'bg-brand-medium/30' : ''}`}>
              <div className="p-3 text-gray-400 font-semibold text-left">{feat}</div>
              <div className="p-3 text-gray-300">{com}</div>
              <div className="p-3 text-gray-300">{bet}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error block */}
      <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4">
        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">⚠️ Errores que NUNCA debes cometer</p>
        <div className="space-y-2">
          {['"Esta combinada es segura."', '"Este BetBuilder es fijo."', '"Esta apuesta no falla."'].map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-red-400">❌</span>
              <span className="text-sm text-red-300 italic">{e}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-brand-green/10 border border-brand-green/30 rounded-xl p-3">
          <p className="text-xs font-bold text-brand-green mb-1">✅ Di siempre esto</p>
          <p className="text-sm text-gray-300 italic">"Esta jugada tiene una cuota más atractiva, pero toda apuesta tiene riesgo."</p>
        </div>
      </div>

      {/* Mini reto */}
      <div className="bg-brand-dark border border-brand-yellow/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🎯</span>
          <div>
            <p className="text-xs font-bold text-brand-yellow uppercase tracking-wider">Mini Reto · +20 pts</p>
          </div>
        </div>
        <div className="bg-brand-medium rounded-xl p-3 mb-4">
          <p className="text-xs font-bold text-gray-400 mb-1">👤 El cliente te dice:</p>
          <p className="text-sm text-white font-semibold leading-relaxed">{MINI_RETO.situation}</p>
        </div>
        <p className="text-xs text-gray-500 mb-2">¿Qué haces?</p>
        <div className="space-y-2">
          {MINI_RETO.options.map((opt, idx) => {
            let style = 'border-white/10 text-gray-300 hover:border-brand-yellow/40'
            if (retoAnswer !== null) {
              if (opt.correct) style = 'border-brand-green bg-brand-green/10 text-brand-green'
              else if (idx === retoAnswer) style = 'border-red-500 bg-red-500/10 text-red-400'
              else style = 'border-white/5 text-gray-600 opacity-40'
            }
            return (
              <button
                key={idx}
                onClick={() => handleReto(idx)}
                className={`w-full text-left border rounded-xl p-3 text-sm leading-relaxed transition-all ${style}`}
              >
                {opt.text}
              </button>
            )
          })}
        </div>
        {retoAnswer !== null && (
          <div className={`mt-3 rounded-xl p-3 text-sm font-medium leading-relaxed ${MINI_RETO.options[retoAnswer].correct ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-medium text-gray-300'}`}>
            {MINI_RETO.options[retoAnswer].feedback}
            {MINI_RETO.options[retoAnswer].correct && <span className="ml-1 font-black">+20 pts 🎉</span>}
          </div>
        )}
      </div>

      <ResponsibleBanner compact />
    </div>
  )
}

/* ─── SECTION 2: 10 Bet Types ─── */
function BetTypesSection({ onPoints }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [expanded, setExpanded] = useState(null)

  const filtered = useMemo(() => BET_TYPES.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.what.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'Todas' || b.category === category
    return matchSearch && matchCat
  }), [search, category])

  function toggleExpand(id) {
    setExpanded(prev => prev === id ? null : id)
    if (expanded !== id) onPoints && onPoints(5)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-black text-white">10 Tipos de Apuestas</h2>
        <p className="text-sm text-gray-500">Los mercados más usados, explicados fácil</p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input
          type="text"
          placeholder="Buscar: goles, handicap, corners..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-brand-medium text-white placeholder-gray-500 rounded-xl py-3 pl-10 pr-4 text-sm border border-white/10 focus:border-brand-orange/50 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-lg leading-none">×</button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${category === cat ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400 hover:text-white'}`}
          >
            {cat === 'Todas' ? '🎰 Todas' : cat === 'Básicas' ? '⭐ Básicas' : cat === 'Goles' ? '⚽ Goles' : cat === 'Especiales' ? '🔥 Especiales' : '👤 Jugador'}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">{filtered.length} tipos de apuesta</p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-gray-400 text-sm">No hay resultados</p>
          <button onClick={() => { setSearch(''); setCategory('Todas') }} className="text-brand-orange text-sm mt-2">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bet, idx) => (
            <BetTypeCard
              key={bet.id}
              bet={bet}
              number={BET_TYPES.indexOf(bet) + 1}
              expanded={expanded === bet.id}
              onToggle={() => toggleExpand(bet.id)}
            />
          ))}
        </div>
      )}

      <ResponsibleBanner compact />
    </div>
  )
}

/* ─── Bet Type Card ─── */
const catColors = {
  'Básicas': { bg: 'bg-blue-700/20', border: 'border-blue-600/30', text: 'text-blue-300', dot: 'bg-blue-500' },
  'Goles': { bg: 'bg-green-700/20', border: 'border-green-600/30', text: 'text-green-300', dot: 'bg-green-500' },
  'Especiales': { bg: 'bg-purple-700/20', border: 'border-purple-600/30', text: 'text-purple-300', dot: 'bg-purple-500' },
  'Jugador': { bg: 'bg-brand-orange/10', border: 'border-brand-orange/30', text: 'text-brand-orange', dot: 'bg-brand-orange' },
}

function BetTypeCard({ bet, number, expanded, onToggle }) {
  const colors = catColors[bet.category] || catColors['Básicas']

  return (
    <div className={`bg-brand-dark rounded-2xl border transition-all duration-200 ${expanded ? 'border-brand-orange/40' : 'border-white/5'}`}>
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colors.bg} border ${colors.border}`}>
          {bet.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-gray-600">#{number}</span>
            <p className="font-bold text-white text-sm">{bet.name}</p>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${colors.bg} ${colors.text}`}>
            {bet.category}
          </span>
        </div>
        <span className={`text-gray-500 text-sm transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">

          {/* What */}
          <div className="bg-brand-medium rounded-xl p-3">
            <p className="text-xs font-bold text-gray-400 mb-1">📖 ¿Qué es?</p>
            <p className="text-sm text-gray-300 leading-relaxed">{bet.what}</p>
          </div>

          {/* Example */}
          <div className="bg-brand-medium rounded-xl p-3">
            <p className="text-xs font-bold text-brand-yellow mb-1">📋 Ejemplo</p>
            <p className="text-sm text-white font-semibold">{bet.example}</p>
          </div>

          {/* How to offer */}
          <div className={`${colors.bg} border ${colors.border} rounded-xl p-3`}>
            <p className={`text-xs font-bold mb-1 ${colors.text}`}>💬 Cómo ofrecerlo</p>
            <p className="text-sm text-gray-300 italic leading-relaxed">{bet.howToOffer}</p>
          </div>

          {/* When to use */}
          <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brand-green mb-1">✅ Cuándo usarlo</p>
            <p className="text-sm text-gray-300">{bet.whenToUse}</p>
          </div>

          {/* Mistake */}
          <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3">
            <p className="text-xs font-bold text-red-400 mb-1">⚠️ Error a evitar</p>
            <p className="text-sm text-gray-300">{bet.mistake}</p>
          </div>

          {/* Responsible */}
          <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brand-orange mb-1">🛡️ Mensaje responsable</p>
            <p className="text-sm text-gray-300 italic">{bet.responsible}</p>
          </div>
        </div>
      )}
    </div>
  )
}
