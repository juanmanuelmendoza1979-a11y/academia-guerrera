import { useState, useMemo } from 'react'
import data from '../data/puntoVentaData.json'

const { situaciones, objeciones, filtrosCliente, filtrosHerramienta, filtrosObjetivo } = data

// ─── Utility ─────────────────────────────────────────────────────────────────
async function copyText(text) {
  try { await navigator.clipboard.writeText(text) } catch {}
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PuntoVenta({ onUpdatePoints }) {
  const [tab, setTab] = useState('guia')

  const tabs = [
    { id: 'guia',       label: 'Guía',      icon: '📋' },
    { id: 'plan',       label: 'Plan Día',  icon: '⏱️' },
    { id: 'objeciones', label: 'Objeciones',icon: '🛡️' },
    { id: 'entrenar',   label: 'Entrenar',  icon: '🎯' },
  ]

  return (
    <div className="min-h-screen bg-brand-black pb-24 animate-fade-in overflow-x-hidden w-full">
      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-teal-700 px-4 pt-5 pb-6">
        <div className="absolute top-0 right-0 text-8xl opacity-10 translate-x-4 -translate-y-2">🛒</div>
        <p className="text-xs font-bold text-green-200 uppercase tracking-wider mb-1">Módulo práctico</p>
        <h1 className="text-xl font-black text-white leading-tight mb-1">
          Cómo ofrecer TE APUESTO
        </h1>
        <p className="text-sm text-green-100 leading-relaxed">
          en el Punto de Venta
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-full font-medium">
            📋 {situaciones.length} situaciones reales
          </span>
          <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-full font-medium">
            🛡️ {objeciones.length} objeciones clave
          </span>
          <span className="text-xs bg-white/10 text-white px-3 py-1 rounded-full font-medium">
            🎯 Mini retos por situación
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mx-4 mt-4 bg-brand-dark rounded-2xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t.id
                ? 'bg-brand-green text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span className="text-base">{t.icon}</span>
            <span className="leading-tight text-center">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 mt-4">
        {tab === 'guia'       && <TabGuia onUpdatePoints={onUpdatePoints} />}
        {tab === 'plan'       && <TabPlanDia />}
        {tab === 'objeciones' && <TabObjeciones />}
        {tab === 'entrenar'   && <TabEntrenar onUpdatePoints={onUpdatePoints} />}
      </div>
    </div>
  )
}

// ─── TAB: Guía Práctica ───────────────────────────────────────────────────────
function TabGuia({ onUpdatePoints }) {
  const [search, setSearch] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroHerramienta, setFiltroHerramienta] = useState('')
  const [filtroObjetivo, setFiltroObjetivo] = useState('')
  const [modoLectura, setModoLectura] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return situaciones.filter(s => {
      const matchSearch = !q ||
        s.titulo.toLowerCase().includes(q) ||
        s.situacion.toLowerCase().includes(q) ||
        s.tipoCliente.some(t => t.toLowerCase().includes(q)) ||
        s.objetivo.toLowerCase().includes(q)
      const matchCliente = !filtroCliente ||
        s.tipoCliente.some(t => t === filtroCliente) ||
        s.tipoCliente.some(t => t === 'Todo tipo de cliente')
      const matchHerramienta = !filtroHerramienta ||
        s.herramientas.includes(filtroHerramienta) ||
        s.herramientas.includes('Todas')
      const matchObjetivo = !filtroObjetivo || s.filtros.includes(filtroObjetivo)
      return matchSearch && matchCliente && matchHerramienta && matchObjetivo
    })
  }, [search, filtroCliente, filtroHerramienta, filtroObjetivo])

  const hasFilters = filtroCliente || filtroHerramienta || filtroObjetivo

  function clearFilters() {
    setFiltroCliente('')
    setFiltroHerramienta('')
    setFiltroObjetivo('')
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="🔍 Buscar situación, cliente o herramienta…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-bold transition-all ${
              showFilters || hasFilters
                ? 'bg-brand-green/20 text-brand-green border border-brand-green/30'
                : 'bg-brand-dark border border-white/10 text-gray-400'
            }`}
          >
            <span>⚙️</span>
            Filtros {hasFilters ? `(activos)` : ''}
          </button>
          <button
            onClick={() => setModoLectura(v => !v)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl font-bold transition-all ${
              modoLectura
                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                : 'bg-brand-dark border border-white/10 text-gray-400'
            }`}
          >
            <span>{modoLectura ? '📖' : '📄'}</span>
            {modoLectura ? 'Lectura rápida' : 'Vista completa'}
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-400 underline ml-auto"
            >
              Limpiar
            </button>
          )}
        </div>

        {showFilters && (
          <div className="bg-brand-dark border border-white/5 rounded-2xl p-4 space-y-3">
            <FilterGroup
              label="Tipo de cliente"
              options={filtrosCliente}
              value={filtroCliente}
              onChange={setFiltroCliente}
            />
            <FilterGroup
              label="Herramienta"
              options={filtrosHerramienta}
              value={filtroHerramienta}
              onChange={setFiltroHerramienta}
            />
            <FilterGroup
              label="Objetivo"
              options={filtrosObjetivo}
              value={filtroObjetivo}
              onChange={setFiltroObjetivo}
            />
          </div>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500">
        {filtered.length} de {situaciones.length} situaciones
        {hasFilters || search ? ' — con filtros aplicados' : ''}
      </p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-gray-400 text-sm">No se encontraron situaciones.</p>
          <button onClick={clearFilters} className="text-brand-green text-xs mt-2 underline">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className={modoLectura ? 'grid grid-cols-1 lg:grid-cols-2 gap-3' : 'space-y-3'}>
          {filtered.map(s => (
            <SituacionCard
              key={s.id}
              situacion={s}
              lectura={modoLectura}
              onUpdatePoints={onUpdatePoints}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Filter Group ─────────────────────────────────────────────────────────────
function FilterGroup({ label, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onChange('')}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
            !value ? 'bg-brand-green text-white' : 'bg-brand-medium text-gray-400'
          }`}
        >
          Todos
        </button>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(value === opt ? '' : opt)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
              value === opt ? 'bg-brand-green text-white' : 'bg-brand-medium text-gray-400'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Situacion Card ───────────────────────────────────────────────────────────
function SituacionCard({ situacion: s, lectura, onUpdatePoints }) {
  const [expanded, setExpanded] = useState(false)
  const [showError, setShowError] = useState(false)
  const [showReto, setShowReto] = useState(false)
  const [retoAnswer, setRetoAnswer] = useState(null)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    copyText(s.speechPrincipal)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleRetoAnswer(idx) {
    if (retoAnswer !== null) return
    setRetoAnswer(idx)
    if (idx === s.miniReto.correcta) {
      onUpdatePoints?.(15)
    }
  }

  if (lectura) {
    // Lectura rápida: situación + herramienta + speech
    return (
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <div className="flex items-start gap-2 mb-2">
          <span className="text-xl">{s.emoji}</span>
          <div className="flex-1">
            <p className="font-bold text-white text-sm">{s.titulo}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {s.herramientas.map(h => (
                <span key={h} className="text-[10px] bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded-full">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-400 mb-2 leading-relaxed">{s.situacion}</p>
        <div className="bg-brand-medium rounded-xl p-3 flex items-start gap-2">
          <p className="text-xs text-gray-200 italic flex-1 leading-relaxed">"{s.speechPrincipal}"</p>
          <button onClick={handleCopy} className="text-gray-500 hover:text-brand-green transition-colors shrink-0">
            {copied ? '✅' : '📋'}
          </button>
        </div>
      </div>
    )
  }

  // Vista completa
  return (
    <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-green/10 flex items-center justify-center text-xl shrink-0">
            {s.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">{s.titulo}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {s.filtros.map(f => (
                <span key={f} className="text-[10px] bg-brand-orange/10 text-brand-orange px-1.5 py-0.5 rounded-full">
                  {f}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {s.herramientas.map(h => (
                <span key={h} className="text-[10px] bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded-full">
                  {h}
                </span>
              ))}
            </div>
          </div>
          <span className={`text-gray-500 text-sm transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
          {/* Situación y objetivo */}
          <div className="grid grid-cols-1 gap-2">
            <InfoBlock label="📍 Situación" text={s.situacion} />
            <InfoBlock label="🎯 Objetivo" text={s.objetivo} />
          </div>

          {/* Speech principal */}
          <div className="bg-brand-medium rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-brand-green uppercase tracking-wider">Speech principal</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-green transition-colors"
              >
                {copied ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <p className="text-sm text-gray-200 italic leading-relaxed">"{s.speechPrincipal}"</p>
          </div>

          {/* Speech alternativo */}
          <div className="bg-brand-medium/50 rounded-xl p-3 border border-white/5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Speech alternativo</p>
            <p className="text-xs text-gray-400 italic leading-relaxed">"{s.speechAlternativo}"</p>
          </div>

          {/* Ejemplo */}
          <div className="bg-blue-900/10 border border-blue-500/15 rounded-xl p-3">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">💬 Ejemplo real</p>
            <p className="text-xs text-blue-200 leading-relaxed">{s.ejemplo}</p>
          </div>

          {/* Objeción y respuesta */}
          <div className="bg-yellow-900/10 border border-yellow-600/20 rounded-xl p-3">
            <p className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2">⚡ Objeción frecuente</p>
            <p className="text-xs text-yellow-200 italic mb-1">"{s.objecion}"</p>
            <p className="text-xs text-gray-300 leading-relaxed">→ {s.respuestaObjecion}</p>
          </div>

          {/* Error común toggle */}
          <button
            onClick={() => setShowError(v => !v)}
            className="w-full flex items-center justify-between bg-red-900/10 border border-red-500/15 rounded-xl p-3 text-left"
          >
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider">⛔ Ver error común</p>
            <span className={`text-xs text-red-400 transition-transform ${showError ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {showError && (
            <div className="bg-red-900/10 border border-red-500/15 rounded-xl px-3 pb-3 -mt-2">
              <p className="text-xs text-red-300 leading-relaxed">{s.errorComun}</p>
            </div>
          )}

          {/* Mensaje responsable */}
          <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-1">🔐 Venta responsable</p>
            <p className="text-xs text-orange-200 leading-relaxed">{s.mensajeResponsable}</p>
          </div>

          {/* Mini reto */}
          <div className="border border-brand-green/20 rounded-xl overflow-hidden">
            <button
              onClick={() => { setShowReto(v => !v); setRetoAnswer(null) }}
              className="w-full flex items-center justify-between p-3 bg-brand-green/5 text-left"
            >
              <p className="text-xs font-bold text-brand-green uppercase tracking-wider">🎯 Practicar — Mini reto (+15 pts)</p>
              <span className={`text-xs text-brand-green transition-transform ${showReto ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {showReto && (
              <div className="p-3 space-y-2">
                <p className="text-sm font-semibold text-white leading-snug">{s.miniReto.pregunta}</p>
                {s.miniReto.opciones.map((opt, idx) => {
                  let cls = 'border-white/10 text-gray-300 hover:border-brand-green/40'
                  if (retoAnswer !== null) {
                    if (idx === s.miniReto.correcta) cls = 'border-brand-green bg-brand-green/10 text-brand-green'
                    else if (idx === retoAnswer) cls = 'border-red-500 bg-red-500/10 text-red-400'
                    else cls = 'border-white/5 text-gray-600 opacity-40'
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => handleRetoAnswer(idx)}
                      className={`w-full text-left border rounded-xl p-2.5 text-xs leading-relaxed transition-all ${cls}`}
                    >
                      {opt}
                    </button>
                  )
                })}
                {retoAnswer !== null && (
                  <div className={`rounded-xl p-3 text-xs font-medium leading-relaxed ${
                    retoAnswer === s.miniReto.correcta
                      ? 'bg-brand-green/10 text-brand-green'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {retoAnswer === s.miniReto.correcta ? '🎉 ' : '💡 '}
                    {s.miniReto.feedback}
                    {retoAnswer === s.miniReto.correcta && <span className="ml-1 font-bold">+15 pts</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoBlock({ label, text }) {
  return (
    <div className="bg-brand-medium/40 rounded-xl p-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xs text-gray-300 leading-relaxed">{text}</p>
    </div>
  )
}

// ─── TAB: Objeciones ──────────────────────────────────────────────────────────
function TabObjeciones() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return objeciones.filter(o =>
      !q ||
      o.objecion.toLowerCase().includes(q) ||
      o.respuesta.toLowerCase().includes(q) ||
      o.contexto.toLowerCase().includes(q)
    )
  }, [search])

  return (
    <div className="space-y-4">
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-sm font-bold text-white mb-1">🛡️ Guía de objeciones</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Las respuestas más comunes ante clientes con dudas o frases difíciles en el punto de venta.
        </p>
      </div>

      <input
        type="text"
        placeholder="🔍 Buscar objeción…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-green/50"
      />

      <p className="text-xs text-gray-500">{filtered.length} objeciones</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(o => (
          <ObjecionCard key={o.id} objecion={o} />
        ))}
      </div>
    </div>
  )
}

function ObjecionCard({ objecion: o }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    copyText(o.respuesta)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-yellow-600/10 flex items-center justify-center text-xl shrink-0">
            {o.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-0.5">El cliente dice:</p>
            <p className="text-sm font-bold text-yellow-300 italic leading-snug">"{o.objecion}"</p>
          </div>
          <span className={`text-gray-500 text-sm transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3">
          {/* Respuesta */}
          <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs font-bold text-brand-green uppercase tracking-wider">Tu respuesta</p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-green transition-colors"
              >
                {copied ? '✅ Copiado' : '📋 Copiar'}
              </button>
            </div>
            <p className="text-sm text-gray-200 italic leading-relaxed">"{o.respuesta}"</p>
          </div>

          {/* Contexto */}
          <div className="bg-brand-medium/50 rounded-xl p-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">📌 Contexto</p>
            <p className="text-xs text-gray-300 leading-relaxed">{o.contexto}</p>
          </div>

          {/* Error a evitar */}
          <div className="bg-red-900/10 border border-red-500/15 rounded-xl p-3">
            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">⛔ Error a evitar</p>
            <p className="text-xs text-red-300 leading-relaxed">{o.errorEvitar}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── TAB: Entrenar (quiz mode) ─────────────────────────────────────────────────
function TabEntrenar({ onUpdatePoints }) {
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [total, setTotal] = useState(0)
  const [done, setDone] = useState(false)

  const s = situaciones[index]

  function handleAnswer(idx) {
    if (answer !== null) return
    setAnswer(idx)
    setTotal(t => t + 1)
    if (idx === s.miniReto.correcta) {
      setScore(sc => sc + 1)
      onUpdatePoints?.(15)
    }
  }

  function handleNext() {
    if (index + 1 >= situaciones.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
      setAnswer(null)
    }
  }

  function handleRestart() {
    setIndex(0)
    setAnswer(null)
    setScore(0)
    setTotal(0)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score / total) * 100)
    return (
      <div className="space-y-4">
        <div className="bg-brand-dark rounded-2xl p-6 border border-white/5 text-center">
          <p className="text-5xl mb-4">{pct >= 80 ? '🏆' : pct >= 60 ? '💪' : '📚'}</p>
          <h2 className="text-xl font-black text-white mb-1">
            {pct >= 80 ? '¡Excelente Guerrera!' : pct >= 60 ? '¡Muy bien!' : '¡Sigue practicando!'}
          </h2>
          <p className="text-gray-400 text-sm mb-4">
            Respondiste correctamente {score} de {total} preguntas
          </p>
          <div className="text-4xl font-black text-brand-orange mb-4">{pct}%</div>
          <div className="flex gap-2 mb-4">
            <div className="flex-1 bg-brand-green/10 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-brand-green">{score}</p>
              <p className="text-xs text-gray-500">Correctas</p>
            </div>
            <div className="flex-1 bg-red-500/10 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-red-400">{total - score}</p>
              <p className="text-xs text-gray-500">Incorrectas</p>
            </div>
            <div className="flex-1 bg-brand-orange/10 rounded-xl p-3 text-center">
              <p className="text-lg font-black text-brand-orange">{score * 15}</p>
              <p className="text-xs text-gray-500">Puntos</p>
            </div>
          </div>
          <button
            onClick={handleRestart}
            className="w-full bg-brand-green rounded-xl py-3 font-bold text-white text-sm"
          >
            🔄 Volver a entrenar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Score bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Situación {index + 1} / {situaciones.length}
          </span>
          <div className="h-1.5 w-32 bg-brand-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-green rounded-full transition-all"
              style={{ width: `${((index + 1) / situaciones.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-dark rounded-full px-3 py-1">
          <span className="text-brand-yellow text-xs">✅</span>
          <span className="text-xs font-bold text-white">{score}/{total}</span>
        </div>
      </div>

      {/* Situación context */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{s.emoji}</span>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Situación</p>
            <p className="text-sm font-bold text-white leading-tight">{s.titulo}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed mb-2 bg-brand-medium/40 rounded-xl p-2">
          {s.situacion}
        </p>
        <div className="flex flex-wrap gap-1">
          {s.herramientas.map(h => (
            <span key={h} className="text-[10px] bg-brand-green/10 text-brand-green px-1.5 py-0.5 rounded-full">
              {h}
            </span>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-brand-green/20 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-brand-green font-black text-sm">🎯</span>
          <p className="text-xs font-bold text-brand-green uppercase tracking-wider">Mini reto</p>
        </div>
        <p className="text-sm font-semibold text-white leading-snug">{s.miniReto.pregunta}</p>

        {s.miniReto.opciones.map((opt, idx) => {
          let cls = 'border-white/10 text-gray-300 hover:border-brand-green/40'
          if (answer !== null) {
            if (idx === s.miniReto.correcta) cls = 'border-brand-green bg-brand-green/10 text-brand-green'
            else if (idx === answer) cls = 'border-red-500 bg-red-500/10 text-red-400'
            else cls = 'border-white/5 text-gray-600 opacity-40'
          }
          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={`w-full text-left border rounded-xl p-3 text-sm leading-relaxed transition-all ${cls}`}
            >
              <span className="mr-2 font-bold text-xs opacity-50">{['A', 'B', 'C'][idx]}.</span>
              {opt}
            </button>
          )
        })}

        {answer !== null && (
          <div>
            <div className={`rounded-xl p-3 text-sm font-medium leading-relaxed mb-3 ${
              answer === s.miniReto.correcta
                ? 'bg-brand-green/10 text-brand-green'
                : 'bg-red-500/10 text-red-400'
            }`}>
              {answer === s.miniReto.correcta ? '🎉 ' : '💡 '}
              {s.miniReto.feedback}
              {answer === s.miniReto.correcta && <span className="ml-1 font-bold text-xs">+15 pts</span>}
            </div>
            <button
              onClick={handleNext}
              className="w-full bg-brand-green rounded-xl py-3 font-bold text-white text-sm"
            >
              {index + 1 < situaciones.length ? '→ Siguiente situación' : '🏁 Ver resultados'}
            </button>
          </div>
        )}
      </div>

      {/* Quick speech reminder */}
      <div className="bg-brand-medium/30 rounded-xl p-3 border border-white/5">
        <p className="text-xs text-gray-500 mb-1 font-bold uppercase tracking-wider">💬 Speech de referencia</p>
        <p className="text-xs text-gray-400 italic leading-relaxed">"{s.speechPrincipal}"</p>
      </div>
    </div>
  )
}

// ─── TAB: Plan del Día ────────────────────────────────────────────────────────
const PLAN = {
  antes: {
    emoji: '🌅', titulo: 'ANTES del Partido', color: 'blue',
    items: [
      { icon: '📱', accion: 'Revisa la tablet: partidos del día, cuotas destacadas y calendario' },
      { icon: '🔥', accion: 'Identifica los 2-3 partidos más calientes para conversar con clientes' },
      { icon: '🏅', accion: 'Verifica beneficios activos del Club Te Apuesto para el día' },
      { icon: '🧠', accion: 'Repasa el speech del día y las 3 objeciones más frecuentes' },
      { icon: '🔨', accion: 'Recuerda las herramientas del día: BetBuilder, La Yapa, Combinada, Cashout' },
      { icon: '🔐', accion: 'Reafirma tu compromiso: informo, oriento, no garantizo resultados' },
    ],
  },
  durante: {
    emoji: '⚡', titulo: 'DURANTE el Partido', color: 'orange',
    items: [
      { icon: '👋', accion: 'Saluda al cliente y usa el partido como gancho de conversación natural' },
      { icon: '📋', accion: 'Siempre explica la jugada antes de registrar. El cliente decide informado' },
      { icon: '🔨', accion: 'Clientes frecuentes: menciona BetBuilder, combinada corta o La Yapa' },
      { icon: '⏳', accion: 'En espera de ticket: ofrece Deportes Virtuales o menciona el Club' },
      { icon: '🛡️', accion: 'Si el cliente duda o pone objeción: responde con calma, sin presión' },
      { icon: '💰', accion: 'Si pregunta por Cashout o Pago Anticipado: verifica disponibilidad en sistema' },
    ],
  },
  despues: {
    emoji: '🌙', titulo: 'DESPUÉS del Partido', color: 'green',
    items: [
      { icon: '👋', accion: '"Lo esperamos para los próximos encuentros" — cierra bien siempre' },
      { icon: '🏅', accion: 'Invita al Club Te Apuesto a clientes frecuentes que no se han unido' },
      { icon: '🏆', accion: 'Si ganó: recuérdale que puede cobrar aquí, en efectivo, de inmediato' },
      { icon: '🔄', accion: 'Si no jugó: deja la puerta abierta. Un cliente bien tratado vuelve' },
      { icon: '📊', accion: '¿Qué objeción fue nueva hoy? ¿Qué speech funcionó mejor? Aprende del turno' },
      { icon: '⭐', accion: 'Completa el reto del día en la Academia antes de cerrar tu turno' },
    ],
  },
}

const CTA_TEMPLATES = [
  { id: 'ct1', momento: '⚡ Antes del partido', texto: '"Señor, ya viene el partido de [equipo]. ¿Le armamos el ticket? Le explico las opciones disponibles."', herramienta: 'Apertura' },
  { id: 'ct2', momento: '🔥 Partido caliente', texto: '"[Equipo] viene muy fuerte hoy. ¿Le revisamos una opción con ganador o doble oportunidad para cubrirse mejor?"', herramienta: 'Ganador / D.Oportunidad' },
  { id: 'ct3', momento: '⏳ Cliente en espera', texto: '"Mientras registramos su ticket, ¿le jugamos a los galgos o fútbol virtual? Sale en 1 minuto."', herramienta: 'Deportes Virtuales' },
  { id: 'ct4', momento: '🏁 Cierre del turno', texto: '"Gracias por visitarnos. Cuando quiera, lo esperamos para el próximo partido o para cobrar su premio."', herramienta: 'Fidelización' },
  { id: 'ct5', momento: '🏅 Club Te Apuesto', texto: '"¿Sabía que puede estar informado de partidos y beneficios en el Club TE APUESTO? No tiene costo."', herramienta: 'Club / CTA' },
]

function TabPlanDia() {
  const [copiedId, setCopiedId] = useState(null)
  const colorMap = {
    blue:   { bg: 'bg-blue-900/20',   border: 'border-blue-500/30',   title: 'text-blue-300' },
    orange: { bg: 'bg-orange-900/20', border: 'border-orange-500/30', title: 'text-orange-300' },
    green:  { bg: 'bg-green-900/20',  border: 'border-green-500/30',  title: 'text-green-300' },
  }

  async function handleCopy(id, text) {
    try { await navigator.clipboard.writeText(text.replace(/^"|"$/g, '')) } catch {}
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 border border-green-500/30 rounded-2xl p-4">
        <p className="text-sm font-black text-white mb-0.5">⏱️ Plan de Acción del Día</p>
        <p className="text-xs text-green-200 leading-relaxed">
          Lo que hace una Guerrera efectiva ANTES, DURANTE y DESPUÉS de cada partido.
        </p>
      </div>

      {/* ANTES / DURANTE / DESPUÉS */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-4">
      {Object.values(PLAN).map(fase => {
        const c = colorMap[fase.color]
        return (
          <div key={fase.titulo} className={`${c.bg} border ${c.border} rounded-2xl p-4`}>
            <p className={`text-sm font-black ${c.title} mb-3`}>{fase.emoji} {fase.titulo}</p>
            <div className="space-y-2">
              {fase.items.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <p className="text-xs text-gray-300 leading-relaxed">{item.accion}</p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      </div>

      {/* CTAs rápidos */}
      <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-sm font-bold text-white">💬 CTAs rápidos por momento</p>
          <p className="text-xs text-gray-500">Frases listas para usar. Toca para copiar.</p>
        </div>
        <div className="divide-y divide-white/5">
          {CTA_TEMPLATES.map(c => (
            <div key={c.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">{c.momento}</p>
                  <p className="text-xs text-gray-300 italic leading-relaxed">{c.texto}</p>
                  <span className="text-[10px] bg-brand-medium text-gray-400 px-1.5 py-0.5 rounded-full mt-1 inline-block">{c.herramienta}</span>
                </div>
                <button
                  onClick={() => handleCopy(c.id, c.texto)}
                  className="text-gray-500 hover:text-brand-green transition-colors shrink-0 mt-1"
                >
                  {copiedId === c.id ? '✅' : '📋'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Regla de oro */}
      <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">🔐 Regla de Oro</p>
        <div className="space-y-1.5">
          {['Informar antes de confirmar', 'Nunca garantizar resultados', 'El cliente siempre decide', 'Un cierre amable fideliza'].map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-brand-green text-xs">✅</span>
              <span className="text-xs text-gray-300">{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
