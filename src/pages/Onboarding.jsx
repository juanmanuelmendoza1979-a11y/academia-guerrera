import { useState } from 'react'
import { crearGuerrera } from '../lib/db'
import { avatarUrl } from '../components/Avatar'

const AVATARS = [
  // Fuerza e identidad
  { seed: 'Leona',      label: 'Leona' },
  { seed: 'Guerrera',   label: 'Guerrera' },
  { seed: 'Invicta',    label: 'Invicta' },
  { seed: 'Titan',      label: 'Titán' },
  { seed: 'Fenix',      label: 'Fénix' },
  { seed: 'Valiente',   label: 'Valiente' },
  // Deporte y acción
  { seed: 'Goleadora',  label: 'Goleadora' },
  { seed: 'Capitana',   label: 'Capitana' },
  { seed: 'Luchadora',  label: 'Luchadora' },
  { seed: 'Delantera',  label: 'Delantera' },
  { seed: 'Defensora',  label: 'Defensora' },
  { seed: 'Velocidad',  label: 'Velocidad' },
  // Logro y reconocimiento
  { seed: 'Campeon',    label: 'Campeón' },
  { seed: 'Victoria',   label: 'Victoria' },
  { seed: 'Gloria',     label: 'Gloria' },
  { seed: 'Triunfo',    label: 'Triunfo' },
  { seed: 'Medallista', label: 'Medallista' },
  { seed: 'Crack',      label: 'Crack' },
  // Energía y poder
  { seed: 'Estrella',   label: 'Estrella' },
  { seed: 'Fuego',      label: 'Fuego' },
  { seed: 'Rayo',       label: 'Rayo' },
  { seed: 'Fuerza',     label: 'Fuerza' },
  { seed: 'Aguilar',    label: 'Águila' },
  { seed: 'Diamante',   label: 'Diamante' },
]

const SUPERVISORES_POR_JEFE = [
  { jefe: 'Victor Lazo',      supervisores: ['Sara Salazar', 'Diana Paz', 'Candy Odar'] },
  { jefe: 'Karem Romero',     supervisores: ['Estefanny Martinez', 'Lady Zelada', 'Michelle Gomez', 'Zurhama Pisconte'] },
  { jefe: 'Jesus Ynocencio',  supervisores: ['Alina Untama', 'Crisly Cotrina', 'Roxana Vicente', 'Renzo Asensios'] },
  { jefe: 'Tirza Vargasa',    supervisores: ['Wendy Aguayo', 'Carlos Gallegos', 'Katia Dueñas'] },
  { jefe: 'Ricardo Polo',     supervisores: ['Luis Bustamante', 'Gonzalo Lopez', 'Carla Huerta', 'Milagros Urbano'] },
]

const PASOS = ['bienvenida', 'perfil', 'pin', 'avatar', 'listo']

