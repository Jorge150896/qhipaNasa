# Salud de la tripulación por sistemas

Feature integrada de forma aditiva en `/mission/crew` y `/missions/:habitatId/crew`. Conserva los sensores, astronauta, gráficos, diario y navegación de misión.

## Flujo y propietarios

`CrewScreen` conecta `useCrewViewModel`, que conserva la selección visual del área y pasa un contexto presentable a `CrewHealthScreen`. Los puntos de ojos/músculos del astronauta y los controles HTML abren el mismo detalle; FC conserva su selección de sensor y permite abrir cardiovascular. El enlace al panel y el retorno al astronauta funcionan sin manipular el visor.

`CrewHealthScreen -> useCrewHealthViewModel -> CrewHealthView`, con `types.ts`, mapper y formulario privado. DI compone `LoadCrewHealth`, `RecordCrewHealth` y `ReviewCrewHealth` con el adapter local. El provider y `useMission` existentes no reciben el estado de esta feature.

La selección de área permanece mientras vive la Screen; el borrador se reinicia al cambiar persona o sistema. El hook carga el registro y descarta cargas al desmontar. Las escrituras capturan persona/área al comenzar; los mensajes se muestran únicamente en su scope. Seleccionar otra persona filtra datos, observaciones y análisis, sin cambiar de lugar a nadie.

## Persistencia

Writer/reader: `LocalCrewHealthRepository`, clave `astra.demo.health.v1:<habitatId>`, esquema versionado validado con Zod. Entries con UUID y hora UTC; revisión documental por persona/sistema/día UTC. El diario anterior conserva su clave y formato sin migraciones.

Máximo: 500 entradas y 1500 revisiones por hábitat. Al superar capacidad o fallar escritura se informa un error sin borrar registros ni anunciar éxito. Un formato incompatible permanece intacto y deshabilita escrituras hasta poder leerlo. Los sensores y la explicación siguen accesibles. Sin sincronización ni backend de salud.

## Interpretación

Fuentes educativas: NASA Human Health Countermeasures y su lista de riesgos. Los textos y fuentes se curan en `constants.ts`; no se descargan ni ejecutan instrucciones desde páginas externas.

Se distinguen mediciones sintéticas, autorregistros y revisión documental. El estado inicial es «Sin autoevaluación registrada» y el formulario inicia en «No evaluado». Cero minutos explícitos y duración ausente son valores distintos. Reportar un cambio requiere contexto escrito.

Las métricas se comparan con la primera muestra disponible de su misma serie, sin llamarla baseline clínico. Una señal ausente conserva el histórico y no produce cambio actual. Visión no inventa agudeza ni SANS; ejercicio no estima densidad ósea ni masa muscular; EVA no convierte lecturas del hábitat en datos del traje. La agenda es documental, no un plan prescrito.

El resumen conjunto deriva evidencia y pendientes de esa persona con reglas de demo; no hay IA, diagnóstico, triaje clínico ni medicamentos. Evaluaciones, criterios médicos y backend Java siguen pendientes.

## Explicación visual

`HealthSystemIllustration` es un componente privado de presentación con siete esquemas SVG locales animados. Los pasos «En el espacio», «Qué observar» y «Qué no concluye» muestran una explicación breve reutilizando el contenido educativo del sistema. El área pendiente permanece visible; las explicaciones adicionales y la fuente científica están en un desplegable.

La selección de paso y pausa son estado puramente visual, se reinician al cambiar de sistema y no escriben registros ni modifican sensores. Las animaciones tienen cadencia ilustrativa independiente de las mediciones, se pueden pausar y respetan `prefers-reduced-motion`. Son anatomía simplificada, sin simulación fisiológica ni inferencia sobre la persona. Al ser SVG, funcionan sin WebGL ni descarga de modelos; los controles y el visor 3D previo se conservan.
