import { useState } from 'react'

/* ═══════════════════════════════════════════════════════════
   CONFIGURACIÓN DEL MES — actualizar al inicio de cada mes
   ═══════════════════════════════════════════════════════════ */
const MES_ACTUAL = {
  mes: 'Julio',
  anio: 2026,
  emoji: '🏆',
  subtitulo: 'Copa Libertadores en Cuartos · Copa Sudamericana en Octavos · Liga 1 Apertura',
}

/* ═══════════════════════════════════════════════════════════
   PARTIDOS DE LA SEMANA — actualizar cada semana
   ═══════════════════════════════════════════════════════════ */
const PARTIDOS_SEMANA = {
  libertadores: [
    {
      id: 'cl1', fase: 'Cuartos de Final — Ida',
      local: { nombre: 'Flamengo', flag: '🇧🇷', escudo: '🔴⚫' },
      visita: { nombre: 'Boca Juniors', flag: '🇦🇷', escudo: '🔵🟡' },
      fecha: 'Mar 22 Jul', hora: '7:30 PM PE',
      estadio: 'Maracaná · Río de Janeiro',
      nivelInteres: 'altísimo',
      dato: 'El clásico del continente. Flamengo en casa vs el más ganador de Argentina. Partido de los que paran el país.',
    },
    {
      id: 'cl2', fase: 'Cuartos de Final — Ida',
      local: { nombre: 'River Plate', flag: '🇦🇷', escudo: '⚪🔴' },
      visita: { nombre: 'Palmeiras', flag: '🇧🇷', escudo: '🟢' },
      fecha: 'Mié 23 Jul', hora: '9:00 PM PE',
      estadio: 'Estadio Monumental · Buenos Aires',
      nivelInteres: 'alto',
      dato: 'Duelo de bicampeones. River y Palmeiras son los candidatos más fuertes al título 2026.',
    },
    {
      id: 'cl3', fase: 'Cuartos de Final — Ida',
      local: { nombre: 'Universitario', flag: '🇵🇪', escudo: '🔴⚪' },
      visita: { nombre: 'Atlético Mineiro', flag: '🇧🇷', escudo: '⚫⚪' },
      fecha: 'Jue 24 Jul', hora: '6:00 PM PE',
      estadio: 'Estadio Monumental · Lima',
      nivelInteres: 'máximo — ¡local peruano!',
      dato: '¡Universitario de Lima en cuartos! La U juega en casa. Momento histórico para el fútbol peruano.',
    },
    {
      id: 'cl4', fase: 'Cuartos de Final — Ida',
      local: { nombre: 'Colo-Colo', flag: '🇨🇱', escudo: '⚪' },
      visita: { nombre: 'Peñarol', flag: '🇺🇾', escudo: '⚫🟡' },
      fecha: 'Jue 24 Jul', hora: '8:00 PM PE',
      estadio: 'Estadio Monumental · Santiago',
      nivelInteres: 'alto',
      dato: 'Dos clubes históricos con muchos títulos sudamericanos. Siempre generan expectativa.',
    },
  ],
  sudamericana: [
    {
      id: 'cs1', fase: 'Octavos de Final — Vuelta',
      local: { nombre: 'LDU Quito', flag: '🇪🇨', escudo: '⚪🔵' },
      visita: { nombre: 'Independiente', flag: '🇦🇷', escudo: '🔴' },
      fecha: 'Mar 22 Jul', hora: '6:30 PM PE',
      estadio: 'Casa Blanca · Quito',
      nivelInteres: 'alto',
      dato: 'LDU ganó la Copa Sudamericana 2009. Independiente es "El Rey de Copas". Duelo de instituciones.',
    },
    {
      id: 'cs2', fase: 'Octavos de Final — Vuelta',
      local: { nombre: 'Sporting Cristal', flag: '🇵🇪', escudo: '🔵' },
      visita: { nombre: 'Nacional', flag: '🇺🇾', escudo: '⚫⚪' },
      fecha: 'Mié 23 Jul', hora: '6:00 PM PE',
      estadio: 'Estadio Nacional · Lima',
      nivelInteres: 'máximo — ¡local peruano!',
      dato: '¡Sporting Cristal en Octavos! Partido en Lima. Los rimenses buscan avanzar a cuartos.',
    },
    {
      id: 'cs3', fase: 'Octavos de Final — Vuelta',
      local: { nombre: 'Defensa y Justicia', flag: '🇦🇷', escudo: '🟡🟢' },
      visita: { nombre: 'Fortaleza', flag: '🇧🇷', escudo: '🔵🔴' },
      fecha: 'Jue 24 Jul', hora: '7:00 PM PE',
      estadio: 'Estadio Norberto Tito Tomaghello · Buenos Aires',
      nivelInteres: 'medio',
      dato: 'Defensa y Justicia es actual campeón de la Sudamericana. Fortaleza llegó con ventaja de la ida.',
    },
  ],
  liga1: [
    {
      id: 'lg1', fase: 'Apertura — Jornada 17',
      local: { nombre: 'Universitario', flag: '🇵🇪', escudo: '🔴⚪' },
      visita: { nombre: 'Sporting Cristal', flag: '🇵🇪', escudo: '🔵' },
      fecha: 'Sáb 26 Jul', hora: '3:00 PM PE',
      estadio: 'Estadio Monumental · Lima',
      nivelInteres: 'clásico del fútbol peruano',
      dato: 'El Clásico del fútbol peruano. La U vs Cristal. Siempre una fiesta en el Monumental.',
    },
    {
      id: 'lg2', fase: 'Apertura — Jornada 17',
      local: { nombre: 'Alianza Lima', flag: '🇵🇪', escudo: '⚫⚪' },
      visita: { nombre: 'FBC Melgar', flag: '🇵🇪', escudo: '🔴⚫' },
      fecha: 'Dom 27 Jul', hora: '7:00 PM PE',
      estadio: 'Estadio Alejandro Villanueva · La Victoria',
      nivelInteres: 'alto',
      dato: 'Alianza en casa busca mantener el liderato. Melgar viene de Arequipa con todo.',
    },
    {
      id: 'lg3', fase: 'Apertura — Jornada 17',
      local: { nombre: 'Cienciano', flag: '🇵🇪', escudo: '🔴🟡' },
      visita: { nombre: 'César Vallejo', flag: '🇵🇪', escudo: '🟡⚫' },
      fecha: 'Sáb 26 Jul', hora: '5:00 PM PE',
      estadio: 'Estadio Inca Garcilaso · Cusco',
      nivelInteres: 'medio',
      dato: 'El equipo del Cusco en casa. Siempre especial jugar en altura para los visitantes.',
    },
  ],
}

/* ═══════════════════════════════════════════════════════════
   DATOS CALIENTES — cards de duelo con speech para el cliente
   ═══════════════════════════════════════════════════════════ */
