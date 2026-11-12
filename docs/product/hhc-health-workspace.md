# Salud por sistemas basada en recursos HHC

## Implementado

La vista de tripulación reúne el astronauta 3D y la autoevaluación por sistemas: cardiovascular, ejercicio/aparato locomotor, visión, equilibrio/coordinación, nutrición, inmunidad y EVA. Los puntos del astronauta permiten entrar en visión, ejercicio y cardiovascular; la navegación HTML siempre ofrece las siete áreas.

Cada área reúne explicación, mediciones disponibles, calidad, referencia de la misma serie, contexto de actividad y misión, autorregistros, historial, información ausente, seguimiento documental y fuente. El formulario plantea una pregunta por área y permite revisar y corregir las respuestas antes de guardarlas. La ficha muestra la fecha del último autorregistro y un siguiente paso según el estado reportado y la disponibilidad de las señales. Se puede volver al astronauta, abrir las series originales, el chequeo diario y las observaciones de misión.

| Área | Disponible en esta demo | Datos que siguen ausentes |
|---|---|---|
| Cardiovascular | Pulso, SpO₂ y respiración sintéticos; contexto y serie | ECG, presión arterial, evaluación cardiovascular |
| Ejercicio | Actividad, duración y sensaciones autorregistradas | Fuerza, pruebas funcionales, densidad ósea |
| Visión | Autorregistro explícito y seguimiento documental | Agudeza medida, imágenes, evaluación de SANS |
| Equilibrio | Observación escrita con contexto | Evaluación instrumental vestibular |
| Nutrición | Registro cualitativo y seguimiento | Ingesta cuantificada, analítica y plan nutricional |
| Inmunidad | Temperatura de contexto y autorregistro | Biomarcadores o confirmación de infección |
| EVA | Contexto de misión y observaciones de preparación o retorno | Sensores del traje, presión y preparación EVA |

## Decisiones de producto

Se conserva la separación entre señales, declaraciones del usuario y acciones documentales. No registrar nada no se presenta como salud normal. Un registro marcado «No evaluado» permanece distinguible de «Sin cambios reportados». Completar una revisión no acredita un examen clínico ni una sesión prescrita.

El análisis conjunto identifica datos disponibles, cambios reportados e información faltante de la persona seleccionada. Sus siguientes pasos son de revisión y calidad de información, con límites visibles. La fuente educativa no aporta directamente telemetría ni valida nuestros escenarios o reglas.

Persistencia por hábitat y persona, fuera de las claves del diario existente. Escrituras y lectura fallidas no borran datos. Ver `frontend/src/presentation/features/crew-health/README.md` para flujo y responsabilidades.

## Fuentes y pendientes

- [NASA HHC](https://www.nasa.gov/hrp/human-health-countermeasures/): contexto de contramedidas e investigación.
- [Acerca de HHC](https://www.nasa.gov/reference/about-human-health-countermeasures/): preparación, medidas durante vuelo y recuperación.
- [Riesgos investigados por HHC](https://www.nasa.gov/humans-in-space/hhc-spaceflight-risks/): fundamento educativo de las áreas.

Pendientes: datos reales y su contrato con Java, autenticación, sincronización, evaluaciones instrumentales, planes definidos por el equipo clínico y criterios médicos validados. No hay protocolos de tratamiento ni un modelo de IA conectado.

### Explicaciones visuales implementadas

Los siete sistemas incluyen un esquema SVG animado local, con tres pasos seleccionables y una sola explicación breve visible. Circulación, ojo, movimiento, orientación, nutrición, inmunidad y EVA se representan conceptualmente. No son modelos anatómicos 3D ni simulaciones clínicas; su movimiento no representa el pulso u otra medición de la persona. Pausa manual y movimiento reducido disponibles. Las mediciones, fechas, calidad, información pendiente y registros anteriores permanecen; la explicación extensa y fuente se consultan en un desplegable.

## Historial público de Inspiration4

En la sección **Historial**, una referencia de laboratorio acompaña la telemetría simulada de la tripulación. Se obtuvo de [NASA OSDR · OSD-575](https://osdr.nasa.gov/bio/repo/data/studies/OSD-575), DOI [10.26030/mc5d-p710](https://doi.org/10.26030/mc5d-p710), licencia CC0-1.0. El [CSV transformado](https://osdr.nasa.gov/geode-py/ws/studies/OSD-575/download?source=datamanager&file=LSDS-8_Comprehensive_Metabolic_Panel_CMP_TRANSFORMED.csv) se consultó el 11 de noviembre de 2026.

Para reproducir la referencia, agrupar las filas por el sufijo de fase de `Sample Name` y calcular la mediana aritmética de las cuatro observaciones de cada fase para `glucose_value_milligram_per_deciliter`, `sodium_value_millimol_per_liter` y `potassium_value_millimol_per_liter`. Se verificaron cuatro muestras distintas con los tres valores presentes en cada fase. Las siete fases son L−92, L−44, L−3, R+1, R+45, R+82 y R+194. La fase R+194 figura en el CSV transformado. El archivo consultado tiene SHA-256 `5eb1e7f025dd8443a9e70111e62bc32afae3432753024489c5c013e401d709d9`.

La app empaqueta únicamente medianas por fase. El panel permite cambiar entre glucosa, sodio y potasio y seleccionar una muestra con teclado o puntero. Cada barra representa un punto de muestreo y la distancia entre barras es categórica. El detalle muestra el día relativo a lanzamiento o regreso, la mediana y la unidad. La tabla y las fuentes se abren desde un desplegable. La referencia no participa en las alertas, la autoevaluación ni los diarios de personajes ficticios.
