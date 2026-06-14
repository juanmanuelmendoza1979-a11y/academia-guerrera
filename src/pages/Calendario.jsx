import { useState, useEffect, useCallback } from 'react'

const API_KEY = '3929240369'

// ─── Traducción de selecciones nacionales (API en inglés → español) ──────────
const NOMBRES_ES = {
  // Mundial 2026
  'Mexico': 'México', 'South Korea': 'Corea del Sur', 'Czech Republic': 'Rep. Checa',
  'South Africa': 'Sudáfrica', 'Switzerland': 'Suiza', 'Canada': 'Canadá',
  'Qatar': 'Catar', 'Bosnia-Herzegovina': 'Bosnia-Herzegovina',
  'Scotland': 'Escocia', 'Morocco': 'Marruecos', 'Brazil': 'Brasil', 'Haiti': 'Haití',
  'USA': 'Estados Unidos', 'Australia': 'Australia', 'Turkey': 'Turquía',
  'Paraguay': 'Paraguay', 'Germany': 'Alemania', 'Curaçao': 'Curazao',
  'Ivory Coast': "Costa de Marfil", 'Ecuador': 'Ecuador',
  'Netherlands': 'Países Bajos', 'Japan': 'Japón', 'Sweden': 'Suecia',
  'Tunisia': 'Túnez', 'Belgium': 'Bélgica', 'Egypt': 'Egipto', 'Iran': 'Irán',
  'New Zealand': 'Nueva Zelanda', 'Spain': 'España', 'Cape Verde': 'Cabo Verde',
  'Saudi Arabia': 'Arabia Saudita', 'Uruguay': 'Uruguay', 'France': 'Francia',
  'Senegal': 'Senegal', 'Iraq': 'Irak', 'Norway': 'Noruega', 'Argentina': 'Argentina',
  'Algeria': 'Argelia', 'Austria': 'Austria', 'Jordan': 'Jordania',
  'Portugal': 'Portugal', 'DR Congo': 'Rep. Dem. Congo', 'Uzbekistan': 'Uzbekistán',
  'Colombia': 'Colombia', 'England': 'Inglaterra', 'Croatia': 'Croacia',
  'Ghana': 'Ghana', 'Panama': 'Panamá',
  // Selecciones frecuentes en amistosos / clasificatorias
  'Italy': 'Italia', 'Netherlands': 'Países Bajos', 'Poland': 'Polonia',
  'Serbia': 'Serbia', 'Romania': 'Rumanía', 'Ukraine': 'Ucrania',
  'Greece': 'Grecia', 'Hungary': 'Hungría', 'Denmark': 'Dinamarca',
  'Finland': 'Finlandia', 'Slovakia': 'Eslovaquia', 'Slovenia': 'Eslovenia',
  'Albania': 'Albania', 'Iceland': 'Islandia', 'Wales': 'Gales',
  'Northern Ireland': 'Irlanda del Norte', 'Ireland': 'Irlanda',
  'Russia': 'Rusia', 'Belarus': 'Bielorrusia', 'Kosovo': 'Kosovo',
  'Chile': 'Chile', 'Bolivia': 'Bolivia', 'Venezuela': 'Venezuela',
  'Peru': 'Perú', 'Costa Rica': 'Costa Rica', 'Honduras': 'Honduras',
  'El Salvador': 'El Salvador', 'Guatemala': 'Guatemala', 'Jamaica': 'Jamaica',
  'Trinidad and Tobago': 'Trinidad y Tobago', 'Cuba': 'Cuba',
  'Nigeria': 'Nigeria', 'Cameroon': 'Camerún', 'Ivory Coast': 'Costa de Marfil',
  'Mali': 'Malí', 'Burkina Faso': 'Burkina Faso', 'Guinea': 'Guinea',
  'Tanzania': 'Tanzania', 'Uganda': 'Uganda', 'Kenya': 'Kenia',
  'Ethiopia': 'Etiopía', 'Angola': 'Angola', 'Zambia': 'Zambia',
  'Zimbabwe': 'Zimbabue', 'Mozambique': 'Mozambique',
  'China': 'China', 'India': 'India', 'Indonesia': 'Indonesia',
  'Thailand': 'Tailandia', 'Vietnam': 'Vietnam', 'Malaysia': 'Malasia',
  'Philippines': 'Filipinas', 'Singapore': 'Singapur', 'Myanmar': 'Myanmar',
  'Bahrain': 'Baréin', 'Kuwait': 'Kuwait', 'Oman': 'Omán', 'UAE': 'Emiratos Árabes',
  'United Arab Emirates': 'Emiratos Árabes', 'Lebanon': 'Líbano', 'Syria': 'Siria',
  'Palestine': 'Palestina', 'Yemen': 'Yemen',
  'New Caledonia': 'Nueva Caledonia', 'Fiji': 'Fiyi', 'Tahiti': 'Tahití',
}
// Devuelve el nombre en español si existe, si no el original
const tn = name => NOMBRES_ES[name] || name

// ─── Ligas autorizadas — nombres exactos del API + variantes conocidas ────────
// El API puede devolver distintos nombres según la temporada o la fuente.
// Incluimos TODAS las variantes confirmadas para no perder ninguna liga.
const LIGAS_PERMITIDAS = new Set([
  // 🇧🇷 Brasileirão
  'brasileirão série a',
  'brazilian serie a',
  'brasileirao serie a',

  // 🇩🇪 Bundesliga
  'german bundesliga',
  'bundesliga',

  // 🌎 Copa Libertadores
  'copa libertadores',
  'conmebol libertadores',

  // 🌎 Copa Sudamericana
  'copa sudamericana',
  'conmebol sudamericana',

  // 🏆 Champions League Masculina
  'uefa champions league',

  // 🏆 Champions League Femenina
  "uefa women's champions league",
  'uefa womens champions league',

  // 🇦🇷 Copa Argentina
  'copa argentina',

  // 🇨🇴 Copa Colombia (Copa BetPlay)
  'copa colombia',
  'copa betplay dimayor',
  'copa betplay',

  // 🇮🇹 Copa Italia
  'coppa italia',

  // 🇧🇷 Copa de Brasil
  'copa do brasil',

  // 🇫🇷 Copa de Francia
  'coupe de france',

  // 🇪🇸 Copa del Rey
  'copa del rey',

  // 🌍 Eliminatorias UEFA / Nations League
  'uefa european championship qualifiers',
  'world cup qualifying uefa',
  'uefa nations league',
  'uefa euro qualifiers',

  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 FA Cup
  'the emirates fa cup',
  'the fa cup',
  'fa cup',

  // 🇪🇸 LaLiga
  'spanish la liga',

  // 🇵🇪 Liga 1 Perú
  'liga 1 peru',
  'peruvian primera division',
  'liga 1',

  // 🇲🇽 Liga MX
  'mexican liga mx',
  'mexican primera league',
  'mexican primera division tournament',
  'liga mx',

  // 🇫🇷 Ligue 1
  'french ligue 1',

  // 🇺🇸 MLS
  'american major league soccer',
  'major league soccer',

  // 🌍 FIFA World Cup 2026
  'fifa world cup 2026',
  'fifa world cup',

  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
  'english premier league',

  // 🌍 UEFA Europa League
  'uefa europa league',

  // 🇮🇹 Serie A
  'italian serie a',

  // 🌍 Amistosos Internacionales
  'fifa international friendlies',
  'international friendlies',
  'international friendly',
])

