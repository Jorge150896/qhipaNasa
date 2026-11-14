# Propuesta de evolución de ASTRA: salud comprensible y seguimiento

## Base de la propuesta

El usuario aportó capturas de los apartados «Objetivos» y «Consideraciones potenciales» del reto de salud de astronautas. Son material de referencia para el producto; los comentarios ajenos visibles en las capturas no forman parte de los requisitos.

De los objetivos se desprende una herramienta visual para apoyar la autoevaluación durante la misión, interpretar indicadores y ofrecer orientación sobre bienestar y tratamientos fundamentados. La entrada puede ser manual, mediante sensores o imágenes que representen indicadores de salud. La interfaz debe ayudar a comprender la información, sin asumir formación médica completa.

Las consideraciones potenciales están marcadas como opcionales: varios entornos, recordatorios, gamificación, gráficos y colores son opciones de diseño, no requisitos que obliguen a implementar todo. La figura humana interactiva se plantea como una posibilidad de interfaz, no una exigencia de precisión anatómica.

Esta es una propuesta de producto; no autoriza por sí sola a implementar todos los módulos ni define protocolos clínicos. El estado implementado sigue siendo el descrito en `docs/architecture/system.md`.

## Problema que resolver en el siguiente incremento

ASTRA ya permite seleccionar un astronauta, ver lecturas, consultar ambiente, historial y registrar chequeos. Su siguiente mejora debería responder de forma conectada a:

1. ¿Qué indicador estoy viendo y por qué importa durante una misión?
2. ¿Cómo cambió respecto del historial de esta persona y en qué contexto?
3. ¿Tengo datos suficientes y fiables para interpretarlo?
4. ¿Qué debería revisar o registrar a continuación, según una fuente o protocolo identificado?
5. ¿Se hizo la revisión y qué ocurrió después?

El valor del 3D será navegar y comprender, con una alternativa HTML equivalente. Los modelos de traje y nave son representaciones visuales de contexto; su geometría no produce mediciones ni valida un diagnóstico.

## Distribución propuesta del dashboard

| Zona visual                         | Contenido y acción principal                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Cabecera                            | Persona, ubicación, actividad, entorno de misión y vigencia de los datos                                                  |
| Franja de atención                  | Revisiones pendientes, mediciones faltantes y rutina próxima; prioridad solo si existe criterio definido                  |
| Centro: explorador corporal         | Astronauta/cuerpo con regiones seleccionables; abre el detalle de un indicador o sistema                                  |
| Lateral: detalle contextual         | Medición, unidad, fecha, procedencia, calidad, tendencia, explicación y referencia                                        |
| Contexto ambiental                  | Zona ocupada y mediciones ambientales alineadas en tiempo; distingue la zona explorada de la ubicación real de la persona |
| Parte inferior: plan de seguimiento | Chequeos, recordatorios, revisión de observaciones y resultados de la acción                                              |
| Copiloto                            | Qué observó, evidencia, explicaciones posibles, información faltante y siguiente revisión propuesta                       |

En móvil, apilar los bloques y priorizar selección de persona, atención pendiente y detalle del indicador. El modelo 3D se mantiene disponible, pero el usuario no necesita manipularlo para acceder a una lectura o completar un chequeo.

## Features propuestas y aceptación

### P1 · Ficha comprensible de cada indicador

Al pulsar una región corporal, mostrar una ficha que explique qué se mide, por qué se recopila, cómo se registró, qué limita su interpretación y dónde está su fuente. La tarjeta combina valor y contexto; no muestra solo un número.

Aceptar cuando cada indicador tenga unidad, hora, calidad, procedencia y explicación; al faltar una muestra, indicarlo sin reutilizarla como dato actual. Las asociaciones de la región del modelo con un sensor son visuales y se explican como tales.

Para la primera entrega usar los indicadores ya implementados. La vista anatómica más detallada puede incorporarse después con un asset adecuado; no hace falta bloquear la ficha por ese modelo.

### P1 · Autoevaluación guiada

Evolucionar el chequeo diario a un flujo breve: elegir persona -> registrar sueño/ánimo/fatiga y otras entradas acordadas -> revisar datos -> confirmar -> consultar resultado. Los campos adicionales se seleccionan por utilidad y fundamento, no para llenar un formulario.

Aceptar cuando se entienda por qué se pide cada dato, se vean sus unidades, se pueda corregir antes de confirmar y un guardado fallido no se anuncie como exitoso. Conservar la identificación de demo y la persistencia local hasta implementar el backend.

### P1 · Historial personal y contexto sincronizado

Mostrar el mismo indicador de la misma persona a lo largo del tiempo, junto con actividad, ubicación y datos ambientales que correspondan al mismo periodo. Incorporar una línea de base personal solo cuando haya una fuente y método definidos.

Aceptar cuando se pueda seleccionar un periodo, ver muestras ausentes y distinguir referencia personal de límite clínico. No comparar indiscriminadamente personas ni presentar el cambio de escenario actual como una línea de base clínica previa al vuelo. Una coincidencia ambiental no se etiqueta como causa.

### P1 · Del hallazgo a una revisión verificable

Ampliar el seguimiento con estados claros: pendiente de medición, pendiente de revisión, revisión registrada y seguimiento completado. Una observación debe permitir consultar evidencia, registrar una acción y ver su resultado posterior.

Aceptar cuando existan historial y propietario de la revisión y no se confunda «revisada» con «problema médico resuelto». Reglas de prioridad clínica o escalamiento requieren un protocolo identificado; la demo puede mostrar el flujo con reglas sintéticas explícitas.

