import { useState, useMemo } from 'react'
import ResponsibleBanner from '../components/ResponsibleBanner'

/* ─── DATA ─── */
const BET_TYPES = [
  {
    id: 'ganador',
    name: 'Ganador del Partido',
    icon: '🏆',
    category: 'Básicas',
    what: 'El cliente apuesta por el equipo que ganará el partido.',
    example: 'Alianza Lima gana.',
    howToOffer: '"Señor, esta es la opción más simple: elegimos qué equipo gana el partido."',
    whenToUse: 'Cuando el cliente es nuevo o quiere una apuesta fácil.',
    mistake: 'Prometer que el equipo va a ganar.',
    responsible: '"Podemos revisar una opción interesante, pero toda apuesta tiene riesgo."',
  },
  {
    id: 'doble',
    name: 'Doble Oportunidad',
    icon: '2️⃣',
    category: 'Básicas',
    what: 'El cliente cubre dos posibles resultados a la vez.',
    example: 'Perú gana O empata.',
    howToOffer: '"Esta opción le da mayor cobertura, porque no depende solo de que gane; también le sirve el empate."',
    whenToUse: 'En partidos parejos o cuando el cliente busca algo más conservador.',
    mistake: 'Decir que no hay riesgo.',
    responsible: '"Cubre más escenarios, pero igual sigue siendo una apuesta."',
  },
  {
    id: 'mas-goles',
    name: 'Más de Goles',
    icon: '⬆️',
    category: 'Goles',
    what: 'El cliente apuesta a que habrá más goles que una línea definida.',
    example: 'Más de 1.5 goles = deben caer 2 goles o más.',
    howToOffer: '"No necesitamos saber quién gana. Solo que el partido tenga goles."',
    whenToUse: 'Cuando juegan equipos ofensivos o con tendencia a muchos goles.',
    mistake: 'No explicar qué significa 1.5, 2.5 o 3.5.',
    responsible: '"Revisemos la línea de goles antes de jugar."',
  },
  {
    id: 'menos-goles',
    name: 'Menos de Goles',
    icon: '⬇️',
    category: 'Goles',
    what: 'El cliente apuesta a que habrá menos goles que una línea definida.',
    example: 'Menos de 3.5 goles = el partido termina con 3 goles o menos.',
    howToOffer: '"Esta opción sirve cuando esperamos un partido cerrado o con pocos goles."',
    whenToUse: 'En clásicos, finales o partidos donde los equipos suelen cuidarse.',
    mistake: 'Confundir "menos de 3.5" con máximo 4 goles.',
    responsible: '"Hay que entender bien la línea antes de confirmar."',
  },
  {
    id: 'ambos-anotan',
    name: 'Ambos Equipos Anotan',
    icon: '🥅',
    category: 'Goles',
    what: 'El cliente apuesta a que los dos equipos harán al menos un gol.',
    example: 'Ambos equipos anotan: Sí.',
    howToOffer: '"No importa quién gane. Solo necesitamos que los dos equipos marquen."',
    whenToUse: 'Cuando ambos equipos suelen atacar o recibir goles.',
    mistake: 'Creer que también importa el resultado final del partido.',
    responsible: '"El resultado no importa, solo que ambos anoten."',
  },
  {
    id: 'exacto',
    name: 'Resultado Exacto',
    icon: '🎯',
    category: 'Especiales',
    what: 'El cliente apuesta por el marcador final exacto.',
    example: 'Perú 2 - 1 Chile.',
    howToOffer: '"Esta opción puede tener cuota más alta, pero debemos acertar el marcador exacto."',
    whenToUse: 'Con clientes que buscan cuotas altas y entienden el riesgo.',
    mistake: 'Ofrecerlo como opción fácil o frecuente.',
    responsible: '"Puede pagar mejor, pero es más difícil de acertar."',
  },
  {
    id: 'handicap',
    name: 'Handicap',
    icon: '⚖️',
    category: 'Especiales',
    what: 'Ventaja o desventaja virtual que se aplica a un equipo para efectos de la apuesta.',
    example: 'Equipo A +1.5 = empieza con 1.5 goles de ventaja virtual.',
    howToOffer: '"El handicap ayuda cuando creemos que un equipo puede competir bien, aunque no gane."',
    whenToUse: 'Cuando hay un favorito claro pero el otro equipo puede dar pelea.',
    mistake: 'No explicar que es una ventaja virtual, no real.',
    responsible: '"Primero revisemos qué significa el handicap antes de jugar."',
  },
  {
    id: 'corners',
    name: 'Total de Corners',
    icon: '🚩',
    category: 'Especiales',
    what: 'El cliente apuesta a la cantidad total de tiros de esquina en el partido.',
    example: 'Más de 8.5 corners = deben haber 9 corners o más.',
    howToOffer: '"Esta opción sirve cuando esperamos un partido con muchos ataques por las bandas."',
    whenToUse: 'Cuando hay equipos que atacan mucho por los costados.',
    mistake: 'Ofrecer corners sin explicar que no depende de goles.',
    responsible: '"Esta apuesta depende de los tiros de esquina, no del marcador."',
  },
  {
    id: 'tarjetas',
    name: 'Tarjetas',
    icon: '🟨',
    category: 'Especiales',
    what: 'El cliente apuesta a la cantidad de tarjetas del partido.',
    example: 'Más de 3.5 tarjetas = deben mostrarse 4 tarjetas o más.',
    howToOffer: '"Esta opción es interesante en partidos intensos, clásicos o de mucha rivalidad."',
    whenToUse: 'En clásicos, finales o partidos muy disputados.',
    mistake: 'No revisar si cuenta amarilla, roja o las condiciones exactas del mercado.',
    responsible: '"Siempre revisemos las condiciones antes de confirmar."',
  },
  {
    id: 'anotador',
    name: 'Anotador',
    icon: '⚽',
    category: 'Jugador',
    what: 'El cliente apuesta a que un jugador específico marcará gol.',
    example: 'Jugador X anota en cualquier momento.',
    howToOffer: '"Si el cliente sigue a algún jugador, podemos revisar la opción de anotador."',
    whenToUse: 'Cuando el cliente conoce jugadores, ligas o goleadores del torneo.',
    mistake: 'No validar si el jugador será titular o si el mercado está disponible.',
    responsible: '"Primero revisemos si el jugador y la opción están activos."',
  },
]

