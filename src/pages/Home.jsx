import { useState, useEffect, useRef, useCallback } from 'react'
import ProgressBar from '../components/ProgressBar'
import ResponsibleBanner from '../components/ResponsibleBanner'
import { tn } from '../utils/translations'

// ─── API y utilidades de fútbol (para el widget del día) ─────────────────────
const FUT_API = '3929240369'

function getFechaLima() {
  const limaDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }))
  return limaDate.toLocaleDateString('en-CA')
}

function getFechaMananaLima() {
  const limaDate = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Lima' }))
  limaDate.setDate(limaDate.getDate() + 1)
  return limaDate.toLocaleDateString('en-CA')
}

// Devuelve el Date UTC del inicio del partido (TheSportsDB usa UTC en dateEvent+strTime)
function getMatchUtcDate(dateEvent, strTime) {
  if (!dateEvent || !strTime || strTime === 'null') return null
  try {
    const [h, m] = strTime.split(':').map(Number)
    return new Date(`${dateEvent}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00Z`)
  } catch { return null }
}

// True si el partido terminó (inicio + 110 min < ahora)
function partidoTerminado(dateEvent, strTime) {
  const d = getMatchUtcDate(dateEvent, strTime)
  if (!d) return false
  return Date.now() > d.getTime() + 110 * 60 * 1000
}

function formatHoraFut(strTime) {
  if (!strTime || strTime === 'null') return '--:--'
  try {
    const [h, m] = strTime.split(':').map(Number)
    const utc = new Date()
    utc.setUTCHours(h, m, 0, 0)
    return utc.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima', hour12: false })
  } catch { return '--:--' }
}

function calcularFormaFut(events, teamId) {
  const id = String(teamId)
  return events.slice(0, 5).map(e => {
    const esLocal = String(e.idHomeTeam) === id
    const gh = parseInt(e.intHomeScore), ga = parseInt(e.intAwayScore)
    if (isNaN(gh) || isNaN(ga)) return null
    const mi = esLocal ? gh : ga, rival = esLocal ? ga : gh
    if (mi > rival) return 'G'
    if (mi === rival) return 'E'
    return 'P'
  }).filter(Boolean)
}

function rachaLabelFut(forma) {
  if (!forma.length) return null
  const ult3 = forma.slice(0, 3)
  const w = ult3.filter(r => r === 'G').length
  const l = ult3.filter(r => r === 'P').length
  if (w === 3) return { text: 'Racha perfecta 🔥', color: 'text-green-400' }
  if (w === 2) return { text: 'Racha positiva ↑', color: 'text-green-400' }
  if (l === 3) return { text: 'Racha negativa ↓', color: 'text-red-400' }
  if (l === 2) return { text: 'Momento difícil', color: 'text-red-400' }
  return { text: 'Forma irregular', color: 'text-yellow-400' }
}

function consejoLocal(nombre, forma) {
  const w = forma.filter(r => r === 'G').length
  const l = forma.filter(r => r === 'P').length
  const d = forma.filter(r => r === 'E').length
  if (w >= 4) return `${nombre} viene imparable: ${w} victorias en sus últimos 5.`
  if (w >= 3) return `${nombre} llega fuerte, con ${w} victorias recientes. Favorito.`
  if (l >= 3) return `${nombre} en dificultades: ${l} derrotas en sus últimos 5.`
  if (d >= 3) return `${nombre} empata con frecuencia. Partido puede ser cerrado.`
  return `${nombre} con forma irregular. Partido difícil de predecir.`
}

// Ligas permitidas en el widget Home (mismas que Calendario)
const LIGAS_HOME = new Set([
  'brasileirão série a','brazilian serie a','brasileirao serie a',
  'german bundesliga','bundesliga',
  'copa libertadores','conmebol libertadores',
  'copa sudamericana','conmebol sudamericana',
  'uefa champions league',
  "uefa women's champions league",'uefa womens champions league',
  'copa argentina','copa colombia','copa betplay dimayor','copa betplay',
  'coppa italia','copa do brasil','coupe de france','copa del rey',
  'uefa european championship qualifiers','world cup qualifying uefa','uefa nations league','uefa euro qualifiers',
  'the emirates fa cup','the fa cup','fa cup',
  'spanish la liga',
  'liga 1 peru','peruvian primera division','liga 1',
  'mexican liga mx','mexican primera league','mexican primera division tournament','liga mx',
  'french ligue 1',
  'american major league soccer','major league soccer',
  'fifa world cup 2026','fifa world cup',
  'english premier league',
  'uefa europa league','italian serie a',
  'fifa international friendlies','international friendlies','international friendly',
])

// Prioridad de ligas para seleccionar los 5 mejores partidos
const PRIORIDAD_LIGA = {
  'fifa world cup 2026': 1, 'fifa world cup': 1,
  'english premier league': 2,
  'spanish la liga': 3,
  'brasileirão série a': 4, 'brazilian serie a': 4, 'brasileirao serie a': 4,
  'copa argentina': 5,
  'liga 1 peru': 6, 'peruvian primera division': 6, 'liga 1': 6,
  'uefa champions league': 7,
  'copa libertadores': 8, 'conmebol libertadores': 8,
  'german bundesliga': 9, 'bundesliga': 9,
  'italian serie a': 10, 'french ligue 1': 11,
  'copa sudamericana': 12, 'conmebol sudamericana': 12,
  'uefa europa league': 13,
}

function getPrioridad(strLeague) {
  return PRIORIDAD_LIGA[(strLeague || '').toLowerCase().trim()] || 99
}

// ─── Generadores con voz TE APUESTO (Crack) ───────────────────────────────────
function generarApuestasFut(formaLocal, formaVisita, partido) {
  const local = tn(partido.strHomeTeam), visita = tn(partido.strAwayTeam)
  const wL = formaLocal.filter(r=>r==='G').length, wV = formaVisita.filter(r=>r==='G').length
  const dL = formaLocal.filter(r=>r==='E').length, dV = formaVisita.filter(r=>r==='E').length
  let a1, a2
  if (wL >= 4)      a1 = { tipo:'🏠 Gana Local', detalle:`${local} arrollador: ${wL} victorias en sus últimos 5. El local es favorito claro.` }
  else if (wV >= 4) a1 = { tipo:'✈️ Gana Visitante', detalle:`${visita} en racha imparable: ${wV} victorias seguidas.` }
  else if (wL >= 3 && wL > wV) a1 = { tipo:'🏠 Gana Local', detalle:`${local} con ${wL} victorias recientes. Ventaja en casa.` }
  else if (wV >= 3 && wV > wL) a1 = { tipo:'✈️ Gana Visitante', detalle:`${visita} llega con ${wV} victorias. Peligroso de visita.` }
  else if (dL>=2&&dV>=2) a1 = { tipo:'🤝 Empate', detalle:'Ambos equipos empatan con frecuencia. El 1X2 en empate puede ser rentable.' }
  else a1 = { tipo:'🔄 Doble Oportunidad 1X', detalle:'Cubre al local y el empate. Partido equilibrado.' }
  if (wL+wV>=6)     a2 = { tipo:'⚽ Más de 2.5 Goles', detalle:'Ambos en racha anotadora. Partido con muchos goles esperado.' }
  else if (wL>=2&&wV>=2) a2 = { tipo:'🎯 Ambos Marcan', detalle:'Los dos equipos han encontrado el gol recientemente.' }
  else if (dL>=3||dV>=3) a2 = { tipo:'📊 Menos de 2.5 Goles', detalle:'Historial de partidos cerrados. Bajo marcador probable.' }
  else a2 = { tipo:'🎯 Ambos Marcan', detalle:'Los dos tienen potencial goleador. Apuesta abierta.' }
  return [a1, a2]
}

const PITCHES_H = [
  (lo,vi,a1,a2)=>`"¡Buena, crack! ¿Ya viste que hoy hay partidazo? ${lo} vs ${vi} y los números hablan solos. La jugada del día es ${a1.tipo} — de cajón. Si quieres más sabor, arma una culebra con ${a2.tipo}. Tu billete puede crecer bonito en TE APUESTO. ¿Qué te late más, crack?"`,
  (lo,vi,a1,a2)=>`"A ver, crack, tú que entiendes de fútbol: ${lo} vs ${vi} hoy. La fija es ${a1.tipo}. Y si quieres subirle, combínala con ${a2.tipo}. Métele sencillo en TE APUESTO y a cobrar rico. ¡Suertudo el que entra temprano!"`,
  (lo,vi,a1,a2)=>`"¡Crack! ${lo} vs ${vi} está que quema. Los números dicen ${a1.tipo} y si quieres el combo redondo, agrega ${a2.tipo}. No dejes el billete parado, las cuotas están increíbles en TE APUESTO. ¡Dale que sí!"`,
  (lo,vi,a1,a2)=>`"Oye, crack, deja de estar misio — hoy hay plata en el ${lo} vs ${vi}. ${a1.tipo} es la jugada inteligente. Súmale ${a2.tipo} y tienes una culebra con buen retorno en TE APUESTO. ¿Le entramos?"`,
]
const PITCHES_C = [
  (lo,vi,a1,a2)=>`¡Cracks, atentos! 👀 Partidazo hoy: ${lo} vs ${vi}. La fija: *${a1.tipo}* y la culebra: *${a2.tipo}*. ¡A cobrar rico en TE APUESTO! 🔥`,
  (lo,vi,a1,a2)=>`¡Buena, cracks! 🙌 ${lo} vs ${vi} hoy. Los que saben meten *${a1.tipo}*, los atrevidos arman culebra con *${a2.tipo}*. ¡Racha ganadora para todos en TE APUESTO!`,
  (lo,vi,a1,a2)=>`Crack, no se lo pierdan 🎯 ${lo} vs ${vi}. Tendencias apuntan a *${a1.tipo}*. Combo: *${a1.tipo}* + *${a2.tipo}*. Métele sencillo en TE APUESTO. ¡De cajón!`,
]

