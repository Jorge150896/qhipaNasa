# Salud de la tripulación por sistemas

Feature integrada de forma aditiva en `/mission/crew` y `/missions/:habitatId/crew`. Reúne el visor, las lecturas y la autoevaluación en Tripulación. La gráfica interactiva del indicador seleccionado se mantiene debajo del visor. Al elegir una región o un sensor, una ficha HTML contextual aparece junto al astronauta en escritorio y debajo del modelo en pantallas estrechas. El pecho, la zona de los ojos y una pierna permiten selección directa en el modelo. La selección se resalta en 3D y los accesos HTML abren la misma ficha si el modelo falla. La tarjeta prioriza la lectura o el último autorregistro, muestra su hora o fecha y ofrece una acción principal. Ver detalles reúne el contexto completo, la procedencia y los accesos secundarios. Al seleccionar una zona, la cámara se aproxima con suavidad sin anular el giro manual. Con movimiento reducido solo se aplica el resaltado. En Visión, Ver detalles ilustra tres actividades para orientar la observación. En Ejercicio, Ver detalles carga un modelo procedural de bicicleta estática o equipo de resistencia cuando la actividad registrada identifica ese equipo. La sesión sigue siendo consultable sin WebGL. Cada sensor abre su propia tendencia en la tarjeta. El punto Resp. abre la frecuencia respiratoria desde el tórax del astronauta. Visión y Ejercicio muestran el último autorregistro de la persona y el área seleccionadas, con accesos al formulario y al historial. La tarjeta y el historial leen el mismo diario local. El selector de telemetría de Tripulación permite cambiar entre Pulso, Temperatura, SpO₂ y Respiración desde la gráfica. Entorno, chequeo diario, observaciones e historial completo siguen disponibles en sus secciones.

## Flujo y propietarios

`CrewScreen` conecta `useCrewViewModel`, que conserva la selección visual del área y pasa un contexto presentable a `CrewHealthScreen`. Los puntos de sistema del astronauta y los controles HTML seleccionan el mismo detalle. Los sensores de pulso, oxígeno y respiración seleccionan Cardiovascular y la temperatura selecciona Inmunidad. El enlace al panel y el retorno al astronauta funcionan sin manipular el visor.

`CrewHealthScreen -> useCrewHealthViewModel -> CrewHealthView`, con `types.ts`, mapper y formulario privado. DI compone `LoadCrewHealth`, `RecordCrewHealth` y `ReviewCrewHealth` con el adapter local. El provider y `useMission` existentes no reciben el estado de esta feature.

La selección de área permanece mientras vive la Screen. Cada área presenta una pregunta de autoevaluación. El formulario muestra un resumen editable antes de guardar; el borrador se reinicia al cambiar persona o sistema. El siguiente paso se actualiza a partir del último registro y de la disponibilidad de las lecturas del área. El hook carga el registro y descarta cargas al desmontar. Las escrituras capturan persona/área al comenzar; los mensajes se muestran únicamente en su scope. Seleccionar otra persona filtra datos, observaciones y análisis, sin cambiar de lugar a nadie.

## Persistencia

Writer/reader: `LocalCrewHealthRepository`, clave `astra.demo.health.v1:<habitatId>`, esquema versionado validado con Zod. Entries con UUID y hora UTC; revisión documental por persona/sistema/día UTC. Si se guarda un registro posterior, la revisión del área vuelve a aparecer pendiente. El diario anterior conserva su clave y formato sin migraciones.

Máximo: 500 entradas y 1500 revisiones por hábitat. Al superar capacidad o fallar escritura se informa un error sin borrar registros ni anunciar éxito. Un formato incompatible permanece intacto y deshabilita escrituras hasta poder leerlo. Los sensores y la explicación siguen accesibles. Sin sincronización ni backend de salud.

## Interpretación

Fuentes educativas: NASA Human Health Countermeasures y su lista de riesgos. Los textos y fuentes se curan en `constants.ts`; no se descargan ni ejecutan instrucciones desde páginas externas.

Se distinguen mediciones sintéticas, autorregistros y revisión documental. El estado inicial es «Sin autoevaluación registrada» y el formulario inicia en «No evaluado». Cero minutos explícitos y duración ausente son valores distintos. Reportar un cambio requiere contexto escrito.

Las métricas se comparan con la primera muestra disponible de su misma serie, sin llamarla baseline clínico. Una señal ausente conserva el histórico y no produce cambio actual. Visión no inventa agudeza ni SANS; ejercicio no estima densidad ósea ni masa muscular; EVA no convierte lecturas del hábitat en datos del traje. La agenda es documental, no un plan prescrito.

El resumen conjunto deriva evidencia y pendientes de esa persona con reglas de demo; no hay IA, diagnóstico, triaje clínico ni medicamentos. Evaluaciones, criterios médicos y backend Java siguen pendientes.

## Explicación visual

