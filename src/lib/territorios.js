// Configuración de Territorios — fuente única de verdad

export const TERRITORIO_1 = {
  numero: 1,
  etiqueta: 'Territorio 1',
  emoji: '🟣',
  badge: 'bg-purple-700/40 border border-purple-500/60 text-purple-200',
  heroGradient: 'from-yellow-900/60 to-brand-dark',
  heroBorder: 'border-yellow-500/20',
  heroAccent: 'text-yellow-400',
  jefes: {
    'Victor Lazo':     ['Sara Salazar', 'Diana Paz', 'Candy Odar'],
    'Karem Romero':    ['Estefanny Martinez', 'Lady Zelada', 'Michelle Gomez', 'Zurhama Pisconte'],
    'Jesus Ynocencio': ['Alina Untama', 'Crisly Cotrina', 'Roxana Vicente', 'Renzo Asensios'],
    'Tirza Vargasa':   ['Wendy Aguayo', 'Carlos Gallegos', 'Katia Dueñas'],
    'Ricardo Polo':    ['Luis Bustamante', 'Gonzalo Lopez', 'Carla Huerta', 'Milagros Urbano'],
  },
}

export const TERRITORIO_2 = {
  numero: 2,
  etiqueta: 'Territorio 2',
  emoji: '🩵',
  badge: 'bg-teal-700/40 border border-teal-400/60 text-teal-200',
  heroGradient: 'from-teal-900/60 to-brand-dark',
  heroBorder: 'border-teal-500/20',
  heroAccent: 'text-teal-400',
  jefes: {
    'Bryan Reyes':       ['Christian Lopez', 'Paulo Sanchez'],
    'Claudio Tello':     ['Leydi Esteban', 'Rogger Garcia', 'Sonali Apaza', 'Wendy Olmedo'],
    'Fredy Alarcon':     ['Fredy Alarcon', 'Josselin Diaz', 'Marianella Saldaña', 'Wendy De La Cruz'],
    'Zulema Valladares': ['Clarita Guerrero', 'Marilyn Zapata'],
  },
}

// Mapa combinado jefe → lista de supervisores (para JefeDashboard)
export const SUPERVISORES_POR_JEFE = {
  ...TERRITORIO_1.jefes,
  ...TERRITORIO_2.jefes,
}

// Devuelve el objeto de territorio (TERRITORIO_1 o TERRITORIO_2) dado el nombre del jefe
export function getTerritorioDeJefe(nombre) {
  if (nombre in TERRITORIO_1.jefes) return TERRITORIO_1
  if (nombre in TERRITORIO_2.jefes) return TERRITORIO_2
  return null
}

// Devuelve el objeto de territorio dado el nombre del supervisor
export function getTerritorioDeSupv(nombre) {
  for (const sups of Object.values(TERRITORIO_1.jefes)) {
    if (sups.includes(nombre)) return TERRITORIO_1
  }
  for (const sups of Object.values(TERRITORIO_2.jefes)) {
    if (sups.includes(nombre)) return TERRITORIO_2
  }
  return null
}
