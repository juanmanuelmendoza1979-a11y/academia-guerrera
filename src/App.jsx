import { useState, useEffect, useCallback } from 'react'
import Header from './components/Header'
import BottomNavigation from './components/BottomNavigation'
import Home from './pages/Home'
import Learn from './pages/Learn'
import Games from './pages/Games'
import Speech from './pages/Speech'
import Glossary from './pages/Glossary'
import LearningPath from './pages/LearningPath'
import Ranking from './pages/Ranking'
import Supervisor from './pages/Supervisor'
import Tips from './pages/Tips'
import More from './pages/More'
import BetTools from './pages/BetTools'
import WorldCup2026 from './pages/WorldCup2026'
import PuntoVenta from './pages/PuntoVenta'
import Calendario from './pages/Calendario'
import Onboarding from './pages/Onboarding'
import OnboardingSupervisor from './pages/OnboardingSupervisor'
import Login from './pages/Login'
import LoginSupervisor from './pages/LoginSupervisor'
import LoginJefe from './pages/LoginJefe'
import OnboardingJefe from './pages/OnboardingJefe'
import JefeDashboard from './pages/JefeDashboard'
import RoleSelector from './pages/RoleSelector'
import { sumarPuntos } from './lib/db'

const STORAGE_KEY = 'guerrera_progress'
const SESSION_KEY = 'guerrera_session'

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function loadSupSession() {
  try {
    const raw = localStorage.getItem('supervisor_session')
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function loadJefeSession() {
  try {
    const raw = localStorage.getItem('jefe_session')
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { points: 0, level: 1, streak: 1, completedToday: false, lastDate: null }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

function computeLevel(points) {
  if (points >= 1200) return 5
  if (points >= 900) return 4
  if (points >= 600) return 3
  if (points >= 300) return 2
  return 1
}

// Bottom nav: páginas prioritarias para móvil
const NAV_MAIN = ['home', 'calendario', 'worldcup2026', 'puntoventa', 'more']

// Sidebar agrupado en bloques lógicos
const SIDEBAR_BLOCKS = [
  {
    label: 'HOY EN MI POS',
    items: [
      { id: 'home',        icon: '🏠', label: 'Hoy en mi POS' },
      { id: 'calendario',  icon: '📅', label: 'Calendario de Partidos' },
      { id: 'worldcup2026',icon: '🌍', label: 'Mundial 2026' },
      { id: 'puntoventa',  icon: '🛒', label: 'Cómo ofrecer en POS' },
    ],
  },
  {
    label: 'APRENDE TE APUESTO',
    items: [
      { id: 'learn',    icon: '📚', label: 'Aprende TE APUESTO' },
      { id: 'bettools', icon: '🛠️', label: 'Herramientas' },
      { id: 'glossary', icon: '🔤', label: 'Glosario Fácil' },
    ],
  },
  {
    label: 'PRACTICA Y GANA',
    items: [
      { id: 'games',  icon: '🎮', label: 'Practica Jugando' },
      { id: 'speech', icon: '💬', label: 'Speech Listo' },
      { id: 'tips',   icon: '💡', label: 'Tips de Atención' },
    ],
  },
  {
    label: 'MI AVANCE',
    items: [
      { id: 'path',    icon: '🛤️', label: 'Mi Ruta Guerrera' },
      { id: 'ranking', icon: '🏅', label: 'Ranking' },
    ],
  },
  {
    label: 'GESTIÓN',
    items: [
      { id: 'supervisor', icon: '🔐', label: 'Zona Supervisor' },
    ],
  },
]

// Lista plana para lookups
const SIDEBAR_ITEMS = SIDEBAR_BLOCKS.flatMap(b => b.items)

export default function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [userState, setUserState] = useState(loadState)
  const [session, setSession]         = useState(loadSession)      // promotora
  const [supSession, setSupSession]   = useState(loadSupSession)   // supervisor
  const [jefeSession, setJefeSession] = useState(loadJefeSession)  // jefe regional
  const [authView, setAuthView]       = useState('role-select')

  // Check daily streak
  useEffect(() => {
    const today = new Date().toDateString()
    if (userState.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString()
      const newStreak = userState.lastDate === yesterday ? userState.streak + 1 : 1
      setUserState(prev => {
        const next = { ...prev, lastDate: today, completedToday: false, streak: newStreak }
        saveState(next)
        return next
      })
    }
  }, [])

  const handleUpdatePoints = useCallback((pts, markCompleted = false) => {
    setUserState(prev => {
      const newPoints = prev.points + pts
      const next = {
        ...prev,
        points: newPoints,
        level: computeLevel(newPoints),
        completedToday: markCompleted ? true : prev.completedToday,
      }
      saveState(next)
      return next
    })
    // Sync a Firebase solo para promotoras (colección guerreras)
    if (session?.id && !supSession) {
      sumarPuntos(session.id, pts).catch(() => {})
    }
  }, [session, supSession])

  function handleLogin(guerrera) {
    setSession(guerrera)
    // Merge Firebase points with local if local is higher
    setUserState(prev => {
      const merged = { ...prev, points: Math.max(prev.points, guerrera.puntos || 0) }
      saveState(merged)
      return merged
    })
  }

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setAuthView('role-select')
  }

  function handleSupLogin(supervisor) { setSupSession(supervisor) }
  function handleSupLogout() {
    localStorage.removeItem('supervisor_session')
    setSupSession(null)
    setAuthView('role-select')
  }

  function handleJefeLogin(jefe) { setJefeSession(jefe) }
  function handleJefeLogout() {
    localStorage.removeItem('jefe_session')
    setJefeSession(null)
    setAuthView('role-select')
  }

  function handleNavigate(page) {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const navPage = NAV_MAIN.includes(currentPage) ? currentPage : 'more'

  // Sesión activa: jefe > supervisor > promotora
  const activeSession      = jefeSession || supSession || session
  const isJefe             = !!jefeSession
  const isSupervisor       = !!supSession && !jefeSession
  const handleActiveLogout = isJefe ? handleJefeLogout : isSupervisor ? handleSupLogout : handleLogout

  // ── Auth gates ───────────────────────────────────────────────────────────
  // Sin sesión de ningún tipo → flujo de autenticación
  if (!activeSession) {
    if (authView === 'role-select') {
      return (
        <RoleSelector
          onSelectPromotera={() => setAuthView('login')}
          onSelectSupervisor={() => setAuthView('login-supervisor')}
          onSelectJefe={() => setAuthView('login-jefe')}
        />
      )
    }
    if (authView === 'onboarding') {
      return (
        <Onboarding
          onComplete={() => { const s = loadSession(); setSession(s) }}
        />
      )
    }
    if (authView === 'login-supervisor') {
      return (
        <LoginSupervisor
          onLogin={handleSupLogin}
          onNuevaCuenta={() => setAuthView('onboarding-supervisor')}
          onVolver={() => setAuthView('role-select')}
        />
      )
    }
    if (authView === 'onboarding-supervisor') {
      return (
        <OnboardingSupervisor
          onComplete={() => { const s = loadSupSession(); setSupSession(s) }}
          onVolver={() => setAuthView('role-select')}
        />
      )
    }
    if (authView === 'login-jefe') {
      return (
        <LoginJefe
          onLogin={handleJefeLogin}
          onNuevaCuenta={() => setAuthView('onboarding-jefe')}
          onVolver={() => setAuthView('role-select')}
        />
      )
    }
    if (authView === 'onboarding-jefe') {
      return (
        <OnboardingJefe
          onComplete={() => { const s = loadJefeSession(); setJefeSession(s) }}
          onVolver={() => setAuthView('role-select')}
        />
      )
    }
    // default: login promotora
    return (
      <Login
        onLogin={handleLogin}
        onNuevaCuenta={() => setAuthView('onboarding')}
        onVolver={() => setAuthView('role-select')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-brand-black flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-brand-dark border-r border-white/5 fixed left-0 top-0 h-full z-50">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className={`font-black text-xl ${isJefe ? 'text-yellow-400' : isSupervisor ? 'text-purple-400' : 'text-brand-orange'}`}>
              {isJefe ? '🏆' : isSupervisor ? '📊' : '⚡'}
            </span>
            <div>
              <p className="text-xs text-gray-500 leading-none">Academia</p>
              <p className={`text-xs font-black leading-tight ${isJefe ? 'text-yellow-400' : isSupervisor ? 'text-purple-400' : 'text-brand-orange'}`}>
                GUERRERA
              </p>
            </div>
            {isJefe && (
              <span className="ml-auto text-[9px] font-black bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full border border-yellow-500/30">JEFE</span>
            )}
            {isSupervisor && (
              <span className="ml-auto text-[9px] font-black bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full border border-purple-500/30">SUP</span>
            )}
          </div>
          <div className="mt-3 bg-brand-medium rounded-xl p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Puntos</span>
              <span className="text-sm font-black text-brand-orange">⭐ {userState.points}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">Nivel</span>
              <span className="text-sm font-bold text-white">Nivel {userState.level}</span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">Racha</span>
              <span className="text-sm font-bold text-brand-yellow">🔥 {userState.streak}d</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {SIDEBAR_BLOCKS.map(block => (
            <div key={block.label}>
              {/* Block label */}
              <p className="px-4 pt-3 pb-1 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                {block.label}
              </p>
              {block.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all ${
                    currentPage === item.id
                      ? 'bg-brand-orange/10 text-brand-orange border-r-2 border-brand-orange'
                      : 'text-gray-400 hover:text-white hover:bg-brand-medium/50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-semibold leading-tight">{item.label}</span>
                </button>
              ))}
              <div className="mx-4 mt-1 border-b border-white/5" />
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-2">
          {activeSession && (
            <div className={`rounded-xl p-2 flex items-center gap-2 ${isJefe ? 'bg-yellow-500/10 border border-yellow-500/20' : isSupervisor ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-brand-medium'}`}>
              <span className="text-lg flex-shrink-0">{isJefe ? '🏆' : isSupervisor ? '📊' : (activeSession.avatar || '🦁')}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{activeSession.nombre?.split(' ')[0]}</p>
                <p className="text-[10px] truncate" style={{color: isJefe ? '#facc15' : isSupervisor ? '#c084fc' : '#6b7280'}}>
                  {isJefe ? 'Jefe Regional' : isSupervisor ? `Supervisor · ${activeSession.jefe?.split(' ')[0]}` : activeSession.pos}
                </p>
              </div>
              <button onClick={handleActiveLogout} className="text-gray-600 hover:text-red-400 text-xs transition-all flex-shrink-0" title="Cerrar sesión">⏏</button>
            </div>
          )}
          <p className="text-xs text-gray-600 leading-relaxed">
            🛡️ Capacitación interna · Personal autorizado adulto
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen min-w-0 overflow-x-hidden">
        <Header currentPage={currentPage} userPoints={userState.points} userLevel={userState.level} isSupervisor={isSupervisor} isJefe={isJefe} onLogout={handleActiveLogout} session={activeSession} />

        <main className="flex-1">
          {currentPage === 'home' && (
            <Home userState={userState} onUpdatePoints={handleUpdatePoints} onNavigate={handleNavigate} />
          )}
          {currentPage === 'learn' && (
            <Learn onUpdatePoints={handleUpdatePoints} />
          )}
          {currentPage === 'games' && (
            <Games onUpdatePoints={handleUpdatePoints} />
          )}
          {currentPage === 'speech' && <Speech />}
          {currentPage === 'glossary' && <Glossary />}
          {currentPage === 'path' && (
            <LearningPath userState={userState} onNavigate={handleNavigate} />
          )}
          {currentPage === 'ranking' && <Ranking session={activeSession} localPoints={userState.points} />}
          {currentPage === 'supervisor' && (isJefe
            ? <JefeDashboard session={activeSession} />
            : <Supervisor session={activeSession} />
          )}
          {currentPage === 'tips' && <Tips />}
          {currentPage === 'more' && <More onNavigate={handleNavigate} />}
          {currentPage === 'bettools' && <BetTools onUpdatePoints={handleUpdatePoints} />}
          {currentPage === 'worldcup2026' && <WorldCup2026 onUpdatePoints={handleUpdatePoints} />}
          {currentPage === 'puntoventa' && <PuntoVenta onUpdatePoints={handleUpdatePoints} />}
          {currentPage === 'calendario' && <Calendario />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNavigation current={navPage} onNavigate={handleNavigate} />
    </div>
  )
}