const CATEGORIES = ['Todas', 'Básicas', 'Goles', 'Especiales', 'Jugador']

const MINI_RETO = {
  situation: 'Un cliente dice: "Quiero ganar más con mi apuesta, ¿qué me recomiendas?"',
  options: [
    { text: 'Le ofrezco una Combinada corta (2-3 opciones de distintos partidos)', correct: true, feedback: '✅ Correcto. La combinada une varias selecciones y puede tener cuota más atractiva.' },
    { text: 'Le digo que apueste al resultado exacto porque paga más', correct: false, feedback: '❌ El resultado exacto es muy difícil. No es la mejor opción para alguien que quiere más sin saber el riesgo.' },
    { text: 'Le prometo que con BetBuilder "seguro gana más"', correct: false, feedback: '❌ Nunca prometas resultados. Toda apuesta tiene riesgo.' },
  ],
}

/* ─── GUÍA COMERCIAL DATA ─── */
const HERR_COLORS = {
  orange:  { bg: 'bg-orange-700/20',  border: 'border-orange-500/30',  text: 'text-orange-300',  badge: 'bg-orange-800/40' },
  blue:    { bg: 'bg-blue-700/20',    border: 'border-blue-500/30',    text: 'text-blue-300',    badge: 'bg-blue-800/40' },
  yellow:  { bg: 'bg-yellow-700/20',  border: 'border-yellow-500/30',  text: 'text-yellow-300',  badge: 'bg-yellow-800/40' },
  green:   { bg: 'bg-green-700/20',   border: 'border-green-500/30',   text: 'text-green-300',   badge: 'bg-green-800/40' },
  purple:  { bg: 'bg-purple-700/20',  border: 'border-purple-500/30',  text: 'text-purple-300',  badge: 'bg-purple-800/40' },
  pink:    { bg: 'bg-pink-700/20',    border: 'border-pink-500/30',    text: 'text-pink-300',    badge: 'bg-pink-800/40' },
  cyan:    { bg: 'bg-cyan-700/20',    border: 'border-cyan-500/30',    text: 'text-cyan-300',    badge: 'bg-cyan-800/40' },
  emerald: { bg: 'bg-emerald-700/20', border: 'border-emerald-500/30', text: 'text-emerald-300', badge: 'bg-emerald-800/40' },
  indigo:  { bg: 'bg-indigo-700/20',  border: 'border-indigo-500/30',  text: 'text-indigo-300',  badge: 'bg-indigo-800/40' },
  amber:   { bg: 'bg-amber-700/20',   border: 'border-amber-500/30',   text: 'text-amber-300',   badge: 'bg-amber-800/40' },
  rose:    { bg: 'bg-rose-700/20',    border: 'border-rose-500/30',    text: 'text-rose-300',    badge: 'bg-rose-800/40' },
  teal:    { bg: 'bg-teal-700/20',    border: 'border-teal-500/30',    text: 'text-teal-300',    badge: 'bg-teal-800/40' },
  sky:     { bg: 'bg-sky-700/20',     border: 'border-sky-500/30',     text: 'text-sky-300',     badge: 'bg-sky-800/40' },
}

