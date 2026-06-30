import { useState, useMemo } from 'react'
import quizData from '../data/quizData.json'
import ResponsibleBanner from '../components/ResponsibleBanner'

/* ─── Shuffle helper ─── */
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const DIFFICULTY_CONFIG = {
  todas:   { label: '🎰 Todas',   color: 'bg-brand-orange',  tag: 'bg-brand-orange/20 text-brand-orange' },
  facil:   { label: '🟢 Fácil',   color: 'bg-brand-green',   tag: 'bg-brand-green/20 text-brand-green' },
  medio:   { label: '🟡 Medio',   color: 'bg-brand-yellow',  tag: 'bg-brand-yellow/20 text-brand-yellow' },
  dificil: { label: '🔴 Difícil', color: 'bg-red-600',       tag: 'bg-red-600/20 text-red-400' },
}

const GAMES = [
  { id: 'guess',     icon: '🔍', title: 'Adivina el Concepto',   desc: 'Lee la definición · elige el término', color: 'from-purple-700 to-indigo-700', totalQ: 30 },
  { id: 'truefalse', icon: '✅', title: 'Verdadero o Falso',      desc: 'Decide si cada afirmación es correcta', color: 'from-green-700 to-teal-700',   totalQ: 35 },
  { id: 'phases',    icon: '🗺️', title: 'Ordena las Fases',       desc: 'Pon el Mundial en orden correcto',      color: 'from-yellow-700 to-orange-700', totalQ: 1  },
  { id: 'client',    icon: '🤝', title: '¿Qué le responderías?',  desc: 'Elige la respuesta responsable',        color: 'from-blue-700 to-cyan-700',     totalQ: 25 },
  { id: 'quick',     icon: '⚡', title: 'Reto de 3 Minutos',      desc: '6 preguntas · gana hasta 90 puntos',   color: 'from-red-700 to-orange-700',    totalQ: 25 },
  { id: 'mundial',   icon: '🌍', title: 'Trivia Mundial 2026',    desc: 'Grupos · Jugadores · Goles · Apuestas · Curiosidades', color: 'from-yellow-600 to-green-700', totalQ: 50 },
]

