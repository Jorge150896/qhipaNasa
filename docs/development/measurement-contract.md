# Mediciones cuantitativas y procedencia

## Implementado

`frontend/src/domain/measurements/HealthMeasurement.ts` define un contrato portable para mediciones numéricas. No depende de React, Next, storage ni un dataset NASA. Identifica muestra, indicador, valor, unidad, sujeto, tiempo, fuente, método y calidad.

- Sujeto individual: identificador explícito, sin inferir identidad ni características por nombre o apariencia del holograma.
- Sujeto agregado: grupo, cantidad de muestras y estadístico. Un agregado no se asigna automáticamente a un tripulante ficticio.
- Tiempo: instante con zona horaria o fase documentada. Una fase de estudio no se convierte en una fecha inventada.
- Fuente: sintética, dispositivo, autorregistro o investigación. El método puede ser simulado, instrumental, autorregistro, derivado o no documentado.
- Calidad: disponible, antigua o ausente. Ausencia se representa con null y no con cero; disponibilidad no significa normalidad médica.
- Contexto opcional: actividad y ubicación de una instantánea con su propia fecha. No acredita la actividad durante todas las muestras anteriores.

`createHealthMeasurement` valida coherencia numérica, unidades frente a una definición explícita, identidad, tiempo y rotulación de simulaciones y autorregistros. No aplica umbrales clínicos ni convierte unidades. Es una validación de objetos internos tipados; todo adaptador externo debe decodificar y validar el payload recibido como desconocido antes de construirlos; Monitoreo ya realiza esta validación en su consumidor HTTP. El contrato es cuantitativo: imágenes y texto libre conservarán contratos propios cuando se defina su fuente.

## Recorrido actual

```text
SimulatedMissionRepository / SimulatedHabitatMissionRepository
  -> withSyntheticMeasurements
  -> Sample.measurement (metadatos normalizados)
  -> mapMissionPresentation / mapMeasurementTrace
  -> HistoryView: Ver origen
```

Los campos anteriores de Sample permanecen compatibles con los consumidores de gráficas y escenas. El adaptador genera metadatos a partir de esos mismos valores. Al construir otro hábitat recalcula sujeto y origen para no heredar la identidad del escenario de Odyssey.

El historial conserva sus paneles, gráfica y tabla. Cada fila permite consultar el identificador, sujeto, fecha completa, unidad, método, fuente y contexto. Usa componentes HTML nativos y estilos privados que heredan los tokens existentes; no modifica la paleta, navegación, hologramas, CSS global ni la disposición de las pantallas. Una procedencia ausente se presenta como no documentada, sin inventar una fuente.

La referencia NASA ya incluida sigue separada de estas muestras sintéticas. No hay importador NASA ni conexión a sensores implementados por esta entrega. La operación de creación de backend interrumpida no dejó un backend aplicado en el repositorio. No se han alterado claves, esquema o datos del diario en el navegador.

## Decisiones pendientes de la fuente

Cuando se conozcan los archivos, API o equipos, definir su adaptador, identificadores, unidades originales, significado de calidad, frecuencia, desfases de reloj, autorización y transformaciones. Los identificadores de archivo, fila, versión y hash solo deben mostrarse cuando existan y se hayan verificado. El contrato HTTP con Java se definirá con esa integración; este documento no inventa endpoints ni sustituye el backend acordado.

La sesión de medición asistida ya está implementada como una feature independiente: seleccionar actividad/equipo, confirmar condiciones, capturar, repetir y guardar intentos. Demo y API son modos separados; el consumidor HTTP tiene un contrato provisional pendiente del proveedor. Ver [monitoreo](monitoring.md). La utilidad y precisión instrumental deben comprobarse en pruebas controladas. El holograma puede guiar la interacción, pero su geometría no mide ni valida resultados.

## Validación de esta entrega

TypeScript, ESLint, formato, build y 56 pruebas unitarias aprobados. Los 28 E2E existentes aprobaron; el nuevo recorrido de procedencia se corrigió para contemplar la abreviatura regional «nov.». Tras integrar el detalle dentro de la columna Origen se reconstruyó la app y aprobaron las seis pruebas de historial/misión, incluida trazabilidad, cambio de persona, ausencia y recarga móvil. `npm run check` no pudo arrancar por ausencia de npm en la terminal; las herramientas correspondientes se ejecutaron directamente con el Node disponible.