const HERRAMIENTAS_COMERCIALES = [
  {
    id: 'partidos-dia', num: '01', icon: '📅', color: 'orange',
    name: 'Partidos del Día',
    tag: 'Inicio de atención',
    objetivo: 'Abrir conversación y convertir el calendario deportivo en oportunidad comercial.',
    teoria: 'Los partidos del día son la base de la conversación. Permiten pasar de una atención pasiva a una activa, porque la promotora tiene un tema concreto para iniciar: quién juega, a qué hora y qué torneo es.',
    porQueVende: 'Conecta la venta con la emoción del momento. Cuando el cliente ve un partido relevante, aumenta su interés por revisar cuotas, armar un ticket o consultar una promo.',
    pasos: [
      'Revisar al inicio del turno los partidos más importantes del día.',
      'Identificar horarios fuertes: antes del partido, medio tiempo y nocturnos.',
      'Usar el partido como entrada para ofrecer simple, combinada, Yapa o BetBuilder.',
      'Seleccionar 2 o 3 partidos más atractivos, sin saturar al cliente.',
    ],
    speech: '¡Hoy hay partidazo del Mundial, causa! 🔥 Revisa las cuotas antes de que empiece y arma tu jugada, ¿la revisamos?',
    kpi: 'Clientes abordados por partido clave · Tickets antes del inicio · Ventas en horarios de mayor demanda.',
    cuidado: 'No presentar un partido como apuesta segura. El partido es el gancho de conversación, no una promesa de resultado.',
  },
  {
    id: 'tipos-apuesta', num: '02', icon: '🎰', color: 'blue',
    name: 'Tipos de Apuesta',
    tag: 'Exploración',
    objetivo: 'Transformar el interés del cliente en una opción concreta de juego.',
    teoria: 'Los tipos de apuesta son las formas en que el cliente puede participar en un evento: resultado final, más/menos goles, ambos anotan, apuestas por jugador, combinadas y más según disponibilidad.',
    porQueVende: 'Muchos clientes quieren apostar, pero no saben por dónde empezar. Cuando la promotora explica opciones simples, reduce la confusión y facilita el cierre de venta.',
    pasos: [
      'Preguntar primero qué equipo o partido le interesa al cliente.',
      'Ofrecer opción fácil si es nuevo: resultado final o más/menos goles.',
      'Ofrecer combinadas o BetBuilder si el cliente ya tiene experiencia.',
      'Confirmar que el cliente entendió antes de emitir el ticket.',
    ],
    speech: 'Puede jugar algo simple como quién gana, o algo más sabroso como más de 1.5 goles 😄. Si quiere juntar varios partidos, armamos una múltiple.',
    kpi: 'Tickets por tipo · Participación de apuestas múltiples · Clientes nuevos con primera apuesta asistida.',
    cuidado: 'No usar términos técnicos sin explicar. La promotora debe traducir la apuesta a lenguaje cotidiano.',
  },
  {
    id: 'la-yapa', num: '03', icon: '🎁', color: 'yellow',
    name: 'La Yapa',
    tag: 'Cierre de ticket',
    objetivo: 'Impulsar apuestas múltiples y aumentar el valor percibido del ticket.',
    teoria: 'La Yapa es una ganancia adicional asociada a apuestas múltiples que cumplen condiciones específicas. En la promo del Mundial, más partidos en el ticket = mayor Yapa potencial, según condiciones vigentes.',
    porQueVende: 'Da un argumento comercial poderoso: no solo se venden partidos, se vende la posibilidad de activar un beneficio adicional. Aumenta el ticket promedio y promueve combinadas.',
    pasos: [
      'Explicar que aplica desde una múltiple con la cantidad mínima de partidos establecida.',
      'Mencionar la cuota mínima y condiciones vigentes antes de cerrar el ticket.',
      'Usar ejemplos simples: 5 partidos activa una Yapa; más partidos, mayor puede ser el beneficio.',
      'Reforzar que suma valor, no garantiza ganar.',
    ],
    speech: 'Si armas tu múltiple desde 5 partidos activamos la Yapa 🎁. Mientras más partidos, mayor puede ser el beneficio adicional según la tabla vigente.',
    kpi: 'Tickets múltiples · Promedio de selecciones por ticket · Clientes que activan Yapa · Crecimiento del ticket promedio.',
    cuidado: 'Validar bases, cuota mínima y vigencia. Nunca decir "vas a ganar más"; decir "puedes recibir ganancia adicional si cumple las condiciones".',
  },
  {
    id: 'racha-mundialista', num: '04', icon: '🔥', color: 'rose',
    name: 'Racha Mundialista',
    tag: 'Recompra',
    objetivo: 'Generar continuidad, recompra y visitas repetidas durante el Mundial.',
    teoria: 'La Racha Mundialista premia la continuidad: el cliente participa varios días y puede acceder a beneficios o apuestas gratis según la mecánica vigente. Al ser temporal (hasta el 20 de julio), genera urgencia.',
    porQueVende: 'Convierte una venta aislada en un hábito de visita. El cliente entiende que debe volver y mantener su participación para aprovechar la promo. Es una excusa válida para recordar al cliente.',
    pasos: [
      'Comunicarla como promo especial y temporal del Mundial.',
      'Reforzar la fecha límite: vigente hasta el 20 de julio según bases comunicadas.',
      'Invitar al cliente a mantener su racha y volver al punto de venta.',
      'Combinarla con el Club TE APUESTO para recordar partidos y promos.',
    ],
    speech: '¡Aprovecha la Racha Mundialista, pata! 🔥 Solo es por el Mundial, hasta el 20 de julio. Juega hoy, mantén tu racha y gana beneficios.',
    kpi: 'Clientes recurrentes por semana · Activaciones de la promo · Clientes contactados via Club · Recompra durante vigencia.',
    cuidado: 'No comunicarla como permanente. Resaltar la temporalidad y validar vigencia real en las bases.',
  },
  {
    id: 'cashout', num: '05', icon: '💸', color: 'purple',
    name: 'Cashout',
    tag: 'Durante el partido',
    objetivo: 'Dar control al cliente durante el desarrollo del evento.',
    teoria: 'El Cashout permite cerrar una apuesta antes de que termine el partido cuando la opción está disponible. El cliente no siempre tiene que esperar el final; puede decidir según cómo va el partido.',
    porQueVende: 'Aumenta la percepción de control y confianza. Algunos clientes valoran asegurar parte de su resultado o reducir exposición. Hace que el cliente siga pendiente del partido y la plataforma.',
    pasos: [
      'Explicar que no siempre está disponible; depende del evento y condiciones del mercado.',
      'Mencionarlo antes del partido como herramienta de seguimiento.',
      'Usarlo con clientes que preguntan qué pasa si el partido cambia de rumbo.',
      'Recordar que el valor del Cashout puede cambiar durante el evento.',
    ],
    speech: 'En algunos partidos aparece el Cashout 💸. Eso te permite cerrar la apuesta antes del final si la opción está disponible y decides tomarla.',
    kpi: 'Consultas sobre Cashout · Uso en eventos disponibles · Satisfacción del cliente durante partidos en vivo.',
    cuidado: 'No asegurar disponibilidad. Siempre decir "si está disponible" y explicar que el monto puede variar.',
  },
  {
    id: 'betbuilder-herr', num: '06', icon: '🏗️', color: 'amber',
    name: 'BetBuilder',
    tag: 'Cliente experto/curioso',
    objetivo: 'Personalizar la apuesta dentro de un mismo partido y elevar la experiencia del cliente.',
    teoria: 'BetBuilder permite combinar varios mercados dentro de un mismo partido cuando está disponible: resultado, cantidad de goles, condición adicional. Es para clientes que quieren sentir que arman su propia jugada.',
    porQueVende: 'Convierte la apuesta en una experiencia más participativa. Diferencia TE APUESTO, aumenta el interés del cliente futbolero y puede elevar el valor del ticket.',
    pasos: [
      'Usarlo con clientes que ya tienen una idea del partido o quieren algo más personalizado.',
      'Armar combinaciones simples y fáciles de entender.',
      'Confirmar disponibilidad del mercado antes de ofrecerlo.',
      'Evitar combinaciones demasiado complejas para clientes nuevos.',
    ],
    speech: '¡Armemos tu propia jugada del partido, crack! 🏗️ Por ejemplo, equipo ganador más cantidad de goles, siempre que el mercado esté disponible.',
    kpi: 'Tickets BetBuilder · Ticket promedio en eventos disponibles · Clientes recurrentes que usan la herramienta.',
    cuidado: 'No confundir al cliente con demasiadas condiciones. La claridad vale más que la complejidad.',
  },
  {
    id: 'pago-anticipado', num: '07', icon: '⚡', color: 'cyan',
    name: 'Pago Anticipado',
    tag: 'Durante el evento',
    objetivo: 'Generar emoción y reforzar la percepción de beneficio durante el evento.',
    teoria: 'El pago anticipado puede liquidar una apuesta antes de que finalice el evento si se cumplen ciertas condiciones. El cliente percibe dinamismo y rapidez en la experiencia de juego.',
    porQueVende: 'Eleva la emoción del cliente y puede convertirse en argumento de preferencia. Fortalece la idea de que TE APUESTO ofrece herramientas modernas vinculadas al desarrollo del partido.',
    pasos: [
      'Explicar con ejemplos generales y sin prometer activación.',
      'Usarla cuando el cliente pregunta por beneficios durante el partido.',
      'Reforzar que depende de condiciones específicas del mercado o promo.',
      'Integrarla con el seguimiento del partido y la recompra.',
    ],
    speech: 'En algunos casos, si se cumplen las condiciones, tu apuesta puede pagarse antes de que termine el partido ⚡. Hay que revisar si aplica para ese evento.',
    kpi: 'Consultas sobre pago anticipado · Tickets en mercados donde aplica · Satisfacción de clientes que reciben el beneficio.',
    cuidado: 'No decir "se paga antes" como regla general. Comunicar siempre como posibilidad condicionada.',
  },
  {
    id: 'bonos-bienvenida', num: '08', icon: '🎉', color: 'pink',
    name: 'Bonos de Bienvenida',
    tag: 'Primer contacto',
    objetivo: 'Captar clientes nuevos y reducir la barrera para el primer juego.',
    teoria: 'Los bonos de bienvenida son beneficios de entrada para clientes que inician su experiencia con TE APUESTO, según condiciones vigentes. Funcionan como incentivo inicial que facilita el registro.',
    porQueVende: 'Convierte curiosos en clientes activos. El cliente nuevo suele tener dudas; un bono o beneficio inicial permite abrir la conversación, explicar el producto y motivar la primera acción.',
    pasos: [
      'Usarlo con clientes que todavía no están registrados o no han jugado.',
      'Explicar de forma simple qué debe hacer el cliente para acceder al beneficio.',
      'Validar requisitos, DNI y condiciones vigentes.',
      'Cerrar con un CTA de registro o primera apuesta.',
    ],
    speech: '¡Si es tu primera vez en TE APUESTO, podemos revisar si tienes bono disponible! 🎉 Regístrate y aprovecha el beneficio vigente.',
    kpi: 'Nuevos registros · Clientes que usan bono · Conversión de registro a primera apuesta · Clientes nuevos en el Club.',
    cuidado: 'No ofrecer bonos sin validar disponibilidad. Usar siempre las condiciones vigentes.',
  },
  {
    id: 'club-herr', num: '09', icon: '🤝', color: 'teal',
    name: 'Club TE APUESTO',
    tag: 'Postventa',
    objetivo: 'Fidelizar clientes y mantener comunicación activa para generar recompra.',
    teoria: 'El Club TE APUESTO permite mantener contacto, compartir partidos del día, promociones, tips y recordatorios. La venta no termina cuando se emite el ticket; continúa con la recompra.',
    porQueVende: 'Convierte clientes ocasionales en recurrentes. Ayuda a la promotora a tener una base activa y a segmentar mensajes: clientes nuevos, mundialistas, de múltiples o de deportes virtuales.',
    pasos: [
      'Invitar al cliente a unirse después de una buena atención o al pagar un premio.',
      'Enviar mensajes cortos, útiles y con CTA claro.',
      'Compartir 2 o 3 partidos fuertes, no saturar con demasiada información.',
      'Usarlo para recordar promos temporales como Racha Mundialista o Yapa.',
    ],
    speech: '¡Únete al Club TE APUESTO, causa! 🤝 Te compartimos los partidazos del día, promos y opciones para que no te pierdas nada.',
    kpi: 'Clientes inscritos · Clientes activos por semana · Mensajes con respuesta · Redenciones de promos · Recompra por cliente contactado.',
    cuidado: 'No enviar mensajes excesivos o confusos. El Club debe aportar valor, no parecer spam.',
  },
  {
    id: 'deportes-virtuales', num: '10', icon: '🎮', color: 'indigo',
    name: 'Deportes Virtuales',
    tag: 'Tiempos muertos',
    objetivo: 'Generar venta continua cuando no hay partidos en vivo o el cliente busca rapidez.',
    teoria: 'Los Deportes Virtuales son eventos simulados de corta duración: fútbol virtual, caballos, galgos, motos, MMA y más. Su característica principal es la rapidez y frecuencia.',
    porQueVende: 'Evita tiempos muertos de venta. Mientras no hay partidos reales importantes, la promotora puede ofrecer una experiencia rápida y entretenida. Ideal para clientes que no quieren esperar.',
    pasos: [
      'Ofrecerlo en horarios sin partidos fuertes o mientras el cliente espera.',
      'Explicar que son eventos rápidos y fáciles de jugar.',
      'No reemplazar totalmente el fútbol real; usarlo como complemento.',
      'Combinarlo con Autoatención para agilizar la experiencia.',
    ],
    speech: '¿Quieres jugar algo rápido mientras esperamos los partidos de la noche? 🎮 Tenemos Deportes Virtuales con eventos cada pocos minutos.',
    kpi: 'Ventas en horarios valle · Tickets de Deportes Virtuales · Clientes nuevos que prueban el producto · Recompra en tiempos muertos.',
    cuidado: 'Explicar claramente que son eventos virtuales. No presentarlos como partidos reales.',
  },
  {
    id: 'cta-herr', num: '11', icon: '🎯', color: 'yellow',
    name: 'CTA / Call To Action',
    tag: 'Todo momento',
    objetivo: 'Convertir la información en una acción concreta del cliente.',
    teoria: 'El CTA es el llamado a la acción: la frase que guía al cliente a hacer algo. Sin CTA, la comunicación informa. Con CTA, la comunicación vende.',
    porQueVende: 'Ayuda a cerrar la atención. Muchas veces el cliente escucha la promo, pero necesita una indicación simple para actuar. Un buen CTA reduce la indecisión y pasa de explicar a vender.',
    pasos: [
      'Usar verbos directos: arma, activa, aprovecha, juega, regístrate, vuelve.',
      'Conectar el CTA con una urgencia real: hoy, antes del partido, solo por el Mundial.',
      'Usar un CTA por comunicación para no confundir.',
      'Cerrar cada speech con una acción concreta.',
    ],
    speech: '¡Arma tu múltiple HOY y activa la Yapa antes de que empiece el partido! 🎯',
    kpi: 'Clientes que toman acción · Registros · Tickets emitidos · Clientes unidos al Club · Redenciones de promos.',
    cuidado: 'Un CTA debe ser claro y honesto. Evitar frases agresivas o que presionen al cliente.',
  },
  {
    id: 'pago-premios', num: '12', icon: '🏅', color: 'emerald',
    name: 'Pago de Premios',
    tag: 'Postventa / cobro',
    objetivo: 'Generar confianza, reforzar seguridad y promover recompra.',
    teoria: 'El pago de premios es una herramienta comercial porque demuestra que TE APUESTO cumple. Para el cliente, cobrar de forma clara y segura refuerza la confianza en el punto de venta y la marca.',
    porQueVende: 'Un cliente que cobra bien tiene más probabilidad de volver a jugar. El momento del pago es ideal para felicitar, fidelizar, invitar al Club y proponer una nueva jugada de forma responsable.',
    pasos: [
      'Atender el pago con rapidez, amabilidad y claridad.',
      'Felicitar al cliente y reforzar la confianza: aquí juega, gana y cobra.',
      'Invitarlo a revisar partidos del día o unirse al Club TE APUESTO.',
      'No presionar al cliente a reinvertir todo el premio; comunicar con responsabilidad.',
    ],
    speech: '¡Felicitaciones por tu premio, crack! 🏅 Recuerda que aquí puedes jugar, ganar y cobrar de forma segura. ¿Revisamos los partidos de hoy?',
    kpi: 'Pagos atendidos correctamente · Tiempo de atención · Clientes que vuelven tras cobrar · Ganadores inscritos al Club.',
    cuidado: 'El pago de premios exige precisión y transparencia. Nunca debe usarse para presionar al cliente.',
  },
  {
    id: 'autoatencion', num: '13', icon: '🤖', color: 'sky',
    name: 'Autoatención',
    tag: 'Alta demanda',
    objetivo: 'Agilizar la atención, educar al cliente y liberar tiempo comercial para captar más.',
    teoria: 'La Autoatención permite que el cliente revise opciones, consulte o realice acciones de manera más autónoma. No reemplaza a la promotora; la ayuda a atender mejor en momentos de alta demanda.',
    porQueVende: 'Reduce colas, mejora la experiencia y libera tiempo para que la promotora se enfoque en vender, captar nuevos clientes y explicar promos. Educa al cliente para que vuelva con mayor facilidad.',
    pasos: [
      'Presentarla como ayuda para jugar más rápido y revisar opciones.',
      'Usarla en horarios de alta demanda o cuando hay varios clientes esperando.',
      'Acompañar al cliente la primera vez para que aprenda el proceso.',
      'Después de explicar, cerrar con CTA para que el cliente complete la acción.',
    ],
    speech: 'También puedes usar la Autoatención para revisar tus opciones y avanzar más rápido 🤖. Yo te ayudo la primera vez para que lo hagas fácil.',
    kpi: 'Uso de Autoatención · Reducción de colas · Clientes guiados por primera vez · Tiempo liberado para captación.',
    cuidado: 'No abandonar al cliente. La Autoatención debe sentirse como apoyo, no como falta de servicio.',
  },
]

