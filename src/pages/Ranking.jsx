import { useState, useEffect } from 'react'
import { obtenerRanking } from '../lib/db'
import Avatar from '../components/Avatar'

const MEDAL = ['🥇', '🥈', '🥉']

const NIVEL_LABEL = {
  Inicial: { label: 'Inicial', color: 'text-gray-400' },
  Bronce:  { label: 'Bronce',  color: 'text-orange-400' },
  Plata:   { label: 'Plata',   color: 'text-gray-300' },
  Oro:     { label: 'Oro',     color: 'text-yellow-400' },
  Experta: { label: 'Experta', color: 'text-brand-orange' },
}

export default function Ranking({ session, localPoints }) {
  const [tab, setTab]       = useState('promoters')
  const [lista, setLista]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  const tabs = [
    { id: 'promoters', label: '🥇 Ranking' },
    { id: 'miperfil',  label: '👤 Mi Perfil' },
    { id: 'insignias', label: '🏅 Insignias' },
  ]

  useEffect(() => {
    cargarRanking()
  }, [])

  async function cargarRanking() {
    setLoading(true)
    setError(false)
    try {
      const data = await obtenerRanking()
      setLista(data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  // Posición de la guerrera actual
  const miPosicion = lista.findIndex(g => g.id === session?.id) + 1

  // Top 3 para el podio
  const top3 = lista.slice(0, 3)

  return (
    <div className="pb-24 animate-fade-in">
      {/* Podio */}
      <div className="bg-gradient-to-b from-brand-orange/20 to-brand-black px-4 pt-6 pb-2">
        {loading ? (
          <div className="flex items-center justify-center h-24">
            <span className="text-gray-500 text-sm animate-pulse">Cargando ranking...</span>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm mb-2">No se pudo cargar el ranking</p>
            <button onClick={cargarRanking} className="text-brand-orange text-xs underline">Reintentar</button>
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-2">🏆</p>
            <p className="text-white font-bold">¡Sé la primera en el ranking!</p>
            <p className="text-gray-500 text-xs mt-1">Completa retos para ganar puntos</p>
          </div>
        ) : (
          <div className="flex items-end justify-center gap-4 mb-4">
            {/* 2do */}
            {top3[1] && (
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${top3[1].id === session?.id ? 'border-brand-orange' : 'border-gray-400/40'} mx-auto mb-1`}>
                  <Avatar seed={top3[1].avatar} size="lg" className="w-full h-full rounded-full" />
                </div>
                <p className="text-xs font-bold text-gray-400">2°</p>
                <p className="text-xs text-gray-500 max-w-[60px] truncate mx-auto">{top3[1].nombre?.split(' ')[0]}</p>
                <p className="text-xs font-bold text-gray-400">{top3[1].puntos} pts</p>
                <div className="h-12 bg-gray-400/20 rounded-t-xl w-16 mt-1" />
              </div>
            )}
            {/* 1ro */}
            {top3[0] && (
              <div className="text-center -mb-1">
                <div className="text-2xl mb-0.5">👑</div>
                <div className={`w-14 h-14 rounded-full overflow-hidden border-2 ${top3[0].id === session?.id ? 'border-brand-orange' : 'border-yellow-400'} mx-auto mb-1`}>
                  <Avatar seed={top3[0].avatar} size="xl" className="w-full h-full rounded-full" />
                </div>
                <p className="text-xs font-bold text-yellow-400">1°</p>
                <p className="text-xs text-white max-w-[70px] truncate font-bold mx-auto">{top3[0].nombre?.split(' ')[0]}</p>
                <p className="text-xs font-bold text-yellow-400">{top3[0].puntos} pts</p>
                <div className="h-16 bg-yellow-400/20 rounded-t-xl w-16 mt-1" />
              </div>
            )}
            {/* 3ro */}
            {top3[2] && (
              <div className="text-center">
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${top3[2].id === session?.id ? 'border-brand-orange' : 'border-orange-700/40'} mx-auto mb-1`}>
                  <Avatar seed={top3[2].avatar} size="lg" className="w-full h-full rounded-full" />
                </div>
                <p className="text-xs font-bold text-orange-600">3°</p>
                <p className="text-xs text-gray-500 max-w-[60px] truncate mx-auto">{top3[2].nombre?.split(' ')[0]}</p>
                <p className="text-xs font-bold text-orange-600">{top3[2].puntos} pts</p>
                <div className="h-8 bg-orange-700/20 rounded-t-xl w-16 mt-1" />
              </div>
            )}
          </div>
        )}

        {/* Mi posición banner */}
        {session && miPosicion > 0 && (
          <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar seed={session.avatar} size="sm" />
              <div>
                <p className="text-xs font-bold text-white">{session.nombre?.split(' ')[0]} · Tú</p>
                <p className="text-xs text-gray-500">{session.pos}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-brand-orange font-black text-lg">#{miPosicion}</p>
              <p className="text-xs text-gray-500">{localPoints} pts</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm px-4 py-2 border-b border-white/5">
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                tab === t.id ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 max-w-4xl mx-auto">

        {/* ── TAB: RANKING ── */}
        {tab === 'promoters' && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Top 50 · Puntos de aprendizaje</p>
              <button onClick={cargarRanking} className="text-xs text-gray-600 hover:text-brand-orange transition-all">↻ Actualizar</button>
            </div>

            {loading && (
              <div className="space-y-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 bg-brand-dark rounded-2xl border border-white/5 animate-pulse" />
                ))}
              </div>
            )}

            {!loading && lista.map((g, i) => (
              <div
                key={g.id}
                className={`flex items-center gap-3 rounded-2xl p-3 border transition-all ${
                  g.id === session?.id
                    ? 'bg-brand-orange/10 border-brand-orange/40'
                    : i === 0 ? 'bg-yellow-400/5 border-yellow-400/20'
                    : i === 1 ? 'bg-gray-400/5 border-gray-400/20'
                    : i === 2 ? 'bg-orange-700/5 border-orange-700/20'
                    : 'bg-brand-dark border-white/5'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                  i === 0 ? 'bg-yellow-400 text-brand-black'
                  : i === 1 ? 'bg-gray-400 text-brand-black'
                  : i === 2 ? 'bg-orange-700 text-white'
                  : 'bg-brand-medium text-gray-400'
                }`}>
                  {i < 3 ? MEDAL[i] : g.rank}
                </div>
                <Avatar seed={g.avatar} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">
                    {g.nombre}
                    {g.id === session?.id && <span className="ml-1 text-brand-orange text-xs">· Tú</span>}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{g.pos} · {g.region}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-brand-orange">{g.puntos}</p>
                  <p className="text-xs text-gray-500">pts</p>
                  <div className="flex items-center gap-1 justify-end mt-0.5">
                    <span className="text-xs">🔥</span>
                    <span className="text-xs text-gray-500">{g.racha}d</span>
                  </div>
                </div>
              </div>
            ))}

            {!loading && lista.length === 0 && !error && (
              <div className="text-center py-10">
                <p className="text-4xl mb-3">🏆</p>
                <p className="text-white font-bold">El ranking está vacío</p>
                <p className="text-gray-500 text-sm mt-1">¡Completa retos para ser la primera!</p>
              </div>
            )}
          </>
        )}

        {/* ── TAB: MI PERFIL ── */}
        {tab === 'miperfil' && session && (
          <div className="space-y-3">
            {/* Tarjeta de perfil */}
            <div className="bg-gradient-to-br from-brand-orange/20 to-brand-dark rounded-2xl p-5 border border-brand-orange/30">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-orange/50 flex-shrink-0">
                  <Avatar seed={session.avatar} size="2xl" className="w-full h-full rounded-full" />
                </div>
                <div>
                  <p className="text-lg font-black text-white">{session.nombre}</p>
                  <p className="text-sm text-gray-400">{session.pos}</p>
                  <p className="text-xs text-gray-500">{session.region}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Puntos', value: localPoints, color: 'text-brand-orange' },
                  { label: 'Racha', value: `${session.racha || 1}d 🔥`, color: 'text-yellow-400' },
                  { label: 'Posición', value: miPosicion > 0 ? `#${miPosicion}` : '–', color: 'text-white' },
                ].map(s => (
                  <div key={s.label} className="bg-black/30 rounded-xl p-3 text-center">
                    <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Insignias */}
            {session.insignias?.length > 0 ? (
              <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Mis insignias</p>
                <div className="flex flex-wrap gap-2">
                  {session.insignias.map((ins, i) => (
                    <span key={i} className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl px-3 py-1 text-sm">{ins}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-brand-dark rounded-2xl p-4 border border-white/5 text-center">
                <p className="text-2xl mb-2">🏅</p>
                <p className="text-sm text-gray-500">Aún no tienes insignias.</p>
                <p className="text-xs text-gray-600">¡Completa retos para ganar la primera!</p>
              </div>
            )}

            <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-gray-500 leading-relaxed">
                🛡️ Tus puntos se sincronizan en la nube. Puedes acceder desde cualquier dispositivo con tu nombre, punto de venta y PIN.
              </p>
            </div>
          </div>
        )}

        {/* ── TAB: INSIGNIAS ── */}
        {tab === 'insignias' && (
          <>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Insignias disponibles en la Academia</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '⚡', name: 'Primera Jugada', desc: 'Completa tu primer reto', pts: 50 },
                { icon: '🔥', name: 'Racha Guerrera', desc: '7 días consecutivos activa', pts: 100 },
                { icon: '🎯', name: 'Experta en Speech', desc: 'Completa todos los speeches', pts: 80 },
                { icon: '🌍', name: 'Mundialista', desc: 'Domina el módulo Mundial 2026', pts: 120 },
                { icon: '🛠️', name: 'Maestra de Herramientas', desc: 'Usa todas las herramientas', pts: 150 },
                { icon: '🏆', name: 'Top 10', desc: 'Llega al top 10 del ranking', pts: 200 },
                { icon: '💎', name: 'Nivel Experta', desc: 'Alcanza el nivel máximo', pts: 300 },
                { icon: '🌟', name: 'Guerrera del Mes', desc: 'Mayor puntaje del mes', pts: 500 },
              ].map(b => (
                <div key={b.name} className="bg-brand-dark rounded-2xl p-4 border border-white/5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-3xl mx-auto mb-2">
                    {b.icon}
                  </div>
                  <p className="text-xs font-bold text-white leading-tight">{b.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-tight">{b.desc}</p>
                  <p className="text-brand-orange font-black text-sm mt-1">+{b.pts} pts</p>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="bg-brand-dark rounded-2xl p-4 border border-green-500/20">
          <p className="text-xs font-bold text-green-400 mb-1">ℹ️ Ranking de aprendizaje</p>
          <p className="text-xs text-gray-400 leading-relaxed">
            Este ranking mide puntos de aprendizaje ganados en juegos, retos y lecciones. No refleja ventas ni montos apostados.
          </p>
        </div>
      </div>
    </div>
  )
}