function speechFut(partido, hora, fL, fV) {
  const lo=tn(partido.strHomeTeam), vi=tn(partido.strAwayTeam)
  const [a1,a2] = generarApuestasFut(fL,fV,partido)
  const idx = parseInt(partido.idEvent||0) % PITCHES_H.length
  const fStrL = fL.join(' ')||'Sin datos', fStrV = fV.join(' ')||'Sin datos'
  const rL=rachaLabelFut(fL), rV=rachaLabelFut(fV)
  return `📢 SPEECH DE VENTA — TE APUESTO\n────────────────────────────────\n\n⚽ ${lo} vs ${vi}\n🏆 ${partido.strLeague}  ·  ⏰ ${hora} Lima\n\n📊 TENDENCIAS:\n🏠 ${lo}: ${fStrL}${rL?' → '+rL.text:''}\n✈️  ${vi}: ${fStrV}${rV?' → '+rV.text:''}\n\n💡 2 JUGADAS SUGERIDAS:\n\n1️⃣  ${a1.tipo}\n    ${a1.detalle}\n\n2️⃣  ${a2.tipo}\n    ${a2.detalle}\n\n💬 DILE A TU CLIENTE (crack):\n${PITCHES_H[idx](lo,vi,a1,a2)}\n\n⚠️  Promueve siempre el juego responsable.`
}

function mensajeClubFut(partido, hora, fL, fV) {
  const lo=tn(partido.strHomeTeam), vi=tn(partido.strAwayTeam)
  const [a1,a2] = generarApuestasFut(fL,fV,partido)
  const idx = parseInt(partido.idEvent||0) % PITCHES_C.length
  const rL=rachaLabelFut(fL), rV=rachaLabelFut(fV)
  return `⚽ *${partido.strLeague}*\n🏠 *${lo}* 🆚 *${vi}* ✈️\n🕐 *${hora} Lima*\n\n📊 *Tendencias, cracks:*\n🔵 ${lo}: ${fL.join(' ')||'—'}${rL?' · '+rL.text:''}\n🔴 ${vi}: ${fV.join(' ')||'—'}${rV?' · '+rV.text:''}\n\n🎯 *Jugadas del día:*\n1️⃣ ${a1.tipo}\n   ${a1.detalle}\n\n2️⃣ ${a2.tipo}\n   ${a2.detalle}\n\n${PITCHES_C[idx](lo,vi,a1,a2)}\n\n🔑 Juega responsable · Solo mayores de edad 🙌`
}

