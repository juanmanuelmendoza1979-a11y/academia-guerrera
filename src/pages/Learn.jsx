import { useState } from 'react'
import sportsData from '../data/sportsLessons.json'
import ResponsibleBanner from '../components/ResponsibleBanner'

// ─── Terminal Pro data ────────────────────────────────────────────────────────
const TERMINAL_ITEMS = [
  { tipo: 'Ganador partido',    codigo: '1X2',   boton: 'SIMPLE',   emoji: '⚽', tip: 'Elige LOCAL / EMPATE / VISITA. La apuesta más rápida.' },
  { tipo: 'Doble Oportunidad',  codigo: '1X / X2 / 12', boton: 'D.OPOR', emoji: '🔄', tip: 'Cubre 2 de 3 resultados. Ideal para clientes conservadores.' },
  { tipo: 'Más / Menos Goles',  codigo: 'O/U',   boton: 'TOTALES', emoji: '🥅', tip: 'Over 1.5, 2.5, 3.5. Muy popular en partidos de alta cuota.' },
  { tipo: 'Ambos Anotan',       codigo: 'BTTS',  boton: 'AMB.AN.', emoji: '🎯', tip: 'Sí / No. Perfecta para agregar en BetBuilder.' },
  { tipo: 'BetBuilder',         codigo: 'BB',    boton: 'BETBUILD',emoji: '🔨', tip: 'Selecciona partido → agrega mercados → confirma cuota combinada.' },
  { tipo: 'Combinada',          codigo: 'ACUM',  boton: 'COMBI',   emoji: '🔗', tip: 'Agrega partidos uno a uno. Cuota se multiplica. Máx. recomendado: 3-4.' },
  { tipo: 'Pago Anticipado',    codigo: 'EARLYP',boton: 'AUTO',    emoji: '⚡', tip: 'Sistema automático. NO lo activa el cliente, aparece si aplica.' },
  { tipo: 'Cashout',            codigo: 'CO',    boton: 'CASHOUT', emoji: '💰', tip: 'Solo disponible si el ícono aparece activo en la apuesta vigente.' },
  { tipo: 'La Yapa',            codigo: 'YAPA',  boton: 'YAPA',    emoji: '🎁', tip: 'Verifica en cuenta del cliente. No siempre está activo.' },
  { tipo: 'Club Te Apuesto',    codigo: 'CTA',   boton: 'CLUB',    emoji: '🏅', tip: 'Invitación para clientes frecuentes. Informa, no promete beneficios.' },
]

const PLAN_TURNO = {
  antes: [
    { icon: '📱', accion: 'Revisa el calendario de partidos del día en la tablet' },
    { icon: '🌡️', accion: 'Identifica los 2-3 partidos más importantes para conversar con clientes' },
    { icon: '🏅', accion: 'Verifica si hay promociones o beneficios activos del Club Te Apuesto' },
    { icon: '🧠', accion: 'Repasa el speech del día y las objeciones más comunes' },
    { icon: '💻', accion: 'Asegúrate que la tablet y el terminal funcionen correctamente' },
    { icon: '🔐', accion: 'Recuerda: ningún resultado se garantiza. Orienta, no prometas' },
  ],
  durante: [
    { icon: '👋', accion: 'Saluda al cliente y pregunta en qué puedes ayudar' },
    { icon: '⚽', accion: 'Usa el Mundial o partido del día para abrir conversación natural' },
    { icon: '📋', accion: 'Explica siempre la jugada antes de registrar. El cliente decide' },
    { icon: '🔨', accion: 'Para clientes frecuentes: menciona BetBuilder, combinada corta o La Yapa' },
    { icon: '⏳', accion: 'Mientras espera: ofrece deportes virtuales o menciona el Club' },
    { icon: '🛡️', accion: 'Si el cliente duda: usa tu mánager de objeciones. Sin presión' },
  ],
  despues: [
    { icon: '👋', accion: 'Cierra bien: "Lo esperamos para los próximos encuentros"' },
    { icon: '🏅', accion: 'Invita al Club Te Apuesto si aún no se ha unido' },
    { icon: '📸', accion: 'Si el cliente ganó: recuérdale que puede cobrar aquí mismo, en efectivo' },
    { icon: '🔄', accion: 'Para el cliente que no jugó: deja la puerta abierta, sin presión' },
    { icon: '📊', accion: 'Anota mentalmente: ¿qué funcionó hoy? ¿qué objeción fue nueva?' },
    { icon: '⭐', accion: 'Cumple el reto del día en la Academia para sumar puntos y racha' },
  ],
}

