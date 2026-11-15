# Fabian3 · resumen corporal y foco de radiación

## Base y alcance

`Fabian3` parte de `origin/main` en `7a6633e`. Git no admite espacios, por lo que el nombre solicitado «Fabian 3» se representa como `Fabian3`. Se conserva el trabajo de las ramas anteriores.

El centro de misión adopta una composición inspirada en la referencia visual suministrada: columna de seguimiento, indicadores circulares, astronauta 3D central y contexto lateral, con accesos inferiores. Conserva la paleta Qhipa Pacha, imágenes, modelos y atribuciones existentes. El visor utiliza `MissionSceneSlot` y su fallback; su portal de hotspots permanece independiente. La opción de hábitat, registros y gráficas siguen disponibles.

Los arcos muestran proporción de muestras presentes en la serie de demo, no rangos saludables, porcentajes de salud ni aptitud. Cero cuenta como lectura; null sigue ausente. La ubicación de la persona y el módulo explorado se identifican por separado. Un panel de radiación destacado indica explícitamente que la vista no ha consultado datos ambientales ni dispone de dosimetría personal. No hay llamadas a APIs nuevas en esta entrega.

## Por qué destacar la radiación

NASA describe tres fuentes principales de radiación espacial: partículas atrapadas en el campo magnético terrestre, partículas solares y rayos cósmicos galácticos. Por eso **radiación espacial no equivale a radiación exclusivamente solar**. Una variación en DosTel no identifica por sí sola un evento del Sol. [NASA: Why Space Radiation Matters](https://www.nasa.gov/missions/analog-field-testing/why-space-radiation-matters/).

La radiación merece un espacio destacado porque aporta una dimensión del entorno que pulso, temperatura o SpO₂ no describen directamente. NASA identifica posibles efectos sobre la salud y la importancia de protección y seguimiento de exposición. Eso no convierte estas lecturas en diagnóstico ni permite atribuir un síntoma a radiación. [NASA: Space Radiation](https://www.nasa.gov/directorates/esdmd/hhp/space-radiation/).

Los eventos de partículas solares pueden evolucionar en escalas cortas: NOAA explica que protones energéticos pueden alcanzar las proximidades terrestres en decenas de minutos o menos. Sus escalas de tormentas solares se basan en mediciones de flujo de protones de GOES; no son umbrales clínicos individuales ni dosis dentro de un traje. Esta rapidez justifica presentar contexto solar de forma prominente cuando haya una fuente vigente y aplicable. [NOAA: Solar Radiation Storm](https://www.spaceweather.gov/phenomena/solar-radiation-storm).

La prominencia visual es una decisión de producto, no una clasificación médica universal. No se debe afirmar que radiación es siempre más urgente que hipoxia, lesiones, condiciones ambientales adversas o una alteración personal. La prioridad operativa depende de evidencia vigente y protocolos validados. NASA considera los cinco peligros interrelacionados. [NASA: Five Hazards](https://www.nasa.gov/hrp/hazards/).

## Qué información aporta cada fuente

| Capa                  | Datos y utilidad                                                                                                                  | Límites                                                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| RadLab                | Tasa de dosis absorbida por instrumento, ubicación y fecha; permite explorar variaciones históricas y diferencias instrumentales. | El backend actual solo cubre DosTel1/DosTel2, ISS/Columbus. No identifica origen exclusivamente solar ni mide una persona. |
| Contexto solar futuro | Eventos y análisis de meteorología espacial; permitiría contextualizar temporalmente una serie ambiental.                         | Hay que verificar cobertura, destino, tiempos de propagación y vigencia. Un catálogo de eventos no es dosimetría.          |
| Medición personal     | Sensor individual, actividad, ubicación, síntomas y autorregistros.                                                               | Las fuentes personales todavía están en demo; no vincularlas automáticamente a históricos externos.                        |

[RadLab API](https://visualization.osdr.nasa.gov/radlab/gui/data-api/) distingue tasa de dosis absorbida (µGy/h), tasa de dosis equivalente (µSv/h) y flujo de partículas. Nuestro contrato actual solo transporta la primera. No intercambiar estas magnitudes ni sumar sensores del mismo módulo como si fueran dosis independientes de una persona.

Una posible fuente complementaria es [NASA DONKI](https://ccmc.gsfc.nasa.gov/tools/DONKI/), que ofrece eventos, análisis y API de meteorología espacial. Su página oficial advierte que los datos y simulaciones deben tratarse como información de calidad de prototipo y para investigación. Antes de integrarlo debe acordarse un contrato independiente; no se implementó ese consumidor ni un sistema de alertas solares.

## Contraste con los otros peligros

| Peligro                | Papel en el resumen                                                                               | Datos que lo complementan                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Radiación              | Contexto ambiental destacado, con fecha, instrumento y ausencia explícita de dosimetría personal. | Lecturas instrumentales, eventos solares y eventualmente dosímetro personal.                         |
| Gravedad alterada      | Adaptación y seguimiento durante ejercicio/recuperación.                                          | Actividad y mediciones personales; pruebas específicas para músculo, hueso, equilibrio o visión.     |
| Aislamiento            | Evolución del bienestar, sueño y fatiga.                                                          | Autorregistros protegidos y sensores adecuados; una cifra de pulso no sustituye esa evaluación.      |
| Entorno cerrado        | Condiciones del módulo efectivamente ocupado.                                                     | CO₂, presión, temperatura y otros sensores propios, con ubicación y tiempo.                          |
| Distancia de la Tierra | Continuidad del registro y autonomía de uso.                                                      | Estado de conexión, confirmación de guardado y sincronización; no es un indicador fisiológico único. |

## Próximo recorrido demostrable

1. Seleccionar expresamente ISS/Columbus, instrumento y periodo histórico.
2. Consultar el backend ambiental ya existente y presentar fuente, unidad, cobertura, ausencias y fecha de descarga.
3. Si se incorpora una fuente solar, mostrarla en otra serie temporal con su observador/destino y límites. Conservar los datos de ambos sistemas; una coincidencia no demuestra causalidad.
4. Relacionar datos personales solo con identidades, ubicación y fechas verificadas. No equiparar Aurora conceptual con Columbus real ni datos de Inspiration4 con una misión diferente.
5. Diseñar avisos de disponibilidad, vigencia o anomalías técnicas antes de introducir decisiones clínicas. Los avisos operativos necesitan validación y protocolos explícitos.

El backend conserva timestamps originales sin offset y declara UTC como hipótesis configurable. La convención temporal debe verificarse antes de correlacionar fuentes solares y ambientales. Tampoco calcular dosis acumulada personal integrando estas series sin conocer intervalos, huecos, geometría, blindaje y dosimetría apropiada.

## Implementación frontend

La navegación principal se trasladó a una barra azul inferior fija, con extremos inclinados, iconos y una línea blanca bajo la sección activa. `MissionNavigationDock`, dentro de `MissionShell`, contiene Mapa Espacial, Tierra y las nueve secciones de misión. Reemplaza el menú lateral y el pequeño footer de acciones del resumen; la marca permanece en la cabecera. Conserva rutas, nombres accesibles e identificadores usados por Tumi. En móvil se desplaza horizontalmente y centra la opción activa al entrar; el contenido y el panel de Tumi reservan espacio sobre la barra. El azul pertenece a esta navegación solicitada; los otros colores y assets siguen intactos.

`MissionOverviewScreen → useMissionOverviewViewModel → MissionOverviewView → AstronautOverviewView`. `mapAstronautOverview` prepara cobertura, identidad y entorno desde el modelo presentable existente. La elección de peligro es estado visual local; el hook mantiene su ownership de carga del autorregistro. `MissionDashboardView` recibe un slot opcional `overviewPanel`, con el comportamiento previo como alternativa; Tripulación y Entorno conservan sus composiciones. No se cambia el contrato HTTP ni se duplican reglas Java.

El consumo ambiental de la web sigue pendiente; instrucciones del backend en [radlab-backend.md](../development/radlab-backend.md). El nuevo resumen no presenta conexiones remotas ni valores de radiación inventados.

## Validación

Estado actualizado al 15 de noviembre de 2026: `npm run check` sí se ejecutó mediante Node temporal y aprobó 92 pruebas unitarias, tipos, lint, formato y build. El recorrido general de Mapa aprobó en la suite posterior de 61 casos; los tres fallos de esa ejecución fueron aserciones antiguas del resumen, corregidas y revalidadas en 21 recorridos. Después del ajuste de discreción de Tumi, sus 11 recorridos aprobaron sobre otro build actualizado. El alcance completo está en [la entrega de consola y Tumi](../development/mission-console-delivery.md). Los párrafos siguientes conservan el historial de verificaciones iniciales, no pendientes actuales.

Tipos, ESLint, formato y build aprobados; 89 pruebas unitarias aprobadas. La primera pasada de navegador aprobó 15/16 casos y detectó que el balanceo habilitado con el encuadre transparente impedía la estabilidad del clic en un hotspot. Se retiró esa opción del resumen, conservando el visor existente y la rotación manual; no se debilitó la prueba. Tras reconstruir, los siete casos de Resumen/Misión aprobaron, incluidos escritorio, móvil, recarga, navegación, pérdida del modelo y selección de sensores. Los nueve casos de Tripulación/holograma habían aprobado en la pasada anterior; sus composiciones no se alteraron.

`npm run check` no arrancó porque npm no está disponible en esta terminal. Las herramientas instaladas se ejecutaron directamente con Node; Playwright probó el build actualizado. Se conservaron las capturas QA previas. Nuevas capturas: `docs/qa/astronaut-overview-desktop.png`, `astronaut-overview-mobile.png` y `astronaut-overview-mobile-fallback.png`.

### Navegación inferior

Tras integrar la barra se aprobaron ESLint, formato, build con comprobación de tipos y las 89 pruebas unitarias. La pasada de navegador de Resumen, Mapa, Carga, Misión y Navegación aprobó 20 de 21 casos. Queda un fallo reproducible en el recorrido largo del mapa: al pasar de Selene a Aurora, la lista de tripulación no alcanza cuatro elementos dentro de los cinco segundos de la aserción; la captura posterior sí muestra Aurora y sus cuatro personas. No se modificó esa aserción ni se considera aprobado el recorrido. Una repetición sobre el build actualizado volvió a aprobar los dos casos de la barra (escritorio y móvil con recarga y Tumi). Capturas: `docs/qa/navigation-dock-desktop.png` y `navigation-dock-mobile.png`.