// ─── Subcomponentes modales reutilizables ─────────────────────────────────────
function CirculoFut({ r }) {
  const cfg = { G:'bg-green-500 text-white', E:'bg-yellow-400 text-black', P:'bg-red-500 text-white' }
  return <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${cfg[r]||'bg-gray-700 text-gray-400'}`}>{r}</span>
}

function FilaEquipoFut({ nombre, badge, forma, loading }) {
  const racha = rachaLabelFut(forma)
  return (
    <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
      {badge
        ? <img src={badge+'/tiny'} alt={nombre} className="w-10 h-10 object-contain" onError={e=>{e.target.style.display='none'}} />
        : <div className="w-10 h-10 rounded-xl bg-brand-medium flex items-center justify-center text-lg">⚽</div>
      }
      <p className="text-xs font-bold text-white text-center leading-tight line-clamp-2">{nombre}</p>
      <p className="text-[10px] text-gray-500">Últimos 5</p>
      {loading
        ? <div className="flex gap-1">{[1,2,3,4,5].map(i=><div key={i} className="w-6 h-6 rounded-full bg-brand-medium animate-pulse"/>)}</div>
        : <div className="flex gap-1 flex-wrap justify-center">{forma.length ? forma.map((r,i)=><CirculoFut key={i} r={r}/>) : <span className="text-[10px] text-gray-600">Sin datos</span>}</div>
      }
      {!loading && racha && <p className={`text-[10px] font-bold text-center ${racha.color}`}>{racha.text}</p>}
    </div>
  )
}

function TendenciasModalHome({ partido, onClose, onOpenModal }) {
  const [loading, setLoading]       = useState(true)
  const [formaLocal, setFormaLocal]   = useState([])
  const [formaVisita, setFormaVisita] = useState([])
  const hora = formatHoraFut(partido.strTime)

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetch(`https://www.thesportsdb.com/api/v1/json/${FUT_API}/eventslast.php?id=${partido.idHomeTeam}`,{signal:ctrl.signal}).then(r=>r.json()),
      fetch(`https://www.thesportsdb.com/api/v1/json/${FUT_API}/eventslast.php?id=${partido.idAwayTeam}`,{signal:ctrl.signal}).then(r=>r.json()),
    ]).then(([dL,dV])=>{
      setFormaLocal(calcularFormaFut(dL.results||[],partido.idHomeTeam))
      setFormaVisita(calcularFormaFut(dV.results||[],partido.idAwayTeam))
      setLoading(false)
    }).catch(()=>setLoading(false))
    return ()=>ctrl.abort()
  },[partido.idHomeTeam, partido.idAwayTeam])

  const wL=formaLocal.filter(r=>r==='G').length, wV=formaVisita.filter(r=>r==='G').length
  const dL=formaLocal.filter(r=>r==='E').length
  const consejo = !loading ? (
    wL>=4 ? `${tn(partido.strHomeTeam)} llega arrollador con ${wL} victorias en sus últimos 5. Favorito claro en casa.` :
    wV>=4 ? `${tn(partido.strAwayTeam)} viene en racha imparable: ${wV} victorias seguidas. Visitante muy peligroso.` :
    wL>=3&&wV<=1 ? `${tn(partido.strHomeTeam)} tiene ventaja clara en forma. Buen momento para apostar por el local.` :
    wV>=3&&wL<=1 ? `${tn(partido.strAwayTeam)} llega con más confianza. El visitante puede sorprender hoy.` :
    dL>=3 ? `${tn(partido.strHomeTeam)} viene empatando mucho. El empate es una opción interesante.` :
    `Partido equilibrado. Ideal para apuesta combinada.`
  ) : ''

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center p-4" style={{bottom:'65px', backgroundColor:'rgba(0,0,0,0.80)'}} onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 overflow-hidden flex flex-col" style={{backgroundColor:'#1a1a2e', maxHeight:'calc(100% - 16px)'}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{partido.strLeague}</p>
            <p className="text-xs text-brand-orange font-bold">📊 Tendencias · ⏰ {hora} Lima</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-white font-bold text-lg flex-shrink-0" style={{backgroundColor:'#2a2a3e'}}>✕</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-2 px-3 py-3">
            <FilaEquipoFut nombre={tn(partido.strHomeTeam)} badge={partido.strHomeTeamBadge} forma={formaLocal} loading={loading}/>
            <div className="flex flex-col items-center justify-center flex-shrink-0 pt-2"><span className="text-gray-600 font-black text-base">VS</span></div>
            <FilaEquipoFut nombre={tn(partido.strAwayTeam)} badge={partido.strAwayTeamBadge} forma={formaVisita} loading={loading}/>
          </div>
          {loading
            ? <div className="mx-3 mb-3 h-14 rounded-2xl animate-pulse" style={{backgroundColor:'#2a2a3e'}}/>
            : consejo && <div className="mx-3 mb-3 rounded-2xl p-3" style={{backgroundColor:'rgba(234,179,8,0.1)',border:'1px solid rgba(234,179,8,0.2)'}}>
                <p className="text-[10px] font-black text-yellow-400 mb-1">💡 CONSEJO DE VENTA</p>
                <p className="text-xs text-gray-300 leading-relaxed">{consejo}</p>
              </div>
          }
        </div>
        <div className="flex gap-2 px-3 pb-4 pt-2 border-t border-white/5 flex-shrink-0">
          <button onClick={()=>{onClose();onOpenModal(partido,'tendencias')}} className="flex-1 py-3 rounded-xl text-sm font-bold text-green-400" style={{backgroundColor:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)'}}>📊 Tendencias</button>
          <button onClick={()=>{onClose();onOpenModal(partido,'speech')}} className="flex-1 py-3 rounded-xl text-sm font-bold text-brand-orange" style={{backgroundColor:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.3)'}}>📢 Speech</button>
          <button onClick={()=>{onClose();onOpenModal(partido,'club')}} className="flex-1 py-3 rounded-xl text-sm font-bold text-blue-400" style={{backgroundColor:'rgba(59,130,246,0.1)',border:'1px solid rgba(59,130,246,0.3)'}}>📋 Msj CTA</button>
        </div>
      </div>
    </div>
  )
}

function ModalTextoHome({ partido, tipo, onClose }) {
  const [loading, setLoading]       = useState(true)
  const [formaLocal, setFormaLocal]   = useState([])
  const [formaVisita, setFormaVisita] = useState([])
  const [copiado, setCopiado]       = useState(false)
  const hora = formatHoraFut(partido.strTime)
  const esSpeech = tipo === 'speech'
  const esTendencias = tipo === 'tendencias'

  useEffect(() => {
    const ctrl = new AbortController()
    Promise.all([
      fetch(`https://www.thesportsdb.com/api/v1/json/${FUT_API}/eventslast.php?id=${partido.idHomeTeam}`,{signal:ctrl.signal}).then(r=>r.json()),
      fetch(`https://www.thesportsdb.com/api/v1/json/${FUT_API}/eventslast.php?id=${partido.idAwayTeam}`,{signal:ctrl.signal}).then(r=>r.json()),
    ]).then(([dL,dV])=>{
      setFormaLocal(calcularFormaFut(dL.results||[],partido.idHomeTeam))
      setFormaVisita(calcularFormaFut(dV.results||[],partido.idAwayTeam))
      setLoading(false)
    }).catch(()=>setLoading(false))
    return ()=>ctrl.abort()
  },[partido.idHomeTeam, partido.idAwayTeam])

  function tendenciasFut(p, h, fL, fV) {
    const rL = rachaLabelFut(fL), rV = rachaLabelFut(fV)
    const wL = fL.filter(r=>r==='G').length, wV = fV.filter(r=>r==='G').length
    const consejo = wL>=3&&wV<=1 ? `${tn(p.strHomeTeam)} llega con ventaja clara. Favorito local.`
      : wV>=3&&wL<=1 ? `${tn(p.strAwayTeam)} viene en racha. Visitante peligroso.`
      : `Partido equilibrado. Ideal para combinada.`
    return `📊 TENDENCIAS · ${p.strLeague}\n🏠 ${tn(p.strHomeTeam)} vs ${tn(p.strAwayTeam)} ✈️\n🕐 ${h} Lima\n\n🔵 ${tn(p.strHomeTeam)}\nÚltimos 5: ${fL.join(' ')||'—'}${rL?' · '+rL.text:''}\n\n🔴 ${tn(p.strAwayTeam)}\nÚltimos 5: ${fV.join(' ')||'—'}${rV?' · '+rV.text:''}\n\n💡 ${consejo}\n\n🔑 Juega responsable · Solo mayores de edad`
  }
  const texto = !loading ? (esSpeech ? speechFut(partido,hora,formaLocal,formaVisita) : esTendencias ? tendenciasFut(partido,hora,formaLocal,formaVisita) : mensajeClubFut(partido,hora,formaLocal,formaVisita)) : ''

  function copiar() {
    navigator.clipboard.writeText(texto).then(()=>{setCopiado(true);setTimeout(()=>setCopiado(false),2500)}).catch(()=>{})
  }

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center p-4" style={{bottom:'65px', backgroundColor:'rgba(0,0,0,0.80)'}} onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border border-white/10 overflow-hidden flex flex-col" style={{backgroundColor:'#1a1a2e', maxHeight:'calc(100% - 16px)'}} onClick={e=>e.stopPropagation()}>
        <div className={`flex items-center justify-between px-4 py-3 border-b border-white/5 ${esSpeech?'bg-orange-500/10':esTendencias?'bg-green-500/10':'bg-blue-500/10'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{esSpeech?'📢':esTendencias?'📊':'📋'}</span>
            <div>
              <p className={`text-xs font-black ${esSpeech?'text-brand-orange':esTendencias?'text-green-400':'text-blue-400'}`}>{esSpeech?'SPEECH DE VENTA':esTendencias?'ANÁLISIS DE TENDENCIAS':'MENSAJE CTA'}</p>
              <p className="text-[10px] text-gray-500 truncate">{tn(partido.strHomeTeam)} vs {tn(partido.strAwayTeam)}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white font-bold" style={{backgroundColor:'#2a2a3e'}}>✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loading
            ? <div className="space-y-3">{[1,2,3,4,5].map(i=><div key={i} className={`h-4 rounded-full bg-brand-medium animate-pulse ${i%2===0?'w-3/4':'w-full'}`}/>)}<p className="text-center text-xs text-gray-600 animate-pulse mt-4">Analizando tendencias...</p></div>
            : <pre className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap font-sans">{texto}</pre>
          }
        </div>
        {!loading && (
          <div className="px-4 pb-4 pt-2 border-t border-white/5">
            <button onClick={copiar} className={`w-full py-3 rounded-xl text-sm font-black transition-all ${copiado?'bg-green-500 text-white':esSpeech?'bg-brand-orange text-white':esTendencias?'bg-green-600 text-white':'bg-blue-500 text-white'}`}>
              {copiado?'✓ ¡Copiado al portapapeles!':'📋 Copiar texto completo'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Widget: Partidos más importantes del día ─────────────────────────────────
function PartidosDelDia({ onNavigate }) {
  const [loading, setLoading]           = useState(true)
  const [top5, setTop5]                 = useState([])
  const [formas, setFormas]             = useState({})   // idEvent → forma[]
  const [selectedPartido, setSelected]   = useState(null) // modal tendencias
  const [selectedModal, setSelectedModal]= useState(null) // { partido, tipo }

  useEffect(() => {
    const fechaLima   = getFechaLima()
    const fechaManana = getFechaMananaLima()
    Promise.all([
      fetch(`https://www.thesportsdb.com/api/v1/json/${FUT_API}/eventsday.php?d=${fechaLima}&s=Soccer`).then(r=>r.json()),
      fetch(`https://www.thesportsdb.com/api/v1/json/${FUT_API}/eventsday.php?d=${fechaManana}&s=Soccer`).then(r=>r.json()),
    ])
      .then(([dataHoy, dataManana]) => {
        const filtrarLiga = evs => (evs||[]).filter(p => LIGAS_HOME.has((p.strLeague||'').toLowerCase().trim()))
        // Partidos de hoy que aún no terminaron (en hora Lima)
        const vigentesHoy = filtrarLiga(dataHoy.events).filter(p => !partidoTerminado(p.dateEvent, p.strTime))
        const manana = filtrarLiga(dataManana.events).map(p => ({...p, _esManana: true}))
        // Si hay partidos hoy → úsalos y rellena con mañana si hacen falta; si no → solo mañana
        const combined = vigentesHoy.length > 0
          ? vigentesHoy.length >= 5 ? vigentesHoy : [...vigentesHoy, ...manana]
          : manana
        const top = [...combined].sort((a,b) => getPrioridad(a.strLeague)-getPrioridad(b.strLeague)).slice(0,5)
        setTop5(top)
        return Promise.all(
          top.map(p =>
            fetch(`https://www.thesportsdb.com/api/v1/json/${FUT_API}/eventslast.php?id=${p.idHomeTeam}`)
              .then(r=>r.json())
              .then(d=>({ id: p.idEvent, forma: calcularFormaFut(d.results||[], p.idHomeTeam) }))
              .catch(()=>({ id: p.idEvent, forma: [] }))
          )
        )
      })
      .then(results => {
        const map = {}
        results.forEach(r => { map[r.id] = r.forma })
        setFormas(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (!loading && top5.length === 0) return null

  const SKELETON = [1,2,3,4,5]

  return (
    <>
      {/* Modales */}
      {selectedPartido && (
        <TendenciasModalHome
          partido={selectedPartido}
          onClose={() => setSelected(null)}
          onOpenModal={(p, t) => { setSelected(null); setSelectedModal({ partido: p, tipo: t }) }}
        />
      )}
      {selectedModal && (
        <ModalTextoHome
          partido={selectedModal.partido}
          tipo={selectedModal.tipo}
          onClose={() => setSelectedModal(null)}
        />
      )}

      {/* Widget dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-1">

        {/* ── COLUMNA IZQUIERDA: Partidos ── */}
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{backgroundColor:'#12122a'}}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-wider">⚽ Partidos del día</p>
            <button onClick={() => onNavigate('calendario')} className="text-[11px] text-brand-orange font-bold hover:underline">Ver todos →</button>
          </div>

          {loading
            ? SKELETON.map(i => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 animate-pulse">
                  <div className="w-10 h-8 bg-brand-medium rounded-lg flex-shrink-0"/>
                  <div className="w-6 h-6 rounded-full bg-brand-medium flex-shrink-0"/>
                  <div className="flex-1 h-3 bg-brand-medium rounded-full"/>
                  <div className="w-6 h-3 bg-brand-medium rounded-full flex-shrink-0"/>
                  <div className="flex-1 h-3 bg-brand-medium rounded-full"/>
                  <div className="w-6 h-6 rounded-full bg-brand-medium flex-shrink-0"/>
                </div>
              ))
            : top5.map((p, i) => (
                <button
                  key={p.idEvent}
                  onClick={() => setSelected(p)}
                  className="w-full items-center px-3 py-2.5 border-b border-white/5 hover:bg-white/5 transition-all text-left"
                  style={{display:'grid', gridTemplateColumns:'36px 22px 1fr 20px 1fr 22px', gap:'4px', overflow:'hidden'}}
                >
                  {/* Hora + liga */}
                  <div className="text-center overflow-hidden">
                    <p className="text-[11px] font-black text-brand-orange leading-none">{formatHoraFut(p.strTime)}</p>
                    {p._esManana && <p className="text-[7px] text-blue-400 font-bold leading-none">Mañana</p>}
                    <p className="text-[8px] text-gray-600 mt-0.5 leading-none truncate">{(p.strLeague||'').split(' ')[0]}</p>
                  </div>
                  {/* Escudo local */}
                  <div className="flex items-center justify-center">
                    {p.strHomeTeamBadge
                      ? <img src={p.strHomeTeamBadge+'/tiny'} className="w-5 h-5 object-contain" onError={e=>{e.target.style.display='none'}}/>
                      : <span className="text-sm">⚽</span>
                    }
                  </div>
                  {/* Nombre local */}
                  <p className="text-[11px] font-bold text-white truncate overflow-hidden">{tn(p.strHomeTeam)}</p>
                  {/* VS */}
                  <p className="text-[9px] text-gray-600 font-black text-center">vs</p>
                  {/* Nombre visitante */}
                  <p className="text-[11px] font-bold text-gray-300 truncate overflow-hidden text-right">{tn(p.strAwayTeam)}</p>
                  {/* Escudo visitante */}
                  <div className="flex items-center justify-center">
                    {p.strAwayTeamBadge
                      ? <img src={p.strAwayTeamBadge+'/tiny'} className="w-5 h-5 object-contain" onError={e=>{e.target.style.display='none'}}/>
                      : <span className="text-sm">⚽</span>
                    }
                  </div>
                </button>
              ))
          }
        </div>

        {/* ── COLUMNA DERECHA: Rachas y Consejos ── */}
        <div className="rounded-2xl border border-white/5 overflow-hidden flex flex-col" style={{backgroundColor:'#12122a'}}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-wider">📊 Rachas y Consejos</p>
            <button
              onClick={() => onNavigate('games')}
              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition-all"
            >
              🎮 Practicar
            </button>
          </div>

          <div className="flex-1">
            {loading
              ? SKELETON.map(i => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-brand-medium flex-shrink-0"/>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-brand-medium rounded-full w-3/4"/>
                      <div className="flex gap-1">{[1,2,3,4,5].map(j=><div key={j} className="w-5 h-5 rounded-full bg-brand-medium"/>)}</div>
                    </div>
                    <div className="w-20 h-6 bg-brand-medium rounded-lg"/>
                  </div>
                ))
              : top5.map((p, i) => {
                  const forma = formas[p.idEvent] || []
                  const racha = rachaLabelFut(forma)
                  const consejo = consejoLocal(p.strHomeTeam, forma)
                  const trendIcon = !forma.length ? '❓'
                    : forma.filter(r=>r==='G').length >= 3 ? '📈'
                    : forma.filter(r=>r==='P').length >= 3 ? '📉' : '⚠️'

                  return (
                    <button
                      key={p.idEvent}
                      onClick={() => setSelected(p)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 border-b border-white/5 hover:bg-white/5 transition-all text-left"
                    >
                      {/* Badge equipo local */}
                      {p.strHomeTeamBadge
                        ? <img src={p.strHomeTeamBadge+'/tiny'} className="w-8 h-8 object-contain flex-shrink-0" onError={e=>{e.target.style.display='none'}}/>
                        : <div className="w-8 h-8 rounded-full bg-brand-medium flex items-center justify-center text-sm flex-shrink-0">⚽</div>
                      }
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-white truncate leading-none">{tn(p.strHomeTeam)}</p>
                        <div className="flex gap-0.5 mt-1">
                          {forma.length
                            ? forma.map((r,j) => <CirculoFut key={j} r={r}/>)
                            : <span className="text-[9px] text-gray-600">Cargando...</span>
                          }
                        </div>
                        {racha && <p className={`text-[9px] font-bold mt-0.5 ${racha.color}`}>{racha.text}</p>}
                      </div>
                      {/* Consejo */}
                      <div className="flex-shrink-0 max-w-[100px] hidden sm:block">
                        <p className="text-[9px] text-gray-500 leading-tight line-clamp-2">{consejo}</p>
                      </div>
                      {/* Trend */}
                      <span className="text-base flex-shrink-0">{trendIcon}</span>
                    </button>
                  )
                })
            }
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Noticias para conversar con clientes ────────────────────────────────────

const TIPS_ESTATICOS = [
  {
    id: 'mundial1',
    imagen: 'https://www.thesportsdb.com/images/media/league/badge/bsq3tr1520107799.png',
    titulo: '🌍 Mundial 2026: 48 equipos, 3 sedes',
    resumen: 'EE.UU., México y Canadá recibirán el torneo más grande de la historia con 104 partidos. Perú clasifica por primera vez desde 1982.',
    tag: 'Mundial 2026',
    tipPromo: '¿Sabías que el Mundial 2026 es el más grande de la historia? Dile a tu cliente que TE APUESTO tendrá todos los mercados disponibles desde el día 1. ¡Es el momento de entrar!',
  },
  {
    id: 'mundial2',
    imagen: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/2026_FIFA_World_Cup_emblem.svg/600px-2026_FIFA_World_Cup_emblem.svg.png',
    titulo: '⚽ Los favoritos al título',
    resumen: 'Brasil, Francia, Inglaterra y Argentina llegan como favoritos al Mundial. Mbappé, Vinicius Jr. y Bellingham son las estrellas a seguir.',
    tag: 'Análisis',
    tipPromo: 'Pregúntale: "¿A quién apoyas para el Mundial?" Luego muéstrale que en TE APUESTO puede apostar a su selección favorita desde ya. Es un gancho natural.',
  },
  {
    id: 'goleadores',
    imagen: 'https://www.thesportsdb.com/images/media/league/badge/i6o0kh1549879062.png',
    titulo: '🥇 Goleadores del momento',
    resumen: 'Vinicius Jr. en Real Madrid, Lautaro Martínez en Inter y Erling Haaland en City lideran las tablas de goleadores europeos esta temporada.',
    tag: 'Estrellas',
    tipPromo: 'Usa a las estrellas como gancho: "¿Crees que Haaland anota hoy?" Es una conversación fácil que lleva a proponer una apuesta de goleador.',
  },
  {
    id: 'ligaperu',
    imagen: 'https://www.thesportsdb.com/images/media/league/badge/2zr0b21547214738.png',
    titulo: '🇵🇪 Liga 1 Perú: lo que no te puedes perder',
    resumen: 'Alianza Lima, Universitario y Sporting Cristal pelean el título local. La hinchada peruana vibra con cada jornada.',
    tag: 'Liga 1',
    tipPromo: 'El cliente peruano siempre tiene equipo. Pregunta cuál hincha y ofrécele apostar al clásico más próximo. Lo de "la fija" siempre engancha.',
  },
  {
    id: 'transfer',
    imagen: 'https://www.thesportsdb.com/images/media/league/badge/wrz3hr1549880359.png',
    titulo: '💸 Mercado de pases: las bombas del verano',
    resumen: 'Se esperan traspasos millonarios en Europa. Los clubes de Arabia Saudita siguen tentando a figuras como Mbappé y Neymar.',
    tag: 'Fichajes',
    tipPromo: 'Los fichajes generan conversación. Pregunta: "¿Crees que [jugador] va a triunfar en su nuevo equipo?" Transita hacia apuestas de rendimiento de equipo.',
  },
]

function generarTipConversacion(headline) {
  const hl = (headline || '').toLowerCase()
  if (hl.includes('mundial') || hl.includes('world cup')) return `El Mundial 2026 es el tema del año. Dile a tu cliente: "¿Ya tienes tu favorito para el título?" y llevas la conversación a TE APUESTO de forma natural.`
  if (hl.includes('golea') || hl.includes('gol') || hl.includes('scorer')) return `Los goles generan emoción. Pregunta: "¿Crees que [equipo] va a marcar hoy?" Es el puente perfecto para proponer una apuesta de goles.`
  if (hl.includes('lesion') || hl.includes('baja') || hl.includes('injury')) return `Las lesiones cambian el partido. Usa esto: "Con [jugador] fuera, ¿cómo ves el partido?" Eso despierta el análisis del cliente y su interés en apostar.`
  if (hl.includes('ficha') || hl.includes('transfer') || hl.includes('traspaso')) return `Los fichajes generan debate. Pregunta: "¿Crees que [jugador] va a triunfar en su nuevo equipo?" Lleva la charla a apostar por ese equipo.`
  if (hl.includes('champion') || hl.includes('liga') || hl.includes('copa')) return `Una copa importante siempre engancha. Di: "¿Ya viste lo que pasó ayer? Hoy tenemos ese partido en TE APUESTO." Directo al grano.`
  return `Esta noticia es un gran tema de conversación. Compártela con tu cliente para romper el hielo y llevar la charla hacia los partidos de hoy en TE APUESTO.`
}

function tarjetaFecha(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', timeZone: 'America/Lima' })
  } catch { return '' }
}

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/&aacute;/g,'á').replace(/&eacute;/g,'é').replace(/&iacute;/g,'í').replace(/&oacute;/g,'ó').replace(/&uacute;/g,'ú').replace(/&ntilde;/g,'ñ')
    .replace(/\s+/g,' ').trim()
}