export default function Onboarding({ onComplete }) {
  const [paso, setPaso]               = useState('bienvenida')
  const [primerNombre, setPrimerNombre] = useState('')
  const [primerApellido, setPrimerApellido] = useState('')
  const [inicialApellido, setInicialApellido] = useState('')
  const [supervisor, setSupervisor]   = useState('')
  const [pin, setPin]                 = useState('')
  const [pinConf, setPinConf]         = useState('')
  const [avatar, setAvatar]           = useState('Leona')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  const nombre = [primerNombre.trim(), primerApellido.trim(), inicialApellido.trim().slice(0,1).toUpperCase()]
    .filter(Boolean).join(' ') + (inicialApellido.trim() ? '.' : '')

  const idx = PASOS.indexOf(paso)
  const progreso = Math.round((idx / (PASOS.length - 1)) * 100)

  async function registrar() {
    setError('')
    if (pin.length !== 4) { setError('El PIN debe tener 4 dígitos'); return }
    if (pin !== pinConf)  { setError('Los PIN no coinciden'); return }
    setLoading(true)
    try {
      const guerrera = await crearGuerrera({ nombre, avatar, pin, supervisor })
      localStorage.setItem('guerrera_session', JSON.stringify(guerrera))
      setPaso('listo')
    } catch (e) {
      if (e.message === 'YA_EXISTE') {
        setError('Ya existe una guerrera con ese nombre. ¿Ya tienes cuenta? Inicia sesión.')
      } else {
        setError('Error al crear tu cuenta. Verifica tu conexión e intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 py-10">
      {/* Logo */}
      <div className="mb-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-orange flex items-center justify-center text-3xl mx-auto mb-3">
          🥊
        </div>
        <h1 className="text-xl font-black text-white">Academia Guerrera</h1>
        <p className="text-xs text-gray-500">TE APUESTO · Formación interna</p>
      </div>

      {/* Barra de progreso */}
      {paso !== 'bienvenida' && paso !== 'listo' && (
        <div className="w-full max-w-sm mb-6">
          <div className="w-full bg-brand-medium rounded-full h-1.5">
            <div
              className="h-1.5 bg-brand-orange rounded-full transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-sm">

        {/* ── PASO: BIENVENIDA ── */}
        {paso === 'bienvenida' && (
          <div className="text-center space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white mb-2">¡Bienvenida, Guerrera! 💪</h2>
              <p className="text-sm text-gray-400 leading-relaxed">
                Esta es tu plataforma de capacitación. Aprende, practica y compite con otras promotoras de TE APUESTO.
              </p>
            </div>
            <div className="space-y-2 text-left">
              {[
                ['🎯', 'Gana puntos por cada reto completado'],
                ['🏆', 'Compite en el ranking con todas las guerreras'],
                ['📈', 'Sigue tu avance por niveles'],
                ['💡', 'Accede a tips y frases listas para tu POS'],
              ].map(([icon, txt]) => (
                <div key={txt} className="flex items-center gap-3 bg-brand-dark rounded-xl p-3 border border-white/5">
                  <span className="text-xl">{icon}</span>
                  <p className="text-sm text-gray-300">{txt}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setPaso('perfil')}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-lg hover:bg-orange-500 transition-all active:scale-95"
            >
              Crear mi cuenta →
            </button>
            <p className="text-xs text-gray-600">Contenido interno · Solo personal autorizado adulto</p>
          </div>
        )}

        {/* ── PASO: PERFIL ── */}
        {paso === 'perfil' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Cuéntanos sobre ti</h2>
              <p className="text-sm text-gray-500">Esta información aparecerá en el ranking.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Primer Nombre Completo</label>
                <input
                  type="text"
                  value={primerNombre}
                  onChange={e => setPrimerNombre(e.target.value)}
                  placeholder="Ej: María"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Primer Apellido Completo</label>
                <input
                  type="text"
                  value={primerApellido}
                  onChange={e => setPrimerApellido(e.target.value)}
                  placeholder="Ej: García"
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Inicial de tu Segundo Apellido</label>
                <input
                  type="text"
                  value={inicialApellido}
                  onChange={e => setInicialApellido(e.target.value.replace(/[^a-zA-ZáéíóúñÁÉÍÓÚÑ]/g, '').slice(0,1).toUpperCase())}
                  placeholder="Ej: R"
                  maxLength={1}
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-sm uppercase"
                />
              </div>
              {nombre && (
                <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-500">Tu nombre en el ranking:</p>
                  <p className="text-sm font-black text-white">{nombre}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block uppercase tracking-wide">Tu supervisor</label>
                <p className="text-xs text-gray-600 mb-2">Selecciona el nombre de la persona que te supervisa directamente</p>
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
                            onClick={() => setSupervisor(sup)}
                            className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all border ${
                              supervisor === sup
                                ? 'bg-brand-orange text-white border-brand-orange'
                                : 'bg-brand-dark text-gray-300 border-white/10 hover:border-brand-orange/40'
                            }`}
                          >
                            {supervisor === sup && <span className="mr-1">✓</span>}
                            {sup}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                {supervisor && (
                  <div className="mt-2 bg-brand-orange/10 border border-brand-orange/30 rounded-xl px-3 py-2">
                    <p className="text-xs text-brand-orange font-bold">✓ Supervisora seleccionada: {supervisor}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              disabled={!primerNombre.trim() || !primerApellido.trim() || !inicialApellido.trim() || !supervisor}
              onClick={() => setPaso('pin')}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-orange-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO: PIN ── */}
        {paso === 'pin' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Crea tu PIN secreto</h2>
              <p className="text-sm text-gray-500">4 dígitos para proteger tu cuenta. Solo tú lo sabes.</p>
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
                  className="w-full bg-brand-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-center text-2xl tracking-widest"
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
                  className={`w-full bg-brand-dark border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-brand-orange outline-none text-center text-2xl tracking-widest ${
                    pinConf && pinConf !== pin ? 'border-red-500' : 'border-white/10'
                  }`}
                />
              </div>
              {pinConf && pinConf === pin && (
                <p className="text-xs text-green-400 text-center">✓ Los PIN coinciden</p>
              )}
            </div>

            <div className="bg-brand-dark rounded-xl p-3 border border-white/5">
              <p className="text-xs text-gray-500">
                💡 Elige un PIN que recuerdes fácil. No lo compartas con nadie. Si lo olvidas, pide ayuda a tu supervisor.
              </p>
            </div>

            <button
              disabled={pin.length !== 4 || pin !== pinConf}
              onClick={() => setPaso('avatar')}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-orange-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar →
            </button>
          </div>
        )}

        {/* ── PASO: AVATAR ── */}
        {paso === 'avatar' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Elige tu avatar</h2>
              <p className="text-sm text-gray-500">Así te verán las demás guerreras en el ranking.</p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map(av => (
                <button
                  key={av.seed}
                  onClick={() => setAvatar(av.seed)}
                  className={`w-full aspect-square rounded-2xl overflow-hidden transition-all border-2 relative ${
                    avatar === av.seed
                      ? 'border-brand-orange scale-110 shadow-lg shadow-brand-orange/30'
                      : 'border-white/5 hover:border-white/30'
                  }`}
                >
                  <img src={avatarUrl(av.seed)} alt={av.label} className="w-full h-full object-cover" />
                  {avatar === av.seed && (
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] font-black bg-brand-orange text-white px-1 rounded-full leading-tight">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-center text-gray-600">
              {AVATARS.find(a => a.seed === avatar)?.label || avatar}
            </p>

            {/* Preview */}
            <div className="bg-brand-dark rounded-2xl p-4 border border-white/5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-orange/40">
                <img src={avatarUrl(avatar)} alt={avatar} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{nombre}</p>
                <p className="text-xs text-gray-500">Sup: {supervisor}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/40 rounded-xl p-3">
                <p className="text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={registrar}
              disabled={loading}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-orange-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin">⏳</span> Creando tu cuenta...</>
              ) : (
                '¡Soy Guerrera! 🥊'
              )}
            </button>
          </div>
        )}

        {/* ── PASO: LISTO ── */}
        {paso === 'listo' && (
          <div className="text-center space-y-5 animate-fade-in">
            <div className="text-6xl mb-2">🎉</div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">¡Bienvenida al equipo, {nombre.split(' ')[0]}!</h2>
              <p className="text-sm text-gray-400">
                Tu cuenta está lista. Empieza a ganar puntos, sube en el ranking y demuestra que eres la mejor Guerrera.
              </p>
            </div>
            <div className="bg-brand-dark rounded-2xl p-4 border border-brand-orange/20 text-left space-y-2">
              <p className="text-xs font-bold text-brand-orange uppercase tracking-wide">Tu perfil</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-orange/40 flex-shrink-0">
                  <img src={avatarUrl(avatar)} alt={avatar} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-white">{nombre}</p>
                  <p className="text-xs text-gray-500">Sup: {supervisor}</p>
                </div>
              </div>
            </div>
            <button
              onClick={onComplete}
              className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-lg hover:bg-orange-500 transition-all active:scale-95"
            >
              ¡Empezar ahora! →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
