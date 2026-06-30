import { useState, useEffect } from 'react'
import { obtenerDatosRegion } from '../lib/db'
import Avatar from '../components/Avatar'

function descargarXLS(filas, nombreArchivo) {
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  const filaXML = fila => '<Row>' + fila.map(c => {
    const val   = c ?? ''
    const tipo  = typeof val === 'number' ? 'Number' : 'String'
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
  a.href = url
  a.download = nombreArchivo
  a.click()
  URL.revokeObjectURL(url)
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return 'Sin acceso'
  try { return new Date(fechaStr).toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' }) }
  catch { return fechaStr }
}

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

function RankingsRegion({ promotoras, misSupes, hoy }) {
  const [vista, setVista]       = useState('ranking')
  const [vistaUsa, setVistaUsa] = useState('total')
  const [supAbierto, setSupAbierto] = useState(null)
  const [supUsaAbierto, setSupUsaAbierto] = useState(null)

  const porPuntos   = [...promotoras].sort((a,b) => (b.puntos||0)-(a.puntos||0))
  const porIngresos = [...promotoras].sort((a,b) => (b.loginCount||0)-(a.loginCount||0))
  const maxLogin    = porIngresos[0]?.loginCount || 1

  // Datos por supervisor para el dashboard
  const datosSupes = misSupes.map(supNombre => {
    const equipo   = promotoras.filter(p => p.supervisor === supNombre)
    const sorted   = [...equipo].sort((a,b) => (b.loginCount||0)-(a.loginCount||0))
    const total    = equipo.reduce((s,p) => s+(p.loginCount||0), 0)
    const avg      = equipo.length ? Math.round(total / equipo.length * 10) / 10 : 0
    const verdes   = equipo.filter(p => (p.loginCount||0) >= 10).length
    const amarillas= equipo.filter(p => (p.loginCount||0) >= 3 && (p.loginCount||0) < 10).length
    const rojas    = equipo.filter(p => (p.loginCount||0) < 3).length
    const activas  = equipo.filter(p => p.ultimoAccesoFecha === hoy).length
    return { supNombre, equipo, sorted, total, avg, verdes, amarillas, rojas, activas }
  })
  const maxAvg = Math.max(...datosSupes.map(d => d.avg), 1)

  function handleDescargar() {
    const hoyStr   = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' })
    const lista    = vista === 'ranking' ? porPuntos : porIngresos
    const cabecera = ['#', 'Nombre', 'Supervisor', 'Puntos', 'Retos completados', 'Racha (días)', 'Ingresos', 'Último acceso', 'Activa hoy']
    const filas = lista.map((p, i) => [
      i + 1,
      p.nombre,
      p.supervisor,
      p.puntos || 0,
      p.retosCompletados || 0,
      p.racha || 0,
      p.loginCount || 0,
      formatearFecha(p.ultimoAccesoFecha),
      p.ultimoAccesoFecha === hoy ? 'Sí' : 'No',
    ])
    const tipo = vista === 'ranking' ? 'ranking' : 'usabilidad'
    descargarXLS([cabecera, ...filas], `region_${tipo}_${hoyStr.replace(/\//g,'-')}.xls`)
  }

  return (
    <>
      {/* Sub-tabs + descarga */}
      <div className="flex gap-2">
        <button onClick={() => setVista('ranking')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            vista === 'ranking' ? 'bg-yellow-500 text-black' : 'bg-brand-medium text-gray-400'
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

      {/* ── RANKING POR JUEGOS ── */}
      {vista === 'ranking' && (
        <div className="space-y-2">
          {/* Global rápido */}
          <div className="bg-gradient-to-r from-yellow-900/30 to-brand-dark border border-yellow-500/20 rounded-2xl p-3 flex gap-4">
            <div className="text-center"><p className="text-lg font-black text-white">{promotoras.length}</p><p className="text-xs text-gray-500">promotoras</p></div>
            <div className="text-center"><p className="text-lg font-black text-white">{porPuntos[0]?.puntos||0}</p><p className="text-xs text-gray-500">máx. pts</p></div>
            <div className="text-center"><p className="text-lg font-black text-white">{promotoras.filter(p=>p.ultimoAccesoFecha===hoy).length}</p><p className="text-xs text-gray-500">activas hoy</p></div>
          </div>

          {/* Acordeón por supervisor */}
          {misSupes.map(supNombre => {
            const equipo  = porPuntos.filter(p => p.supervisor === supNombre)
            const activas = equipo.filter(p => p.ultimoAccesoFecha === hoy)
            const avgPts  = equipo.length ? Math.round(equipo.reduce((s,p)=>s+(p.puntos||0),0)/equipo.length) : 0
            const isOpen  = supAbierto === supNombre + '_r'
            return (
              <div key={supNombre} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
                <button onClick={() => setSupAbierto(isOpen ? null : supNombre + '_r')}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all">
                  <span className="text-xl flex-shrink-0">👔</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white">{supNombre}</p>
                    <p className="text-xs text-gray-500">{equipo.length} promotoras · ⭐ {avgPts} prom · ⚡ {activas.length} hoy</p>
                  </div>
                  <span className={`text-gray-400 text-sm transition-transform flex-shrink-0 ${isOpen?'rotate-180':''}`}>▼</span>
                </button>
                {isOpen && (
                  <div className="border-t border-white/5">
                    {equipo.length === 0
                      ? <p className="text-xs text-gray-500 text-center py-4">Sin promotoras registradas</p>
                      : equipo.map((p, i) => (
                        <div key={p.id||i} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0">
                          <span className={`text-xs font-black w-6 text-center flex-shrink-0 ${i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-600'}`}>
                            {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                          </span>
                          <Avatar seed={p.avatar} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                            <p className="text-[10px] text-gray-500">🎯 {p.retosCompletados||0} retos · 🔥 {p.racha||0}d</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-black text-yellow-400">⭐ {p.puntos||0}</p>
                            <p className={`text-[10px] ${p.ultimoAccesoFecha===hoy?'text-green-400':'text-gray-600'}`}>
                              {p.ultimoAccesoFecha===hoy?'Hoy ✅':tiempoDesde(p.ultimoAccesoFecha)}
                            </p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── USABILIDAD ── */}
      {vista === 'usabilidad' && (
        <div className="space-y-2">

          {/* Mini sub-tabs: Total vs Por Supervisor */}
          <div className="flex gap-2">
            <button onClick={() => setVistaUsa('total')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                vistaUsa === 'total' ? 'bg-purple-600 text-white' : 'bg-brand-medium text-gray-400'
              }`}>
              🌐 Total región
            </button>
            <button onClick={() => setVistaUsa('supervisor')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                vistaUsa === 'supervisor' ? 'bg-purple-600 text-white' : 'bg-brand-medium text-gray-400'
              }`}>
              👔 Por supervisor
            </button>
          </div>

          {/* ── VISTA TOTAL ── */}
          {vistaUsa === 'total' && (
            <div className="bg-brand-dark rounded-2xl border border-purple-600/30 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5 bg-purple-900/20">
                <p className="text-sm font-bold text-white">🔑 Usabilidad — región completa</p>
                <p className="text-xs text-gray-500 mt-0.5">Ordenado por número de ingresos · {promotoras.length} promotoras</p>
              </div>
              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                {porIngresos.map((p, i) => {
                  const logins   = p.loginCount || 0
                  const barWidth = Math.round((logins / maxLogin) * 100)
                  const activa   = p.ultimoAccesoFecha === hoy
                  return (
                    <div key={p.id||i} className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-gray-600 w-5 text-center flex-shrink-0">#{i+1}</span>
                        <Avatar seed={p.avatar} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                          <p className="text-[10px] text-gray-500 truncate">Sup: {p.supervisor}</p>
                          <p className={`text-[10px] font-bold ${activa?'text-green-400':'text-gray-600'}`}>
                            {activa ? 'Activa hoy ✅' : `Último: ${tiempoDesde(p.ultimoAccesoFecha)}`}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-lg font-black ${logins>=10?'text-green-400':logins>=3?'text-yellow-400':'text-red-400'}`}>{logins}</p>
                          <p className="text-[10px] text-gray-500">ingresos</p>
                        </div>
                      </div>
                      <div className="mt-1.5 ml-14 bg-brand-medium rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${logins>=10?'bg-green-500':logins>=3?'bg-yellow-500':'bg-red-500'}`}
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
          )}

          {/* ── VISTA POR SUPERVISOR ── */}
          {vistaUsa === 'supervisor' && (
            <div className="space-y-3">

              {/* Dashboard gráfico comparativo */}
              <div className="bg-brand-dark rounded-2xl border border-purple-600/30 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 bg-purple-900/20">
                  <p className="text-sm font-bold text-white">📊 Comparativo de usabilidad por supervisor</p>
                  <p className="text-xs text-gray-500 mt-0.5">Promedio de ingresos por promotora en cada equipo</p>
                </div>
                <div className="px-4 py-3 space-y-3">
                  {datosSupes.sort((a,b) => b.avg - a.avg).map(d => {
                    const barW   = Math.round((d.avg / maxAvg) * 100)
                    const color  = d.avg >= 10 ? 'bg-green-500' : d.avg >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                    const txtCol = d.avg >= 10 ? 'text-green-400' : d.avg >= 3 ? 'text-yellow-400' : 'text-red-400'
                    return (
                      <div key={d.supNombre}>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-white truncate flex-1">{d.supNombre}</p>
                          <div className="flex items-center gap-2 flex-shrink-0 text-[10px]">
                            <span className="text-green-400 font-bold">{d.verdes}✓</span>
                            <span className="text-yellow-400 font-bold">{d.amarillas}~</span>
                            <span className="text-red-400 font-bold">{d.rojas}✗</span>
                            <span className={`font-black text-sm ${txtCol}`}>{d.avg}</span>
                            <span className="text-gray-600">prom.</span>
                          </div>
                        </div>
                        <div className="bg-brand-medium rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${color}`} style={{ width: `${barW}%` }} />
                        </div>
                        <p className="text-[9px] text-gray-600 mt-0.5">{d.equipo.length} promotoras · ⚡ {d.activas} activas hoy · {d.total} ingresos totales</p>
                      </div>
                    )
                  })}
                </div>
                <div className="px-4 py-2.5 border-t border-white/5 bg-brand-medium/30 flex gap-4 text-[10px]">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"/>≥10 prom.</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"/>3-9 prom.</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>0-2 prom.</span>
                  <span className="ml-auto text-gray-600">✓ activas · ~ regulares · ✗ inactivas</span>
                </div>
              </div>

              {/* Acordeón por supervisor */}
              {datosSupes.map(d => {
                const isOpen  = supUsaAbierto === d.supNombre
                const maxL    = d.sorted[0]?.loginCount || 1
                const txtCol  = d.avg >= 10 ? 'text-green-400' : d.avg >= 3 ? 'text-yellow-400' : 'text-red-400'
                return (
                  <div key={d.supNombre} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
                    <button onClick={() => setSupUsaAbierto(isOpen ? null : d.supNombre)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all">
                      <span className="text-xl flex-shrink-0">👔</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-white truncate">{d.supNombre}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px]">
                          <span className="text-gray-500">{d.equipo.length} promotoras</span>
                          <span className="text-green-400">✓{d.verdes}</span>
                          <span className="text-yellow-400">~{d.amarillas}</span>
                          <span className="text-red-400">✗{d.rojas}</span>
                          <span className="text-gray-500">· ⚡{d.activas} hoy</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <div>
                          <p className={`text-base font-black ${txtCol}`}>{d.avg}</p>
                          <p className="text-[9px] text-gray-600">prom.</p>
                        </div>
                        <span className={`text-gray-400 text-sm transition-transform ${isOpen?'rotate-180':''}`}>▼</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-white/5">
                        {d.sorted.length === 0
                          ? <p className="text-xs text-gray-500 text-center py-4">Sin promotoras</p>
                          : d.sorted.map((p, i) => {
                              const logins  = p.loginCount || 0
                              const barW    = Math.round((logins / maxL) * 100)
                              const activa  = p.ultimoAccesoFecha === hoy
                              return (
                                <div key={p.id||i} className="px-4 py-2.5 border-b border-white/5 last:border-0">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-gray-600 w-5 text-center flex-shrink-0">#{i+1}</span>
                                    <Avatar seed={p.avatar} size="sm" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                                      <p className={`text-[10px] font-bold ${activa?'text-green-400':'text-gray-600'}`}>
                                        {activa ? 'Activa hoy ✅' : tiempoDesde(p.ultimoAccesoFecha)}
                                      </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className={`text-base font-black ${logins>=10?'text-green-400':logins>=3?'text-yellow-400':'text-red-400'}`}>{logins}</p>
                                      <p className="text-[9px] text-gray-500">ingresos</p>
                                    </div>
                                  </div>
                                  <div className="mt-1.5 ml-12 bg-brand-medium rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${logins>=10?'bg-green-500':logins>=3?'bg-yellow-500':'bg-red-500'}`}
                                      style={{ width: `${barW}%` }} />
                                  </div>
                                </div>
                              )
                            })
                        }
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
        <p className="text-xs text-gray-500 text-center">🔄 Se actualiza en cada inicio de sesión · Solo tu región</p>
      </div>
    </>
  )
}

function SupDetalle({ supNombre, supData, promotoras, hoy, onVolver }) {
  const [vista, setVista] = useState('ranking')
  const equipo      = [...promotoras.filter(p => p.supervisor === supNombre)]
  const porPuntos   = [...equipo].sort((a,b) => (b.puntos||0)-(a.puntos||0))
  const porIngresos = [...equipo].sort((a,b) => (b.loginCount||0)-(a.loginCount||0))
  const maxLogin    = porIngresos[0]?.loginCount || 1
  const activas     = equipo.filter(p => p.ultimoAccesoFecha === hoy)
  const avgPts      = equipo.length ? Math.round(equipo.reduce((s,p)=>s+(p.puntos||0),0)/equipo.length) : 0

  function handleDescargar() {
    const hoyStr = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' })
    const cabecera = ['Nombre', 'Supervisor', 'Puntos', 'Retos completados', 'Racha (días)', 'Ingresos', 'Último acceso', 'Activa hoy']
    const filas = equipo.map(p => [
      p.nombre,
      p.supervisor,
      p.puntos || 0,
      p.retosCompletados || 0,
      p.racha || 0,
      p.loginCount || 0,
      formatearFecha(p.ultimoAccesoFecha),
      p.ultimoAccesoFecha === hoy ? 'Sí' : 'No',
    ])
    descargarXLS([cabecera, ...filas], `equipo_${supNombre.replace(/ /g,'_')}_${hoyStr.replace(/\//g,'-')}.xls`)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onVolver} className="w-9 h-9 rounded-xl bg-brand-medium flex items-center justify-center text-white hover:bg-brand-dark transition-all flex-shrink-0">
          ←
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-base font-black text-white truncate">{supNombre}</p>
          <p className="text-xs text-gray-500">{equipo.length} promotoras · ⚡ {activas.length} activas hoy · ⭐ {avgPts} pts prom.</p>
        </div>
        <button onClick={handleDescargar}
          className="flex-shrink-0 flex items-center gap-1.5 bg-green-700/30 border border-green-500/40 text-green-400 text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-700/50 transition-all active:scale-95">
          ⬇️ Excel
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2">
        <button onClick={() => setVista('ranking')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            vista === 'ranking' ? 'bg-yellow-500 text-black' : 'bg-brand-medium text-gray-400'
          }`}>
          🏆 Ranking Juegos
        </button>
        <button onClick={() => setVista('usabilidad')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
            vista === 'usabilidad' ? 'bg-purple-600 text-white' : 'bg-brand-medium text-gray-400'
          }`}>
          🔑 Usabilidad
        </button>
      </div>

      {/* Ranking */}
      {vista === 'ranking' && (
        <div className="bg-brand-dark rounded-2xl border border-yellow-600/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-yellow-900/20">
            <p className="text-sm font-bold text-yellow-300">🏆 Ranking por puntos — {equipo.length} promotoras</p>
          </div>
          <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
            {porPuntos.length === 0
              ? <p className="text-xs text-gray-500 text-center py-8">Sin promotoras registradas en este equipo</p>
              : porPuntos.map((p, i) => (
              <div key={p.id||i} className="flex items-center gap-3 px-4 py-3">
                <span className={`text-xs font-black w-6 text-center flex-shrink-0 ${i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-600'}`}>
                  {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                </span>
                <Avatar seed={p.avatar} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                  <p className="text-[10px] text-gray-500">🎯 {p.retosCompletados||0} retos · 🔥 {p.racha||0}d racha</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-yellow-400">⭐ {p.puntos||0}</p>
                  <p className={`text-[10px] ${p.ultimoAccesoFecha===hoy?'text-green-400':'text-gray-600'}`}>
                    {p.ultimoAccesoFecha===hoy?'Hoy ✅':tiempoDesde(p.ultimoAccesoFecha)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usabilidad */}
      {vista === 'usabilidad' && (
        <div className="bg-brand-dark rounded-2xl border border-purple-600/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 bg-purple-900/20">
            <p className="text-sm font-bold text-white">🔑 Ingresos a la plataforma</p>
            <p className="text-xs text-gray-500 mt-0.5">Ordenado por número de accesos</p>
          </div>
          <div className="divide-y divide-white/5 max-h-[420px] overflow-y-auto">
            {porIngresos.length === 0
              ? <p className="text-xs text-gray-500 text-center py-8">Sin promotoras registradas</p>
              : porIngresos.map((p, i) => {
              const logins   = p.loginCount || 0
              const barWidth = Math.round((logins / maxLogin) * 100)
              const activa   = p.ultimoAccesoFecha === hoy
              return (
                <div key={p.id||i} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-gray-600 w-5 text-center flex-shrink-0">#{i+1}</span>
                    <Avatar seed={p.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                      <p className={`text-[10px] font-bold ${activa?'text-green-400':'text-gray-600'}`}>
                        {activa ? 'Activa hoy ✅' : `Último: ${tiempoDesde(p.ultimoAccesoFecha)}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-lg font-black ${logins>=10?'text-green-400':logins>=3?'text-yellow-400':'text-red-400'}`}>{logins}</p>
                      <p className="text-[10px] text-gray-500">ingresos</p>
                    </div>
                  </div>
                  <div className="mt-1.5 ml-14 bg-brand-medium rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${logins>=10?'bg-green-500':logins>=3?'bg-yellow-500':'bg-red-500'}`}
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
      )}
    </div>
  )
}

export default function JefeDashboard({ session }) {
  const [tab, setTab]           = useState('resumen')
  const [promotoras, setPromotoras] = useState([])
  const [supervisores, setSupervisores] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [rankOpen, setRankOpen] = useState(null)
  const [statAbierta, setStatAbierta] = useState(null)
  const [supSeleccionado, setSupSeleccionado] = useState(null)
  const [supExpandido, setSupExpandido] = useState(null)
  const [busqueda, setBusqueda] = useState('')

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
              {/* 🔍 Buscador de promotora */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
                <input
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Buscar promotora por nombre..."
                  className="w-full bg-brand-dark border border-white/10 rounded-2xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50"
                />
                {busqueda && (
                  <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs">✕</button>
                )}
              </div>

              {/* Resultados del buscador */}
              {busqueda.trim().length >= 2 && (() => {
                const resultados = promotoras.filter(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()))
                return (
                  <div className="bg-brand-dark rounded-2xl border border-yellow-500/30 overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-white/5 bg-yellow-900/20 flex items-center justify-between">
                      <p className="text-xs font-bold text-yellow-300">🔍 {resultados.length} resultado{resultados.length !== 1 ? 's' : ''} para "{busqueda}"</p>
                    </div>
                    {resultados.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-6">No se encontró ninguna promotora con ese nombre</p>
                    ) : (
                      <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                        {resultados.map((p, i) => (
                          <div key={p.id||i} className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar seed={p.avatar} size="sm" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{p.nombre}</p>
                                <p className="text-[10px] text-gray-500 truncate">👔 {p.supervisor || 'Sin asignar'}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-black text-yellow-400">⭐ {p.puntos||0}</p>
                                <p className={`text-[10px] font-bold ${p.ultimoAccesoFecha===hoy?'text-green-400':'text-gray-500'}`}>
                                  {p.ultimoAccesoFecha===hoy?'Hoy ✅':tiempoDesde(p.ultimoAccesoFecha)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 ml-11 grid grid-cols-3 gap-2">
                              <div className="bg-brand-medium rounded-lg px-2 py-1 text-center">
                                <p className="text-xs font-black text-orange-400">🔥 {p.racha||0}d</p>
                                <p className="text-[9px] text-gray-500">Racha</p>
                              </div>
                              <div className="bg-brand-medium rounded-lg px-2 py-1 text-center">
                                <p className="text-xs font-black text-blue-400">🎯 {p.retosCompletados||0}</p>
                                <p className="text-[9px] text-gray-500">Retos</p>
                              </div>
                              <div className="bg-brand-medium rounded-lg px-2 py-1 text-center">
                                <p className="text-xs font-black text-purple-400">🔑 {p.loginCount||0}</p>
                                <p className="text-[9px] text-gray-500">Ingresos</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })()}

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

              {/* Resumen por supervisor — clickeable */}
              {supSeleccionado ? (
                <SupDetalle
                  supNombre={supSeleccionado}
                  supData={supervisores.find(s => s.nombre === supSeleccionado)}
                  promotoras={promotoras}
                  hoy={hoy}
                  onVolver={() => setSupSeleccionado(null)}
                />
              ) : (
                <div>
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">📋 Vista rápida por supervisor</p>
                  <div className="space-y-2">
                    {misSupes.map(supNombre => {
                      const supData = supervisores.find(s => s.nombre === supNombre)
                      const equipo  = promotoras.filter(p => p.supervisor === supNombre)
                      const activas = equipo.filter(p => p.ultimoAccesoFecha === hoy)
                      const avgPts  = equipo.length ? Math.round(equipo.reduce((s,p) => s+(p.puntos||0), 0) / equipo.length) : 0
                      return (
                        <button key={supNombre} onClick={() => setSupSeleccionado(supNombre)}
                          className="w-full bg-brand-dark rounded-2xl p-4 border border-white/5 flex items-center gap-3 hover:border-yellow-500/30 hover:bg-yellow-900/10 transition-all text-left active:scale-[0.98]">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${supData?.registrado ? 'bg-purple-500/20' : 'bg-red-500/10'}`}>
                            {supData?.registrado ? '👔' : '⚠️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{supNombre}</p>
                            <p className="text-xs text-gray-500">{equipo.length} promotoras · {activas.length} activas hoy</p>
                          </div>
                          <div className="text-right flex-shrink-0 flex items-center gap-2">
                            <div>
                              <p className="text-sm font-black text-yellow-400">⭐ {avgPts}</p>
                              <p className="text-xs text-gray-600">promedio</p>
                            </div>
                            <span className="text-gray-500 text-sm">›</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

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

                  const isOpen    = supExpandido === supNombre
                  const porLogin  = [...equipo].sort((a,b) => (b.loginCount||0)-(a.loginCount||0))
                  const maxLogin  = porLogin[0]?.loginCount || 1
                  const verdes    = equipo.filter(p=>(p.loginCount||0)>=10).length
                  const amarillas = equipo.filter(p=>(p.loginCount||0)>=3&&(p.loginCount||0)<10).length
                  const rojas     = equipo.filter(p=>(p.loginCount||0)<3).length

                  return (
                    <div key={supNombre} className={`rounded-2xl border overflow-hidden ${statusColor}`}>
                      {/* Header clickeable */}
                      <button
                        onClick={() => setSupExpandido(isOpen ? null : supNombre)}
                        className="w-full p-4 text-left hover:bg-white/5 transition-all">
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
                            <div className="flex gap-3 mt-2 flex-wrap">
                              <span className="text-[11px] text-gray-400">👥 {equipo.length} promotoras</span>
                              <span className={`text-[11px] font-bold ${activas.length > 0 ? 'text-green-400' : 'text-gray-600'}`}>⚡ {activas.length} hoy</span>
                              <span className="text-[11px] text-green-400">✓{verdes}</span>
                              <span className="text-[11px] text-yellow-400">~{amarillas}</span>
                              <span className="text-[11px] text-red-400">✗{rojas}</span>
                            </div>
                          </div>
                          <span className={`text-gray-400 text-sm transition-transform flex-shrink-0 mt-1 ${isOpen?'rotate-180':''}`}>▼</span>
                        </div>

                        {!supData?.registrado && (
                          <div className="mt-3 bg-red-900/20 rounded-xl px-3 py-2">
                            <p className="text-xs text-red-300 leading-relaxed">
                              Recuérdale que debe crear su cuenta en la app para acceder al módulo de supervisores.
                            </p>
                          </div>
                        )}
                      </button>

                      {/* Lista expandida de promotoras — usabilidad */}
                      {isOpen && (
                        <div className="border-t border-white/10">
                          <div className="px-4 py-2 bg-purple-900/20 flex items-center justify-between">
                            <p className="text-[10px] font-black text-purple-300 uppercase tracking-wider">🔑 Usabilidad del equipo</p>
                            <p className="text-[10px] text-gray-500">ordenado por ingresos</p>
                          </div>
                          {porLogin.length === 0
                            ? <p className="text-xs text-gray-500 text-center py-4">Sin promotoras registradas</p>
                            : porLogin.map((p, i) => {
                                const logins  = p.loginCount || 0
                                const barW    = Math.round((logins / maxLogin) * 100)
                                const activa  = p.ultimoAccesoFecha === hoy
                                return (
                                  <div key={p.id||i} className="px-4 py-2.5 border-b border-white/5 last:border-0">
                                    <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black text-gray-600 w-5 text-center flex-shrink-0">#{i+1}</span>
                                      <Avatar seed={p.avatar} size="sm" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                                        <p className={`text-[10px] font-bold ${activa?'text-green-400':'text-gray-600'}`}>
                                          {activa ? 'Activa hoy ✅' : tiempoDesde(p.ultimoAccesoFecha)}
                                        </p>
                                      </div>
                                      <div className="text-right flex-shrink-0">
                                        <p className={`text-base font-black ${logins>=10?'text-green-400':logins>=3?'text-yellow-400':'text-red-400'}`}>{logins}</p>
                                        <p className="text-[9px] text-gray-500">ingresos</p>
                                      </div>
                                    </div>
                                    <div className="mt-1.5 ml-12 bg-brand-medium rounded-full h-1.5">
                                      <div className={`h-1.5 rounded-full ${logins>=10?'bg-green-500':logins>=3?'bg-yellow-500':'bg-red-500'}`}
                                        style={{ width: `${barW}%` }} />
                                    </div>
                                  </div>
                                )
                              })
                          }
                          <div className="px-4 py-2 border-t border-white/5 bg-brand-medium/20 flex gap-3 text-[9px]">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"/>10+ ingresos</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block"/>3-9 ingresos</span>
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"/>0-2 ingresos</span>
                          </div>
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

          {/* ═══ RANKINGS Y USABILIDAD ═══ */}
          {tab === 'rankings' && (
            <RankingsRegion promotoras={promotoras} misSupes={misSupes} hoy={hoy} />
          )}

          </>
        )}
      </div>
    </div>
  )
}
