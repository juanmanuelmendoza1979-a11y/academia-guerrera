import { useState } from 'react'
import emailjs from '@emailjs/browser'
import { loginJefe, buscarJefeParaRecuperacion, guardarCodigoRecuperacionJefe, actualizarPinJefe } from '../lib/db'

const EJS_SERVICE_ID  = 'service_8cleoof'
const EJS_TEMPLATE_ID = 'template_mfq3qpf'
const EJS_PUBLIC_KEY  = 'iuFumzVNHBPlz3lPB'

const JEFES = ['Victor Lazo', 'Karem Romero', 'Jesus Ynocencio', 'Tirza Vargasa', 'Ricardo Polo']

function generarCodigo() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function mensajeErrorFirebase(e) {
  if (!navigator.onLine) return 'Sin conexión a internet. Activa tu internet e intenta de nuevo.'
  const code = e?.code || ''
  if (code.includes('unavailable'))      return 'Servidor no disponible en este momento. Intenta en unos minutos.'
  if (code.includes('quota-exceeded'))   return 'Límite de uso del servidor alcanzado. Intenta más tarde.'
  if (code.includes('permission-denied'))return 'Acceso bloqueado por configuración del servidor. Contacta al administrador.'
  return 'Error del servidor (Firebase). Tu internet está bien — intenta en unos minutos.'
}

export default function LoginJefe({ onLogin, onNuevaCuenta, onVolver }) {
  const [vista, setVista] = useState('login')
  if (vista === 'recuperar') return <RecuperarPin onVolver={() => setVista('login')} />
  return <FormLogin onLogin={onLogin} onNuevaCuenta={onNuevaCuenta} onVolver={onVolver} onRecuperar={() => setVista('recuperar')} />
}

