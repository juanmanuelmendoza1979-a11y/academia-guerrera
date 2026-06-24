import { useState, useEffect } from 'react'
import { obtenerDatosRegion } from '../lib/db'
import Avatar from '../components/Avatar'

const SUPERVISORES_POR_JEFE = {
  'Victor Lazo':     ['Sara Salazar', 'Diana Paz', 'Candy Odar'],
  'Karem Romero':    ['Estefanny Martinez', 'Lady Zelada', 'Michelle Gomez', 'Zurhama Pisconte'],
  'Jesus Ynocencio': ['Alina Untama', 'Crisly Cotrina', 'Roxana Vicente', 'Renzo Asensios'],
  'Tirza Vargasa':   ['Wendy Aguayo', 'Carlos Gallegos', 'Katia Dueñas'],
  'Ricardo Polo':    ['Luis Bustamante', 'Gonzalo Lopez', 'Carla Huerta', 'Milagros Urbano'],
}

function tiempoDesde(fechaStr) {
  if (!fechaStr) return 'Sin acceso'
  const hoy  = new Date().toDateString()
  const ayer = new Date(Date.now() - 86400000).toDateString()
  if (fechaStr === hoy)  return 'Hoy ✅'
  if (fechaStr === ayer) return 'Ayer'
  try {
    return new Date(fechaStr).toLocaleDateString('es-PE', { day:'numeric', month:'short' })
  } catch { return fechaStr }
}

function accesoDesdeSup(sup) {
  if (!sup?.ultimoAcceso) return null
  // Firestore Timestamp → tiene .toDate(), o puede venir serializado como {seconds, nanoseconds}
  try {
    const ts = sup.ultimoAcceso
    if (ts?.toDate) return ts.toDate().toDateString()
    if (ts?.seconds) return new Date(ts.seconds * 1000).toDateString()
  } catch {}
  return null
}