const DATOS_CALIENTES = [
  {
    id: 'dc1',
    competencia: 'Copa Libertadores',
    compBadge: '🏆 Copa Lib',
    compColor: 'bg-yellow-700',
    local: { nombre: 'Flamengo', bandera: '🔴⚫', pais: '🇧🇷' },
    visita: { nombre: 'Boca Juniors', bandera: '🔵🟡', pais: '🇦🇷' },
    fase: 'Cuartos — Ida · Mar 22 Jul · 7:30 PM',
    datoCaliente: 'Flamengo lleva 12 años sin perder en el Maracaná en Copa Libertadores. Boca es el más ganador de Argentina con 6 títulos. El partido más esperado del continente.',
    indicador: '🔥🔥 El partido del año',
    mercados: ['Ganador del partido', 'Ambos anotan', 'Más de 2.5 goles', 'Hándicap asiático'],
    speech: 'Señor/a, ¿ya vio que esta semana Flamengo enfrenta a Boca Juniors en Copa Libertadores? Es el partido más grande del continente. Flamengo en el Maracaná es fortísimo pero Boca siempre sorprende. En TE APUESTO tenemos este partido disponible. ¿Le muestro las opciones?',
  },
  {
    id: 'dc2',
    competencia: 'Copa Libertadores',
    compBadge: '🏆 Copa Lib',
    compColor: 'bg-yellow-700',
    local: { nombre: 'Universitario', bandera: '🔴⚪', pais: '🇵🇪' },
    visita: { nombre: 'Atlético Mineiro', bandera: '⚫⚪', pais: '🇧🇷' },
    fase: 'Cuartos — Ida · Jue 24 Jul · 6:00 PM',
    datoCaliente: 'Universitario de Lima juega en casa su primer Cuartos de Final desde 2023. El Monumental estará a reventar. Atlético Mineiro es favorito pero La U en casa es un mundo diferente.',
    indicador: '🇵🇪 ¡Equipo peruano en cuartos!',
    mercados: ['Universitario gana', 'Ambos anotan: Sí', 'Más de 1.5 goles', 'Resultado al descanso'],
    speech: '¡Señor/a, este jueves Universitario juega en Lima los cuartos de la Libertadores! Es un partido histórico para el Perú. El Monumental va a estar increíble. ¿Le armamos algo para apoyar a La U?',
  },
  {
    id: 'dc3',
    competencia: 'Copa Sudamericana',
    compBadge: '🥈 Copa Suda',
    compColor: 'bg-blue-700',
    local: { nombre: 'Sporting Cristal', bandera: '🔵', pais: '🇵🇪' },
    visita: { nombre: 'Nacional', bandera: '⚫⚪', pais: '🇺🇾' },
    fase: 'Octavos — Vuelta · Mié 23 Jul · 6:00 PM',
    datoCaliente: 'Cristal necesita un resultado positivo para avanzar a cuartos. En Lima de noche, ante su gente, los rimenses suelen responder. Nacional de Uruguay llega como favorito por la tabla global.',
    indicador: '🔵 Cristal busca el pase',
    mercados: ['Cristal gana', 'Más de 1.5 goles', 'Ambos anotan: Sí', 'Cristal clasifica (apuesta especial)'],
    speech: 'Señor/a, este miércoles Sporting Cristal juega en Lima la revancha de Sudamericana. Necesitan ganar para avanzar. Es un partido emocionante con el equipo peruano como protagonista. ¿Le revisamos las opciones?',
  },
  {
    id: 'dc4',
    competencia: 'Liga 1 Perú',
    compBadge: '🇵🇪 Liga 1',
    compColor: 'bg-red-700',
    local: { nombre: 'Universitario', bandera: '🔴⚪', pais: '🇵🇪' },
    visita: { nombre: 'Sporting Cristal', bandera: '🔵', pais: '🇵🇪' },
    fase: 'Apertura Jornada 17 · Sáb 26 Jul · 3:00 PM',
    datoCaliente: 'El Clásico del fútbol peruano. La U vs Cristal en el Monumental define posiciones en el Apertura. Los dos equipos más ganadores del Perú frente a frente. Alta tensión garantizada.',
    indicador: '⚽ Clásico peruano',
    mercados: ['Ganador del partido', 'Ambos anotan', 'Más de 1.5 goles', 'Doble oportunidad'],
    speech: 'Señor/a, este sábado es el Clásico peruano: Universitario vs Sporting Cristal en el Monumental. ¿Para quién va? En TE APUESTO tenemos todos los mercados del partido disponibles. ¿Le muestro las opciones para apoyar a su equipo?',
  },
  {
    id: 'dc5',
    competencia: 'Copa Libertadores',
    compBadge: '🏆 Copa Lib',
    compColor: 'bg-yellow-700',
    local: { nombre: 'River Plate', bandera: '⚪🔴', pais: '🇦🇷' },
    visita: { nombre: 'Palmeiras', bandera: '🟢', pais: '🇧🇷' },
    fase: 'Cuartos — Ida · Mié 23 Jul · 9:00 PM',
    datoCaliente: 'El encuentro de los dos favoritos al título. River Plate en el Monumental de Buenos Aires es casi invencible. Palmeiras ganó las últimas dos ediciones del torneo. Partido de alto voltaje técnico.',
    indicador: '⭐ Duelo de candidatos al título',
    mercados: ['Ganador del partido', 'Total de goles', 'Ambos anotan', 'Hándicap asiático'],
    speech: 'River Plate vs Palmeiras es el choque de los dos candidatos a la Copa Libertadores. River en casa, Palmeiras bicampeón. Señor/a, este es el partido que todos hablan. ¿Le revisamos las opciones en TE APUESTO?',
  },
]

/* ═══════════════════════════════════════════════════════════
   MERCADOS POR COMPETENCIA
   ═══════════════════════════════════════════════════════════ */
const MERCADOS = {
  libertadores: {
    titulo: 'Copa Libertadores',
    emoji: '🏆',
    intro: 'Los partidos de Copa Libertadores tienen mercados especiales por el alto nivel competitivo. Los clientes apasionados por el fútbol sudamericano suelen apostar más al detalle.',
    principales: [
      {
        mercado: 'Ganador del partido (1X2)',
        descripcion: 'El más simple: ¿quién gana? En cuartos hay equipos muy parejos, la cuota del favorito suele estar entre 1.60 y 2.20.',
        cuando: 'Cuando el cliente dice "yo creo que gana X".',
        speech: '"Para el ganador del partido tenemos estas cuotas. ¿Le parece bien apostar al resultado directo?"',
        nivel: 'básico',
      },
      {
        mercado: 'Ambos Anotan (GG)',
        descripcion: 'En Cuartos de Copa Lib ambos equipos suelen marcar — el 68% de los partidos de cuartos desde 2020 terminaron con ambos en el marcador.',
        cuando: 'Cuando el partido tiene dos equipos atacantes.',
        speech: '"En este partido ambos equipos atacan fuerte. El "ambos anotan sí" tiene buena cuota y es probable. ¿Le parece?"',
        nivel: 'intermedio',
      },
      {
        mercado: 'Hándicap Asiático',
        descripcion: 'Cuando hay un favorito claro, el hándicap equilibra el partido. Ej: River -0.5 = River tiene que ganar para que pagues.',
        cuando: 'Cuando el cliente quiere mejor cuota del favorito.',
        speech: '"Si quiere mejor cuota de River, podemos jugar el hándicap asiático. Es como darle ventaja al contrario pero mejora lo que ganas."',
        nivel: 'avanzado',
      },
      {
        mercado: 'Clasificado (Apuesta especial)',
        descripcion: 'Apostar a qué equipo avanza a la siguiente ronda, considerando los dos partidos (ida y vuelta).',
        cuando: 'Cuando ya se jugó la ida y hay un resultado que analizar.',
        speech: '"Ya jugaron la ida. ¿Quiere apostar a quién clasifica viendo el resultado de hoy? Es la apuesta del contexto."',
        nivel: 'avanzado',
      },
      {
        mercado: 'Total de goles',
        descripcion: 'Más o menos de X goles en el partido. En cuartos de Lib el promedio es 2.4 goles por partido.',
        cuando: 'Cuando el partido es entre equipos defensivos o muy atacantes.',
        speech: '"Este partido suele ser cerrado. El "menos de 2.5 goles" tiene buena cuota. ¿Le interesa esa opción?"',
        nivel: 'intermedio',
      },
    ],
    tip: 'En partidos de Copa Libertadores el BetBuilder (construir tu propia apuesta) es muy popular. Combina: equipo gana + ambos anotan + más de 1 gol en el primer tiempo para una cuota más jugosa.',
  },
  sudamericana: {
    titulo: 'Copa Sudamericana',
    emoji: '🥈',
    intro: 'La Sudamericana tiene mercados similares a la Libertadores pero los partidos suelen ser más equilibrados al ser clubes del nivel "B" regional. Eso significa mejores cuotas en los favoritos.',
    principales: [
      {
        mercado: 'Doble Oportunidad',
        descripcion: 'Cubres dos de tres resultados. Ej: "Cristal o empate" — pagas si Cristal gana O si empatan. Más seguro, menos cuota.',
        cuando: 'Cuando el cliente quiere apostar al equipo local pero no está tan seguro.',
        speech: '"Si quiere ir con Cristal pero con más seguridad, la doble oportunidad cubre empate también. Menos cuota pero más tranquilidad."',
        nivel: 'básico',
      },
      {
        mercado: 'Ganador del partido',
        descripcion: 'En la Sudamericana las sorpresas son frecuentes. La cuota del favorito suele estar entre 1.50 y 2.50 — más valor que en Libertadores.',
        cuando: 'Siempre es un buen inicio de conversación.',
        speech: '"¿Con quién va en este partido? El ganador es la apuesta más directa. ¿Le muestro la cuota?"',
        nivel: 'básico',
      },
      {
        mercado: 'Gol en el primer tiempo',
        descripcion: 'Apostar a que hay gol antes del descanso. En partidos de vuelta con necesidad de remontar, los equipos salen a atacar desde el inicio.',
        cuando: 'En partidos de vuelta donde un equipo necesita remontar.',
        speech: '"Como Cristal necesita ganar, van a atacar desde el primer minuto. "Gol antes del descanso" tiene buena cuota en este contexto."',
        nivel: 'intermedio',
      },
      {
        mercado: 'Resultado al descanso / Final',
        descripcion: 'Combinación del resultado al descanso y al final. Alta cuota, más difícil de acertar.',
        cuando: 'Para clientes que quieren cuotas altas y conocen bien el partido.',
        speech: '"Si quiere algo con más cuota, podemos combinar resultado del primer tiempo con el resultado final. Más riesgo, más ganancia."',
        nivel: 'avanzado',
      },
    ],
    tip: 'Con equipos peruanos (Cristal, Melgar), el speech de "apoya a tu equipo" funciona muy bien. El cliente hincha peruano apuesta por emoción, no solo por análisis.',
  },
  liga1: {
    titulo: 'Liga 1 Perú',
    emoji: '🇵🇪',
    intro: 'La Liga 1 es el torneo donde las promotoras tienen ventaja: conocen los equipos, los clientes son hinchas locales y el argumento del patrocinador ("somos la Liga 1 TE APUESTO") cierra muchas conversaciones.',
    principales: [
      {
        mercado: 'Ganador del partido',
        descripcion: 'El clásico. En Liga 1, los clientes van con su equipo del corazón. La conversación empieza sola cuando mencionas el equipo favorito del cliente.',
        cuando: 'Siempre — es la puerta de entrada.',
        speech: '"¿Usted es de la U? / ¿Es aliancista? — Este fin de semana juegan. ¿Le revisamos qué tiene TE APUESTO para ese partido?"',
        nivel: 'básico',
      },
      {
        mercado: 'Ambos Anotan (GG)',
        descripcion: 'En clásicos peruanos (La U vs Cristal, Alianza vs Cristal) ambos equipos suelen marcar. Datos: el 60% de los clásicos Liga 1 de 2024-2025 terminaron con ambos en gol.',
        cuando: 'En partidos entre equipos grandes: Universitario, Alianza, Cristal.',
        speech: '"En el clásico ambos equipos atacan. El "ambos anotan sí" tiene una cuota interesante y pasa seguido en los clásicos. ¿Le parece?"',
        nivel: 'básico',
      },
      {
        mercado: 'Hándicap en el Marcador (goles de ventaja)',
        descripcion: 'Cuando hay un favorito claro en Liga 1 (ej: Universitario vs un equipo de la parte baja de la tabla), el hándicap mejora la cuota.',
        cuando: 'Partidos donde hay diferencia de nivel grande entre los equipos.',
        speech: '"La U es favorita pero la cuota directa es muy baja. Con el hándicap podemos mejorar eso. ¿Le explico cómo funciona?"',
        nivel: 'intermedio',
      },
      {
        mercado: 'Total de tarjetas',
        descripcion: 'Apostar a cuántas tarjetas hay en el partido. En clásicos peruanos el arbitraje suele ser caliente — más de 4 tarjetas es común.',
        cuando: 'En clásicos y partidos de alta rivalidad.',
        speech: '"Los clásicos peruanos son intensos. El mercado de tarjetas es interesante: más de 4 en el partido suele darse. ¿Le parece curioso ese mercado?"',
        nivel: 'avanzado',
      },
      {
        mercado: 'BetBuilder — Construye tu apuesta',
        descripcion: 'Combina: La U gana + ambos anotan + más de 2 goles = cuota más alta. El cliente elige los eventos que combina.',
        cuando: 'Con clientes que conocen fútbol y quieren cuotas más altas.',
        speech: '"Señor/a, ¿conoce el BetBuilder? Usted arma su propia apuesta. Por ejemplo: La U gana + Cristal también anota + más de 2 goles en total. La cuota sube bastante. ¿Lo armamos juntos?"',
        nivel: 'avanzado',
      },
    ],
    tip: 'En Liga 1, menciona siempre que TE APUESTO es el patrocinador oficial. "El partido que va a ver en TV dice Liga 1 TE APUESTO — somos parte del fútbol peruano." Eso genera confianza automática.',
  },
}

