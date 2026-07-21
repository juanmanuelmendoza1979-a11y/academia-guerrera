import { useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   CONFIGURACIÓN DEL MES — actualizar al inicio de cada mes
   ═══════════════════════════════════════════════════════════ */
const MES_ACTUAL = {
  mes: 'Julio',
  anio: 2026,
  emoji: '🏆',
  subtitulo: 'Copa Libertadores en Cuartos · Copa Sudamericana en Octavos · Liga 1 Clausura',
}

/* ─── COPA LIBERTADORES ─── */
const COPA_LIB = {
  nombre: 'CONMEBOL Copa Libertadores 2026',
  emoji: '🏆',
  color: 'from-yellow-900/60 to-amber-900/40',
  border: 'border-yellow-500/40',
  accentText: 'text-yellow-400',
  accentBg: 'bg-yellow-900/30 border-yellow-500/30',
  fase: 'Cuartos de Final',
  faseBadge: 'bg-yellow-600 text-white',
  descripcion: 'El torneo más importante del fútbol sudamericano. 32 clubes compiten desde enero. En julio llegan los Cuartos de Final — los 8 mejores equipos del continente definen quiénes van a semis.',
  formato: [
    { fase: 'Fase de Grupos', detalle: 'Enero – Abril · 32 equipos en 8 grupos', done: true },
    { fase: 'Octavos de Final', detalle: 'Mayo – Junio · 16 equipos · Ida y vuelta', done: true },
    { fase: 'Cuartos de Final', detalle: 'Julio – Agosto · 8 equipos · Ida y vuelta', done: false, actual: true },
    { fase: 'Semifinales', detalle: 'Septiembre – Octubre · 4 equipos', done: false },
    { fase: 'Final', detalle: 'Noviembre · 1 partido · Sede neutral', done: false },
  ],
  equiposPeruanos: [
    { nombre: 'Universitario de Deportes', escudo: '🔴⚪', dato: 'Fueron finalistas en 2023. Uno de los equipos más exitosos del Perú en Copa.' },
    { nombre: 'Alianza Lima', escudo: '⚫⚪', dato: 'Histórico club peruano con presencia regular en el torneo.' },
  ],
  datosRapidos: [
    { icono: '🥇', titulo: 'Más títulos', valor: 'Independiente — 7 títulos' },
    { icono: '🇦🇷', titulo: 'País dominante', valor: 'Argentina — 25 títulos totales' },
    { icono: '🏟️', titulo: 'Final 2026', valor: 'Sede por confirmar — Nov 2026' },
    { icono: '🌎', titulo: 'Confederación', valor: 'CONMEBOL — 10 países' },
  ],
  speechCliente: '¿Sabes que la Copa Libertadores ya está en Cuartos de Final? Los mejores 8 equipos de Sudamérica se enfrentan ahora. Es el torneo más importante de la región. En TE APUESTO puedes seguir tu equipo favorito. ¿Le echamos un vistazo a las opciones disponibles?',
  datoConversacion: 'La Copa Libertadores tiene más historia que la Champions de Europa: se juega desde 1960. Y con equipos de 10 países, es el torneo más competitivo del continente.',
}

/* ─── COPA SUDAMERICANA ─── */
const COPA_SUDA = {
  nombre: 'CONMEBOL Copa Sudamericana 2026',
  emoji: '🥈',
  color: 'from-blue-900/60 to-indigo-900/40',
  border: 'border-blue-500/40',
  accentText: 'text-blue-400',
  accentBg: 'bg-blue-900/30 border-blue-500/30',
  fase: 'Octavos de Final',
  faseBadge: 'bg-blue-600 text-white',
  descripcion: 'El segundo torneo internacional más importante de CONMEBOL. Participan clubes que no clasificaron a Libertadores más los terceros de grupo de la Copa Libertadores. En julio se juegan los Octavos de Final.',
  formato: [
    { fase: 'Fase de Grupos', detalle: 'Febrero – Junio · 32 equipos en 8 grupos', done: true },
    { fase: 'Octavos de Final', detalle: 'Julio · 16 equipos · Ida y vuelta', done: false, actual: true },
    { fase: 'Cuartos de Final', detalle: 'Agosto · 8 equipos', done: false },
    { fase: 'Semifinales', detalle: 'Septiembre – Octubre', done: false },
    { fase: 'Final', detalle: 'Noviembre · Sede neutral', done: false },
  ],
  equiposPeruanos: [
    { nombre: 'Sporting Cristal', escudo: '🔵', dato: 'Campeón más títulos en el Perú. Habitualmente present en competencias internacionales.' },
    { nombre: 'FBC Melgar', escudo: '🔴⚫', dato: 'Equipo de Arequipa con buena participación internacional en años recientes.' },
  ],
  datosRapidos: [
    { icono: '📅', titulo: 'Creación', valor: '2002 — torneo relativamente joven' },
    { icono: '🥇', titulo: 'Más títulos', valor: 'Independiente del Valle — 2' },
    { icono: '🏟️', titulo: 'Final 2026', valor: 'Sede por confirmar — Nov 2026' },
    { icono: '📋', titulo: 'Clasificación', valor: 'Equipos sin Copa Lib + 3.° de grupos Lib' },
  ],
  speechCliente: '¿Sabes que la Copa Sudamericana también está en acción? Es el segundo torneo más importante de Sudamérica. Hay equipos peruanos en competencia. En TE APUESTO puedes estar al tanto de todos los partidos.',
  datoConversacion: 'Muchos clubes importantes ganan la Copa Sudamericana primero y después llegan a la Libertadores. Es el trampolín del fútbol sudamericano.',
}

/* ─── LIGA 1 PERU ─── */
const LIGA1 = {
  nombre: 'Liga 1 Te Apuesto — Clausura 2026',
  emoji: '🇵🇪',
  color: 'from-red-900/60 to-rose-900/40',
  border: 'border-red-500/40',
  accentText: 'text-red-400',
  accentBg: 'bg-red-900/30 border-red-500/30',
  fase: 'Apertura — Jornadas finales',
  faseBadge: 'bg-red-600 text-white',
  descripcion: 'El campeonato peruano de fútbol profesional patrocinado por TE APUESTO. Se divide en Torneo Apertura y Clausura. En julio estamos en las jornadas finales del Apertura, con los equipos definiendo clasificaciones.',
  formato: [
    { fase: 'Torneo Apertura', detalle: 'Febrero – Julio · 18 equipos · Todos contra todos', done: false, actual: true },
    { fase: 'Torneo Clausura', detalle: 'Agosto – Diciembre · Misma estructura', done: false },
    { fase: 'Play-Off Final', detalle: 'Diciembre · Campeón Apertura vs Campeón Clausura', done: false },
    { fase: 'Descenso', detalle: 'Tabla acumulada anual · 2 equipos descienden', done: false },
  ],
  equiposDestacados: [
    { nombre: 'Universitario de Deportes', ciudad: 'Lima', escudo: '🔴⚪', hinchada: 'Los Cremas' },
    { nombre: 'Alianza Lima', ciudad: 'Lima', escudo: '⚫⚪', hinchada: 'La Victoria' },
    { nombre: 'Sporting Cristal', ciudad: 'Lima', escudo: '🔵', hinchada: 'Los Rimenses' },
    { nombre: 'FBC Melgar', ciudad: 'Arequipa', escudo: '🔴⚫', hinchada: 'El Dominó' },
    { nombre: 'Cienciano del Cusco', ciudad: 'Cusco', escudo: '🔴🟡', hinchada: 'La Gloria Imperial' },
    { nombre: 'Municipalidad de Lima', ciudad: 'Lima', escudo: '🟡', hinchada: 'El Equipo del Pueblo' },
  ],
  datosRapidos: [
    { icono: '📅', titulo: 'Jornadas', valor: '17 jornadas en el Apertura' },
    { icono: '⚽', titulo: 'Equipos', valor: '18 equipos en Primera División' },
    { icono: '🏟️', titulo: 'Estadio principal', valor: 'Estadio Nacional — Lima' },
    { icono: '📺', titulo: 'Transmisión', valor: 'L1 MAX y señal abierta' },
  ],
  speechCliente: 'Señor/a, ¿sabe que TE APUESTO es el patrocinador oficial de la Liga 1? Tenemos todos los partidos del campeonato peruano disponibles. ¿Tiene algún equipo favorito? Le puedo mostrar las opciones que tenemos para los partidos de esta semana.',
  datoConversacion: 'TE APUESTO es el nombre oficial del campeonato peruano — "Liga 1 Te Apuesto". ¡Somos parte del fútbol peruano! Eso es un argumento de peso con cualquier cliente hincha.',
}

/* ─── OTRAS LIGAS DE JULIO ─── */
const OTRAS_LIGAS = [
  {
    nombre: 'MLS — Major League Soccer',
    pais: '🇺🇸 Estados Unidos y Canadá',
    emoji: '⚽',
    fase: 'Temporada regular',
    detalle: 'La liga norteamericana juega de febrero a octubre. Julio es la mitad de la temporada, con las posiciones de playoffs tomando forma.',
    dato: 'Tiene 29 equipos activos. Jugadores como Messi (Inter Miami) han elevado el nivel e interés global.',
  },
  {
    nombre: 'Liga MX — Apertura 2026',
    pais: '🇲🇽 México',
    emoji: '🦅',
    fase: 'Inicio del Apertura',
    detalle: 'El torneo mexicano inicia su Apertura en julio. Equipos como América, Chivas, Cruz Azul y Tigres abren la temporada.',
    dato: 'La Liga MX tiene una de las mayores audiencias de fútbol en América Latina. Muy popular para apuestas.',
  },
  {
    nombre: 'Ligas Europeas — Pretemporada',
    pais: '🌍 Europa',
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    fase: 'Pretemporada / verano',
    detalle: 'Premier League, La Liga, Serie A y Bundesliga están en vacaciones o pretemporada en julio. La acción regresa en agosto.',
    dato: 'Importante informarle al cliente que las ligas europeas reinician en agosto. En agosto tenemos toda la acción de Premier, La Liga, Serie A y Bundesliga.',
  },
]

/* ─── TRIVIA DEL MES ─── */
const TRIVIA_PREGUNTAS = [
  {
    id: 'q1',
    pregunta: '¿Cuántos títulos de Copa Libertadores tiene el club Independiente de Argentina?',
    opciones: ['5', '6', '7', '8'],
    correcta: 2,
    explicacion: 'Independiente de Argentina es el club más ganador de la Copa Libertadores con 7 títulos (1964-1984). Por eso se le llama "El Rey de Copas".',
    puntos: 10,
  },
  {
    id: 'q2',
    pregunta: '¿Desde qué año se juega la Copa Libertadores?',
    opciones: ['1955', '1960', '1965', '1970'],
    correcta: 1,
    explicacion: 'La Copa Libertadores se juega desde 1960. La primera edición la ganó Peñarol de Uruguay. Tiene más de 60 años de historia.',
    puntos: 10,
  },
  {
    id: 'q3',
    pregunta: '¿Cómo se llama oficialmente el campeonato peruano de fútbol?',
    opciones: ['Liga Peruana de Fútbol', 'Liga 1 Te Apuesto', 'Primera División Peru', 'Campeonato Nacional'],
    correcta: 1,
    explicacion: '¡Correcto! El campeonato peruano se llama "Liga 1 Te Apuesto" porque TE APUESTO es el patrocinador titular. ¡Somos parte del fútbol peruano!',
    puntos: 10,
  },
  {
    id: 'q4',
    pregunta: '¿Cuántos países participan en la CONMEBOL (que organiza la Copa Libertadores)?',
    opciones: ['8', '10', '12', '14'],
    correcta: 1,
    explicacion: 'CONMEBOL agrupa a 10 países: Argentina, Bolivia, Brasil, Chile, Colombia, Ecuador, Paraguay, Perú, Uruguay y Venezuela.',
    puntos: 10,
  },
  {
    id: 'q5',
    pregunta: '¿Qué equipo peruano llegó a la final de la Copa Libertadores en 2023?',
    opciones: ['Alianza Lima', 'Sporting Cristal', 'Universitario de Deportes', 'FBC Melgar'],
    correcta: 2,
    explicacion: 'Universitario de Deportes llegó a la final de la Copa Libertadores 2023, un hito histórico para el fútbol peruano. Perdieron ante Fluminense de Brasil.',
    puntos: 15,
  },
]

/* ─── TABS ─── */
const TABS = [
  { id: 'inicio',    icon: '🏠', label: 'Inicio' },
  { id: 'libertad',  icon: '🏆', label: 'Copa Lib' },
  { id: 'suda',      icon: '🥈', label: 'Copa Suda' },
  { id: 'liga1',     icon: '🇵🇪', label: 'Liga 1' },
  { id: 'otras',     icon: '🌐', label: 'Más Ligas' },
  { id: 'trivia',    icon: '🧠', label: 'Trivia' },
]

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function EventoDelMes({ onUpdatePoints }) {
  const [tab, setTab] = useState('inicio')

  return (
    <div className="pb-24 animate-fade-in overflow-x-hidden w-full">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-orange/30 via-brand-dark to-brand-black px-5 py-7 border-b border-brand-orange/20">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">
            📅 Evento del Mes
          </p>
          <h1 className="text-2xl font-black text-white leading-tight">
            {MES_ACTUAL.emoji} {MES_ACTUAL.mes} {MES_ACTUAL.anio}
          </h1>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">{MES_ACTUAL.subtitulo}</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { color: 'bg-yellow-600', texto: '🏆 Copa Libertadores' },
              { color: 'bg-blue-600',   texto: '🥈 Copa Sudamericana' },
              { color: 'bg-red-600',    texto: '🇵🇪 Liga 1 Perú' },
            ].map(b => (
              <span key={b.texto} className={`text-[10px] font-black text-white px-2.5 py-1 rounded-full ${b.color}`}>
                {b.texto}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs scrollables */}
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
        {tab === 'inicio'   && <TabInicio onTabChange={setTab} />}
        {tab === 'libertad' && <TabCompetencia data={COPA_LIB} tipo="lib" />}
        {tab === 'suda'     && <TabCompetencia data={COPA_SUDA} tipo="suda" />}
        {tab === 'liga1'    && <TabLiga1 />}
        {tab === 'otras'    && <TabOtrasLigas />}
        {tab === 'trivia'   && <TabTrivia onPoints={onUpdatePoints} />}
        <NotaOficial />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   TAB: INICIO
   ═══════════════════════════════════════════ */
function TabInicio({ onTabChange }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Aviso guerrera */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-brand-orange/20">
        <p className="text-xs font-bold text-brand-orange mb-1">💡 Guerrera, ten en cuenta</p>
        <p className="text-sm text-gray-300 leading-relaxed">
          Este módulo se actualiza cada mes con los torneos y competencias más importantes.
          Úsalo para conversar con el cliente sobre lo que está pasando en el fútbol ahora mismo.
        </p>
      </div>

      {/* Acceso rápido */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">⚡ Competencias del mes</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { tab:'libertad', emoji:'🏆', titulo:'Copa Libertadores', sub:'Cuartos de Final · 8 equipos', color:'from-yellow-900/60 to-amber-900/40', border:'border-yellow-500/40' },
            { tab:'suda',     emoji:'🥈', titulo:'Copa Sudamericana', sub:'Octavos de Final · 16 equipos', color:'from-blue-900/60 to-indigo-900/40', border:'border-blue-500/40' },
            { tab:'liga1',    emoji:'🇵🇪', titulo:'Liga 1 Perú',      sub:'Apertura · Jornadas finales', color:'from-red-900/60 to-rose-900/40', border:'border-red-500/40' },
            { tab:'trivia',   emoji:'🧠', titulo:'Trivia del Mes',    sub:'Gana puntos · Aprende jugando', color:'from-purple-900/60 to-pink-900/40', border:'border-purple-500/40' },
          ].map(item => (
            <button key={item.tab} onClick={() => onTabChange(item.tab)}
              className={`rounded-2xl p-3 text-left bg-gradient-to-br ${item.color} border ${item.border} hover:scale-[1.02] active:scale-95 transition-all`}>
              <span className="text-3xl block mb-1">{item.emoji}</span>
              <p className="text-xs font-black text-white leading-tight">{item.titulo}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Resumen de la semana */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">📋 Resumen de julio</p>
        <div className="space-y-3">
          {[
            { emoji:'🏆', comp:'Copa Libertadores', estado:'Cuartos de Final', detalle:'Los 8 mejores clubes de Sudamérica — ida y vuelta', color:'text-yellow-400' },
            { emoji:'🥈', comp:'Copa Sudamericana', estado:'Octavos de Final', detalle:'16 equipos compiten por el segundo trofeo del continente', color:'text-blue-400' },
            { emoji:'🇵🇪', comp:'Liga 1 Perú',      estado:'Apertura — recta final', detalle:'Los equipos peruanos definen posiciones del Apertura', color:'text-red-400' },
            { emoji:'🦅', comp:'Liga MX Apertura',  estado:'Inicio de temporada', detalle:'El fútbol mexicano arranca su Apertura 2026', color:'text-green-400' },
          ].map(item => (
            <div key={item.comp} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-white">{item.comp}</p>
                  <span className={`text-[10px] font-black ${item.color} bg-white/5 px-2 py-0.5 rounded-full`}>{item.estado}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speech del mes */}
      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-orange mb-2">💬 Speech para julio</p>
        <p className="text-sm text-gray-300 leading-relaxed italic">
          "Señor/a, julio es un mes lleno de fútbol. Hay Copa Libertadores en Cuartos de Final, Copa Sudamericana en Octavos, y la Liga 1 peruana en su recta final. En TE APUESTO tenemos todos estos torneos disponibles. ¿Le cuento sobre las opciones?"
        </p>
      </div>

      {/* Dato motivacional */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-500/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-purple-400 mb-2">⭐ Dato que llama la atención</p>
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="text-white font-bold">TE APUESTO es el patrocinador oficial de la Liga 1 peruana.</span>{' '}
          Cuando el cliente ve el partido en TV y escucha "Liga 1 TE APUESTO", reconoce nuestra marca.
          Úsalo como argumento: "Nos verá en cada partido del campeonato peruano."
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   TAB: COMPETENCIA (Copa Lib / Copa Suda)
   ═══════════════════════════════════════════ */
function TabCompetencia({ data, tipo }) {
  const [copied, setCopied] = useState(false)

  async function copiarSpeech() {
    try { await navigator.clipboard.writeText(data.speechCliente) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className={`bg-gradient-to-r ${data.color} border ${data.border} rounded-2xl p-4`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{data.emoji}</span>
          <p className="text-sm font-black text-white">{data.nombre}</p>
          <span className={`ml-auto text-[10px] font-black text-white px-2 py-0.5 rounded-full ${data.faseBadge}`}>
            {data.fase}
          </span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed mt-1">{data.descripcion}</p>
      </div>

      {/* Formato del torneo */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🗺️ Formato del torneo</p>
        <div className="space-y-2">
          {data.formato.map((f, i) => (
            <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${
              f.actual
                ? `${data.accentBg}`
                : f.done
                  ? 'bg-white/[0.03] border-white/5 opacity-60'
                  : 'bg-white/[0.02] border-white/5'
            }`}>
              <span className="flex-shrink-0 mt-0.5">
                {f.done ? '✅' : f.actual ? '▶️' : '⏳'}
              </span>
              <div>
                <p className={`text-xs font-bold ${f.actual ? data.accentText : f.done ? 'text-gray-500' : 'text-gray-300'}`}>
                  {f.fase}
                  {f.actual && <span className="ml-2 text-[9px] font-black bg-brand-orange text-white px-1.5 rounded-full">AHORA</span>}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{f.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipos peruanos */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🇵🇪 Equipos peruanos en el torneo</p>
        <div className="space-y-2">
          {data.equiposPeruanos.map(e => (
            <div key={e.nombre} className="bg-brand-medium/50 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{e.escudo}</span>
              <div>
                <p className="text-sm font-bold text-white">{e.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{e.dato}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Datos rápidos */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">💡 Datos rápidos</p>
        <div className="grid grid-cols-2 gap-2">
          {data.datosRapidos.map(d => (
            <div key={d.titulo} className="bg-brand-dark rounded-xl p-3 border border-white/5">
              <p className="text-xl mb-1">{d.icono}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{d.titulo}</p>
              <p className="text-xs font-bold text-white mt-0.5 leading-tight">{d.valor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dato de conversación */}
      <div className={`${data.accentBg} border rounded-2xl p-4`}>
        <p className={`text-xs font-bold ${data.accentText} mb-2`}>🔥 Dato para la conversación</p>
        <p className="text-sm text-gray-300 leading-relaxed">{data.datoConversacion}</p>
      </div>

      {/* Speech para cliente */}
      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-brand-orange">💬 Ofrécelo así al cliente:</p>
          <button onClick={copiarSpeech}
            className="text-xs text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-1">
            {copied ? '✅ Copiado' : '📋 Copiar'}
          </button>
        </div>
        <p className="text-sm text-white font-bold italic leading-relaxed">"{data.speechCliente}"</p>
        <div className="mt-3 bg-brand-medium/30 rounded-xl px-3 py-2">
          <p className="text-[10px] text-gray-500">
            🔐 Recuerda: nunca garantices resultados. Orienta al cliente con información, no con predicciones.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   TAB: LIGA 1 PERU
   ═══════════════════════════════════════════ */
function TabLiga1() {
  const [copied, setCopied] = useState(false)
  const [openEquipo, setOpenEquipo] = useState(null)

  async function copiarSpeech() {
    try { await navigator.clipboard.writeText(LIGA1.speechCliente) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900/60 to-rose-900/40 border border-red-500/40 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-2xl">🇵🇪</span>
          <p className="text-sm font-black text-white">{LIGA1.nombre}</p>
          <span className="text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded-full ml-auto">
            {LIGA1.fase}
          </span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed mt-1">{LIGA1.descripcion}</p>
      </div>

      {/* Argumento estrella */}
      <div className="bg-gradient-to-r from-brand-orange/20 to-brand-yellow/10 border border-brand-orange/40 rounded-2xl p-4">
        <p className="text-xs font-black text-brand-orange uppercase tracking-wider mb-1">⭐ Tu argumento más poderoso</p>
        <p className="text-sm text-white font-bold leading-relaxed">
          "El campeonato peruano se llama <span className="text-brand-orange">Liga 1 TE APUESTO</span>. Somos el patrocinador oficial. Cuando el cliente ve fútbol peruano en TV, escucha nuestro nombre."
        </p>
      </div>

      {/* Formato */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🗺️ Estructura del torneo</p>
        <div className="space-y-2">
          {LIGA1.formato.map((f, i) => (
            <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${
              f.actual
                ? 'bg-red-900/30 border-red-500/30'
                : 'bg-white/[0.02] border-white/5'
            }`}>
              <span className="flex-shrink-0 mt-0.5">
                {f.actual ? '▶️' : '⏳'}
              </span>
              <div>
                <p className={`text-xs font-bold ${f.actual ? 'text-red-400' : 'text-gray-400'}`}>
                  {f.fase}
                  {f.actual && <span className="ml-2 text-[9px] font-black bg-brand-orange text-white px-1.5 rounded-full">AHORA</span>}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{f.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Equipos destacados */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">⚽ Equipos destacados</p>
        <div className="grid grid-cols-2 gap-2">
          {LIGA1.equiposDestacados.map(e => (
            <button key={e.nombre}
              onClick={() => setOpenEquipo(openEquipo === e.nombre ? null : e.nombre)}
              className="bg-brand-medium/50 rounded-xl px-3 py-2.5 text-left border border-white/5 hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-lg">{e.escudo}</span>
                <p className="text-xs font-bold text-white leading-tight">{e.nombre}</p>
              </div>
              <p className="text-[10px] text-gray-500">{e.ciudad}</p>
              {openEquipo === e.nombre && (
                <p className="text-[10px] text-red-400 mt-1 font-semibold">Hinchada: {e.hinchada}</p>
              )}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-2 text-center">Toca un equipo para ver su hinchada</p>
      </div>

      {/* Datos rápidos */}
      <div className="grid grid-cols-2 gap-2">
        {LIGA1.datosRapidos.map(d => (
          <div key={d.titulo} className="bg-brand-dark rounded-xl p-3 border border-white/5">
            <p className="text-xl mb-1">{d.icono}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{d.titulo}</p>
            <p className="text-xs font-bold text-white mt-0.5 leading-tight">{d.valor}</p>
          </div>
        ))}
      </div>

      {/* Speech */}
      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-brand-orange">💬 Ofrécelo así al cliente:</p>
          <button onClick={copiarSpeech}
            className="text-xs text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-1">
            {copied ? '✅ Copiado' : '📋 Copiar'}
          </button>
        </div>
        <p className="text-sm text-white font-bold italic leading-relaxed">"{LIGA1.speechCliente}"</p>
      </div>

      {/* Dato conversación */}
      <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-red-400 mb-2">🔥 Dato que siempre funciona</p>
        <p className="text-sm text-gray-300 leading-relaxed">{LIGA1.datoConversacion}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   TAB: OTRAS LIGAS
   ═══════════════════════════════════════════ */
function TabOtrasLigas() {
  const [open, setOpen] = useState(null)
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">🌐 Otras ligas en julio</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Conoce el estado de las demás competencias para tener una conversación completa con cualquier cliente.
        </p>
      </div>

      <div className="space-y-3">
        {OTRAS_LIGAS.map(liga => (
          <div key={liga.nombre} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setOpen(open === liga.nombre ? null : liga.nombre)}
              className="w-full text-left p-4 flex items-center gap-3">
              <span className="text-3xl">{liga.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{liga.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{liga.pais}</span>
                  <span className="text-[10px] bg-brand-medium text-gray-400 px-2 py-0.5 rounded-full">{liga.fase}</span>
                </div>
              </div>
              <span className={`text-gray-400 transition-transform flex-shrink-0 text-sm ${open === liga.nombre ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open === liga.nombre && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-fade-in">
                <p className="text-xs text-gray-300 leading-relaxed">{liga.detalle}</p>
                <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3">
                  <p className="text-xs font-bold text-brand-orange mb-1">💡 Dato útil</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{liga.dato}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-brand-orange/20 to-brand-yellow/10 border border-brand-orange/30 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-orange mb-2">📅 ¿Cuándo regresan las ligas europeas?</p>
        <div className="space-y-1.5">
          {[
            ['🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Premier League', 'Agosto 2026'],
            ['🇪🇸', 'La Liga',       'Agosto 2026'],
            ['🇮🇹', 'Serie A',        'Agosto 2026'],
            ['🇩🇪', 'Bundesliga',    'Agosto 2026'],
            ['🇫🇷', 'Ligue 1',        'Agosto 2026'],
          ].map(([flag, liga, fecha]) => (
            <div key={liga} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{flag}</span>
                <span className="text-sm text-white font-medium">{liga}</span>
              </div>
              <span className="text-xs text-gray-500">{fecha}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
          Informa al cliente que en agosto tenemos todas las ligas europeas disponibles. Es un argumento de cierre para los amantes del fútbol europeo.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   TAB: TRIVIA
   ═══════════════════════════════════════════ */
function TabTrivia({ onPoints }) {
  const [idx, setIdx]           = useState(0)
  const [seleccion, setSelec]   = useState(null)
  const [mostrarRes, setMostrar] = useState(false)
  const [puntosGanados, setPuntos] = useState(0)
  const [terminado, setTerminado] = useState(false)

  const pregunta = TRIVIA_PREGUNTAS[idx]

  function elegir(i) {
    if (mostrarRes) return
    setSelec(i)
    setMostrar(true)
    if (i === pregunta.correcta) {
      const pts = pregunta.puntos
      setPuntos(prev => prev + pts)
      if (onPoints) onPoints(pts)
    }
  }

  function siguiente() {
    if (idx + 1 >= TRIVIA_PREGUNTAS.length) {
      setTerminado(true)
    } else {
      setIdx(i => i + 1)
      setSelec(null)
      setMostrar(false)
    }
  }

  function reiniciar() {
    setIdx(0); setSelec(null); setMostrar(false); setPuntos(0); setTerminado(false)
  }

  if (terminado) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="text-center py-6">
          <p className="text-6xl mb-3">🏆</p>
          <h2 className="text-2xl font-black text-white mb-1">¡Trivia completada!</h2>
          <p className="text-sm text-gray-400">Respondiste {TRIVIA_PREGUNTAS.length} preguntas sobre los eventos de julio</p>
          <div className="mt-4 bg-brand-orange/10 border border-brand-orange/30 rounded-2xl px-6 py-4">
            <p className="text-3xl font-black text-brand-orange">+{puntosGanados} pts</p>
            <p className="text-xs text-gray-400 mt-1">Puntos ganados esta sesión</p>
          </div>
        </div>
        <button onClick={reiniciar}
          className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-brand-orange/90 transition-all active:scale-95">
          Jugar de nuevo →
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header trivia */}
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/20 border border-purple-500/20 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">🧠 Trivia del Mes</p>
            <p className="text-sm text-white font-bold mt-0.5">Pregunta {idx + 1} de {TRIVIA_PREGUNTAS.length}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-brand-orange">+{puntosGanados}</p>
            <p className="text-[10px] text-gray-500">pts ganados</p>
          </div>
        </div>
        <div className="mt-3 w-full bg-brand-medium rounded-full h-1.5">
          <div className="h-1.5 bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((idx) / TRIVIA_PREGUNTAS.length) * 100}%` }} />
        </div>
      </div>

      {/* Pregunta */}
      <div className="bg-brand-dark rounded-2xl p-5 border border-white/5">
        <p className="text-base font-black text-white leading-relaxed">{pregunta.pregunta}</p>
        <div className="mt-4 space-y-2">
          {pregunta.opciones.map((op, i) => {
            const esCorrecta = i === pregunta.correcta
            const esSeleccionada = i === seleccion
            let cls = 'bg-brand-medium border-white/10 text-gray-300'
            if (mostrarRes) {
              if (esCorrecta) cls = 'bg-green-800/60 border-green-500/60 text-white'
              else if (esSeleccionada) cls = 'bg-red-800/60 border-red-500/60 text-white'
              else cls = 'bg-brand-medium/50 border-white/5 text-gray-500 opacity-60'
            } else if (esSeleccionada) {
              cls = 'bg-brand-orange/20 border-brand-orange/50 text-white'
            }
            return (
              <button key={i} onClick={() => elegir(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${cls} ${!mostrarRes ? 'hover:border-brand-orange/40 active:scale-[0.99]' : ''}`}>
                <span className="font-black mr-2">{['A','B','C','D'][i]}.</span>{op}
                {mostrarRes && esCorrecta && <span className="float-right">✅</span>}
                {mostrarRes && esSeleccionada && !esCorrecta && <span className="float-right">❌</span>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Resultado + explicación */}
      {mostrarRes && (
        <div className={`rounded-2xl p-4 border ${seleccion === pregunta.correcta ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'}`}>
          <p className={`text-sm font-black mb-2 ${seleccion === pregunta.correcta ? 'text-green-400' : 'text-red-400'}`}>
            {seleccion === pregunta.correcta ? `✅ ¡Correcto! +${pregunta.puntos} puntos` : '❌ No era esa'}
          </p>
          <p className="text-xs text-gray-300 leading-relaxed">{pregunta.explicacion}</p>
        </div>
      )}

      {mostrarRes && (
        <button onClick={siguiente}
          className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-brand-orange/90 transition-all active:scale-95">
          {idx + 1 >= TRIVIA_PREGUNTAS.length ? 'Ver resultados 🏆' : 'Siguiente pregunta →'}
        </button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════
   NOTA OFICIAL (compliance)
   ═══════════════════════════════════════════ */
function NotaOficial() {
  return (
    <div className="bg-brand-dark rounded-2xl p-4 border border-white/5 mt-2">
      <p className="text-[10px] text-gray-600 leading-relaxed text-center">
        📋 Contenido interno para capacitación de personal autorizado adulto.{' '}
        La información de torneos es educativa y de contexto. No garantices resultados.{' '}
        Orienta siempre con responsabilidad. · TE APUESTO · Academia Guerrera
      </p>
    </div>
  )
}
