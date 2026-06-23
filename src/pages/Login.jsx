import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { loginGuerrera, buscarGuerreraParaRecuperacion, guardarCodigoRecuperacion, actualizarPin } from '../lib/db'

// ── EmailJS — completa estos 3 valores después de crear tu cuenta en emailjs.com ──
const EJS_SERVICE_ID  = 'TU_SERVICE_ID'
const EJS_TEMPLATE_ID = 'TU_TEMPLATE_ID'
const EJS_PUBLIC_KEY  = 'TU_PUBLIC_KEY'

function generarCodigo() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

// ══════════════════════════════════════════
// PANTALLA PRINCIPAL DE LOGIN
// ══════════════════════════════════════════
export default function Login({ onLogin, onNuevaCuenta, onVolver }) {
  const [vista, setVista] = useState('login') // 'login' | 'recuperar'

  if (vista === 'recuperar') {
    return <RecuperarPin onVolver={() => setVista('login')} />
  }

  return <FormLogin onLogin={onLogin} onNuevaCuenta={onNuevaCuenta} onVolver={onVolver} onRecuperar={() => setVista('recuperar')} />
}

// ══════════════════════════════════════════
// FORMULARIO DE LOGIN NORMAL
// ══════════════════════════════════════════
function FormLogin({ onLogin, onNuevaCuenta, onVolver, onRecuperar }) {
  const [nombre, setNombre]   = useState('')
  const [pin, setPin]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleLogin() {
    setError('')
    if (!nombre.trim()) { setError('Ingresa tu nombre completo'); return }
    if (pin.length !== 4) { setError('El PIN debe tener 4 dígitos'); return }
    setLoading(true)
    try {
      const guerrera = await loginGuerrera({ nombre, pin })
      localStorage.setItem('guerrera_session', JSON.stringify(guerrera))
      onLogin(guerrera)
    } catch (e) {
      if (e.message === 'NO_ENCONTRADA') {
        setError('No encontramos tu cuenta. Verifica tu nombre tal como lo registraste.')
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
      <div className="mb-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center text-3xl mx-auto mb-3">🥊</div>
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
              placeholder="Ej: María García R."
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-sm"
            />
            <p className="text-xs text-gray-600 mt-1">Tal como lo ingresaste al registrarte</p>
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
          disabled={loading || !nombre.trim() || pin.length !== 4}
          className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-orange-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading ? <><span className="animate-spin">⏳</span> Ingresando...</> : 'Ingresar →'}
        </button>

        {/* Recuperar PIN */}
        <div className="text-center">
          <button
            onClick={onRecuperar}
            className="text-sm text-gray-500 hover:text-brand-orange transition-all underline underline-offset-2"
          >
            ¿Olvidaste tu PIN? Recupéralo por correo
          </button>
        </div>

        <div className="text-center border-t border-white/5 pt-4">
          <p className="text-sm text-gray-500 mb-2">¿Aún no tienes cuenta?</p>
          <button onClick={onNuevaCuenta} className="text-brand-orange font-bold text-sm hover:text-orange-400 transition-all">
            Crear cuenta nueva →
          </button>
        </div>

        {onVolver && (
          <button onClick={onVolver} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-all py-2">
            ← Volver al inicio
          </button>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// FLUJO DE RECUPERACIÓN DE PIN
// ══════════════════════════════════════════
function RecuperarPin({ onVolver }) {
  const [paso, setPaso]         = useState('buscar')   // 'buscar' | 'codigo' | 'nuevo_pin' | 'listo'
  const [nombre, setNombre]     = useState('')
  const [correoInput, setCorreoInput] = useState('')
  const [codigoInput, setCodigoInput] = useState('')
  const [nuevoPin, setNuevoPin] = useState('')
  const [pinConf, setPinConf]   = useState('')
  const [guerreraId, setGuerreraId] = useState('')
  const [codigoEnviado, setCodigoEnviado] = useState('')
  const [codigoExpira, setCodigoExpira]   = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  // PASO 1: Buscar cuenta y enviar código
  async function handleEnviarCodigo() {
    setError('')
    if (!nombre.trim() || !correoInput.includes('@')) {
      setError('Ingresa tu nombre completo y correo electrónico')
      return
    }
    setLoading(true)
    try {
      const data = await buscarGuerreraParaRecuperacion(nombre.trim())

      if (!data.correo || data.correo.toLowerCase() !== correoInput.trim().toLowerCase()) {
        setError('El correo no coincide con el registrado en tu cuenta.')
        setLoading(false)
        return
      }

      const codigo = generarCodigo()
      const expira = Date.now() + 10 * 60 * 1000

      await guardarCodigoRecuperacion(data.id, codigo)

      await emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_ID, {
        to_email: data.correo,
        to_name:  data.nombre,
        codigo,
      }, EJS_PUBLIC_KEY)

      setGuerreraId(data.id)
      setCodigoEnviado(codigo)
      setCodigoExpira(expira)
      setPaso('codigo')
    } catch (e) {
      if (e.message === 'NO_ENCONTRADA') {
        setError('No encontramos una cuenta con ese nombre. Verifica que sea exactamente como lo registraste.')
      } else {
        setError('Error al enviar el correo. Verifica tu conexión e intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  // PASO 2: Verificar código
  function handleVerificarCodigo() {
    setError('')
    if (Date.now() > codigoExpira) {
      setError('El código expiró. Solicita uno nuevo.')
      setPaso('buscar')
      return
    }
    if (codigoInput.trim() !== codigoEnviado) {
      setError('Código incorrecto. Revisa tu correo e intenta de nuevo.')
      return
    }
    setPaso('nuevo_pin')
  }

  // PASO 3: Guardar nuevo PIN
  async function handleGuardarPin() {
    setError('')
    if (nuevoPin.length !== 4) { setError('El PIN debe tener 4 dígitos'); return }
    if (nuevoPin !== pinConf)  { setError('Los PIN no coinciden'); return }
    setLoading(true)
    try {
      await actualizarPin(guerreraId, nuevoPin)
      setPaso('listo')
    } catch {
      setError('Error al actualizar tu PIN. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center text-3xl mx-auto mb-3">🔑</div>
        <h1 className="text-xl font-black text-white">Recuperar PIN</h1>
        <p className="text-xs text-gray-500">Academia Guerrera · TE APUESTO</p>
      </div>

      {/* Barra de progreso */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex gap-1.5 mb-1">
          {['buscar','codigo','nuevo_pin'].map((p, i) => (
            <div key={p} className={`flex-1 h-1.5 rounded-full transition-all ${
              ['buscar','codigo','nuevo_pin','listo'].indexOf(paso) > i
                ? 'bg-brand-orange'
                : paso === p ? 'bg-brand-orange/60' : 'bg-brand-medium'
            }`} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">

        {/* ── PASO 1: Buscar cuenta ── */}
        {paso === 'buscar' && (
          <>
            <div>
              <h2 className="text-lg font-black text-white mb-1">¿Cómo te registraste?</h2>
              <p className="text-sm text-gray-500">Ingresa tu nombre y correo para verificar tu identidad.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Tu nombre completo</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Ej: María García R."
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">Exactamente como lo registraste</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Tu correo electrónico</label>
                <input
                  type="email"
                  value={correoInput}
                  onChange={e => setCorreoInput(e.target.value)}
                  placeholder="Ej: maria@gmail.com"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-sm"
                />
                <p className="text-xs text-gray-600 mt-1">El que registraste al crear tu cuenta</p>
              </div>
            </div>
            {error && <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3"><p className="text-xs text-red-400">{error}</p></div>}
            <button
              onClick={handleEnviarCodigo}
              disabled={loading || !nombre.trim() || !correoInput.includes('@')}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-orange-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? <><span className="animate-spin">⏳</span> Enviando código...</> : 'Enviar código al correo →'}
            </button>
          </>
        )}

        {/* ── PASO 2: Ingresar código ── */}
        {paso === 'codigo' && (
          <>
            <div>
              <h2 className="text-lg font-black text-white mb-1">Revisa tu correo 📬</h2>
              <p className="text-sm text-gray-500">
                Enviamos un código de 6 dígitos a{' '}
                <span className="text-brand-orange font-bold">{correoInput}</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">Válido por 10 minutos · Revisa también tu carpeta de spam</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Código de 6 dígitos</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={codigoInput}
                onChange={e => setCodigoInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •"
                className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-center text-2xl tracking-widest"
              />
            </div>
            {error && <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3"><p className="text-xs text-red-400">{error}</p></div>}
            <button
              onClick={handleVerificarCodigo}
              disabled={codigoInput.length !== 6}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-orange-500 transition-all disabled:opacity-40"
            >
              Verificar código →
            </button>
            <button onClick={() => { setPaso('buscar'); setError('') }} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 py-2">
              ← No recibí el código, volver a intentar
            </button>
          </>
        )}

        {/* ── PASO 3: Nuevo PIN ── */}
        {paso === 'nuevo_pin' && (
          <>
            <div>
              <h2 className="text-lg font-black text-white mb-1">Crea tu nuevo PIN 🔐</h2>
              <p className="text-sm text-gray-500">Elige un PIN de 4 dígitos que recuerdes fácil.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Nuevo PIN (4 dígitos)</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={nuevoPin}
                  onChange={e => setNuevoPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-center text-2xl tracking-widest"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Confirma tu nuevo PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinConf}
                  onChange={e => setPinConf(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-center text-2xl tracking-widest ${
                    pinConf && pinConf !== nuevoPin ? 'border-red-500' : 'border-white/10'
                  }`}
                />
              </div>
              {pinConf && pinConf === nuevoPin && (
                <p className="text-xs text-green-400 text-center">✓ Los PIN coinciden</p>
              )}
            </div>
            {error && <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3"><p className="text-xs text-red-400">{error}</p></div>}
            <button
              onClick={handleGuardarPin}
              disabled={loading || nuevoPin.length !== 4 || nuevoPin !== pinConf}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-orange-500 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {loading ? <><span className="animate-spin">⏳</span> Guardando...</> : 'Guardar nuevo PIN →'}
            </button>
          </>
        )}

        {/* ── LISTO ── */}
        {paso === 'listo' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">¡PIN actualizado!</h2>
              <p className="text-sm text-gray-400">Ya puedes ingresar con tu nuevo PIN.</p>
            </div>
            <button
              onClick={onVolver}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-orange-500 transition-all"
            >
              Ir a iniciar sesión →
            </button>
          </div>
        )}

        {paso !== 'listo' && (
          <button onClick={onVolver} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-all py-2">
            ← Volver al login
          </button>
        )}
      </div>
    </div>
  )
}
