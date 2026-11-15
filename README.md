# ASTRA · Mission Intelligence

Frontend de monitorización de salud de tripulación y contexto ambiental, construido con Next.js App Router, React y TypeScript. Incluye demostración determinista y un consumidor HTTP configurable para sesiones de medición. El frontend personal sigue en demostración; el backend Java incluye consulta y archivo de radiación histórica de NASA RadLab. No hay sensores personales ni IA conectados. Tripulación → Historial incluye una referencia de laboratorio de NASA OSDR preparada a partir de un CSV público.

## Ejecutar

Requisitos: Node.js 22.12+ o Node 24 (recomendado; ver `.nvmrc`), npm y un navegador moderno con WebGL para el visor 3D.

```bash
npm ci
npm run dev
```

Abrir http://127.0.0.1:3000. La raíz abre la portada animada de Qhipa Pacha. «Iniciar mi misión» abre Tripulación en `/mission/crew`.

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm start
# Navegador, después del build (requiere Chrome):
npm run test:e2e
```

Desde la raíz, los scripts delegan al workspace `frontend`. Para cambiar el puerto: `npm run dev -- --port 3001`.

## GitHub Pages

En **Settings → Pages → Source**, selecciona **GitHub Actions**. El workflow **GitHub Pages** publica `frontend/out` con cada cambio en `main` y también se puede ejecutar desde **Actions**.

Para generar esa misma exportación localmente, ejecuta `GITHUB_PAGES=true npm run build`. La compilación usa `/qhipaNasa` como ruta base por defecto. GitHub Actions obtiene la ruta base de la configuración de Pages. El sitio publicado ejecuta la demo en el navegador. Spring Boot requiere un alojamiento propio.

## Funciona en esta versión

- **Tumi flotante** acompaña con movimiento autónomo, arrastre, expresiones y respuestas locales a señales del texto. Puedes escuchar su saludo, ocultarlo o abrir el chat contextual. [Guía de Tumi](docs/development/tumi-ia.md).

- **Centros en Tierra** reúne en un globo los centros de operaciones y apoyo, los sitios de lanzamiento y tres videos históricos. Se abre dentro de Mapa espacial. La ficha muestra la función del lugar, sus fuentes y dónde ocurrió el despegue relacionado. Los enlaces anteriores conservan el sitio seleccionado.

- **Simulación**: «Pérdida de señal» abre el caso de SpO₂ de Elena en Odyssey. La captura rápida muestra el nuevo resultado con su propia hora y conserva los huecos del historial. Para guardar tus respuestas junto a las lecturas de la misión, usa Monitoreo diario.

- Carga animada del Tumi con salto, sonrisa, rebote del tocado y spinner independiente. Introducción breve a pantalla completa solo tras «Iniciar mi misión»; dentro de la app, carga limitada al área de información. Vista permanente en `/loading-preview`.

- Salud por sistemas en Tripulación reúne explicaciones y fuentes HHC, indicadores y registros anteriores. Las observaciones nuevas se añaden desde Monitoreo diario con el área correspondiente.

- Rotación axial de planetas, órbitas ilustrativas de Luna y estación, perspectiva inicial inclinada y pausa global. Al alejarse aparecen el Sol y los ocho planetas, con seguimiento Tierra–Marte y regreso a la misión. Distancias medias en UA; tamaños y tiempos ilustrativos.
- Nuevo [mapa espacial 3D](http://127.0.0.1:3000/explore): Tierra, Luna, Marte, estación y nave seleccionables. Desde cada ficha se entra a su tripulación, indicadores y seguimiento.
- La pestaña «Mapa de Marte» abre el planeta de cerca en `/explore?destination=mars&tab=mars`, con la referencia de Curiosity y el acceso a la tripulación de Ares.
- Cuatro hábitats de demo y 12 personas ficticias distintas. Tierra comparte el contexto de Aurora, sin duplicar personas; Odyssey permanece en tránsito. Los cuatro hábitats comparten la navegación de misión.
- Diarios separados por hábitat; la clave original de Odyssey permanece intacta. Selección de destino en URL y alternativa HTML sin WebGL.

- Centro de misión original con sus tres tripulantes ficticios, más perfiles por hábitat.
- Astronauta 3D con rotación, zoom y sensores seleccionables; modelo GLB local con detalles morados y naranjas. Fallback si no hay WebGL o falla el asset.
- Tripulación → Ahora → Nave abre el corte 3D interactivo de Odyssey 01, con cinco módulos, ocupación y lecturas ambientales simuladas. En otros hábitats el botón se llama Base o Estación. Los enlaces antiguos a `/habitat` abren este mismo visor. La distribución de la nave es ilustrativa.
- Debajo del visor del hábitat, «Archivo histórico de la ISS» reúne radiación de NASA RadLab e historial de cabina. «Ver historial de la ISS» reproduce 288 muestras de temperatura del aire, humedad y CO₂ del 20 de agosto de 2018, fecha de la serie publicada de [NASA OSDR EDA](https://visualization.osdr.nasa.gov/eda/). El archivo muestra el ambiente de cabina en el contexto de RR-9. En el mapa, Marte muestra una muestra exterior de Curiosity REMS tomada del [sol 10 de NASA PDS](https://atmos.nmsu.edu/PDS/data/PDS4/msl_rems_bundle/data_calibrated/SOL_00001_00089/SOL00010/), con temperatura convertida de kelvin a Celsius.
- Frecuencia cardíaca, temperatura, SpO₂ y respiración; historial, unidades, hora UTC, procedencia y calidad de datos visibles.
- **Tripulación → Historial** reúne tendencias, actividad guardada, línea de tiempo, procedencia de cada muestra y la referencia de Inspiration4. «Ver origen» muestra identificador, persona, fecha completa, método y contexto. Contrato cuantitativo independiente de la fuente, con distinción entre datos individuales, agregados y ausentes.
- Escenarios de rutina, cambio de sueño y pérdida de señal. Las muestras ausentes no se reemplazan por valores antiguos ni se interpolan.
- Monitoreo diario de demostración en un solo formulario con sueño, ánimo, fatiga, ejercicio realizado y preguntas de actividad o salud. Adjunta la instantánea sintética del módulo y las lecturas corporales con origen, hora y calidad. Conserva los chequeos anteriores y sus claves.
- Persistencia local de chequeos y revisiones entre recargas, con validación de esquema y manejo de errores de almacenamiento.
- Tumi, guía local que explica lecturas y comparaciones simuladas en el contexto de la actividad y el entorno, y señala controles. [Guía de conocimiento](frontend/src/presentation/features/mission-assistant/README.md).
- Barra inferior compartida por Misión y Mapa espacial. En móvil muestra Mapa espacial, Tripulación y Monitoreo diario. El menú «Más» reúne las demás secciones.

No existe un modo offline completo ni sincronización: el almacenamiento local conserva registros, pero una visita nueva necesita cargar la app. No introducir datos de salud reales en esta demo.

## Arquitectura

El backend ambiental puede ejecutarse aparte con `cd backend`, `./mvnw verify` y `./mvnw spring-boot:run`. Escucha en `127.0.0.1:8080`; Tripulación muestra una serie de referencia archivada de ISS Columbus. La consulta por fecha e instrumento queda disponible en la API Java.

```text
frontend/src/app                      rutas y layouts delgados (servidor)
frontend/src/presentation/features     Screen / hook / View por funcionalidad
frontend/src/presentation/shared/scene adaptador visual 3D, cargado solo en cliente
frontend/src/domain                   modelos, contratos y casos de uso portables
frontend/src/data                     repositorios de simulación y diario local
frontend/src/infrastructure           almacenamiento del navegador y reloj
frontend/src/di                       composición manual de dependencias
frontend/src/ui                       primitivas visuales genéricas
```

Ver [arquitectura compartida](docs/architecture/system.md), [guía de frontend](docs/development/frontend.md) y [siguientes etapas](docs/development/roadmap.md). Los límites de imports entre capas están configurados en ESLint. Ver [verificación y pruebas de navegador](docs/qa/verification.md).

Backend implementado en `backend/`: Java 21 y Spring Boot 3.5.16, con catálogo y consultas históricas de radiación RadLab. Ver [arranque](backend/README.md) y [contrato y uso desde frontend](docs/development/radlab-backend.md). El contrato personal de Monitoreo sigue provisional, sin proveedor ni endpoints Java de salud personal. No hay un backend duplicado en Next.

## Desarrollo en equipo

Empezar por [CONTRIBUTING.md](CONTRIBUTING.md) y [AGENTS.md](AGENTS.md). Las skills compartidas viven en `.agents/skills/` y se distribuyen con el proyecto: no requieren la configuración personal del autor. Cada sección del menú tiene su propia feature; consultar el [mapa de features](docs/development/features-map.md). Para nuevas pantallas y flujos seguir [Screen → ViewModel → View](docs/development/screens-and-flows.md); para definir una entrega usar la [plantilla de feature](docs/development/feature-template.md).

La [propuesta de evolución del dashboard](docs/product/dashboard-proposal.md) relaciona las capturas del reto con las mejoras sugeridas y distingue ideas de funcionalidades implementadas.

## Recursos

La entrega de Tierra y el explorador se documenta en [earth-and-explorer-delivery.md](docs/development/earth-and-explorer-delivery.md). Para usar los planetas, la estación y la nave en otras pantallas, consultar [modelos 3D reutilizables](docs/development/reusable-3d.md): contratos, ejemplo de composición, recursos, atribuciones y límites.

Modelo “Astronaut” de Poly by Google, CC BY 2.0, distribuido en model-viewer. Textura adaptada con los colores de Qhipa Pacha. [Atribución y procedencia](frontend/public/models/ATTRIBUTION.md).

La UI y los escenarios sintéticos son una propuesta del equipo; no implican validación ni respaldo de NASA. Las respuestas ambientales de RadLab conservan su origen, fecha y límites documentados.
