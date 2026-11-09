# Salud por sistemas basada en recursos HHC

## Implementado

La vista de tripulación conserva la experiencia anterior y añade una sección de salud por sistemas: cardiovascular, ejercicio/aparato locomotor, visión, equilibrio/coordinación, nutrición, inmunidad y EVA. Los puntos del astronauta permiten entrar en visión, ejercicio y cardiovascular; la navegación HTML siempre ofrece las siete áreas.

Cada área reúne explicación, mediciones disponibles, calidad, referencia de la misma serie, contexto de actividad y misión, autorregistros, historial, información ausente, seguimiento documental y fuente. Se puede volver al astronauta, abrir las series originales, el chequeo diario y las observaciones de misión.

| Área | Disponible en esta demo | Datos que siguen ausentes |
|---|---|---|
| Cardiovascular | Pulso, SpO₂ y respiración sintéticos; contexto y serie | ECG, presión arterial, evaluación cardiovascular |
| Ejercicio | Pulso/respiración de contexto, actividad y duración autorregistradas | Fuerza, pruebas funcionales, densidad ósea |
| Visión | Autorregistro explícito y seguimiento documental | Agudeza medida, imágenes, evaluación de SANS |
| Equilibrio | Observación escrita con contexto | Evaluación instrumental vestibular |
| Nutrición | Registro cualitativo y seguimiento | Ingesta cuantificada, analítica y plan nutricional |
| Inmunidad | Temperatura de contexto y autorregistro | Biomarcadores o confirmación de infección |
| EVA | Señales personales disponibles y contexto de misión | Sensores del traje, presión y preparación EVA |

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