function esLigaPermitida(strLeague) {
  if (!strLeague) return false
  return LIGAS_PERMITIDAS.has(strLeague.toLowerCase().trim())
}

// ─── Categorías por liga ─────────────────────────────────────────────────────
const CATEGORIA_LIGA = {
  // 🌎 AMERICA
  'brasileirão série a':               'AMERICA',
  'brazilian serie a':                 'AMERICA',
  'brasileirao serie a':               'AMERICA',
  'copa libertadores':                 'AMERICA',
  'conmebol libertadores':             'AMERICA',
  'copa sudamericana':                 'AMERICA',
  'conmebol sudamericana':             'AMERICA',
  'copa argentina':                    'AMERICA',
  'copa colombia':                     'AMERICA',
  'copa betplay dimayor':              'AMERICA',
  'copa betplay':                      'AMERICA',
  'copa do brasil':                    'AMERICA',
  'liga 1 peru':                       'AMERICA',
  'peruvian primera division':         'AMERICA',
  'liga 1':                            'AMERICA',
  'mexican liga mx':                   'AMERICA',
  'mexican primera league':            'AMERICA',
  'mexican primera division tournament':'AMERICA',
  'liga mx':                           'AMERICA',
  'american major league soccer':      'AMERICA',
  'major league soccer':               'AMERICA',

  // 🇪🇺 EUROPA - LIGAS
  'german bundesliga':                 'EUROPA_LIGAS',
  'bundesliga':                        'EUROPA_LIGAS',
  'spanish la liga':                   'EUROPA_LIGAS',
  'french ligue 1':                    'EUROPA_LIGAS',
  'english premier league':            'EUROPA_LIGAS',
  'italian serie a':                   'EUROPA_LIGAS',

  // 🏆 EUROPA COPAS
  'uefa champions league':             'EUROPA_COPAS',
  "uefa women's champions league":     'EUROPA_COPAS',
  'uefa womens champions league':      'EUROPA_COPAS',
  'uefa europa league':                'EUROPA_COPAS',
  'coupe de france':                   'EUROPA_COPAS',
  'copa del rey':                      'EUROPA_COPAS',
  'coppa italia':                      'EUROPA_COPAS',
  'the emirates fa cup':               'EUROPA_COPAS',
  'the fa cup':                        'EUROPA_COPAS',
  'fa cup':                            'EUROPA_COPAS',

  // 🌍 INTERNACIONALES
  'uefa european championship qualifiers': 'INTERNACIONALES',
  'world cup qualifying uefa':         'INTERNACIONALES',
  'uefa nations league':               'INTERNACIONALES',
  'uefa euro qualifiers':              'INTERNACIONALES',
  'fifa world cup 2026':               'INTERNACIONALES',
  'fifa world cup':                    'INTERNACIONALES',
  'fifa international friendlies':     'INTERNACIONALES',
  'international friendlies':          'INTERNACIONALES',
  'international friendly':            'INTERNACIONALES',
}

function getCategoria(strLeague) {
  if (!strLeague) return null
  return CATEGORIA_LIGA[strLeague.toLowerCase().trim()] || null
}

const FILTROS = [
  { id: 'TODAS',          label: 'Todas',          emoji: '⚽' },
  { id: 'AMERICA',        label: 'América',         emoji: '🌎' },
  { id: 'EUROPA_LIGAS',   label: 'Europa · Ligas',  emoji: '🇪🇺' },
  { id: 'EUROPA_COPAS',   label: 'Europa · Copas',  emoji: '🏆' },
  { id: 'INTERNACIONALES',label: 'Internacional',   emoji: '🌍' },
]

// ─── Ligas individuales por categoría (para el subfiltro) ────────────────────
const LIGAS_POR_CATEGORIA = {
  AMERICA: [
    { id: 'brasileirao',    label: 'Brasileirão',     emoji: '🇧🇷', variantes: ['brasileirão série a','brazilian serie a','brasileirao serie a'] },
    { id: 'libertadores',   label: 'Libertadores',    emoji: '🏆', variantes: ['copa libertadores','conmebol libertadores'] },
    { id: 'sudamericana',   label: 'Sudamericana',    emoji: '🥈', variantes: ['copa sudamericana','conmebol sudamericana'] },
    { id: 'copa-argentina', label: 'Copa Argentina',  emoji: '🇦🇷', variantes: ['copa argentina'] },
    { id: 'copa-colombia',  label: 'Copa Colombia',   emoji: '🇨🇴', variantes: ['copa colombia','copa betplay dimayor','copa betplay'] },
    { id: 'copa-brasil',    label: 'Copa do Brasil',  emoji: '🇧🇷', variantes: ['copa do brasil'] },
    { id: 'liga1-peru',     label: 'Liga 1 Perú',     emoji: '🇵🇪', variantes: ['liga 1 peru','peruvian primera division','liga 1'] },
    { id: 'liga-mx',        label: 'Liga MX',         emoji: '🇲🇽', variantes: ['mexican liga mx','mexican primera league','mexican primera division tournament','liga mx'] },
    { id: 'mls',            label: 'MLS',             emoji: '🇺🇸', variantes: ['american major league soccer','major league soccer'] },
  ],
  EUROPA_LIGAS: [
    { id: 'bundesliga',     label: 'Bundesliga',      emoji: '🇩🇪', variantes: ['german bundesliga','bundesliga'] },
    { id: 'laliga',         label: 'LaLiga',          emoji: '🇪🇸', variantes: ['spanish la liga'] },
    { id: 'ligue1',         label: 'Ligue 1',         emoji: '🇫🇷', variantes: ['french ligue 1'] },
    { id: 'premier',        label: 'Premier League',  emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', variantes: ['english premier league'] },
    { id: 'serie-a',        label: 'Serie A',         emoji: '🇮🇹', variantes: ['italian serie a'] },
  ],
  EUROPA_COPAS: [
    { id: 'ucl',            label: 'Champions',       emoji: '⭐', variantes: ['uefa champions league'] },
    { id: 'ucl-fem',        label: 'Champions Fem.',  emoji: '⭐', variantes: ["uefa women's champions league",'uefa womens champions league'] },
    { id: 'uel',            label: 'Europa League',   emoji: '🟠', variantes: ['uefa europa league'] },
    { id: 'fa-cup',         label: 'FA Cup',          emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', variantes: ['the emirates fa cup','the fa cup','fa cup'] },
    { id: 'copa-rey',       label: 'Copa del Rey',    emoji: '🇪🇸', variantes: ['copa del rey'] },
    { id: 'coppa-italia',   label: 'Coppa Italia',    emoji: '🇮🇹', variantes: ['coppa italia'] },
    { id: 'coupe-france',   label: 'Coupe de France', emoji: '🇫🇷', variantes: ['coupe de france'] },
  ],
  INTERNACIONALES: [
    { id: 'eliminatorias',  label: 'Eliminatorias',   emoji: '🌍', variantes: ['uefa european championship qualifiers','world cup qualifying uefa','uefa euro qualifiers'] },
    { id: 'nations',        label: 'Nations League',  emoji: '🌐', variantes: ['uefa nations league'] },
    { id: 'mundial',        label: 'Mundial 2026',    emoji: '🏆', variantes: ['fifa world cup 2026','fifa world cup'] },
    { id: 'amistosos',      label: 'Amistosos FIFA',  emoji: '🤝', variantes: ['fifa international friendlies','international friendlies','international friendly'] },
  ],
}

function ligaMatchSubfiltro(strLeague, subfiltroId, categoriaId) {
  if (!subfiltroId) return true
  const liga = LIGAS_POR_CATEGORIA[categoriaId]?.find(l => l.id === subfiltroId)
  if (!liga) return true
  return liga.variantes.includes((strLeague || '').toLowerCase().trim())
}

// ─── Fechas dinámicas en hora Lima (UTC-5) ──────────────────────────────────
function getFechaLima(offset = 0) {
  const limaDate = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Lima' })
  )
  limaDate.setDate(limaDate.getDate() + offset)
  return limaDate.toLocaleDateString('en-CA') // YYYY-MM-DD
}

// Suma N días a una fecha YYYY-MM-DD (en UTC puro para no alterar el día)
function sumarDia(fechaStr, n = 1) {
  const [y, m, d] = fechaStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d + n))
  return dt.toISOString().slice(0, 10)
}

