import { useState } from 'react'
import speechData from '../data/speechData.json'
import ResponsibleBanner from '../components/ResponsibleBanner'

async function copyText(text) {
  try { await navigator.clipboard.writeText(text) } catch {}
}

// ─── Objeciones (chat bubble style) ──────────────────────────────────────────
const OBJECIONES = [
  {
    id: 'web',
    tag: '💻 Web vs Punto de Venta',
    cliente: 'En la web paga más...',
    promotora: '¡Aquí cobras al toque, en efectivo y sin trámites, jefe! 😉 Además te explico la jugada en persona.',
    tip: 'Destaca la comodidad del cobro inmediato en efectivo.',
    evitar: 'No critiques la web. Solo resalta lo que ofreces tú.',
  },
  {
    id: 'fija',
    tag: '🎯 "¿Cuál es la fija?"',
    cliente: '¿Cuál es la fija segura de hoy?',
    promotora: 'No puedo garantizar ningún resultado, señor. Lo que sí puedo hacer es mostrarte una opción interesante para que tú decidas con información clara. 📋',
    tip: 'Ofrece información, no certezas. El cliente decide siempre.',
    evitar: '"Esta está segura" o "esa no falla". Frases totalmente prohibidas.',
  },
  {
    id: 'pierde',
    tag: '😤 "Siempre pierdo"',
    cliente: 'Es que siempre pierdo con esto...',
    promotora: 'Entiendo, señor. Por eso le recomiendo revisar opciones con menos riesgo, como una apuesta simple o doble oportunidad, antes de combinar muchos partidos.',
    tip: 'Redirige hacia apuestas simples. Cuida al cliente frecuente.',
    evitar: '"Prueba suerte" o "esta vez seguro te va bien". Nunca.',
  },
  {
    id: 'dni',
    tag: '🪪 "No quiero dar mi DNI"',
    cliente: 'No quiero dar mi DNI.',
    promotora: 'Claro, señor. El DNI nos ayuda a validar la operación correctamente y ver si tiene beneficios disponibles en su cuenta. Es un proceso estándar y seguro.',
    tip: 'Explica el motivo con calma. No presiones.',
    evitar: 'Decirle que simplemente no puede jugar sin dar más explicación.',
  },
  {
    id: 'poco',
    tag: '💰 "Solo tengo poco"',
    cliente: 'Solo tengo S/ 5. ¿Vale la pena?',
    promotora: '¡Claro que sí! Podemos revisar una apuesta simple donde usted elija y entienda bien su jugada. Lo importante es que sea una decisión que disfrute.',
    tip: 'Nunca menosprecies montos pequeños. Todo cliente merece atención.',
    evitar: '"Con tan poco no ganas nada" o ignorar al cliente.',
  },
  {
    id: 'complicado',
    tag: '😕 "Eso suena complicado"',
    cliente: 'Eso suena muy complicado.',
    promotora: 'Para nada, señor. Lo armamos paso a paso juntos. Primero una opción fácil, y si le gusta, vemos algo más completo. 😊',
    tip: 'Tranquiliza al cliente. La simplicidad genera confianza.',
    evitar: 'Usar jerga técnica o explicar todo de un solo golpe.',
  },
  {
    id: 'mirando',
    tag: '👀 "Solo estoy mirando"',
    cliente: 'No, solo estoy mirando.',
    promotora: 'Perfecto, señor. Si quiere, le muestro los partidos de hoy y le explico las opciones sin ningún compromiso. Lo esperamos cuando guste. 👋',
    tip: 'Deja la puerta abierta. Un cliente que se va bien tratado vuelve.',
    evitar: 'Insistir o ignorarlo. Ambos extremos alejan al cliente.',
  },
]

