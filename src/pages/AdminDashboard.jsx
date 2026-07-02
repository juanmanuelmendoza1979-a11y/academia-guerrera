import { useState, useEffect, useMemo } from 'react'
import { obtenerTodosUsuarios, resetearDatosUsuario, eliminarDocumento, cambiarPinAdmin } from '../lib/db'
import Avatar from '../components/Avatar'

function descargarXLS(filas, nombreArchivo) {
  const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
  const filaXML = f => '<Row>' + f.map(c => {
    const v = c ?? ''; const t = typeof v === 'number' ? 'Number' : 'String'
    return `<Cell><Data ss:Type="${t}">${esc(v)}</Data></Cell>`
  }).join('') + '</Row>'
  const xml = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles><Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1a1a2e" ss:Pattern="Solid"/></Style></Styles>
<Worksheet ss:Name="Reporte"><Table>
<Row ss:StyleID="h">${filas[0].map(c=>`<Cell ss:StyleID="h"><Data ss:Type="String">${esc(c)}</Data></Cell>`).join('')}</Row>
${filas.slice(1).map(filaXML).join('\n')}</Table></Worksheet></Workbook>`
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const url = URL.createObjectURL(blob); const a = document.createElement('a')
  a.href = url; a.download = nombreArchivo; a.click(); URL.revokeObjectURL(url)
}

function tiempoDesde(fechaStr) {
  if (!fechaStr) return 'Nunca'
  const hoy  = new Date().toDateString()
  const ayer = new Date(Date.now() - 86400000).toDateString()
  if (fechaStr === hoy)  return 'Hoy ✅'
  if (fechaStr === ayer) return 'Ayer'
  try { return new Date(fechaStr).toLocaleDateString('es-PE', { day:'numeric', month:'short' }) }
  catch { return fechaStr }
}

const TABS = [
  { id: 'resumen',      icon: '📊', label: 'Resumen' },
  { id: 'promotoras',   icon: '👥', label: 'Promotoras' },
  { id: 'supervisores', icon: '👔', label: 'Supervisores' },
  { id: 'jefes',        icon: '🏆', label: 'Jefes' },
]

export default function AdminDashboard({ onLogout }) {
  const [datos, setDatos]         = useState({ guerreras: [], supervisores: [], jefes: [] })
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('resumen')
  const [filtroActivo, setFiltroActivo] = useState(null) // 'activas-hoy' | 'sin-acceso' | 'por-ingresos' | null
  const [busqueda, setBusqueda]   = useState('')
  const [modal, setModal]         = useState(null)
  const [pinNuevo, setPinNuevo]   = useState('')
  const [procesando, setProcesando] = useState(false)
  const [toast, setToast]         = useState('')

  const hoy = new Date().toDateString()

  function irATab(tabId, filtro = null) {
    setTab(tabId)
    setFiltroActivo(filtro)
    setBusqueda('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function mostrarToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function recargar() {
    setLoading(true)
    obtenerTodosUsuarios()
      .then(d => { setDatos(d); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { recargar() }, [])

  // Stats globales
  const totalTodos   = datos.guerreras.length + datos.supervisores.length + datos.jefes.length
  const activasHoy   = datos.guerreras.filter(p => p.ultimoAccesoFecha === hoy).length
  const totalIngresos = datos.guerreras.reduce((s, p) => s + (p.loginCount || 0), 0)
  const sinActividad  = datos.guerreras.filter(p => !p.ultimoAccesoFecha).length

  // Búsqueda global
  const resultadosBusqueda = useMemo(() => {
    if (busqueda.trim().length < 2) return []
    const q = busqueda.toLowerCase()
    const mapear = (lista, col) => lista
      .filter(u => u.nombre?.toLowerCase().includes(q))
      .map(u => ({ ...u, _coleccion: col }))
    return [
      ...mapear(datos.guerreras, 'guerreras'),
      ...mapear(datos.supervisores, 'supervisores'),
      ...mapear(datos.jefes, 'jefes'),
    ]
  }, [busqueda, datos])

  async function handleReset() {
    if (!modal) return
    setProcesando(true)
    try {
      await resetearDatosUsuario(modal.usuario._docId, modal.coleccion)
      mostrarToast(`✅ Datos de ${modal.usuario.nombre} reseteados`)
      setModal(null)
      recargar()
    } catch { mostrarToast('❌ Error al resetear') }
    setProcesando(false)
  }

  async function handleEliminar() {
    if (!modal) return
    setProcesando(true)
    try {
      await eliminarDocumento(modal.usuario._docId, modal.coleccion)
      mostrarToast(`🗑️ ${modal.usuario.nombre} eliminado`)
      setModal(null)
      recargar()
    } catch { mostrarToast('❌ Error al eliminar') }
    setProcesando(false)
  }

  async function handleCambiarPin() {
    if (!modal || !pinNuevo.trim()) return
    setProcesando(true)
    try {
      await cambiarPinAdmin(modal.usuario._docId, modal.coleccion, pinNuevo.trim())
      mostrarToast(`🔑 PIN de ${modal.usuario.nombre} actualizado`)
      setModal(null)
      setPinNuevo('')
    } catch { mostrarToast('❌ Error al cambiar PIN') }
    setProcesando(false)
  }

  function exportarTodo() {
    const cabG = ['Rol', 'Nombre', 'Correo', 'Supervisor', 'Puntos', 'Racha', 'Retos', 'Ingresos', 'Nivel', 'Último acceso']
    const filasG = datos.guerreras.map(p => ['Promotora', p.nombre, p.correo||'', p.supervisor||'', p.puntos||0, p.racha||0, p.retosCompletados||0, p.loginCount||0, p.nivel||'Inicial', p.ultimoAccesoFecha||'Nunca'])
    const filasS = datos.supervisores.map(s => ['Supervisor', s.nombre, s.correo||'', s.jefe||'', '-', '-', '-', s.loginCount||0, '-', ''])
    const filasJ = datos.jefes.map(j => ['Jefe', j.nombre, j.correo||'', '', '-', '-', '-', j.loginCount||0, '-', ''])
    const hoyStr = new Date().toLocaleDateString('es-PE', { day:'2-digit', month:'2-digit', year:'numeric' })
    descargarXLS([cabG, ...filasG, ...filasS, ...filasJ], `admin_todos_usuarios_${hoyStr.replace(/\//g,'-')}.xls`)
  }

  // ── Componente de fila de usuario ──
  function FilaUsuario({ u, coleccion }) {
    const [expandido, setExpandido] = useState(false)
    const esGuerrera = coleccion === 'guerreras'
    const activa = u.ultimoAccesoFecha === hoy
    return (
      <div className="border-b border-white/5 last:border-0">
        <button onClick={() => setExpandido(e => !e)} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/5 transition-all text-left">
          {esGuerrera
            ? <Avatar seed={u.avatar} size="sm" />
            : <div className="w-8 h-8 rounded-full bg-brand-medium flex items-center justify-center text-sm flex-shrink-0">
                {coleccion === 'supervisores' ? '👔' : '🏆'}
              </div>
          }
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{u.nombre}</p>
            <p className="text-[10px] text-gray-500 truncate">
              {esGuerrera ? `Sup: ${u.supervisor||'—'}` : `${u.correo||'Sin correo'}`}
            </p>
          </div>
          <div className="text-right flex-shrink-0 mr-2">
            {esGuerrera && <p className="text-xs font-black text-yellow-400">⭐ {u.puntos||0}</p>}
            <p className={`text-[10px] font-bold ${activa ? 'text-green-400' : 'text-gray-600'}`}>
              {tiempoDesde(u.ultimoAccesoFecha)}
            </p>
          </div>
          <span className="text-gray-600 text-xs">{expandido ? '▲' : '▼'}</span>
        </button>

        {expandido && (
          <div className="px-4 pb-4 space-y-3 bg-brand-medium/20">
            {/* Stats */}
            {esGuerrera && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { label: 'Puntos',   val: u.puntos||0,            color: 'text-yellow-400' },
                  { label: 'Racha',    val: `${u.racha||0}d`,       color: 'text-orange-400' },
                  { label: 'Retos',    val: u.retosCompletados||0,  color: 'text-blue-400'   },
                  { label: 'Ingresos', val: u.loginCount||0,         color: 'text-purple-400' },
                ].map(s => (
                  <div key={s.label} className="bg-brand-dark rounded-xl p-2 text-center">
                    <p className={`text-sm font-black ${s.color}`}>{s.val}</p>
                    <p className="text-[9px] text-gray-500">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            {!esGuerrera && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-brand-dark rounded-xl p-2 text-center">
                  <p className="text-sm font-black text-purple-400">{u.loginCount||0}</p>
                  <p className="text-[9px] text-gray-500">Ingresos</p>
                </div>
                <div className="bg-brand-dark rounded-xl p-2 text-center">
                  <p className={`text-sm font-black ${activa ? 'text-green-400' : 'text-gray-500'}`}>
                    {activa ? 'Hoy ✅' : tiempoDesde(u.ultimoAccesoFecha)}
                  </p>
                  <p className="text-[9px] text-gray-500">Último acceso</p>
                </div>
              </div>
            )}
            {u.correo && esGuerrera && (
              <p className="text-[10px] text-gray-500">📧 {u.correo}</p>
            )}

            {/* Acciones */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setModal({ tipo: 'reset', usuario: u, coleccion })}
                className="py-2 bg-yellow-700/30 border border-yellow-600/40 text-yellow-400 text-[10px] font-bold rounded-xl hover:bg-yellow-700/50 transition-all"
              >
                🔄 Resetear
              </button>
              <button
                onClick={() => { setModal({ tipo: 'pin', usuario: u, coleccion }); setPinNuevo('') }}
                className="py-2 bg-blue-700/30 border border-blue-600/40 text-blue-400 text-[10px] font-bold rounded-xl hover:bg-blue-700/50 transition-all"
              >
                🔑 Cambiar PIN
              </button>
              <button
                onClick={() => setModal({ tipo: 'eliminar', usuario: u, coleccion })}
                className="py-2 bg-red-700/30 border border-red-600/40 text-red-400 text-[10px] font-bold rounded-xl hover:bg-red-700/50 transition-all"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-black pb-24">

      {/* Header */}
      <div className="bg-gradient-to-br from-red-900/60 to-brand-dark border-b border-red-500/20 px-4 py-5">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">🛡️ Panel Administrador</p>
            <h2 className="text-xl font-black text-white mt-0.5">Gestión Global</h2>
            <p className="text-xs text-gray-400 mt-1">{totalTodos} usuarios registrados</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportarTodo} className="flex items-center gap-1.5 bg-green-700/30 border border-green-500/40 text-green-400 text-xs font-bold px-3 py-2 rounded-xl hover:bg-green-700/50 transition-all">
              ⬇️ Excel
            </button>
            <button onClick={recargar} className="flex items-center gap-1.5 bg-brand-medium border border-white/10 text-gray-300 text-xs font-bold px-3 py-2 rounded-xl hover:bg-brand-dark transition-all">
              🔄
            </button>
            <button onClick={onLogout} className="flex items-center gap-1.5 bg-red-900/30 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-900/50 transition-all">
              ⏏ Salir
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-brand-black/95 backdrop-blur-sm border-b border-white/5 px-4 pb-2 pt-3">
        <div className="flex gap-1.5 max-w-4xl mx-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => irATab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-bold transition-all relative ${
                tab === t.id ? 'bg-red-700 text-white' : 'bg-brand-medium text-gray-400'
              }`}>
              <span>{t.icon}</span><span className="hidden sm:inline">{t.label}</span>
              {tab === t.id && filtroActivo && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl animate-spin">⏳</span>
            <p className="text-sm text-gray-400">Cargando todos los usuarios...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Buscador global */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">🔍</span>
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar en todos los usuarios..."
                className="w-full bg-brand-dark border border-white/10 rounded-2xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
              />
              {busqueda && (
                <button onClick={() => setBusqueda('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs">✕</button>
              )}
            </div>

            {/* Resultados búsqueda */}
            {busqueda.trim().length >= 2 && (
              <div className="bg-brand-dark rounded-2xl border border-red-500/30 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/5 bg-red-900/20">
                  <p className="text-xs font-bold text-red-300">🔍 {resultadosBusqueda.length} resultado(s) para "{busqueda}"</p>
                </div>
                {resultadosBusqueda.length === 0
                  ? <p className="text-xs text-gray-500 text-center py-6">No se encontraron usuarios</p>
                  : resultadosBusqueda.map((u, i) => (
                      <FilaUsuario key={u._docId||i} u={u} coleccion={u._coleccion} />
                    ))
                }
              </div>
            )}

            {/* ── RESUMEN ── */}
            {tab === 'resumen' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: '👥', val: datos.guerreras.length,    label: 'Promotoras',     color: 'bg-blue-700/20 border-blue-600/30',    hint: 'Ver todas →', accion: () => irATab('promotoras')                          },
                    { icon: '⚡', val: activasHoy,                label: 'Activas hoy',    color: 'bg-green-700/20 border-green-600/30',  hint: 'Ver activas →', accion: () => irATab('promotoras', 'activas-hoy')           },
                    { icon: '👔', val: datos.supervisores.length,  label: 'Supervisores',   color: 'bg-purple-700/20 border-purple-600/30', hint: 'Ver lista →', accion: () => irATab('supervisores')                        },
                    { icon: '🏆', val: datos.jefes.length,         label: 'Jefes',          color: 'bg-yellow-700/20 border-yellow-600/30', hint: 'Ver lista →', accion: () => irATab('jefes')                               },
                    { icon: '🔑', val: totalIngresos,              label: 'Total ingresos', color: 'bg-red-700/20 border-red-600/30',      hint: 'Por ingresos →', accion: () => irATab('promotoras', 'por-ingresos')        },
                    { icon: '😴', val: sinActividad,              label: 'Sin acceso',     color: 'bg-gray-700/20 border-gray-600/30',    hint: 'Ver inactivas →', accion: () => irATab('promotoras', 'sin-acceso')         },
                  ].map((s, i) => (
                    <button key={i} onClick={s.accion}
                      className={`rounded-2xl p-4 border text-left transition-all active:scale-95 hover:brightness-125 ${s.color}`}>
                      <span className="text-2xl block mb-1">{s.icon}</span>
                      <p className="text-2xl font-black text-white">{s.val}</p>
                      <p className="text-xs font-bold text-white/70 leading-tight">{s.label}</p>
                      <p className="text-[10px] text-white/40 mt-1">{s.hint}</p>
                    </button>
                  ))}
                </div>

                {/* Top 5 promotoras */}
                <div className="bg-brand-dark rounded-2xl border border-yellow-600/20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-yellow-900/20">
                    <p className="text-sm font-bold text-yellow-300">🏆 Top 5 promotoras por puntos</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {[...datos.guerreras]
                      .sort((a, b) => (b.puntos||0) - (a.puntos||0))
                      .slice(0, 5)
                      .map((p, i) => (
                        <div key={p._docId||i} className="px-4 py-2.5 flex items-center gap-3">
                          <span className={`text-xs font-black w-6 text-center flex-shrink-0 ${i===0?'text-yellow-400':i===1?'text-gray-300':i===2?'text-amber-600':'text-gray-600'}`}>
                            {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                          </span>
                          <Avatar seed={p.avatar} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                            <p className="text-[10px] text-gray-500">Sup: {p.supervisor}</p>
                          </div>
                          <p className="text-sm font-black text-yellow-400 flex-shrink-0">⭐ {p.puntos||0}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>

                {/* Top 5 por ingresos */}
                <div className="bg-brand-dark rounded-2xl border border-purple-600/20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/5 bg-purple-900/20">
                    <p className="text-sm font-bold text-purple-300">🔑 Top 5 por número de ingresos</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {[...datos.guerreras]
                      .sort((a, b) => (b.loginCount||0) - (a.loginCount||0))
                      .slice(0, 5)
                      .map((p, i) => (
                        <div key={p._docId||i} className="px-4 py-2.5 flex items-center gap-3">
                          <span className="text-xs font-black text-gray-600 w-5 text-center">#{i+1}</span>
                          <Avatar seed={p.avatar} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{p.nombre}</p>
                            <p className="text-[10px] text-gray-500">Sup: {p.supervisor}</p>
                          </div>
                          <p className="text-sm font-black text-purple-400 flex-shrink-0">🔑 {p.loginCount||0}</p>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </>
            )}

            {/* ── PROMOTORAS ── */}
            {tab === 'promotoras' && (() => {
              let lista = [...datos.guerreras]
              let tituloFiltro = null

              if (filtroActivo === 'activas-hoy') {
                lista = lista.filter(p => p.ultimoAccesoFecha === hoy)
                tituloFiltro = { icon: '⚡', texto: `Activas hoy — ${lista.length}`, color: 'text-green-300 bg-green-900/20 border-green-600/20' }
              } else if (filtroActivo === 'sin-acceso') {
                lista = lista.filter(p => !p.ultimoAccesoFecha)
                tituloFiltro = { icon: '😴', texto: `Sin acceso nunca — ${lista.length}`, color: 'text-gray-300 bg-gray-900/20 border-gray-600/20' }
              } else if (filtroActivo === 'por-ingresos') {
                lista = lista.sort((a, b) => (b.loginCount||0) - (a.loginCount||0))
                tituloFiltro = { icon: '🔑', texto: `Por ingresos — ${lista.length}`, color: 'text-red-300 bg-red-900/20 border-red-600/20' }
              } else {
                lista = lista.sort((a, b) => (b.puntos||0) - (a.puntos||0))
              }

              return (
                <div className="space-y-2">
                  {filtroActivo && (
                    <div className={`flex items-center justify-between rounded-2xl px-4 py-2.5 border ${tituloFiltro.color}`}>
                      <p className={`text-xs font-bold ${tituloFiltro.color.split(' ')[0]}`}>
                        {tituloFiltro.icon} {tituloFiltro.texto}
                      </p>
                      <button onClick={() => setFiltroActivo(null)}
                        className="text-[10px] text-gray-500 hover:text-white border border-white/10 rounded-lg px-2 py-1 transition-all">
                        ✕ Quitar filtro
                      </button>
                    </div>
                  )}
                  <div className="bg-brand-dark rounded-2xl border border-blue-600/20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 bg-blue-900/20 flex items-center justify-between">
                      <p className="text-sm font-bold text-blue-300">👥 {filtroActivo ? 'Resultado filtrado' : 'Todas las Promotoras'} — {lista.length}</p>
                      <span className="text-xs text-green-400">{activasHoy} activas hoy</span>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto">
                      {lista.length === 0
                        ? <p className="text-xs text-gray-500 text-center py-8">Sin resultados para este filtro</p>
                        : lista.map((u, i) => <FilaUsuario key={u._docId||i} u={u} coleccion="guerreras" />)
                      }
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* ── SUPERVISORES ── */}
            {tab === 'supervisores' && (
              <div className="bg-brand-dark rounded-2xl border border-purple-600/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 bg-purple-900/20">
                  <p className="text-sm font-bold text-purple-300">👔 Supervisores — {datos.supervisores.length}</p>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {datos.supervisores.length === 0
                    ? <p className="text-xs text-gray-500 text-center py-8">Sin supervisores registrados</p>
                    : [...datos.supervisores]
                        .sort((a, b) => (b.loginCount||0) - (a.loginCount||0))
                        .map((u, i) => <FilaUsuario key={u._docId||i} u={u} coleccion="supervisores" />)
                  }
                </div>
              </div>
            )}

            {/* ── JEFES ── */}
            {tab === 'jefes' && (
              <div className="bg-brand-dark rounded-2xl border border-yellow-600/20 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/5 bg-yellow-900/20">
                  <p className="text-sm font-bold text-yellow-300">🏆 Jefes Regionales — {datos.jefes.length}</p>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  {datos.jefes.length === 0
                    ? <p className="text-xs text-gray-500 text-center py-8">Sin jefes registrados</p>
                    : [...datos.jefes]
                        .sort((a, b) => (b.loginCount||0) - (a.loginCount||0))
                        .map((u, i) => <FilaUsuario key={u._docId||i} u={u} coleccion="jefes" />)
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modales ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => !procesando && setModal(null)}>
          <div className="bg-brand-dark border border-white/10 rounded-3xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>

            {/* Modal Reset */}
            {modal.tipo === 'reset' && (
              <>
                <div className="text-center">
                  <span className="text-4xl block mb-2">🔄</span>
                  <p className="text-base font-black text-white">Resetear datos</p>
                  <p className="text-sm text-gray-400 mt-1">
                    ¿Resetear puntos, racha e ingresos de <span className="text-white font-bold">{modal.usuario.nombre}</span>?
                  </p>
                  <p className="text-xs text-yellow-400 mt-2">No se elimina el usuario, solo sus estadísticas.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-3 bg-brand-medium rounded-xl font-bold text-white text-sm">Cancelar</button>
                  <button onClick={handleReset} disabled={procesando} className="flex-1 py-3 bg-yellow-600 rounded-xl font-bold text-white text-sm disabled:opacity-50">
                    {procesando ? 'Reseteando...' : 'Sí, resetear'}
                  </button>
                </div>
              </>
            )}

            {/* Modal Cambiar PIN */}
            {modal.tipo === 'pin' && (
              <>
                <div className="text-center">
                  <span className="text-4xl block mb-2">🔑</span>
                  <p className="text-base font-black text-white">Cambiar PIN</p>
                  <p className="text-sm text-gray-400 mt-1">{modal.usuario.nombre}</p>
                </div>
                <input
                  type="text"
                  value={pinNuevo}
                  onChange={e => setPinNuevo(e.target.value)}
                  placeholder="Nuevo PIN (mín. 4 caracteres)"
                  className="w-full bg-brand-medium border border-white/10 rounded-xl px-4 py-3 text-white text-center font-bold focus:outline-none focus:border-blue-500/50"
                  maxLength={10}
                />
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-3 bg-brand-medium rounded-xl font-bold text-white text-sm">Cancelar</button>
                  <button onClick={handleCambiarPin} disabled={procesando || pinNuevo.length < 4} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-white text-sm disabled:opacity-50">
                    {procesando ? 'Guardando...' : 'Guardar PIN'}
                  </button>
                </div>
              </>
            )}

            {/* Modal Eliminar */}
            {modal.tipo === 'eliminar' && (
              <>
                <div className="text-center">
                  <span className="text-4xl block mb-2">🗑️</span>
                  <p className="text-base font-black text-white">Eliminar usuario</p>
                  <p className="text-sm text-gray-400 mt-1">
                    ¿Eliminar a <span className="text-red-400 font-bold">{modal.usuario.nombre}</span> de Firestore?
                  </p>
                  <p className="text-xs text-red-400 mt-2 font-bold">⚠️ Esta acción no se puede deshacer.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setModal(null)} className="flex-1 py-3 bg-brand-medium rounded-xl font-bold text-white text-sm">Cancelar</button>
                  <button onClick={handleEliminar} disabled={procesando} className="flex-1 py-3 bg-red-700 rounded-xl font-bold text-white text-sm disabled:opacity-50">
                    {procesando ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-brand-dark border border-white/10 rounded-2xl px-5 py-3 shadow-2xl">
          <p className="text-sm font-bold text-white">{toast}</p>
        </div>
      )}
    </div>
  )
}
