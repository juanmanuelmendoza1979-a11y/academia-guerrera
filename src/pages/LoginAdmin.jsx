import { useState } from 'react'

const ADMIN_CODE = 'GUERRERA2026'

export default function LoginAdmin({ onLogin, onVolver }) {
  const [codigo, setCodigo] = useState('')
  const [error, setError]   = useState('')
  const [show, setShow]     = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (codigo.trim() === ADMIN_CODE) {
      onLogin({ nombre: 'Administrador', rol: 'admin' })
    } else {
      setError('Código incorrecto')
      setCodigo('')
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-3xl mx-auto mb-4">🛡️</div>
          <h1 className="text-xl font-black text-white">Acceso Administrador</h1>
          <p className="text-xs text-gray-500 mt-1">Solo personal autorizado</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              value={codigo}
              onChange={e => { setCodigo(e.target.value); setError('') }}
              placeholder="Código de administrador"
              className="w-full bg-brand-dark border border-white/10 rounded-2xl px-4 py-4 text-white text-center text-lg font-bold tracking-widest placeholder-gray-600 focus:outline-none focus:border-red-500/50"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShow(s => !s)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-sm"
            >
              {show ? '🙈' : '👁️'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-2.5 text-center">
              <p className="text-sm font-bold text-red-400">🔒 {error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!codigo}
            className="w-full py-4 bg-red-700 hover:bg-red-600 disabled:opacity-40 rounded-2xl font-black text-white text-base transition-all active:scale-95"
          >
            Entrar al panel
          </button>
        </form>

        <button onClick={onVolver} className="w-full text-center text-xs text-gray-600 hover:text-gray-400 transition-all py-2">
          ← Volver
        </button>

        <p className="text-xs text-gray-700 text-center">🛡️ Acceso restringido · Solo administración</p>
      </div>
    </div>
  )
}
