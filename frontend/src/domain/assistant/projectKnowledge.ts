import type { AppLanguage } from './AppLanguage';

const overview = {
  es: 'Qhipa Pacha es una demo de bienestar en una misión espacial ficticia. Con Nami puedes hacer un chequeo guiado o a mano, explorar cómo cambian los hábitos en Simulación, consultar las lecturas de la tripulación y recorrer los hábitats en el Mapa espacial.',
  en: 'Qhipa Pacha is a wellbeing demo set on a fictional space mission. With Nami you can do a guided or manual check-in, explore how habits change in Simulation, look up crew readings, and visit their habitats on the Space map.',
};

const screens = {
  Portada: {
    es: 'Pulsa Iniciar mi misión para abrir el Monitoreo diario.',
    en: 'Select Start my mission to open the Daily check-in.',
  },
  'Monitoreo diario': {
    es: 'Puedes hacer el chequeo a mano o elegir Hacerlo con Nami para responder una pregunta a la vez. Registra cómo te sientes, revisa tus respuestas y guárdalas en este navegador.',
    en: 'Fill in the check-in manually or choose Check in with Nami to answer one question at a time. Record how you feel, review your answers and save them in this browser.',
  },
  'Chequeo · Contexto': {
    es: 'Al empezar un chequeo elige la actividad que quieres registrar y el momento del chequeo. Luego continúa a Autoevaluación.',
    en: 'When starting a check-in, choose the activity to log and when the check-in took place. Then continue to Self-assessment.',
  },
  'Chequeo · Autoevaluación': {
    es: 'En Autoevaluación puedes registrar cómo te sientes y cómo dormiste, y añadir los detalles que tengas. En el modo guiado, Nami te pregunta un dato a la vez.',
    en: 'In Self-assessment, you can record how you feel, how you slept and any other details you have. In the guided check-in, Nami asks one question at a time.',
  },
  'Chequeo · Confirmación': {
    es: 'En Confirmación revisa tus respuestas y los datos adjuntos. Puedes corregir tus respuestas o pulsar Guardar chequeo.',
    en: 'In Confirmation, review your answers and attached data. You can edit your answers or select Save check-in.',
  },
  'Simulación · Ruta emocional': {
    es: 'Pulsa Reproducir mes para recorrer 30 días simulados en 6 segundos y escuchar el resumen de Nami. También puedes cambiar alimentación, ejercicio y contacto social para explorar otros resultados.',
    en: 'Select Play month to replay 30 simulated days in 6 seconds and hear Nami’s summary. You can also change nutrition, exercise and social contact to explore other outcomes.',
  },
  'Simulación · Pérdida de señal': {
    es: 'Puedes probar una nueva medición simulada y revisar la última lectura disponible con su fecha y origen.',
    en: 'Try a new simulated measurement and review the latest available reading with its date and source.',
  },
  'Tripulación · Ahora': {
    es: 'Elige a un tripulante y toca un indicador del astronauta para entender su lectura. Desde aquí también puedes abrir el módulo donde se encuentra en la simulación.',
    en: 'Choose a crew member and tap an indicator on the astronaut to understand their reading. You can also open the module where they are in the simulation.',
  },
  'Tripulación · Historial': {
    es: 'Puedes comparar dos muestras y revisar cuándo se registraron, de dónde vienen y qué actividad estaba registrada. También puedes consultar la actividad guardada.',
    en: 'Compare two samples and review when they were recorded, where they came from and what activity was logged. You can also review saved activity.',
  },
  'Tripulación · Seguimiento de 30 días': {
    es: 'Elige un día para mirar el ánimo, el sueño y los hábitos registrados en la serie simulada. Puedes preguntarme por ese día.',
    en: 'Pick a day to see the mood, sleep and habits recorded in the simulated series. You can ask me about that day.',
  },
  'Tripulación · Hábitat': {
    es: 'Selecciona un módulo para explorar sus condiciones y ver quién está allí en la simulación.',
    en: 'Select a module to explore its conditions and see who is there in the simulation.',
  },
  'Tripulación · Personalización': {
    es: 'Prueba accesorios y opciones de apariencia en el visor del astronauta.',
    en: 'Try accessories and appearance options in the astronaut viewer.',
  },
  'Mapa espacial': {
    es: 'Selecciona un destino en la lista o en el visor. Su ficha muestra los hábitats y, cuando está disponible, un acceso para ver a su tripulación.',
    en: 'Select a destination from the list or the viewer. Its card shows the habitats and, when available, provides a link to the crew.',
  },
  'Mapa de Marte': {
    es: 'Puedes acercarte a Marte y abrir la ficha de la Base Ares para ver su tripulación.',
    en: 'Zoom in on Mars and open the Ares Base card to see its crew.',
  },
  'Centros en Tierra': {
    es: 'Selecciona un centro o sitio de lanzamiento para ver su función y el material histórico disponible.',
    en: 'Select a center or launch site to see its role and the available historical material.',
  },
  'Referencia histórica de Inspiration4': {
    es: 'Puedes consultar los resultados históricos de Inspiration4 por fase y abrir sus fuentes. Estas mediciones pertenecen a un estudio distinto de la misión simulada.',
    en: 'Explore historical Inspiration4 data by phase and open its sources. These measurements come from a study separate from the simulated mission.',
  },
  'Radiación histórica en la ISS': {
    es: 'Consulta las lecturas de radiación del módulo Columbus y su procedencia en el archivo histórico NASA RadLab.',
    en: 'Explore the Columbus module radiation readings and their source in the historical NASA RadLab archive.',
  },
  'Archivo histórico de la ISS': {
    es: 'Puedes explorar lecturas históricas del ambiente de cabina de la ISS y cambiar la hora que se muestra.',
    en: 'Explore historical ISS cabin environment readings and change the displayed time.',
  },
  'Salud por sistemas': {
    es: 'En Tripulación, abre las fichas de Visión o Ejercicio para revisar los autorregistros disponibles y abrir el chequeo diario desde el área correspondiente.',
    en: 'In Crew, open the Vision or Exercise panels to review available self-reports and open the daily check-in for that area.',
  },
  'Ajustes de Nami': {
    es: 'Abre el chat de Nami y pulsa el engranaje. Puedes elegir Texto o Audio, abrir el chat contextual o, en inglés, seleccionar una voz disponible.',
    en: 'Open Nami’s chat and select the gear. You can choose Text or Audio, open the contextual chat, or select an available voice in English.',
  },
  'Idioma de la aplicación': {
    es: 'Cambia entre español e inglés con el selector de la cabecera. También puedes pedirme «Cambia la app a inglés». El navegador recuerda el idioma que elegiste.',
    en: 'Switch between English and Spanish using the header selector. You can also ask me to switch the app to Spanish. Your browser remembers your choice.',
  },
  'Fuentes y alcance': {
    es: 'Aquí puedes distinguir entre datos simulados, registros ingresados por el usuario y referencias históricas. También puedes abrir las fuentes originales.',
    en: 'Here you can distinguish simulated data, user-entered records and historical references. You can also open the original sources.',
  },
} satisfies Record<string, Record<AppLanguage, string>>;