/* ═══════════════════════════════════════════════════════════
   PERFILES DE CLIENTE
   ═══════════════════════════════════════════════════════════ */
const PERFILES_CLIENTE = [
  {
    id: 'p1',
    tipo: 'El Hincha Peruano',
    emoji: '🇵🇪',
    descripcion: 'Sigue la Liga 1 con pasión. Tiene equipo favorito — La U, Alianza, Cristal o Melgar. Apuesta más por emoción que por análisis.',
    comoIdentificarlo: 'Usa la camiseta de su equipo, habla del partido del fin de semana, menciona la Liga 1.',
    comoAcercarte: [
      'Pregunta: "¿Usted es hincha de...?" — deja que te diga su equipo.',
      'Muéstrale el partido de su equipo esa semana.',
      'Usa el argumento del patrocinador: "TE APUESTO es la Liga 1 — somos del fútbol peruano."',
      'Empieza por el ganador del partido, luego ofrece ambos anotan.',
    ],
    advertencia: 'El hincha a veces apuesta solo con el corazón. Recuérdale que juegue con responsabilidad.',
    mercadosIdeal: ['Ganador del partido', 'Ambos anotan', 'Doble oportunidad'],
    speech: '"¿Usted es de [equipo]? ¡Juegan este [día]! En TE APUESTO tenemos el partido disponible. ¿Le armo algo para apoyar a su equipo?"',
  },
  {
    id: 'p2',
    tipo: 'El Seguidor Regional',
    emoji: '🌎',
    descripcion: 'Le apasiona Copa Libertadores o Sudamericana. Sigue a Flamengo, River, Boca, Palmeiras. Conoce bien el torneo y tiene más criterio para analizar.',
    comoIdentificarlo: 'Habla de equipos brasileños o argentinos, menciona la Libertadores, lleva el marcador de los cuartos.',
    comoAcercarte: [
      'Pregunta: "¿Vio el partido de Flamengo/River?" — deja que opine.',
      'Usa el dato caliente del partido para generar conversación.',
      'Ofrece mercados más elaborados: hándicap, ambos anotan, BetBuilder.',
      'Menciona el partido de Universitario o Cristal — "tenemos equipo peruano en cuartos".',
    ],
    advertencia: 'Este cliente analiza. Si le dices algo incorrecto sobre el partido, pierde confianza. Aprende los datos clave.',
    mercadosIdeal: ['Ambos anotan', 'Hándicap asiático', 'BetBuilder', 'Clasificado'],
    speech: '"Señor/a, ¿ya vio el fixture de Cuartos? Esta semana hay Flamengo vs Boca. ¡El partido del año! ¿Le muestro lo que tenemos en TE APUESTO para ese partido?"',
  },
  {
    id: 'p3',
    tipo: 'El Casual / Curioso',
    emoji: '👀',
    descripcion: 'No es hincha declarado de ningún equipo pero le llama la atención cuando hay un partido grande. Entra al POS por otro motivo y puede convertirse en cliente.',
    comoIdentificarlo: 'Mira el TV del local donde transmiten el partido, pregunta "¿de qué va ese partido?", está en grupo con otros que hablan de fútbol.',
    comoAcercarte: [
      'Di el nombre del partido y algo llamativo: "Es el Clásico del Perú / Es Boca vs Flamengo."',
      'Usa el dato caliente como gancho: "¿Sabía que Flamengo lleva 12 años sin perder en el Maracaná?"',
      'Ofrece lo más simple: ganador del partido.',
      'Si muestra interés, menciona el BetBuilder: "Puede armar su propia combinación."',
    ],
    advertencia: 'No lo abrumes con muchas opciones. Comienza simple, si se engancha avanza a más.',
    mercadosIdeal: ['Ganador del partido', 'Ambos anotan', 'Total de goles'],
    speech: '"¿Vio que esta semana hay Copa Libertadores? Boca vs Flamengo — el partido más grande del año. En TE APUESTO puede apostarlo. Empieza simple: ¿quién cree que gana?"',
  },
  {
    id: 'p4',
    tipo: 'El Fan Europeo',
    emoji: '🌍',
    descripcion: 'Le gustan las ligas europeas: Premier, La Liga, Champions. En julio está en modo espera porque las ligas europeas están de vacaciones o pretemporada.',
    comoIdentificarlo: 'Habla de Real Madrid, Barcelona, Liverpool, Manchester City. Pregunta cuándo empieza la Premier o La Liga.',
    comoAcercarte: [
      'Informa que las ligas europeas regresan en agosto — genera expectativa.',
      'Redirígelo a Copa Libertadores: "Mientras tanto está la Copa del continente, que es igual de emocionante."',
      'Menciona el partido Boca vs Flamengo o River vs Palmeiras como equivalente a Champions.',
      'En agosto, cuando regresen las ligas, este cliente será tu mejor oportunidad.',
    ],
    advertencia: 'No inventes que ya hay partidos de Premier o La Liga. Confírmate primero. Si no hay, díselo y convierte al cliente para la Copa Lib.',
    mercadosIdeal: ['Copa Libertadores cuartos', 'Liga MX (también activa en julio)'],
    speech: '"La Premier empieza en agosto pero mientras tanto hay Copa Libertadores, que es la Champions de Sudamérica. Esta semana hay Boca vs Flamengo — ¡es gigante! ¿Le cuento?"',
  },
  {
    id: 'p5',
    tipo: 'El Escéptico',
    emoji: '🤨',
    descripcion: 'Dice "no sé nada de apuestas" o "eso no es para mí". En el fondo le gusta el fútbol pero no conoce el producto.',
    comoIdentificarlo: 'Responde con dudas, pone excusas, dice "no tengo plata para eso", cruza los brazos.',
    comoAcercarte: [
      'No insistas con apuestas: habla de fútbol primero.',
      'Genera conversación sobre el partido del fin de semana.',
      'Cuando esté relajado: "¿Sabía que puede apostar desde S/5? No necesita mucho."',
      'Usa el argumento del patrocinador: "Somos la Liga 1 TE APUESTO — somos parte del fútbol peruano desde hace años."',
      'Si sigue resistente, no presiones — deja la puerta abierta.',
    ],
    advertencia: 'Nunca garantices que va a ganar. Con este perfil más que nunca: "Es entretenimiento, como ir al estadio."',
    mercadosIdeal: ['Ganador del partido (lo más simple)', 'Doble oportunidad'],
    speech: '"Señor/a, no tiene que apostar si no quiere. Pero ¿sabía que puede participar desde S/5 en el partido de [equipo local]? No tiene que saber mucho — solo elegir quién gana. ¿Le cuento cómo funciona?"',
  },
]

/* ═══════════════════════════════════════════════════════════
   COPA LIBERTADORES — config detallada
   ═══════════════════════════════════════════════════════════ */