### P1 · Copiloto con fuentes y límites

Cada salida del copiloto tendrá: observación, evidencia con timestamps, contexto considerado, datos faltantes, siguiente revisión y fuentes. Si se incorpora IA generativa, diferenciar la explicación del modelo de los datos medidos y de las reglas aprobadas.

Aceptar cuando las fuentes respalden lo que se afirma y el usuario pueda inspeccionarlas. Si faltan datos o contenido autorizado, la salida debe indicarlo. No generar tratamientos, medicamentos o dosis libremente a partir de una lectura.

Para responder a la orientación sobre tratamientos del reto, preparar una biblioteca de procedimientos con fuente, versión, aplicabilidad y revisión de un responsable clínico. El copiloto podría recuperar el procedimiento pertinente con sus límites; eso es una integración futura, no una capacidad actual ni una garantía de validez por usar IA.

### P2 · Rutina y recordatorios

Mostrar tareas de medición y bienestar por persona, hora prevista y estado. Abrir el formulario o guía correspondiente desde el recordatorio; registrar completar, posponer u omitir con motivo cuando se defina esa necesidad.

La gamificación opcional puede reconocer constancia en el registro. No premiar «mejores números» de salud ni presentar un marcador de cumplimiento como puntuación clínica.

### P2 · Contextos de misión

Añadir nave, estación, rover o base como contextos explícitos con procedencia y configuración propias, si aportan a los escenarios seleccionados. Mostrar la relación con la persona y sus datos.

No cambiar únicamente una etiqueta para afirmar que se simulan condiciones de la Luna/Marte ni inventar exposición a radiación. Cada escenario necesita entradas, simplificaciones y límites documentados.

### P3 · Imágenes y mediciones ampliadas

Permitir adjuntar una imagen de un examen o registrar otros indicadores cuando exista un caso concreto. Mostrar origen, fecha, tipo de examen, unidad si corresponde y estado de revisión. La imagen de una cámara no se trata automáticamente como termómetro, glucómetro o examen médico.

La interpretación automática de imágenes queda como integración especializada posterior; la primera versión podría permitir registro y consulta sin diagnosticar.

## Cómo utilizar el Human Research Program

NASA organiza los peligros del vuelo humano en cinco grupos: radiación espacial, aislamiento/confinamiento, distancia de la Tierra, campos de gravedad y ambientes cerrados u hostiles. Esto aporta un marco de contexto, no umbrales clínicos para las tarjetas de ASTRA. [NASA: cinco peligros](https://www.nasa.gov/hrp/hazards/).

Propuestas de diseño derivadas de ese marco, que requieren seleccionar recursos específicos antes de establecer reglas:

| Contexto                  | Aplicación propuesta                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Aislamiento/confinamiento | Registro de sueño y bienestar, con privacidad de las respuestas                                            |
| Distancia de la Tierra    | Consulta local de información aprobada y preparación de un reporte para revisión                           |
| Gravedad                  | Registro de actividad y contexto de misión; contenido educativo sustentado                                 |
| Ambiente cerrado          | Línea de tiempo con entorno y mediciones de la persona, sin inferir causalidad                             |
| Radiación                 | Explicaciones y registro solo si hay una fuente/dosímetro adecuado; no estimarla desde pulso o temperatura |

Separar los recursos de conocimiento de las mediciones: un documento HRP puede fundamentar una explicación, pero no es la fuente de las lecturas sintéticas del dashboard. La aceptación de datasets y reglas debe contrastarse con los recursos definitivos del reto. [Human Research Program](https://www.nasa.gov/hrp/).

## Entrega recomendada para la siguiente demo

Conservar el diseño espacial y los modelos existentes. Implementar primero una ficha explicativa, el flujo de autoevaluación con confirmación y el seguimiento de una observación, conectados al historial. Añadir el copiloto con fuentes cuando exista el contenido verificado que debe recuperar.

Recorrido demostrable: seleccionar a Elena -> consultar sueño y contexto -> abrir explicación -> completar chequeo -> revisar la observación -> registrar seguimiento. El escenario seguirá identificado como sintético.

## Reparto sugerido entre compañeros

| Feature               | Responsabilidad acotada                     | Frontera a acordar                           |
| --------------------- | ------------------------------------------- | -------------------------------------------- |
| Ficha del indicador   | Screen/ViewModel/View y contenido educativo | Props del indicador y referencia del recurso |
| Autoevaluación guiada | Pantallas y estado del flujo                | Contrato del diario y confirmación           |
| Historial/contexto    | Selección de periodo y series alineadas     | Timestamps, ausencia de datos y procedencia  |
| Seguimiento           | Estado de revisión e historial de acciones  | Estados y significado de cada transición     |
| Conocimiento/copiloto | Fuentes, salida explicable y límites        | Esquema del análisis y contenido autorizado  |

Seguir `CONTRIBUTING.md` y `docs/development/screens-and-flows.md`: cada nueva vista con lógica tiene Screen -> useNombreViewModel -> View; el estado compartido pertenece al flujo que lo necesita. Evitar que todos los compañeros editen `useMission` o el provider central para features independientes.

## Explorador espacial como entrada al dashboard

La nueva idea de seleccionar mundos, estación y nave se analiza en [mission-explorer-proposal.md](mission-explorer-proposal.md). Propone navegación por contexto -> hábitat -> tripulación, con procedencia y disponibilidad explícitas y reutilización de los indicadores existentes. Es una propuesta adicional, no una funcionalidad ya implementada.
