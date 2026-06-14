import { useState } from 'react'
import worldcupData from '../data/worldcupData.json'
import ResponsibleBanner from '../components/ResponsibleBanner'

export default function WorldCup({ onUpdatePoints, onNavigate }) {
  const [activeTab, setActiveTab] = useState('today')
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [quizAnswered, setQuizAnswered] = useState(null)

  const tabs = [
    { id: 'today', label: '🔥 Hoy', },
    { id: 'calendar', label: '📅 Partidos' },
    { id: 'teams', label: '🛡️ Selecciones' },
    { id: 'phases', label: '🗺️ Fases' },
  ]

  const quizQuestion = {
    question: '¿Cuántos equipos participan en el Mundial 2026?',
    options: ['32', '40', '48'],
    correct: 2,
  }

  function handleQuizAnswer(idx) {
    setQuizAnswered(idx)
    if (idx === quizQuestion.correct) {
      onUpdatePoints(15)
    }
  }

  return (
    <div className="pb-24 animate-fade-in">
      {/* Banner → WorldCup2026 */}
      {onNavigate && (
        <button
          onClick={() => onNavigate('worldcup2026')}
          className="w-full bg-gradient-to-r from-yellow-700/30 to-brand-orange/30 border-b border-brand-orange/40 px-4 py-2.5 flex items-center justify-between hover:from-yellow-700/40 hover:to-brand-orange/40 transition-all"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">🌍</span>
            <span className="text-sm font-bold text-brand-orange">Mundial 2026 — Centro Interactivo</span>
          </div>
          <span className="text-xs text-brand-orange font-bold">Ver todo ›</span>
        </button>
      )}

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-600 via-orange-600 to-red-700 p-6">
        <div className="absolute inset-0 opacity-10 text-8xl flex items-center justify-center">🌍</div>
        <div className="relative">
          <p className="text-xs font-bold text-yellow-200 uppercase tracking-widest">{worldcupData.tournament.currentPhase}</p>
          <h1 className="text-2xl font-black text-white mt-1">{worldcupData.tournament.name}</h1>
          <p className="text-sm text-yellow-100 mt-1">{worldcupData.tournament.hosts.join(' · ')} · {worldcupData.tournament.totalTeams} selecciones</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm px-4 py-2 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-orange text-white'
                  : 'bg-brand-medium text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
        {/* TODAY TAB */}
        {activeTab === 'today' && (
          <>
            {/* Featured match */}
            <FeaturedMatch match={worldcupData.featuredMatch} />

            {/* Daily fact */}
            <div className="bg-brand-dark rounded-2xl p-4 border border-brand-yellow/20">
              <p className="text-xs font-bold text-brand-yellow uppercase tracking-wider mb-2">💡 {worldcupData.dailyFact.category}</p>
              <p className="text-sm text-gray-300 leading-relaxed">{worldcupData.dailyFact.text}</p>
            </div>

            {/* Quick quiz */}
            <div className="bg-brand-dark rounded-2xl p-4 border border-brand-orange/20">
              <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-3">🧠 Pregunta mundialista · +15 pts</p>
              <p className="text-sm font-semibold text-white mb-3">{quizQuestion.question}</p>
              <div className="space-y-2">
                {quizQuestion.options.map((opt, idx) => {
                  let style = 'border-white/10 text-gray-300'
                  if (quizAnswered !== null) {
                    if (idx === quizQuestion.correct) style = 'border-brand-green bg-brand-green/10 text-brand-green'
                    else if (idx === quizAnswered) style = 'border-red-500 bg-red-500/10 text-red-400'
                    else style = 'border-white/5 text-gray-600'
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => quizAnswered === null && handleQuizAnswer(idx)}
                      className={`w-full text-left border rounded-xl p-3 text-sm transition-all ${style}`}
                    >
                      {opt}
                    </button>
                  )
                })}
                {quizAnswered !== null && (
                  <p className={`text-sm font-medium ${quizAnswered === quizQuestion.correct ? 'text-brand-green' : 'text-red-400'}`}>
                    {quizAnswered === quizQuestion.correct ? '🎉 ¡Correcto! El Mundial 2026 tiene 48 equipos.' : '💡 Son 48 equipos por primera vez en la historia.'}
                  </p>
                )}
              </div>
            </div>

            {/* Mini glossary */}
            <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
              <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">📖 Glosario Mundialista</p>
              <div className="space-y-3">
                {worldcupData.miniGlossary.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="text-brand-orange font-bold text-sm flex-shrink-0">{item.term}</span>
                    <span className="text-xs text-gray-400 leading-relaxed">{item.def}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Próximos partidos</p>
            {worldcupData.matches.map(match => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}

        {/* TEAMS TAB */}
        {activeTab === 'teams' && (
          <div className="space-y-3">
            {selectedTeam ? (
              <TeamDetail team={selectedTeam} onBack={() => setSelectedTeam(null)} />
            ) : (
              <>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Selecciona una ficha</p>
                <div className="grid grid-cols-2 gap-3">
                  {worldcupData.teams.map(team => (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeam(team)}
                      className="bg-brand-dark border border-white/5 rounded-2xl p-4 text-left hover:border-brand-orange/30 transition-all hover:scale-105"
                    >
                      <span className="text-4xl block mb-2">{team.flag}</span>
                      <p className="font-bold text-white text-sm">{team.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{team.group}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* PHASES TAB */}
        {activeTab === 'phases' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 uppercase tracking-wider">Estructura del torneo</p>
            {worldcupData.phases.map((phase, i) => (
              <div
                key={phase.id}
                className={`rounded-2xl p-4 border flex items-center gap-4 ${
                  phase.active
                    ? 'bg-brand-orange/10 border-brand-orange/40'
                    : 'bg-brand-dark border-white/5 opacity-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                  phase.active ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-500'
                }`}>
                  {i + 1}
                </div>
                <div>
                  <p className={`font-bold text-sm ${phase.active ? 'text-white' : 'text-gray-500'}`}>{phase.name}</p>
                  {phase.active && <p className="text-xs text-brand-orange">▶ En curso</p>}
                </div>
              </div>
            ))}
            <div className="bg-brand-dark rounded-2xl p-4 border border-white/5 mt-4">
              <p className="text-xs font-bold text-brand-yellow mb-2">💬 Cómo explicarlo al cliente</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                "El Mundial tiene dos grandes etapas: primero la fase de grupos, donde todos los equipos del grupo juegan entre sí.
                Luego viene la eliminación directa, donde quien pierde queda fuera. Es como dos torneos dentro del mismo."
              </p>
            </div>
          </div>
        )}

        <ResponsibleBanner compact />
      </div>
    </div>
  )
}

function FeaturedMatch({ match }) {
  const [showDetail, setShowDetail] = useState(false)
  return (
    <div className="bg-gradient-to-br from-brand-dark to-brand-medium rounded-2xl overflow-hidden border border-brand-orange/30">
      <div className="bg-brand-orange/10 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-bold text-brand-orange uppercase tracking-wider">🔥 Partido Destacado</span>
        <span className="text-xs text-gray-400">{match.phase}</span>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 text-center">
            <span className="text-5xl block mb-2">{match.flagA}</span>
            <p className="font-black text-white text-base">{match.teamA}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-2xl font-black text-brand-orange">VS</p>
            <p className="text-xs text-gray-500 mt-1">{match.time}</p>
          </div>
          <div className="flex-1 text-center">
            <span className="text-5xl block mb-2">{match.flagB}</span>
            <p className="font-black text-white text-base">{match.teamB}</p>
          </div>
        </div>
        <div className="bg-brand-black/50 rounded-xl p-3 mb-3">
          <p className="text-xs text-gray-400 flex items-center gap-1.5"><span>📍</span>{match.venue}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1"><span>📅</span>{match.date} · {match.time}</p>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed mb-3">💡 {match.keyFact}</p>
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="w-full py-2.5 bg-brand-orange rounded-xl text-sm font-bold text-white"
        >
          {showDetail ? 'Ocultar detalle' : '🔍 Ver ficha simple'}
        </button>
        {showDetail && (
          <div className="mt-3 bg-brand-black/50 rounded-xl p-4 text-sm text-gray-300 leading-relaxed space-y-2">
            <p>{match.summary}</p>
            <p className="text-xs text-brand-yellow border-t border-white/10 pt-2">
              💬 <strong>Para el cliente:</strong> {match.tip}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function MatchCard({ match }) {
  const statusColors = {
    proximo: 'text-brand-green bg-brand-green/10',
    finalizado: 'text-gray-400 bg-gray-400/10',
    destacado: 'text-brand-orange bg-brand-orange/10',
  }
  return (
    <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{match.phase}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${statusColors[match.status]}`}>
          {match.status === 'proximo' ? '🕐 Próximo' : match.status === 'destacado' ? '🔥 Destacado' : '✓ Jugado'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <span className="text-2xl">{match.flagA}</span>
          <span className="font-bold text-white text-sm">{match.teamA}</span>
        </div>
        <span className="text-xs text-gray-500 font-bold">VS</span>
        <div className="flex-1 flex items-center justify-end gap-2">
          <span className="font-bold text-white text-sm">{match.teamB}</span>
          <span className="text-2xl">{match.flagB}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <span>📅 {match.date}</span>
        <span>🕐 {match.time}</span>
      </div>
      <p className="text-xs text-gray-400 mt-2 leading-relaxed">💡 {match.keyFact}</p>
    </div>
  )
}

function TeamDetail({ team, onBack }) {
  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-brand-orange mb-4">
        ← Volver
      </button>
      <div className="bg-brand-dark rounded-2xl overflow-hidden border border-white/10">
        <div className="bg-gradient-to-r from-brand-orange/20 to-transparent p-6 flex items-center gap-4">
          <span className="text-6xl">{team.flag}</span>
          <div>
            <h2 className="text-2xl font-black text-white">{team.name}</h2>
            <p className="text-sm text-brand-orange">{team.group}</p>
          </div>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: '⚡ Estilo de juego', value: team.style },
            { label: '💪 Fortaleza', value: team.strength },
            { label: '🌟 Dato clave', value: team.fact },
          ].map((item, i) => (
            <div key={i} className="bg-brand-medium rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm text-white">{item.value}</p>
            </div>
          ))}
          <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-3">
            <p className="text-xs font-bold text-brand-orange mb-1">💬 Para conversar con el cliente</p>
            <p className="text-sm text-gray-300">{team.fact} — Un buen dato para generar conversación e interés.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