const COPA_LIB = {
  nombre: 'CONMEBOL Copa Libertadores 2026',
  emoji: '🏆',
  color: 'from-yellow-900/60 to-amber-900/40',
  border: 'border-yellow-500/40',
  accentText: 'text-yellow-400',
  accentBg: 'bg-yellow-900/30 border-yellow-500/30',
  fase: 'Cuartos de Final',
  faseBadge: 'bg-yellow-600 text-white',
  descripcion: 'El torneo más importante del fútbol sudamericano. 32 clubes compiten desde enero. En julio llegan los Cuartos de Final — los 8 mejores equipos del continente definen quiénes van a semis.',
  formato: [
    { fase: 'Fase de Grupos', detalle: 'Enero – Abril · 32 equipos en 8 grupos', done: true },
    { fase: 'Octavos de Final', detalle: 'Mayo – Junio · 16 equipos · Ida y vuelta', done: true },
    { fase: 'Cuartos de Final', detalle: 'Julio – Agosto · 8 equipos · Ida y vuelta', done: false, actual: true },
    { fase: 'Semifinales', detalle: 'Septiembre – Octubre · 4 equipos', done: false },
    { fase: 'Final', detalle: 'Noviembre · 1 partido · Sede neutral', done: false },
  ],
  equiposPeruanos: [
    { nombre: 'Universitario de Deportes', escudo: '🔴⚪', dato: 'Finalistas en 2023. En cuartos esta semana en el Monumental.' },
    { nombre: 'Alianza Lima', escudo: '⚫⚪', dato: 'Clasificaron desde fase de grupos. A la espera del choque de cuartos.' },
  ],
  datosRapidos: [
    { icono: '🥇', titulo: 'Más títulos', valor: 'Independiente — 7 títulos' },
    { icono: '🇦🇷', titulo: 'País dominante', valor: 'Argentina — 25 títulos totales' },
    { icono: '🏟️', titulo: 'Final 2026', valor: 'Sede por confirmar — Nov 2026' },
    { icono: '🌎', titulo: 'Confederación', valor: 'CONMEBOL — 10 países' },
  ],
  speechCliente: '¿Sabes que la Copa Libertadores ya está en Cuartos de Final? Los mejores 8 equipos de Sudamérica se enfrentan ahora. Es el torneo más importante de la región. En TE APUESTO puedes seguir tu equipo favorito. ¿Le echamos un vistazo a las opciones disponibles?',
  datoConversacion: 'La Copa Libertadores tiene más historia que la Champions de Europa: se juega desde 1960. Y con equipos de 10 países, es el torneo más competitivo del continente.',
}

/* ═══════════════════════════════════════════════════════════
   COPA SUDAMERICANA — config detallada
   ═══════════════════════════════════════════════════════════ */
const COPA_SUDA = {
  nombre: 'CONMEBOL Copa Sudamericana 2026',
  emoji: '🥈',
  color: 'from-blue-900/60 to-indigo-900/40',
  border: 'border-blue-500/40',
  accentText: 'text-blue-400',
  accentBg: 'bg-blue-900/30 border-blue-500/30',
  fase: 'Octavos de Final',
  faseBadge: 'bg-blue-600 text-white',
  descripcion: 'El segundo torneo internacional más importante de CONMEBOL. Participan clubes que no clasificaron a Libertadores más los terceros de grupo de la Copa Libertadores. En julio se juegan los Octavos de Final.',
  formato: [
    { fase: 'Fase de Grupos', detalle: 'Febrero – Junio · 32 equipos en 8 grupos', done: true },
    { fase: 'Octavos de Final', detalle: 'Julio · 16 equipos · Ida y vuelta', done: false, actual: true },
    { fase: 'Cuartos de Final', detalle: 'Agosto · 8 equipos', done: false },
    { fase: 'Semifinales', detalle: 'Septiembre – Octubre', done: false },
    { fase: 'Final', detalle: 'Noviembre · Sede neutral', done: false },
  ],
  equiposPeruanos: [
    { nombre: 'Sporting Cristal', escudo: '🔵', dato: 'Juegan esta semana la vuelta en Lima. Necesitan resultado positivo para avanzar.' },
    { nombre: 'FBC Melgar', escudo: '🔴⚫', dato: 'El equipo de Arequipa también está en la Sudamericana esta edición.' },
  ],
  datosRapidos: [
    { icono: '📅', titulo: 'Creación', valor: '2002 — torneo relativamente joven' },
    { icono: '🥇', titulo: 'Más títulos', valor: 'Defensa y Justicia (campeón actual)' },
    { icono: '🏟️', titulo: 'Final 2026', valor: 'Sede por confirmar — Nov 2026' },
    { icono: '📋', titulo: 'Clasificación', valor: 'Equipos sin Copa Lib + 3.° de grupos Lib' },
  ],
  speechCliente: 'Esta semana Sporting Cristal juega en Lima la revancha de Sudamericana. Es el segundo torneo más importante del continente. Cristal necesita ganar para avanzar. En TE APUESTO tenemos el partido disponible. ¿Le muestro las opciones?',
  datoConversacion: 'Muchos clubes importantes ganan la Copa Sudamericana primero y después llegan a la Libertadores. Es el trampolín del fútbol sudamericano.',
}

/* ═══════════════════════════════════════════════════════════
   LIGA 1 PERU — config
   ═══════════════════════════════════════════════════════════ */
const LIGA1 = {
  nombre: 'Liga 1 Te Apuesto — Apertura 2026',
  emoji: '🇵🇪',
  color: 'from-red-900/60 to-rose-900/40',
  border: 'border-red-500/40',
  accentText: 'text-red-400',
  accentBg: 'bg-red-900/30 border-red-500/30',
  fase: 'Apertura — Jornada 17',
  faseBadge: 'bg-red-600 text-white',
  descripcion: 'El campeonato peruano de fútbol profesional patrocinado por TE APUESTO. Se divide en Torneo Apertura y Clausura. En julio estamos en la jornada 17 del Apertura — recta final con posiciones en juego.',
  formato: [
    { fase: 'Torneo Apertura', detalle: 'Febrero – Julio · 18 equipos · Todos contra todos', done: false, actual: true },
    { fase: 'Torneo Clausura', detalle: 'Agosto – Diciembre · Misma estructura', done: false },
    { fase: 'Play-Off Final', detalle: 'Diciembre · Campeón Apertura vs Campeón Clausura', done: false },
    { fase: 'Descenso', detalle: 'Tabla acumulada anual · 2 equipos descienden', done: false },
  ],
  equiposDestacados: [
    { nombre: 'Universitario', ciudad: 'Lima', escudo: '🔴⚪', hinchada: 'Los Cremas' },
    { nombre: 'Alianza Lima', ciudad: 'Lima', escudo: '⚫⚪', hinchada: 'La Victoria' },
    { nombre: 'Sporting Cristal', ciudad: 'Lima', escudo: '🔵', hinchada: 'Los Rimenses' },
    { nombre: 'FBC Melgar', ciudad: 'Arequipa', escudo: '🔴⚫', hinchada: 'El Dominó' },
    { nombre: 'Cienciano', ciudad: 'Cusco', escudo: '🔴🟡', hinchada: 'La Gloria Imperial' },
    { nombre: 'Alianza Atlético', ciudad: 'Sullana', escudo: '🟡⚫', hinchada: 'Los Vendaval' },
  ],
  datosRapidos: [
    { icono: '📅', titulo: 'Jornadas Apertura', valor: '17 jornadas — recta final' },
    { icono: '⚽', titulo: 'Equipos', valor: '18 equipos en Primera División' },
    { icono: '🏟️', titulo: 'Estadio principal', valor: 'Estadio Nacional · Lima' },
    { icono: '📺', titulo: 'Transmisión', valor: 'L1 MAX y señal abierta' },
  ],
  speechCliente: 'Señor/a, ¿sabe que TE APUESTO es el patrocinador oficial de la Liga 1? Este fin de semana es el Clásico peruano: Universitario vs Cristal en el Monumental. Tenemos todos los mercados disponibles. ¿Para quién va?',
  datoConversacion: 'TE APUESTO es el nombre oficial del campeonato peruano — "Liga 1 Te Apuesto". ¡Somos parte del fútbol peruano! Eso es un argumento de peso con cualquier cliente hincha.',
}

/* ═══════════════════════════════════════════════════════════
   OTRAS LIGAS
   ═══════════════════════════════════════════════════════════ */
const OTRAS_LIGAS = [
  {
    nombre: 'Liga MX — Apertura 2026',
    pais: '🇲🇽 México',
    emoji: '🦅',
    fase: 'Inicio del Apertura',
    detalle: 'El torneo mexicano inicia su Apertura en julio. Equipos como América, Chivas, Cruz Azul y Tigres abren la temporada.',
    dato: 'La Liga MX tiene una de las mayores audiencias de fútbol en América Latina. Muy popular para apuestas.',
  },
  {
    nombre: 'MLS — Major League Soccer',
    pais: '🇺🇸 Estados Unidos y Canadá',
    emoji: '⚽',
    fase: 'Temporada regular — mitad de año',
    detalle: 'La liga norteamericana juega de febrero a octubre. Julio es la mitad de temporada, con las posiciones de playoffs tomando forma.',
    dato: 'Jugadores de alto nivel juegan en MLS. Inter Miami, LA Galaxy y NYCFC son los equipos más seguidos.',
  },
  {
    nombre: 'Ligas Europeas — Pretemporada',
    pais: '🌍 Europa',
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    fase: 'Vacaciones o pretemporada',
    detalle: 'Premier League, La Liga, Serie A y Bundesliga están en pretemporada en julio. La acción regresa en agosto.',
    dato: 'Comunícale al cliente: las ligas europeas regresan en agosto. En agosto tenemos toda la Premier, La Liga, Serie A y Bundesliga.',
  },
]

