import { useState, useMemo } from 'react'
import glossaryData from '../data/glossaryData.json'
import ResponsibleBanner from '../components/ResponsibleBanner'

export default function Glossary() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [expanded, setExpanded] = useState(null)

  const filtered = useMemo(() => {
    return glossaryData.terms.filter(t => {
      const matchSearch = t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.explanation.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'Todos' || t.category === category
      return matchSearch && matchCat
    })
  }, [search, category])

  return (
    <div className="pb-24 animate-fade-in">
      {/* Search header */}
      <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm px-4 py-3 border-b border-white/5 space-y-3">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            placeholder="Buscar término..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-brand-medium text-white placeholder-gray-500 rounded-xl py-3 pl-10 pr-4 text-sm border border-white/10 focus:border-brand-orange/50 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              ✕
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {glossaryData.categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                category === cat ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 max-w-4xl mx-auto">
        <p className="text-xs text-gray-500">{filtered.length} términos encontrados</p>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="text-gray-400">No se encontraron términos</p>
            <button onClick={() => { setSearch(''); setCategory('Todos') }} className="mt-3 text-brand-orange text-sm">
              Limpiar filtros
            </button>
          </div>
        ) : (
          filtered.map(term => (
            <GlossaryCard
              key={term.id}
              term={term}
              expanded={expanded === term.id}
              onToggle={() => setExpanded(expanded === term.id ? null : term.id)}
            />
          ))
        )}

        <ResponsibleBanner compact />
      </div>
    </div>
  )
}

function GlossaryCard({ term, expanded, onToggle }) {
  const catColors = {
    'Básico': 'text-brand-orange bg-brand-orange/10',
    'Tipos de apuesta': 'text-blue-400 bg-blue-500/10',
    'Mercados especiales': 'text-purple-400 bg-purple-500/10',
    'Funciones especiales': 'text-brand-green bg-brand-green/10',
    'Mundial': 'text-brand-yellow bg-brand-yellow/10',
  }

  return (
    <div className={`bg-brand-dark rounded-2xl border transition-all duration-200 ${expanded ? 'border-brand-orange/30' : 'border-white/5'}`}>
      <button
        onClick={onToggle}
        className="w-full text-left p-4 flex items-center gap-3"
      >
        <span className="text-2xl flex-shrink-0">{term.emoji}</span>
        <div className="flex-1">
          <p className="font-bold text-white text-base">{term.term}</p>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${catColors[term.category] || 'text-gray-400 bg-brand-medium'}`}>
            {term.category}
          </span>
        </div>
        <span className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <div className="bg-brand-medium rounded-xl p-3">
            <p className="text-xs font-bold text-gray-400 mb-1">📖 Explicación fácil</p>
            <p className="text-sm text-gray-300 leading-relaxed">{term.explanation}</p>
          </div>
          <div className="bg-brand-medium rounded-xl p-3">
            <p className="text-xs font-bold text-brand-green mb-1">✅ Ejemplo simple</p>
            <p className="text-sm text-gray-300 leading-relaxed">{term.example}</p>
          </div>
          <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3">
            <p className="text-xs font-bold text-red-400 mb-1">⚠️ Qué NO decir</p>
            <p className="text-sm text-gray-300 leading-relaxed">{term.warning}</p>
          </div>
          <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brand-orange mb-1">💬 Frase responsable</p>
            <p className="text-sm text-gray-300 leading-relaxed italic">"{term.responsiblePhrase}"</p>
          </div>
        </div>
      )}
    </div>
  )
}