export default function JefeDashboard({ session }) {
  const [tab, setTab]           = useState('resumen')
  const [promotoras, setPromotoras] = useState([])
  const [supervisores, setSupervisores] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [rankOpen, setRankOpen] = useState(null)
  const [statAbierta, setStatAbierta] = useState(null)

  const misSupes = SUPERVISORES_POR_JEFE[session?.nombre] || []

  useEffect(() => {
    if (!misSupes.length) { setLoading(false); return }
    obtenerDatosRegion(misSupes)
      .then(({ promotoras: p, supervisores: s }) => {
        setPromotoras(p.sort((a, b) => (b.puntos || 0) - (a.puntos || 0)))
        setSupervisores(s)
        setLoading(false)
      })
      .catch(() => { setError('Error al cargar datos.'); setLoading(false) })
  }, [session?.nombre])

  const hoy = new Date().toDateString()
  const activasHoy    = promotoras.filter(p => p.ultimoAccesoFecha === hoy)
  const promPuntos    = promotoras.length
    ? Math.round(promotoras.reduce((s, p) => s + (p.puntos || 0), 0) / promotoras.length) : 0
  const supesActivos  = supervisores.filter(s => accesoDesdeSup(s) === hoy)

  const tabs = [
    { id: 'resumen',    icon: '📊', label: 'Resumen' },
    { id: 'supervisores', icon: '👔', label: 'Supervisores' },
    { id: 'rankings',   icon: '🏅', label: 'Rankings' },
  ]

  return (
    <div className="pb-24 animate-fade-in">

      {/* Hero jefe */}
      <div className="bg-gradient-to-br from-yellow-900/60 to-brand-dark border-b border-yellow-500/20 px-4 py-5">
        <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Jefe Regional</p>
        <h2 className="text-xl font-black text-white mt-0.5">Hola, {session?.nombre?.split(' ')[0]} 👋</h2>
        <p className="text-xs text-gray-400 mt-1">
          {misSupes.length} supervisores · {promotoras.length} promotoras en tu región
        </p>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-brand-black/95 backdrop-blur-sm border-b border-white/5 px-4 pb-2 pt-3">
        <div className="flex gap-1.5">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === t.id ? 'bg-yellow-500 text-black' : 'bg-brand-medium text-gray-400'
              }`}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl animate-spin">⏳</span>
            <p className="text-sm text-gray-400">Cargando tu región...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>

          {/* ═══ RESUMEN ═══ */}
          {tab === 'resumen' && (
            <>
              {/* Stats globales — clickeables */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key:'todas',    icon:'👥', valor: promotoras.length,                                    label:'Promotoras',    sub:'en tu región',           color:'bg-blue-700/20 border-blue-600/30',   activeColor:'ring-2 ring-blue-400' },
                  { key:'activas',  icon:'⚡', valor: activasHoy.length,                                    label:'Activas hoy',   sub:`de ${promotoras.length}`, color:'bg-green-700/20 border-green-600/30', activeColor:'ring-2 ring-green-400' },
                  { key:'sups',     icon:'👔', valor: supervisores.filter(s=>s.registrado).length,          label:'Sups. activos', sub:`de ${misSupes.length} total`, color:'bg-purple-700/20 border-purple-600/30', activeColor:'ring-2 ring-purple-400' },
                  { key:'ranking',  icon:'⭐', valor: promPuntos,                                           label:'Pts. promedio', sub:'región completa',        color:'bg-yellow-700/20 border-yellow-600/30', activeColor:'ring-2 ring-yellow-400' },
                ].map(s => (
                  <button key={s.key} onClick={() => setStatAbierta(statAbierta === s.key ? null : s.key)}
                    className={`rounded-2xl p-4 border text-left transition-all ${s.color} ${statAbierta === s.key ? s.activeColor : 'hover:opacity-80'}`}>
                    <span className="text-2xl block mb-1">{s.icon}</span>
                    <p className="text-2xl font-black text-white">{s.valor}</p>
                    <p className="text-xs font-bold text-white/80 leading-tight">{s.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
                    <p className="text-[10px] text-gray-600 mt-1">{statAbierta === s.key ? '▲ cerrar' : '▼ ver lista'}</p>
                  </button>
                ))}
              </div>

              {/* Lista expandida según stat seleccionada */}
              {statAbierta === 'todas' && (
                <div className="bg-brand-dark rounded-2xl border border-blue-600/30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-blue-900/20">
                    <p className="text-sm font-bold text-blue-300">👥 Todas las promotoras — {promotoras.length}</p>
                  </div>
                  <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                    {promotoras.map((p, i) => (
                      <div key={p.id||i} className="px-4 py-2.5 flex items-center gap-3">
                        <span className="text-xs font-black text-gray-600 w-5 text-center">#{i+1}</span>
                        <Avatar seed={p.avatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                          <p className="text-[10px] text-gray-500 truncate">Sup: {p.supervisor}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-black text-yellow-400">⭐ {p.puntos||0}</p>
                          <p className={`text-[10px] font-bold ${p.ultimoAccesoFecha===hoy?'text-green-400':'text-gray-600'}`}>
                            {p.ultimoAccesoFecha===hoy?'Hoy ✅':tiempoDesde(p.ultimoAccesoFecha)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {statAbierta === 'activas' && (
                <div className="bg-brand-dark rounded-2xl border border-green-600/30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-green-900/20">
                    <p className="text-sm font-bold text-green-300">⚡ Activas hoy — {activasHoy.length}</p>
                  </div>
                  <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                    {activasHoy.length === 0
                      ? <p className="text-xs text-gray-500 text-center py-6">Ninguna promotora activa hoy aún</p>
                      : activasHoy.map((p, i) => (
                        <div key={p.id||i} className="px-4 py-2.5 flex items-center gap-3">
                          <Avatar seed={p.avatar} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                            <p className="text-[10px] text-gray-500 truncate">Sup: {p.supervisor}</p>
                          </div>
                          <p className="text-xs font-black text-yellow-400 flex-shrink-0">⭐ {p.puntos||0}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}

              {statAbierta === 'sups' && (
                <div className="bg-brand-dark rounded-2xl border border-purple-600/30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-purple-900/20">
                    <p className="text-sm font-bold text-purple-300">👔 Supervisores — {misSupes.length}</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {misSupes.map((supNombre, i) => {
                      const supData = supervisores.find(s => s.nombre === supNombre)
                      const equipo  = promotoras.filter(p => p.supervisor === supNombre)
                      const activas = equipo.filter(p => p.ultimoAccesoFecha === hoy)
                      const ultimoAcc = accesoDesdeSup(supData)
                      return (
                        <div key={i} className="px-4 py-3 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${supData?.registrado ? 'bg-purple-500/20' : 'bg-red-500/10'}`}>
                            {supData?.registrado ? '👔' : '⚠️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{supNombre}</p>
                            <p className="text-[10px] text-gray-500">{equipo.length} promotoras · {activas.length} activas hoy</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {supData?.registrado
                              ? <p className={`text-[10px] font-bold ${ultimoAcc===hoy?'text-green-400':'text-yellow-400'}`}>{tiempoDesde(ultimoAcc)}</p>
                              : <p className="text-[10px] text-red-400">Sin cuenta</p>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {statAbierta === 'ranking' && (
                <div className="bg-brand-dark rounded-2xl border border-yellow-600/30 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-yellow-900/20">
                    <p className="text-sm font-bold text-yellow-300">⭐ Ranking completo — {promotoras.length} promotoras</p>
                  </div>
                  <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                    {promotoras.map((p, i) => (
                      <div key={p.id||i} className="px-4 py-2.5 flex items-center gap-3">
                        <span className={`text-xs font-black w-6 text-center flex-shrink-0 ${i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-600'}`}>
                          {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                        </span>
                        <Avatar seed={p.avatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                          <p className="text-[10px] text-gray-500 truncate">Sup: {p.supervisor} · 🔑 {p.loginCount||0}</p>
                        </div>
                        <p className="text-sm font-black text-yellow-400 flex-shrink-0">⭐ {p.puntos||0}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resumen por supervisor */}
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">📋 Vista rápida por supervisor</p>
                <div className="space-y-2">
                  {misSupes.map(supNombre => {
                    const supData = supervisores.find(s => s.nombre === supNombre)
                    const equipo  = promotoras.filter(p => p.supervisor === supNombre)
                    const activas = equipo.filter(p => p.ultimoAccesoFecha === hoy)
                    const avgPts  = equipo.length ? Math.round(equipo.reduce((s,p) => s+(p.puntos||0), 0) / equipo.length) : 0
                    return (
                      <div key={supNombre} className="bg-brand-dark rounded-2xl p-4 border border-white/5 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${supData?.registrado ? 'bg-purple-500/20' : 'bg-red-500/10'}`}>
                          {supData?.registrado ? '👔' : '⚠️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{supNombre}</p>
                          <p className="text-xs text-gray-500">{equipo.length} promotoras · {activas.length} activas hoy</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-black text-yellow-400">⭐ {avgPts}</p>
                          <p className="text-xs text-gray-600">promedio</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Top 5 región */}
              {promotoras.length > 0 && (
                <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-bold text-white">🥇 Top 5 de tu región</p>
                  </div>
                  {promotoras.slice(0, 5).map((p, i) => (
                    <div key={p.id || i} className="px-4 py-3 flex items-center gap-3 border-b border-white/5 last:border-0">
                      <span className={`text-sm font-black w-5 text-center flex-shrink-0 ${i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-600'}`}>
                        {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                      </span>
                      <Avatar seed={p.avatar} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{p.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">Sup: {p.supervisor}</p>
                      </div>
                      <p className="text-sm font-black text-yellow-400 flex-shrink-0">⭐ {p.puntos || 0}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ═══ SUPERVISORES — conducta de usabilidad ═══ */}
          {tab === 'supervisores' && (
            <>
              <div>
                <p className="text-base font-black text-white">Conducta de Usabilidad</p>
                <p className="text-xs text-gray-500 mt-0.5">¿Tus supervisores están usando la plataforma?</p>
              </div>

              {/* Leyenda */}
              <div className="flex gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Activo hoy</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>Activo reciente</div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>Sin cuenta / inactivo</div>
              </div>

              <div className="space-y-3">
                {misSupes.map(supNombre => {
                  const supData    = supervisores.find(s => s.nombre === supNombre)
                  const equipo     = promotoras.filter(p => p.supervisor === supNombre)
                  const activas    = equipo.filter(p => p.ultimoAccesoFecha === hoy)
                  const ultimoAcc  = accesoDesdeSup(supData)
                  const activoHoy  = ultimoAcc === hoy
                  const activoRec  = ultimoAcc && ultimoAcc !== hoy
                  const statusColor = !supData?.registrado ? 'border-red-500/30 bg-red-500/5'
                    : activoHoy ? 'border-green-500/30 bg-green-500/5'
                    : 'border-yellow-500/30 bg-yellow-500/5'
                  const dot = !supData?.registrado ? 'bg-red-500'
                    : activoHoy ? 'bg-green-500' : 'bg-yellow-500'

                  return (
                    <div key={supNombre} className={`rounded-2xl p-4 border ${statusColor}`}>
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-11 h-11 rounded-xl bg-brand-medium flex items-center justify-center text-2xl">👔</div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-brand-black ${dot}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-white">{supNombre}</p>
                          {!supData?.registrado ? (
                            <p className="text-xs text-red-400 mt-0.5 font-semibold">⚠️ Aún no creó su cuenta</p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Último acceso: <span className={`font-bold ${activoHoy?'text-green-400':activoRec?'text-yellow-400':'text-gray-500'}`}>
                                {tiempoDesde(ultimoAcc)}
                              </span>
                            </p>
                          )}
                          {/* Stats del equipo */}
                          <div className="flex gap-3 mt-2 flex-wrap">
                            <span className="text-[11px] text-gray-400">👥 {equipo.length} promotoras</span>
                            <span className={`text-[11px] font-bold ${activas.length > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                              ⚡ {activas.length} activas hoy
                            </span>
                            {equipo.length > 0 && (
                              <span className="text-[11px] text-yellow-400">
                                ⭐ {Math.round(equipo.reduce((s,p)=>s+(p.puntos||0),0)/equipo.length)} pts prom.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Alerta si no tiene cuenta */}
                      {!supData?.registrado && (
                        <div className="mt-3 bg-red-900/20 rounded-xl px-3 py-2">
                          <p className="text-xs text-red-300 leading-relaxed">
                            Recuérdale que debe crear su cuenta en la app para acceder al módulo de supervisores.
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  🛡️ Solo ves a los supervisores de tu región. Datos de plataforma, no métricas de venta.
                </p>
              </div>
            </>
          )}

          {/* ═══ RANKINGS SEGMENTADOS ═══ */}
          {tab === 'rankings' && (
            <>
              <div>
                <p className="text-base font-black text-white">Rankings por Supervisor</p>
                <p className="text-xs text-gray-500 mt-0.5">Toca un supervisor para ver el ranking de su equipo</p>
              </div>

              {/* Ranking global de región */}
              <div className="bg-gradient-to-r from-yellow-900/30 to-brand-dark border border-yellow-500/20 rounded-2xl p-4">
                <p className="text-xs font-black text-yellow-400 uppercase tracking-wider mb-1">🌎 Región completa</p>
                <div className="flex gap-4">
                  <div className="text-center"><p className="text-xl font-black text-white">{promotoras.length}</p><p className="text-xs text-gray-500">promotoras</p></div>
                  <div className="text-center"><p className="text-xl font-black text-white">{promPuntos}</p><p className="text-xs text-gray-500">pts promedio</p></div>
                  <div className="text-center"><p className="text-xl font-black text-white">{activasHoy.length}</p><p className="text-xs text-gray-500">activas hoy</p></div>
                </div>
              </div>

              {/* Acordeón por supervisor */}
              <div className="space-y-2">
                {misSupes.map(supNombre => {
                  const equipo   = promotoras.filter(p => p.supervisor === supNombre).sort((a,b) => (b.puntos||0)-(a.puntos||0))
                  const activas  = equipo.filter(p => p.ultimoAccesoFecha === hoy)
                  const avgPts   = equipo.length ? Math.round(equipo.reduce((s,p)=>s+(p.puntos||0),0)/equipo.length) : 0
                  const isOpen   = rankOpen === supNombre

                  return (
                    <div key={supNombre} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
                      {/* Header acordeón */}
                      <button onClick={() => setRankOpen(isOpen ? null : supNombre)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/5 transition-all">
                        <span className="text-xl flex-shrink-0">👔</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-white">{supNombre}</p>
                          <p className="text-xs text-gray-500">{equipo.length} promotoras · ⭐ {avgPts} prom · ⚡ {activas.length} hoy</p>
                        </div>
                        <span className={`text-gray-400 text-sm transition-transform duration-200 flex-shrink-0 ${isOpen?'rotate-180':''}`}>▼</span>
                      </button>

                      {/* Lista desplegable */}
                      {isOpen && (
                        <div className="border-t border-white/5 animate-fade-in">
                          {equipo.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                              <p className="text-xs text-gray-500">Sin promotoras registradas aún</p>
                            </div>
                          ) : (
                            equipo.map((p, i) => (
                              <div key={p.id || i} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                                <span className={`text-xs font-black w-6 text-center flex-shrink-0 ${i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-600'}`}>
                                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                                </span>
                                <Avatar seed={p.avatar} size="sm" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                                  <p className="text-[10px] text-gray-500 truncate">🔥 {p.racha||0}d · 🔑 {p.loginCount||0} ingresos</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-sm font-black text-yellow-400">⭐ {p.puntos||0}</p>
                                  <p className={`text-[10px] font-bold ${p.ultimoAccesoFecha===hoy?'text-green-400':'text-gray-600'}`}>
                                    {p.ultimoAccesoFecha===hoy?'Hoy ✅':tiempoDesde(p.ultimoAccesoFecha)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
                <p className="text-xs text-gray-500 text-center">Rankings actualizados en tiempo real · Solo tu región</p>
              </div>
            </>
          )}

          </>
        )}
      </div>
    </div>
  )
}