export default function Learn({ onUpdatePoints }) {
  const [selectedSport, setSelectedSport] = useState(null)
  const [activeTab, setActiveTab] = useState('info')
  const [quizAnswers, setQuizAnswers] = useState({})
  const [mainSection, setMainSection] = useState('deportes') // 'deportes' | 'terminal' | 'turno'

  function handleQuizAnswer(qId, idx, correct) {
    if (quizAnswers[qId] !== undefined) return
    setQuizAnswers(prev => ({ ...prev, [qId]: idx }))
    if (idx === correct) onUpdatePoints(20)
  }

  if (selectedSport) {
    const sport = sportsData.sports.find(s => s.id === selectedSport)
    return (
      <div className="pb-24 animate-fade-in overflow-x-hidden w-full">
        <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm px-4 py-3 border-b border-white/5">
          <button onClick={() => { setSelectedSport(null); setActiveTab('info') }} className="text-brand-orange text-sm font-semibold flex items-center gap-2">
            ← Volver
          </button>
        </div>

        {/* Sport hero */}
        <div className="px-4 py-5 max-w-4xl mx-auto">
          <div className="rounded-2xl p-5 mb-4" style={{ background: `linear-gradient(135deg, ${sport.color}22, ${sport.color}11)`, border: `1px solid ${sport.color}44` }}>
            <span className="text-5xl block mb-2">{sport.icon}</span>
            <h1 className="text-2xl font-black text-white">{sport.name}</h1>
            <p className="text-sm text-gray-400 mt-1">{sport.tagline}</p>
          </div>

          {/* Sub-tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
            {['info', 'keywords', 'mistakes', 'quiz'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'
                }`}
              >
                {tab === 'info' ? '📖 Info' : tab === 'keywords' ? '🔑 Clave' : tab === 'mistakes' ? '⚠️ Errores' : '🧠 Quiz'}
              </button>
            ))}
          </div>

          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">¿Cómo se juega?</p>
                <p className="text-sm text-gray-300 leading-relaxed">{sport.howToPlay}</p>
              </div>
              <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
                <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-3">💼 Lo que debe saber una promotora</p>
                <div className="space-y-2">
                  {sport.promoterKeys.map((key, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 bg-brand-orange/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-brand-orange text-xs font-bold">{i + 1}</span>
                      </div>
                      <p className="text-sm text-gray-300">{key}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-brand-green/10 border border-brand-green/30 rounded-2xl p-4">
                <p className="text-xs font-bold text-brand-green uppercase tracking-wider mb-2">💬 Dato para el cliente</p>
                <p className="text-sm text-gray-300 leading-relaxed italic">{sport.clientTip}</p>
              </div>
            </div>
          )}

          {activeTab === 'keywords' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Conceptos clave para dominar</p>
              <div className="flex flex-wrap gap-2">
                {sport.keywords.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 bg-brand-medium rounded-full text-sm font-semibold text-brand-orange border border-brand-orange/20">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mistakes' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Errores comunes a evitar</p>
              {sport.commonMistakes.map((mistake, i) => (
                <div key={i} className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
                  <span className="text-red-400 text-lg flex-shrink-0">⚠️</span>
                  <p className="text-sm text-gray-300">{mistake}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Quiz · +20 pts por respuesta correcta</p>
              {sport.quiz.map((q, qi) => (
                <div key={q.question} className="bg-brand-dark rounded-2xl p-4 border border-white/5">
                  <p className="text-sm font-semibold text-white mb-3">{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, idx) => {
                      const answered = quizAnswers[`${sport.id}-${qi}`] !== undefined
                      const isSelected = quizAnswers[`${sport.id}-${qi}`] === idx
                      const isCorrect = idx === q.correct
                      let style = 'border-white/10 text-gray-300'
                      if (answered) {
                        if (isCorrect) style = 'border-brand-green bg-brand-green/10 text-brand-green'
                        else if (isSelected) style = 'border-red-500 bg-red-500/10 text-red-400'
                        else style = 'border-white/5 text-gray-600 opacity-40'
                      }
                      return (
                        <button
                          key={idx}
                          onClick={() => handleQuizAnswer(`${sport.id}-${qi}`, idx, q.correct)}
                          className={`w-full text-left border rounded-xl p-3 text-sm transition-all ${style}`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                    {quizAnswers[`${sport.id}-${qi}`] !== undefined && (
                      <p className="text-xs text-gray-400 italic mt-1">💡 {q.explanation}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const SECTIONS = [
    { id: 'deportes', icon: '⚽', label: 'Deportes' },
    { id: 'terminal', icon: '🖥️', label: 'Terminal Pro' },
    { id: 'turno',    icon: '⏱️', label: 'Plan de Turno' },
  ]

  return (
    <div className="pb-24 animate-fade-in overflow-x-hidden w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 max-w-4xl mx-auto">
        <h2 className="text-xl font-black text-white">Aprende Deportes</h2>
        <p className="text-sm text-gray-500">Conocimiento rápido para atender mejor</p>
      </div>

      {/* Section switcher — sticky */}
      <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm border-b border-white/5 px-4 pb-2">
        <div className="flex gap-1.5 pt-2 max-w-4xl mx-auto">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => { setMainSection(s.id); setSelectedSport(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                mainSection === s.id ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-4xl mx-auto">

        {/* ── DEPORTES ── */}
        {mainSection === 'deportes' && (
          <>
            <div className="space-y-3">
              {sportsData.sports.map(sport => (
                <button
                  key={sport.id}
                  onClick={() => { setSelectedSport(sport.id); setActiveTab('info') }}
                  className="w-full bg-brand-dark border border-white/5 rounded-2xl p-4 flex items-center gap-4 text-left hover:border-brand-orange/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{ background: `${sport.color}22`, border: `1px solid ${sport.color}44` }}>
                    {sport.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-white text-base">{sport.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{sport.tagline}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="text-xs bg-brand-medium text-gray-400 px-2 py-0.5 rounded-full">{sport.keywords.length} conceptos</span>
                      <span className="text-xs bg-brand-medium text-gray-400 px-2 py-0.5 rounded-full">{sport.quiz.length} quiz</span>
                    </div>
                  </div>
                  <span className="text-brand-orange text-xl">›</span>
                </button>
              ))}
            </div>
            <div className="bg-brand-dark rounded-2xl p-4 border border-brand-yellow/20">
              <p className="text-xs font-bold text-brand-yellow mb-2">⚡ Tip del día</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Cuando el cliente pregunte sobre un deporte que no conoces, usa el glosario o los tips de atención para orientarte antes de responder.
              </p>
            </div>
            <ResponsibleBanner compact />
          </>
        )}

        {/* ── TERMINAL PRO ── */}
        {mainSection === 'terminal' && (
          <>
            <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/30 rounded-2xl p-4">
              <p className="text-sm font-black text-white mb-0.5">🖥️ Guerrera Pro: El Terminal</p>
              <p className="text-xs text-blue-200 leading-relaxed">
                Referencia rápida de códigos y botones. Atiende en 10 segundos, evita colas y errores.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {TERMINAL_ITEMS.map((item, i) => (
                <TerminalCard key={i} item={item} />
              ))}
            </div>

            <div className="bg-brand-dark rounded-2xl p-4 border border-brand-orange/20">
              <p className="text-xs font-bold text-brand-orange mb-2">💡 Regla de velocidad</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Si tardas más de 15 segundos en encontrar un mercado, usa la búsqueda del terminal. El cliente que espera se va.
              </p>
            </div>
            <ResponsibleBanner compact />
          </>
        )}

        {/* ── PLAN DE TURNO ── */}
        {mainSection === 'turno' && (
          <>
            <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 border border-green-500/30 rounded-2xl p-4">
              <p className="text-sm font-black text-white mb-0.5">⏱️ Plan de Acción por Momento</p>
              <p className="text-xs text-green-200 leading-relaxed">
                Lo que hace una promotora efectiva ANTES, DURANTE y DESPUÉS de cada partido del día.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PlanTurnoSection fase="antes" emoji="🌅" titulo="ANTES del partido" color="blue" items={PLAN_TURNO.antes} />
            <PlanTurnoSection fase="durante" emoji="⚡" titulo="DURANTE el partido" color="orange" items={PLAN_TURNO.durante} />
            <PlanTurnoSection fase="despues" emoji="🌙" titulo="DESPUÉS del partido" color="green" items={PLAN_TURNO.despues} />
            </div>

            <div className="bg-brand-medium rounded-2xl p-4 border border-white/5">
              <p className="text-xs font-bold text-white mb-2">🔑 Recuerda siempre</p>
              <div className="space-y-1.5">
                {['Informar antes de confirmar', 'Nunca garantizar resultados', 'El cliente decide siempre', 'La buena atención fideliza'].map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-brand-green text-xs">✅</span>
                    <span className="text-xs text-gray-300">{r}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsibleBanner compact />
          </>
        )}
      </div>
    </div>
  )
}

// ─── Terminal Card ────────────────────────────────────────────────────────────
function TerminalCard({ item }) {
  const [open, setOpen] = useState(false)
  return (
    <button
      onClick={() => setOpen(v => !v)}
      className="w-full bg-brand-dark border border-white/5 rounded-xl p-3 text-left hover:border-blue-500/30 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl w-8 text-center flex-shrink-0">{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">{item.tipo}</p>
          {open && <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.tip}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-black text-blue-300 bg-blue-900/40 border border-blue-500/30 px-2 py-0.5 rounded font-mono">
            {item.codigo}
          </span>
          <span className="text-[10px] font-black text-brand-orange bg-brand-orange/10 border border-brand-orange/30 px-2 py-0.5 rounded font-mono">
            {item.boton}
          </span>
          <span className={`text-gray-500 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </div>
    </button>
  )
}

// ─── Plan Turno Section ───────────────────────────────────────────────────────
function PlanTurnoSection({ fase, emoji, titulo, color, items }) {
  const colorMap = {
    blue:   { bg: 'bg-blue-900/20',   border: 'border-blue-500/30',   title: 'text-blue-300',   dot: 'bg-blue-500' },
    orange: { bg: 'bg-orange-900/20', border: 'border-orange-500/30', title: 'text-orange-300', dot: 'bg-brand-orange' },
    green:  { bg: 'bg-green-900/20',  border: 'border-green-500/30',  title: 'text-green-300',  dot: 'bg-brand-green' },
  }
  const c = colorMap[color]
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
      <p className={`text-sm font-black ${c.title} mb-3`}>{emoji} {titulo}</p>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
            <p className="text-xs text-gray-300 leading-relaxed">{item.accion}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