const CHECKLIST_DIARIA = [
  { momento: '🌅 Antes de abrir', accion: 'Revisar partidos del día, promos vigentes, Yapa, Racha y herramientas disponibles.' },
  { momento: '👥 Durante la atención', accion: 'Escuchar al cliente, elegir una herramienta, explicar simple y cerrar con CTA.' },
  { momento: '⚡ Alta demanda', accion: 'Usar Autoatención, priorizar partidos clave y mantener el speech corto.' },
  { momento: '🏅 Al pagar premios', accion: 'Felicitar, reforzar confianza, invitar al Club y ofrecer opciones sin presión.' },
  { momento: '🌙 Al cierre del día', accion: 'Revisar qué herramientas generaron más ventas y qué clientes se pueden fidelizar.' },
]

/* ─── MAIN COMPONENT ─── */
export default function BetTools({ onUpdatePoints }) {
  const [activeSection, setActiveSection] = useState('betbuilder')

  return (
    <div className="pb-24 animate-fade-in overflow-x-hidden w-full">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-orange via-orange-700 to-yellow-700 px-5 py-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 text-8xl opacity-10 rotate-12 translate-x-4 -translate-y-2">🛠️</div>
        <p className="text-xs font-bold text-orange-200 uppercase tracking-widest mb-1">Centro de Herramientas</p>
        <h1 className="text-2xl font-black text-white leading-tight">TE APUESTO</h1>
        <p className="text-sm text-orange-100 mt-1">Domina los mercados y explícalos con seguridad</p>
      </div>

      {/* Section tabs */}
      <div className="sticky top-[57px] z-30 bg-brand-black/95 backdrop-blur-sm px-4 py-2 border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <button
            onClick={() => setActiveSection('betbuilder')}
            className={`flex-shrink-0 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'betbuilder' ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}
          >
            🔄 BetBuilder vs Combinada
          </button>
          <button
            onClick={() => setActiveSection('types')}
            className={`flex-shrink-0 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'types' ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}
          >
            🎰 10 Tipos de Apuestas
          </button>
          <button
            onClick={() => setActiveSection('guia')}
            className={`flex-shrink-0 flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${activeSection === 'guia' ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400'}`}
          >
            📚 Guía Comercial
          </button>
        </div>
      </div>

      <div className="px-4 py-4 max-w-4xl mx-auto">
        {activeSection === 'betbuilder' && <BetBuilderSection onPoints={onUpdatePoints} />}
        {activeSection === 'types' && <BetTypesSection onPoints={onUpdatePoints} />}
        {activeSection === 'guia' && <GuiaComercialSection />}
      </div>
    </div>
  )
}