// ─── Venta Cruzada en Espera ──────────────────────────────────────────────────
const VENTA_CRUZADA = [
  {
    id: 'virtuales',
    escenario: '⏳ Ticket largo en proceso',
    contexto: 'El cliente espera mientras se registra una combinada larga.',
    promotora: '"Señor, en lo que arranca su partido, ¿le jugamos a los galgos en pantalla? ¡Sale en 1 minuto! 🐕"',
    herramienta: 'Deportes Virtuales',
    icono: '🎮',
    color: 'from-purple-800/30 to-indigo-800/30',
    border: 'border-purple-500/30',
    badge: 'purple',
  },
  {
    id: 'mundial',
    escenario: '🌍 Cliente habla del Mundial',
    contexto: 'El cliente menciona un partido del Mundial 2026.',
    promotora: '"Ya que le gusta el fútbol, ¿le cuento que para el Mundial podemos ver opciones como el ganador del grupo o el mejor goleador? Nada se decide hoy, solo le explico."',
    herramienta: 'Mundial 2026',
    icono: '⚽',
    color: 'from-yellow-800/30 to-orange-800/30',
    border: 'border-yellow-500/30',
    badge: 'yellow',
  },
  {
    id: 'club',
    escenario: '🏅 Cliente frecuente sin Club',
    contexto: 'El cliente viene seguido pero no está en el Club Te Apuesto.',
    promotora: '"Señor, como viene seguido, ¿sabía que puede estar informado de promociones y novedades en el Club Te Apuesto? No tiene costo, solo beneficios de información."',
    herramienta: 'Club Te Apuesto',
    icono: '🏅',
    color: 'from-green-800/30 to-teal-800/30',
    border: 'border-green-500/30',
    badge: 'green',
  },
  {
    id: 'betbuilder',
    escenario: '🔨 Cliente apostó simple',
    contexto: 'El cliente acaba de hacer una apuesta sencilla.',
    promotora: '"¿Sabía que para su próximo partido podemos armar un BetBuilder? Es la misma jugada pero con más opciones dentro del mismo partido. Se lo explico sin compromiso."',
    herramienta: 'BetBuilder',
    icono: '🔨',
    color: 'from-orange-800/30 to-red-800/30',
    border: 'border-orange-500/30',
    badge: 'orange',
  },
  {
    id: 'cashout',
    escenario: '💸 Cliente nervioso post-apuesta',
    contexto: 'El cliente apostó y ahora pregunta si puede salir si va perdiendo.',
    promotora: '"Si su apuesta tiene Cashout disponible, sí puede cerrarlo antes del final. Se lo muestro cuando inicie el partido, depende del sistema en ese momento."',
    herramienta: 'Cashout',
    icono: '💸',
    color: 'from-blue-800/30 to-cyan-800/30',
    border: 'border-blue-500/30',
    badge: 'blue',
  },
]

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Speech() {
  const [mainTab, setMainTab] = useState('speeches')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [expandedSpeech, setExpandedSpeech] = useState(null)

  const MAIN_TABS = [
    { id: 'speeches', icon: '💬', label: 'Speeches' },
    { id: 'objeciones', icon: '🛡️', label: 'Objeciones' },
    { id: 'cruzada', icon: '🔀', label: 'Venta Cruzada' },
  ]

  // Speech detail view (existing behavior)
  if (mainTab === 'speeches' && selectedCategory) {
    const cat = speechData.categories.find(c => c.id === selectedCategory)
    return (
      <div className="pb-24 animate-fade-in overflow-x-hidden w-full">
        <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm px-4 py-3 border-b border-white/5">
          <button onClick={() => setSelectedCategory(null)} className="text-brand-orange text-sm font-semibold flex items-center gap-2">
            ← Volver
          </button>
        </div>
        <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto">
          <div className="rounded-2xl p-4" style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}40` }}>
            <span className="text-4xl block mb-2">{cat.icon}</span>
            <h2 className="text-xl font-black text-white">{cat.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{cat.description}</p>
          </div>

          {cat.speeches.map(speech => (
            <div key={speech.id} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
              <button
                onClick={() => setExpandedSpeech(expandedSpeech === speech.id ? null : speech.id)}
                className="w-full text-left p-4 flex items-start gap-3"
              >
                <span className="text-xl flex-shrink-0">🎙️</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{speech.situation}</p>
                </div>
                <span className={`text-gray-400 transition-transform flex-shrink-0 ${expandedSpeech === speech.id ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {expandedSpeech === speech.id && (
                <div className="px-4 pb-4 space-y-3 animate-fade-in">
                  <SpeechBubblePair promotora={speech.phrase} />
                  <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-3">
                    <p className="text-xs font-bold text-brand-green mb-1">✅ Recuerda</p>
                    <p className="text-sm text-gray-300">{speech.tip}</p>
                  </div>
                  <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3">
                    <p className="text-xs font-bold text-red-400 mb-1">⚠️ Evita</p>
                    <p className="text-sm text-gray-300">{speech.avoid}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          <ResponsibleBanner />
        </div>
      </div>
    )
  }

  return (
    <div className="pb-24 animate-fade-in overflow-x-hidden w-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 max-w-4xl mx-auto">
        <h2 className="text-xl font-black text-white">Speech Responsable</h2>
        <p className="text-sm text-gray-500">Frases, objeciones y venta cruzada en vivo</p>
      </div>

      {/* Main tab bar */}
      <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm border-b border-white/5 px-4 pb-2">
        <div className="flex gap-1.5 pt-2">
          {MAIN_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => { setMainTab(t.id); setSelectedCategory(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                mainTab === t.id
                  ? 'bg-brand-orange text-white'
                  : 'bg-brand-medium text-gray-400'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4 max-w-4xl mx-auto">

        {/* ── TAB: SPEECHES ── */}
        {mainTab === 'speeches' && (
          <>
            <div className="bg-brand-dark rounded-2xl p-4 border border-brand-yellow/20">
              <p className="text-xs font-bold text-brand-yellow mb-2">⭐ Regla de oro</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Nunca uses <span className="text-red-400 font-bold">"seguro"</span>,{' '}
                <span className="text-red-400 font-bold">"fija"</span> o{' '}
                <span className="text-red-400 font-bold">"garantizada"</span>.
                Siempre informa, orienta y deja que el cliente decida.
              </p>
            </div>

            <div className="grid gap-3">
              {speechData.categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="bg-brand-dark border border-white/5 rounded-2xl p-4 text-left hover:border-white/15 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{cat.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cat.description}</p>
                      <p className="text-xs text-gray-600 mt-1">{cat.speeches.length} frases disponibles</p>
                    </div>
                    <span className="text-gray-400 text-lg">›</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-brand-medium rounded-2xl p-4">
              <p className="text-xs font-bold text-white mb-3">🚫 Frases que siempre debes evitar</p>
              <div className="space-y-2">
                {['"Esa jugada es segura"', '"Este partido está fijo"', '"Te va a quedar bien"', '"Ese equipo siempre gana"', '"Es casi imposible que pierda"'].map((phrase, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-red-400">
                    <span>❌</span><span className="italic">{phrase}</span>
                  </div>
                ))}
              </div>
            </div>
            <ResponsibleBanner compact />
          </>
        )}

        {/* ── TAB: OBJECIONES (chat bubble UI) ── */}
        {mainTab === 'objeciones' && (
          <>
            <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
              <p className="text-sm font-bold text-white mb-1">🛡️ Mánager de Objeciones</p>
              <p className="text-xs text-gray-400">Simula la conversación real. Burbuja gris = cliente · Burbuja naranja = tú.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {OBJECIONES.map(obj => (
                <ObjecionChat key={obj.id} data={obj} />
              ))}
            </div>
            <ResponsibleBanner compact />
          </>
        )}

        {/* ── TAB: VENTA CRUZADA ── */}
        {mainTab === 'cruzada' && (
          <>
            <div className="bg-gradient-to-r from-brand-orange/10 to-yellow-700/10 border border-brand-orange/30 rounded-2xl p-4">
              <p className="text-sm font-bold text-white mb-1">🔀 Venta Cruzada en Espera</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Situaciones del día a día donde puedes ofrecer un producto adicional mientras el cliente espera o ya jugó.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {VENTA_CRUZADA.map(v => (
                <VentaCruzadaCard key={v.id} data={v} />
              ))}
            </div>
            <ResponsibleBanner compact />
          </>
        )}

      </div>
    </div>
  )
}

// ─── Chat bubble pair ─────────────────────────────────────────────────────────
function SpeechBubblePair({ promotora }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    copyText(promotora)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-brand-orange rounded-2xl rounded-tr-sm px-4 py-3 relative">
          <p className="text-sm text-white font-medium italic leading-relaxed">"{promotora}"</p>
          <button onClick={handleCopy} className="mt-2 text-xs text-orange-200 flex items-center gap-1">
            {copied ? '✅ Copiado' : '📋 Copiar frase'}
          </button>
        </div>
      </div>
      <p className="text-right text-[10px] text-gray-500 pr-1">Tú · Promotora TE APUESTO</p>
    </div>
  )
}

// ─── Objecion Chat Card ───────────────────────────────────────────────────────
function ObjecionChat({ data }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    copyText(data.promotora)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full text-left p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-white">{data.tag}</p>
          <span className={`text-gray-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
        {!open && (
          <p className="text-xs text-gray-500 mt-1 italic">"{data.cliente}"</p>
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {/* Cliente bubble (gray, left) */}
          <div className="flex justify-start">
            <div className="max-w-[85%]">
              <p className="text-[10px] text-gray-500 mb-1 pl-1">Cliente</p>
              <div className="bg-brand-medium rounded-2xl rounded-tl-sm px-4 py-3">
                <p className="text-sm text-gray-300 italic">"{data.cliente}"</p>
              </div>
            </div>
          </div>

          {/* Promotora bubble (orange, right) */}
          <div className="flex justify-end">
            <div className="max-w-[85%]">
              <p className="text-[10px] text-gray-500 mb-1 text-right pr-1">Tú · Promotora</p>
              <div className="bg-brand-orange rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-sm text-white font-medium italic leading-relaxed">"{data.promotora}"</p>
                <button onClick={handleCopy} className="mt-2 text-xs text-orange-200 flex items-center gap-1 ml-auto">
                  {copied ? '✅ Copiado' : '📋 Copiar'}
                </button>
              </div>
            </div>
          </div>

          {/* Tip + Evitar */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-2.5">
              <p className="text-[10px] font-bold text-brand-green uppercase mb-1">✅ Tip</p>
              <p className="text-xs text-gray-300 leading-relaxed">{data.tip}</p>
            </div>
            <div className="bg-red-900/10 border border-red-500/15 rounded-xl p-2.5">
              <p className="text-[10px] font-bold text-red-400 uppercase mb-1">⛔ Evitar</p>
              <p className="text-xs text-gray-300 leading-relaxed">{data.evitar}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Venta Cruzada Card ───────────────────────────────────────────────────────
function VentaCruzadaCard({ data }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    copyText(data.promotora.replace(/^"|"$/g, ''))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const badgeColors = {
    purple: 'bg-purple-500/20 text-purple-300',
    yellow: 'bg-yellow-500/20 text-yellow-300',
    green: 'bg-green-500/20 text-green-300',
    orange: 'bg-orange-500/20 text-orange-300',
    blue: 'bg-blue-500/20 text-blue-300',
  }

  return (
    <div className={`bg-gradient-to-br ${data.color} border ${data.border} rounded-2xl overflow-hidden`}>
      <button onClick={() => setOpen(v => !v)} className="w-full text-left p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{data.icono}</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">{data.escenario}</p>
            <p className="text-xs text-gray-400 mt-0.5">{data.contexto}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${badgeColors[data.badge]}`}>
              {data.herramienta}
            </span>
          </div>
          <span className={`text-gray-400 text-xs transition-transform shrink-0 mt-1 ${open ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4">
          {/* Promotora bubble */}
          <div className="flex justify-end mb-2">
            <div className="max-w-[90%]">
              <p className="text-[10px] text-gray-500 mb-1 text-right pr-1">Tú · Promotora</p>
              <div className="bg-brand-orange rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-sm text-white font-medium italic leading-relaxed">{data.promotora}</p>
                <button onClick={handleCopy} className="mt-2 text-xs text-orange-200 flex items-center gap-1 ml-auto">
                  {copied ? '✅ Copiado' : '📋 Copiar frase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