// ─── Contenido conversacional para partidos ──────────────────────────────────

function contextoLiga(strLeague) {
  const l = (strLeague||'').toLowerCase().trim()
  if (l.includes('world cup')||l.includes('mundial')) return { emoji:'🌍', texto:'Mundial 2026',       color:'#facc15' }
  if (l.includes('champions'))                         return { emoji:'⭐', texto:'Champions League',   color:'#60a5fa' }
  if (l.includes('libertadores'))                      return { emoji:'🏆', texto:'Libertadores',       color:'#34d399' }
  if (l.includes('sudamericana'))                      return { emoji:'🥈', texto:'Sudamericana',       color:'#94a3b8' }
  if (l.includes('premier'))                           return { emoji:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', texto:'Premier League', color:'#a78bfa' }
  if (l.includes('liga 1')||l.includes('peru'))        return { emoji:'🇵🇪', texto:'Liga 1 Perú',       color:'#f97316' }
  if (l.includes('bundesliga'))                        return { emoji:'🇩🇪', texto:'Bundesliga',         color:'#e11d48' }
  if (l.includes('serie a')&&!l.includes('brazilian')) return { emoji:'🇮🇹', texto:'Serie A',           color:'#3b82f6' }
  if (l.includes('ligue'))                             return { emoji:'🇫🇷', texto:'Ligue 1',            color:'#6366f1' }
  if (l.includes('la liga')||l.includes('spanish'))    return { emoji:'🇪🇸', texto:'La Liga',            color:'#ef4444' }
  if (l.includes('brasileirao')||l.includes('brazilian')) return { emoji:'🇧🇷', texto:'Brasileirão',    color:'#22c55e' }
  if (l.includes('copa argentina'))                    return { emoji:'🇦🇷', texto:'Copa Argentina',    color:'#60a5fa' }
  if (l.includes('copa colombia')||l.includes('betplay')) return { emoji:'🇨🇴', texto:'Copa Colombia',  color:'#facc15' }
  if (l.includes('copa do brasil'))                    return { emoji:'🇧🇷', texto:'Copa do Brasil',    color:'#22c55e' }
  if (l.includes('europa'))                            return { emoji:'🏅', texto:'Europa League',       color:'#f97316' }
  if (l.includes('fa cup'))                            return { emoji:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', texto:'FA Cup',       color:'#a78bfa' }
  if (l.includes('nations league'))                    return { emoji:'🌐', texto:'Nations League',      color:'#60a5fa' }
  if (l.includes('friendly')||l.includes('amistoso'))  return { emoji:'🤝', texto:'Amistoso',           color:'#9ca3af' }
  if (l.includes('mls'))                               return { emoji:'🇺🇸', texto:'MLS',               color:'#ef4444' }
  if (l.includes('liga mx')||l.includes('mexican'))    return { emoji:'🇲🇽', texto:'Liga MX',           color:'#22c55e' }
  return { emoji:'⚽', texto: strLeague||'Fútbol',                                                       color:'#9ca3af' }
}

function generarDatoClave(fL, fV, local, visita) {
  const wL=fL.filter(r=>r==='G').length, wV=fV.filter(r=>r==='G').length
  const dL=fL.filter(r=>r==='E').length, dV=fV.filter(r=>r==='E').length
  const lL=fL.filter(r=>r==='P').length, lV=fV.filter(r=>r==='P').length
  if (!fL.length&&!fV.length) return `Partido a seguir de cerca. Consulta las cuotas en TE APUESTO antes de recomendar.`
  if (wL>=4&&wV<=1) return `🔥 ${local} arrollador: ${wL}/5 victorias. ${visita} sin ganar recientemente. Ventaja clara del local.`
  if (wV>=4&&wL<=1) return `🔥 ${visita} en racha: ${wV}/5 victorias. El visitante llega con mucha confianza hoy.`
  if (wL>=3&&wV>=3) return `⚡ Duelo parejo: ambos en forma. Buen partido para "Ambos Marcan" o Más de 2.5 goles.`
  if (dL>=3||dV>=3) return `🤝 Historial de empates frecuentes. El mercado "Empate" o Doble Oportunidad puede ser interesante.`
  if (lL>=3) return `📉 ${local} en dificultades: ${lL} derrotas recientes. El visitante tiene ventaja hoy.`
  if (lV>=3) return `📉 ${visita} no levanta (${lV} derrotas). El local es favorito claro en este momento.`
  if (wL>=3) return `📈 ${local} llega en buena forma: ${wL} victorias recientes. De local tiene ventaja.`
  if (wV>=3) return `📈 ${visita} viene ganando ${wV}/5. Puede sorprender de visitante.`
  return `Partido equilibrado. Ideal para una combinada o Doble Oportunidad en TE APUESTO.`
}

function generarPreguntaGancho(partido, fL, fV) {
  const lo=tn(partido.strHomeTeam), vi=tn(partido.strAwayTeam)
  const wL=fL.filter(r=>r==='G').length, wV=fV.filter(r=>r==='G').length
  const liga=(partido.strLeague||'').toLowerCase()
  if (liga.includes('world cup')||liga.includes('mundial')) return `"¿Ya viste que hoy juega el Mundial? ¡Hay cuotas increíbles en TE APUESTO, crack!"`
  if (liga.includes('liga 1')||liga.includes('peru'))       return `"¿Eres de ${lo} o de ${vi}? Hoy juegan — todo en TE APUESTO."`
  if (liga.includes('libertadores'))                         return `"Hoy es Copa Libertadores — lo más grande de Sudamérica. ¿Le entramos?"`
  if (liga.includes('champions'))                            return `"¿Ya viste que hoy es Champions? ${wL>=3?lo+' viene muy fuerte':wV>=3?vi+' es favorito':'Partido muy igualado'}."`
  if (wL>=4) return `"¿Sabías que ${lo} viene con ${wL} victorias seguidas? Hoy de local es el favorito claro."`
  if (wV>=4) return `"¿Sabías que ${vi} viene en racha imparable? Hoy puede sorprender de visitante."`
  return `"¿Ya viste que hoy hay ${lo} vs ${vi}? ¿A quién ves ganando? En TE APUESTO está disponible."`
}

// ── Tarjeta de partido con contenido para conversar con el cliente ────────────
function MatchCardNoticias({ card, tipAbierto, onToggleTip, onSelect }) {
  const { partido, formaL, formaV, hora } = card
  const rachaL  = rachaLabelFut(formaL||[])
  const rachaV  = rachaLabelFut(formaV||[])
  const isOpen  = tipAbierto === card.id
  const liga    = contextoLiga(partido.strLeague)
  const dato    = generarDatoClave(formaL||[], formaV||[], tn(partido.strHomeTeam), tn(partido.strAwayTeam))
  const gancho  = generarPreguntaGancho(partido, formaL||[], formaV||[])

  return (
    <div className="flex-shrink-0 w-64 rounded-2xl overflow-hidden flex flex-col"
      style={{backgroundColor:'#1e1e3a', border:`1px solid ${liga.color}44`, scrollSnapAlign:'start'}}>

      {/* Header — clic abre modal tendencias */}
      <div className="p-3 flex flex-col gap-2 cursor-pointer"
        style={{background:`linear-gradient(135deg,${liga.color}18 0%,rgba(30,30,58,0) 100%)`}}
        onClick={() => onSelect(partido)}>

        {/* Liga + cuando */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full truncate max-w-[120px]"
            style={{color:liga.color, backgroundColor:`${liga.color}20`}}>
            {liga.emoji} {liga.texto}
          </span>
          <span className="text-[9px] font-black flex-shrink-0"
            style={{color: partido._esManana ? '#60a5fa' : '#f97316'}}>
            ⏰ {hora} · {partido._esManana ? 'Mañana' : 'Hoy'}
          </span>
        </div>

        {/* Equipos: escudo · nombre · forma — ambos equipos */}
        <div className="flex items-start gap-2">
          {/* Local */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            {partido.strHomeTeamBadge
              ? <img src={partido.strHomeTeamBadge+'/tiny'} className="w-9 h-9 object-contain" onError={e=>{e.target.style.display='none'}}/>
              : <span className="text-2xl">⚽</span>}
            <p className="text-[9px] font-bold text-white text-center line-clamp-2 leading-tight">{tn(partido.strHomeTeam)}</p>
            <div className="flex gap-0.5 flex-wrap justify-center">
              {(formaL||[]).length
                ? (formaL||[]).map((r,i)=><CirculoFut key={i} r={r}/>)
                : <span className="text-[8px] text-gray-600">—</span>}
            </div>
            {rachaL && <p className={`text-[8px] font-bold text-center ${rachaL.color}`}>{rachaL.text}</p>}
          </div>

          <span className="text-[11px] text-gray-600 font-black pt-4 flex-shrink-0">VS</span>

          {/* Visitante */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
            {partido.strAwayTeamBadge
              ? <img src={partido.strAwayTeamBadge+'/tiny'} className="w-9 h-9 object-contain" onError={e=>{e.target.style.display='none'}}/>
              : <span className="text-2xl">⚽</span>}
            <p className="text-[9px] font-bold text-white text-center line-clamp-2 leading-tight">{tn(partido.strAwayTeam)}</p>
            <div className="flex gap-0.5 flex-wrap justify-center">
              {(formaV||[]).length
                ? (formaV||[]).map((r,i)=><CirculoFut key={i} r={r}/>)
                : <span className="text-[8px] text-gray-600">—</span>}
            </div>
            {rachaV && <p className={`text-[8px] font-bold text-center ${rachaV.color}`}>{rachaV.text}</p>}
          </div>
        </div>

        {/* Dato clave */}
        <div className="p-2 rounded-xl" style={{backgroundColor:'rgba(234,179,8,0.08)',border:'1px solid rgba(234,179,8,0.18)'}}>
          <p className="text-[9px] font-bold text-yellow-400 mb-0.5">💡 Dato clave</p>
          <p className="text-[9px] text-yellow-200 leading-snug">{dato}</p>
        </div>
      </div>

      {/* Footer: pregunta gancho */}
      <div className="p-2 flex flex-col gap-1 mt-auto">
        <button
          onClick={e=>{ e.stopPropagation(); onToggleTip(card.id) }}
          className="w-full py-1.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all"
          style={isOpen
            ? {backgroundColor:'rgba(234,179,8,0.15)',color:'#facc15',border:'1px solid rgba(234,179,8,0.3)'}
            : {backgroundColor:`${liga.color}12`,color:liga.color,border:`1px solid ${liga.color}35`}
          }
        >
          <span>{isOpen ? '🔼' : '💬'}</span>
          {isOpen ? 'Cerrar' : 'Pregunta gancho para cliente'}
        </button>
        {isOpen && (
          <div className="p-2 rounded-xl" style={{backgroundColor:'rgba(234,179,8,0.08)',border:'1px solid rgba(234,179,8,0.2)'}}>
            <p className="text-[9px] font-bold text-yellow-400 mb-0.5">🗣️ Dile a tu cliente:</p>
            <p className="text-[10px] text-yellow-200 leading-relaxed italic">{gancho}</p>
          </div>
        )}
        <p className="text-[9px] text-center text-gray-600">Toca la tarjeta → ver tendencias completas</p>
      </div>
    </div>
  )
}

// ── Tarjeta de noticia ────────────────────────────────────────────────────────
function NewsCardNoticias({ card, tipAbierto, onToggleTip }) {
  const isOpen = tipAbierto === card.id
  const acento = card.fuente === 'Depor' ? {text:'#f97316',bg:'rgba(249,115,22,0.12)',border:'rgba(249,115,22,0.25)'} :
                 card.fuente === 'AS'    ? {text:'#ef4444',bg:'rgba(239,68,68,0.12)', border:'rgba(239,68,68,0.25)'}  :
                 card.fuente === 'Marca' ? {text:'#3b82f6',bg:'rgba(59,130,246,0.12)',border:'rgba(59,130,246,0.25)'} :
                                          {text:'#a78bfa',bg:'rgba(167,139,250,0.12)',border:'rgba(167,139,250,0.25)'}
  return (
    <div className="flex-shrink-0 w-60 rounded-2xl overflow-hidden flex flex-col"
      style={{backgroundColor:'#1e1e3a',border:`1px solid ${acento.border}`,scrollSnapAlign:'start'}}>
      {card.imagen
        ? <img src={card.imagen} alt={card.titulo} className="w-full h-28 object-cover"
            onError={e=>{ e.target.style.display='none'; e.target.nextSibling.style.display='flex' }}/>
        : null}
      <div className="h-28 items-center justify-center text-5xl flex-shrink-0"
        style={{display:card.imagen?'none':'flex',background:`linear-gradient(135deg,${acento.bg},rgba(30,30,58,0.6))`}}>
        📰
      </div>
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0"
            style={{color:acento.text,backgroundColor:acento.bg,border:`1px solid ${acento.border}`}}>
            {card.emoji} {card.fuente}
          </span>
          {card.fecha && <span className="text-[9px] text-gray-500 flex-shrink-0">{card.fecha}</span>}
        </div>
        {card.tag && card.tag !== card.fuente && (
          <span className="text-[9px] text-gray-500 uppercase tracking-wider">{card.tag}</span>
        )}
        <p className="text-[12px] font-black text-white leading-snug line-clamp-3">{card.titulo}</p>
        {card.resumen && (
          <p className="text-[10px] text-gray-300 leading-relaxed line-clamp-5 flex-1">{card.resumen}</p>
        )}
        <div className="mt-1">
          <button onClick={() => onToggleTip(card.id)}
            className="w-full py-1.5 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all"
            style={isOpen
              ? {backgroundColor:'rgba(234,179,8,0.15)',color:'#facc15',border:'1px solid rgba(234,179,8,0.3)'}
              : {backgroundColor:acento.bg,color:acento.text,border:`1px solid ${acento.border}`}
            }>
            <span>{isOpen ? '🔼' : '💬'}</span>
            {isOpen ? 'Cerrar tip' : 'Tip para cliente'}
          </button>
          {isOpen && (
            <div className="mt-2 p-2 rounded-xl text-[10px] text-yellow-200 leading-relaxed"
              style={{backgroundColor:'rgba(234,179,8,0.08)',border:'1px solid rgba(234,179,8,0.2)'}}>
              💡 {card.tipPromo}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Carrusel de noticias para conversar con clientes ─────────────────────────
function NoticiasDelDia() {
  const [allCards, setAllCards]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [tipAbierto, setTipAbierto] = useState(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [canLeft, setCanLeft]     = useState(false)
  const [canRight, setCanRight]   = useState(true)
  const scrollRef = useRef(null)
  const CARD_W = 252  // w-60 = 240 + gap 12

  const actualizarCarril = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / CARD_W)
    setActiveIdx(idx)
    setCanLeft(el.scrollLeft > 8)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8)
  }, [])

  function moverCarril(dir) {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * CARD_W, behavior: 'smooth' })
  }

  useEffect(() => {
    const ctrl = new AbortController()
    const rss = (url, nombre, emoji) =>
      fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=5`,{signal:ctrl.signal})
        .then(r=>r.json())
        .then(d=>(d.items||[]).slice(0,5).map((item,i)=>({
          id:`${nombre}_${i}`, fuente:nombre, emoji,
          imagen: item.thumbnail||item.enclosure?.link||null,
          titulo: item.title||'',
          resumen: stripHtml(item.description||item.content||'').slice(0,320),
          tag: (item.categories||[])[0]||'Fútbol',
          fecha: tarjetaFecha(item.pubDate),
          tipPromo: generarTipConversacion(item.title),
        })))
        .catch(()=>[])

    Promise.all([
      rss('https://depor.com/futbol/feed/',             'Depor', '🇵🇪'),
      rss('https://as.com/rss/futbol/internacional.xml', 'AS',   '🇪🇸'),
      rss('https://www.marca.com/rss/futbol.xml',        'Marca','⭐'),
      fetch('https://site.api.espn.com/apis/site/v2/sports/soccer/news?limit=5',{signal:ctrl.signal})
        .then(r=>r.json())
        .then(d=>(d.articles||[]).slice(0,5).map((a,i)=>({
          id:`ESPN_${i}`, fuente:'ESPN', emoji:'🌐',
          imagen:a.images?.[0]?.url||null,
          titulo:a.headline||'',
          resumen:a.description||'',
          tag:(a.categories||[])[0]?.description||'Soccer',
          fecha:tarjetaFecha(a.published),
          tipPromo:generarTipConversacion(a.headline),
        }))).catch(()=>[]),
    ]).then(([deporNews, asNews, marcaNews, espnNews])=>{
      // Intercalar fuentes para variedad
      const fuentes = [deporNews, asNews, marcaNews, espnNews]
      const cards = []
      const maxLen = Math.max(...fuentes.map(f=>f.length))
      for (let i=0; i<maxLen; i++) {
        fuentes.forEach(f=>{ if (f[i]) cards.push(f[i]) })
      }
      setAllCards(cards.length ? cards : TIPS_ESTATICOS)
      setLoading(false)
    }).catch(()=>{
      setAllCards(TIPS_ESTATICOS)
      setLoading(false)
    })

    return ()=>ctrl.abort()
  },[])

  function toggleTip(id) { setTipAbierto(prev => prev===id ? null : id) }

  return (
    <>
      <div className="rounded-2xl border border-white/5 overflow-hidden w-full min-w-0" style={{backgroundColor:'#12122a'}}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div>
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-wider">📰 Noticias para conversar</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Temas del momento · Tips de venta · Desliza para ver más</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={()=>moverCarril(-1)} disabled={!canLeft}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black transition-all"
              style={canLeft
                ? {backgroundColor:'rgba(249,115,22,0.15)',color:'#f97316',border:'1px solid rgba(249,115,22,0.3)'}
                : {backgroundColor:'rgba(255,255,255,0.04)',color:'#374151',border:'1px solid rgba(255,255,255,0.06)',cursor:'not-allowed'}
              }>‹</button>
            <button onClick={()=>moverCarril(1)} disabled={!canRight}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black transition-all"
              style={canRight
                ? {backgroundColor:'rgba(249,115,22,0.15)',color:'#f97316',border:'1px solid rgba(249,115,22,0.3)'}
                : {backgroundColor:'rgba(255,255,255,0.04)',color:'#374151',border:'1px solid rgba(255,255,255,0.06)',cursor:'not-allowed'}
              }>›</button>
          </div>
        </div>

        {/* ── Carrusel ── */}
        <div className="relative">
          {canLeft && <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{background:'linear-gradient(to right,#12122a,transparent)'}}/>}
          {canRight && <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
            style={{background:'linear-gradient(to left,#12122a,transparent)'}}/>}

          <div ref={scrollRef} onScroll={actualizarCarril}
            className="flex gap-3 overflow-x-auto px-4 py-3 pb-2"
            style={{scrollbarWidth:'none',WebkitOverflowScrolling:'touch',msOverflowStyle:'none',scrollSnapType:'x mandatory'}}>
            {loading
              ? [1,2,3,4,5].map(i=>(
                  <div key={i} className="flex-shrink-0 w-64 rounded-2xl overflow-hidden animate-pulse border border-white/5"
                    style={{backgroundColor:'#1e1e3a',scrollSnapAlign:'start'}}>
                    <div className="p-3 space-y-2">
                      <div className="h-4 bg-brand-medium rounded-full w-1/2"/>
                      <div className="flex gap-2 mt-2">
                        <div className="flex-1 space-y-1.5">
                          <div className="w-9 h-9 rounded-full bg-brand-medium mx-auto"/>
                          <div className="h-3 bg-brand-medium rounded-full"/>
                          <div className="flex gap-0.5 justify-center">{[1,2,3,4,5].map(j=><div key={j} className="w-5 h-5 rounded-full bg-brand-medium"/>)}</div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          <div className="w-9 h-9 rounded-full bg-brand-medium mx-auto"/>
                          <div className="h-3 bg-brand-medium rounded-full"/>
                          <div className="flex gap-0.5 justify-center">{[1,2,3,4,5].map(j=><div key={j} className="w-5 h-5 rounded-full bg-brand-medium"/>)}</div>
                        </div>
                      </div>
                      <div className="h-12 bg-brand-medium rounded-xl mt-1"/>
                      <div className="h-7 bg-brand-medium rounded-xl"/>
                    </div>
                  </div>
                ))
              : allCards.map(card=>(
                  <NewsCardNoticias key={card.id} card={card} tipAbierto={tipAbierto} onToggleTip={toggleTip}/>
                ))
            }
          </div>
        </div>

        {/* ── Puntos indicadores ── */}
        {!loading && allCards.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 py-2 px-4">
            {allCards.map((_,i)=>(
              <button key={i}
                onClick={()=>{ const el=scrollRef.current; if(el) el.scrollTo({left:i*CARD_W,behavior:'smooth'}) }}
                className="rounded-full transition-all duration-300 flex-shrink-0"
                style={{width:i===activeIdx?'20px':'6px',height:'6px',
                  backgroundColor:i===activeIdx?'#6366f1':'rgba(255,255,255,0.12)'}}/>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-4 pb-3 border-t border-white/5">
          <p className="text-[9px] text-gray-600 text-center pt-2">
            ⚠️ Contenido interno · Solo para personal autorizado adulto · Juego responsable
          </p>
        </div>
      </div>
    </>
  )
}

const motivationalMessages = [
  "Guerrera, aprende rápido y atiende con más seguridad. 💪",
  "Hoy en 3 minutos puedes dominar un concepto nuevo. ⚡",
  "Explica fácil, atiende mejor y genera confianza. 🌟",
  "La mejor promotora no promete: orienta con claridad. 🦅",
]

const badges = [
  { icon: '🌱', name: 'Guerrera Inicial',    minPoints: 0 },
  { icon: '⚽', name: 'Guerrera Deportiva',  minPoints: 300 },
  { icon: '🏆', name: 'Mundialista',         minPoints: 600 },
  { icon: '💬', name: 'Comunicadora',        minPoints: 900 },
  { icon: '🦅', name: 'Experta',             minPoints: 1200 },
]

const dailyChallenge = {
  question: '¿Qué significa que una cuota es alta?',
  options: [
    'Que ese resultado es casi seguro',
    'Que ese resultado es considerado menos probable',
    'Que hay más goles en el partido',
  ],
  correct: 1,
  points: 25,
}

// ─── Contenido del día (editable) ────────────────────────────────────────────
const HOY = {
  partido: {
    emoji: '⚽',
    titulo: 'Brasil vs Alemania',
    detalle: 'Fase de grupos · Por confirmar hora',
    indicador: '🔥 Local viene fuerte — 5 partidos sin perder',
    cta: 'Señor, Brasil viene muy fuerte hoy. ¿Le armamos el ticket con ganador o doble oportunidad?',
  },
  herramienta: {
    emoji: '🔨',
    nombre: 'BetBuilder',
    desc: 'Combina mercados en un solo partido para mejorar la cuota. Explícalo paso a paso.',
  },
  speech: '"Señor, si quiere algo más completo, podemos armar un BetBuilder. Paso a paso, usted elige."',
  tip: 'Cuando el cliente espere su ticket, ofrece los deportes virtuales. ¡Salen en 1 minuto!',
}

export default function Home({ userState, onUpdatePoints, onNavigate }) {
  const [msgIndex] = useState(Math.floor(Math.random() * motivationalMessages.length))
  const [showChallenge, setShowChallenge] = useState(false)
  const [challengeAnswer, setChallengeAnswer] = useState(null)
  const [copiedSpeech, setCopiedSpeech] = useState(false)

  const { points = 0, level = 1, completedToday = false, streak = 0 } = userState
  const weeklyGoal = 200
  const weeklyProgress = Math.min(points % 200, 200)
  const currentBadge = badges.filter(b => b.minPoints <= points).pop() || badges[0]

  function handleChallengeAnswer(idx) {
    setChallengeAnswer(idx)
    if (idx === dailyChallenge.correct && !completedToday) {
      onUpdatePoints(dailyChallenge.points, true)
    }
  }

  async function handleCopySpeech() {
    try { await navigator.clipboard.writeText(HOY.speech.replace(/^"|"$/g, '')) } catch {}
    setCopiedSpeech(true)
    setTimeout(() => setCopiedSpeech(false), 2000)
  }

  return (
    <div className="px-4 py-4 space-y-4 max-w-4xl mx-auto pb-24 animate-fade-in overflow-x-hidden w-full">

      {/* ── Saludo hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-orange via-orange-600 to-yellow-600 p-4 sm:p-5 min-h-[130px] sm:min-h-[150px]">
        {/* Texto izquierda — deja espacio para Tita */}
        <div className="pr-24 sm:pr-36">
          <p className="text-xs sm:text-sm font-semibold text-orange-100 mb-1">¡Bienvenida, Guerrera!</p>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-1 sm:mb-2">Hoy en mi POS 🏪</h2>
          <p className="text-xs sm:text-sm text-orange-100 leading-relaxed line-clamp-2 sm:line-clamp-none">{motivationalMessages[msgIndex]}</p>
          <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3">
            <div className="flex items-center gap-1">
              <span className="text-sm">🔥</span>
              <span className="text-white font-bold text-xs sm:text-sm">{streak}d seguidos</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm">⭐</span>
              <span className="text-white font-bold text-xs sm:text-sm">{points} pts · Nv.{level}</span>
            </div>
          </div>
        </div>

        {/* TITA — esquina derecha, se adapta al tamaño de pantalla */}
        <img
          src="/tita.png"
          alt="Tita TE APUESTO"
          className="absolute bottom-0 right-0 h-32 sm:h-44 w-auto object-contain pointer-events-none select-none"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>

      {/* ── Widget: Partidos del Día ── */}
      <PartidosDelDia onNavigate={onNavigate} />

      {/* ── Noticias para conversar con clientes ── */}
      <NoticiasDelDia />

      {/* ── 3 botones CTA rápidos ── */}
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => onNavigate('puntoventa')}
          className="w-full bg-gradient-to-r from-brand-orange to-yellow-600 rounded-2xl p-4 flex items-center gap-3 text-left hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <span className="text-3xl">🚀</span>
          <div className="flex-1">
            <p className="font-black text-white text-sm">Necesito vender ahora</p>
            <p className="text-xs text-orange-100 mt-0.5">Cómo ofrecer · Speech · Herramienta del día</p>
          </div>
          <span className="text-white font-black text-lg">›</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onNavigate('puntoventa')}
            className="bg-brand-dark border-2 border-brand-green/40 rounded-2xl p-3 text-left hover:border-brand-green transition-all active:scale-[0.98]"
          >
            <span className="text-2xl block mb-1">👋</span>
            <p className="text-xs font-black text-white leading-tight">Tengo un cliente nuevo</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Speech · Apuesta fácil · Tablet</p>
          </button>
          <button
            onClick={() => onNavigate('games')}
            className="bg-brand-dark border-2 border-purple-500/40 rounded-2xl p-3 text-left hover:border-purple-400 transition-all active:scale-[0.98]"
          >
            <span className="text-2xl block mb-1">🎯</span>
            <p className="text-xs font-black text-white leading-tight">Quiero practicar</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Trivias · Retos · Simulador</p>
          </button>
        </div>
      </div>

      {/* ── Avance semanal ── */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Meta semanal</p>
            <p className="text-sm font-bold text-white">{weeklyProgress} / {weeklyGoal} puntos</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Tu insignia</p>
            <p className="text-sm font-bold text-brand-orange">{currentBadge.icon} {currentBadge.name}</p>
          </div>
        </div>
        <ProgressBar value={weeklyProgress} max={weeklyGoal} color="orange" showPercent={false} height="h-3" />
      </div>

      {/* ── Partido del día ── */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-yellow-600/20">
        <p className="text-xs font-bold text-brand-yellow uppercase tracking-wider mb-3">⚽ Partido del día</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{HOY.partido.emoji}</span>
          <div className="flex-1">
            <p className="font-black text-white text-sm">{HOY.partido.titulo}</p>
            <p className="text-xs text-gray-400">{HOY.partido.detalle}</p>
            <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
              {HOY.partido.indicador}
            </span>
          </div>
        </div>
        <div className="mt-3 bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3">
          <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-1">💡 Ofrécelo así:</p>
          <p className="text-xs text-gray-200 italic leading-relaxed">"{HOY.partido.cta}"</p>
        </div>
      </div>

      {/* ── Herramienta del día ── */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-blue-500/15">
        <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-3">🛠️ Herramienta del día</p>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{HOY.herramienta.emoji}</span>
          <div className="flex-1">
            <p className="font-black text-white text-sm">{HOY.herramienta.nombre}</p>
            <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{HOY.herramienta.desc}</p>
          </div>
          <button
            onClick={() => onNavigate('bettools')}
            className="text-xs text-brand-orange font-bold border border-brand-orange/30 rounded-lg px-2 py-1"
          >
            Ver →
          </button>
        </div>
      </div>

      {/* ── Speech del día ── */}
      <div className="bg-brand-medium rounded-2xl p-4 border border-brand-green/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span>💬</span>
            <p className="text-xs font-bold text-brand-green uppercase tracking-wider">Speech del Día</p>
          </div>
          <button onClick={handleCopySpeech} className="text-xs text-gray-400 hover:text-brand-green transition-colors flex items-center gap-1">
            {copiedSpeech ? '✅ Copiado' : '📋 Copiar'}
          </button>
        </div>
        <p className="text-sm text-gray-300 italic leading-relaxed">{HOY.speech}</p>
      </div>

      {/* ── Reto del día ── */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-brand-orange/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-orange/20 rounded-xl flex items-center justify-center">
              <span>🎯</span>
            </div>
            <div>
              <p className="text-xs text-brand-orange font-bold uppercase tracking-wider">Reto del Día</p>
              <p className="text-xs text-gray-500">+{dailyChallenge.points} puntos</p>
            </div>
          </div>
          {completedToday && (
            <span className="text-xs bg-brand-green/20 text-brand-green px-2 py-1 rounded-full font-bold">✓ Completado</span>
          )}
        </div>

        {!showChallenge ? (
          <div>
            <p className="text-sm text-gray-300 mb-3">¿Lista para el reto de hoy? Tarda menos de 1 minuto.</p>
            <button
              onClick={() => setShowChallenge(true)}
              className="w-full py-3 bg-brand-orange rounded-xl font-bold text-white text-sm hover:bg-orange-500 transition-colors"
            >
              🚀 Empezar reto rápido
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white">{dailyChallenge.question}</p>
            {dailyChallenge.options.map((opt, idx) => {
              let btnStyle = 'border-white/10 text-gray-300 hover:border-brand-orange/50'
              if (challengeAnswer !== null) {
                if (idx === dailyChallenge.correct) btnStyle = 'border-brand-green bg-brand-green/10 text-brand-green'
                else if (idx === challengeAnswer && idx !== dailyChallenge.correct) btnStyle = 'border-red-500 bg-red-500/10 text-red-400'
                else btnStyle = 'border-white/10 text-gray-500 opacity-50'
              }
              return (
                <button
                  key={idx}
                  onClick={() => challengeAnswer === null && handleChallengeAnswer(idx)}
                  className={`w-full text-left border rounded-xl p-3 text-sm transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              )
            })}
            {challengeAnswer !== null && (
              <div className={`rounded-xl p-3 text-sm font-medium ${challengeAnswer === dailyChallenge.correct ? 'bg-brand-green/10 text-brand-green' : 'bg-red-500/10 text-red-400'}`}>
                {challengeAnswer === dailyChallenge.correct
                  ? '🎉 ¡Excelente! +25 puntos ganados.'
                  : '💡 Recuerda: cuota alta = resultado menos probable.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Tip del día ── */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-brand-yellow/15">
        <p className="text-xs font-bold text-brand-yellow mb-2">⚡ Tip del día</p>
        <p className="text-sm text-gray-300 leading-relaxed">{HOY.tip}</p>
      </div>

      {/* ── Accesos rápidos ── */}
      <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Accesos rápidos</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickCard icon="🌍" title="Mundial 2026"       subtitle="Datos Calientes · Trivia"  color="from-yellow-600 to-orange-600"  onClick={() => onNavigate('worldcup2026')} />
          <QuickCard icon="📚" title="Aprende TE APUESTO" subtitle="Conceptos · Terminal · Turno" color="from-blue-700 to-indigo-700" onClick={() => onNavigate('learn')} />
          <QuickCard icon="🎮" title="Practica Jugando"   subtitle="Gana puntos practicando"   color="from-purple-700 to-pink-700"    onClick={() => onNavigate('games')} />
          <QuickCard icon="🛤️" title="Mi Ruta Guerrera"  subtitle="Tu avance por niveles"     color="from-green-700 to-teal-700"     onClick={() => onNavigate('path')} />
        </div>
      </div>

      {/* ── Módulos destacados ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <button
          onClick={() => onNavigate('worldcup2026')}
          className="w-full bg-gradient-to-r from-yellow-700/20 to-orange-700/20 border-2 border-yellow-600/40 rounded-2xl p-4 text-left flex items-center gap-4 hover:border-yellow-500 transition-all"
        >
          <span className="text-3xl">🌍</span>
          <div className="flex-1">
            <p className="font-black text-white text-sm">Mundial 2026 — Centro Interactivo</p>
            <p className="text-xs text-gray-400 mt-0.5">Grupos · Calendario · Estadios · Trivia · +13 secciones</p>
          </div>
          <span className="text-brand-yellow font-black text-lg">›</span>
        </button>

        <button
          onClick={() => onNavigate('bettools')}
          className="w-full bg-gradient-to-r from-brand-orange/20 to-yellow-700/20 border-2 border-brand-orange/40 rounded-2xl p-4 text-left flex items-center gap-4 hover:border-brand-orange transition-all"
        >
          <span className="text-3xl">🛠️</span>
          <div className="flex-1">
            <p className="font-black text-white text-sm">Herramientas TE APUESTO</p>
            <p className="text-xs text-gray-400 mt-0.5">BetBuilder · La Yapa · Cashout · Pago Anticipado</p>
          </div>
          <span className="text-brand-orange font-black text-lg">›</span>
        </button>

        <button
          onClick={() => onNavigate('puntoventa')}
          className="w-full bg-gradient-to-r from-green-800/30 to-teal-800/30 border-2 border-green-600/40 rounded-2xl p-4 text-left flex items-center gap-4 hover:border-green-500 transition-all"
        >
          <span className="text-3xl">🛒</span>
          <div className="flex-1">
            <p className="font-black text-white text-sm">Cómo ofrecer en el POS</p>
            <p className="text-xs text-gray-400 mt-0.5">12 situaciones · Objeciones · Plan ANTES/DURANTE/DESPUÉS</p>
          </div>
          <span className="text-brand-green font-black text-lg">›</span>
        </button>
      </div>

      {/* ── Mini nav accesos rápidos ── */}
      <div className="grid grid-cols-3 gap-2">
        <MiniCard icon="🔤" label="Glosario"  onClick={() => onNavigate('glossary')} />
        <MiniCard icon="🛤️" label="Mi Ruta"   onClick={() => onNavigate('path')} />
        <MiniCard icon="🏅" label="Ranking"   onClick={() => onNavigate('ranking')} />
      </div>

      {/* ── Mensaje responsable ── */}
      <div className="bg-brand-medium/40 border border-white/5 rounded-2xl p-4 text-center">
        <p className="text-xs text-gray-400 leading-relaxed italic">
          "Ningún resultado deportivo puede garantizarse. Lo importante es orientar con claridad y responsabilidad."
        </p>
        <p className="text-[10px] text-gray-600 mt-1">🛡️ Contenido interno · Personal autorizado adulto</p>
      </div>

      <ResponsibleBanner compact />
    </div>
  )
}

function QuickCard({ icon, title, subtitle, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-left hover:scale-105 transition-transform duration-200 active:scale-95`}
    >
      <span className="text-3xl mb-2 block">{icon}</span>
      <p className="text-sm font-bold text-white leading-tight">{title}</p>
      <p className="text-xs text-white/70 mt-0.5">{subtitle}</p>
    </button>
  )
}

function MiniCard({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-brand-dark border border-white/5 rounded-xl p-3 flex flex-col items-center gap-1 hover:border-brand-orange/30 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs text-gray-400 font-medium">{label}</span>
    </button>
  )
}
