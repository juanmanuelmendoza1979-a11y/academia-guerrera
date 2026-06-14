import { useState } from 'react'
import { crearSupervisor } from '../lib/db'

const SUPERVISORES_POR_JEFE = [
  { jefe: 'Victor Lazo',      supervisores: ['Sara Salazar', 'Diana Paz', 'Candy Odar'] },
  { jefe: 'Karem Romero',     supervisores: ['Estefanny Martinez', 'Lady Zelada', 'Michelle Gomez', 'Zurhama Pisconte'] },
  { jefe: 'Jesus Ynocencio',  supervisores: ['Alina Untama', 'Crisly Cotrina', 'Roxana Vicente', 'Renzo Asensios'] },
  { jefe: 'Tirza Vargasa',    supervisores: ['Wendy Aguayo', 'Carlos Gallegos', 'Katia Dueñas'] },
  { jefe: 'Ricardo Polo',     supervisores: ['Luis Bustamante', 'Gonzalo Lopez', 'Carla Huerta', 'Milagros Urbano'] },
]

// Mapa rápido nombre → jefe
const JEFE_DE = {}
SUPERVISORES_POR_JEFE.forEach(({ jefe, supervisores }) => {
  supervisores.forEach(s => { JEFE_DE[s] = jefe })
})

const PASOS = ['bienvenida', 'nombre', 'pin', 'listo']

export default function OnboardingSupervisor({ onComplete, onVolver }) {
  const [paso, setPaso]       = useState('bienvenida')
  const [nombre, setNombre]   = useState('')
  const [pin, setPin]         = useState('')
  const [pinConf, setPinConf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const jefe = JEFE_DE[nombre] || ''
  const idx  = PASOS.indexOf(paso)
  const progreso = Math.round((idx / (PASOS.length - 1)) * 100)

  async function registrar() {
    setError('')
    if (pin.length !== 4) { setError('El PIN debe tener 4 dígitos'); return }
    if (pin !== pinConf)   { setError('Los PIN no coinciden'); return }
    setLoading(true)
    try {
      const supervisor = await crearSupervisor({ nombre, jefe, pin })
      localStorage.setItem('supervisor_session', JSON.stringify(supervisor))
      setPaso('listo')
    } catch (e) {
      if (e.message === 'YA_EXISTE') {
        setError('Ya existe una cuenta con ese nombre. ¿Ya tienes cuenta? Inicia sesión.')
      } else {
        setError('Error al crear tu cuenta. Verifica tu conexión.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-3xl mx-auto mb-3">
          📊
        </div>
        <h1 className="text-xl font-black text-white">Zona Supervisor</h1>
        <p className="text-xs text-gray-500">Academia Guerrera · TE APUESTO</p>
      </div>

      {/* Barra de progreso */}
      {paso !== 'bienvenida' && paso !== 'listo' && (
        <div className="w-full max-w-sm mb-6">
          <div className="w-full bg-brand-medium rounded-full h-1.5">
            <div className="h-1.5 bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${progreso}%` }} />
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">

        {/* ── BIENVENIDA ── */}
        {paso === 'bienvenida' && (
          <div className="text-center space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Bienvenido/a, Supervisor/a 📊</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Crea tu cuenta para gestionar el avance de tus promotoras en tiempo real.
              </p>
            </div>
            <div className="space-y-2 text-left">
              {[
                ['👥', 'Ve el avance de cada promotora de tu equipo'],
                ['📈', 'Monitorea puntos, nivel y racha de actividad'],
                ['🎯', 'Identifica quién necesita refuerzo y apoyo'],
                ['⚡', 'Datos actualizados en tiempo real'],
              ].map(([icon, txt]) => (
                <div key={txt} className="flex items-center gap-3 bg-brand-dark rounded-xl p-3 border border-white/5">
                  <span className="text-xl">{icon}</span>
                  <p className="text-sm text-gray-300">{txt}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPaso('nombre')}
              className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl text-lg hover:bg-purple-500 transition-all active:scale-95"
            >
              Crear mi cuenta →
            </button>
            <button onClick={onVolver} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-all py-1">
              ← Volver al inicio
            </button>
          </div>
        )}

        {/* ── NOMBRE / JEFE ── */}
        {paso === 'nombre' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Selecciona tu nombre</h2>
              <p className="text-sm text-gray-500">Tu jefe se asignará automáticamente</p>
            </div>

            <div className="space-y-3">
              {SUPERVISORES_POR_JEFE.map(grupo => (
                <div key={grupo.jefe}>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 px-1">
                    Jefe: {grupo.jefe}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {grupo.supervisores.map(sup => (
                      <button
                        key={sup}
                        type="button"
                        onClick={() => setNombre(sup)}
                        className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all border ${
                          nombre === sup
                            ? 'bg-purple-600 text-white border-purple-500'
                            : 'bg-brand-dark text-gray-300 border-white/10 hover:border-purple-500/40'
                        }`}
                      >
                        {nombre === sup && <span className="mr-1">✓</span>}
                        {sup}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {nombre && (
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl px-4 py-3">
                <p className="text-xs text-purple-300 font-bold">✓ {nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">Jefe regional: {jefe}</p>
              </div>
            )}

            <button
              disabled={!nombre}
              onClick={() => setPaso('pin')}
              className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl text-base hover:bg-purple-500 transition-all disabled:opacity-40"
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── PIN ── */}
        {paso === 'pin' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Crea tu PIN secreto</h2>
              <p className="text-sm text-gray-500">4 dígitos para proteger tu acceso de supervisor</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">PIN (4 dígitos)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none text-center text-2xl tracking-widest"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Confirma tu PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinConf}
                  onChange={e => setPinConf(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-purple-500 outline-none text-center text-2xl tracking-widest ${
                    pinConf && pinConf !== pin ? 'border-red-500' : 'border-white/10'
                  }`}
                />
              </div>
              {pinConf && pinConf === pin && (
                <p className="text-xs text-green-400 text-center">✓ Los PIN coinciden</p>
              )}
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              disabled={pin.length !== 4 || pin !== pinConf || loading}
              onClick={registrar}
              className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl text-base hover:bg-purple-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? <><span className="animate-spin">⏳</span> Creando cuenta...</> : '¡Crear cuenta! →'}
            </button>
          </div>
        )}

        {/* ── LISTO ── */}
        {paso === 'listo' && (
          <div className="text-center space-y-5 animate-fade-in">
            <div className="text-6xl mb-2">🎉</div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">¡Listo, {nombre.split(' ')[0]}!</h2>
              <p className="text-sm text-gray-400">Tu cuenta de supervisor está activa. Ya puedes ver el avance de tu equipo.</p>
            </div>
            <div className="bg-brand-dark rounded-2xl p-4 border border-purple-500/20 text-left space-y-2">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wide">Tu perfil</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <div>
                  <p className="font-bold text-white">{nombre}</p>
                  <p className="text-xs text-gray-500">Supervisor/a · Jefe: {jefe}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onComplete}
              className="w-full bg-purple-600 text-white font-black py-4 rounded-2xl text-lg hover:bg-purple-500 transition-all active:scale-95"
            >
              Ver mi equipo →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
