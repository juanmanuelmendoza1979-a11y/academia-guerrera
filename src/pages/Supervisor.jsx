import { useState, useEffect } from 'react'
import { obtenerPromotorasDeSupervisor } from '../lib/db'
import Avatar from '../components/Avatar'

const NIVELES = {
  'Inicial':    { color: 'text-gray-400',   bg: 'bg-gray-500/20' },
  'Bronce':     { color: 'text-amber-600',  bg: 'bg-amber-600/20' },
  'Plata':      { color: 'text-gray-300',   bg: 'bg-gray-400/20' },
  'Oro':        { color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  'Diamante':   { color: 'text-cyan-400',   bg: 'bg-cyan-400/20' },
}

function nivelDeNombre(nivel) {
  return NIVELES[nivel] || NIVELES['Inicial']
}

function ultimaActividadTexto(fechaStr) {
  if (!fechaStr) return 'Sin actividad'
  const hoy = new Date().toDateString()
  const ayer = new Date(Date.now() - 86400000).toDateString()
  if (fechaStr === hoy)  return 'Hoy ✅'
  if (fechaStr === ayer) return 'Ayer'
  try {
    const d = new Date(fechaStr)
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })
  } catch { return fechaStr }
}

export default function Supervisor({ session }) {
  const [tab, setTab]           = useState('dashboard')
  const [promotoras, setPromotoras] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!session?.nombre) return
    setLoading(true)
    obtenerPromotorasDeSupervisor(session.nombre)
      .then(data => { setPromotoras(data); setLoading(false) })
      .catch(() => { setError('Error al cargar datos. Verifica tu conexión.'); setLoading(false) })
  }, [session?.nombre])

  const hoy        = new Date().toDateString()
  const activasHoy = promotoras.filter(p => p.ultimoAccesoFecha === hoy)
  const rezagadas  = promotoras.filter(p => p.ultimoAccesoFecha !== hoy)
  const promPuntos = promotoras.length
    ? Math.round(promotoras.reduce((s, p) => s + (p.puntos || 0), 0) / promotoras.length)
    : 0
  const enRacha    = promotoras.filter(p => (p.racha || 0) >= 3)

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'equipo',    icon: '👥', label: 'Mi Equipo' },
  ]

  return (
    <div className="pb-24 animate-fade-in">

      {/* Header supervisor */}
      <div className="bg-gradient-to-br from-purple-900 to-brand-dark border-b border-purple-500/20 px-4 py-5">
        <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Zona Supervisor</p>
        <h2 className="text-xl font-black text-white mt-0.5">Hola, {session?.nombre?.split(' ')[0]} 👋</h2>
        <p className="text-xs text-gray-400 mt-1">
          Jefe: <span className="text-purple-300 font-semibold">{session?.jefe}</span>
          {' · '}{promotoras.length} promotora{promotoras.length !== 1 ? 's' : ''} en tu equipo
        </p>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-brand-black/95 backdrop-blur-sm border-b border-white/5 px-4 pb-2 pt-3">
        <div className="flex gap-1.5 max-w-4xl mx-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.id ? 'bg-purple-600 text-white' : 'bg-brand-medium text-gray-400'
              }`}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-24 space-y-4 max-w-4xl mx-auto">

        {/* Estado de carga */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl animate-spin">⏳</span>
            <p className="text-sm text-gray-400">Cargando tu equipo...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button onClick={() => window.location.reload()} className="text-xs text-red-300 mt-2 underline">Reintentar</button>
          </div>
        )}

        {!loading && !error && (

          <>
          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && (
            <>
              {/* Stats chips */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon:'👥', valor: promotoras.length, label:'Total equipo',   sub:'promotoras',        color:'bg-blue-700/20 border-blue-600/30' },
                  { icon:'⚡', valor: activasHoy.length,  label:'Activas hoy',   sub:`de ${promotoras.length}`, color:'bg-green-700/20 border-green-600/30' },
                  { icon:'⭐', valor: promPuntos,         label:'Pts promedio',   sub:'del equipo',        color:'bg-brand-orange/20 border-brand-orange/30' },
                  { icon:'🔥', valor: enRacha.length,     label:'En racha',       sub:'3+ días seguidos',  color:'bg-purple-700/20 border-purple-600/30' },
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl p-4 border ${s.color}`}>
                    <span className="text-2xl block mb-1">{s.icon}</span>
                    <p className="text-2xl font-black text-white">{s.valor}</p>
                    <p className="text-xs font-bold text-white/80 leading-tight">{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Activas hoy */}
              {activasHoy.length > 0 && (
                <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-green-900/20">
                    <p className="text-sm font-bold text-green-300">✅ Activas hoy — {activasHoy.length}</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {activasHoy.map((p, i) => (
                      <PromotoraRow key={p.id || i} p={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Rezagadas */}
              {rezagadas.length > 0 && (
                <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-red-900/20">
                    <p className="text-sm font-bold text-red-300">⚠️ Sin actividad hoy — {rezagadas.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pueden necesitar motivación extra</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {rezagadas.map((p, i) => (
                      <PromotoraRow key={p.id || i} p={p} />
                    ))}
                  </div>
                </div>
              )}

              {/* Sin promotoras aún */}
              {promotoras.length === 0 && (
                <div className="bg-brand-dark rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <span className="text-4xl block mb-3">👥</span>
                  <p className="text-sm font-bold text-white mb-1">Aún no hay promotoras registradas</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Cuando tus promotoras creen su cuenta y te seleccionen como supervisora, aparecerán aquí automáticamente.
                  </p>
                </div>
              )}

              <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  🛡️ Solo ves a tus promotoras. Datos de aprendizaje, no métricas de venta.
                </p>
              </div>
            </>
          )}

          {/* ── MI EQUIPO (lista completa) ── */}
          {tab === 'equipo' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">
                  Tu equipo completo · <span className="text-purple-400">{promotoras.length} promotoras</span>
                </p>
                <p className="text-xs text-gray-500">Ordenadas por puntos</p>
              </div>

              {promotoras.length === 0 ? (
                <div className="bg-brand-dark rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <span className="text-4xl block mb-3">👥</span>
                  <p className="text-sm font-bold text-white mb-1">Equipo vacío por ahora</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Las promotoras que te seleccionen al registrarse aparecerán aquí.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {promotoras.map((p, i) => (
                    <div key={p.id || i} className="bg-brand-dark rounded-2xl border border-white/5 p-4">
                      <div className="flex items-center gap-3">
                        {/* Ranking # */}
                        <span className="text-xs font-black text-gray-600 w-5 flex-shrink-0 text-center">#{i+1}</span>
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-brand-orange/20 flex-shrink-0">
                          <Avatar seed={p.avatar} size="md" className="w-full h-full rounded-full" />
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{p.nombre}</p>
                          <p className="text-xs text-gray-500 truncate">{p.pos}</p>
                        </div>
                        {/* Puntos */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-brand-orange">⭐ {p.puntos || 0}</p>
                          <p className="text-xs text-gray-500">🔥 {p.racha || 0}d racha</p>
                        </div>
                      </div>
                      {/* Barra de detalle */}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${nivelDeNombre(p.nivel).bg} ${nivelDeNombre(p.nivel).color}`}>
                          {p.nivel || 'Inicial'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          p.ultimoAccesoFecha === hoy
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {ultimaActividadTexto(p.ultimoAccesoFecha)}
                        </span>
                        {(p.insignias?.length || 0) > 0 && (
                          <span className="text-[10px] text-gray-500">🏅 {p.insignias.length} insignia{p.insignias.length !== 1 ? 's' : ''}</span>
                        )}
                        {(p.retosCompletados || 0) > 0 && (
                          <span className="text-[10px] text-gray-500">🎯 {p.retosCompletados} retos</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  🔄 Los datos se actualizan cada vez que una promotora inicia sesión o completa una actividad.
                </p>
              </div>
            </>
          )}
          </>
        )}

      </div>
    </div>
  )
}

function PromotoraRow({ p }) {
  const hoy = new Date().toDateString()
  const activa = p.ultimoAccesoFecha === hoy
  return (
    <div className="px-4 py-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full overflow-hidden border border-brand-orange/20 flex-shrink-0">
        <Avatar seed={p.avatar} size="sm" className="w-full h-full rounded-full" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{p.nombre}</p>
        <p className="text-xs text-gray-500 truncate">{p.pos}</p>
      </div>
      <div className="text-right flex-shrink-0 space-y-0.5">
        <p className="text-xs font-bold text-brand-orange">⭐ {p.puntos || 0}</p>
        <p className={`text-[10px] font-bold ${activa ? 'text-green-400' : 'text-red-400'}`}>
          {ultimaActividadTexto(p.ultimoAccesoFecha)}
        </p>
      </div>
    </div>
  )
}
