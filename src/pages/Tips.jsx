import { useState } from 'react'
import tipsData from '../data/tipsData.json'
import ResponsibleBanner from '../components/ResponsibleBanner'

const COLOR_MAP = {
  blue: {
    tab:        'bg-blue-600 text-white',
    tabInact:   'bg-brand-dark text-blue-400 border border-blue-600/30 hover:border-blue-500',
    badge:      'bg-blue-600/20 text-blue-300 border border-blue-500/30',
    header:     'from-blue-900/60 to-blue-800/40 border-blue-600/30',
    dot:        'bg-blue-500',
    copy:       'text-blue-400 hover:text-blue-300',
    copyBg:     'hover:bg-blue-900/30',
    accent:     'text-blue-400',
    pillBg:     'bg-blue-500/10 text-blue-300',
  },
  orange: {
    tab:        'bg-brand-orange text-white',
    tabInact:   'bg-brand-dark text-brand-orange border border-brand-orange/30 hover:border-brand-orange',
    badge:      'bg-brand-orange/20 text-orange-300 border border-brand-orange/30',
    header:     'from-orange-900/60 to-orange-800/40 border-orange-600/30',
    dot:        'bg-brand-orange',
    copy:       'text-brand-orange hover:text-orange-300',
    copyBg:     'hover:bg-orange-900/30',
    accent:     'text-brand-orange',
    pillBg:     'bg-orange-500/10 text-orange-300',
  },
  green: {
    tab:        'bg-green-600 text-white',
    tabInact:   'bg-brand-dark text-green-400 border border-green-600/30 hover:border-green-500',
    badge:      'bg-green-600/20 text-green-300 border border-green-500/30',
    header:     'from-green-900/60 to-green-800/40 border-green-600/30',
    dot:        'bg-green-500',
    copy:       'text-green-400 hover:text-green-300',
    copyBg:     'hover:bg-green-900/30',
    accent:     'text-green-400',
    pillBg:     'bg-green-500/10 text-green-300',
  },
  purple: {
    tab:        'bg-purple-600 text-white',
    tabInact:   'bg-brand-dark text-purple-400 border border-purple-600/30 hover:border-purple-500',
    badge:      'bg-purple-600/20 text-purple-300 border border-purple-500/30',
    header:     'from-purple-900/60 to-purple-800/40 border-purple-600/30',
    dot:        'bg-purple-500',
    copy:       'text-purple-400 hover:text-purple-300',
    copyBg:     'hover:bg-purple-900/30',
    accent:     'text-purple-400',
    pillBg:     'bg-purple-500/10 text-purple-300',
  },
}