export function describeProjectView(view: string, language: AppLanguage = 'es') {
  if (view === 'Personalización del astronauta')
    return screens['Tripulación · Personalización'][language];
  const exact = Object.hasOwn(screens, view) ? screens[view as keyof typeof screens] : undefined;
  return (exact ??
    (view.startsWith('Tripulación')
      ? screens['Tripulación · Ahora']
      : view.startsWith('Simulación')
        ? screens['Simulación · Ruta emocional']
        : undefined))?.[language];
}

export function getProjectOverview(language: AppLanguage = 'es') {
  return overview[language];
}

export function answerProjectQuestion(
  question: string,
  view: string,
  language: AppLanguage = 'es',
) {
  const text = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’']/g, '');
  const asksForProjectIntroduction =
    /\b(?:(?:explain(?: (?:to )?me)?|tell me(?: (?:more|a bit|a little))?) (?:about )?|what can i do (?:with|in) )(?:the app|this app|the project|this project|qhipa pacha)(?: works| please)?\s*[?!.]*\s*$/.test(
      text,
    );
  if (
    asksForProjectIntroduction ||
    /\b(?:de que trata (?:la|esta) (?:app|aplicacion|web)|de que trata (?:el|este) proyecto|(?:que es|para que sirve|como funciona) (?:esto|(?:la|esta) (?:app|aplicacion|web)|qhipa pacha)|what (?:is|does) (?:this app|qhipa pacha)(?: do| about)?|how does (?:this app|qhipa pacha) work)\b/.test(
      text,
    )
  ) {
    return getProjectOverview(language);
  }
  if (
    /\b(?:que (?:puedo hacer|hay) (?:aqui|en esta (?:vista|pantalla|seccion))|para que sirve esta (?:pantalla|vista|seccion)|what (?:can i do|is there to do) (?:here|on this screen|in this section)|what is this (?:view|screen|section) for)\b/.test(
      text,
    )
  ) {
    return describeProjectView(view, language);
  }
  const topic = extractSectionTopic(question);
  const match = Object.entries(sectionAliases).find(([, aliases]) => aliases.includes(topic));
  if (match) return describeProjectView(match[0], language);

  if (
    /\b(?:how long|duration|cuanto dura|duracion)\b/.test(text) &&
    /\b(?:simulacion|simulation|play month|reproducir mes)\b/.test(text)
  ) {
    return describeProjectView('Simulación · Ruta emocional', language);
  }
}

