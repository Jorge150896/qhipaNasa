# ASTRA · Mission Intelligence

Frontend de monitorización de salud de tripulación y contexto ambiental, construido con Next.js App Router, React y TypeScript. La aplicación implementa un modo de demostración determinista: no está conectada a sensores, NASA, una IA ni un backend.

## Ejecutar

Requisitos: Node.js 22.12+ o Node 24 (recomendado; ver `.nvmrc`), npm y un navegador moderno con WebGL para el visor 3D.

```bash
npm ci
npm run dev
```

Abrir http://127.0.0.1:3000. La raíz lleva a `/mission/overview`.

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

- Salud por siete sistemas corporales en Tripulación: explicaciones y fuentes HHC, contexto, comparación descriptiva de series, autorregistros e historial, revisión documental y análisis explicable de cada persona. Los registros de salud tienen almacenamiento separado del diario anterior.

- Rotación axial de planetas, órbitas ilustrativas de Luna y estación, perspectiva inicial inclinada y pausa global. Al alejarse aparecen el Sol y los ocho planetas, con seguimiento Tierra–Marte y regreso a la misión. Distancias medias en UA; tamaños y tiempos ilustrativos.
- Nuevo [mapa espacial 3D](http://127.0.0.1:3000/explore): Tierra, Luna, Marte, estación y nave seleccionables. Desde cada ficha se entra a su tripulación, indicadores y seguimiento.
- Cuatro hábitats de demo y 12 personas ficticias distintas. Tierra comparte el contexto de Aurora, sin duplicar personas; Odyssey permanece en tránsito. La misión original y sus ocho secciones se conservan.
- Diarios separados por hábitat; la clave original de Odyssey permanece intacta. Selección de destino en URL y alternativa HTML sin WebGL.

- Centro de misión original con sus tres tripulantes ficticios, más perfiles por hábitat.
- Astronauta 3D con rotación, zoom y sensores seleccionables; modelo GLB local de unos 305 KB. Fallback si no hay WebGL o falla el asset.
- Nave 3D estilizada con zonas seleccionables y lecturas ambientales. Su distribución es conceptual, no un plano técnico del transbordador.
- Frecuencia cardíaca, temperatura, SpO₂ y respiración; historial, unidades, hora UTC, procedencia y calidad de datos visibles.
- Escenarios de rutina, cambio de sueño y pérdida de señal. Las muestras ausentes no se reemplazan por valores antiguos ni se interpolan.
- Chequeo diario de demostración con sueño, ánimo y fatiga; seguimiento de observaciones.
- Persistencia local de chequeos y revisiones entre recargas, con validación de esquema y manejo de errores de almacenamiento.
- Copiloto explicativo determinista con evidencia y límites, identificado como demo.
- Navegación por ocho secciones, rutas directas, estados de carga/error/vacío, responsive y controles accesibles.

No existe un modo offline completo ni sincronización: el almacenamiento local conserva registros, pero una visita nueva necesita cargar la app. No introducir datos de salud reales en esta demo.

## Arquitectura

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

Backend acordado: Java con Spring Boot. Su implementación y el contrato HTTP quedan pendientes; no hay endpoints ficticios ni un backend duplicado en Next.

## Desarrollo en equipo

Empezar por [CONTRIBUTING.md](CONTRIBUTING.md) y [AGENTS.md](AGENTS.md). Las skills compartidas viven en `.agents/skills/` y se distribuyen con el proyecto: no requieren la configuración personal del autor. Cada sección del menú tiene su propia feature; consultar el [mapa de features](docs/development/features-map.md). Para nuevas pantallas y flujos seguir [Screen → ViewModel → View](docs/development/screens-and-flows.md); para definir una entrega usar la [plantilla de feature](docs/development/feature-template.md).

La [propuesta de evolución del dashboard](docs/product/dashboard-proposal.md) relaciona las capturas del reto con las mejoras sugeridas y distingue ideas de funcionalidades implementadas.

## Recursos

Modelo “Astronaut” de Poly by Google, CC BY 2.0, distribuido en model-viewer. Textura redimensionada y comprimida; geometría sin cambios. [Atribución y procedencia](frontend/public/models/ATTRIBUTION.md).

La UI y todas las mediciones son una propuesta del equipo; no implican validación o respaldo de NASA. Los recursos científicos del reto deben seleccionarse y documentarse antes de una entrega oficial.
