import { useState } from 'react'
import { loginGuerrera } from '../lib/db'

export default function Login({ onLogin, onNuevaCuenta, onVolver }) {
  const [nombre, setNombre] = useState('')
  const [pos, setPos]       = useState('')
  const [pin, setPin]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  async function handleLogin() {
    setError('')
    if (!nombre.trim() || !pos.trim()) { setError('Ingresa tu nombre y punto de venta'); return }
    if (pin.length !== 4) { setError('El PIN debe tener 4 dígitos'); return }

    setLoading(true)
    try {
      const guerrera = await loginGuerrera({ nombre, pos, pin })
      localStorage.setItem('guerrera_session', JSON.stringify(guerrera))
      onLogin(guerrera)
    } catch (e) {
      if (e.message === 'NO_ENCONTRADA') {
        setError('No encontramos tu cuenta. Verifica tu nombre y punto de venta.')
      } else if (e.message === 'PIN_INCORRECTO') {
        setError('PIN incorrecto. Inténtalo de nuevo.')
      } else {
        setError('Error de conexión. Verifica tu internet e intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center text-3xl mx-auto mb-3">
          🥊
        </div>
        <h1 className="text-xl font-black text-white">Academia Guerrera</h1>
        <p className="text-xs text-gray-500">TE APUESTO · Formación interna</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <div>
          <h2 className="text-xl font-black text-white mb-1">Inicia sesión</h2>
          <p className="text-sm text-gray-500">Ingresa con los datos que registraste.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Tu nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: María García"
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Código de tu punto de venta</label>
            <input
              type="text"
              value={pos}
              onChange={e => setPos(e.target.value.toUpperCase())}
              placeholder="Ej: POS-001"
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">PIN (4 dígitos)</label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="• • • •"
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-center text-2xl tracking-widest"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !nombre.trim() || !pos.trim() || pin.length !== 4}
          className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-orange-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="animate-spin">⏳</span> Ingresando...</>
          ) : (
            'Ingresar →'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">¿Aún no tienes cuenta?</p>
          <button
            onClick={onNuevaCuenta}
            className="text-brand-orange font-bold text-sm hover:text-orange-400 transition-all"
          >
            Crear cuenta nueva →
          </button>
        </div>

        <p className="text-xs text-gray-600 text-center">
          ¿Olvidaste tu PIN? Contacta a tu supervisor para recuperar acceso.
        </p>

        {onVolver && (
          <button onClick={onVolver} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-all py-2">
            ← Volver al inicio
          </button>
        )}
      </div>
    </div>
  )
}
