# Confinamiento y aislamiento en Odyssey 01

## Qué queremos observar

El objetivo es ver cómo cambia cada tripulante respecto de su propia rutina y qué estaba ocurriendo en la nave cuando se produjo el cambio. Para identificar **cómo percibe el encierro o el aislamiento**, la fuente directa es su respuesta. Sueño, fatiga, ejercicio, signos vitales y condiciones de cabina aportan contexto. NASA estudia el aislamiento y el confinamiento junto con factores como la pérdida de sueño y la carga de trabajo. [NASA Human Research Program](https://www.nasa.gov/hrp/hazard-isolation-and-confinement/)

### Inventario de datos

| Datos que ya usa Qhipa Pacha | Uso en esta simulación |
| --- | --- |
| Odyssey 01 · telemetría sintética de frecuencia cardíaca, temperatura corporal, SpO₂ y respiración, más ambiente por módulo | Los identificadores, unidades, contexto de microgravedad y valores iniciales del demo sirven de ancla. Las lecturas nuevas son sintéticas y se toman en reposo. La muestra de Mateo durante ejercicio se conserva como contexto histórico del demo. |
| Monitoreo diario · ánimo, fatiga, horas de sueño, ejercicio, actividad, nota y snapshot ambiental y corporal | Se reutilizan las categorías de ánimo y la escala de fatiga. El ejercicio tiene una ventana explícita, el día previo al registro matutino. Los campos nuevos viven en `proposedAnswers`. |
| NASA OSDR EDA · RR‑9, 288 muestras de un día de cabina de la ISS | Se usa la variación local de CO₂, temperatura y humedad. Los valores se reescalan al escenario Odyssey. [NASA OSDR EDA](https://visualization.osdr.nasa.gov/eda/) |
| NASA OSDR · OSD‑575 de Inspiration4 | Referencia histórica de muestras de laboratorio por fase de una misión de tres días. Queda como contexto aparte de esta serie de sueño, ánimo y signos vitales. [NASA OSDR OSD‑575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575) |
| NASA RadLab · radiación ambiental por instrumento | Contexto ambiental histórico. Queda fuera del cálculo del ánimo, del pulso y del seguimiento personal. [NASA OSDR RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/) |

### Preguntas para el chequeo único

Usar una ventana de **últimas 24 horas** y opciones Nada, Poco, Algo, Bastante, Mucho y Prefiero omitir. Registrar 0–4 según respuesta y `null` cuando se omite. Estas preguntas son una propuesta de producto.

1. En las últimas 24 horas, ¿cuánto te afectó tener menos contacto con otras personas?
2. En las últimas 24 horas, ¿cuánto te afectó pasar tiempo en un espacio cerrado?
3. En las últimas 24 horas, ¿cuánto te costó mantener tu rutina?
4. ¿Te gustaría hablar en privado con el equipo de apoyo? Opciones Sí, No y Prefiero omitir.

Las tres primeras preguntas distinguen contacto social, encierro y repercusión en la rutina. La cuarta recoge una petición directa. La nota existente permite describir circunstancias como ruido, carga de trabajo o falta de privacidad. [HERA de NASA](https://www.nasa.gov/mission/hera/) estudia aislamiento y confinamiento en un hábitat análogo. El [estudio de Mars‑520](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0093298) documentó diferencias individuales en ánimo, fatiga y sueño. Aquí se usa esa diferencia entre personas como criterio de diseño. Las preguntas, fechas y distribuciones de la demo son propias.

## Tres trayectorias en 30 días

Periodo del 10 de octubre al 8 de noviembre de 2026, días 13–42 de la misión. La comparación toma la primera y la última semana del mes simulado. Los tres comparten cada noche de cabina y tienen una lectura en reposo antes del chequeo.

| Persona | Sueño medio inicial → final | Días con ejercicio por semana inicial → final | Qué ocurre durante el mes |
| --- | --- | --- | --- |
| Mateo Silva · estable | 7,10 → 7,09 h | 5 → 5 | Percibe el episodio de ruido y mantiene su rutina. |
| Lucía Vega · altibajos y recuperación | 7,40 → 7,34 h | 5 → 5 | En los días 10–16 promedia 6,80 h y llega a 6,0 h el día 13, con carga alta y peor descanso. Recupera su nivel habitual hacia el cierre. |
| Elena Torres · deterioro sostenido | 7,29 → 5,46 h | 5 → 1 | En la última semana reporta ánimo bajo 6 de 7 días, aislamiento medio de 3,43/4 y fatiga media de 4,14/5. Solicita apoyo los días 23 y 29. Su pulso medio en reposo sube de 71,00 a 78,29 lpm en la simulación. |

El **día 13** permite comparar respuestas a una misma noche. Mateo registra 7,1 h de sueño y mantiene su rutina. Lucía registra 6,0 h, fatiga de 4/5 y carga de trabajo alta. Elena registra 6,4 h y describe el encierro como algo que le afectó. Después de que pasa el episodio ambiental, Lucía se recupera y Elena continúa mostrando cambios. La coincidencia de ambiente, signos y respuestas durante el mes sirve para explorar hipótesis. La simulación asignó deliberadamente las trayectorias y carece de evidencia para atribuir una causa.

## Cómo está construida la serie

- **Cabina compartida.** El JSON enlaza 90 registros personales con 30 noches por `nightId`. Cada noche cubre de 23:30 a 07:30 UTC. La telemetría de reposo se simula a las 07:45 y el chequeo se responde a las 08:00. El 10 de octubre es el primer día del archivo y el 8 de noviembre, el último.
- **Anclaje ambiental.** El archivo local `frontend/src/data/environment/iss-rr9-2018-08-20.json` contiene 288 muestras. Sus rangos observados son 3183–4023 ppm de CO₂, 23,3–23,7 °C y 40–41 % de humedad relativa. Para la noche de índice cero `i`, se tomó la fila `i × 9` del mismo día histórico. CO₂ y temperatura se centraron sobre su mediana y se escalaron por la amplitud P90−P10. A las diferencias resultantes se les aplicaron bases de 760 ppm y 22,6 °C, y amplitudes de 180 ppm y 0,7 °C. La humedad se centró en 48 % mediante el doble de su diferencia respecto de la mediana original. Sobre esas variaciones se añadieron dos episodios ficticios de cabina en los días 11–13 y 22–24. El resultado de demo va de 599 a 1186 ppm, de 22,4 a 25,1 °C y de 46 a 51 %. Los valores y amplitudes son parámetros de simulación.
- **Signos en reposo.** Los valores tienen timestamp, unidad y calidad. El pulso de Mateo comienza alrededor de 70 lpm para esta serie en reposo. Los demás indicadores varían ligeramente y pueden solaparse entre personas. Tres muestras de SpO₂ están marcadas como `missing` y quedan en `null`. La serie evita arrastrar una lectura previa como si fuera actual.
- **Respuestas.** Los cambios de ánimo y ejercicio, los días de carga alta y las peticiones de apoyo son eventos de guion. Se pueden omitir respuestas sin que el sistema las convierta en un 0. La fatiga reutiliza la escala 1–5 de la app. El promedio de respuestas ordinales se ofrece como resumen descriptivo de esta demo.

## Cómo usar los archivos

- [Serie JSON](odyssey-30-dias.json) con la referencia, las noches, las lecturas por persona, las preguntas propuestas y el resumen por semanas.
- [Serie CSV](odyssey-30-dias.csv) con 90 filas para filtrar por persona y día. En las columnas de calidad, un valor vacío junto con `missing` identifica una lectura ausente. En las preguntas opcionales, un campo vacío identifica una respuesta omitida.

**Tripulación → Historial → Seguimiento de 30 días** ya muestra la serie de la persona seleccionada en Odyssey 01. El indicador inicial es el ánimo. También se puede explorar sueño, aislamiento, confinamiento, pulso en reposo y CO₂. Para cada día se separan el autorreporte de las 08:00 UTC, los signos en reposo de las 07:45 y la cabina compartida de la noche previa. El selector de tripulante reutiliza el existente.

El botón **Preguntar a Tumi por este día** abre el chat contextual. Tumi describe el autorreporte, plantea qué podría ocurrir si el patrón de ánimo continúa y propone un paso de bienestar. La proyección local usa hasta siete registros previos, incluido el día consultado. Una mayoría marca el patrón de la semana. Si hay menos de siete registros, la respuesta indica que todavía se está conociendo la rutina. Una petición de apoyo en esa ventana da prioridad a sugerir una conversación privada con el equipo.

Con GPT configurado, el contexto incluye un resumen, el día seleccionado, su proyección y los 30 días sintéticos de esa persona. Al hablar de otro día, la IA usa la ventana que termina en ese día. Las notas y los borradores del diario local quedan aparte. Las preguntas nuevas son parte del escenario simulado y se consultan en el historial de la demo.


## Rutas de bienestar en Simulación

En **Simulación → Ruta emocional**, elige el tripulante y un día del mes. La ruta usa hasta siete autorregistros que terminan ese día. Una petición de apoyo o una mayoría de días con ánimo bajo abre la ruta **Atención**, que lleva a Monitoreo diario. Una ventana con buen ánimo todos los días marca **Bienestar**, que lleva al módulo de Tripulación. Las demás combinaciones marcan **Equilibrio**, que lleva al historial. El recuadro indica el ánimo, el sueño y la fatiga del día elegido.

El módulo mostrado junto al modelo corresponde a la instantánea de misión. La serie de confinamiento aporta el contexto de bienestar para la ruta. Las reglas son parte de la demo y dependen de los autorreportes. Si el hábitat carece de la serie, la vista lo indica y deja disponibles los destinos.

La prueba de hábitos permite elegir un resultado ficticio de alimentación, ejercicio y contacto social. Cada opción favorable suma un punto, cada reducción resta uno y la rutina habitual vale cero. Un total de al menos +2 mueve el punto a Feliz, un total de −2 o menos a Triste y el resto a Habitual. Restablecer hábitos vuelve a los autorregistros. La serie registra ejercicio y aislamiento percibido. Las comidas y las conversaciones de la prueba son entradas hipotéticas.