// Dado un partido de TheSportsDB, devuelve su fecha en Lima (YYYY-MM-DD)
// TheSportsDB da dateEvent en UTC y strTime en UTC
function getFechaLimaDePartido(p) {
  if (!p.dateEvent) return p.dateEvent
  const timeStr = (p.strTime && p.strTime !== 'null') ? p.strTime.slice(0, 5) : '12:00'
  try {
    const utc = new Date(p.dateEvent + 'T' + timeStr + ':00Z')
    return utc.toLocaleDateString('en-CA', { timeZone: 'America/Lima' })
  } catch { return p.dateEvent }
}

function getDias() {
  return [-1, 0, 1, 2].map((offset, i) => {
    const fecha = getFechaLima(offset)
    const labels = ['AYER', 'HOY', 'MAÑANA', 'PASADO']
    // Para mostrar el nombre del día usamos la fecha de Lima
    const d = new Date(fecha + 'T12:00:00') // mediodía para evitar cambio de día
    const diaCompleto = d.toLocaleDateString('es-PE', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
    return { offset, fecha, label: labels[i], diaCompleto }
  })
}

// ─── Hora en Lima ────────────────────────────────────────────────────────────
// dateEvent: YYYY-MM-DD en UTC (del campo dateEvent del partido)
function formatHora(strTime, dateEvent) {
  if (!strTime || strTime === 'null') return 'Por confirmar'
  try {
    const fecha = dateEvent || new Date().toISOString().slice(0, 10)
    const utc = new Date(fecha + 'T' + strTime.slice(0, 5) + ':00Z')
    return utc.toLocaleTimeString('es-PE', {
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Lima', hour12: false,
    })
  } catch { return 'Por confirmar' }
}

// ─── Hora Lima actual (HH:MM como número para comparar) ─────────────────────
function getMinutosLimaActual() {
  const limaStr = new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Lima', hour12: false,
    hour: '2-digit', minute: '2-digit',
  })
  // limaStr puede ser "23:07"
  const [h, m] = limaStr.split(':').map(Number)
  return h * 60 + m
}

// ─── ¿La hora del partido ya pasó en Lima? (para HOY) ───────────────────────
function yaTerminoPorHora(strTime) {
  if (!strTime || strTime === 'null') return false
  try {
    const [h, m] = strTime.split(':').map(Number)
    const utc = new Date()
    utc.setUTCHours(h, m, 0, 0)
    // Convertir a minutos Lima
    const limaStr = utc.toLocaleTimeString('en-US', {
      timeZone: 'America/Lima', hour12: false,
      hour: '2-digit', minute: '2-digit',
    })
    const [lh, lm] = limaStr.split(':').map(Number)
    const minPartido = lh * 60 + lm
    // Si la hora del partido + 105 min (90 + 15 extra) ya pasó → finalizado
    return getMinutosLimaActual() > minPartido + 105
  } catch { return false }
}

// ─── Calcular forma (G/E/P) de un equipo a partir de sus últimos eventos ─────
function calcularForma(events, teamId) {
  const id = String(teamId)
  return events.slice(0, 5).map(e => {
    const esLocal = String(e.idHomeTeam) === id
    const gh = parseInt(e.intHomeScore)
    const ga = parseInt(e.intAwayScore)
    if (isNaN(gh) || isNaN(ga)) return null
    const miGol  = esLocal ? gh : ga
    const rival  = esLocal ? ga : gh
    if (miGol > rival) return 'G'
    if (miGol === rival) return 'E'
    return 'P'
  }).filter(Boolean)
}

function rachaLabel(forma) {
  if (!forma.length) return ''
  const ult3 = forma.slice(0, 3)
  const wins = ult3.filter(r => r === 'G').length
  if (wins === 3) return { text: 'Racha perfecta 🔥', color: 'text-green-400' }
  if (wins === 2) return { text: 'Racha positiva ↑', color: 'text-green-400' }
  const losses = ult3.filter(r => r === 'P').length
  if (losses === 3) return { text: 'Racha negativa ↓', color: 'text-red-400' }
  if (losses === 2) return { text: 'Momento difícil', color: 'text-red-400' }
  return { text: 'Forma irregular', color: 'text-yellow-400' }
}

function generarConsejo(local, visita, formaLocal, formaVisita) {
  const wL = formaLocal.filter(r => r === 'G').length
  const wV = formaVisita.filter(r => r === 'G').length
  const dL = formaLocal.filter(r => r === 'E').length
  if (wL >= 4) return `${local} llega arrollador con ${wL} victorias en sus últimos 5 partidos. Favorito claro en casa.`
  if (wV >= 4) return `${visita} viene en racha imparable: ${wV} victorias seguidas. Visitante muy peligroso.`
  if (wL >= 3 && wV <= 1) return `${local} tiene ventaja clara en forma. Buen momento para apostar por el local.`
  if (wV >= 3 && wL <= 1) return `${visita} llega con más confianza. El visitante puede sorprender hoy.`
  if (dL >= 3) return `${local} viene empatando mucho. El empate es una opción interesante en este partido.`
  if (wL === wV) return `Ambos equipos llegan parejos en forma. Partido equilibrado, ideal para apuesta combinada.`
  return `${local} recibe a ${visita} en un partido que promete emociones. ¡Ofrecele la apuesta a tu cliente!`
}

