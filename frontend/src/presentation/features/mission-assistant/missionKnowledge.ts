export const guideControls = [
  {
    id: 'map',
    label: 'Mapa espacial',
    text: 'Elige un lugar que te dé curiosidad y vemos qué hay allí. Puedes empezar por la nave o la estación.',
  },
  {
    id: 'simulation',
    label: 'Simulación',
    text: 'Elige una situación y veamos cómo cambia la misión. Puedes empezar por «Cambio en el descanso».',
  },
  {
    id: 'crew',
    label: 'Tripulación',
    text: 'Elige un nombre y vemos juntos cómo le ha ido. Si te da curiosidad dónde está, abre el visor del hábitat para conocer su módulo.',
  },
  {
    id: 'history',
    label: 'Historial',
    text: 'En Tripulación, toca Historial y elige el día que te interese. Ahí podemos comparar sus lecturas con las de otro momento.',
  },
  {
    id: 'journal',
    label: 'Monitoreo diario',
    text: 'Registra cómo te sientes. Puedes revisar tus respuestas antes de guardar.',
  },
] as const;

export const actionTips = {
  'start-mission': {
    label: 'Iniciar mi misión',
    text: 'Abre el panel de la tripulación para consultar sus lecturas y actividades.',
  },
  'explorer-mars': {
    label: 'Mapa de Marte',
    text: 'Acércate a Marte y consulta la Base Ares y su tripulación.',
  },
  'explorer-earth': {
    label: 'Centros en Tierra',
    text: 'Explora los centros de apoyo y los sitios de lanzamiento del planeta.',
  },
  'crew-now': {
    label: 'Ahora',
    text: 'Consulta las lecturas del tripulante seleccionado y su ubicación actual.',
  },
  'crew-health': {
    label: 'Salud por sistemas',
    text: 'Explora las lecturas y los registros por sistema del cuerpo.',
  },
  'crew-avatar': {
    label: 'Personalización',
    text: 'Abre las opciones de apariencia del astronauta.',
  },
  'crew-module': {
    label: 'Ver módulo',
    text: 'Abre el visor del módulo que ocupa este tripulante y consulta sus condiciones.',
  },
  'check-context': {
    label: 'Continuar a autoevaluación',
    text: 'Pasa a las preguntas de bienestar después de elegir la actividad y el momento.',
  },
  compare: {
    label: 'Comparar dos muestras',
    text: 'Elige dos horas del mismo indicador y compara sus valores y el contexto disponible.',
  },
  'review-check': {
    label: 'Revisar chequeo',
    text: 'Revisa y corrige tus respuestas antes de guardar.',
  },
  'save-check': {
    label: 'Guardar chequeo',
    text: 'Guarda el chequeo en este navegador. Si ya existe uno para el día UTC, se actualiza.',
  },
  'crew-body': {
    label: 'Astronauta',
    text: 'Abre el modelo corporal para consultar señales y sistemas de salud.',
  },
  'crew-ship': {
    label: 'Explorador del hábitat',
    text: 'Abre el visor de módulos y consulta las condiciones del lugar.',
  },
};

export const missionTopics = [
  {
    question:
      /\b(fuentes?|alcance|nasa|procedencia|datos reales|simulados?|datos sinteticos|origen de (los )?datos|de donde (vienen|salen) (los |estos )?datos)\b/,
    text: 'En Fuentes y alcance puedes ver qué datos vienen de estudios históricos, cuáles son simulados y cuáles ingresó la tripulación. También encontrarás las referencias y los límites de lo que puedes interpretar.',
    destination: 'sources',
  },
  {
    question: /\b(centros en tierra|sitios de lanzamiento)\b/,
    text: 'En Mapa espacial, abre la pestaña Centros en Tierra. Selecciona un lugar para ver su ficha y, cuando esté disponible, un video histórico de lanzamiento.',
  },
  {
    question: /\b(mapa espacial|mapa de marte)\b/,
    text: 'En Mapa espacial, selecciona un destino en el visor 3D o en la lista. Desde la ficha de un destino habitado puedes abrir su tripulación y consultar sus lecturas. Para acercarte a Marte, usa la pestaña Mapa de Marte.',
    target: 'map',
  },
  {
    question:
      /\b(qhipa pacha|astra)\b.*\b(que es|sirve|hace)\b|\b(que es|sirve|hace)\b.*\b(qhipa pacha|astra)\b/,
    text: 'Qhipa Pacha es una demo para explorar la salud de una tripulación ficticia junto con su actividad y el ambiente del hábitat. Puedes recorrer destinos, consultar telemetría simulada y hacer una autoevaluación.',
  },
  {
    question:
      /\b(guardar|guardo|registro|registrar|hacer|hago|encuentro|abro|donde)\b.*\b(autoevaluacion|autorregistros?)\b|\b(autoevaluacion|autorregistros?)\b.*\b(guardar|guardo|donde)\b/,
    text: 'Abre Monitoreo diario. Puedes añadir una observación por área de salud dentro del mismo formulario y revisar los datos adjuntos antes de guardar. El registro queda en este navegador.',
    target: 'journal',
  },
  {
    question:
      /\b(guard\w*|persist\w*)\b.*\b(chequeo|mis respuestas)\b|\b(chequeo|mis respuestas)\b.*\b(guard\w*|persist\w*)\b/,
    text: 'En Monitoreo diario, completa los pasos, selecciona Revisar chequeo y confirma con Guardar chequeo. El registro queda en este navegador. Si ya existe uno para el mismo tripulante y día UTC, se actualiza.',
    target: 'journal',
  },
  {
    question: /\b(sin senal|sensor caido|muestras? ausentes?|sin muestra|perdida de senal)\b/,
    text: 'Una muestra ausente aparece como un hueco en la serie. Puedes consultar la última muestra disponible con su hora o abrir el caso con el enlace directo de pérdida de señal indicado en la documentación.',
    target: 'simulation',
  },
  {
    question: /\b(radiacion|radlab|columbus)\b/,
    text: 'Abre Tripulación, cambia al visor del hábitat y despliega Radiación histórica en la ISS. La gráfica muestra una hora del instrumento DosTel1 en Columbus y puedes consultar las lecturas y su fuente.',
    target: 'crew',
  },
  {
    question: /\b(sincroniz\w*|ubicar modulo|abrir (el )?modulo|abr[eo] (el )?modulo)\b/,
    text: 'En Tripulación, elige una muestra en la gráfica y usa Sincronizar con el visor. En la línea de tiempo también puedes pulsar Ubicar módulo en el visor cuando ese momento tiene ubicación registrada.',
    target: 'crew',
  },
] as const;