const sectionAliases: Record<keyof typeof screens, readonly string[]> = {
  Portada: [
    'portada',
    'home',
    'home page',
    'landing page',
    'start my mission',
    'iniciar mi mision',
  ],
  'Monitoreo diario': [
    'monitoreo diario',
    'chequeo diario',
    'daily check in',
    'check in',
    'daily monitoring',
    'guided check in',
    'hacerlo con nami',
  ],
  'Chequeo · Contexto': ['contexto', 'check in context', 'check in activity'],
  'Chequeo · Autoevaluación': ['autoevaluacion', 'self assessment'],
  'Chequeo · Confirmación': [
    'confirmacion',
    'check in confirmation',
    'save check in',
    'save my check in',
    'guardar chequeo',
  ],
  'Simulación · Ruta emocional': [
    'simulacion',
    'simulation',
    'emotional route',
    'ruta emocional',
    'emotional timeline',
    'linea de tiempo emocional',
    'play month',
    'play the month',
    'reproducir mes',
    'habit simulation',
    'prueba de habitos',
  ],
  'Simulación · Pérdida de señal': [
    'perdida de senal',
    'signal loss',
    'missing data',
    'missing readings',
  ],
  'Tripulación · Ahora': [
    'tripulacion',
    'crew',
    'crew now',
    'astronaut',
    'astronauta',
    'explorador corporal',
    'body explorer',
  ],
  'Tripulación · Historial': [
    'historial',
    'history',
    'crew history',
    'historial de tripulacion',
    'compare two samples',
    'comparar dos muestras',
    'saved activity',
    'actividad guardada',
  ],
  'Tripulación · Seguimiento de 30 días': [
    'seguimiento de 30 dias',
    '30 day follow up',
    'monthly wellbeing',
    'seguimiento mensual',
  ],
  'Tripulación · Hábitat': [
    'habitat',
    'habitat viewer',
    'explorador de habitat',
    'habitat explorer',
    'ver modulo',
    'view module',
  ],
  'Tripulación · Personalización': [
    'personalizacion',
    'personalizacion del astronauta',
    'customize',
    'customization',
    'astronaut customization',
  ],
  'Mapa espacial': ['mapa espacial', 'space map', 'space explorer', 'explorador espacial'],
  'Mapa de Marte': ['mapa de marte', 'mars map', 'base ares', 'ares base'],
  'Centros en Tierra': [
    'centros en tierra',
    'earth centers',
    'launch sites',
    'sitios de lanzamiento',
  ],
  'Referencia histórica de Inspiration4': [
    'inspiration4',
    'inspiration 4',
    'inspiration4 historical data',
    'referencia historica de inspiration4',
  ],
  'Radiación histórica en la ISS': [
    'radlab',
    'iss radiation',
    'historical iss radiation',
    'radiacion historica en la iss',
  ],
  'Archivo histórico de la ISS': [
    'iss cabin history',
    'iss historical archive',
    'archivo historico de la iss',
    'historial de cabina',
  ],
  'Salud por sistemas': [
    'salud por sistemas',
    'health by system',
    'body systems',
    'sistemas del cuerpo',
  ],
  'Ajustes de Nami': [
    'ajustes de nami',
    'nami settings',
    'voz de nami',
    'namis voice',
    'nami voice',
    'text or audio',
    'texto o audio',
  ],
  'Idioma de la aplicación': [
    'idioma',
    'idioma de la aplicacion',
    'app language',
    'language settings',
    'app language settings',
  ],
  'Fuentes y alcance': [
    'fuentes y alcance',
    'fuentes',
    'sources and scope',
    'data sources',
    'fuentes de datos',
  ],
};

function extractSectionTopic(question: string) {
  const normalized = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return normalized
    .replace(/^(?:(?:nami|please|por favor) )+/, '')
    .replace(/(?:(?: nami| please| por favor))+$/, '')
    .replace(/^(?:can|could|would) you /, '')
    .replace(
      /^(?:tell me(?: (?:more|a bit|a little))? about|explain(?: (?:to )?me)?(?: about)?|describe|what (?:is there in|can i do in|is|are)|how (?:do i(?: use)?|does)|where (?:is|do i find)|(?:me )?(?:hablas|cuentas|explicas) (?:de|sobre)|hablame (?:de|sobre)|cuentame (?:de|sobre)|explicame(?: (?:de|sobre))?|describeme|que (?:es|hay en|puedo hacer en)|para que sirve|como (?:uso|funciona)|donde (?:esta|encuentro)) /,
      '',
    )
    .replace(
      /^(?:(?:the|this|el|la|los|las|section(?: called)?|tab(?: called)?|screen|view|seccion(?: de)?|pantalla(?: de)?|vista(?: de)?|pestana(?: de)?) )+/,
      '',
    )
    .replace(
      / (?:section|tab|screen|view|seccion|pantalla|vista|pestana|work|works|for|about)$/,
      '',
    );
}