// ─── Generador de apuestas sugeridas basado en tendencias ───────────────────
function generarApuestas(formaLocal, formaVisita, partido) {
  const local  = partido.strHomeTeam
  const visita = partido.strAwayTeam
  const wL = formaLocal.filter(r => r === 'G').length
  const wV = formaVisita.filter(r => r === 'G').length
  const dL = formaLocal.filter(r => r === 'E').length
  const dV = formaVisita.filter(r => r === 'E').length

  // Apuesta 1: basada en el equipo con mejor racha de victorias
  let a1
  if (wL >= 4) {
    a1 = { tipo: '🏠 Gana Local', detalle: `${local} viene arrollador con ${wL} victorias en sus últimos 5 partidos. El local es el gran favorito hoy.` }
  } else if (wV >= 4) {
    a1 = { tipo: '✈️ Gana Visitante', detalle: `${visita} llega en racha imparable: ${wV} victorias seguidas. No subestimes al visitante.` }
  } else if (wL >= 3 && wL > wV) {
    a1 = { tipo: '🏠 Gana Local', detalle: `${local} tiene ${wL} victorias en sus últimos 5. Llega con ventaja de forma jugando en casa.` }
  } else if (wV >= 3 && wV > wL) {
    a1 = { tipo: '✈️ Gana Visitante', detalle: `${visita} llega con ${wV} victorias recientes. Puede sorprender fuera de casa.` }
  } else if (dL >= 2 && dV >= 2) {
    a1 = { tipo: '🤝 Empate', detalle: `Ambos equipos empatan con frecuencia. El 1X2 en empate puede ser muy rentable hoy.` }
  } else {
    a1 = { tipo: '🔄 Doble Oportunidad 1X', detalle: `Cubre al local y el empate en una sola apuesta. Ideal para partido parejo.` }
  }

  // Apuesta 2: basada en producción goleadora
  let a2
  const totalGoles = wL + wV
  if (totalGoles >= 6) {
    a2 = { tipo: '⚽ Más de 2.5 Goles', detalle: `Los dos equipos están en racha anotadora. Partido con muchos goles esperado. ¡Ponlo en tu combinada!` }
  } else if (wL >= 2 && wV >= 2) {
    a2 = { tipo: '🎯 Ambos Marcan - Sí', detalle: `Ambos equipos han encontrado el gol recientemente. Alta probabilidad de que los dos anoten hoy.` }
  } else if (dL >= 3 || dV >= 3) {
    a2 = { tipo: '📊 Menos de 2.5 Goles', detalle: `Historial de partidos cerrados. Buen partido para apostar por bajo marcador.` }
  } else {
    a2 = { tipo: '🎯 Ambos Marcan - Sí', detalle: `Los dos equipos tienen potencial goleador. Apuesta segura para un partido abierto.` }
  }

  return [a1, a2]
}

// ─── 4 Speeches de venta — distintos estilos, todos con emojis y energía ──────
const PITCHES_SPEECH = [
  // 1: Entusiasta / Pura energía
  (local, visita, a1, a2) =>
    `🔥 ¡Señor(a), HOY HAY PARTIDAZO! ⚽🎉\n\n🏟️ ${local} vs ${visita} — ¡este no te lo puedes perder!\n\n📊 Los números hablan solos:\n👉 ${a1.tipo} — la jugada más fuerte según las tendencias\n🌶️ Para los valientes: ${a2.tipo} para subirle el nivel\n\n💰 ¡En TE APUESTO las cuotas están al tope!\n¿Le armamos el ticket ahora y a esperar el pitazo? 😄🏆`,

  // 2: Conversacional / Amigo de confianza
  (local, visita, a1, a2) =>
    `😊 ¡Buenas! ¿Ya se enteró del partido de hoy?\n\n⚽ ${local} vs ${visita} — ¡está que arde! 🔥\n\nMire, sin complicarse mucho:\n✅ ${a1.tipo} — lo que más recomienda el análisis\n🎯 Si quiere más sabor: ${a2.tipo}\n\n¡Lo procesa en segundito en TE APUESTO y listo! 👍\n¿Le explico cómo o lo vemos juntos ahora? 😄`,

  // 3: Experto / Genera confianza con datos
  (local, visita, a1, a2) =>
    `📋 Le comparto el análisis rápido del partido, señor(a):\n\n⚽ ${local} vs ${visita}\n\n📊 Tendencias recientes dicen:\n🥇 Jugada principal: ${a1.tipo}\n🥈 Opción complementaria: ${a2.tipo}\n\n💡 En TE APUESTO puede hacer ambas en pocos pasos y con cuotas competitivas. 🏆\n\n¿Le explico cómo funciona o prefiere que lo veamos en pantalla juntos? 😊`,

  // 4: Urgencia / Antes que empiece
  (local, visita, a1, a2) =>
    `⏰ ¡Señor(a), apúrese que el partido ya empieza! 🚨⚽\n\n🔥 ${local} vs ${visita} — ¡y las cuotas están buenísimas ahorita!\n\n⚡ La jugada del momento: ${a1.tipo} 📈\n💥 Combo que le suma: ${a2.tipo}\n\n👀 ¡Cuando arranque el partido las cuotas pueden cambiar!\n💰 ¡En TE APUESTO lo ingresamos en 1 minuto!\n¿Le entramos ahora o qué? 😎🏆`,
]

// ─── CTAs de invitación al punto de venta — se elige uno por partido ──────────
const POS_CTAS = [
  `📍 *¡Te esperamos en tu punto de venta con gusto, crack!* 😄\n👉 Acércate con tu DNI y te damos tu jugada al toque 🙌`,
  `⏰ *¡Apúrate, causa — las cuotas cambian antes del pitazo!* 🚨\n👉 Pásate por tu POS, trae tu DNI y armamos tu jugada juntos 💪`,
  `📍 *¡No demores, crack — te esperamos con todo!* 🏃‍♂️💨\n👉 Trae tu DNI y en un momento tienes tu ticket listo ✅`,
  `⚡ *¡Las cuotas vuelan, causa — no dejes tu fija para después!* 🚨\n👉 Acércate a tu punto de venta y te atendemos al toque 🙌`,
  `🎯 *¡Crack, te esperamos con gusto en tu POS!* 😄\n👉 Trae tu DNI, elige tu jugada y vive el partido con más emoción 🔥`,
]

// ─── Mensajes Club Te Apuesto — voz TE APUESTO: cercana, peruana, responsable ──
// Fórmula: saludo → partido → jugada simple → speech → CTA (1 aleatorio) → cierre
const PITCHES_CLUB = [
  // Estilo 1 — HOY HAY PARTIDAZO (invitar al partido del día)
  (local, visita, a1, a2, cta) =>
    `🔥⚽ *HOY HAY PARTIDAZO, CRACK* ⚽🔥\n\nHoy la cancha prende y las señales están ahí 👀\n🏟️ *${local}* 🆚 *${visita}*\n\n💥 *Jugadaza del día:* ${a1.tipo} ✅\n🌶️ *Opción picante:* ${a2.tipo} 🎯\n\n💬 _"Crack, este partido está de candela 🔥 Las señales están en la cancha... ¿la ves o no la ves? 👀 Arma tu jugada y vive el partido con más emoción. ¡Arranca nomás, causa!"_\n\n${cta}\n✅ Juega con emoción · Juega con control 🍀`,

  // Estilo 2 — COMBI CON FE (impulsar combinadas)
  (local, visita, a1, a2, cta) =>
    `⚽🎊 *TU COMBI PUEDE SALIR PICANTE, CRACK* 🎊⚽\n\nSi ya tienes tus fijas, ¡júntalas y arma algo buenazo! 🔥\n🏠 *${local}* 🆚 *${visita}* ✈️\n\n📊 *Señales de hoy:*\n✅ *${a1.tipo}* — jugadaza fuerte 💪\n🎯 *${a2.tipo}* — el combo que prende 🌶️\n\n💬 _"Pata, si ya tienes tus fijas, júntalas y arma una combi con fe 💪 Mientras más analizas, más se pone bueno el partido. ¡Muestra tu jugada, causa!"_ 😎\n\n${cta}\n✅ La ves · La juegas · La gozas 🍀💥`,

  // Estilo 3 — DATAZO SIMPLE (para el que pregunta qué jugar)
  (local, visita, a1, a2, cta) =>
    `🚨🔥 *DATAZO DEL DÍA, CRACK* 🔥🚨\n\nEste partido está de candela, las señales hablan solas 👁️\n⚽ *${local}* vs *${visita}*\n\n📌 *Opciones simples para vivir el partido:*\n🥇 ${a1.tipo} 📈\n🥈 ${a2.tipo} ✨\n(Ganador · Goles · Ambos anotan · Combi — tú mandas, crack) 🎯\n\n💬 _"Ay pues, causa, mira qué opciones tienes hoy 👀 No necesitas complicarte. Elige la que más sientas, juégala en TE APUESTO y vive el partido con toda la emoción. ¿La ves? ¡La jugamos!"_ 🔥💪\n\n${cta}\n✅ Juega con emoción · Disfruta el partido 🍀`,
]

