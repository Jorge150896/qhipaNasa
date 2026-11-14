export const guideControls = [
  {
    id: 'overview',
    label: 'Centro de misión',
    text: 'Ve la actividad del tripulante, sus registros y las señales que requieren revisión.',
  },
  {
    id: 'map',
    label: 'Mapa espacial',
    text: 'Explora la nave, la estación y otros destinos de la misión.',
  },
  {
    id: 'simulation',
    label: 'Simulación',
    text: 'Cambia el escenario de demostración para explorar distintos datos.',
  },
  {
    id: 'sources',
    label: 'Fuentes y alcance',
    text: 'Consulta de dónde vienen los datos y qué puedes interpretar con ellos.',
  },
  {
    id: 'crew',
    label: 'Tripulación',
    text: 'Elige un tripulante y explora sus indicadores, autorregistros y modelo corporal.',
  },
  {
    id: 'history',
    label: 'Historial',
    text: 'Consulta cómo cambió una señal y en qué horas faltaron muestras.',
  },
  {
    id: 'journal',
    label: 'Chequeo diario',
    text: 'Registra cómo te sientes. Puedes revisar tus respuestas antes de guardar.',
  },
  {
    id: 'habitat',
    label: 'Entorno',
    text: 'Elige un módulo para ver sus lecturas ambientales y quién está allí en la instantánea.',
  },
  {
    id: 'observations',
    label: 'Observaciones',
    text: 'Abre la evidencia de cada observación del escenario y consulta su estado de revisión.',
  },
] as const;

export const actionTips = {
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
      /\b(qhipa pacha|astra)\b.*\b(que es|sirve|hace)\b|\b(que es|sirve|hace)\b.*\b(qhipa pacha|astra)\b/,
    text: 'Qhipa Pacha es una demo para explorar la salud de una tripulación ficticia junto con su actividad y el ambiente del hábitat. Puedes recorrer destinos, consultar telemetría simulada y hacer una autoevaluación.',
  },
  {
    question:
      /\b(nasa|procedencia|datos reales|simulados?|datos sinteticos|origen de (los )?datos)\b/,
    text: 'La telemetría y el ambiente de la misión vienen de escenarios sintéticos. Historial incluye por separado una referencia de laboratorio de NASA OSDR. Los autorregistros son respuestas guardadas en este navegador.',
    target: 'sources',
  },
  {
    question:
      /\b(guardar|guardo|registro|registrar|hacer|hago|encuentro|abro|donde)\b.*\b(autoevaluacion|autorregistros?)\b|\b(autoevaluacion|autorregistros?)\b.*\b(guardar|guardo|donde)\b/,
    text: 'Abre Tripulación → Autoevaluación, elige un área y completa el formulario. Revisa tus respuestas y confirma el guardado. Luego puedes abrir el registro desde su historial. Se guarda en este navegador.',
    target: 'crew',
  },
  {
    question:
      /\b(guard\w*|persist\w*)\b.*\b(chequeo|mis respuestas)\b|\b(chequeo|mis respuestas)\b.*\b(guard\w*|persist\w*)\b/,
    text: 'En Chequeo diario, completa los pasos, selecciona Revisar chequeo y confirma con Guardar chequeo. El registro queda en este navegador. Si ya existe uno para el mismo tripulante y día UTC, se actualiza.',
    target: 'journal',
  },
  {
    question: /\b(sin senal|sensor caido|muestras? ausentes?|sin muestra|perdida de senal)\b/,
    text: 'Una muestra ausente aparece como un hueco en la serie. Puedes consultar la última muestra disponible con su hora y probar el caso Pérdida de señal en Simulación.',
    target: 'simulation',
  },
  {
    question: /\b(sincroniz\w*|ubicar modulo|abrir (el )?modulo|abr[eo] (el )?modulo)\b/,
    text: 'En Tripulación, elige una muestra en la gráfica y usa Sincronizar con el visor. En la línea de tiempo también puedes pulsar Ubicar módulo en el visor cuando ese momento tiene ubicación registrada.',
    target: 'crew',
  },
] as const;