function CopyButton({ text, colorKey }) {
  const [copied, setCopied] = useState(false)
  const c = COLOR_MAP[colorKey]

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex-shrink-0 p-1.5 rounded-lg transition-all ${c.copyBg}`}
      title="Copiar frase"
    >
      {copied
        ? <span className="text-green-400 text-xs font-bold">✓</span>
        : <span className={`text-xs ${c.copy}`}>📋</span>
      }
    </button>
  )
}

function TipCard({ tip, colorKey, isOpen, onToggle }) {
  const c = COLOR_MAP[colorKey]
  const [copiedAll, setCopiedAll] = useState(false)

  function handleCopyAll() {
    const text = tip.ejemplos.join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 2000)
    })
  }

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      isOpen
        ? `bg-gradient-to-br ${c.header} border-opacity-60`
        : 'bg-brand-dark border-white/5 hover:border-white/10'
    }`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`} />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-sm">{tip.titulo}</p>
          {!isOpen && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{tip.objetivo}</p>
          )}
        </div>
        <div className={`flex-shrink-0 flex items-center gap-2`}>
          <span className={`text-xs px-2 py-0.5 rounded-full ${c.pillBg}`}>
            {tip.ejemplos.length} frases
          </span>
          <span className="text-gray-500 text-lg">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {/* Objetivo */}
          <div className={`rounded-xl p-3 ${c.badge}`}>
            <p className="text-xs font-bold mb-0.5 opacity-70 uppercase tracking-wide">Objetivo</p>
            <p className="text-xs leading-relaxed">{tip.objetivo}</p>
          </div>

          {/* Frases */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-bold uppercase tracking-wide ${c.accent}`}>
                Frases listas para usar
              </p>
              <button
                onClick={handleCopyAll}
                className={`text-xs px-2 py-1 rounded-lg border transition-all ${
                  copiedAll
                    ? 'border-green-500/50 text-green-400'
                    : `border-white/10 text-gray-400 hover:border-white/20`
                }`}
              >
                {copiedAll ? '✓ Copiadas' : 'Copiar todas'}
              </button>
            </div>

            {tip.ejemplos.map((frase, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 bg-black/30 rounded-xl p-3 group"
              >
                <span className={`text-xs font-black flex-shrink-0 mt-0.5 opacity-40`}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <p className="text-xs text-gray-200 leading-relaxed flex-1">{frase}</p>
                <CopyButton text={frase} colorKey={colorKey} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Tips() {
  const segs = tipsData.segmentaciones
  const [activeTab, setActiveTab] = useState(segs[0].id)
  const [openTips, setOpenTips] = useState({})

  const activeSeg = segs.find(s => s.id === activeTab)
  const c = COLOR_MAP[activeSeg.color]

  function toggleTip(tipId) {
    setOpenTips(prev => ({ ...prev, [tipId]: !prev[tipId] }))
  }

  function expandAll() {
    const next = {}
    activeSeg.tips.forEach(t => { next[t.id] = true })
    setOpenTips(prev => ({ ...prev, ...next }))
  }

  function collapseAll() {
    const next = {}
    activeSeg.tips.forEach(t => { next[t.id] = false })
    setOpenTips(prev => ({ ...prev, ...next }))
  }

  const anyOpen = activeSeg.tips.some(t => openTips[t.id])

  return (
    <div className="px-4 py-4 pb-24 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">Tips de Atención</h2>
        <p className="text-sm text-gray-500">Frases listas por momento de la atención</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {segs.map(seg => {
          const isActive = seg.id === activeTab
          const sc = COLOR_MAP[seg.color]
          return (
            <button
              key={seg.id}
              onClick={() => { setActiveTab(seg.id); setOpenTips({}) }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive ? sc.tab : sc.tabInact
              }`}
            >
              <span>{seg.emoji}</span>
              <span>{seg.label}</span>
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                isActive ? 'bg-white/20' : 'bg-white/5'
              }`}>
                {seg.tips.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Segment description + controls */}
      <div className={`rounded-2xl p-4 mb-4 bg-gradient-to-br ${c.header} border`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-sm font-bold ${c.accent} mb-1`}>
              {activeSeg.emoji} {activeSeg.label}
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">{activeSeg.descripcion}</p>
          </div>
          <button
            onClick={anyOpen ? collapseAll : expandAll}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-xl border transition-all ${
              anyOpen
                ? 'border-white/20 text-white/60 hover:text-white/80'
                : `${c.badge}`
            }`}
          >
            {anyOpen ? 'Cerrar todo' : 'Ver todo'}
          </button>
        </div>
      </div>

      {/* Tips grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {activeSeg.tips.map(tip => (
          <TipCard
            key={tip.id}
            tip={tip}
            colorKey={activeSeg.color}
            isOpen={!!openTips[tip.id]}
            onToggle={() => toggleTip(tip.id)}
          />
        ))}
      </div>

      {/* Stats footer */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { label: 'Tips en esta sección', value: activeSeg.tips.length },
          {
            label: 'Frases listas',
            value: activeSeg.tips.reduce((acc, t) => acc + t.ejemplos.length, 0),
          },
          {
            label: 'Total frases',
            value: segs.reduce((acc, s) => acc + s.tips.reduce((a, t) => a + t.ejemplos.length, 0), 0),
          },
        ].map(stat => (
          <div key={stat.label} className="bg-brand-dark rounded-2xl p-3 border border-white/5 text-center">
            <p className={`text-2xl font-black ${c.accent}`}>{stat.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div className="mt-3 bg-brand-dark rounded-2xl p-4 border border-brand-orange/20">
        <p className="text-xs font-bold text-brand-orange mb-1">⭐ Recuerda siempre</p>
        <p className="text-sm text-gray-300 leading-relaxed italic">
          "La mejor promotora no promete: orienta con claridad."
        </p>
      </div>

      <div className="mt-3">
        <ResponsibleBanner compact />
      </div>
    </div>
  )
}
