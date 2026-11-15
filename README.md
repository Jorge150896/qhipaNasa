# ASTRA · Mission Intelligence

Frontend de monitorización de salud de tripulación y contexto ambiental, construido con Next.js App Router, React y TypeScript. Incluye demostración determinista y un consumidor HTTP configurable para sesiones de medición. El frontend personal sigue en demostración; el backend Java incluye consulta y archivo de radiación histórica de NASA RadLab. No hay sensores personales ni IA conectados. Historial incluye una referencia de laboratorio de NASA OSDR preparada a partir de un CSV público.

## Ejecutar

Requisitos: Node.js 22.12+ o Node 24 (recomendado; ver `.nvmrc`), npm y un navegador moderno con WebGL para el visor 3D.

```bash
npm ci
npm run dev
```

Abrir http://127.0.0.1:3000. La raíz abre la portada animada de Qhipa Pacha. El dashboard sigue disponible en `/mission/overview`.

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

## Funciona en esta versión

- Opción «Ver todo de la Tierra» al seleccionar Tierra, disponible en su tarjeta, marcador 3D y pestaña «Todo de la Tierra». Abre `/explore?destination=earth&tab=earth`, con el directorio de ocho lugares, sus funciones, los tres videos históricos y el globo interactivo. Elegir un lugar o video abre su tarjeta y conserva la selección en la URL.

- Pestaña «Despegues de la Tierra» en `/explore?destination=earth&tab=launches`: Kennedy, Vandenberg y Kourou, más las sedes NASA Headquarters, Johnson, Goddard, Marshall y JPL. Cada lugar abre una tarjeta con nombre completo, ciudad, función, fuentes y un video histórico de despegue relacionado, indicando dónde ocurrió realmente. Símbolos distintos y cards individuales junto a los puntos visibles; lista equivalente sin 3D. La URL conserva el sitio; los videos externos requieren conexión. Texturas locales de Solar System Scope / INOVE (CC BY 4.0). Aurora sigue siendo una estación ficticia.

- **Monitoreo asistido**: preparar equipo/contexto, capturar, repetir, consultar cada 5 s, revisar y guardar sesiones locales. Calidad, ausencia, origen, tiempo y comparación por indicador. Demo explícita y modo API sin fallback; [configuración y límites](docs/development/monitoring.md), [contrato provisional](docs/contracts/openapi.yaml).

- Carga animada del Tumi con salto, sonrisa, rebote del tocado y spinner independiente. Introducción a pantalla completa de 3 segundos solo tras «Iniciar mi misión»; dentro de la app, carga limitada al área de información. Vista permanente en `/loading-preview`.

- Salud por siete sistemas corporales en Tripulación: explicaciones y fuentes HHC, contexto, comparación descriptiva de series, autoevaluación guiada con confirmación, historial y siguientes pasos, revisión documental y análisis explicable de cada persona. Los registros de salud tienen almacenamiento separado del diario anterior.

- Rotación axial de planetas, órbitas ilustrativas de Luna y estación, perspectiva inicial inclinada y pausa global. Al alejarse aparecen el Sol y los ocho planetas, con seguimiento Tierra–Marte y regreso a la misión. Distancias medias en UA; tamaños y tiempos ilustrativos.
- Nuevo [mapa espacial 3D](http://127.0.0.1:3000/explore): Tierra, Luna, Marte, estación y nave seleccionables. Desde cada ficha se entra a su tripulación, indicadores y seguimiento.
- Cuatro hábitats de demo y 12 personas ficticias distintas. Tierra comparte el contexto de Aurora, sin duplicar personas; Odyssey permanece en tránsito. La misión original y sus ocho secciones se conservan.
- Diarios separados por hábitat; la clave original de Odyssey permanece intacta. Selección de destino en URL y alternativa HTML sin WebGL.

- Centro de misión con astronauta central, cobertura de muestras, seguimiento y contexto ambiental; perfiles ficticios por hábitat. Las secciones comparten el estilo de consola y una barra inferior adaptable a móvil. [Entrega y validaciones](docs/development/mission-console-delivery.md).
- Astronauta 3D con rotación, zoom y sensores seleccionables; modelo GLB local con detalles morados y naranjas. Fallback si no hay WebGL o falla el asset.
- Odyssey 01 en corte 3D interactivo dentro de Tripulación, con cinco módulos, ubicación del tripulante y lecturas ambientales simuladas. La distribución de la nave es ilustrativa.
- Frecuencia cardíaca, temperatura, SpO₂ y respiración; historial, unidades, hora UTC, procedencia y calidad de datos visibles.
- «Ver origen» por muestra en Historial: identificador, persona, fecha completa, método y contexto. Contrato cuantitativo independiente de la fuente, con distinción entre datos individuales, agregados y ausentes.
- Escenarios de rutina, cambio de sueño y pérdida de señal. Las muestras ausentes no se reemplazan por valores antiguos ni se interpolan.
- Chequeo diario de demostración con sueño, ánimo y fatiga; seguimiento de observaciones.
- Persistencia local de chequeos y revisiones entre recargas, con validación de esquema y manejo de errores de almacenamiento.
- Tumi, guía local disponible entre secciones, hábitats, Mapa y Tierra. Explica el apartado abierto y las lecturas simuladas; la ayuda por puntero espera una pausa y se limita a controles con explicación específica. Conversación en memoria hasta recargar. [Guía de conocimiento y uso](frontend/src/presentation/features/mission-assistant/README.md).
- Navegación por nueve secciones, rutas directas, estados de carga/error/vacío, responsive y controles accesibles.

No existe un modo offline completo ni sincronización: el almacenamiento local conserva registros, pero una visita nueva necesita cargar la app. No introducir datos de salud reales en esta demo.

## Arquitectura

El backend ambiental puede ejecutarse aparte con `cd backend`, `./mvnw verify` y `./mvnw spring-boot:run`. Escucha en `127.0.0.1:8080`; el frontend aún no consume esas nuevas operaciones.

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