// ─── Generador de Speech completo con voz TE APUESTO ─────────────────────────
function generarSpeechCompleto(partido, hora, formaLocal, formaVisita) {
  const local    = tn(partido.strHomeTeam)
  const visita   = tn(partido.strAwayTeam)
  const liga     = partido.strLeague
  const [a1, a2] = generarApuestas(formaLocal, formaVisita, partido)
  const idx      = parseInt(partido.idEvent || 0) % PITCHES_SPEECH.length
  const pitch    = PITCHES_SPEECH[idx](local, visita, a1, a2)

  const formaStrL = formaLocal.join(' ') || 'Sin datos'
  const formaStrV = formaVisita.join(' ') || 'Sin datos'
  const rachaL    = rachaLabel(formaLocal)
  const rachaV    = rachaLabel(formaVisita)

  return (
`📢 SPEECH DE VENTA — TE APUESTO
────────────────────────────────

⚽ ${local} vs ${visita}
🏆 ${liga}  ·  ⏰ ${hora} Lima

📊 TENDENCIAS:
🏠 ${local}: ${formaStrL}${rachaL ? '  →  ' + rachaL.text : ''}
✈️  ${visita}: ${formaStrV}${rachaV ? '  →  ' + rachaV.text : ''}

💡 2 JUGADAS SUGERIDAS:

1️⃣  ${a1.tipo}
    ${a1.detalle}

2️⃣  ${a2.tipo}
    ${a2.detalle}

💬 DILE A TU CLIENTE (crack):
${pitch}

⚠️  Promueve siempre el juego responsable.`
  )
}

// ─── Generador de Mensaje Club con voz TE APUESTO ────────────────────────────
function generarMensajeClubCompleto(partido, hora, formaLocal, formaVisita) {
  const local    = tn(partido.strHomeTeam)
  const visita   = tn(partido.strAwayTeam)
  const liga     = partido.strLeague
  const [a1, a2] = generarApuestas(formaLocal, formaVisita, partido)
  const id       = parseInt(partido.idEvent || 0)
  const idx      = id % PITCHES_CLUB.length
  const ctaIdx   = Math.floor(id / PITCHES_CLUB.length) % POS_CTAS.length
  const cierre   = PITCHES_CLUB[idx](local, visita, a1, a2, POS_CTAS[ctaIdx])

  const rachaL    = rachaLabel(formaLocal)
  const rachaV    = rachaLabel(formaVisita)
  const formaStrL = formaLocal.join(' ') || '—'
  const formaStrV = formaVisita.join(' ') || '—'

  return (
`🏆⚽ *${liga}* ⚽🏆
🏠 *${local}* 🆚 *${visita}* ✈️
⏰ *${hora} Lima* 📍

📊✨ *Tendencias, cracks:* 👇
🔵⚡ ${local}: ${formaStrL}${rachaL ? ' · ' + rachaL.text + ' 💪' : ''}
🔴⚡ ${visita}: ${formaStrV}${rachaV ? ' · ' + rachaV.text + ' 💪' : ''}

🎯🔥 *Jugadas del día:*
1️⃣ 💥 ${a1.tipo}
   📌 ${a1.detalle}

2️⃣ 🌟 ${a2.tipo}
   📌 ${a2.detalle}

${cierre}

⚠️🙏 Juega responsable · Solo mayores de edad ✅`
  )
}

