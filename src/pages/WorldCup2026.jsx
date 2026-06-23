import { useState, useMemo, useCallback, useEffect } from 'react'
import data from '../data/mundial2026Data.json'

/* ════════════════════════════════════════
   UTILS
════════════════════════════════════════ */
// Mapa de nombres TheSportsDB (inglés) → { es: nombre en español, flag: emoji }
const TEAM_MAP = {
  'Mexico':             { es: 'México',           flag: '🇲🇽' },
  'South Korea':        { es: 'Corea del Sur',    flag: '🇰🇷' },
  'Czech Republic':     { es: 'Rep. Checa',       flag: '🇨🇿' },
  'South Africa':       { es: 'Sudáfrica',        flag: '🇿🇦' },
  'Switzerland':        { es: 'Suiza',            flag: '🇨🇭' },
  'Canada':             { es: 'Canadá',           flag: '🇨🇦' },
  'Qatar':              { es: 'Catar',            flag: '🇶🇦' },
  'Bosnia-Herzegovina': { es: 'Bosnia-Herzegovina',flag: '🇧🇦' },
  'Scotland':           { es: 'Escocia',          flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  'Morocco':            { es: 'Marruecos',        flag: '🇲🇦' },
  'Brazil':             { es: 'Brasil',           flag: '🇧🇷' },
  'Haiti':              { es: 'Haití',            flag: '🇭🇹' },
  'USA':                { es: 'Estados Unidos',   flag: '🇺🇸' },
  'Australia':          { es: 'Australia',        flag: '🇦🇺' },
  'Turkey':             { es: 'Turquía',          flag: '🇹🇷' },
  'Paraguay':           { es: 'Paraguay',         flag: '🇵🇾' },
  'Germany':            { es: 'Alemania',         flag: '🇩🇪' },
  'Curaçao':            { es: 'Curazao',          flag: '🇨🇼' },
  'Ivory Coast':        { es: 'Costa de Marfil',  flag: '🇨🇮' },
  'Ecuador':            { es: 'Ecuador',          flag: '🇪🇨' },
  'Netherlands':        { es: 'Países Bajos',     flag: '🇳🇱' },
  'Japan':              { es: 'Japón',            flag: '🇯🇵' },
  'Sweden':             { es: 'Suecia',           flag: '🇸🇪' },
  'Tunisia':            { es: 'Túnez',            flag: '🇹🇳' },
  'Belgium':            { es: 'Bélgica',          flag: '🇧🇪' },
  'Egypt':              { es: 'Egipto',           flag: '🇪🇬' },
  'Iran':               { es: 'Irán',             flag: '🇮🇷' },
  'New Zealand':        { es: 'Nueva Zelanda',    flag: '🇳🇿' },
  'Spain':              { es: 'España',           flag: '🇪🇸' },
  'Cape Verde':         { es: 'Cabo Verde',       flag: '🇨🇻' },
  'Saudi Arabia':       { es: 'Arabia Saudita',   flag: '🇸🇦' },
  'Uruguay':            { es: 'Uruguay',          flag: '🇺🇾' },
  'France':             { es: 'Francia',          flag: '🇫🇷' },
  'Senegal':            { es: 'Senegal',          flag: '🇸🇳' },
  'Iraq':               { es: 'Irak',             flag: '🇮🇶' },
  'Norway':             { es: 'Noruega',          flag: '🇳🇴' },
  'Argentina':          { es: 'Argentina',        flag: '🇦🇷' },
  'Algeria':            { es: 'Argelia',          flag: '🇩🇿' },
  'Austria':            { es: 'Austria',          flag: '🇦🇹' },
  'Jordan':             { es: 'Jordania',         flag: '🇯🇴' },
  'Portugal':           { es: 'Portugal',         flag: '🇵🇹' },
  'DR Congo':           { es: 'Rep. Dem. Congo',  flag: '🇨🇩' },
  'Uzbekistan':         { es: 'Uzbekistán',       flag: '🇺🇿' },
  'Colombia':           { es: 'Colombia',         flag: '🇨🇴' },
  'England':            { es: 'Inglaterra',       flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  'Croatia':            { es: 'Croacia',          flag: '🇭🇷' },
  'Ghana':              { es: 'Ghana',            flag: '🇬🇭' },
  'Panama':             { es: 'Panamá',           flag: '🇵🇦' },
}

const FAVS_KEY = 'wc2026_favs'
function loadFavs() { try { return JSON.parse(localStorage.getItem(FAVS_KEY)) || [] } catch { return [] } }
function saveFavs(f) { try { localStorage.setItem(FAVS_KEY, JSON.stringify(f)) } catch {} }

const TABS = [
  { id: 'resumen',      icon: '🌍', label: 'Inicio' },
  { id: 'calientes',    icon: '🔥', label: 'Datos Calientes' },
  { id: 'jugadores',    icon: '⭐', label: 'Jugadores' },
  { id: 'explorar',     icon: '🔍', label: 'Explorar' },
  { id: 'grupos',       icon: '🗂️', label: 'Grupos' },
  { id: 'calendario',   icon: '📅', label: 'Calendario' },
  { id: 'anfitriones',  icon: '🏟️', label: 'Sedes' },
  { id: 'destacados',   icon: '🎯', label: 'Destacados' },
  { id: 'historias',    icon: '⚡', label: 'Historias' },
  { id: 'comentarios',  icon: '💬', label: 'Speeches' },
  { id: 'datos',        icon: '💡', label: 'Datos' },
  { id: 'trivia',       icon: '🧠', label: 'Trivia' },
  { id: 'faq',          icon: '❓', label: 'FAQ' },
]

/* ════════════════════════════════════════
   DATOS CALIENTES — matchup cards with CTA
════════════════════════════════════════ */
const MATCHUPS = [
  {
    id: 'm1',
    local: { nombre: 'Brasil', bandera: '🇧🇷', color: '#22c55e' },
    visita: { nombre: 'Marruecos', bandera: '🇲🇦', color: '#ef4444' },
    fecha: 'Fase de grupos · Grupo C', hora: 'Por confirmar',
    datoCaliente: 'Marruecos fue la gran revelación de Qatar 2022, llegando a semifinales. Brasil llega como pentacampeón buscando recuperar el trono.',
    indicador: '🔥 Duelo de alto voltaje',
    tendencia: 'local',
    cta: 'Señor, Brasil es el pentacampeón pero Marruecos ya demostró que puede con cualquiera. ¿Le armamos algo con ganador o ambos anotan?',
    mercados: ['Ganador', 'Ambos Anotan', 'Más de 1.5 goles'],
  },
  {
    id: 'm2',
    local: { nombre: 'España', bandera: '🇪🇸', color: '#facc15' },
    visita: { nombre: 'Uruguay', bandera: '🇺🇾', color: '#60a5fa' },
    fecha: 'Fase de grupos · Grupo H', hora: 'Por confirmar',
    datoCaliente: 'España llega como bicampeona de Europa. Uruguay, con 2 títulos mundiales, es reconocida por su garra charrúa en los momentos decisivos.',
    indicador: '⚡ Técnica vs garra',
    tendencia: 'local',
    cta: '"Señor, España llega como favorita pero Uruguay nunca se rinde. ¿Le revisamos ganador o doble oportunidad para cubrirse mejor?"',
    mercados: ['Ganador', 'Doble Oportunidad', 'Ambos Anotan'],
  },
  {
    id: 'm3',
    local: { nombre: 'Argentina', bandera: '🇦🇷', color: '#60a5fa' },
    visita: { nombre: 'Austria', bandera: '🇦🇹', color: '#ef4444' },
    fecha: 'Fase de grupos · Grupo J', hora: 'Por confirmar',
    datoCaliente: 'Argentina defiende el título mundial en un Grupo J accesible. Austria llega en su mejor momento histórico como selección europea.',
    indicador: '🏆 Campeón en acción',
    tendencia: 'local',
    cta: '"Este es el partido del campeón del mundo buscando el bicampeonato. ¿Le armamos algo con Argentina ganador o más de 1.5 goles?"',
    mercados: ['Ganador', 'Más de 1.5 goles', 'Resultado exacto'],
  },
  {
    id: 'm4',
    local: { nombre: 'Portugal', bandera: '🇵🇹', color: '#ef4444' },
    visita: { nombre: 'Colombia', bandera: '🇨🇴', color: '#facc15' },
    fecha: 'Fase de grupos · Grupo K', hora: 'Por confirmar',
    datoCaliente: 'Portugal con Cristiano Ronaldo sigue buscando su primera Copa del Mundo. Colombia llega con una generación brillante en su mejor momento histórico.',
    indicador: '⭐ Duelo de estrellas',
    tendencia: 'local',
    cta: '"Señor, Cristiano vs la nueva Colombia. Dos equipos que atacan bien. ¿Le revisamos ambos anotan o más de 2 goles?"',
    mercados: ['Ambos Anotan', 'Más de 2.5 goles', 'BetBuilder'],
  },
  {
    id: 'm5',
    local: { nombre: 'Inglaterra', bandera: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#f9fafb' },
    visita: { nombre: 'Croacia', bandera: '🇭🇷', color: '#f97316' },
    fecha: 'Fase de grupos · Grupo L', hora: 'Por confirmar',
    datoCaliente: 'Revancha directa de la semifinal de Rusia 2018: Croacia eliminó a Inglaterra en tiempo extra. El duelo europeo más esperado de la fase de grupos.',
    indicador: '🔥🔥 Revancha histórica',
    tendencia: 'local',
    cta: '"Señor, Inglaterra vs Croacia es la revancha del Mundial 2018. Partido muy parejo y con historia. ¿Le armamos doble oportunidad o ambos anotan?"',
    mercados: ['Doble Oportunidad', 'Ambos Anotan', 'BetBuilder'],
  },
]

/* ════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════ */
export default function WorldCup2026({ onUpdatePoints }) {
  const [tab, setTab] = useState('resumen')
  const [favs, setFavs] = useState(loadFavs)

  function toggleFav(id) {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      saveFavs(next)
      return next
    })
  }

  return (
    <div className="pb-24 animate-fade-in overflow-x-hidden w-full">
      {/* Hero con carrusel */}
      <HeroCarrusel onTabChange={setTab} />

      {/* Tabs */}
      <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex overflow-x-auto no-scrollbar px-3 py-2 gap-1.5 max-w-4xl mx-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === t.id ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400 hover:text-white'
              }`}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 max-w-4xl mx-auto space-y-4">
        {tab === 'resumen'     && <TabResumen onTabChange={setTab} />}
        {tab === 'calientes'   && <TabDatosCalientes />}
        {tab === 'jugadores'   && <TabJugadores />}
        {tab === 'explorar'    && <TabExplorar onTabChange={setTab} />}
        {tab === 'anfitriones' && <><TabAnfitriones /><TabEstadios /></>}
        {tab === 'grupos'      && <TabGrupos />}
        {tab === 'calendario'  && <TabCalendario favs={favs} onFav={toggleFav} />}
        {tab === 'destacados'  && <TabDestacados favs={favs} onFav={toggleFav} />}
        {tab === 'historias'   && <TabHistorias />}
        {tab === 'comentarios' && <TabComentarios />}
        {tab === 'datos'       && <TabDatos />}
        {tab === 'faq'         && <TabFaq />}
        {tab === 'trivia'      && <TabTrivia onPoints={onUpdatePoints} />}
        <NotaOficial />
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: DATOS CALIENTES
════════════════════════════════════════ */
function TabDatosCalientes() {
  const [selected, setSelected] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  async function handleCopy(id, text) {
    try { await navigator.clipboard.writeText(text) } catch {}
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-2xl p-4">
        <p className="text-sm font-black text-white mb-0.5">🔥 Datos Calientes del Mundial</p>
        <p className="text-xs text-orange-200 leading-relaxed">
          El dato del partido + el speech para ofrecérselo al cliente. Actualiza tu conversación cada partido.
        </p>
      </div>

      {/* Matchup cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {MATCHUPS.map(m => {
          const isOpen = selected === m.id
          return (
            <div key={m.id} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
              {/* Matchup header */}
              <button
                onClick={() => setSelected(isOpen ? null : m.id)}
                className="w-full p-4 text-left"
              >
                {/* Teams face-off */}
                <div className="flex items-center gap-2 mb-3">
                  {/* Local */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-3xl">{m.local.bandera}</span>
                    <p className="text-xs font-black text-white text-center leading-tight">{m.local.nombre}</p>
                  </div>
                  {/* VS */}
                  <div className="text-center px-2">
                    <p className="text-xs font-black text-gray-500">VS</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">{m.fecha}</p>
                  </div>
                  {/* Visita */}
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-3xl">{m.visita.bandera}</span>
                    <p className="text-xs font-black text-white text-center leading-tight">{m.visita.nombre}</p>
                  </div>
                </div>

                {/* Dato caliente */}
                <div className="flex items-start gap-2 bg-brand-medium/40 rounded-xl p-2.5">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-0.5">{m.indicador}</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{m.datoCaliente}</p>
                  </div>
                  <span className={`text-gray-400 text-xs transition-transform shrink-0 mt-1 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </button>

              {/* Expanded: CTA speech + mercados */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  {/* Mercados disponibles */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Mercados recomendados</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.mercados.map(mer => (
                        <span key={mer} className="text-xs bg-blue-900/30 border border-blue-500/20 text-blue-200 px-2.5 py-1 rounded-full font-medium">
                          {mer}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Speech */}
                  <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">
                        💡 Ofrécelo así:
                      </p>
                      <button
                        onClick={() => handleCopy(m.id, m.cta.replace(/^"|"$/g, ''))}
                        className="text-xs text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-1"
                      >
                        {copiedId === m.id ? '✅ Copiado' : '📋 Copiar'}
                      </button>
                    </div>
                    <p className="text-sm text-white font-bold italic leading-relaxed">{m.cta}</p>
                  </div>

                  {/* Responsible reminder */}
                  <div className="bg-brand-medium/30 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      🔐 Recuerda: ningún resultado puede garantizarse. Este dato es conversación, no predicción.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tip de uso */}
      <div className="bg-brand-dark border border-brand-yellow/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-yellow mb-2">⭐ Cómo usarlo</p>
        <div className="space-y-1.5">
          {[
            '1. Revisa los partidos del día antes de tu turno',
            '2. Aprende el dato caliente de los 2-3 más importantes',
            '3. Usa el speech sugerido cuando el cliente muestre interés',
            '4. Nunca garantices resultados — orienta con información',
          ].map((tip, i) => (
            <p key={i} className="text-xs text-gray-400 leading-relaxed">{tip}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   HERO CARRUSEL
════════════════════════════════════════ */
const SLIDES = [
  { bg: 'from-[#0a2e6e] via-[#1a4a8a] to-brand-orange', emoji: '🌍', titulo: 'Un Mundial histórico', sub: '48 selecciones · 3 países · 104 partidos · 1 torneo para recordar', cta: 'resumen', ctaTxt: 'Ver resumen' },
  { bg: 'from-blue-900 via-indigo-900 to-brand-orange/80', emoji: '🗂️', titulo: '12 Grupos · 48 Selecciones', sub: 'Argentina, Francia, Brasil, España — los favoritos ya tienen grupo. ¿Quién pasa?', cta: 'grupos', ctaTxt: 'Ver grupos' },
  { bg: 'from-purple-900 via-pink-900 to-indigo-900', emoji: '⭐', titulo: 'Los cracks del torneo', sub: 'Mbappé, Vinicius, Bellingham, Haaland y más — los que pondrán a arder el estadio', cta: 'jugadores', ctaTxt: 'Ver jugadores' },
  { bg: 'from-yellow-800 via-orange-900 to-red-900', emoji: '🔥', titulo: 'Datos Calientes', sub: 'Brasil vs Alemania · Francia vs Portugal · Argentina vs Croacia — los partidos que todos esperan', cta: 'calientes', ctaTxt: 'Ver partidos' },
]

function HeroCarrusel({ onTabChange }) {
  const [slide, setSlide] = useState(0)
  const s = SLIDES[slide]

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${s.bg} px-5 py-7 lg:px-16 lg:py-10 transition-all duration-500`}>
      <div className="absolute inset-0 opacity-10 flex items-center justify-center text-[160px] select-none pointer-events-none">{s.emoji}</div>
      <div className="relative max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🇨🇦</span><span className="text-2xl">🇲🇽</span><span className="text-2xl">🇺🇸</span>
        </div>
        <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Copa del Mundo FIFA 2026</p>
        <h1 className="text-2xl font-black text-white leading-tight mt-1">{s.titulo}</h1>
        <p className="text-sm text-white/70 mt-1 leading-relaxed">{s.sub}</p>
        <div className="flex items-center gap-3 mt-4">
          <button onClick={() => onTabChange(s.cta)}
            className="px-4 py-2 bg-white/20 backdrop-blur rounded-xl text-sm font-bold text-white hover:bg-white/30 transition-all">
            {s.ctaTxt} →
          </button>
          <div className="flex gap-1.5 ml-auto">
            {SLIDES.map((_, i) => (
              <button key={i} onClick={() => setSlide(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-white w-5' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-4 flex-wrap">
          {[['48','Selecc.'],['12','Grupos'],['104','Partidos'],['16','Sedes']].map(([n,l]) => (
            <div key={l} className="bg-white/15 rounded-xl px-3 py-1.5 text-center">
              <p className="text-xl font-black text-white leading-none">{n}</p>
              <p className="text-xs text-white/60">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   SABIAS QUE (componente reutilizable)
════════════════════════════════════════ */
function SabiasQue({ max = 3 }) {
  const [idx, setIdx] = useState(0)
  const items = data.sabiasQue.slice(idx, idx + max)
  const total = data.sabiasQue.length

  return (
    <div className="bg-gradient-to-r from-blue-900/40 to-brand-orange/20 rounded-2xl p-4 border border-blue-500/20">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">🔍 ¿Sabías que...?</p>
        <button onClick={() => setIdx(i => (i + max) % total)} className="text-xs text-blue-400 font-bold hover:text-blue-300">Siguiente →</button>
      </div>
      <div className="space-y-2">
        {items.map(sq => (
          <div key={sq.id} className="flex gap-3 items-start">
            <span className="text-xl flex-shrink-0">{sq.emoji}</span>
            <p className="text-sm text-gray-300 leading-relaxed">{sq.texto}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: RESUMEN
════════════════════════════════════════ */
function TabResumen({ onTabChange }) {
  return (
    <div className="space-y-4 animate-fade-in">

      {/* Accesos rápidos — lo más importante para las promotoras */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">⚡ Acceso rápido</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { tab:'grupos',     emoji:'🗂️',  titulo:'Grupos del Mundial',    sub:'12 grupos · 48 selecciones confirmadas', bg:'from-blue-900/60 to-indigo-900/40', border:'border-blue-500/40' },
            { tab:'jugadores',  emoji:'⭐',   titulo:'Los Cracks',            sub:'Estrellas · Los más temidos · Favoritos', bg:'from-purple-900/60 to-pink-900/40', border:'border-purple-500/40' },
            { tab:'calientes',  emoji:'🔥',   titulo:'Datos Calientes',       sub:'Partidos clave + speech para el cliente', bg:'from-orange-900/60 to-red-900/40',  border:'border-orange-500/40' },
            { tab:'trivia',     emoji:'🧠',   titulo:'Trivia — Gana Puntos',  sub:'Aprende jugando · +10 pts por pregunta',  bg:'from-blue-900/60 to-indigo-900/40', border:'border-blue-500/40' },
          ].map(item => (
            <button key={item.tab} onClick={() => onTabChange(item.tab)}
              className={`rounded-2xl p-3 text-left bg-gradient-to-br ${item.bg} border ${item.border} hover:scale-[1.02] active:scale-95 transition-all`}>
              <span className="text-3xl block mb-1">{item.emoji}</span>
              <p className="text-xs font-black text-white leading-tight">{item.titulo}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-brand-dark rounded-2xl p-4 border border-blue-500/20">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">💬 Guerrera, ten en cuenta</p>
        <p className="text-sm text-gray-300 leading-relaxed">{data.resumen.descripcion}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon:'📅', label:'Inicio',       value: data.resumen.fechaInicio,    color:'border-brand-orange/30' },
          { icon:'🏆', label:'Final',         value: data.resumen.fechaFinal,     color:'border-brand-yellow/30' },
          { icon:'🏟️', label:'Sede de la Final', value:'MetLife · Nueva York',   color:'border-blue-500/30' },
          { icon:'🌍', label:'Edición',       value: data.resumen.edicion,        color:'border-brand-green/30' },
        ].map(c => (
          <div key={c.label} className={`bg-brand-dark rounded-2xl p-4 border ${c.color}`}>
            <p className="text-2xl mb-1">{c.icon}</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">{c.label}</p>
            <p className="text-sm font-bold text-white mt-0.5 leading-tight">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Países anfitriones */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">🗺️ Países anfitriones</p>
        <div className="grid grid-cols-3 gap-3">
          {data.anfitriones.map(a => (
            <div key={a.id} className="bg-brand-medium rounded-xl p-3 text-center">
              <p className="text-3xl mb-1">{a.flag}</p>
              <p className="text-xs font-bold text-white">{a.pais}</p>
              <p className="text-xs text-gray-500 mt-0.5">{a.ciudades.length} ciudades</p>
              <p className="text-xs text-brand-orange mt-1 font-bold">{a.partidosEnCasa} partidos</p>
            </div>
          ))}
        </div>
      </div>

      <SabiasQue max={2} />

      {/* Datos extraordinarios highlight */}
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">🌟 Datos extraordinarios</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {data.datosExtraordinarios.slice(0, 3).map(d => (
          <div key={d.id} className="bg-brand-dark rounded-xl p-4 border border-white/5 flex gap-3 items-start">
            <span className="text-2xl flex-shrink-0">{d.icono}</span>
            <div>
              <p className="text-sm font-bold text-white">{d.titulo}</p>
              <p className="text-xs text-brand-orange mt-0.5 font-semibold">{d.dato}</p>
            </div>
          </div>
        ))}
        </div>
        <button onClick={() => onTabChange('explorar')} className="w-full py-2.5 bg-brand-medium rounded-xl text-sm font-bold text-brand-orange mt-3">
          🔍 Ver todo en Explorar →
        </button>
      </div>

      <div className="bg-gradient-to-r from-brand-orange/20 to-brand-yellow/10 rounded-2xl p-4 border border-brand-orange/30">
        <p className="text-xs font-bold text-brand-orange mb-1">⭐ Para tu atención</p>
        <p className="text-sm text-gray-300 leading-relaxed">
          Menciona siempre que el Mundial 2026 es <span className="text-white font-bold">el más grande de la historia</span> con 48 selecciones. Es un dato que llama la atención del cliente y genera conversación.
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: EXPLORAR
════════════════════════════════════════ */
const EXPLORAR_ITEMS = [
  { tab:'jugadores',  emoji:'⭐',  titulo:'Los Cracks',           desc:'Estrellas · Favoritos · Temidos',  color:'bg-purple-900/60 border-purple-700/40' },
  { tab:'grupos',     emoji:'🗂️', titulo:'Grupos',               desc:'12 grupos · 48 selecciones',       color:'bg-blue-900/60 border-blue-700/40' },
  { tab:'calendario', emoji:'📅', titulo:'Calendario',            desc:'Partidos clave del torneo',        color:'bg-brand-orange/20 border-brand-orange/40' },
  { tab:'anfitriones',emoji:'🏟️', titulo:'Sedes y Estadios',     desc:'3 países · 16 estadios',           color:'bg-green-900/60 border-green-700/40' },
  { tab:'destacados', emoji:'🔥', titulo:'Partidos clave',        desc:'Los que todos verán',              color:'bg-red-900/60 border-red-700/40' },
  { tab:'historias',  emoji:'⚡', titulo:'Historias',             desc:'Momentos memorables',              color:'bg-purple-900/60 border-purple-700/40' },
  { tab:'comentarios',emoji:'💬', titulo:'Speeches',              desc:'Frases para el cliente',           color:'bg-brand-green/10 border-brand-green/40' },
  { tab:'datos',      emoji:'💡', titulo:'Datos rápidos',         desc:'10 claves esenciales',             color:'bg-yellow-900/60 border-yellow-700/40' },
  { tab:'trivia',     emoji:'🧠', titulo:'Trivia mundialista',    desc:'Gana puntos jugando',              color:'bg-pink-900/60 border-pink-700/40' },
  { tab:'faq',        emoji:'❓', titulo:'Preguntas frecuentes',  desc:'Lo que el cliente pregunta',       color:'bg-gray-800/60 border-gray-600/40' },
]

function TabExplorar({ onTabChange }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <p className="text-lg font-black text-white">Explorar el Mundial 2026</p>
        <p className="text-sm text-gray-500 mt-0.5">Selecciona un tema para explorar</p>
      </div>

      {/* Datos extraordinarios */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-brand-orange uppercase tracking-wider">🌟 Datos extraordinarios</p>
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
            {data.datosExtraordinarios.map(d => (
              <div key={d.id} className="w-56 bg-brand-dark rounded-2xl p-4 border border-white/5 flex-shrink-0">
                <p className="text-3xl mb-2">{d.icono}</p>
                <p className="text-sm font-black text-white leading-tight">{d.titulo}</p>
                <p className="text-xs text-brand-orange mt-1 font-semibold leading-tight">{d.dato}</p>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{d.contexto}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de secciones */}
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-2">📂 Todas las secciones</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {EXPLORAR_ITEMS.map(item => (
            <button key={item.tab} onClick={() => onTabChange(item.tab)}
              className={`rounded-2xl p-4 text-left border transition-all hover:scale-[1.02] active:scale-95 ${item.color}`}>
              <span className="text-3xl block mb-2">{item.emoji}</span>
              <p className="text-sm font-bold text-white leading-tight">{item.titulo}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <SabiasQue max={3} />
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: ANFITRIONES
════════════════════════════════════════ */
function TabAnfitriones() {
  const [open, setOpen] = useState(null)
  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-xs text-gray-500 uppercase tracking-wider">3 países · 16 ciudades sede</p>
      {data.anfitriones.map(a => (
        <div key={a.id} className="bg-brand-dark rounded-2xl overflow-hidden border border-white/5">
          <button onClick={() => setOpen(open === a.id ? null : a.id)}
            className="w-full text-left p-4 flex items-center gap-4">
            <span className="text-5xl">{a.flag}</span>
            <div className="flex-1">
              <p className="font-black text-white text-lg">{a.pais}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.ciudades.length} ciudades · {a.partidosEnCasa} partidos</p>
            </div>
            <span className={`text-gray-400 transition-transform ${open === a.id ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {open === a.id && (
            <div className="px-4 pb-4 space-y-3 animate-fade-in">
              <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3">
                <p className="text-xs font-bold text-brand-orange mb-1">💡 Dato para el cliente</p>
                <p className="text-sm text-gray-300">{a.dato}</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider lg:col-span-2">🏙️ Ciudades sede</p>
                {a.ciudades.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-brand-medium rounded-xl px-3 py-2">
                    <span className="text-brand-orange">📍</span>
                    <span className="text-sm text-white font-medium">{c}</span>
                    <span className="ml-auto text-xs text-gray-500">{a.estadios[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: GRUPOS
════════════════════════════════════════ */
function TabGrupos() {
  const [search, setSearch] = useState('')
  const [openGroup, setOpenGroup] = useState(null)
  const [filter, setFilter] = useState('todos')
  const [standings, setStandings] = useState({})
  const [standingsLoading, setStandingsLoading] = useState(true)

  useEffect(() => {
    fetch('https://www.thesportsdb.com/api/v1/json/3929240369/lookuptable.php?l=4429&s=2026')
      .then(r => r.json())
      .then(json => {
        if (!json.table) { setStandingsLoading(false); return }
        const byGroup = {}
        json.table.forEach(t => {
          const m = (t.strGroup || '').match(/Group\s+([A-L])/i)
          const grp = m ? m[1].toUpperCase() : null
          if (!grp) return
          if (!byGroup[grp]) byGroup[grp] = []
          byGroup[grp].push({
            nombre: t.strTeam,
            pj:  parseInt(t.intPlayed)          || 0,
            g:   parseInt(t.intWin)             || 0,
            e:   parseInt(t.intDraw)            || 0,
            p:   parseInt(t.intLoss)            || 0,
            gf:  parseInt(t.intGoalsFor)        || 0,
            gc:  parseInt(t.intGoalsAgainst)    || 0,
            dif: parseInt(t.intGoalDifference)  || 0,
            pts: parseInt(t.intPoints)          || 0,
          })
        })
        setStandings(byGroup)
        setStandingsLoading(false)
      })
      .catch(() => setStandingsLoading(false))
  }, [])

  const confFilters = {
    todos: 'Todos',
    CONMEBOL: '🌎 Sudamérica',
    UEFA: '🌍 Europa',
    CAF: '🌍 África',
    AFC: '🌏 Asia',
    CONCACAF: '🌎 CONCACAF',
  }

  const filtered = useMemo(() => {
    return data.grupos.filter(g => {
      const matchSearch = search === '' ||
        g.equipos.some(e => e.nombre.toLowerCase().includes(search.toLowerCase())) ||
        g.nombre.toLowerCase().includes(search.toLowerCase())
      const matchFilter = filter === 'todos' || g.equipos.some(e => e.conf === filter)
      return matchSearch && matchFilter
    })
  }, [search, filter])

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input type="text" placeholder="Buscar país (ej: Argentina, Perú...)" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-brand-medium text-white placeholder-gray-500 rounded-xl py-3 pl-10 pr-10 text-sm border border-white/10 focus:border-brand-orange/50 focus:outline-none" />
        {search && <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">×</button>}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {Object.entries(confFilters).map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === key ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">{filtered.length} grupos</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(g => (
          <div key={g.id} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
            <button onClick={() => setOpenGroup(openGroup === g.id ? null : g.id)}
              className="w-full text-left p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center font-black text-brand-orange text-lg flex-shrink-0">
                {g.id}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">{g.nombre}</p>
                <div className="flex gap-1 mt-1 flex-wrap">
                  {g.equipos.map(e => <span key={e.nombre} className="text-sm">{e.flag}</span>)}
                </div>
              </div>
              <span className={`text-gray-400 transition-transform flex-shrink-0 ${openGroup === g.id ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {openGroup === g.id && (
              <div className="px-4 pb-4 space-y-3 animate-fade-in">
                <TablaPuntaje
                  equipos={g.equipos}
                  apiRows={standings[g.id] || []}
                  loading={standingsLoading}
                />
                <div className="space-y-2">
                  {g.equipos.map(e => (
                    <div key={e.nombre} className="flex items-center gap-3 bg-brand-medium rounded-xl px-3 py-2.5">
                      <span className="text-2xl">{e.flag}</span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-white">{e.nombre}</p>
                        <p className="text-xs text-gray-500">{e.conf}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3">
                  <p className="text-xs font-bold text-brand-orange mb-1">💡 Dato del grupo</p>
                  <p className="text-sm text-gray-300">{g.dato}</p>
                </div>
                <GrupoPartidos grupo={g.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function TablaPuntaje({ equipos, apiRows, loading }) {
  const sorted = [...(apiRows.length > 0 ? apiRows : equipos.map(e => ({
    nombre: e.nombre, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0, pts: 0
  })))].sort((a, b) => b.pts - a.pts || b.dif - a.dif || b.gf - a.gf)

  const info = nombre => TEAM_MAP[nombre] || { es: nombre, flag: '🏳️' }

  return (
    <div className="bg-brand-black rounded-xl overflow-hidden border border-white/5">
      <div className="flex items-center justify-between px-3 py-2 bg-brand-orange/10 border-b border-white/5">
        <p className="text-xs font-black text-brand-orange">📊 TABLA DE POSICIONES</p>
        {loading
          ? <span className="text-[10px] text-gray-500 animate-pulse">Actualizando...</span>
          : <span className="text-[10px] text-green-400">● En vivo</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 text-[10px] uppercase tracking-wider">
              <th className="text-left px-3 py-2 font-bold">#</th>
              <th className="text-left px-3 py-2 font-bold">Equipo</th>
              <th className="text-center px-1.5 py-2 font-bold">PJ</th>
              <th className="text-center px-1.5 py-2 font-bold">G</th>
              <th className="text-center px-1.5 py-2 font-bold">E</th>
              <th className="text-center px-1.5 py-2 font-bold">P</th>
              <th className="text-center px-1.5 py-2 font-bold">DIF</th>
              <th className="text-center px-1.5 py-2 font-bold text-brand-orange">PTS</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t, i) => {
              const { es, flag } = info(t.nombre)
              return (
                <tr key={t.nombre} className={`border-t border-white/5 ${i < 2 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="px-3 py-2">
                    <span className={`w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-black ${
                      i === 0 ? 'bg-brand-orange text-white' :
                      i === 1 ? 'bg-green-500 text-white' :
                      'bg-brand-medium text-gray-500'
                    }`}>{i + 1}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span>{flag}</span>
                      <span className="text-white font-medium truncate" style={{maxWidth:'80px'}}>{es}</span>
                    </div>
                  </td>
                  <td className="text-center px-1.5 py-2 text-gray-400">{t.pj}</td>
                  <td className="text-center px-1.5 py-2 text-gray-400">{t.g}</td>
                  <td className="text-center px-1.5 py-2 text-gray-400">{t.e}</td>
                  <td className="text-center px-1.5 py-2 text-gray-400">{t.p}</td>
                  <td className="text-center px-1.5 py-2 text-gray-400">{t.dif > 0 ? `+${t.dif}` : t.dif}</td>
                  <td className="text-center px-1.5 py-2 font-black text-white">{t.pts}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex gap-4 px-3 py-1.5 border-t border-white/5">
        <span className="text-[10px] text-gray-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-brand-orange inline-block" /> 1.° Clasifica
        </span>
        <span className="text-[10px] text-gray-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> 2.° Clasifica
        </span>
      </div>
    </div>
  )
}

function GrupoPartidos({ grupo }) {
  const partidos = data.partidos.filter(p => p.grupo === grupo)
  if (!partidos.length) return null
  return (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">📅 Partidos del grupo</p>
      <div className="space-y-2">
        {partidos.map(p => (
          <div key={p.id} className="bg-brand-black rounded-xl p-3 flex items-center gap-2">
            <span className="text-lg">{p.flag1}</span>
            <p className="text-xs text-gray-400 font-bold">{p.equipo1}</p>
            <span className="text-xs text-brand-orange font-black mx-1">VS</span>
            <p className="text-xs text-gray-400 font-bold">{p.equipo2}</p>
            <span className="text-lg">{p.flag2}</span>
            <span className="ml-auto text-xs text-gray-500">{p.fecha}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: CALENDARIO
════════════════════════════════════════ */
function TabCalendario({ favs, onFav }) {
  const [buscar, setBuscar] = useState('')
  const [filterPais, setFilterPais] = useState('todos')
  const [modo, setModo] = useState('normal')
  const [soloFavs, setSoloFavs] = useState(false)
  const [verPorGrupo, setVerPorGrupo] = useState(false)

  const filtered = useMemo(() => {
    return data.partidos.filter(p => {
      const q = buscar.toLowerCase()
      const matchSearch = q === '' || p.equipo1.toLowerCase().includes(q) || p.equipo2.toLowerCase().includes(q) || p.ciudad.toLowerCase().includes(q) || p.fecha.toLowerCase().includes(q)
      const matchPais = filterPais === 'todos' || p.pais === filterPais
      const matchFav = !soloFavs || favs.includes(p.id)
      return matchSearch && matchPais && matchFav
    })
  }, [buscar, filterPais, soloFavs, favs])

  if (verPorGrupo) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button onClick={() => setVerPorGrupo(false)} className="text-brand-orange text-sm font-semibold flex items-center gap-1">← Ver calendario completo</button>
        <CalendarioPorGrupo />
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input type="text" placeholder="Buscar país, ciudad, fecha..."
          value={buscar} onChange={e => setBuscar(e.target.value)}
          className="w-full bg-brand-medium text-white placeholder-gray-500 rounded-xl py-3 pl-10 pr-10 text-sm border border-white/10 focus:border-brand-orange/50 focus:outline-none" />
        {buscar && <button onClick={() => setBuscar('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg">×</button>}
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setVerPorGrupo(true)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-700 text-white">🗂️ Por grupo</button>
        <button onClick={() => setSoloFavs(!soloFavs)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${soloFavs ? 'bg-brand-yellow text-brand-black' : 'bg-brand-medium text-gray-400'}`}>⭐ Favoritos ({favs.length})</button>
        <button onClick={() => setModo(m => m === 'normal' ? 'lectura' : 'normal')} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold bg-brand-medium text-gray-400">
          {modo === 'normal' ? '⚡ Vista rápida' : '📋 Vista completa'}
        </button>
        {['todos', 'México', 'EE.UU.', 'Canadá'].map(p => (
          <button key={p} onClick={() => setFilterPais(p)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${filterPais === p ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}>
            {p === 'todos' ? '🌍 Todos' : p}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">{filtered.length} partidos · Hora Perú (PE UTC-5)</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="text-3xl mb-2">🔍</p>
            <p>No hay partidos con ese filtro</p>
            <button onClick={() => { setBuscar(''); setFilterPais('todos'); setSoloFavs(false) }} className="text-brand-orange text-sm mt-2">Limpiar</button>
          </div>
        ) : filtered.map(p => (
          <PartidoCard key={p.id} partido={p} modo={modo} isFav={favs.includes(p.id)} onFav={() => onFav(p.id)} />
        ))}
      </div>
    </div>
  )
}

function PartidoCard({ partido: p, modo, isFav, onFav }) {
  const [open, setOpen] = useState(false)
  const etqColors = { 'Partido inaugural':'bg-brand-orange','Debut anfitrión':'bg-blue-600','Partido fuerte':'bg-red-600','Partido destacado':'bg-red-700','Clásico europeo':'bg-purple-600','Revancha 2022':'bg-brand-green','Revancha del Mundial 2022':'bg-brand-green','Clásico internacional':'bg-yellow-600','🏆 GRAN FINAL':'bg-brand-yellow','Campeón vs Anfitrión':'bg-indigo-600','Argentina campeona':'bg-blue-700','EE.UU. anfitrión':'bg-blue-600','Ronda de 32':'bg-gray-600','Derby CONMEBOL/CONCACAF':'bg-orange-700','México en casa':'bg-green-700','Decisivo para México':'bg-red-700' }
  const etqColor = etqColors[p.etiqueta] || 'bg-brand-medium'
  if (modo === 'lectura') {
    return (
      <div className="bg-brand-dark rounded-xl px-4 py-2 flex items-center gap-3 border border-white/5">
        <span className="text-lg">{p.flag1}</span>
        <span className="text-xs font-bold text-white flex-1 truncate">{p.equipo1} <span className="text-gray-500">vs</span> {p.equipo2}</span>
        <span className="text-lg">{p.flag2}</span>
        <span className="text-xs text-gray-500 flex-shrink-0">{p.fecha}</span>
        {p.grupo && <span className="text-xs text-brand-orange font-bold flex-shrink-0">{p.grupo}</span>}
        <button onClick={onFav} className="text-sm flex-shrink-0">{isFav ? '⭐' : '☆'}</button>
      </div>
    )
  }
  return (
    <div className={`bg-brand-dark rounded-2xl border transition-all ${open ? 'border-brand-orange/30' : 'border-white/5'}`}>
      <div className="p-3 flex items-center gap-2">
        <button onClick={() => setOpen(!open)} className="flex-1 flex items-center gap-2 text-left">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{p.flag1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{p.equipo1} <span className="text-gray-500 font-normal">vs</span> {p.equipo2}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs text-gray-500">📅 {p.fecha}</span>
                {p.grupo && <span className="text-xs text-brand-orange font-bold">{p.grupo}</span>}
                {p.etiqueta && <span className={`text-xs text-white px-1.5 py-0.5 rounded-full font-bold ${etqColor}`}>{p.etiqueta}</span>}
              </div>
            </div>
            <span className="text-2xl flex-shrink-0">{p.flag2}</span>
          </div>
        </button>
        <button onClick={onFav} className="text-xl flex-shrink-0">{isFav ? '⭐' : '☆'}</button>
        <button onClick={() => setOpen(!open)} className={`text-gray-400 text-sm flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}>▼</button>
      </div>
      {open && (
        <div className="px-4 pb-4 space-y-2 animate-fade-in">
          {[['🕐','Hora PE', p.hora],['🏟️','Estadio', p.estadio],['🏙️','Ciudad', p.ciudad],['🌎','País sede', p.pais]].map(([icon, lbl, val]) => val && (
            <div key={lbl} className="flex gap-2 text-sm">
              <span className="flex-shrink-0">{icon}</span>
              <span className="text-gray-500 flex-shrink-0 text-xs">{lbl}:</span>
              <span className="text-gray-300 text-xs">{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CalendarioPorGrupo() {
  const [grupo, setGrupo] = useState('A')
  const grupos = [...new Set(data.partidos.filter(p => p.grupo).map(p => p.grupo))]
  const partidos = data.partidos.filter(p => p.grupo === grupo)
  const grupoInfo = data.grupos.find(g => g.id === grupo)
  return (
    <div className="space-y-3">
      <p className="text-sm font-bold text-white">Selecciona un grupo</p>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {grupos.map(g => (
          <button key={g} onClick={() => setGrupo(g)} className={`flex-shrink-0 w-10 h-10 rounded-xl text-sm font-black transition-all ${grupo === g ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}>{g}</button>
        ))}
      </div>
      {grupoInfo && (
        <div className="flex gap-2 flex-wrap">
          {grupoInfo.equipos.map(e => <span key={e.nombre} className="flex items-center gap-1 text-xs bg-brand-medium px-2 py-1 rounded-full text-gray-300"><span>{e.flag}</span>{e.nombre}</span>)}
        </div>
      )}
      <div className="space-y-2">
        {partidos.map(p => <PartidoCard key={p.id} partido={p} modo="normal" isFav={false} onFav={() => {}} />)}
        {!partidos.length && <p className="text-gray-500 text-sm text-center py-4">No hay partidos registrados aún</p>}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: ESTADIOS (con ficha enriquecida)
════════════════════════════════════════ */
function TabEstadios() {
  const [filterPais, setFilterPais] = useState('todos')
  const [selected, setSelected] = useState(null)
  const paises = ['todos', 'México', 'Canadá', 'EE.UU.']
  const filtered = filterPais === 'todos' ? data.estadios : data.estadios.filter(e => e.pais === filterPais)

  if (selected) {
    return <EstadioDetalle estadio={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {paises.map(p => (
          <button key={p} onClick={() => setFilterPais(p)} className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${filterPais === p ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}>
            {p === 'todos' ? '🌍 Todos' : p === 'México' ? '🇲🇽 México' : p === 'Canadá' ? '🇨🇦 Canadá' : '🇺🇸 EE.UU.'}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">{filtered.length} estadios · Toca uno para ver su historia completa</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {filtered.map(e => (
          <button key={e.id} onClick={() => setSelected(e)}
            className="w-full bg-brand-dark rounded-2xl border border-white/5 overflow-hidden text-left hover:border-brand-orange/30 transition-all hover:scale-[1.01] active:scale-[0.99]">
            <div className={`h-2 bg-gradient-to-r ${e.colorTema || 'from-brand-orange to-yellow-600'}`} />
            <div className="p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-medium rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{e.emoji || '🏟️'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm truncate">{e.nombre}</p>
                <p className="text-xs text-gray-500 mt-0.5">{e.flag} {e.ciudad} · {e.pais}</p>
                <p className="text-xs text-brand-orange mt-0.5">👥 {e.capacidad}</p>
              </div>
              <span className="text-brand-orange text-lg flex-shrink-0">›</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function EstadioDetalle({ estadio: e, onBack }) {
  const partidos = data.partidos.filter(p => p.estadio === e.nombre || p.estadio.startsWith(e.nombre.split(' ')[0]))

  return (
    <div className="animate-fade-in space-y-4">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-brand-orange font-semibold">
        ← Volver a estadios
      </button>

      {/* Header visual */}
      <div className={`rounded-3xl overflow-hidden bg-gradient-to-br ${e.colorTema || 'from-brand-orange to-yellow-600'} p-6 relative`}>
        <div className="absolute inset-0 opacity-20 flex items-center justify-center text-[120px] select-none">{e.emoji || '🏟️'}</div>
        <div className="relative">
          <p className="text-xs font-bold text-white/60 uppercase tracking-widest">{e.flag} {e.pais}</p>
          <h2 className="text-2xl font-black text-white leading-tight mt-1">{e.nombre}</h2>
          <p className="text-sm text-white/70 mt-1">{e.ciudad} · {e.capacidad} personas</p>
        </div>
      </div>

      {/* Dato rápido */}
      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-orange mb-1">⭐ Para el cliente</p>
        <p className="text-sm text-gray-300 leading-relaxed">{e.dato}</p>
      </div>

      {/* Historia */}
      {e.historia && (
        <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">📖 Historia del estadio</p>
          <p className="text-sm text-gray-300 leading-relaxed">{e.historia}</p>
        </div>
      )}

      {/* Evento memorable */}
      {e.eventoMemorable && (
        <div className="bg-brand-dark rounded-2xl p-4 border border-brand-yellow/20">
          <p className="text-xs font-bold text-brand-yellow uppercase tracking-wider mb-2">⚡ Evento memorable</p>
          <p className="text-sm text-gray-300 leading-relaxed">{e.eventoMemorable}</p>
        </div>
      )}

      {/* Curiosidad */}
      {e.curiosidad && (
        <div className="bg-brand-dark rounded-2xl p-4 border border-brand-green/20">
          <p className="text-xs font-bold text-brand-green uppercase tracking-wider mb-2">🔍 Dato curioso</p>
          <p className="text-sm text-gray-300 leading-relaxed">{e.curiosidad}</p>
        </div>
      )}

      {/* Comentario especial */}
      {e.comentarioEspecial && (
        <div className="bg-gradient-to-r from-brand-orange/20 to-yellow-700/10 rounded-2xl p-4 border border-brand-orange/30">
          <p className="text-xs font-bold text-brand-orange mb-1">💬 Guerrera, esto lo hace especial</p>
          <p className="text-sm text-gray-300 leading-relaxed italic">"{e.comentarioEspecial}"</p>
        </div>
      )}

      {/* Partidos del Mundial */}
      {partidos.length > 0 && (
        <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
          <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">📅 Partidos del Mundial aquí</p>
          <div className="space-y-2">
            {partidos.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-brand-medium rounded-xl px-3 py-2.5">
                <span className="text-lg">{p.flag1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{p.equipo1} vs {p.equipo2}</p>
                  {p.etiqueta && <p className="text-xs text-brand-orange">{p.etiqueta}</p>}
                </div>
                <span className="text-lg">{p.flag2}</span>
                <span className="text-xs text-gray-500 flex-shrink-0">{p.fecha}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: DESTACADOS (con ficha enriquecida)
════════════════════════════════════════ */
function TabDestacados({ favs, onFav }) {
  const [selected, setSelected] = useState(null)

  if (selected !== null) {
    const d = data.destacados[selected]
    const pid = `dest_${selected}`
    return (
      <div className="animate-fade-in space-y-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-brand-orange font-semibold">
          ← Volver a destacados
        </button>
        <div className="rounded-3xl overflow-hidden border border-white/10" style={{ background: `${d.color}22` }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black px-3 py-1.5 rounded-full text-white" style={{ background: d.color }}>{d.etiqueta}</span>
              <button onClick={() => onFav(pid)} className="text-2xl">{favs.includes(pid) ? '⭐' : '☆'}</button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 text-center">
                <span className="text-6xl block mb-2">{d.flag1}</span>
                <p className="font-black text-white text-base">{d.partido.split('vs')[0].trim()}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-white/60">VS</p>
              </div>
              <div className="flex-1 text-center">
                <span className="text-6xl block mb-2">{d.flag2}</span>
                <p className="font-black text-white text-base">{d.partido.split('vs')[1]?.trim()}</p>
              </div>
            </div>
            <div className="flex gap-3 text-xs text-gray-400 justify-center flex-wrap">
              <span>📅 {d.fecha}</span>
              {d.grupo && <span>• Grupo {d.grupo}</span>}
              <span>• 🏙️ {d.ciudad}</span>
              <span>• 🏟️ {d.estadio}</span>
            </div>
          </div>
        </div>
        <div className="bg-brand-dark rounded-2xl p-4 border border-brand-yellow/20">
          <p className="text-xs font-bold text-brand-yellow mb-2">⭐ Por qué destaca</p>
          <p className="text-sm text-gray-300 leading-relaxed">{d.motivo}</p>
        </div>
        {d.contexto && (
          <div className="bg-brand-dark rounded-2xl p-4 border border-blue-500/20">
            <p className="text-xs font-bold text-blue-400 mb-2">📖 Contexto e historia</p>
            <p className="text-sm text-gray-300 leading-relaxed">{d.contexto}</p>
          </div>
        )}
        {d.datosConversacion && (
          <div className="bg-gradient-to-r from-brand-orange/20 to-yellow-700/10 rounded-2xl p-4 border border-brand-orange/30">
            <p className="text-xs font-bold text-brand-orange mb-1">💬 Dato para conversar con el cliente</p>
            <p className="text-sm text-gray-300 leading-relaxed italic">"{d.datosConversacion}"</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-sm text-gray-500">Los partidos que toda promotora debe conocer · Toca para ver detalle completo</p>
      {data.destacados.map((d, i) => {
        const pid = `dest_${i}`
        return (
          <div key={i} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden cursor-pointer hover:scale-[1.01] transition-all" onClick={() => setSelected(i)}>
            <div className="p-1" style={{ background: `${d.color}22` }}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black px-2 py-1 rounded-full text-white" style={{ background: d.color }}>{d.etiqueta}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-brand-orange font-bold">Ver detalle ›</span>
                    <button onClick={e => { e.stopPropagation(); onFav(pid) }} className="text-xl">{favs.includes(pid) ? '⭐' : '☆'}</button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1 text-center">
                    <span className="text-4xl block mb-1">{d.flag1}</span>
                    <p className="text-xs font-bold text-white">{d.partido.split('vs')[0].trim()}</p>
                  </div>
                  <span className="text-brand-orange font-black text-xl">VS</span>
                  <div className="flex-1 text-center">
                    <span className="text-4xl block mb-1">{d.flag2}</span>
                    <p className="text-xs font-bold text-white">{d.partido.split('vs')[1]?.trim()}</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-gray-500 mb-3 flex-wrap">
                  <span>📅 {d.fecha}</span>
                  {d.grupo && <span>• {d.grupo}</span>}
                  <span>• 🏙️ {d.ciudad}</span>
                </div>
                <div className="bg-brand-medium rounded-xl p-3">
                  <p className="text-xs font-bold text-brand-yellow mb-1">⭐ Por qué destaca</p>
                  <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">{d.motivo}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: HISTORIAS
════════════════════════════════════════ */
function TabHistorias() {
  const [open, setOpen] = useState(null)
  const [filter, setFilter] = useState('todos')

  const categorias = ['todos', 'momentos', 'estadios']
  const filtered = filter === 'todos' ? data.historias : data.historias.filter(h => h.categoria === filter)

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <p className="text-lg font-black text-white">Historias, momentos y datos</p>
        <p className="text-sm text-gray-500 mt-0.5">Contenido que genera conversación con el cliente</p>
      </div>

      <div className="flex gap-2">
        {[['todos','🌍','Todos'],['momentos','⚽','Momentos'],['estadios','🏟️','Estadios']].map(([val, icon, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === val ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}>
            <span>{icon}</span><span>{lbl}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(h => (
          <div key={h.id} className={`bg-brand-dark rounded-2xl border overflow-hidden transition-all ${open === h.id ? 'border-brand-orange/40' : 'border-white/5'}`}>
            <button onClick={() => setOpen(open === h.id ? null : h.id)} className="w-full text-left p-4 flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">{h.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-white text-sm leading-tight">{h.titulo}</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed line-clamp-2">{h.resumen}</p>
                <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-bold ${h.categoria === 'momentos' ? 'bg-brand-orange/20 text-brand-orange' : 'bg-blue-500/20 text-blue-400'}`}>
                  {h.categoria === 'momentos' ? '⚽ Momento histórico' : '🏟️ Estadio'}
                </span>
              </div>
              <span className={`text-gray-400 text-sm transition-transform flex-shrink-0 mt-1 ${open === h.id ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open === h.id && (
              <div className="px-4 pb-4 space-y-3 animate-fade-in">
                <div className="bg-brand-medium rounded-xl p-4">
                  <p className="text-sm text-gray-300 leading-relaxed">{h.detalle}</p>
                </div>
                <div className="bg-blue-900/30 border border-blue-500/20 rounded-xl p-3">
                  <p className="text-xs font-bold text-blue-400 mb-1">🎯 ¿Por qué importa?</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{h.porQueImporta}</p>
                </div>
                <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-3">
                  <p className="text-xs font-bold text-brand-orange mb-1">💬 Guerrera, úsalo así</p>
                  <p className="text-sm text-gray-300 italic leading-relaxed">"{h.comentarioFinal}"</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <SabiasQue max={2} />
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: GALERÍA
════════════════════════════════════════ */
function TabGaleria() {
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('todos')

  const categorias = ['todos', 'estadio', 'ciudad', 'dato']
  const filtered = filter === 'todos' ? data.galeriaItems : data.galeriaItems.filter(g => g.categoria === filter)

  if (selected) {
    return (
      <div className="animate-fade-in space-y-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-brand-orange font-semibold">
          ← Volver a galería
        </button>
        <div className={`rounded-3xl overflow-hidden bg-gradient-to-br ${selected.colorFondo} p-8 relative`}>
          <div className="absolute inset-0 opacity-20 flex items-center justify-center text-[120px] select-none">{selected.emoji}</div>
          <div className="relative text-center">
            <span className="text-7xl block mb-4">{selected.emoji}</span>
            <p className="text-xs text-white/60 uppercase tracking-widest">{selected.pais}</p>
            <h2 className="text-xl font-black text-white mt-1">{selected.titulo}</h2>
            <p className="text-sm text-white/70 mt-2 leading-relaxed">{selected.descripcion}</p>
          </div>
        </div>
        <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
          <div className="flex gap-2 items-center mb-2">
            <span className="text-xl">{selected.emoji}</span>
            <p className="text-sm font-bold text-white">{selected.titulo}</p>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{selected.descripcion}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="text-xs bg-brand-medium px-2 py-1 rounded-full text-gray-400">📍 {selected.ciudad}</span>
            <span className="text-xs bg-brand-medium px-2 py-1 rounded-full text-gray-400">{selected.pais}</span>
            <span className="text-xs bg-brand-orange/20 px-2 py-1 rounded-full text-brand-orange capitalize">{selected.categoria}</span>
          </div>
        </div>
        <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
          <p className="text-xs text-gray-500 leading-relaxed">
            📷 <span className="text-gray-400">Ruta de imagen:</span> <code className="text-brand-orange text-xs">{selected.imagen}</code>
            <br/><span className="text-gray-600">Reemplaza con imagen real cuando esté disponible.</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <p className="text-lg font-black text-white">Galería del Mundial 2026</p>
        <p className="text-sm text-gray-500 mt-0.5">Estadios, ciudades y momentos del torneo</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {[['todos','🌍','Todos'],['estadio','🏟️','Estadios'],['ciudad','🏙️','Ciudades'],['dato','✨','Datos']].map(([val, icon, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === val ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}>
            <span>{icon}</span><span>{lbl}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(item => (
          <button key={item.id} onClick={() => setSelected(item)}
            className={`rounded-2xl overflow-hidden text-left hover:scale-[1.03] active:scale-[0.97] transition-all`}>
            <div className={`bg-gradient-to-br ${item.colorFondo} p-6 relative`}>
              <div className="absolute inset-0 opacity-20 flex items-center justify-center text-7xl select-none">{item.emoji}</div>
              <div className="relative">
                <span className="text-4xl block">{item.emoji}</span>
              </div>
            </div>
            <div className="bg-brand-dark p-3">
              <p className="text-xs font-bold text-white leading-tight">{item.titulo}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.ciudad} · {item.pais}</p>
              <span className="text-xs text-brand-orange mt-1 block capitalize">{item.categoria}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-brand-medium rounded-2xl p-4 border border-white/5">
        <p className="text-xs text-gray-500 leading-relaxed">
          📷 <strong className="text-gray-400">Imágenes:</strong> Estructura lista para imágenes reales. Carpeta sugerida: <code className="text-brand-orange">/public/images/mundial2026/</code>
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: COMENTARIOS RÁPIDOS (Speeches)
════════════════════════════════════════ */
function TabComentarios() {
  const [filter, setFilter] = useState('todos')
  const [copied, setCopied] = useState(null)

  const temas = {
    todos: { lbl: 'Todos', icon: '🌍' },
    estadios: { lbl: 'Estadios', icon: '🏟️' },
    grupos: { lbl: 'Grupos', icon: '🗂️' },
    paises: { lbl: 'Países', icon: '🌎' },
    curiosidades: { lbl: 'Curiosidades', icon: '✨' },
    historia: { lbl: 'Historia', icon: '⚡' },
  }

  const filtered = filter === 'todos' ? data.comentariosRapidos : data.comentariosRapidos.filter(c => c.tema === filter)

  function copiar(texto, id) {
    try {
      navigator.clipboard.writeText(texto).then(() => {
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
      })
    } catch {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <p className="text-lg font-black text-white">Speeches del Mundial</p>
        <p className="text-sm text-gray-500 mt-0.5">Frases listas para conversar con el cliente sobre el Mundial 2026</p>
      </div>

      <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-orange mb-1">💡 Cómo usarlos</p>
        <p className="text-sm text-gray-300 leading-relaxed">Usa estas frases de manera natural en la conversación. Adapta el tono según el cliente. Toca el botón para copiar cualquier frase.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {Object.entries(temas).map(([key, { lbl, icon }]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filter === key ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}>
            <span>{icon}</span><span>{lbl}</span>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">{filtered.length} frases</p>

      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="bg-brand-dark rounded-2xl border border-white/5 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{c.icon}</span>
              <div className="flex-1">
                <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-bold mb-2 ${
                  temas[c.tema] ? 'bg-brand-orange/20 text-brand-orange' : 'bg-brand-medium text-gray-400'
                }`}>{temas[c.tema]?.icon} {temas[c.tema]?.lbl}</span>
                <p className="text-sm text-gray-300 leading-relaxed">"{c.texto}"</p>
              </div>
            </div>
            <button onClick={() => copiar(c.texto, c.id)}
              className={`mt-3 w-full py-2 rounded-xl text-xs font-bold transition-all ${copied === c.id ? 'bg-brand-green/20 text-brand-green' : 'bg-brand-medium text-gray-400 hover:text-white'}`}>
              {copied === c.id ? '✓ Copiado' : '📋 Copiar frase'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-brand-medium rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-brand-yellow mb-2">⚠️ Recuerda siempre</p>
        <p className="text-sm text-gray-400 leading-relaxed">Estas frases son informativas. Ningún resultado deportivo puede garantizarse. Tu rol es informar y orientar, no prometer.</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: DATOS RÁPIDOS
════════════════════════════════════════ */
function TabDatos() {
  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-sm font-bold text-white mb-1">10 datos esenciales del Mundial 2026</p>
      {data.datosRapidos.map((d, i) => (
        <div key={i} className="bg-brand-dark rounded-2xl p-4 border border-white/5 flex gap-3 items-start">
          <span className="text-2xl flex-shrink-0">{d.icon}</span>
          <div>
            <p className="text-xs font-bold text-brand-orange mb-1">{d.pregunta}</p>
            <p className="text-sm text-gray-300 leading-relaxed">{d.respuesta}</p>
          </div>
        </div>
      ))}
      <SabiasQue max={3} />
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: FAQ
════════════════════════════════════════ */
function TabFaq() {
  const [open, setOpen] = useState(null)
  return (
    <div className="space-y-2 animate-fade-in">
      <p className="text-sm text-gray-500 mb-1">Preguntas frecuentes del Mundial 2026</p>
      {data.faqs.map((f, i) => (
        <div key={i} className={`bg-brand-dark rounded-2xl border overflow-hidden transition-all ${open === i ? 'border-brand-orange/30' : 'border-white/5'}`}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left p-4 flex items-start gap-3">
            <span className="text-brand-orange font-black text-sm mt-0.5 flex-shrink-0">❓</span>
            <p className="text-sm font-semibold text-white flex-1 text-left">{f.pregunta}</p>
            <span className={`text-gray-400 text-sm flex-shrink-0 mt-0.5 transition-transform ${open === i ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {open === i && (
            <div className="px-4 pb-4 animate-fade-in">
              <div className="bg-brand-medium rounded-xl p-3">
                <p className="text-sm text-gray-300 leading-relaxed">{f.respuesta}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: TRIVIA
════════════════════════════════════════ */
function TabTrivia({ onPoints }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [finished, setFinished] = useState(false)
  const [score, setScore] = useState(0)

  const questions = data.trivias

  function handleAnswer(qId, idx) {
    if (answers[qId] !== undefined) return
    const q = questions.find(q => q.id === qId)
    const correct = idx === q.correcta
    setAnswers(prev => ({ ...prev, [qId]: idx }))
    if (correct) { setScore(s => s + 10); onPoints && onPoints(10) }
    setTimeout(() => {
      if (current < questions.length - 1) setCurrent(c => c + 1)
      else setFinished(true)
    }, 1100)
  }

  function restart() { setCurrent(0); setAnswers({}); setScore(0); setFinished(false) }

  if (finished) {
    const pct = Math.round((score / (questions.length * 10)) * 100)
    return (
      <div className="animate-fade-in text-center space-y-4">
        <div className="bg-brand-dark rounded-3xl p-8 border border-brand-orange/30">
          <p className="text-5xl mb-3">{pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : '📚'}</p>
          <p className="text-xl font-black text-white">{pct >= 80 ? '¡Experta Mundialista!' : pct >= 60 ? '¡Buen trabajo!' : 'Sigue repasando'}</p>
          <p className="text-brand-orange text-4xl font-black my-3">+{score} pts</p>
          <p className="text-sm text-gray-400">{score} de {questions.length * 10} puntos · {pct}% de acierto</p>
          <div className="bg-brand-medium rounded-xl p-3 mt-4">
            <p className="text-xs text-gray-400 italic leading-relaxed">
              "¡Muy bien, guerrera! Mientras más conoces el Mundial, mejor puedes orientar al cliente con información clara."
            </p>
          </div>
        </div>
        <button onClick={restart} className="w-full py-3 bg-brand-orange rounded-xl font-bold text-white">🔄 Intentar de nuevo</button>
      </div>
    )
  }

  const q = questions[current]
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-800 to-brand-orange/70 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="font-black text-white">🧠 Reto Mundialista</p>
          <p className="text-sm font-bold text-white">+{score} pts</p>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i < current ? 'bg-white' : i === current ? 'bg-white/60' : 'bg-white/20'}`} />
          ))}
        </div>
        <p className="text-xs text-white/70 mt-1">{current + 1} de {questions.length}</p>
      </div>
      <div className="bg-brand-dark rounded-2xl p-5 border border-blue-500/30">
        <p className="text-base font-bold text-white leading-relaxed mb-4">{q.pregunta}</p>
        <div className="space-y-2">
          {q.opciones.map((opt, idx) => {
            const answered = answers[q.id] !== undefined
            const isSelected = answers[q.id] === idx
            const isCorrect = idx === q.correcta
            let style = 'border-white/10 text-gray-300 hover:border-blue-500/40'
            if (answered) {
              if (isCorrect) style = 'border-brand-green bg-brand-green/10 text-brand-green'
              else if (isSelected) style = 'border-red-500 bg-red-500/10 text-red-400'
              else style = 'border-white/5 text-gray-600 opacity-40'
            }
            return (
              <button key={idx} onClick={() => handleAnswer(q.id, idx)}
                className={`w-full text-left border rounded-xl p-3 text-sm font-semibold transition-all ${style}`}>
                {opt}
              </button>
            )
          })}
        </div>
        {answers[q.id] !== undefined && (
          <div className={`mt-3 rounded-xl p-3 text-sm leading-relaxed ${answers[q.id] === q.correcta ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-medium text-gray-300'}`}>
            {answers[q.id] === q.correcta ? '🎉 ¡Correcto! +10 pts' : `💡 ${q.explicacion}`}
          </div>
        )}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: JUGADORES — ESTRELLAS DEL MUNDIAL
════════════════════════════════════════ */
const JUGADORES_WC = [
  {
    id:'mbappe', nombre:'Kylian Mbappé', pais:'Francia', flag:'🇫🇷', club:'Real Madrid', pos:'Delantero',
    emoji:'⚡', color:'#3b82f6',
    desc:'El más rápido del mundo. Campeón en 2018 con 19 años. Finalista en 2022 con hat-trick. Ahora en Real Madrid, llega hambriento de ganar su primer título como figura absoluta.',
    dato:'36 km/h · Solo Usain Bolt lo supera en velocidad.',
    gancho:'"¿Ya viste a Mbappé? Marcó en la última final. En TE APUESTO puedes apostarle como goleador del torneo — las cuotas son increíbles."',
    guapo:5, temido:5, esperado:5,
  },
  {
    id:'vini', nombre:'Vinícius Jr.', pais:'Brasil', flag:'🇧🇷', club:'Real Madrid', pos:'Extremo',
    emoji:'🌊', color:'#22c55e',
    desc:'El alma de Brasil. Regaetón en las piernas, Champions en el corazón. Ganó dos Champions en Madrid y ahora quiere la Copa del Mundo para completar el álbum.',
    dato:'Baila en los goles. La FIFA intentó multarlo — ganó el debate. Ahora baila más que nunca.',
    gancho:'"¿Viste que Vini viene de ganar Champions? Brasil nunca perdió un Mundial en el que Vinicius jugó bien. ¿Le apostamos a Brasil campeón?"',
    guapo:5, temido:4, esperado:5,
  },
  {
    id:'bellingham', nombre:'Jude Bellingham', pais:'Inglaterra', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', club:'Real Madrid', pos:'Mediapunta',
    emoji:'👑', color:'#a78bfa',
    desc:'Solo 21 años y ya es el mejor jugador del Real Madrid. Inglés, guapo, millonario y con un olfato de gol que no debería tener un centrocampista.',
    dato:'Primer gol con Real Madrid fue de chalaca. Primer gol en Champions fue de volea. Solo arranca en primera.',
    gancho:'"¿Conoces a Bellingham? Tiene 21 años y ya gana todo con el Real Madrid. Inglaterra llega con él como figura — interesante apostar a ingleses en grupos."',
    guapo:5, temido:4, esperado:5,
  },
  {
    id:'haaland', nombre:'Erling Haaland', pais:'Noruega', flag:'🇳🇴', club:'Man. City', pos:'Delantero',
    emoji:'🤖', color:'#60a5fa',
    desc:'Una máquina de hacer goles. 93 goles en 99 partidos con el City. El problema: Noruega nunca clasificó a un Mundial con él. Esta vez sí. El mundo tiembla.',
    dato:'Si Noruega avanza, Haaland puede romper el récord de goles de un mundial. Tiene el físico y la racha.',
    gancho:'"Noruega clasificó por primera vez gracias a Haaland. Si marca 2 goles en el primer partido, TE APUESTO tiene mercado de goleador del torneo. ¿Le entramos?"',
    guapo:4, temido:5, esperado:4,
  },
  {
    id:'messi', nombre:'Lionel Messi', pais:'Argentina', flag:'🇦🇷', club:'Inter Miami', pos:'Delantero',
    emoji:'🐐', color:'#60a5fa',
    desc:'El GOAT. Campeón del mundo en 2022. A sus 39 años llega a defender el título. Puede que sea su último baile mundialista. Y los últimos bailes de Messi siempre son los más hermosos.',
    dato:'7 Balones de Oro. 1 Copa del Mundo. Y todavía no ha dicho adiós.',
    gancho:'"¿Y si Messi gana otro Mundial? Argentina defenderá el título — siempre hay clientes que quieren apostar al campeón defensor."',
    guapo:4, temido:5, esperado:5,
  },
  {
    id:'yamal', nombre:'Lamine Yamal', pais:'España', flag:'🇪🇸', club:'Barcelona', pos:'Extremo',
    emoji:'🌟', color:'#facc15',
    desc:'Nació el mismo día que Messi levantó su primer Balón de Oro. Tiene 17 años. Ya ganó la Eurocopa 2024 con España y es el futbolista más joven en hacerlo. El futuro ya llegó.',
    dato:'Marcó en la semifinal de la Euro 2024 con 16 años. Menos de 24 horas antes había cumplido años.',
    gancho:'"¿Sabías que el chico de España Lamine Yamal tiene 17 años y ya ganó la Eurocopa? Es el gran favorito de los jóvenes. España llega fortísima al Mundial."',
    guapo:3, temido:4, esperado:5,
  },
  {
    id:'pedri', nombre:'Pedri', pais:'España', flag:'🇪🇸', club:'Barcelona', pos:'Mediapunta',
    emoji:'🎨', color:'#facc15',
    desc:'El artista. Juega como si el campo fuera un museo y el balón su pincel. A los 23 años ya tiene dos Eurocopas y un talento que hizo llorar a Xavi Hernández de emoción.',
    dato:'Nominado al Balón de Oro a los 18 años. Solo Messi lo había logrado antes tan joven.',
    gancho:'"Pedri y España son los más técnicos del torneo. Combinado con Lamine Yamal, son temibles. España puede llegar lejos — buen mercado para apostar en cuotas."',
    guapo:5, temido:3, esperado:4,
  },
  {
    id:'ronaldo', nombre:'Cristiano Ronaldo', pais:'Portugal', flag:'🇵🇹', club:'Al Nassr', pos:'Delantero',
    emoji:'💎', color:'#ef4444',
    desc:'A sus 41 años estará en el Mundial. Sí, 41. Portugal se clasifica porque Cristiano tiene la voluntad de un toro. El más trabajador, el más disciplinado. Leyenda total.',
    dato:'135 goles con Portugal. El máximo goleador de selecciones de la historia. Sin debate.',
    gancho:'"Cristiano va a su último Mundial. Portugal siempre llega lejos con él — los clientes que siguen a CR7 van a apostar seguro."',
    guapo:5, temido:4, esperado:4,
  },
  {
    id:'nunez', nombre:'Darwin Núñez', pais:'Uruguay', flag:'🇺🇾', club:'Liverpool', pos:'Delantero',
    emoji:'💥', color:'#60a5fa',
    desc:'Un torpedo humano. Uruguay siempre saca más de lo que tiene. Con Darwin adelante, son capaces de eliminar a cualquiera. Potencia pura.',
    dato:'Uruguay ganó 2 Mundiales (1930 y 1950). No gana desde hace 70 años — pero siguen soñando.',
    gancho:'"Uruguay siempre da sorpresas en los mundiales. Con Darwin y Valverde, son una selección muy peligrosa. Puede ser una gran apuesta a precio alto."',
    guapo:3, temido:4, esperado:3,
  },
  {
    id:'vlahovic', nombre:'Dusan Vlahovic', pais:'Serbia', flag:'🇷🇸', club:'Juventus', pos:'Delantero',
    emoji:'🦁', color:'#ef4444',
    desc:'La revelación que nadie tiene en el radar. Goleador implacable en la Juventus. Serbia puede ser la gran sorpresa del torneo. Perfil bajo, rendimiento alto.',
    dato:'35 goles en Serie A en las últimas 2 temporadas. Uno de los mejores del mundo en el área.',
    gancho:'"Serbia puede ser la gran sorpresa — siempre hay un equipo que lo rompe todo en el Mundial. Vlahovic es un goleador brutal. Cuota alta, posible apuesta atrevida."',
    guapo:4, temido:3, esperado:3,
  },
]

function RankingEstrellas({ valor, tipo }) {
  const configs = {
    guapo:   { emoji:'💗', color:'#ec4899', label:'Corazones' },
    temido:  { emoji:'😰', color:'#ef4444', label:'Miedo' },
    esperado:{ emoji:'🔥', color:'#f97316', label:'Expectativa' },
  }
  const cfg = configs[tipo]
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-sm transition-all ${i <= valor ? 'opacity-100' : 'opacity-20'}`}>{cfg.emoji}</span>
      ))}
    </div>
  )
}

function TabJugadores() {
  const [categoria, setCategoria] = useState('todos')
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(null)

  const categorias = [
    { id:'todos',    icon:'⭐', label:'Todos' },
    { id:'guapo',    icon:'💗', label:'Más guapos' },
    { id:'temido',   icon:'😰', label:'Más temidos' },
    { id:'esperado', icon:'🔥', label:'Más esperados' },
  ]

  const sorted = [...JUGADORES_WC].sort((a, b) =>
    categoria === 'todos' ? 0 : b[categoria] - a[categoria]
  )

  async function copiar(texto, id) {
    try { await navigator.clipboard.writeText(texto.replace(/^"|"$/g,'')) } catch {}
    setCopied(id); setTimeout(() => setCopied(null), 2000)
  }

  if (selected) {
    const j = selected
    return (
      <div className="animate-fade-in space-y-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-sm text-brand-orange font-semibold">
          ← Volver a jugadores
        </button>
        {/* Hero del jugador */}
        <div className="rounded-3xl overflow-hidden p-6 relative" style={{background:`linear-gradient(135deg,${j.color}33,#1e1e3a)`}}>
          <div className="absolute inset-0 opacity-10 flex items-center justify-center text-[140px] select-none">{j.emoji}</div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-5xl">{j.flag}</span>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-widest">{j.pais} · {j.club}</p>
                <h2 className="text-2xl font-black text-white">{j.nombre}</h2>
                <p className="text-sm" style={{color:j.color}}>{j.emoji} {j.pos}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {[['guapo','💗','Guapo'],['temido','😰','Temido'],['esperado','🔥','Esperado']].map(([k,e,l]) => (
                <div key={k} className="bg-black/20 rounded-xl p-2 text-center">
                  <p className="text-xs text-white/60">{l}</p>
                  <RankingEstrellas valor={j[k]} tipo={k} />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Descripción */}
        <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">📖 ¿Quién es?</p>
          <p className="text-sm text-gray-300 leading-relaxed">{j.desc}</p>
        </div>
        {/* Dato impacto */}
        <div className="rounded-2xl p-4 border" style={{backgroundColor:`${j.color}15`,borderColor:`${j.color}40`}}>
          <p className="text-xs font-black uppercase tracking-wider mb-1" style={{color:j.color}}>⚡ Dato que sorprende</p>
          <p className="text-sm text-white leading-relaxed">{j.dato}</p>
        </div>
        {/* Gancho para cliente */}
        <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-brand-orange">💬 Dile a tu cliente:</p>
            <button onClick={() => copiar(j.gancho, j.id)}
              className={`text-xs font-bold flex items-center gap-1 transition-all ${copied===j.id?'text-green-400':'text-gray-400 hover:text-brand-orange'}`}>
              {copied===j.id?'✅ Copiado':'📋 Copiar'}
            </button>
          </div>
          <p className="text-sm text-white italic leading-relaxed">{j.gancho}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <p className="text-lg font-black text-white">⭐ Los Cracks del Mundial</p>
        <p className="text-sm text-gray-500 mt-0.5">Conoce a las estrellas para conversar con tus clientes</p>
      </div>

      {/* Selector de categoría */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {categorias.map(c => (
          <button key={c.id} onClick={() => setCategoria(c.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all ${
              categoria === c.id ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'
            }`}>
            <span>{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Banner especial para "Más guapos" */}
      {categoria === 'guapo' && (
        <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/30 rounded-2xl p-3">
          <p className="text-sm font-black text-pink-300">💗 ¡Sección favorita!</p>
          <p className="text-xs text-gray-400 mt-0.5">Un cliente que pregunte por sus favoritos es un cliente listo para apostar. ¡Usa esto como gancho!</p>
        </div>
      )}

      {/* Grid de jugadores */}
      <div className="grid grid-cols-2 gap-3">
        {sorted.map((j, idx) => (
          <button key={j.id} onClick={() => setSelected(j)}
            className="bg-brand-dark rounded-2xl overflow-hidden text-left hover:scale-[1.02] active:scale-95 transition-all border border-white/5 hover:border-white/20">
            {/* Color bar */}
            <div className="h-1.5 w-full" style={{backgroundColor:j.color}} />
            <div className="p-3">
              {/* Posición ranking */}
              {categoria !== 'todos' && (
                <span className="text-xs font-black text-white bg-brand-orange px-1.5 py-0.5 rounded-full mb-2 inline-block">#{idx+1}</span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">{j.flag}</span>
                <div className="min-w-0">
                  <p className="text-xs font-black text-white leading-tight truncate">{j.nombre}</p>
                  <p className="text-[10px] text-gray-500">{j.club}</p>
                </div>
              </div>
              {/* Ranking de la categoría seleccionada */}
              {categoria !== 'todos' ? (
                <RankingEstrellas valor={j[categoria]} tipo={categoria} />
              ) : (
                <div className="flex gap-1">
                  <span className="text-[9px] text-pink-400">💗{j.guapo}</span>
                  <span className="text-[9px] text-red-400">😰{j.temido}</span>
                  <span className="text-[9px] text-orange-400">🔥{j.esperado}</span>
                </div>
              )}
              <p className="text-[10px] text-gray-500 mt-1.5 line-clamp-2 leading-snug">{j.desc.split('.')[0]}.</p>
              <p className="text-[10px] text-brand-orange font-bold mt-1">Ver detalles →</p>
            </div>
          </button>
        ))}
      </div>

      <div className="bg-brand-dark border border-white/5 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-yellow mb-1">💡 Tip guerrera</p>
        <p className="text-sm text-gray-400 leading-relaxed">Cuando un cliente menciona a un jugador favorito, es el momento perfecto para proponer una apuesta relacionada. ¡Usa el gancho de cada jugador!</p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   TAB: PERÚ 🇵🇪 — SECCIÓN ESPECIAL
════════════════════════════════════════ */
const PERU_JUGADORES = [
  { nombre:'Paolo Guerrero',  pos:'Delantero',  emoji:'⚔️', dato:'El máximo goleador histórico de Perú. Si llega al Mundial, será su último baile. Leyenda viva.' },
  { nombre:'Christian Cueva', pos:'Mediapunta',  emoji:'🎩', dato:'El más talentoso. Cuando está bien, puede desequilibrar a cualquier defensa del mundo.' },
  { nombre:'Gianluca Lapadula',pos:'Delantero', emoji:'🦁', dato:'Corazón peruano-italiano. El guerrero del área. Siempre marca en los momentos importantes.' },
  { nombre:'Renato Tapia',    pos:'Volante',    emoji:'🛡️', dato:'El capitán. La muralla del mediocampo. Juega en Europa y es el cerebro defensivo de la selección.' },
  { nombre:'Luis Advíncula',  pos:'Lateral',    emoji:'⚡', dato:'Uno de los laterales más rápidos de América. Juega en Boca Juniors. Sube y baja sin parar.' },
  { nombre:'Edison Flores',   pos:'Mediocampista',emoji:'🎯',dato:'El más técnico del mediocampo. Sus centros y remates desde fuera del área sorprenden a todos.' },
]

const PERU_DATOS = [
  { emoji:'🗓️', titulo:'44 años de espera',     texto:'La última vez que Perú jugó un Mundial fue en España 1982. ¡Una generación entera esperó este momento!' },
  { emoji:'🇵🇪', titulo:'Clasificación histórica',texto:'Perú clasificó vía repechaje CONMEBOL, demostrando carácter en los momentos decisivos.' },
  { emoji:'🏟️', titulo:'Grupos del Mundial',     texto:'Perú estará en el Grupo A o B de CONMEBOL. Sus partidos serán en EE.UU. o México. ¡Habrá hinchada!' },
  { emoji:'💪', titulo:'Generación con hambre',   texto:'Este equipo lleva años preparándose para este momento. La motivación es enorme.' },
  { emoji:'🎯', titulo:'Qué esperar',             texto:'Perú no viene a pasear. Con Cueva en un buen día y Lapadula en el área, pueden sorprender a cualquiera.' },
  { emoji:'📺', titulo:'El país se para',         texto:'Durante los partidos de Perú, Lima se vacía. Los clientes van a querer apostar — ¡prepárate!' },
]

const PERU_SPEECHES = [
  { id:'s1', texto:'¿Ya tiene su apuesta para el partido de Perú? TE APUESTO tiene todas las opciones — ganador, goles, jugador que marca. ¿Le armamos algo?' },
  { id:'s2', texto:'Señor, Perú juega hoy y las cuotas están muy buenas. Si quiere apostar por la bicolor, en TE APUESTO lo tiene todo en un clic.' },
  { id:'s3', texto:'¿Sabe que Perú vuelve al Mundial después de 44 años? ¡Es histórico! En TE APUESTO puede apostar a que Perú avanza a la siguiente ronda.' },
  { id:'s4', texto:'Para el partido de Perú, Lapadula es una opción interesante como goleador. Las cuotas están altas porque pocos lo esperan. ¿Qué piensa?' },
]

function TabPeru({ onTabChange }) {
  const [copied, setCopied] = useState(null)
  const [openJug, setOpenJug] = useState(null)

  async function copiar(texto, id) {
    try { await navigator.clipboard.writeText(texto) } catch {}
    setCopied(id); setTimeout(() => setCopied(null), 2500)
  }

  return (
    <div className="space-y-4 animate-fade-in">

      {/* Hero Perú */}
      <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-red-800 via-white/5 to-red-900 p-6 relative border border-red-500/30">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center text-[120px] select-none">🇵🇪</div>
        <div className="relative">
          <span className="text-6xl block mb-2">🇵🇪</span>
          <h2 className="text-2xl font-black text-white">¡Perú vuelve al Mundial!</h2>
          <p className="text-sm text-red-200 mt-1">44 años de espera terminaron · FIFA World Cup 2026</p>
          <div className="flex gap-3 mt-4 flex-wrap">
            {[['🏆','1 Copa','1975'],['⚽','Goleador','Guerrero'],['🌎','Sede','EE.UU./México'],['🔥','Clasificó','Repechaje']].map(([e,l,v]) => (
              <div key={l} className="bg-black/25 rounded-xl px-3 py-2 text-center">
                <p className="text-base">{e}</p>
                <p className="text-xs text-white/60">{l}</p>
                <p className="text-xs font-bold text-white">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Datos clave */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">📊 Lo que debes saber</p>
        <div className="grid grid-cols-1 gap-2">
          {PERU_DATOS.map((d, i) => (
            <div key={i} className="bg-brand-dark rounded-2xl p-4 border border-white/5 flex gap-3 items-start">
              <span className="text-2xl flex-shrink-0">{d.emoji}</span>
              <div>
                <p className="text-sm font-bold text-white">{d.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{d.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Jugadores clave */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">⚽ Jugadores a conocer</p>
        <div className="grid grid-cols-1 gap-2">
          {PERU_JUGADORES.map((j, i) => (
            <div key={i} className={`bg-brand-dark rounded-2xl border overflow-hidden transition-all ${openJug===i?'border-red-500/40':'border-white/5'}`}>
              <button onClick={() => setOpenJug(openJug===i?null:i)} className="w-full flex items-center gap-3 p-3 text-left">
                <span className="text-2xl flex-shrink-0">{j.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{j.nombre}</p>
                  <p className="text-xs text-gray-500">{j.pos}</p>
                </div>
                <span className={`text-gray-400 text-sm transition-transform ${openJug===i?'rotate-180':''}`}>▼</span>
              </button>
              {openJug === i && (
                <div className="px-4 pb-4 animate-fade-in">
                  <div className="bg-red-900/20 border border-red-500/20 rounded-xl p-3">
                    <p className="text-xs text-red-300 leading-relaxed">{j.dato}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Speeches para partidos de Perú */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">💬 Speeches para partidos de Perú</p>
        <div className="space-y-3">
          {PERU_SPEECHES.map(s => (
            <div key={s.id} className="bg-brand-dark rounded-2xl p-4 border border-red-500/20">
              <p className="text-sm text-gray-300 italic leading-relaxed mb-3">"{s.texto}"</p>
              <button onClick={() => copiar(s.texto, s.id)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  copied===s.id ? 'bg-green-500/20 text-green-400' : 'bg-brand-medium text-gray-400 hover:text-white'
                }`}>
                {copied===s.id ? '✅ ¡Copiado!' : '📋 Copiar speech'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA a trivia */}
      <div className="bg-gradient-to-r from-red-900/40 to-brand-orange/20 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
        <span className="text-4xl">🧠</span>
        <div className="flex-1">
          <p className="text-sm font-black text-white">¿Cuánto sabes de Perú en Mundiales?</p>
          <p className="text-xs text-gray-400 mt-0.5">Pon a prueba tu conocimiento de la historia peruana en Copas del Mundo</p>
        </div>
        <button onClick={() => onTabChange('trivia')} className="flex-shrink-0 px-3 py-2 bg-brand-orange rounded-xl text-xs font-black text-white">
          Jugar →
        </button>
      </div>

      <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          🛡️ Los partidos de Perú generan altísimo tráfico en apuestas. Prepara tus speeches con anticipación. · Juego responsable siempre.
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   NOTA OFICIAL
════════════════════════════════════════ */
function NotaOficial() {
  return (
    <div className="bg-brand-medium rounded-2xl p-3 border border-white/5">
      <p className="text-xs text-gray-500 text-center leading-relaxed">
        ℹ️ Información referencial basada en fuentes oficiales del Mundial 2026. Verificar actualizaciones de calendario, horarios y sedes en canales oficiales. · Última actualización: {data._nota.split('Última actualización: ')[1]}
      </p>
    </div>
  )
}
