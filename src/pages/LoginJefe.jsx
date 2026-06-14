import { useState } from 'react'
import { loginJefe } from '../lib/db'

const JEFES = ['Victor Lazo', 'Karem Romero', 'Jesus Ynocencio', 'Tirza Vargasa', 'Ricardo Polo']

export default function LoginJefe({ onLogin, onNuevaCuenta, onVolver }) {
  const [nombre, setNombre] = useState('')
  const [pin, setPin]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleLogin() {
    setError('')
    if (!nombre) { setError('Selecciona tu nombre'); return }
    if (pin.length !== 4) { setError('El PIN debe tener 4 dígitos'); return }
    setLoading(true)
    try {
      const jefe = await loginJefe({ nombre, pin })
      localStorage.setItem('jefe_session', JSON.stringify(jefe))
      onLogin(jefe)
    } catch (e) {
      if (e.message === 'NO_ENCONTRADO') setError('No encontramos tu cuenta. ¿Ya te registraste?')
      else if (e.message === 'PIN_INCORRECTO') setError('PIN incorrecto. Inténtalo de nuevo.')
      else setError('Error de conexión. Verifica tu internet.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-3xl mx-auto mb-3">🏆</div>
        <h1 className="text-xl font-black text-white">Zona Jefe Regional</h1>
        <p className="text-xs text-gray-500">Academia Guerrera · TE APUESTO</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <h2 className="text-xl font-black text-white mb-1">Ingresa como Jefe Regional</h2>
          <p className="text-sm text-gray-500">Selecciona tu nombre y escribe tu PIN</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Tu nombre</label>
            <select
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm"
            >
              <option value="">Selecciona tu nombre...</option>
              {JEFES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">PIN (4 dígitos)</label>
            <input
              type="password" inputMode="numeric" maxLength={4}
              value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="• • • •"
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 outline-none text-center text-2xl tracking-widest"
            />
          </div>
        </div>

        {error && <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3"><p className="text-xs text-red-400">{error}</p></div>}

        <button onClick={handleLogin} disabled={loading || !nombre || pin.length !== 4}
          className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-base hover:bg-yellow-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? <><span className="animate-spin">⏳</span> Ingresando...</> : 'Ingresar →'}
        </button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500">¿Aún no tienes cuenta?</p>
          <button onClick={onNuevaCuenta} className="text-yellow-400 font-bold text-sm hover:text-yellow-300 transition-all">
            Crear cuenta de Jefe Regional →
          </button>
        </div>

        <button onClick={onVolver} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-all py-2">
          ← Volver al inicio
        </button>
      </div>
    </div>
  )
}
