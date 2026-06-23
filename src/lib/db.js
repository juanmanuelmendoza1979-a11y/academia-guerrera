// Operaciones con Firestore para Academia Guerrera
import {
  doc, getDoc, setDoc, updateDoc,
  collection, getDocs, query, orderBy, limit, where,
  serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from './firebase'

const COLLECTION = 'guerreras'

// ─── Crear perfil nuevo ─────────────────────────────────────────────────────
export async function crearGuerrera({ nombre, correo, avatar, pin, supervisor }) {
  const id = generarId(nombre, 'pro')
  const ref = doc(db, COLLECTION, id)

  // Verificar si ya existe
  const snap = await getDoc(ref)
  if (snap.exists()) {
    throw new Error('YA_EXISTE')
  }

  await setDoc(ref, {
    id,
    nombre,
    correo: correo || '',
    supervisor,
    avatar,
    pin: hashPin(pin),
    puntos: 0,
    racha: 0,
    ultimoAcceso: serverTimestamp(),
    creado: serverTimestamp(),
    insignias: [],
    nivel: 'Inicial',
    retosCompletados: 0,
  })

  return { id, nombre, correo: correo || '', supervisor, avatar, puntos: 0, racha: 0, insignias: [], nivel: 'Inicial' }
}

// ─── Login con PIN ───────────────────────────────────────────────────────────
export async function loginGuerrera({ nombre, pin }) {
  const id = generarId(nombre, 'pro')
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)

  if (!snap.exists()) throw new Error('NO_ENCONTRADA')

  const data = snap.data()
  if (data.pin !== hashPin(pin)) throw new Error('PIN_INCORRECTO')

  // Actualizar racha y último acceso
  const hoy = new Date().toDateString()
  const ultimo = data.ultimoAccesoFecha
  const nuevaRacha = ultimo === ayer() ? data.racha + 1 : ultimo === hoy ? data.racha : 1

  await updateDoc(ref, {
    ultimoAcceso: serverTimestamp(),
    ultimoAccesoFecha: hoy,
    racha: nuevaRacha,
    loginCount: increment(1),
  })

  return { ...data, id, racha: nuevaRacha }
}

// ─── Sumar puntos ────────────────────────────────────────────────────────────
export async function sumarPuntos(guerreraId, pts) {
  if (!guerreraId || !pts) return
  const ref = doc(db, COLLECTION, guerreraId)
  await updateDoc(ref, {
    puntos: increment(pts),
    retosCompletados: increment(1),
  })
}

// ─── Obtener ranking top 50 ──────────────────────────────────────────────────
export async function obtenerRanking() {
  const q = query(
    collection(db, COLLECTION),
    orderBy('puntos', 'desc'),
    limit(50)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d, i) => ({ ...d.data(), rank: i + 1 }))
}

// ─── Obtener perfil ──────────────────────────────────────────────────────────
export async function obtenerPerfil(guerreraId) {
  const snap = await getDoc(doc(db, COLLECTION, guerreraId))
  if (!snap.exists()) return null
  return snap.data()
}

