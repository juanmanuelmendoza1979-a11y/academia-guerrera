import { useState } from 'react'
import { crearJefe } from '../lib/db'

const JEFES = ['Victor Lazo', 'Karem Romero', 'Jesus Ynocencio', 'Tirza Vargasa', 'Ricardo Polo']

export default function OnboardingJefe({ onComplete, onVolver }) {
  const [paso, setPaso]       = useState('bienvenida')
  const [nombre, setNombre]   = useState('')
  const [pin, setPin]         = useState('')
  const [pinConf, setPinConf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function registrar() {
    setError('')
    if (pin.length !== 4) { setError('El PIN debe tener 4 dígitos'); return }
    if (pin !== pinConf)   { setError('Los PIN no coinciden'); return }
    setLoading(true)
    try {
      const jefe = await crearJefe({ nombre, pin })
      localStorage.setItem('jefe_session', JSON.stringify(jefe))
      setPaso('listo')
    } catch (e) {
      if (e.message === 'YA_EXISTE') setError('Ya existe una cuenta con ese nombre. Inicia sesión.')
      else setError('Error al crear tu cuenta. Verifica tu conexión.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-3xl mx-auto mb-3">🏆</div>
        <h1 className="text-xl font-black text-white">Zona Jefe Regional</h1>
        <p className="text-xs text-gray-500">Academia Guerrera · TE APUESTO</p>
      </div>

      <div className="w-full max-w-sm">

        {paso === 'bienvenida' && (
          <div className="text-center space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Bienvenido/a, Jefe Regional 🏆</h2>
              <p className="text-sm text-gray-400 leading-relaxed">Tu plataforma para ver el rendimiento completo de tu región.</p>
            </div>
            <div className="space-y-2 text-left">
              {[
                ['📊','Vista global de todos tus supervisores y promotoras'],
                ['🔍','Conducta de usabilidad por supervisor'],
                ['🏅','Rankings segmentados por equipo de supervisor'],
                ['⚡','Estadísticas en tiempo real de tu región'],
              ].map(([icon, txt]) => (
                <div key={txt} className="flex items-center gap-3 bg-brand-dark rounded-xl p-3 border border-white/5">
                  <span className="text-xl">{icon}</span>
                  <p className="text-sm text-gray-300">{txt}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setPaso('nombre')}
              className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-lg hover:bg-yellow-400 transition-all active:scale-95">
              Crear mi cuenta →
            </button>
            <button onClick={onVolver} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 py-1">← Volver</button>
          </div>
        )}

        {paso === 'nombre' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Selecciona tu nombre</h2>
              <p className="text-sm text-gray-500">Elige de la lista de Jefes Regionales</p>
            </div>
            <div className="space-y-2">
              {JEFES.map(j => (
                <button key={j} onClick={() => setNombre(j)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all ${
                    nombre === j ? 'bg-yellow-500/20 border-yellow-500 text-white' : 'bg-brand-dark border-white/10 text-gray-300 hover:border-yellow-500/40'
                  }`}>
                  <span className="text-2xl">🏆</span>
                  <span className="font-bold">{j}</span>
                  {nombre === j && <span className="ml-auto text-yellow-400 font-black">✓</span>}
                </button>
              ))}
            </div>
            <button disabled={!nombre} onClick={() => setPaso('pin')}
              className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-base hover:bg-yellow-400 transition-all disabled:opacity-40">
              Continuar →
            </button>
          </div>
        )}

        {paso === 'pin' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Crea tu PIN secreto</h2>
              <p className="text-sm text-gray-500">4 dígitos para proteger tu acceso</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">PIN</label>
                <input type="password" inputMode="numeric" maxLength={4}
                  value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0,4))}
                  placeholder="• • • •"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 outline-none text-center text-2xl tracking-widest" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Confirma PIN</label>
                <input type="password" inputMode="numeric" maxLength={4}
                  value={pinConf} onChange={e => setPinConf(e.target.value.replace(/\D/g, '').slice(0,4))}
                  placeholder="• • • •"
                  className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 outline-none text-center text-2xl tracking-widest ${pinConf && pinConf !== pin ? 'border-red-500' : 'border-white/10'}`} />
              </div>
              {pinConf && pinConf === pin && <p className="text-xs text-green-400 text-center">✓ Los PIN coinciden</p>}
            </div>
            {error && <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3"><p className="text-xs text-red-400">{error}</p></div>}
            <button disabled={pin.length !== 4 || pin !== pinConf || loading} onClick={registrar}
              className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-base hover:bg-yellow-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin">⏳</span> Creando...</> : '¡Crear cuenta! →'}
            </button>
          </div>
        )}

        {paso === 'listo' && (
          <div className="text-center space-y-5 animate-fade-in">
            <div className="text-6xl">🎉</div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">¡Listo, {nombre.split(' ')[0]}!</h2>
              <p className="text-sm text-gray-400">Tu cuenta de Jefe Regional está activa.</p>
            </div>
            <div className="bg-brand-dark rounded-2xl p-4 border border-yellow-500/20 text-left">
              <p className="text-xs font-bold text-yellow-400 uppercase tracking-wide mb-2">Tu perfil</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="font-bold text-white">{nombre}</p>
                  <p className="text-xs text-gray-500">Jefe Regional · TE APUESTO</p>
                </div>
              </div>
            </div>
            <button onClick={onComplete}
              className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-lg hover:bg-yellow-400 transition-all active:scale-95">
              Ver mi región →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