`HealthSystemIllustration` es un componente privado de presentación con siete esquemas SVG locales animados. Los pasos «En el espacio», «Qué observar» y «Qué no concluye» muestran una explicación breve reutilizando el contenido educativo del sistema. Los indicadores y su historial se muestran primero. El esquema, las explicaciones adicionales y la fuente científica se consultan en un desplegable.

La selección de paso y pausa son estado puramente visual, se reinician al cambiar de sistema y no escriben registros ni modifican sensores. Las animaciones tienen cadencia ilustrativa independiente de las mediciones, se pueden pausar y respetan `prefers-reduced-motion`. Son anatomía simplificada, sin simulación fisiológica ni inferencia sobre la persona. Al ser SVG, funcionan sin WebGL ni descarga de modelos; los controles y el visor 3D previo se conservan.

## Nave y módulos

Tripulación muestra un corte conceptual de Odyssey con cabina de mando, descanso, ejercicio, laboratorio y soporte vital. El visor ocupa todo el ancho del explorador y, en pantallas estrechas, los puntos numerados corresponden a los botones debajo de la nave. Al entrar se selecciona el módulo asignado al tripulante. El marcador naranja representa su ubicación en la instantánea de misión y se mantiene al explorar otro módulo. Al seleccionar un espacio se muestran su propósito, sus condiciones y sus ocupantes. Las lecturas simuladas comparten la fecha UTC de la instantánea. Los botones HTML siguen funcionando sin WebGL. Estación y base usan sus modelos conceptuales con los mismos controles.

Tripulación mantiene una gráfica de telemetría visible a la vez. El historial de Visión ordena observaciones por fecha y Ejercicio compara las duraciones informadas de las sesiones recientes con acceso a su detalle.

## Línea de tiempo de Tripulación

La vista reúne la actividad de la instantánea, los cinco autorregistros más recientes de la persona y el detalle de la muestra seleccionada en la gráfica. Los cruces de telemetría con actividad, ubicación y ambiente usan el timestamp completo de la instantánea simulada. Las demás muestras quedan visibles con su hora y valor o su estado ausente. Un autorregistro guarda la hora de creación y admite un módulo reportado opcional. Los registros anteriores siguen siendo compatibles y los autorregistros no se vinculan a lecturas ambientales por cercanía temporal.

El ViewModel de Tripulación conserva el momento seleccionado por persona y escenario. «Ubicar módulo en el visor» usa el mismo selector de zonas y devuelve el foco al explorador. La tarjeta del visor identifica sus propias lecturas como instantánea y permite volver a la línea de tiempo.

«Comparar dos muestras» habilita dos selectores para el indicador activo. También se pueden usar los botones de muestras de la gráfica. Cada tarjeta conserva su hora UTC y muestra solo el contexto registrado para ese instante. La diferencia es la segunda lectura menos la primera y solo aparece si ambas tienen valor. El modo se reinicia al cambiar de persona, indicador o escenario.

Al abrir un módulo desde una muestra, un autorregistro o la comparación, Tripulación conserva el origen y la hora sobre el visor. El módulo reportado se distingue de la ubicación y las lecturas de la instantánea simulada. Cambiar de persona o escenario, o entrar directamente al visor desde sus pestañas, limpia ese origen. Los controles del encuadre permiten acercarse al módulo seleccionado y volver a la vista completa. El giro manual interrumpe la transición y la preferencia de movimiento reducido aplica el encuadre de inmediato. Con el 3D indisponible, el origen y los controles HTML de módulos siguen disponibles.

El formulario de Visión ofrece tres actividades ilustradas y una opción para dejar el campo sin indicar. La actividad elegida adapta la pregunta de la nota y aparece en la confirmación, el historial y la línea de tiempo. El diario local admite el campo opcional `visionActivityId` en el esquema existente. «Ver mi registro» se habilita tras guardar y abre la entrada por su identificador, incluso si su hora queda fuera de los cinco registros recientes.

«Sincronizar con el visor» abre el hábitat y vincula la muestra seleccionada de la gráfica con el módulo registrado para esa hora. Las muestras sin ubicación se muestran sin marcador de ocupación ni lecturas ambientales. Elegir un módulo manualmente o cambiar de indicador devuelve el control al explorador habitual.

Tripulación ofrece tres accesos en la misma página: Ahora (explorador y lecturas), Historial (serie, contexto y comparación) y Autoevaluación (autorregistro por área). Los indicadores de apoyo de Autoevaluación se consultan bajo demanda. La ficha de una lectura abre Tumi con la persona, el indicador y la instantánea simulada correspondiente.

En el visor del hábitat, la silueta naranja identifica el módulo donde se registró al tripulante y la marca lila identifica el módulo que se está explorando. Ambos símbolos pueden coincidir y se repiten en los controles HTML. Si una muestra histórica carece de ubicación, el visor no muestra una posición para esa hora.

En el explorador corporal, los selectores muestran icono y nombre del indicador. Tanto el selector como su punto en el astronauta abren la misma ficha de lectura. La ficha empieza cerrada. En escritorio los selectores quedan a la izquierda y la ficha a la derecha del visor. En móvil se ordenan como selectores, visor y ficha.