// ─── Agregar insignia ────────────────────────────────────────────────────────
export async function agregarInsignia(guerreraId, insignia) {
  const ref = doc(db, COLLECTION, guerreraId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const actuales = snap.data().insignias || []
  if (!actuales.includes(insignia)) {
    await updateDoc(ref, { insignias: [...actuales, insignia] })
  }
}

// ─── Jefes Regionales ────────────────────────────────────────────────────────
const COLLECTION_JEFE = 'jefes'

export async function crearJefe({ nombre, correo, pin }) {
  const id = generarId(nombre, 'jefe')
  const ref = doc(db, COLLECTION_JEFE, id)
  const snap = await getDoc(ref)
  if (snap.exists()) throw new Error('YA_EXISTE')
  await setDoc(ref, {
    id, nombre, correo: correo || '', rol: 'jefe',
    pin: hashPin(pin),
    creado: serverTimestamp(),
    ultimoAcceso: serverTimestamp(),
  })
  return { id, nombre, correo: correo || '', rol: 'jefe' }
}

export async function loginJefe({ nombre, pin }) {
  const id = generarId(nombre, 'jefe')
  const ref = doc(db, COLLECTION_JEFE, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('NO_ENCONTRADO')
  const data = snap.data()
  if (data.pin !== hashPin(pin)) throw new Error('PIN_INCORRECTO')
  await updateDoc(ref, { ultimoAcceso: serverTimestamp() })
  return { ...data, id }
}

export async function obtenerDatosRegion(supervisoresDeJefe) {
  const [promoSnap, supSnaps] = await Promise.all([
    getDocs(query(collection(db, COLLECTION), where('supervisor', 'in', supervisoresDeJefe))),
    Promise.all(supervisoresDeJefe.map(n => getDoc(doc(db, COLLECTION_SUP, generarId(n, 'sup'))))),
  ])
  const promotoras = promoSnap.docs.map(d => d.data())
  const supervisores = supSnaps.map((snap, i) => ({
    nombre: supervisoresDeJefe[i],
    registrado: snap.exists(),
    ...(snap.exists() ? snap.data() : {}),
  }))
  return { promotoras, supervisores }
}

// ─── Supervisores ────────────────────────────────────────────────────────────
const COLLECTION_SUP = 'supervisores'

export async function crearSupervisor({ nombre, jefe, correo, pin }) {
  const id = generarId(nombre, 'sup')
  const ref = doc(db, COLLECTION_SUP, id)
  const snap = await getDoc(ref)
  if (snap.exists()) throw new Error('YA_EXISTE')
  await setDoc(ref, {
    id, nombre, jefe, correo: correo || '', rol: 'supervisor',
    pin: hashPin(pin),
    creado: serverTimestamp(),
    ultimoAcceso: serverTimestamp(),
  })
  return { id, nombre, jefe, correo: correo || '', rol: 'supervisor' }
}

export async function loginSupervisor({ nombre, pin }) {
  const id = generarId(nombre, 'sup')
  const ref = doc(db, COLLECTION_SUP, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('NO_ENCONTRADO')
  const data = snap.data()
  if (data.pin !== hashPin(pin)) throw new Error('PIN_INCORRECTO')
  await updateDoc(ref, { ultimoAcceso: serverTimestamp() })
  return { ...data, id }
}

export async function obtenerPromotorasDeSupervisor(nombreSupervisor) {
  const q = query(
    collection(db, COLLECTION),
    where('supervisor', '==', nombreSupervisor)
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data()).sort((a, b) => (b.puntos || 0) - (a.puntos || 0))
}

// ─── Recuperación de PIN por correo ──────────────────────────────────────────
export async function buscarGuerreraParaRecuperacion(nombre) {
  const id = generarId(nombre, 'pro')
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('NO_ENCONTRADA')
  return snap.data()
}

export async function guardarCodigoRecuperacion(guerreraId, codigo) {
  const ref = doc(db, COLLECTION, guerreraId)
  await updateDoc(ref, {
    codigoRecuperacion: codigo,
    codigoExpira: Date.now() + 10 * 60 * 1000, // 10 minutos
  })
}

export async function actualizarPin(guerreraId, nuevoPin) {
  const ref = doc(db, COLLECTION, guerreraId)
  await updateDoc(ref, {
    pin: hashPin(nuevoPin),
    codigoRecuperacion: null,
    codigoExpira: null,
  })
}

// ─── Recuperación PIN — Supervisor ───────────────────────────────────────────
export async function buscarSupervisorParaRecuperacion(nombre) {
  const id = generarId(nombre, 'sup')
  const snap = await getDoc(doc(db, COLLECTION_SUP, id))
  if (!snap.exists()) throw new Error('NO_ENCONTRADO')
  return snap.data()
}

export async function guardarCodigoRecuperacionSupervisor(supId, codigo) {
  await updateDoc(doc(db, COLLECTION_SUP, supId), {
    codigoRecuperacion: codigo,
    codigoExpira: Date.now() + 10 * 60 * 1000,
  })
}

export async function actualizarPinSupervisor(supId, nuevoPin) {
  await updateDoc(doc(db, COLLECTION_SUP, supId), {
    pin: hashPin(nuevoPin),
    codigoRecuperacion: null,
    codigoExpira: null,
  })
}

// ─── Recuperación PIN — Jefe Regional ────────────────────────────────────────
export async function buscarJefeParaRecuperacion(nombre) {
  const id = generarId(nombre, 'jefe')
  const snap = await getDoc(doc(db, COLLECTION_JEFE, id))
  if (!snap.exists()) throw new Error('NO_ENCONTRADO')
  return snap.data()
}

export async function guardarCodigoRecuperacionJefe(jefeId, codigo) {
  await updateDoc(doc(db, COLLECTION_JEFE, jefeId), {
    codigoRecuperacion: codigo,
    codigoExpira: Date.now() + 10 * 60 * 1000,
  })
}

export async function actualizarPinJefe(jefeId, nuevoPin) {
  await updateDoc(doc(db, COLLECTION_JEFE, jefeId), {
    pin: hashPin(nuevoPin),
    codigoRecuperacion: null,
    codigoExpira: null,
  })
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generarId(nombre, pos) {
  return (nombre.trim().toLowerCase().replace(/\s+/g, '_') + '_' + pos.trim().toLowerCase().replace(/\s+/g, '_'))
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function hashPin(pin) {
  // Simple hash para el PIN (no usar en producción crítica, es para capacitación interna)
  let h = 0
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) - h) + pin.charCodeAt(i)
    h |= 0
  }
  return String(Math.abs(h))
}

function ayer() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toDateString()
}