/* ─── SECTION 1: BetBuilder vs Combinada ─── */
function BetBuilderSection({ onPoints }) {
  const [retoAnswer, setRetoAnswer] = useState(null)
  const [showTable, setShowTable] = useState(false)

  function handleReto(idx) {
    if (retoAnswer !== null) return
    setRetoAnswer(idx)
    if (MINI_RETO.options[idx].correct) onPoints && onPoints(20)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-black text-white">BetBuilder vs Combinada</h2>
        <p className="text-sm text-gray-500">¿Cuándo ofrecer cada una?</p>
      </div>

      {/* Side-by-side cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

        {/* COMBINADA */}
        <div className="bg-brand-dark rounded-2xl border border-blue-500/30 overflow-hidden">
          <div className="bg-blue-700/30 px-4 py-3 flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            <p className="font-black text-white text-base">Combinada</p>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs font-bold text-blue-400 mb-1">¿Qué es?</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Une varias selecciones en un solo boleto. Pueden ser de distintos partidos. Para ganar, <span className="text-white font-semibold">todas deben acertar.</span>
              </p>
            </div>
            <div className="bg-brand-medium rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-2">📋 Ejemplo</p>
              <div className="space-y-1.5">
                {['✅ Real Madrid gana', '✅ Barcelona gana o empata', '✅ Más de 1.5 goles en Bayern vs Dortmund'].map((e, i) => (
                  <p key={i} className="text-xs text-gray-300">{e}</p>
                ))}
              </div>
            </div>
            <div className="bg-blue-900/30 border border-blue-600/20 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-300 mb-1">💬 Speech</p>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "Señor, podemos combinar 2 o 3 opciones para buscar una cuota más atractiva. Lo importante es que todas deben acertar."
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Distintos partidos', 'Cuota más alta', 'Todo debe acertar'].map(tag => (
                <span key={tag} className="text-xs bg-blue-700/20 text-blue-300 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>

        {/* BETBUILDER */}
        <div className="bg-brand-dark rounded-2xl border border-brand-orange/30 overflow-hidden">
          <div className="bg-brand-orange/20 px-4 py-3 flex items-center gap-2">
            <span className="text-2xl">🏗️</span>
            <p className="font-black text-white text-base">BetBuilder</p>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <p className="text-xs font-bold text-brand-orange mb-1">¿Qué es?</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Arma una jugada <span className="text-white font-semibold">más personalizada</span> combinando opciones permitidas de <span className="text-white font-semibold">un mismo partido.</span>
              </p>
            </div>
            <div className="bg-brand-medium rounded-xl p-3">
              <p className="text-xs font-bold text-gray-400 mb-1">📋 Ejemplo (mismo partido)</p>
              <p className="text-xs text-gray-400 mb-2">Real Madrid vs Barcelona</p>
              <div className="space-y-1.5">
                {['✅ Real Madrid gana o empata', '✅ Más de 1.5 goles', '✅ Ambos equipos anotan'].map((e, i) => (
                  <p key={i} className="text-xs text-gray-300">{e}</p>
                ))}
              </div>
            </div>
            <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3">
              <p className="text-xs font-bold text-brand-orange mb-1">💬 Speech</p>
              <p className="text-xs text-gray-300 italic leading-relaxed">
                "Señor, con BetBuilder podemos armar una jugada más completa, eligiendo varias opciones permitidas del mismo partido."
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Un solo partido', 'Más personalizado', 'Opciones del sistema'].map(tag => (
                <span key={tag} className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table toggle */}
      <button
        onClick={() => setShowTable(!showTable)}
        className="w-full py-3 bg-brand-medium rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
      >
        <span>{showTable ? '▲' : '▼'}</span>
        {showTable ? 'Ocultar tabla comparativa' : 'Ver tabla comparativa'}
      </button>

      {showTable && (
        <div className="bg-brand-dark rounded-2xl border border-white/10 overflow-hidden animate-fade-in">
          <div className="grid grid-cols-3 text-xs font-bold text-center">
            <div className="p-3 bg-brand-medium text-gray-400 uppercase tracking-wider">Característica</div>
            <div className="p-3 bg-blue-700/30 text-blue-300">Combinada</div>
            <div className="p-3 bg-brand-orange/20 text-brand-orange">BetBuilder</div>
          </div>
          {[
            ['Partidos', 'Varios', 'Uno solo'],
            ['Personalización', 'Normal', 'Alta'],
            ['Para ganar', 'Todas acertan', 'Todas acertan'],
            ['Ideal para', 'Varias opciones', 'Jugada elaborada'],
            ['Cuota', 'Se multiplica', 'Se construye'],
          ].map(([feat, com, bet], i) => (
            <div key={i} className={`grid grid-cols-3 text-xs text-center ${i % 2 === 0 ? 'bg-brand-medium/30' : ''}`}>
              <div className="p-3 text-gray-400 font-semibold text-left">{feat}</div>
              <div className="p-3 text-gray-300">{com}</div>
              <div className="p-3 text-gray-300">{bet}</div>
            </div>
          ))}
        </div>
      )}

      {/* Error block */}
      <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4">
        <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3">⚠️ Errores que NUNCA debes cometer</p>
        <div className="space-y-2">
          {['"Esta combinada es segura."', '"Este BetBuilder es fijo."', '"Esta apuesta no falla."'].map((e, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-red-400">❌</span>
              <span className="text-sm text-red-300 italic">{e}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 bg-brand-green/10 border border-brand-green/30 rounded-xl p-3">
          <p className="text-xs font-bold text-brand-green mb-1">✅ Di siempre esto</p>
          <p className="text-sm text-gray-300 italic">"Esta jugada tiene una cuota más atractiva, pero toda apuesta tiene riesgo."</p>
        </div>
      </div>

      {/* Mini reto */}
      <div className="bg-brand-dark border border-brand-yellow/30 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🎯</span>
          <div>
            <p className="text-xs font-bold text-brand-yellow uppercase tracking-wider">Mini Reto · +20 pts</p>
          </div>
        </div>
        <div className="bg-brand-medium rounded-xl p-3 mb-4">
          <p className="text-xs font-bold text-gray-400 mb-1">👤 El cliente te dice:</p>
          <p className="text-sm text-white font-semibold leading-relaxed">{MINI_RETO.situation}</p>
        </div>
        <p className="text-xs text-gray-500 mb-2">¿Qué haces?</p>
        <div className="space-y-2">
          {MINI_RETO.options.map((opt, idx) => {
            let style = 'border-white/10 text-gray-300 hover:border-brand-yellow/40'
            if (retoAnswer !== null) {
              if (opt.correct) style = 'border-brand-green bg-brand-green/10 text-brand-green'
              else if (idx === retoAnswer) style = 'border-red-500 bg-red-500/10 text-red-400'
              else style = 'border-white/5 text-gray-600 opacity-40'
            }
            return (
              <button
                key={idx}
                onClick={() => handleReto(idx)}
                className={`w-full text-left border rounded-xl p-3 text-sm leading-relaxed transition-all ${style}`}
              >
                {opt.text}
              </button>
            )
          })}
        </div>
        {retoAnswer !== null && (
          <div className={`mt-3 rounded-xl p-3 text-sm font-medium leading-relaxed ${MINI_RETO.options[retoAnswer].correct ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-medium text-gray-300'}`}>
            {MINI_RETO.options[retoAnswer].feedback}
            {MINI_RETO.options[retoAnswer].correct && <span className="ml-1 font-black">+20 pts 🎉</span>}
          </div>
        )}
      </div>

      <ResponsibleBanner compact />
    </div>
  )
}

/* ─── SECTION 2: 10 Bet Types ─── */
function BetTypesSection({ onPoints }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [expanded, setExpanded] = useState(null)

  const filtered = useMemo(() => BET_TYPES.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.what.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'Todas' || b.category === category
    return matchSearch && matchCat
  }), [search, category])

  function toggleExpand(id) {
    setExpanded(prev => prev === id ? null : id)
    if (expanded !== id) onPoints && onPoints(5)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-black text-white">10 Tipos de Apuestas</h2>
        <p className="text-sm text-gray-500">Los mercados más usados, explicados fácil</p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
        <input
          type="text"
          placeholder="Buscar: goles, handicap, corners..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-brand-medium text-white placeholder-gray-500 rounded-xl py-3 pl-10 pr-4 text-sm border border-white/10 focus:border-brand-orange/50 focus:outline-none"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-lg leading-none">×</button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${category === cat ? 'bg-brand-orange text-white' : 'bg-brand-medium text-gray-400 hover:text-white'}`}
          >
            {cat === 'Todas' ? '🎰 Todas' : cat === 'Básicas' ? '⭐ Básicas' : cat === 'Goles' ? '⚽ Goles' : cat === 'Especiales' ? '🔥 Especiales' : '👤 Jugador'}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500">{filtered.length} tipos de apuesta</p>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-3xl mb-2">🔍</p>
          <p className="text-gray-400 text-sm">No hay resultados</p>
          <button onClick={() => { setSearch(''); setCategory('Todas') }} className="text-brand-orange text-sm mt-2">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bet, idx) => (
            <BetTypeCard
              key={bet.id}
              bet={bet}
              number={BET_TYPES.indexOf(bet) + 1}
              expanded={expanded === bet.id}
              onToggle={() => toggleExpand(bet.id)}
            />
          ))}
        </div>
      )}

      <ResponsibleBanner compact />
    </div>
  )
}