/* ═══════════════════════════════════════════════════════════
   TRIVIA
   ═══════════════════════════════════════════════════════════ */
const TRIVIA_PREGUNTAS = [
  {
    id: 'q1', puntos: 10,
    pregunta: '¿Cuántos títulos de Copa Libertadores tiene Independiente de Argentina?',
    opciones: ['5', '6', '7', '8'],
    correcta: 2,
    explicacion: 'Independiente tiene 7 títulos (1964-1984). Por eso se le llama "El Rey de Copas". Es el club más ganador de la Copa Libertadores.',
  },
  {
    id: 'q2', puntos: 10,
    pregunta: '¿Cómo se llama oficialmente el campeonato peruano de fútbol?',
    opciones: ['Liga Peruana de Fútbol', 'Liga 1 Te Apuesto', 'Primera División Perú', 'Campeonato Nacional'],
    correcta: 1,
    explicacion: '¡Correcto! El campeonato peruano se llama "Liga 1 Te Apuesto" porque TE APUESTO es el patrocinador titular. ¡Somos parte del fútbol peruano!',
  },
  {
    id: 'q3', puntos: 10,
    pregunta: '¿Cuántos países participan en la CONMEBOL?',
    opciones: ['8', '10', '12', '14'],
    correcta: 1,
    explicacion: 'CONMEBOL agrupa a 10 países: Argentina, Bolivia, Brasil, Chile, Colombia, Ecuador, Paraguay, Perú, Uruguay y Venezuela.',
  },
  {
    id: 'q4', puntos: 15,
    pregunta: '¿Qué equipo peruano llegó a la final de la Copa Libertadores en 2023?',
    opciones: ['Alianza Lima', 'Sporting Cristal', 'Universitario de Deportes', 'FBC Melgar'],
    correcta: 2,
    explicacion: 'Universitario llegó a la final de la Libertadores 2023. Perdieron ante Fluminense de Brasil, pero fue un hito histórico para el fútbol peruano.',
  },
  {
    id: 'q5', puntos: 10,
    pregunta: '¿Qué mercado de apuesta cubre dos posibles resultados de tres?',
    opciones: ['Ambos anotan', 'Hándicap asiático', 'Doble oportunidad', 'Total de goles'],
    correcta: 2,
    explicacion: 'La Doble Oportunidad cubre 2 de 3 resultados posibles. Ej: "Equipo A o empate" — si gana A o empatan, cobras. Menos cuota pero más seguridad.',
  },
  {
    id: 'q6', puntos: 15,
    pregunta: 'Si un cliente es hincha de Flamengo y llega al POS, ¿qué haces primero?',
    opciones: ['Mostrarle todos los mercados disponibles', 'Preguntarle si vio el partido de esta semana de Flamengo', 'Explicarle el BetBuilder', 'Decirle la cuota exacta del partido'],
    correcta: 1,
    explicacion: 'Primero generas conversación sobre su equipo favorito. El cliente hincha habla con emoción. Cuando ya está enganchado en la conversación, presentas las opciones de TE APUESTO.',
  },
]