export default function Games({ onUpdatePoints }) {
  const [activeGame, setActiveGame] = useState(null)
  const [difficulty, setDifficulty] = useState('todas')

  function handleBack() { setActiveGame(null) }

  return (
    <div className="px-4 py-4 pb-24 max-w-4xl mx-auto animate-fade-in overflow-x-hidden w-full">
      {!activeGame ? (
        <>
          <div className="mb-3">
            <h2 className="text-xl font-black text-white">Juegos y Retos</h2>
            <p className="text-sm text-gray-500">115 preguntas · orden aleatorio cada vez</p>
          </div>

          {/* Difficulty selector */}
          <div className="bg-brand-dark rounded-2xl p-3 border border-white/5 mb-4">
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Nivel de dificultad</p>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(DIFFICULTY_CONFIG).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => setDifficulty(key)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${difficulty === key ? cfg.color + ' text-white shadow-lg' : 'bg-brand-medium text-gray-400'}`}
                >
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {GAMES.map(game => (
              <button
                key={game.id}
                onClick={() => setActiveGame(game.id)}
                className={`w-full bg-gradient-to-r ${game.color} rounded-2xl p-4 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{game.icon}</span>
                  <div className="flex-1">
                    <p className="font-black text-white text-base">{game.title}</p>
                    <p className="text-xs text-white/70 mt-0.5">{game.desc}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                        {game.id === 'phases' ? '+20 pts' : game.id === 'quick' ? 'Hasta 120 pts' : 'Pts por acierto'}
                      </span>
                      <span className="text-xs text-white/60">{game.totalQ} preguntas</span>
                    </div>
                  </div>
                  <span className="text-white/60 text-2xl">›</span>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 bg-brand-dark rounded-2xl p-3 border border-white/5 flex items-center gap-3">
            <span className="text-2xl">🎲</span>
            <p className="text-xs text-gray-400">Las preguntas aparecen en <span className="text-brand-orange font-bold">orden aleatorio</span> cada vez que juegas. ¡Nunca es igual!</p>
          </div>

          <div className="mt-3">
            <ResponsibleBanner compact />
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={handleBack} className="text-brand-orange text-sm font-semibold flex items-center gap-2">
              ← Volver
            </button>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${DIFFICULTY_CONFIG[difficulty].tag}`}>
              {DIFFICULTY_CONFIG[difficulty].label}
            </span>
          </div>
          {activeGame === 'guess'     && <GuessGame     difficulty={difficulty} onPoints={onUpdatePoints} />}
          {activeGame === 'truefalse' && <TrueFalseGame difficulty={difficulty} onPoints={onUpdatePoints} />}
          {activeGame === 'phases'    && <PhasesGame    onPoints={onUpdatePoints} />}
          {activeGame === 'client'    && <ClientGame    difficulty={difficulty} onPoints={onUpdatePoints} />}
          {activeGame === 'quick'     && <QuickGame     difficulty={difficulty} onPoints={onUpdatePoints} />}
          {activeGame === 'mundial'   && <MundialGame   difficulty={difficulty} onPoints={onUpdatePoints} />}
        </div>
      )}
    </div>
  )
}

/* ─── Filter + shuffle helper ─── */
function getQuestions(pool, difficulty, limit) {
  const filtered = difficulty === 'todas' ? pool : pool.filter(q => q.difficulty === difficulty)
  const available = filtered.length > 0 ? filtered : pool
  return shuffle(available).slice(0, limit || available.length)
}

/* ─── Difficulty badge ─── */
function DiffBadge({ difficulty }) {
  const d = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.facil
  return <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d.tag}`}>{d.label}</span>
}

/* ─── GAME 1: Guess the Concept ─── */
function GuessGame({ difficulty, onPoints }) {
  const questions = useMemo(() => getQuestions(quizData.guessTheConcept, difficulty, 10), [difficulty])
  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[current]
  const pts = q?.difficulty === 'dificil' ? 20 : q?.difficulty === 'medio' ? 15 : 10

  function handleAnswer(idx) {
    if (answered !== null) return
    setAnswered(idx)
    if (idx === q.correct) { setScore(s => s + pts); onPoints && onPoints(pts) }
  }

  function next() {
    if (current < questions.length - 1) { setCurrent(c => c + 1); setAnswered(null) }
    else setFinished(true)
  }

  function restart() { setCurrent(0); setAnswered(null); setScore(0); setFinished(false) }

  if (finished) return <GameFinished score={score} total={questions.length} onRestart={restart} />

  return (
    <div className="space-y-4 animate-fade-in">
      <GameHeader title="Adivina el Concepto" current={current + 1} total={questions.length} score={score} color="bg-purple-700" />
      <div className="bg-brand-dark rounded-2xl p-5 border border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">¿Qué concepto describe esto?</p>
          <DiffBadge difficulty={q.difficulty} />
        </div>
        <p className="text-base font-semibold text-white leading-relaxed mb-4">"{q.description}"</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            let style = 'border-white/10 text-gray-300 hover:border-purple-500/50'
            if (answered !== null) {
              if (idx === q.correct) style = 'border-brand-green bg-brand-green/10 text-brand-green'
              else if (idx === answered) style = 'border-red-500 bg-red-500/10 text-red-400'
              else style = 'border-white/5 text-gray-600 opacity-40'
            }
            return (
              <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left border rounded-xl p-3 text-sm font-semibold transition-all ${style}`}>
                {opt}
              </button>
            )
          })}
        </div>
        {answered !== null && (
          <div className={`mt-3 rounded-xl p-3 text-sm leading-relaxed ${answered === q.correct ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-medium text-gray-300'}`}>
            {answered === q.correct ? `🎉 ¡Correcto! +${pts} pts` : `💡 ${q.explanation}`}
          </div>
        )}
      </div>
      {answered !== null && (
        <button onClick={next} className="w-full py-3 bg-purple-700 rounded-xl font-bold text-white">
          {current < questions.length - 1 ? 'Siguiente →' : 'Ver resultado'}
        </button>
      )}
    </div>
  )
}

/* ─── GAME 2: True or False ─── */
function TrueFalseGame({ difficulty, onPoints }) {
  const questions = useMemo(() => getQuestions(quizData.trueFalse, difficulty, 10), [difficulty])
  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[current]
  const pts = q?.difficulty === 'dificil' ? 15 : q?.difficulty === 'medio' ? 12 : 8

  function handleAnswer(answer) {
    if (answered !== null) return
    setAnswered(answer)
    if (answer === q.answer) { setScore(s => s + pts); onPoints && onPoints(pts) }
  }

  function next() {
    if (current < questions.length - 1) { setCurrent(c => c + 1); setAnswered(null) }
    else setFinished(true)
  }

  function restart() { setCurrent(0); setAnswered(null); setScore(0); setFinished(false) }

  if (finished) return <GameFinished score={score} total={questions.length} onRestart={restart} />

  const isCorrect = answered !== null && answered === q.answer

  return (
    <div className="space-y-4 animate-fade-in">
      <GameHeader title="Verdadero o Falso" current={current + 1} total={questions.length} score={score} color="bg-green-700" />
      <div className="bg-brand-dark rounded-2xl p-5 border border-green-500/30">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-green-400 uppercase tracking-wider">¿Verdadero o falso?</p>
          <DiffBadge difficulty={q.difficulty} />
        </div>
        <p className="text-base font-semibold text-white leading-relaxed mb-6">{q.statement}</p>
        <div className="grid grid-cols-2 gap-3">
          {[true, false].map(val => {
            let style = 'border-white/10 text-gray-300'
            if (answered !== null) {
              if (val === q.answer) style = 'border-brand-green bg-brand-green/10 text-brand-green'
              else if (val === answered) style = 'border-red-500 bg-red-500/10 text-red-400'
              else style = 'border-white/5 opacity-40 text-gray-600'
            }
            return (
              <button key={String(val)} onClick={() => handleAnswer(val)}
                className={`border-2 rounded-2xl py-5 font-black text-lg transition-all ${style}`}>
                {val ? '✅ Verdadero' : '❌ Falso'}
              </button>
            )
          })}
        </div>
        {answered !== null && (
          <div className={`mt-3 rounded-xl p-3 text-sm ${isCorrect ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-medium text-gray-300'}`}>
            {isCorrect ? `🎉 ¡Correcto! +${pts} pts` : `💡 ${q.explanation}`}
          </div>
        )}
      </div>
      {answered !== null && (
        <button onClick={next} className="w-full py-3 bg-green-700 rounded-xl font-bold text-white">
          {current < questions.length - 1 ? 'Siguiente →' : 'Ver resultado'}
        </button>
      )}
    </div>
  )
}

/* ─── GAME 3: Order Phases ─── */
function PhasesGame({ onPoints }) {
  const correct = quizData.phases.correct
  const [items, setItems] = useState([...quizData.phases.scrambled])
  const [checked, setChecked] = useState(false)
  const [rewarded, setRewarded] = useState(false)

  function moveUp(i) {
    if (i === 0) return
    const arr = [...items]; [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; setItems(arr)
  }
  function moveDown(i) {
    if (i === items.length - 1) return
    const arr = [...items]; [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; setItems(arr)
  }
  function checkAnswer() {
    setChecked(true)
    const ok = items.every((item, i) => item === correct[i])
    if (ok && !rewarded) { onPoints && onPoints(20); setRewarded(true) }
  }

  const isCorrectOrder = checked && items.every((item, i) => item === correct[i])

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-yellow-700/20 border border-yellow-500/30 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-yellow uppercase tracking-wider mb-1">🗺️ Ordena las Fases · +20 pts</p>
        <p className="text-sm text-gray-300">Usa ▲▼ para poner en orden correcto las fases del Mundial</p>
      </div>
      <div className="space-y-2">
        {items.map((phase, i) => {
          const isRight = checked && items[i] === correct[i]
          const isWrong = checked && items[i] !== correct[i]
          return (
            <div key={phase} className={`flex items-center gap-3 rounded-xl p-3 border transition-all ${
              isRight ? 'bg-brand-green/10 border-brand-green/40' : isWrong ? 'bg-red-500/10 border-red-500/40' : 'bg-brand-dark border-white/10'
            }`}>
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${
                isRight ? 'bg-brand-green text-white' : isWrong ? 'bg-red-500 text-white' : 'bg-brand-medium text-gray-400'
              }`}>{i + 1}</span>
              <span className="flex-1 text-sm font-semibold text-white">{phase}</span>
              {!checked && (
                <div className="flex flex-col gap-1">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="text-gray-400 hover:text-white disabled:opacity-20 text-xs py-0.5">▲</button>
                  <button onClick={() => moveDown(i)} disabled={i === items.length - 1} className="text-gray-400 hover:text-white disabled:opacity-20 text-xs py-0.5">▼</button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      {!checked ? (
        <button onClick={checkAnswer} className="w-full py-3 bg-yellow-600 rounded-xl font-bold text-white">Verificar orden</button>
      ) : (
        <div className={`rounded-2xl p-4 text-center font-bold ${isCorrectOrder ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-medium text-gray-300'}`}>
          {isCorrectOrder ? '🎉 ¡Perfecto! +20 pts' : '💡 Orden: Grupos → Octavos → Cuartos → Semifinal → Final'}
          <button onClick={() => { setItems([...quizData.phases.scrambled]); setChecked(false); setRewarded(false) }}
            className="block w-full mt-3 py-2 bg-brand-orange rounded-xl text-sm font-bold text-white">
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── GAME 4: Client Situations ─── */
function ClientGame({ difficulty, onPoints }) {
  const questions = useMemo(() => getQuestions(quizData.clientSituations, difficulty, 8), [difficulty])
  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[current]
  const pts = q?.difficulty === 'dificil' ? 20 : q?.difficulty === 'medio' ? 15 : 10

  function handleAnswer(idx) {
    if (answered !== null) return
    setAnswered(idx)
    if (idx === q.correct) { setScore(s => s + pts); onPoints && onPoints(pts) }
  }

  function next() {
    if (current < questions.length - 1) { setCurrent(c => c + 1); setAnswered(null) }
    else setFinished(true)
  }

  function restart() { setCurrent(0); setAnswered(null); setScore(0); setFinished(false) }

  if (finished) return <GameFinished score={score} total={questions.length} onRestart={restart} />

  return (
    <div className="space-y-4 animate-fade-in">
      <GameHeader title="¿Qué le responderías?" current={current + 1} total={questions.length} score={score} color="bg-blue-700" />
      <div className="bg-brand-dark rounded-2xl p-5 border border-blue-500/30">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Situación de atención</p>
          <DiffBadge difficulty={q.difficulty} />
        </div>
        <div className="bg-brand-medium rounded-xl p-4 mb-4">
          <p className="text-xs font-bold text-blue-400 mb-2">👤 El cliente dice:</p>
          <p className="text-sm text-white font-semibold leading-relaxed">{q.situation}</p>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">¿Cuál es la mejor respuesta?</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            let style = 'border-white/10 text-gray-300 hover:border-blue-500/50'
            if (answered !== null) {
              if (idx === q.correct) style = 'border-brand-green bg-brand-green/10 text-brand-green'
              else if (idx === answered) style = 'border-red-500 bg-red-500/10 text-red-400'
              else style = 'border-white/5 text-gray-600 opacity-40'
            }
            return (
              <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left border rounded-xl p-3 text-sm leading-relaxed transition-all ${style}`}>
                {opt}
              </button>
            )
          })}
        </div>
        {answered !== null && (
          <div className={`mt-3 rounded-xl p-3 text-sm leading-relaxed ${answered === q.correct ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-medium text-gray-300'}`}>
            {answered === q.correct ? `🎉 ¡Respuesta responsable! +${pts} pts` : `💡 ${q.explanation}`}
          </div>
        )}
      </div>
      {answered !== null && (
        <button onClick={next} className="w-full py-3 bg-blue-700 rounded-xl font-bold text-white">
          {current < questions.length - 1 ? 'Siguiente →' : 'Ver resultado'}
        </button>
      )}
    </div>
  )
}

/* ─── GAME 5: Quick Challenge ─── */
function QuickGame({ difficulty, onPoints }) {
  const questions = useMemo(() => getQuestions(quizData.quickChallenge, difficulty, 6), [difficulty])
  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[current]

  function handleAnswer(idx) {
    if (answered !== null) return
    const pts = q.difficulty === 'dificil' ? 20 : q.difficulty === 'medio' ? 15 : q.points || 10
    setAnswered(idx)
    if (idx === q.correct) { setScore(s => s + pts); onPoints && onPoints(pts) }
    setTimeout(() => {
      if (current < questions.length - 1) { setCurrent(c => c + 1); setAnswered(null) }
      else setFinished(true)
    }, 1300)
  }

  function restart() { setCurrent(0); setAnswered(null); setScore(0); setFinished(false) }

  if (finished) return <GameFinished score={score} total={questions.length} onRestart={restart} />

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-red-700 to-orange-700 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-black text-white">⚡ Reto de 3 Minutos</p>
          <div className="flex items-center gap-2">
            <DiffBadge difficulty={q?.difficulty || 'facil'} />
            <p className="text-sm font-bold text-white/80">+{score} pts</p>
          </div>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-1.5 rounded-full ${i < current ? 'bg-white' : i === current ? 'bg-white/60' : 'bg-white/20'}`} />
          ))}
        </div>
        <p className="text-xs text-white/70 mt-1">{current + 1} de {questions.length}</p>
      </div>
      <div className="bg-brand-dark rounded-2xl p-5 border border-orange-500/30">
        <p className="text-base font-bold text-white leading-relaxed mb-4">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            let style = 'border-white/10 text-gray-300 hover:border-brand-orange/50'
            if (answered !== null) {
              if (idx === q.correct) style = 'border-brand-green bg-brand-green/10 text-brand-green'
              else if (idx === answered) style = 'border-red-500 bg-red-500/10 text-red-400'
              else style = 'border-white/5 text-gray-600 opacity-40'
            }
            return (
              <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left border rounded-xl p-3 text-sm font-semibold transition-all ${style}`}>
                {opt}
              </button>
            )
          })}
        </div>
        {answered !== null && (
          <p className={`text-sm font-bold mt-3 ${answered === q.correct ? 'text-brand-green' : 'text-red-400'}`}>
            {answered === q.correct ? '🎉 ¡Correcto!' : '❌ Incorrecto'}
          </p>
        )}
      </div>
    </div>
  )
}

/* ─── GAME 6: Mundial 2026 Trivia ─── */
const CATEGORY_COLORS = {
  '🌍 Formato':      'text-blue-400 border-blue-500/30',
  '🏆 Historia':     'text-yellow-400 border-yellow-500/30',
  '⭐ Jugadores':    'text-purple-400 border-purple-500/30',
  '🎯 Curiosidades': 'text-orange-400 border-orange-500/30',
  '⚽ Goles':        'text-green-400 border-green-500/30',
  '🎰 Apuestas':     'text-pink-400 border-pink-500/30',
  '💰 Estrellas':    'text-amber-400 border-amber-500/30',
}

function MundialGame({ difficulty, onPoints }) {
  const questions = useMemo(() => getQuestions(quizData.mundial2026, difficulty, 10), [difficulty])
  const [current, setCurrent] = useState(0)
  const [answered, setAnswered] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const q = questions[current]
  const pts = q?.difficulty === 'dificil' ? 20 : q?.difficulty === 'medio' ? 15 : 10
  const catStyle = CATEGORY_COLORS[q?.category] || 'text-gray-400 border-white/10'

  function handleAnswer(idx) {
    if (answered !== null) return
    setAnswered(idx)
    if (idx === q.correct) { setScore(s => s + pts); onPoints && onPoints(pts) }
  }

  function next() {
    if (current < questions.length - 1) { setCurrent(c => c + 1); setAnswered(null) }
    else setFinished(true)
  }

  function restart() { setCurrent(0); setAnswered(null); setScore(0); setFinished(false) }

  if (finished) return <GameFinished score={score} total={questions.length} onRestart={restart} />

  return (
    <div className="space-y-4 animate-fade-in">
      <GameHeader title="Trivia Mundial 2026" current={current + 1} total={questions.length} score={score} color="bg-gradient-to-r from-yellow-600 to-green-700" />
      <div className={`bg-brand-dark rounded-2xl p-5 border ${catStyle.split(' ')[1] || 'border-white/10'}`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold uppercase tracking-wider ${catStyle.split(' ')[0]}`}>{q.category}</span>
          <DiffBadge difficulty={q.difficulty} />
        </div>
        <p className="text-base font-semibold text-white leading-relaxed mb-4">{q.question}</p>
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            let style = 'border-white/10 text-gray-300 hover:border-yellow-500/50'
            if (answered !== null) {
              if (idx === q.correct) style = 'border-brand-green bg-brand-green/10 text-brand-green'
              else if (idx === answered) style = 'border-red-500 bg-red-500/10 text-red-400'
              else style = 'border-white/5 text-gray-600 opacity-40'
            }
            return (
              <button key={idx} onClick={() => handleAnswer(idx)} className={`w-full text-left border rounded-xl p-3 text-sm font-semibold transition-all ${style}`}>
                {opt}
              </button>
            )
          })}
        </div>
        {answered !== null && (
          <div className={`mt-3 rounded-xl p-3 text-sm leading-relaxed ${answered === q.correct ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-medium text-gray-300'}`}>
            {answered === q.correct ? `🎉 ¡Correcto! +${pts} pts` : `💡 ${q.explanation}`}
          </div>
        )}
      </div>
      {answered !== null && (
        <button onClick={next} className="w-full py-3 bg-gradient-to-r from-yellow-600 to-green-700 rounded-xl font-bold text-white">
          {current < questions.length - 1 ? 'Siguiente →' : 'Ver resultado'}
        </button>
      )}
    </div>
  )
}

/* ─── Shared UI ─── */
function GameHeader({ title, current, total, score, color }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className={`${color} rounded-2xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <p className="font-black text-white text-base">{title}</p>
        <div className="bg-white/20 rounded-xl px-3 py-1">
          <p className="text-white font-black text-lg">+{score}</p>
          <p className="text-white/70 text-xs text-center">pts</p>
        </div>
      </div>
      <div className="flex gap-1 mb-1">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={`flex-1 h-1 rounded-full ${i < current - 1 ? 'bg-white' : i === current - 1 ? 'bg-white/70' : 'bg-white/20'}`} />
        ))}
      </div>
      <p className="text-white/70 text-xs">{current} de {total}</p>
    </div>
  )
}

function GameFinished({ score, total, onRestart }) {
  const maxEstimated = total * 15
  const pct = Math.min(100, Math.round((score / maxEstimated) * 100))
  const msg = pct >= 80 ? '🏆 ¡Increíble, Guerrera!' : pct >= 60 ? '💪 ¡Buen trabajo!' : pct >= 40 ? '📚 Vas mejorando' : '🔁 Sigue practicando'
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '⭐' : pct >= 40 ? '📈' : '📚'
  return (
    <div className="animate-fade-in text-center space-y-4">
      <div className="bg-brand-dark rounded-3xl p-8 border border-brand-orange/30">
        <div className="text-6xl mb-3">{emoji}</div>
        <p className="text-2xl font-black text-white mb-1">{msg}</p>
        <p className="text-brand-orange text-5xl font-black my-3">+{score}</p>
        <p className="text-gray-400 text-sm">puntos ganados en esta ronda</p>
        <p className="text-gray-500 text-xs mt-1">{total} preguntas respondidas</p>
      </div>
      <button onClick={onRestart} className="w-full py-3 bg-brand-orange rounded-xl font-bold text-white text-base">
        🎲 Nueva ronda aleatoria
      </button>
    </div>
  )
}