/* ─── Bet Type Card ─── */
const catColors = {
  'Básicas': { bg: 'bg-blue-700/20', border: 'border-blue-600/30', text: 'text-blue-300', dot: 'bg-blue-500' },
  'Goles': { bg: 'bg-green-700/20', border: 'border-green-600/30', text: 'text-green-300', dot: 'bg-green-500' },
  'Especiales': { bg: 'bg-purple-700/20', border: 'border-purple-600/30', text: 'text-purple-300', dot: 'bg-purple-500' },
  'Jugador': { bg: 'bg-brand-orange/10', border: 'border-brand-orange/30', text: 'text-brand-orange', dot: 'bg-brand-orange' },
}

/* ─── SECTION 3: Guía Comercial ─── */
function GuiaComercialSection() {
  const [expanded, setExpanded] = useState(null)
  const [showChecklist, setShowChecklist] = useState(false)

  function toggle(id) { setExpanded(prev => prev === id ? null : id) }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-black text-white">Guía Comercial TE APUESTO</h2>
        <p className="text-sm text-gray-500">13 herramientas para vender mejor, explicadas para promotoras</p>
      </div>

      {/* Intro banner */}
      <div className="bg-brand-dark rounded-2xl border border-brand-orange/30 p-4">
        <p className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">💡 Idea central</p>
        <p className="text-sm text-gray-300 leading-relaxed">
          Una herramienta no vende sola. Vende cuando la promotora la explica con claridad, la conecta con el partido o promoción del día y <span className="text-white font-semibold">cierra con un CTA.</span>
        </p>
      </div>

      {/* Quick map */}
      <div className="bg-brand-dark rounded-2xl border border-white/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/5">
          <p className="text-sm font-black text-white">🗺️ Mapa de herramientas</p>
          <p className="text-xs text-gray-500 mt-0.5">Por perfil de cliente</p>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { perfil: '🆕 Cliente nuevo', herramientas: 'Bonos de bienvenida + Speech simple + CTA registro' },
            { perfil: '⚽ Cliente futbolero', herramientas: 'Partidos del día + Tipos de apuesta + Yapa o BetBuilder' },
            { perfil: '⚡ Busca rapidez', herramientas: 'Deportes Virtuales + Autoatención' },
            { perfil: '🎫 Ya apostó', herramientas: 'Cashout + Pago anticipado + Pago de premios + Club' },
            { perfil: '🔄 Cliente recurrente', herramientas: 'Club TE APUESTO + Racha Mundialista + Promos vigentes' },
          ].map((row, i) => (
            <div key={i} className="px-4 py-3">
              <p className="text-xs font-bold text-white mb-0.5">{row.perfil}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{row.herramientas}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Herramienta cards */}
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Las 13 herramientas</p>
      <div className="space-y-3">
        {HERRAMIENTAS_COMERCIALES.map(h => (
          <HerramientaCard key={h.id} h={h} expanded={expanded === h.id} onToggle={() => toggle(h.id)} />
        ))}
      </div>

      {/* Fórmula de speech */}
      <div className="bg-brand-dark rounded-2xl border border-brand-yellow/30 p-4">
        <p className="text-xs font-bold text-brand-yellow uppercase tracking-wider mb-3">⚡ Fórmula de speech recomendada</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
          {[
            { step: '1', label: 'Gancho', desc: 'Partido, promo o necesidad del cliente' },
            { step: '2', label: 'Herramienta', desc: 'Yapa, Club, bono, Autoatención...' },
            { step: '3', label: 'Beneficio', desc: 'Para qué le sirve al cliente' },
            { step: '4', label: 'CTA', desc: 'Registra, arma, activa, revisa, vuelve' },
          ].map(s => (
            <div key={s.step} className="bg-brand-medium rounded-xl p-3 text-center">
              <div className="w-7 h-7 rounded-full bg-brand-orange/20 text-brand-orange text-xs font-black flex items-center justify-center mx-auto mb-1.5">{s.step}</div>
              <p className="text-xs font-bold text-white mb-1">{s.label}</p>
              <p className="text-xs text-gray-400 leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-3">
          <p className="text-xs font-bold text-brand-orange mb-1">💬 Speech modelo</p>
          <p className="text-sm text-gray-300 italic leading-relaxed">
            "Hoy tenemos partido fuerte. Puedes armar una múltiple desde 5 partidos, activar la Yapa si cumple condiciones y aprovechar la promo del Mundial por tiempo limitado. ¿La revisamos juntos?"
          </p>
        </div>
      </div>

      {/* Checklist diaria toggle */}
      <button
        onClick={() => setShowChecklist(!showChecklist)}
        className="w-full py-3 bg-brand-medium rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
      >
        <span>{showChecklist ? '▲' : '▼'}</span>
        {showChecklist ? 'Ocultar checklist diaria' : '✅ Ver checklist diaria de promotora'}
      </button>

      {showChecklist && (
        <div className="bg-brand-dark rounded-2xl border border-white/10 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-black text-white">✅ Checklist diaria para promotoras</p>
          </div>
          <div className="divide-y divide-white/5">
            {CHECKLIST_DIARIA.map((item, i) => (
              <div key={i} className="px-4 py-3 flex gap-3 items-start">
                <span className="text-lg flex-shrink-0">{item.momento.split(' ')[0]}</span>
                <div>
                  <p className="text-xs font-bold text-white mb-0.5">{item.momento.slice(item.momento.indexOf(' ') + 1)}</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{item.accion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cierre */}
      <div className="bg-brand-dark rounded-2xl border border-white/10 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">💬 Mensaje para el equipo</p>
        <p className="text-sm text-gray-300 leading-relaxed italic">
          "No vendemos solo apuestas: vendemos <span className="text-white font-semibold">experiencia, información, confianza y oportunidad.</span> Cada herramienta bien usada ayuda a crecer ventas, clientes y fidelización."
        </p>
      </div>

      <ResponsibleBanner compact />
    </div>
  )
}

/* ─── Herramienta Card ─── */
function HerramientaCard({ h, expanded, onToggle }) {
  const c = HERR_COLORS[h.color] || HERR_COLORS.orange

  return (
    <div className={`bg-brand-dark rounded-2xl border transition-all duration-200 ${expanded ? `${c.border}` : 'border-white/5'}`}>
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${c.bg} border ${c.border}`}>
          {h.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gray-600">{h.num}</span>
            <p className="font-bold text-white text-sm">{h.name}</p>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${c.badge} ${c.text}`}>
            {h.tag}
          </span>
        </div>
        <span className={`text-gray-500 text-sm transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          {/* Objetivo */}
          <div className={`${c.bg} border ${c.border} rounded-xl p-3`}>
            <p className={`text-xs font-bold mb-1 ${c.text}`}>🎯 Objetivo</p>
            <p className="text-sm text-gray-300 leading-relaxed">{h.objetivo}</p>
          </div>

          {/* Teoría */}
          <div className="bg-brand-medium rounded-xl p-3">
            <p className="text-xs font-bold text-gray-400 mb-1">📖 ¿Qué es?</p>
            <p className="text-sm text-gray-300 leading-relaxed">{h.teoria}</p>
          </div>

          {/* Por qué vende */}
          <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brand-green mb-1">💰 ¿Por qué sirve en la venta?</p>
            <p className="text-sm text-gray-300 leading-relaxed">{h.porQueVende}</p>
          </div>

          {/* Pasos */}
          <div className="bg-brand-medium rounded-xl p-3">
            <p className="text-xs font-bold text-gray-400 mb-2">📋 Cómo aplicarla</p>
            <div className="space-y-1.5">
              {h.pasos.map((paso, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className={`text-xs font-black mt-0.5 flex-shrink-0 ${c.text}`}>{i + 1}.</span>
                  <p className="text-xs text-gray-300 leading-relaxed">{paso}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Speech */}
          <div className={`${c.bg} border ${c.border} rounded-xl p-3`}>
            <p className={`text-xs font-bold mb-1 ${c.text}`}>💬 Speech de ejemplo</p>
            <p className="text-sm text-gray-300 italic leading-relaxed">"{h.speech}"</p>
          </div>

          {/* KPI */}
          <div className="bg-brand-medium rounded-xl p-3">
            <p className="text-xs font-bold text-gray-400 mb-1">📊 KPIs sugeridos</p>
            <p className="text-xs text-gray-400 leading-relaxed">{h.kpi}</p>
          </div>

          {/* Cuidado */}
          <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3">
            <p className="text-xs font-bold text-red-400 mb-1">⚠️ Cuidado comercial</p>
            <p className="text-sm text-gray-300 leading-relaxed">{h.cuidado}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function BetTypeCard({ bet, number, expanded, onToggle }) {
  const colors = catColors[bet.category] || catColors['Básicas']

  return (
    <div className={`bg-brand-dark rounded-2xl border transition-all duration-200 ${expanded ? 'border-brand-orange/40' : 'border-white/5'}`}>
      <button onClick={onToggle} className="w-full text-left p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${colors.bg} border ${colors.border}`}>
          {bet.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-gray-600">#{number}</span>
            <p className="font-bold text-white text-sm">{bet.name}</p>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${colors.bg} ${colors.text}`}>
            {bet.category}
          </span>
        </div>
        <span className={`text-gray-500 text-sm transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">

          {/* What */}
          <div className="bg-brand-medium rounded-xl p-3">
            <p className="text-xs font-bold text-gray-400 mb-1">📖 ¿Qué es?</p>
            <p className="text-sm text-gray-300 leading-relaxed">{bet.what}</p>
          </div>

          {/* Example */}
          <div className="bg-brand-medium rounded-xl p-3">
            <p className="text-xs font-bold text-brand-yellow mb-1">📋 Ejemplo</p>
            <p className="text-sm text-white font-semibold">{bet.example}</p>
          </div>

          {/* How to offer */}
          <div className={`${colors.bg} border ${colors.border} rounded-xl p-3`}>
            <p className={`text-xs font-bold mb-1 ${colors.text}`}>💬 Cómo ofrecerlo</p>
            <p className="text-sm text-gray-300 italic leading-relaxed">{bet.howToOffer}</p>
          </div>

          {/* When to use */}
          <div className="bg-brand-green/10 border border-brand-green/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brand-green mb-1">✅ Cuándo usarlo</p>
            <p className="text-sm text-gray-300">{bet.whenToUse}</p>
          </div>

          {/* Mistake */}
          <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3">
            <p className="text-xs font-bold text-red-400 mb-1">⚠️ Error a evitar</p>
            <p className="text-sm text-gray-300">{bet.mistake}</p>
          </div>

          {/* Responsible */}
          <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-3">
            <p className="text-xs font-bold text-brand-orange mb-1">🛡️ Mensaje responsable</p>
            <p className="text-sm text-gray-300 italic">{bet.responsible}</p>
          </div>
        </div>
      )}
    </div>
  )
}