// ─── Modal de Speech / Mensaje Club ──────────────────────────────────────────
function ModalTexto({ partido, tipo, onClose }) {
  const [loading, setLoading]         = useState(true)
  const [formaLocal, setFormaLocal]   = useState([])
  const [formaVisita, setFormaVisita] = useState([])
  const [copiados, setCopiados]       = useState({})

  const hora     = formatHora(partido.strTime, partido.dateEvent)
  const esSpeech = tipo === 'speech'

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventslast.php?id=${partido.idHomeTeam}`, { signal: ctrl.signal }).then(r => r.json()),
      fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventslast.php?id=${partido.idAwayTeam}`, { signal: ctrl.signal }).then(r => r.json()),
    ]).then(([dL, dV]) => {
      setFormaLocal(calcularForma(dL.results || [], partido.idHomeTeam))
      setFormaVisita(calcularForma(dV.results || [], partido.idAwayTeam))
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => ctrl.abort()
  }, [partido.idHomeTeam, partido.idAwayTeam])

  function copiar(texto, key) {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiados(prev => ({ ...prev, [key]: true }))
      setTimeout(() => setCopiados(prev => ({ ...prev, [key]: false })), 2500)
    }).catch(() => {})
  }

  const local  = tn(partido.strHomeTeam)
  const visita = tn(partido.strAwayTeam)

  // For speech: all 4 options using match data
  const speeches = !loading && esSpeech
    ? (() => { const [a1, a2] = generarApuestas(formaLocal, formaVisita, partido); return PITCHES_SPEECH.map(fn => fn(local, visita, a1, a2)) })()
    : []

  // For club: single message
  const clubTexto = !loading && !esSpeech
    ? generarMensajeClubCompleto(partido, hora, formaLocal, formaVisita)
    : ''

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center p-4"
      style={{ bottom: '65px', backgroundColor: 'rgba(0,0,0,0.80)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-brand-dark rounded-3xl border border-white/10 overflow-hidden flex flex-col"
        style={{maxHeight:'calc(100% - 16px)'}}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b border-white/5 ${
          esSpeech ? 'bg-brand-orange/10' : 'bg-blue-500/10'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{esSpeech ? '💬' : '📋'}</span>
            <div>
              <p className={`text-xs font-black ${esSpeech ? 'text-brand-orange' : 'text-blue-400'}`}>
                {esSpeech ? '4 SPEECHES DE VENTA' : 'MENSAJE CLUB TE APUESTO'}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {tn(partido.strHomeTeam)} vs {tn(partido.strAwayTeam)}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-brand-medium flex items-center justify-center text-gray-400 hover:text-white font-bold flex-shrink-0">
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className={`h-4 rounded-full bg-brand-medium animate-pulse ${i % 2 === 0 ? 'w-3/4' : 'w-full'}`} />
              ))}
              <p className="text-center text-xs text-gray-600 animate-pulse mt-4">Analizando tendencias...</p>
            </div>
          ) : esSpeech ? (
            <div className="space-y-4">
              {speeches.map((speech, i) => (
                <div key={i} className="bg-brand-medium rounded-2xl border border-white/5 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-brand-orange/10 border-b border-white/5">
                    <span className="text-xs font-black text-brand-orange">✨ Speech #{i + 1}</span>
                    <button
                      onClick={() => copiar(speech, i)}
                      className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${
                        copiados[i]
                          ? 'bg-green-500 text-white'
                          : 'bg-brand-orange text-white hover:bg-brand-orange/80'
                      }`}
                    >
                      {copiados[i] ? '✓ Copiado' : '📋 Copiar'}
                    </button>
                  </div>
                  <pre className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-sans p-3">
                    {speech}
                  </pre>
                </div>
              ))}
              <p className="text-[10px] text-gray-600 text-center mt-2">⚠️ Promueve siempre el juego responsable</p>
            </div>
          ) : (
            <div className="space-y-4">
              <pre className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">
                {clubTexto}
              </pre>
              <button
                onClick={() => copiar(clubTexto, 'club')}
                className={`w-full py-3 rounded-xl text-sm font-black transition-all ${
                  copiados['club']
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                {copiados['club'] ? '✓ ¡Copiado al portapapeles!' : '📋 Copiar texto completo'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponentes independientes (fuera de TendenciasModal para evitar recreación) ──
function CirculoForma({ r }) {
  const cfg = {
    G: 'bg-green-500 text-white',
    E: 'bg-yellow-400 text-black',
    P: 'bg-red-500 text-white',
  }
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black ${cfg[r] || 'bg-gray-700 text-gray-400'}`}>
      {r}
    </span>
  )
}

function FilaEquipo({ nombre, badge, forma, loading }) {
  const racha = rachaLabel(forma)
  return (
    <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
      {badge ? (
        <img src={badge + '/tiny'} alt={nombre} className="w-12 h-12 object-contain"
          onError={e => { e.target.style.display = 'none' }} />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-brand-medium flex items-center justify-center text-xl">⚽</div>
      )}
      <p className="text-xs font-bold text-white text-center leading-tight line-clamp-2">{nombre}</p>
      <p className="text-[10px] text-gray-500">Últimos 5</p>
      {loading ? (
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-7 h-7 rounded-full bg-brand-medium animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-1 flex-wrap justify-center">
          {forma.length
            ? forma.map((r, i) => <CirculoForma key={i} r={r} />)
            : <span className="text-[10px] text-gray-600">Sin datos</span>
          }
        </div>
      )}
      {!loading && racha && (
        <p className={`text-[10px] font-bold text-center ${racha.color}`}>{racha.text}</p>
      )}
    </div>
  )
}

// ─── Modal de Tendencias ─────────────────────────────────────────────────────
function TendenciasModal({ partido, onClose, onOpenModal }) {
  const [loading, setLoading]         = useState(true)
  const [formaLocal, setFormaLocal]   = useState([])
  const [formaVisita, setFormaVisita] = useState([])

  const hora    = formatHora(partido.strTime, partido.dateEvent)

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventslast.php?id=${partido.idHomeTeam}`, { signal: ctrl.signal }).then(r => r.json()),
      fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventslast.php?id=${partido.idAwayTeam}`, { signal: ctrl.signal }).then(r => r.json()),
    ]).then(([dL, dV]) => {
      setFormaLocal(calcularForma(dL.results || [], partido.idHomeTeam))
      setFormaVisita(calcularForma(dV.results || [], partido.idAwayTeam))
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => ctrl.abort()
  }, [partido.idHomeTeam, partido.idAwayTeam])

  const consejo = !loading
    ? generarConsejo(partido.strHomeTeam, partido.strAwayTeam, formaLocal, formaVisita)
    : ''

  return (
    <div
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center p-4"
      style={{ bottom: '65px', backgroundColor: 'rgba(0,0,0,0.80)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-white/10 overflow-hidden"
        style={{ backgroundColor: '#1a1a2e' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/5">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{partido.strLeague}</p>
            <p className="text-xs text-brand-orange font-bold">📊 Tendencias · ⏰ {hora} Lima</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white font-bold text-lg"
            style={{ backgroundColor: '#2a2a3e' }}
          >
            ✕
          </button>
        </div>

        {/* Equipos + forma */}
        <div className="flex gap-3 px-4 py-4">
          <FilaEquipo
            nombre={tn(partido.strHomeTeam)}
            badge={partido.strHomeTeamBadge}
            forma={formaLocal}
            loading={loading}
          />
          <div className="flex flex-col items-center justify-center flex-shrink-0 pt-4">
            <span className="text-gray-600 font-black text-lg">VS</span>
          </div>
          <FilaEquipo
            nombre={tn(partido.strAwayTeam)}
            badge={partido.strAwayTeamBadge}
            forma={formaVisita}
            loading={loading}
          />
        </div>

        {/* Consejo */}
        {loading ? (
          <div className="mx-4 mb-3 h-14 rounded-2xl animate-pulse" style={{ backgroundColor: '#2a2a3e' }} />
        ) : consejo ? (
          <div className="mx-4 mb-3 rounded-2xl p-3" style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <p className="text-[10px] font-black text-yellow-400 mb-1">💡 CONSEJO DE VENTA</p>
            <p className="text-xs text-gray-300 leading-relaxed">{consejo}</p>
          </div>
        ) : null}

        {/* Botones */}
        <div className="flex gap-2 px-4 pb-4">
          <button
            onClick={() => { onClose(); onOpenModal && onOpenModal(partido, 'speech') }}
            className="flex-1 py-2 rounded-xl text-[11px] font-bold text-brand-orange transition-all"
            style={{ backgroundColor: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)' }}
          >
            📢 Speech
          </button>
          <button
            onClick={() => { onClose(); onOpenModal && onOpenModal(partido, 'club') }}
            className="flex-1 py-2 rounded-xl text-[11px] font-bold text-blue-400 transition-all"
            style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            📋 Msg. Club
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tarjeta de partido ──────────────────────────────────────────────────────
function PartidoCard({ partido, diaOffset, onVerTendencias, onOpenModal }) {
  const status = (partido.strStatus || '').toLowerCase()
  const hora   = formatHora(partido.strTime, partido.dateEvent)

  const esAyer = diaOffset === -1
  const esHoy  = diaOffset === 0

  // Terminado por estado de la API
  const terminadoAPI = status.includes('match finished')
    || status === 'ft'
    || status === 'aet'
    || status === 'pen'
    || status.includes('finished')
    || status.includes('ended')

  // Terminado por hora Lima (solo aplica en HOY, cuando la API no actualizó el estado)
  const terminadoPorHora = esHoy && yaTerminoPorHora(partido.strTime)

  const terminado = esAyer || terminadoAPI || terminadoPorHora

  const enVivo = !terminado
    && !esAyer
    && partido.intHomeScore !== null
    && partido.intAwayScore !== null
    && (status.includes('progress') || status.includes('live') || status === 'ht')

  return (
    <div
      onClick={() => onVerTendencias && onVerTendencias(partido)}
      className={`rounded-2xl p-4 border transition-all cursor-pointer ${
        enVivo
          ? 'bg-green-900/20 border-green-500/40 hover:border-green-400/60'
          : terminado
          ? 'bg-brand-dark border-white/5 opacity-70 hover:opacity-90'
          : 'bg-brand-dark border-white/5 hover:border-brand-orange/30'
      }`}
    >
      {/* Liga + estado */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate flex-1">
          {partido.strLeague}
        </p>
        {enVivo && (
          <span className="flex-shrink-0 flex items-center gap-1 bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full ml-2">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            EN VIVO
          </span>
        )}
        {terminado && !enVivo && (
          <span className="flex-shrink-0 text-[10px] text-gray-600 ml-2">Finalizado</span>
        )}
        {!enVivo && !terminado && (
          <span className="flex-shrink-0 text-[10px] font-bold text-brand-orange ml-2">
            ⏰ {formatHora(partido.strTime, partido.dateEvent)}
          </span>
        )}
      </div>

      {/* Equipos */}
      <div className="flex items-center gap-3">
        {/* Local */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          {partido.strHomeTeamBadge ? (
            <img
              src={partido.strHomeTeamBadge + '/tiny'}
              alt={partido.strHomeTeam}
              className="w-10 h-10 object-contain"
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-brand-medium flex items-center justify-center text-lg">⚽</div>
          )}
          <p className="text-xs font-bold text-white text-center leading-tight line-clamp-2">
            {tn(partido.strHomeTeam)}
          </p>
        </div>

        {/* Marcador / VS */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1 min-w-[60px]">
          {(enVivo || terminado) && partido.intHomeScore !== null ? (
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black ${enVivo ? 'text-green-400' : 'text-white'}`}>
                {partido.intHomeScore}
              </span>
              <span className="text-gray-600 text-lg">-</span>
              <span className={`text-2xl font-black ${enVivo ? 'text-green-400' : 'text-white'}`}>
                {partido.intAwayScore}
              </span>
            </div>
          ) : (
            <span className="text-gray-600 font-black text-xl">VS</span>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 flex flex-col items-center gap-1.5">
          {partido.strAwayTeamBadge ? (
            <img
              src={partido.strAwayTeamBadge + '/tiny'}
              alt={partido.strAwayTeam}
              className="w-10 h-10 object-contain"
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-brand-medium flex items-center justify-center text-lg">⚽</div>
          )}
          <p className="text-xs font-bold text-white text-center leading-tight line-clamp-2">
            {tn(partido.strAwayTeam)}
          </p>
        </div>
      </div>

      {partido.strCountry && (
        <p className="text-[10px] text-gray-600 text-center mt-2">{partido.strCountry}</p>
      )}

      {/* Botones de acción — stopPropagation para no abrir el modal de tendencias */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5" onClick={e => e.stopPropagation()}>
        <button
          onClick={e => { e.stopPropagation(); onOpenModal && onOpenModal(partido, 'speech') }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold bg-brand-orange/10 border border-brand-orange/20 text-brand-orange hover:bg-brand-orange/20 transition-all"
        >
          📢 Speech
        </button>
        <button
          onClick={e => { e.stopPropagation(); onOpenModal && onOpenModal(partido, 'club') }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all"
        >
          📋 Msg. Club
        </button>
        <button
          onClick={e => { e.stopPropagation(); onVerTendencias && onVerTendencias(partido) }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold bg-brand-medium border border-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all"
        >
          📊 Tendencias
        </button>
      </div>
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function Calendario() {
  const DIAS = getDias()
  const [diaIdx, setDiaIdx]       = useState(1) // default: HOY
  const [partidos, setPartidos]   = useState({})
  const [loading, setLoading]     = useState({})
  const [error, setError]         = useState({})
  const [busqueda, setBusqueda]   = useState('')
  const [filtro, setFiltro]             = useState('TODAS')
  const [subfiltro, setSubfiltro]       = useState(null)
  const [selectedPartido, setSelected]   = useState(null)              // modal tendencias
  const [selectedModal, setSelectedModal] = useState(null)             // { partido, tipo }

  useEffect(() => {
    cargarDia(diaIdx)
    // Auto-refresh cada 60s solo cuando se ve HOY (puede haber partidos en vivo)
    if (DIAS[diaIdx].offset === 0) {
      const timer = setInterval(() => cargarDia(diaIdx, true), 60_000)
      return () => clearInterval(timer)
    }
  }, [diaIdx])

  async function cargarDia(idx, forzar = false) {
    const fechaLima = DIAS[idx].fecha
    if (!forzar && partidos[fechaLima] !== undefined) return

    if (!forzar) setLoading(prev => ({ ...prev, [fechaLima]: true }))
    if (!forzar) setError(prev => ({ ...prev, [fechaLima]: false }))

    try {
      // Lima es UTC-5: partidos a las 19:00-23:59 Lima son del día siguiente en UTC.
      // Consultamos fechaLima Y fechaLima+1 para no perder esos partidos.
      const fechaUtcSig = sumarDia(fechaLima, 1)
      const [r1, r2] = await Promise.all([
        fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php?d=${fechaLima}&s=Soccer`).then(r => r.json()),
        fetch(`https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsday.php?d=${fechaUtcSig}&s=Soccer`).then(r => r.json()),
      ])

      // Unir ambas listas y filtrar los que en Lima corresponden a fechaLima
      const todos = [...(r1.events || []), ...(r2.events || [])]
      const filtradosFecha = todos.filter(p => getFechaLimaDePartido(p) === fechaLima)

      // Quitar duplicados por idEvent
      const vistos = new Set()
      const unicos = filtradosFecha.filter(p => {
        if (vistos.has(p.idEvent)) return false
        vistos.add(p.idEvent)
        return true
      })

      // Filtrar solo ligas permitidas y ordenar por hora Lima
      const filtrados = unicos
        .filter(p => esLigaPermitida(p.strLeague))
        .sort((a, b) => {
          const toMin = p => {
            if (!p.strTime || p.strTime === 'null') return 9999
            const horaLima = formatHora(p.strTime, p.dateEvent)
            if (horaLima === 'Por confirmar') return 9999
            const [h, m] = horaLima.split(':').map(Number)
            return h * 60 + m
          }
          return toMin(a) - toMin(b)
        })

      setPartidos(prev => ({ ...prev, [fechaLima]: filtrados }))
    } catch {
      if (!forzar) setError(prev => ({ ...prev, [fechaLima]: true }))
    } finally {
      if (!forzar) setLoading(prev => ({ ...prev, [fechaLima]: false }))
    }
  }

  const diaActual = DIAS[diaIdx]
  const fecha     = diaActual.fecha
  const lista     = partidos[fecha] || []
  const isLoading = loading[fecha]
  const hasError  = error[fecha]

  // 1. Filtro por categoría → 2. Subfiltro por liga → 3. Búsqueda de texto
  const porCategoria = filtro === 'TODAS'
    ? lista
    : lista.filter(p => getCategoria(p.strLeague) === filtro)

  const porSubfiltro = subfiltro
    ? porCategoria.filter(p => ligaMatchSubfiltro(p.strLeague, subfiltro, filtro))
    : porCategoria

  const mostrar = busqueda.trim()
    ? porSubfiltro.filter(p =>
        p.strHomeTeam?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.strAwayTeam?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.strLeague?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : porSubfiltro

  const enVivo = diaActual.offset === -1 ? 0 : lista.filter(p => {
    const status = (p.strStatus || '').toLowerCase()
    return p.intHomeScore !== null &&
      (status.includes('progress') || status.includes('live') || status === 'ht')
  }).length

  return (
    <div className="px-4 py-4 pb-24 max-w-4xl mx-auto animate-fade-in">

      {/* Modal de Tendencias */}
      {selectedPartido && (
        <TendenciasModal
          partido={selectedPartido}
          onClose={() => setSelected(null)}
          onOpenModal={(partido, tipo) => {
            setSelected(null)
            setSelectedModal({ partido, tipo })
          }}
        />
      )}

      {/* Modal de Speech / Mensaje Club */}
      {selectedModal && (
        <ModalTexto
          partido={selectedModal.partido}
          tipo={selectedModal.tipo}
          onClose={() => setSelectedModal(null)}
        />
      )}
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">Calendario de Partidos</h2>
        <p className="text-sm text-gray-500">
          Ligas seleccionadas · Hora Lima ·{' '}
          <span className="text-brand-orange font-bold">
            {new Date().toLocaleTimeString('es-PE', {
              timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit', hour12: false,
            })} Lima
          </span>
        </p>
      </div>

      {/* Tabs: Ayer / Hoy / Mañana / Pasado mañana */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {DIAS.map((dia, i) => (
          <button
            key={dia.fecha}
            onClick={() => { setDiaIdx(i); setBusqueda(''); setFiltro('TODAS'); setSubfiltro(null) }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              diaIdx === i
                ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20'
                : 'bg-brand-dark border border-white/5 text-gray-400 hover:border-brand-orange/30'
            }`}
          >
            {dia.label}
          </button>
        ))}
      </div>

      {/* Filtros de categoría */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
        {FILTROS.map(f => {
          const count = f.id === 'TODAS'
            ? lista.length
            : lista.filter(p => getCategoria(p.strLeague) === f.id).length
          return (
            <button
              key={f.id}
              onClick={() => { setFiltro(f.id); setSubfiltro(null); setBusqueda('') }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                filtro === f.id
                  ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                  : 'bg-brand-dark border border-white/5 text-gray-400 hover:border-brand-orange/30'
              }`}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
              {count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  filtro === f.id ? 'bg-white/20 text-white' : 'bg-brand-medium text-gray-400'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Subfiltros: ligas individuales de la categoría seleccionada */}
      {filtro !== 'TODAS' && LIGAS_POR_CATEGORIA[filtro] && (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-3 scrollbar-none">
          {/* Botón "Todas" del grupo */}
          <button
            onClick={() => { setSubfiltro(null); setBusqueda('') }}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              subfiltro === null
                ? 'bg-white/10 border-white/30 text-white'
                : 'border-white/5 text-gray-500 hover:border-white/20 hover:text-gray-300'
            }`}
          >
            Todas · {porCategoria.length}
          </button>

          {LIGAS_POR_CATEGORIA[filtro].map(liga => {
            const count = porCategoria.filter(p =>
              ligaMatchSubfiltro(p.strLeague, liga.id, filtro)
            ).length
            return (
              <button
                key={liga.id}
                onClick={() => { setSubfiltro(liga.id); setBusqueda('') }}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                  subfiltro === liga.id
                    ? 'bg-white/10 border-white/30 text-white'
                    : count === 0
                    ? 'border-white/5 text-gray-700 cursor-default'
                    : 'border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                }`}
                disabled={count === 0}
              >
                <span>{liga.emoji}</span>
                <span>{liga.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] font-black px-1 rounded-full ${
                    subfiltro === liga.id ? 'bg-white/20 text-white' : 'text-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Info del día */}
      <div className="bg-brand-dark rounded-2xl p-3 border border-white/5 mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-white capitalize">{diaActual.diaCompleto}</p>
          <p className="text-xs text-gray-500">
            {filtro === 'TODAS'
              ? `${lista.length} partidos en ligas autorizadas`
              : subfiltro
              ? `${porSubfiltro.length} partidos · ${LIGAS_POR_CATEGORIA[filtro]?.find(l=>l.id===subfiltro)?.label}`
              : `${porCategoria.length} de ${lista.length} · ${FILTROS.find(f=>f.id===filtro)?.label}`
            }
          </p>
        </div>
        {enVivo > 0 && (
          <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/40 rounded-xl px-3 py-1.5">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs font-bold">{enVivo} en vivo</span>
          </div>
        )}
      </div>

      {/* Buscador */}
      {lista.length > 0 && (
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar equipo o liga..."
            className="w-full bg-brand-dark border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-sm"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">✕</button>
          )}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-brand-dark rounded-2xl border border-white/5 animate-pulse" />
          ))}
          <p className="text-center text-xs text-gray-600 animate-pulse">Cargando partidos...</p>
        </div>
      )}

      {/* Error */}
      {!isLoading && hasError && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">📡</p>
          <p className="text-white font-bold mb-1">Error al cargar partidos</p>
          <p className="text-gray-500 text-sm mb-4">Verifica tu conexión e intenta de nuevo</p>
          <button
            onClick={() => {
              setPartidos(prev => { const n = {...prev}; delete n[fecha]; return n })
              cargarDia(diaIdx)
            }}
            className="bg-brand-orange text-white px-6 py-2.5 rounded-xl text-sm font-bold"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Sin partidos */}
      {!isLoading && !hasError && lista.length === 0 && (
        <div className="text-center py-10">
          <p className="text-4xl mb-3">🏟️</p>
          <p className="text-white font-bold">Sin partidos este día</p>
          <p className="text-gray-500 text-sm mt-1">en las ligas autorizadas</p>
        </div>
      )}

      {/* Sin resultados por filtro o búsqueda */}
      {!isLoading && !hasError && mostrar.length === 0 && lista.length > 0 && (
        <div className="text-center py-8">
          {busqueda ? (
            <>
              <p className="text-gray-500 text-sm">Sin resultados para "{busqueda}"</p>
              <button onClick={() => setBusqueda('')} className="mt-2 text-brand-orange text-xs underline">
                Limpiar búsqueda
              </button>
            </>
          ) : subfiltro ? (
            <>
              <p className="text-2xl mb-2">{LIGAS_POR_CATEGORIA[filtro]?.find(l=>l.id===subfiltro)?.emoji}</p>
              <p className="text-gray-500 text-sm">Sin partidos de <span className="text-white font-bold">{LIGAS_POR_CATEGORIA[filtro]?.find(l=>l.id===subfiltro)?.label}</span> este día</p>
              <button onClick={() => setSubfiltro(null)} className="mt-2 text-brand-orange text-xs underline">
                Ver todas de {FILTROS.find(f=>f.id===filtro)?.label}
              </button>
            </>
          ) : (
            <>
              <p className="text-2xl mb-2">{FILTROS.find(f=>f.id===filtro)?.emoji}</p>
              <p className="text-gray-500 text-sm">Sin partidos de <span className="text-white font-bold">{FILTROS.find(f=>f.id===filtro)?.label}</span> este día</p>
              <button onClick={() => setFiltro('TODAS')} className="mt-2 text-brand-orange text-xs underline">
                Ver todas las ligas
              </button>
            </>
          )}
        </div>
      )}

      {/* Lista de partidos */}
      {!isLoading && !hasError && mostrar.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {mostrar.map(p => (
            <PartidoCard
              key={p.idEvent}
              partido={p}
              diaOffset={diaActual.offset}
              onVerTendencias={setSelected}
              onOpenModal={(partido, tipo) => setSelectedModal({ partido, tipo })}
            />
          ))}
        </div>
      )}

      {/* Footer */}
      {!isLoading && lista.length > 0 && (
        <div className="mt-4 bg-brand-dark rounded-2xl p-3 border border-white/5 flex items-center justify-between">
          <span className="text-xs text-gray-600">TheSportsDB · Solo ligas seleccionadas · Hora Lima</span>
          <button
            onClick={() => {
              setPartidos(prev => { const n = {...prev}; delete n[fecha]; return n })
              cargarDia(diaIdx)
            }}
            className="text-xs text-gray-600 hover:text-brand-orange transition-all"
          >↻ Actualizar</button>
        </div>
      )}
    </div>
  )
}
