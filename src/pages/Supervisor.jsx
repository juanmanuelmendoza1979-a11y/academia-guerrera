import { useState, useEffect } from 'react'
import { obtenerPromotorasDeSupervisor } from '../lib/db'
import Avatar from '../components/Avatar'

const NIVELES = {
  'Inicial':  { color: 'text-gray-400',   bg: 'bg-gray-500/20' },
  'Bronce':   { color: 'text-amber-600',  bg: 'bg-amber-600/20' },
  'Plata':    { color: 'text-gray-300',   bg: 'bg-gray-400/20' },
  'Oro':      { color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  'Diamante': { color: 'text-cyan-400',   bg: 'bg-cyan-400/20' },
}

function nivelDeNombre(nivel) { return NIVELES[nivel] || NIVELES['Inicial'] }

function ultimaActividadTexto(fechaStr) {
  if (!fechaStr) return 'Sin actividad'
  const hoy  = new Date().toDateString()
  const ayer = new Date(Date.now() - 86400000).toDateString()
  if (fechaStr === hoy)  return 'Hoy ✅'
  if (fechaStr === ayer) return 'Ayer'
  try { return new Date(fechaStr).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }) }
  catch { return fechaStr }
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return 'Sin acceso'
  try { return new Date(fechaStr).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' }) }
  catch { return fechaStr }
}