/* ═══════════════════════════════════════════════════════════
   TABS
   ═══════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'inicio',    icon: '🏠', label: 'Inicio' },
  { id: 'calientes', icon: '🔥', label: 'Calientes' },
  { id: 'partidos',  icon: '📅', label: 'Partidos' },
  { id: 'mercados',  icon: '🛒', label: 'Mercados' },
  { id: 'clientes',  icon: '👥', label: 'Clientes' },
  { id: 'libertad',  icon: '🏆', label: 'Copa Lib' },
  { id: 'suda',      icon: '🥈', label: 'Copa Suda' },
  { id: 'liga1',     icon: '🇵🇪', label: 'Liga 1' },
  { id: 'otras',     icon: '🌐', label: 'Más Ligas' },
  { id: 'trivia',    icon: '🧠', label: 'Trivia' },
]

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function EventoDelMes({ onUpdatePoints }) {
  const [tab, setTab] = useState('inicio')

  return (
    <div className="pb-24 animate-fade-in overflow-x-hidden w-full">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-orange/30 via-brand-dark to-brand-black px-5 py-7 border-b border-brand-orange/20">
        <div className="max-w-4xl mx-auto">
          <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-1">
            📅 Evento del Mes
          </p>
          <h1 className="text-2xl font-black text-white leading-tight">
            {MES_ACTUAL.emoji} {MES_ACTUAL.mes} {MES_ACTUAL.anio}
          </h1>
          <p className="text-sm text-gray-400 mt-1 leading-relaxed">{MES_ACTUAL.subtitulo}</p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { color: 'bg-yellow-600', texto: '🏆 Copa Libertadores · Cuartos' },
              { color: 'bg-blue-600',   texto: '🥈 Copa Sudamericana · Octavos' },
              { color: 'bg-red-600',    texto: '🇵🇪 Liga 1 · Jornada 17' },
            ].map(b => (
              <span key={b.texto} className={`text-[10px] font-black text-white px-2.5 py-1 rounded-full ${b.color}`}>
                {b.texto}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs scrollables */}
      <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex overflow-x-auto no-scrollbar px-3 py-2 gap-1.5 max-w-4xl mx-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === t.id ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400 hover:text-white'
              }`}>
              <span>{t.icon}</span><span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 max-w-4xl mx-auto space-y-4">
        {tab === 'inicio'    && <TabInicio onTabChange={setTab} />}
        {tab === 'calientes' && <TabDatosCalientes />}
        {tab === 'partidos'  && <TabPartidos />}
        {tab === 'mercados'  && <TabMercados />}
        {tab === 'clientes'  && <TabClientes />}
        {tab === 'libertad'  && <TabCompetencia data={COPA_LIB} />}
        {tab === 'suda'      && <TabCompetencia data={COPA_SUDA} />}
        {tab === 'liga1'     && <TabLiga1 />}
        {tab === 'otras'     && <TabOtrasLigas />}
        {tab === 'trivia'    && <TabTrivia onPoints={onUpdatePoints} />}
        <NotaOficial />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: INICIO
   ═══════════════════════════════════════════════════════════ */
function TabInicio({ onTabChange }) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-brand-dark rounded-2xl p-4 border border-brand-orange/20">
        <p className="text-xs font-bold text-brand-orange mb-1">💡 Guerrera, ten en cuenta</p>
        <p className="text-sm text-gray-300 leading-relaxed">
          Este módulo se actualiza cada mes. Úsalo para conocer los torneos activos, los partidos de la semana,
          qué mercados ofrecer y cómo acercarte a cada tipo de cliente.
        </p>
      </div>

      {/* Acceso rápido */}
      <div>
        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">⚡ Lo más importante esta semana</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { tab:'calientes', emoji:'🔥', titulo:'Datos Calientes', sub:'Partidos clave + speech para el cliente', color:'from-orange-900/60 to-red-900/40', border:'border-orange-500/40' },
            { tab:'partidos',  emoji:'📅', titulo:'Partidos de la Semana', sub:'Copa Lib · Copa Suda · Liga 1', color:'from-blue-900/60 to-indigo-900/40', border:'border-blue-500/40' },
            { tab:'mercados',  emoji:'🛒', titulo:'Qué Mercados Ofrecer', sub:'Cuáles funcionan mejor por torneo', color:'from-green-900/60 to-teal-900/40', border:'border-green-500/40' },
            { tab:'clientes',  emoji:'👥', titulo:'Perfiles de Cliente', sub:'Cómo acercarte según el hincha', color:'from-purple-900/60 to-pink-900/40', border:'border-purple-500/40' },
          ].map(item => (
            <button key={item.tab} onClick={() => onTabChange(item.tab)}
              className={`rounded-2xl p-3 text-left bg-gradient-to-br ${item.color} border ${item.border} hover:scale-[1.02] active:scale-95 transition-all`}>
              <span className="text-3xl block mb-1">{item.emoji}</span>
              <p className="text-xs font-black text-white leading-tight">{item.titulo}</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{item.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Resumen rápido */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">📋 Resumen del mes</p>
        <div className="space-y-3">
          {[
            { emoji:'🏆', comp:'Copa Libertadores', estado:'Cuartos de Final', detalle:'Flamengo vs Boca · Universitario en Lima · River vs Palmeiras', color:'text-yellow-400' },
            { emoji:'🥈', comp:'Copa Sudamericana', estado:'Octavos de Final', detalle:'Cristal en Lima · LDU vs Independiente · Defensa vs Fortaleza', color:'text-blue-400' },
            { emoji:'🇵🇪', comp:'Liga 1 Perú', estado:'Jornada 17 · Apertura', detalle:'Clásico: La U vs Cristal · Alianza vs Melgar', color:'text-red-400' },
            { emoji:'🦅', comp:'Liga MX Apertura', estado:'Inicio de temporada', detalle:'América, Chivas, Cruz Azul abriendo el torneo mexicano', color:'text-green-400' },
          ].map(item => (
            <div key={item.comp} className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-white">{item.comp}</p>
                  <span className={`text-[10px] font-black ${item.color} bg-white/5 px-2 py-0.5 rounded-full shrink-0`}>{item.estado}</span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Speech del mes */}
      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-orange mb-2">💬 Speech para julio</p>
        <p className="text-sm text-gray-300 leading-relaxed italic">
          "Señor/a, julio es un mes lleno de fútbol. Copa Libertadores en Cuartos con equipos peruanos jugando en casa, Copa Sudamericana, y el Clásico peruano este fin de semana. En TE APUESTO tenemos todo disponible. ¿Le cuento sobre algún partido que le interese?"
        </p>
      </div>

      {/* Argumento estrella */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/20 border border-purple-500/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-purple-400 mb-2">⭐ Argumento estrella del mes</p>
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="text-white font-bold">TE APUESTO es el patrocinador oficial de la Liga 1 peruana.</span>{' '}
          Y esta semana, <span className="text-white font-bold">Universitario juega en Lima los Cuartos de Copa Libertadores.</span>{' '}
          Dos argumentos poderosos: estamos en el fútbol local Y en el torneo más grande del continente.
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: DATOS CALIENTES
   ═══════════════════════════════════════════════════════════ */
function TabDatosCalientes() {
  const [selected, setSelected] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  async function handleCopy(id, text) {
    try { await navigator.clipboard.writeText(text) } catch {}
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 rounded-2xl p-4">
        <p className="text-sm font-black text-white mb-0.5">🔥 Datos Calientes de la Semana</p>
        <p className="text-xs text-orange-200 leading-relaxed">
          El dato del partido + el speech para ofrecérselo al cliente. Aprende el dato clave, luego usa el speech.
        </p>
      </div>

      <div className="space-y-3">
        {DATOS_CALIENTES.map(m => {
          const isOpen = selected === m.id
          return (
            <div key={m.id} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
              <button onClick={() => setSelected(isOpen ? null : m.id)} className="w-full p-4 text-left">
                {/* Badge competencia */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${m.compColor}`}>
                    {m.compBadge}
                  </span>
                  <span className="text-[10px] text-gray-500 flex-1 truncate">{m.fase}</span>
                  <span className={`text-gray-400 text-xs transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>

                {/* Equipos */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-3xl">{m.local.bandera}</span>
                    <p className="text-xs font-black text-white text-center leading-tight">{m.local.nombre}</p>
                    <span className="text-xs">{m.local.pais}</span>
                  </div>
                  <div className="text-center px-2">
                    <p className="text-xs font-black text-gray-500">VS</p>
                  </div>
                  <div className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-3xl">{m.visita.bandera}</span>
                    <p className="text-xs font-black text-white text-center leading-tight">{m.visita.nombre}</p>
                    <span className="text-xs">{m.visita.pais}</span>
                  </div>
                </div>

                {/* Dato caliente */}
                <div className="bg-brand-medium/40 rounded-xl p-2.5">
                  <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider mb-0.5">{m.indicador}</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{m.datoCaliente}</p>
                </div>
              </button>

              {/* Expandido */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3">
                  {/* Mercados */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Mercados recomendados</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.mercados.map(mer => (
                        <span key={mer} className="text-xs bg-blue-900/30 border border-blue-500/20 text-blue-200 px-2.5 py-1 rounded-full font-medium">
                          {mer}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Speech */}
                  <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-brand-orange uppercase tracking-wider">💡 Ofrécelo así:</p>
                      <button onClick={() => handleCopy(m.id, m.speech)}
                        className="text-xs text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-1">
                        {copiedId === m.id ? '✅ Copiado' : '📋 Copiar'}
                      </button>
                    </div>
                    <p className="text-sm text-white font-bold italic leading-relaxed">"{m.speech}"</p>
                  </div>

                  <div className="bg-brand-medium/30 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      🔐 Recuerda: nunca garantices resultados. Orienta con información, no con predicciones.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tip de uso */}
      <div className="bg-brand-dark border border-brand-yellow/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-yellow mb-2">⭐ Cómo usarlo</p>
        <div className="space-y-1.5">
          {[
            '1. Revisa los 5 datos calientes antes de tu turno',
            '2. Memoriza el dato clave de los 2-3 partidos más importantes',
            '3. Usa el speech cuando el cliente muestre interés en el fútbol',
            '4. Copia el texto con el botón para tenerlo listo en el celular',
            '5. Nunca garantices resultados — orienta con información',
          ].map((tip, i) => (
            <p key={i} className="text-xs text-gray-400 leading-relaxed">{tip}</p>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: PARTIDOS DE LA SEMANA
   ═══════════════════════════════════════════════════════════ */
function TabPartidos() {
  const [competencia, setComp] = useState('libertadores')

  const config = {
    libertadores: { label: '🏆 Copa Libertadores', color: 'bg-yellow-600', partidos: PARTIDOS_SEMANA.libertadores },
    sudamericana:  { label: '🥈 Copa Sudamericana', color: 'bg-blue-600',   partidos: PARTIDOS_SEMANA.sudamericana },
    liga1:         { label: '🇵🇪 Liga 1 Perú',      color: 'bg-red-600',    partidos: PARTIDOS_SEMANA.liga1 },
  }

  const actual = config[competencia]

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">📅 Partidos clave — semana del 21 al 27 julio</p>
        <p className="text-[11px] text-gray-500">Actualizado semanalmente · Hora Perú (PE UTC-5)</p>
      </div>

      {/* Filtro de competencia */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {Object.entries(config).map(([key, val]) => (
          <button key={key} onClick={() => setComp(key)}
            className={`flex-shrink-0 text-xs font-bold px-3 py-2 rounded-full transition-all ${
              competencia === key ? `${val.color} text-white` : 'bg-brand-medium text-gray-400'
            }`}>
            {val.label}
          </button>
        ))}
      </div>

      {/* Cards de partidos */}
      <div className="space-y-3">
        {actual.partidos.map(p => (
          <div key={p.id} className="bg-brand-dark rounded-2xl border border-white/5 p-4">
            {/* Fase */}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-[10px] font-black text-white px-2 py-0.5 rounded-full ${actual.color}`}>
                {p.fase}
              </span>
              {p.nivelInteres.includes('máximo') || p.nivelInteres.includes('clásico') ? (
                <span className="text-[10px] font-black text-brand-orange bg-brand-orange/10 border border-brand-orange/30 px-2 py-0.5 rounded-full">
                  ⭐ {p.nivelInteres}
                </span>
              ) : null}
            </div>

            {/* Equipos */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-3xl">{p.local.escudo}</span>
                <p className="text-xs font-black text-white text-center leading-tight">{p.local.nombre}</p>
                <span className="text-xs">{p.local.flag}</span>
              </div>
              <div className="text-center px-3">
                <p className="text-xs font-black text-gray-500">VS</p>
                <p className="text-[9px] text-brand-orange font-bold mt-1">{p.hora}</p>
                <p className="text-[9px] text-gray-600">{p.fecha}</p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <span className="text-3xl">{p.visita.escudo}</span>
                <p className="text-xs font-black text-white text-center leading-tight">{p.visita.nombre}</p>
                <span className="text-xs">{p.visita.flag}</span>
              </div>
            </div>

            {/* Estadio */}
            <p className="text-[10px] text-gray-500 text-center mb-3">🏟️ {p.estadio}</p>

            {/* Dato caliente */}
            <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-2.5">
              <p className="text-[10px] font-bold text-brand-orange mb-0.5">💡 Dato para el cliente</p>
              <p className="text-xs text-gray-300 leading-relaxed">{p.dato}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: MERCADOS POR COMPETENCIA
   ═══════════════════════════════════════════════════════════ */
function TabMercados() {
  const [comp, setComp] = useState('libertadores')
  const [openMer, setOpenMer] = useState(null)

  const config = {
    libertadores: { key: 'libertadores', tab: '🏆 Copa Lib',    color: 'bg-yellow-600', data: MERCADOS.libertadores },
    sudamericana:  { key: 'sudamericana', tab: '🥈 Copa Suda',   color: 'bg-blue-600',   data: MERCADOS.sudamericana },
    liga1:         { key: 'liga1',         tab: '🇵🇪 Liga 1 Perú', color: 'bg-red-600',    data: MERCADOS.liga1 },
  }

  const actual = config[comp].data

  const nivelColor = {
    básico: 'bg-green-900/40 text-green-400 border-green-500/30',
    intermedio: 'bg-yellow-900/40 text-yellow-400 border-yellow-500/30',
    avanzado: 'bg-red-900/40 text-red-400 border-red-500/30',
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">🛒 Mercados por Competencia</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Aprende qué mercados ofrecer según el torneo que le interesa al cliente. Cada competencia tiene su dinámica.
        </p>
      </div>

      {/* Selector */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {Object.values(config).map(c => (
          <button key={c.key} onClick={() => { setComp(c.key); setOpenMer(null) }}
            className={`flex-shrink-0 text-xs font-bold px-3 py-2 rounded-full transition-all ${
              comp === c.key ? `${c.color} text-white` : 'bg-brand-medium text-gray-400'
            }`}>
            {c.tab}
          </button>
        ))}
      </div>

      {/* Leyenda de niveles */}
      <div className="flex gap-2 flex-wrap">
        {[['básico','🟢','Para comenzar'],['intermedio','🟡','Con algo de experiencia'],['avanzado','🔴','Cliente que conoce']].map(([nivel, dot, desc]) => (
          <div key={nivel} className="flex items-center gap-1.5">
            <span className="text-xs">{dot}</span>
            <span className="text-[10px] text-gray-500">{nivel} — {desc}</span>
          </div>
        ))}
      </div>

      {/* Intro */}
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-brand-orange mb-1">{actual.emoji} {actual.titulo}</p>
        <p className="text-xs text-gray-300 leading-relaxed">{actual.intro}</p>
      </div>

      {/* Mercados lista */}
      <div className="space-y-2">
        {actual.principales.map((m, i) => {
          const isOpen = openMer === i
          return (
            <div key={i} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
              <button onClick={() => setOpenMer(isOpen ? null : i)}
                className="w-full p-4 text-left flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-white">{m.mercado}</p>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${nivelColor[m.nivel]}`}>
                      {m.nivel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{m.descripcion}</p>
                </div>
                <span className={`text-gray-400 text-sm transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-fade-in">
                  <p className="text-xs text-gray-300 leading-relaxed">{m.descripcion}</p>

                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-blue-400 mb-1">📍 ¿Cuándo ofrecerlo?</p>
                    <p className="text-xs text-gray-300">{m.cuando}</p>
                  </div>

                  <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-brand-orange mb-1">💬 Speech sugerido:</p>
                    <p className="text-xs text-white font-bold italic leading-relaxed">"{m.speech}"</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Tip */}
      <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-yellow mb-2">⭐ Tip del mes</p>
        <p className="text-xs text-gray-300 leading-relaxed">{actual.tip}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: PERFILES DE CLIENTE
   ═══════════════════════════════════════════════════════════ */
function TabClientes() {
  const [open, setOpen] = useState('p1')

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">👥 Perfiles de Cliente</p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Identifica qué tipo de cliente tienes frente a ti y adapta tu conversación. Cada hincha es diferente.
        </p>
      </div>

      <div className="space-y-3">
        {PERFILES_CLIENTE.map(p => {
          const isOpen = open === p.id
          return (
            <div key={p.id} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
              <button onClick={() => setOpen(isOpen ? null : p.id)}
                className="w-full p-4 text-left flex items-center gap-3">
                <span className="text-3xl flex-shrink-0">{p.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-black text-white">{p.tipo}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.descripcion}</p>
                </div>
                <span className={`text-gray-400 text-sm transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-fade-in">
                  {/* Descripción */}
                  <p className="text-xs text-gray-300 leading-relaxed">{p.descripcion}</p>

                  {/* Cómo identificarlo */}
                  <div className="bg-brand-medium/40 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">🔍 Cómo identificarlo</p>
                    <p className="text-xs text-gray-300 leading-relaxed">{p.comoIdentificarlo}</p>
                  </div>

                  {/* Cómo acercarte */}
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-2">🎯 Cómo acercarte</p>
                    <div className="space-y-1.5">
                      {p.comoAcercarte.map((paso, i) => (
                        <p key={i} className="text-xs text-gray-300 leading-relaxed">{paso}</p>
                      ))}
                    </div>
                  </div>

                  {/* Mercados ideales */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">🛒 Mercados ideales para este cliente</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.mercadosIdeal.map(mer => (
                        <span key={mer} className="text-xs bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-2.5 py-1 rounded-full font-medium">
                          {mer}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Speech */}
                  <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-xl p-3">
                    <p className="text-[10px] font-bold text-brand-orange mb-1">💬 Speech sugerido:</p>
                    <p className="text-xs text-white font-bold italic leading-relaxed">"{p.speech}"</p>
                  </div>

                  {/* Advertencia */}
                  <div className="bg-red-900/20 border border-red-500/20 rounded-xl px-3 py-2">
                    <p className="text-[10px] text-red-400 font-bold">⚠️ Ten en cuenta: {p.advertencia}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: COMPETENCIA (Copa Lib / Copa Suda)
   ═══════════════════════════════════════════════════════════ */
function TabCompetencia({ data }) {
  const [copied, setCopied] = useState(false)

  async function copiarSpeech() {
    try { await navigator.clipboard.writeText(data.speechCliente) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className={`bg-gradient-to-r ${data.color} border ${data.border} rounded-2xl p-4`}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-2xl">{data.emoji}</span>
          <p className="text-sm font-black text-white">{data.nombre}</p>
          <span className={`ml-auto text-[10px] font-black text-white px-2 py-0.5 rounded-full ${data.faseBadge}`}>
            {data.fase}
          </span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed mt-1">{data.descripcion}</p>
      </div>

      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🗺️ Formato del torneo</p>
        <div className="space-y-2">
          {data.formato.map((f, i) => (
            <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${
              f.actual ? `${data.accentBg}` : f.done ? 'bg-white/[0.03] border-white/5 opacity-60' : 'bg-white/[0.02] border-white/5'
            }`}>
              <span className="flex-shrink-0 mt-0.5">{f.done ? '✅' : f.actual ? '▶️' : '⏳'}</span>
              <div>
                <p className={`text-xs font-bold ${f.actual ? data.accentText : f.done ? 'text-gray-500' : 'text-gray-300'}`}>
                  {f.fase}
                  {f.actual && <span className="ml-2 text-[9px] font-black bg-brand-orange text-white px-1.5 rounded-full">AHORA</span>}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{f.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🇵🇪 Equipos peruanos</p>
        <div className="space-y-2">
          {data.equiposPeruanos.map(e => (
            <div key={e.nombre} className="bg-brand-medium/50 rounded-xl px-4 py-3 flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{e.escudo}</span>
              <div>
                <p className="text-sm font-bold text-white">{e.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{e.dato}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {data.datosRapidos.map(d => (
          <div key={d.titulo} className="bg-brand-dark rounded-xl p-3 border border-white/5">
            <p className="text-xl mb-1">{d.icono}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{d.titulo}</p>
            <p className="text-xs font-bold text-white mt-0.5 leading-tight">{d.valor}</p>
          </div>
        ))}
      </div>

      <div className={`${data.accentBg} border rounded-2xl p-4`}>
        <p className={`text-xs font-bold ${data.accentText} mb-2`}>🔥 Dato para la conversación</p>
        <p className="text-sm text-gray-300 leading-relaxed">{data.datoConversacion}</p>
      </div>

      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-brand-orange">💬 Ofrécelo así al cliente:</p>
          <button onClick={copiarSpeech} className="text-xs text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-1">
            {copied ? '✅ Copiado' : '📋 Copiar'}
          </button>
        </div>
        <p className="text-sm text-white font-bold italic leading-relaxed">"{data.speechCliente}"</p>
        <div className="mt-3 bg-brand-medium/30 rounded-xl px-3 py-2">
          <p className="text-[10px] text-gray-500">
            🔐 Recuerda: nunca garantices resultados. Orienta al cliente con información, no con predicciones.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: LIGA 1 PERU
   ═══════════════════════════════════════════════════════════ */
function TabLiga1() {
  const [copied, setCopied] = useState(false)
  const [openEquipo, setOpenEquipo] = useState(null)

  async function copiarSpeech() {
    try { await navigator.clipboard.writeText(LIGA1.speechCliente) } catch {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-red-900/60 to-rose-900/40 border border-red-500/40 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-2xl">🇵🇪</span>
          <p className="text-sm font-black text-white">{LIGA1.nombre}</p>
          <span className="text-[10px] font-black text-white bg-red-600 px-2 py-0.5 rounded-full ml-auto">{LIGA1.fase}</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed mt-1">{LIGA1.descripcion}</p>
      </div>

      <div className="bg-gradient-to-r from-brand-orange/20 to-brand-yellow/10 border border-brand-orange/40 rounded-2xl p-4">
        <p className="text-xs font-black text-brand-orange uppercase tracking-wider mb-1">⭐ Tu argumento más poderoso</p>
        <p className="text-sm text-white font-bold leading-relaxed">
          "El campeonato peruano se llama <span className="text-brand-orange">Liga 1 TE APUESTO</span>. Somos el patrocinador oficial. Cuando el cliente ve fútbol peruano en TV, escucha nuestro nombre."
        </p>
      </div>

      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">🗺️ Estructura</p>
        <div className="space-y-2">
          {LIGA1.formato.map((f, i) => (
            <div key={i} className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${f.actual ? 'bg-red-900/30 border-red-500/30' : 'bg-white/[0.02] border-white/5'}`}>
              <span className="flex-shrink-0 mt-0.5">{f.actual ? '▶️' : '⏳'}</span>
              <div>
                <p className={`text-xs font-bold ${f.actual ? 'text-red-400' : 'text-gray-400'}`}>
                  {f.fase}
                  {f.actual && <span className="ml-2 text-[9px] font-black bg-brand-orange text-white px-1.5 rounded-full">AHORA</span>}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{f.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">⚽ Equipos — toca para ver la hinchada</p>
        <div className="grid grid-cols-2 gap-2">
          {LIGA1.equiposDestacados.map(e => (
            <button key={e.nombre} onClick={() => setOpenEquipo(openEquipo === e.nombre ? null : e.nombre)}
              className="bg-brand-medium/50 rounded-xl px-3 py-2.5 text-left border border-white/5 hover:border-red-500/30 transition-all">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-lg">{e.escudo}</span>
                <p className="text-xs font-bold text-white leading-tight">{e.nombre}</p>
              </div>
              <p className="text-[10px] text-gray-500">{e.ciudad}</p>
              {openEquipo === e.nombre && (
                <p className="text-[10px] text-red-400 mt-1 font-semibold">Hinchada: {e.hinchada}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {LIGA1.datosRapidos.map(d => (
          <div key={d.titulo} className="bg-brand-dark rounded-xl p-3 border border-white/5">
            <p className="text-xl mb-1">{d.icono}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{d.titulo}</p>
            <p className="text-xs font-bold text-white mt-0.5 leading-tight">{d.valor}</p>
          </div>
        ))}
      </div>

      <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-brand-orange">💬 Ofrécelo así al cliente:</p>
          <button onClick={copiarSpeech} className="text-xs text-gray-400 hover:text-brand-orange transition-colors flex items-center gap-1">
            {copied ? '✅ Copiado' : '📋 Copiar'}
          </button>
        </div>
        <p className="text-sm text-white font-bold italic leading-relaxed">"{LIGA1.speechCliente}"</p>
      </div>

      <div className="bg-red-900/20 border border-red-500/20 rounded-2xl p-4">
        <p className="text-xs font-bold text-red-400 mb-2">🔥 Dato que siempre funciona</p>
        <p className="text-sm text-gray-300 leading-relaxed">{LIGA1.datoConversacion}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: OTRAS LIGAS
   ═══════════════════════════════════════════════════════════ */
function TabOtrasLigas() {
  const [open, setOpen] = useState(null)
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-brand-dark rounded-2xl p-4 border border-white/5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">🌐 Otras ligas en julio</p>
        <p className="text-xs text-gray-500 leading-relaxed">Mantente informada sobre el estado de todas las competencias para cualquier cliente.</p>
      </div>
      <div className="space-y-3">
        {OTRAS_LIGAS.map(liga => (
          <div key={liga.nombre} className="bg-brand-dark rounded-2xl border border-white/5 overflow-hidden">
            <button onClick={() => setOpen(open === liga.nombre ? null : liga.nombre)}
              className="w-full text-left p-4 flex items-center gap-3">
              <span className="text-3xl">{liga.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{liga.nombre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-500">{liga.pais}</span>
                  <span className="text-[10px] bg-brand-medium text-gray-400 px-2 py-0.5 rounded-full">{liga.fase}</span>
                </div>
              </div>
              <span className={`text-gray-400 transition-transform flex-shrink-0 text-sm ${open === liga.nombre ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {open === liga.nombre && (
              <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-fade-in">
                <p className="text-xs text-gray-300 leading-relaxed">{liga.detalle}</p>
                <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3">
                  <p className="text-xs font-bold text-brand-orange mb-1">💡 Dato útil</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{liga.dato}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-brand-orange/20 to-brand-yellow/10 border border-brand-orange/30 rounded-2xl p-4">
        <p className="text-xs font-bold text-brand-orange mb-2">📅 Ligas europeas — regresan en agosto</p>
        <div className="space-y-1.5">
          {[['🏴󠁧󠁢󠁥󠁮󠁧󠁿','Premier League','Agosto 2026'],['🇪🇸','La Liga','Agosto 2026'],['🇮🇹','Serie A','Agosto 2026'],['🇩🇪','Bundesliga','Agosto 2026'],['🇫🇷','Ligue 1','Agosto 2026']].map(([f,l,d]) => (
            <div key={l} className="flex items-center justify-between">
              <div className="flex items-center gap-2"><span>{f}</span><span className="text-sm text-white font-medium">{l}</span></div>
              <span className="text-xs text-gray-500">{d}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
          Con el cliente fan europeo: "Las ligas regresan en agosto — ya las tenemos en TE APUESTO. Mientras tanto hay Copa Libertadores, que es la Champions del continente."
        </p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   TAB: TRIVIA
   ═══════════════════════════════════════════════════════════ */
function TabTrivia({ onPoints }) {
  const [idx, setIdx]             = useState(0)
  const [seleccion, setSelec]     = useState(null)
  const [mostrarRes, setMostrar]  = useState(false)
  const [puntosGanados, setPuntos] = useState(0)
  const [terminado, setTerminado]  = useState(false)

  const pregunta = TRIVIA_PREGUNTAS[idx]

  function elegir(i) {
    if (mostrarRes) return
    setSelec(i)
    setMostrar(true)
    if (i === pregunta.correcta) {
      const pts = pregunta.puntos
      setPuntos(prev => prev + pts)
      if (onPoints) onPoints(pts)
    }
  }

  function siguiente() {
    if (idx + 1 >= TRIVIA_PREGUNTAS.length) { setTerminado(true) }
    else { setIdx(i => i + 1); setSelec(null); setMostrar(false) }
  }

  function reiniciar() { setIdx(0); setSelec(null); setMostrar(false); setPuntos(0); setTerminado(false) }

  if (terminado) {
    return (
      <div className="animate-fade-in space-y-4">
        <div className="text-center py-6">
          <p className="text-6xl mb-3">🏆</p>
          <h2 className="text-2xl font-black text-white mb-1">¡Trivia completada!</h2>
          <p className="text-sm text-gray-400">{TRIVIA_PREGUNTAS.length} preguntas sobre fútbol y ventas</p>
          <div className="mt-4 bg-brand-orange/10 border border-brand-orange/30 rounded-2xl px-6 py-4">
            <p className="text-3xl font-black text-brand-orange">+{puntosGanados} pts</p>
            <p className="text-xs text-gray-400 mt-1">Puntos ganados esta sesión</p>
          </div>
        </div>
        <button onClick={reiniciar} className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-brand-orange/90 transition-all active:scale-95">
          Jugar de nuevo →
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/20 border border-purple-500/20 rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">🧠 Trivia del Mes</p>
            <p className="text-sm text-white font-bold mt-0.5">Pregunta {idx + 1} de {TRIVIA_PREGUNTAS.length}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-brand-orange">+{puntosGanados}</p>
            <p className="text-[10px] text-gray-500">pts ganados</p>
          </div>
        </div>
        <div className="mt-3 w-full bg-brand-medium rounded-full h-1.5">
          <div className="h-1.5 bg-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${(idx / TRIVIA_PREGUNTAS.length) * 100}%` }} />
        </div>
      </div>

      <div className="bg-brand-dark rounded-2xl p-5 border border-white/5">
        <p className="text-base font-black text-white leading-relaxed">{pregunta.pregunta}</p>
        <div className="mt-4 space-y-2">
          {pregunta.opciones.map((op, i) => {
            const esCorrecta = i === pregunta.correcta
            const esSelec = i === seleccion
            let cls = 'bg-brand-medium border-white/10 text-gray-300'
            if (mostrarRes) {
              if (esCorrecta) cls = 'bg-green-800/60 border-green-500/60 text-white'
              else if (esSelec) cls = 'bg-red-800/60 border-red-500/60 text-white'
              else cls = 'bg-brand-medium/50 border-white/5 text-gray-500 opacity-60'
            } else if (esSelec) cls = 'bg-brand-orange/20 border-brand-orange/50 text-white'
            return (
              <button key={i} onClick={() => elegir(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${cls} ${!mostrarRes ? 'hover:border-brand-orange/40 active:scale-[0.99]' : ''}`}>
                <span className="font-black mr-2">{['A','B','C','D'][i]}.</span>{op}
                {mostrarRes && esCorrecta && <span className="float-right">✅</span>}
                {mostrarRes && esSelec && !esCorrecta && <span className="float-right">❌</span>}
              </button>
            )
          })}
        </div>
      </div>

      {mostrarRes && (
        <div className={`rounded-2xl p-4 border ${seleccion === pregunta.correcta ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'}`}>
          <p className={`text-sm font-black mb-2 ${seleccion === pregunta.correcta ? 'text-green-400' : 'text-red-400'}`}>
            {seleccion === pregunta.correcta ? `✅ ¡Correcto! +${pregunta.puntos} puntos` : '❌ No era esa'}
          </p>
          <p className="text-xs text-gray-300 leading-relaxed">{pregunta.explicacion}</p>
        </div>
      )}

      {mostrarRes && (
        <button onClick={siguiente} className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl text-base hover:bg-brand-orange/90 transition-all active:scale-95">
          {idx + 1 >= TRIVIA_PREGUNTAS.length ? 'Ver resultados 🏆' : 'Siguiente →'}
        </button>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   NOTA OFICIAL
   ═══════════════════════════════════════════════════════════ */
function NotaOficial() {
  return (
    <div className="bg-brand-dark rounded-2xl p-4 border border-white/5 mt-2">
      <p className="text-[10px] text-gray-600 leading-relaxed text-center">
        📋 Contenido interno para capacitación de personal autorizado adulto.
        La información de torneos es educativa y de contexto. No garantices resultados.
        Orienta siempre con responsabilidad. · TE APUESTO · Academia Guerrera
      </p>
    </div>
  )
}
