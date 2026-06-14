import ProgressBar from '../components/ProgressBar'
import Badge from '../components/Badge'

const LEVELS = [
  {
    id: 1,
    name: 'Guerrera Inicial',
    subtitle: 'Conceptos básicos',
    icon: '🌱',
    color: '#19C37D',
    minPoints: 0,
    maxPoints: 299,
    topics: ['¿Qué son las apuestas deportivas?', 'Conceptos básicos: cuota, favorito', 'Cómo orientar a un cliente nuevo'],
    badge: 'Guerrera Inicial',
  },
  {
    id: 2,
    name: 'Guerrera Deportiva',
    subtitle: 'Deportes principales',
    icon: '⚽',
    color: '#3B82F6',
    minPoints: 300,
    maxPoints: 599,
    topics: ['Fútbol: lo esencial', 'Básquet y tenis básico', 'Palabras clave por deporte'],
    badge: 'Guerrera Deportiva',
  },
  {
    id: 3,
    name: 'Guerrera Mundialista',
    subtitle: 'Mundial, fases y selecciones',
    icon: '🏆',
    color: '#FF6100',
    minPoints: 600,
    maxPoints: 899,
    topics: ['Fases del Mundial', 'Selecciones destacadas', 'Cómo hablar del Mundial con el cliente'],
    badge: 'Guerrera Mundialista',
  },
  {
    id: 4,
    name: 'Guerrera Comunicadora',
    subtitle: 'Atención y speech responsable',
    icon: '💬',
    color: '#8B5CF6',
    minPoints: 900,
    maxPoints: 1199,
    topics: ['Speech responsable por situación', 'Tips de atención al cliente', 'Cómo explicar sin prometer'],
    badge: 'Comunicadora Responsable',
  },
  {
    id: 5,
    name: 'Guerrera Experta',
    subtitle: 'Dominio completo',
    icon: '🦅',
    color: '#FFD166',
    minPoints: 1200,
    maxPoints: 9999,
    topics: ['Glosario completo dominado', 'Todos los juegos completados', 'Evaluación final superada'],
    badge: 'Guerrera Experta',
  },
]

export default function LearningPath({ userState, onNavigate }) {
  const { points = 0 } = userState
  const currentLevel = LEVELS.find(l => points >= l.minPoints && points <= l.maxPoints) || LEVELS[0]

  return (
    <div className="px-4 py-4 pb-24 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-4">
        <h2 className="text-xl font-black text-white">Ruta de Aprendizaje</h2>
        <p className="text-sm text-gray-500">Tu camino a Guerrera Experta</p>
      </div>

      {/* Current status */}
      <div className="bg-gradient-to-br from-brand-dark to-brand-medium rounded-2xl p-5 border border-brand-orange/20 mb-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-yellow-500 flex items-center justify-center text-3xl shadow-lg shadow-brand-orange/30">
            {currentLevel.icon}
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Nivel actual</p>
            <p className="font-black text-white text-lg leading-tight">{currentLevel.name}</p>
            <p className="text-sm text-brand-orange">⭐ {points} puntos</p>
          </div>
        </div>
        {currentLevel.id < 5 && (
          <>
            <ProgressBar
              value={points - currentLevel.minPoints}
              max={currentLevel.maxPoints - currentLevel.minPoints + 1}
              color="orange"
              label={`Hacia ${LEVELS[currentLevel.id].name}`}
              height="h-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Faltan {Math.max(0, currentLevel.maxPoints + 1 - points)} puntos para el siguiente nivel
            </p>
          </>
        )}
        {currentLevel.id === 5 && (
          <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-xl p-3">
            <p className="text-sm font-bold text-brand-yellow text-center">🏆 ¡Has alcanzado el nivel máximo!</p>
          </div>
        )}
      </div>

      {/* Levels */}
      <div className="space-y-3">
        {LEVELS.map((level, i) => {
          const unlocked = points >= level.minPoints
          const completed = points > level.maxPoints
          const isCurrent = level.id === currentLevel.id

          return (
            <div
              key={level.id}
              className={`rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-brand-orange/40 bg-brand-dark'
                  : completed
                  ? 'border-brand-green/20 bg-brand-dark/50'
                  : unlocked
                  ? 'border-white/10 bg-brand-dark'
                  : 'border-white/5 bg-brand-dark/30 opacity-50'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                      completed ? 'bg-brand-green/20' : unlocked ? 'bg-brand-orange/20' : 'bg-brand-medium'
                    }`}
                  >
                    {completed ? '✅' : unlocked ? level.icon : '🔒'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm ${unlocked ? 'text-white' : 'text-gray-600'}`}>{level.name}</p>
                      {isCurrent && <span className="text-xs bg-brand-orange text-white px-2 py-0.5 rounded-full font-bold">Actual</span>}
                      {completed && <span className="text-xs bg-brand-green/20 text-brand-green px-2 py-0.5 rounded-full font-bold">✓ Completado</span>}
                    </div>
                    <p className={`text-xs mt-0.5 ${unlocked ? 'text-gray-400' : 'text-gray-600'}`}>{level.subtitle}</p>
                    <p className={`text-xs mt-1 ${unlocked ? 'text-gray-500' : 'text-gray-700'}`}>
                      {level.minPoints} – {level.id < 5 ? level.maxPoints : '∞'} pts
                    </p>
                  </div>
                  <Badge icon={level.icon} name="" earned={completed || isCurrent} size="sm" />
                </div>

                {(unlocked || isCurrent) && (
                  <div className="space-y-1.5 mt-2">
                    {level.topics.map((topic, ti) => (
                      <div key={ti} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className={completed ? 'text-brand-green' : 'text-gray-600'}>
                          {completed ? '✓' : '○'}
                        </span>
                        {topic}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isCurrent && (
                <div className="px-4 pb-4">
                  <button
                    onClick={() => onNavigate('games')}
                    className="w-full py-2.5 bg-brand-orange rounded-xl text-sm font-bold text-white"
                  >
                    ▶ Continuar aprendiendo
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Badges section */}
      <div className="mt-6">
        <p className="text-sm font-bold text-white mb-3">🏅 Insignias disponibles</p>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {LEVELS.map(level => (
            <div key={level.id} className="flex-shrink-0 text-center">
              <Badge icon={level.icon} name={level.badge} earned={points >= level.minPoints} size="md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