function descargarXLS(filas, nombreArchivo) {
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  const filaXML = fila => '<Row>' + fila.map(c => {
    const val  = c ?? ''
    const tipo = typeof val === 'number' ? 'Number' : 'String'
    return `<Cell><Data ss:Type="${tipo}">${esc(val)}</Data></Cell>`
  }).join('') + '</Row>'

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="cabecera">
   <Font ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1a1a2e" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Reporte">
  <Table>
   <Row ss:StyleID="cabecera">${filas[0].map(c=>`<Cell ss:StyleID="cabecera"><Data ss:Type="String">${esc(c)}</Data></Cell>`).join('')}</Row>
   ${filas.slice(1).map(filaXML).join('\n   ')}
  </Table>
 </Worksheet>
</Workbook>`

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = nombreArchivo; a.click()
  URL.revokeObjectURL(url)
}

export default function Supervisor({ session }) {
  const [tab, setTab]               = useState('dashboard')
  const [promotoras, setPromotoras] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [statAbierta, setStatAbierta] = useState(null)

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
    ? Math.round(promotoras.reduce((s, p) => s + (p.puntos || 0), 0) / promotoras.length) : 0
  const enRacha    = promotoras.filter(p => (p.racha || 0) >= 3)

  const tabs = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'equipo',    icon: '👥', label: 'Mi Equipo' },
  ]

  return (
    <div className="pb-24 animate-fade-in">

      {/* Header */}
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
              {/* Stat cards — clickeables */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key:'total',   icon:'👥', valor: promotoras.length, label:'Total equipo',  sub:'promotoras',         color:'bg-blue-700/20 border-blue-600/30',   activeColor:'ring-2 ring-blue-400' },
                  { key:'activas', icon:'⚡', valor: activasHoy.length,  label:'Activas hoy',  sub:`de ${promotoras.length}`, color:'bg-green-700/20 border-green-600/30', activeColor:'ring-2 ring-green-400' },
                  { key:'puntos',  icon:'⭐', valor: promPuntos,         label:'Pts promedio',  sub:'del equipo',          color:'bg-orange-700/20 border-orange-600/30', activeColor:'ring-2 ring-orange-400' },
                  { key:'racha',   icon:'🔥', valor: enRacha.length,    label:'En racha',      sub:'3+ días seguidos',    color:'bg-purple-700/20 border-purple-600/30', activeColor:'ring-2 ring-purple-400' },
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

              {/* Lista expandida por stat */}
              {statAbierta === 'total' && (
                <ListaPromotoras titulo={`👥 Todo el equipo — ${promotoras.length}`} color="border-blue-600/30 bg-blue-900/20" colorTxt="text-blue-300"
                  lista={[...promotoras].sort((a,b)=>(b.puntos||0)-(a.puntos||0))} hoy={hoy} mostrarPuntos />
              )}
              {statAbierta === 'activas' && (
                <ListaPromotoras titulo={`⚡ Activas hoy — ${activasHoy.length}`} color="border-green-600/30 bg-green-900/20" colorTxt="text-green-300"
                  lista={activasHoy} hoy={hoy} mostrarPuntos vacio="Ninguna activa todavía hoy" />
              )}
              {statAbierta === 'puntos' && (
                <ListaPromotoras titulo={`⭐ Ranking de puntos — ${promotoras.length}`} color="border-orange-600/30 bg-orange-900/20" colorTxt="text-orange-300"
                  lista={[...promotoras].sort((a,b)=>(b.puntos||0)-(a.puntos||0))} hoy={hoy} mostrarPuntos medallas />
              )}
              {statAbierta === 'racha' && (
                <ListaPromotoras titulo={`🔥 En racha 3+ días — ${enRacha.length}`} color="border-purple-600/30 bg-purple-900/20" colorTxt="text-purple-300"
                  lista={[...enRacha].sort((a,b)=>(b.racha||0)-(a.racha||0))} hoy={hoy} mostrarRacha vacio="Nadie con racha de 3+ días aún" />
              )}

              {/* Sin promotoras */}
              {promotoras.length === 0 && (
                <div className="bg-brand-dark rounded-2xl border border-dashed border-white/10 p-8 text-center">
                  <span className="text-4xl block mb-3">👥</span>
                  <p className="text-sm font-bold text-white mb-1">Aún no hay promotoras registradas</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Cuando tus promotoras creen su cuenta y te seleccionen como supervisora, aparecerán aquí automáticamente.
                  </p>
                </div>
              )}

              {/* Activas hoy */}
              {activasHoy.length > 0 && statAbierta !== 'activas' && (
                <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-green-900/20">
                    <p className="text-sm font-bold text-green-300">✅ Activas hoy — {activasHoy.length}</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {activasHoy.map((p, i) => <PromotoraRow key={p.id||i} p={p} />)}
                  </div>
                </div>
              )}

              {/* Sin actividad hoy */}
              {rezagadas.length > 0 && statAbierta !== 'total' && (
                <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-red-900/20">
                    <p className="text-sm font-bold text-red-300">⚠️ Sin actividad hoy — {rezagadas.length}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pueden necesitar motivación extra</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {rezagadas.map((p, i) => <PromotoraRow key={p.id||i} p={p} />)}
                  </div>
                </div>
              )}

              <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
                <p className="text-xs text-gray-500 text-center leading-relaxed">
                  🛡️ Solo ves a tus promotoras. Datos de aprendizaje, no métricas de venta.
                </p>
              </div>
            </>
          )}

          {/* ── MI EQUIPO ── */}
          {tab === 'equipo' && (
            <EquipoCompleto promotoras={promotoras} hoy={hoy} supNombre={session?.nombre} />
          )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Lista reutilizable de promotoras ──────────────────────────────────────────
function ListaPromotoras({ titulo, color, colorTxt, lista, hoy, mostrarPuntos, mostrarRacha, medallas, vacio }) {
  return (
    <div className={`bg-brand-dark rounded-2xl border overflow-hidden ${color}`}>
      <div className={`px-4 py-3 border-b border-white/5 ${color}`}>
        <p className={`text-sm font-bold ${colorTxt}`}>{titulo}</p>
      </div>
      <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
        {lista.length === 0
          ? <p className="text-xs text-gray-500 text-center py-6">{vacio || 'Sin promotoras'}</p>
          : lista.map((p, i) => (
            <div key={p.id||i} className="px-4 py-2.5 flex items-center gap-3">
              {medallas && (
                <span className={`text-xs font-black w-6 text-center flex-shrink-0 ${i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-600'}`}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                </span>
              )}
              <Avatar seed={p.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                <p className={`text-[10px] font-bold ${p.ultimoAccesoFecha===hoy?'text-green-400':'text-gray-600'}`}>
                  {ultimaActividadTexto(p.ultimoAccesoFecha)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                {mostrarPuntos && <p className="text-xs font-black text-yellow-400">⭐ {p.puntos||0}</p>}
                {mostrarRacha  && <p className="text-xs font-black text-orange-400">🔥 {p.racha||0}d</p>}
                <p className="text-[10px] text-gray-500">🔑 {p.loginCount||0}</p>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

function PromotoraRow({ p }) {
  const hoy    = new Date().toDateString()
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
        <p className="text-[10px] text-gray-600">🔑 {p.loginCount || 0} ingresos</p>
      </div>
    </div>
  )
}

// ── Equipo completo: Ranking + Usabilidad ─────────────────────────────────────
function EquipoCompleto({ promotoras, hoy, supNombre }) {
  const [vista, setVista] = useState('ranking')

  const porPuntos   = [...promotoras].sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
  const porIngresos = [...promotoras].sort((a, b) => (b.loginCount || 0) - (a.loginCount || 0))
  const maxLogin    = porIngresos[0]?.loginCount || 1

  const verdes    = promotoras.filter(p=>(p.loginCount||0)>=10).length
  const amarillas = promotoras.filter(p=>(p.loginCount||0)>=3&&(p.loginCount||0)<10).length
  const rojas     = promotoras.filter(p=>(p.loginCount||0)<3).length

  function handleDescargar() {
    const hoyStr   = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' })
    const lista    = vista === 'ranking' ? porPuntos : porIngresos
    const cabecera = ['#', 'Nombre', 'Supervisor', 'Puntos', 'Nivel', 'Retos', 'Racha (días)', 'Ingresos', 'Último acceso', 'Activa hoy']
    const filas    = lista.map((p, i) => [
      i + 1, p.nombre, supNombre || '', p.puntos||0, p.nivel||'Inicial',
      p.retosCompletados||0, p.racha||0, p.loginCount||0,
      formatearFecha(p.ultimoAccesoFecha),
      p.ultimoAccesoFecha === hoy ? 'Sí' : 'No',
    ])
    const tipo = vista === 'ranking' ? 'ranking' : 'usabilidad'
    descargarXLS([cabecera, ...filas], `equipo_${(supNombre||'sup').replace(/ /g,'_')}_${tipo}_${hoyStr.replace(/\//g,'-')}.xls`)
  }

  if (promotoras.length === 0) {
    return (
      <div className="bg-brand-dark rounded-2xl border border-dashed border-white/10 p-8 text-center">
        <span className="text-4xl block mb-3">👥</span>
        <p className="text-sm font-bold text-white mb-1">Equipo vacío por ahora</p>
        <p className="text-xs text-gray-500">Las promotoras que te seleccionen aparecerán aquí.</p>
      </div>
    )
  }

  return (
    <>
      {/* Sub-tabs + Excel */}
      <div className="flex gap-2">
        <button onClick={() => setVista('ranking')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            vista === 'ranking' ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'
          }`}>
          🏆 Ranking Juegos
        </button>
        <button onClick={() => setVista('usabilidad')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            vista === 'usabilidad' ? 'bg-purple-600 text-white' : 'bg-brand-medium text-gray-400'
          }`}>
          🔑 Usabilidad
        </button>
        <button onClick={handleDescargar}
          className="flex-shrink-0 flex items-center gap-1 bg-green-700/30 border border-green-500/40 text-green-400 text-xs font-bold px-3 rounded-xl hover:bg-green-700/50 transition-all active:scale-95">
          ⬇️ Excel
        </button>
      </div>

      {/* ── RANKING DE JUEGOS ── */}
      {vista === 'ranking' && (
        <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-yellow-900/20">
            <p className="text-sm font-bold text-white">🏆 Ranking por puntos — {promotoras.length} promotoras</p>
            <p className="text-xs text-gray-500 mt-0.5">Ordenado por puntos acumulados en juegos y retos</p>
          </div>
          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {porPuntos.map((p, i) => {
              const activa = p.ultimoAccesoFecha === hoy
              return (
                <div key={p.id || i} className="px-4 py-3 flex items-center gap-3">
                  <span className={`text-sm font-black w-6 text-center flex-shrink-0 ${
                    i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-600'
                  }`}>
                    {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                  </span>
                  <Avatar seed={p.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{p.nombre}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${nivelDeNombre(p.nivel).bg} ${nivelDeNombre(p.nivel).color}`}>
                        {p.nivel || 'Inicial'}
                      </span>
                      <span className="text-[10px] text-gray-500">🎯 {p.retosCompletados || 0} retos</span>
                      <span className="text-[10px] text-gray-500">🔥 {p.racha || 0}d</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-brand-orange">⭐ {p.puntos || 0}</p>
                    <p className={`text-[10px] font-bold ${activa ? 'text-green-400' : 'text-gray-600'}`}>
                      {ultimaActividadTexto(p.ultimoAccesoFecha)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── USABILIDAD ── */}
      {vista === 'usabilidad' && (
        <div className="space-y-3">
          {/* Resumen gráfico rápido */}
          <div className="bg-brand-dark rounded-2xl border border-purple-600/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 bg-purple-900/20">
              <p className="text-sm font-bold text-white">📊 Resumen de usabilidad del equipo</p>
            </div>
            <div className="px-4 py-3 flex gap-4">
              <div className="flex-1 text-center">
                <p className="text-2xl font-black text-green-400">{verdes}</p>
                <p className="text-[10px] text-gray-500">10+ ingresos</p>
                <div className="mt-1 bg-brand-medium rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-green-500" style={{width: promotoras.length ? `${Math.round(verdes/promotoras.length*100)}%` : '0%'}} />
                </div>
              </div>
              <div className="flex-1 text-center">
                <p className="text-2xl font-black text-yellow-400">{amarillas}</p>
                <p className="text-[10px] text-gray-500">3-9 ingresos</p>
                <div className="mt-1 bg-brand-medium rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-yellow-500" style={{width: promotoras.length ? `${Math.round(amarillas/promotoras.length*100)}%` : '0%'}} />
                </div>
              </div>
              <div className="flex-1 text-center">
                <p className="text-2xl font-black text-red-400">{rojas}</p>
                <p className="text-[10px] text-gray-500">0-2 ingresos</p>
                <div className="mt-1 bg-brand-medium rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-red-500" style={{width: promotoras.length ? `${Math.round(rojas/promotoras.length*100)}%` : '0%'}} />
                </div>
              </div>
            </div>
          </div>

          {/* Lista completa */}
          <div className="bg-brand-dark rounded-2xl border border-purple-600/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-white/5 bg-purple-900/10">
              <p className="text-sm font-bold text-white">🔑 Ingresos por promotora</p>
              <p className="text-xs text-gray-500 mt-0.5">Ordenado por número de accesos a la plataforma</p>
            </div>
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {porIngresos.map((p, i) => {
                const activa   = p.ultimoAccesoFecha === hoy
                const logins   = p.loginCount || 0
                const barWidth = Math.round((logins / maxLogin) * 100)
                return (
                  <div key={p.id || i} className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-gray-600 w-5 text-center flex-shrink-0">#{i+1}</span>
                      <Avatar seed={p.avatar} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{p.nombre}</p>
                        <p className={`text-[10px] font-bold ${activa ? 'text-green-400' : 'text-gray-500'}`}>
                          {activa ? 'Activa hoy ✅' : `Último: ${ultimaActividadTexto(p.ultimoAccesoFecha)}`}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-base font-black ${logins >= 10 ? 'text-green-400' : logins >= 3 ? 'text-yellow-400' : 'text-red-400'}`}>{logins}</p>
                        <p className="text-[10px] text-gray-500">ingresos</p>
                      </div>
                    </div>
                    <div className="mt-1.5 ml-14 bg-brand-medium rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${logins >= 10 ? 'bg-green-500' : logins >= 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${barWidth}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-4 py-2.5 border-t border-white/5 bg-brand-medium/30 flex gap-4 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>10+ ingresos</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"/>3-9 ingresos</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>0-2 ingresos</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
        <p className="text-xs text-gray-500 text-center">🔄 Se actualiza en cada inicio de sesión · Solo tu equipo</p>
      </div>
    </>
  )
}