function FormLogin({ onLogin, onNuevaCuenta, onVolver, onRecuperar }) {
  const [nombre, setNombre]   = useState('')
  const [pin, setPin]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

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
      else setError(mensajeErrorFirebase(e))
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
            <select value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm">
              <option value="">Selecciona tu nombre...</option>
              {JEFES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">PIN (4 dígitos)</label>
            <input type="password" inputMode="numeric" maxLength={4}
              value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="• • • •"
              className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 outline-none text-center text-2xl tracking-widest" />
          </div>
        </div>

        {error && <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3"><p className="text-xs text-red-400">{error}</p></div>}

        <button onClick={handleLogin} disabled={loading || !nombre || pin.length !== 4}
          className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-base hover:bg-yellow-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? <><span className="animate-spin">⏳</span> Ingresando...</> : 'Ingresar →'}
        </button>

        <div className="text-center">
          <button onClick={onRecuperar} className="text-sm text-gray-500 hover:text-yellow-400 transition-all underline underline-offset-2">
            ¿Olvidaste tu PIN? Recupéralo por correo
          </button>
        </div>

        <div className="text-center space-y-2 border-t border-white/5 pt-4">
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

function RecuperarPin({ onVolver }) {
  const [paso, setPaso]               = useState('buscar')
  const [nombre, setNombre]           = useState('')
  const [correoInput, setCorreoInput] = useState('')
  const [codigoInput, setCodigoInput] = useState('')
  const [nuevoPin, setNuevoPin]       = useState('')
  const [pinConf, setPinConf]         = useState('')
  const [jefeId, setJefeId]           = useState('')
  const [codigoEnviado, setCodigoEnviado] = useState('')
  const [codigoExpira, setCodigoExpira]   = useState(null)
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  async function handleEnviarCodigo() {
    setError('')
    if (!nombre || !correoInput.includes('@')) { setError('Selecciona tu nombre e ingresa tu correo'); return }
    setLoading(true)
    try {
      const data = await buscarJefeParaRecuperacion(nombre)
      if (!data.correo || data.correo.toLowerCase() !== correoInput.trim().toLowerCase()) {
        setError('El correo no coincide con el registrado en tu cuenta.')
        setLoading(false); return
      }
      const codigo = generarCodigo()
      await guardarCodigoRecuperacionJefe(data.id, codigo)
      await emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_ID, { to_email: data.correo, to_name: data.nombre, codigo }, EJS_PUBLIC_KEY)
      setJefeId(data.id)
      setCodigoEnviado(codigo)
      setCodigoExpira(Date.now() + 10 * 60 * 1000)
      setPaso('codigo')
    } catch (e) {
      if (e.message === 'NO_ENCONTRADO') setError('No encontramos una cuenta con ese nombre. ¿Ya te registraste?')
      else setError('Error al enviar el correo. Verifica tu conexión.')
    } finally { setLoading(false) }
  }

  function handleVerificarCodigo() {
    setError('')
    if (Date.now() > codigoExpira) { setError('El código expiró. Solicita uno nuevo.'); setPaso('buscar'); return }
    if (codigoInput.trim() !== codigoEnviado) { setError('Código incorrecto. Revisa tu correo.'); return }
    setPaso('nuevo_pin')
  }

  async function handleGuardarPin() {
    setError('')
    if (nuevoPin.length !== 4) { setError('El PIN debe tener 4 dígitos'); return }
    if (nuevoPin !== pinConf) { setError('Los PIN no coinciden'); return }
    setLoading(true)
    try {
      await actualizarPinJefe(jefeId, nuevoPin)
      setPaso('listo')
    } catch { setError('Error al actualizar tu PIN. Intenta de nuevo.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 py-10">
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-yellow-500 flex items-center justify-center text-3xl mx-auto mb-3">🔑</div>
        <h1 className="text-xl font-black text-white">Recuperar PIN</h1>
        <p className="text-xs text-gray-500">Jefe Regional · Academia Guerrera</p>
      </div>

      <div className="w-full max-w-sm mb-6">
        <div className="flex gap-1.5">
          {['buscar','codigo','nuevo_pin'].map((p, i) => (
            <div key={p} className={`flex-1 h-1.5 rounded-full transition-all ${
              ['buscar','codigo','nuevo_pin','listo'].indexOf(paso) > i ? 'bg-yellow-500' : paso === p ? 'bg-yellow-500/60' : 'bg-brand-medium'
            }`} />
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-4">

        {paso === 'buscar' && (
          <>
            <div>
              <h2 className="text-lg font-black text-white mb-1">Verifica tu identidad</h2>
              <p className="text-sm text-gray-500">Selecciona tu nombre y correo registrado.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Tu nombre</label>
                <select value={nombre} onChange={e => setNombre(e.target.value)}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm">
                  <option value="">Selecciona tu nombre...</option>
                  {JEFES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Tu correo electrónico</label>
                <input type="email" value={correoInput} onChange={e => setCorreoInput(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 outline-none text-sm" />
              </div>
            </div>
            {error && <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3"><p className="text-xs text-red-400">{error}</p></div>}
            <button onClick={handleEnviarCodigo} disabled={loading || !nombre || !correoInput.includes('@')}
              className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-base hover:bg-yellow-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin">⏳</span> Enviando código...</> : 'Enviar código al correo →'}
            </button>
          </>
        )}

        {paso === 'codigo' && (
          <>
            <div>
              <h2 className="text-lg font-black text-white mb-1">Revisa tu correo 📬</h2>
              <p className="text-sm text-gray-500">Enviamos un código de 6 dígitos a <span className="text-yellow-400 font-bold">{correoInput}</span></p>
              <p className="text-xs text-gray-600 mt-1">Válido por 10 minutos · Revisa también spam</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Código de 6 dígitos</label>
              <input type="text" inputMode="numeric" maxLength={6}
                value={codigoInput} onChange={e => setCodigoInput(e.target.value.replace(/\D/g,'').slice(0,6))}
                placeholder="• • • • • •"
                className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 outline-none text-center text-2xl tracking-widest" />
            </div>
            {error && <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3"><p className="text-xs text-red-400">{error}</p></div>}
            <button onClick={handleVerificarCodigo} disabled={codigoInput.length !== 6}
              className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-base hover:bg-yellow-400 transition-all disabled:opacity-40">
              Verificar código →
            </button>
            <button onClick={() => { setPaso('buscar'); setError('') }} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 py-2">
              ← No recibí el código
            </button>
          </>
        )}

        {paso === 'nuevo_pin' && (
          <>
            <div>
              <h2 className="text-lg font-black text-white mb-1">Crea tu nuevo PIN 🔐</h2>
              <p className="text-sm text-gray-500">Elige un PIN de 4 dígitos.</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Nuevo PIN</label>
                <input type="password" inputMode="numeric" maxLength={4}
                  value={nuevoPin} onChange={e => setNuevoPin(e.target.value.replace(/\D/g,'').slice(0,4))}
                  placeholder="• • • •"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 outline-none text-center text-2xl tracking-widest" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Confirma PIN</label>
                <input type="password" inputMode="numeric" maxLength={4}
                  value={pinConf} onChange={e => setPinConf(e.target.value.replace(/\D/g,'').slice(0,4))}
                  placeholder="• • • •"
                  className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white placeholder-gray-600 outline-none text-center text-2xl tracking-widest ${pinConf && pinConf !== nuevoPin ? 'border-red-500' : 'border-white/10'}`} />
              </div>
              {pinConf && pinConf === nuevoPin && <p className="text-xs text-green-400 text-center">✓ Los PIN coinciden</p>}
            </div>
            {error && <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3"><p className="text-xs text-red-400">{error}</p></div>}
            <button onClick={handleGuardarPin} disabled={loading || nuevoPin.length !== 4 || nuevoPin !== pinConf}
              className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-base hover:bg-yellow-400 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
              {loading ? <><span className="animate-spin">⏳</span> Guardando...</> : 'Guardar nuevo PIN →'}
            </button>
          </>
        )}

        {paso === 'listo' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">¡PIN actualizado!</h2>
              <p className="text-sm text-gray-400">Ya puedes ingresar con tu nuevo PIN.</p>
            </div>
            <button onClick={onVolver} className="w-full bg-yellow-500 text-black font-black py-4 rounded-2xl text-base hover:bg-yellow-400 transition-all">
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
