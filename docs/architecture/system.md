# Arquitectura compartida del proyecto NASA

## Estado y decisiones

Este documento es la fuente compartida para las skills de frontend y backend. Distingue acuerdos, implementación actual y estructura objetivo incremental.

Confirmado por el usuario:

- Frontend: Next.js App Router, React y TypeScript.
- Backend: Java con Spring Boot.
- Ambos: Clean Architecture y SOLID, organización por funcionalidades y composición explícita.
- Referencia estructural: scotia, adaptada de React Native a web y backend; no reutilizar datos ni reglas bancarias.

Alcance trabajado: salud de la tripulación con contexto ambiental de la nave. Frontend implementado en `frontend/`: Next.js 16.4.5, React 19.3.1, TypeScript, Three.js y React Three Fiber. Incluye vistas por hábitat, modelos 3D locales, escenarios sintéticos, historial y monitoreo diario con persistencia en navegador. El explorador `/explore` añade cinco objetos y cuatro hábitats sintéticos con 12 tripulantes únicos. La misión original y su diario se conservan.

Backend ambiental implementado en `backend/`: Java 21/Spring Boot 3.5.16, con consultas RadLab y archivo de respuestas públicas en disco. Operaciones GET `/api/v1/radiation/instruments` y `/api/v1/radiation/readings`; consulta real y caché verificadas con TLS estándar. El frontend todavía no consume estas operaciones. Pendientes: persistencia clínica, autenticación, despliegue, endpoints personales, tiempo real e IA. El copiloto usa un análisis determinista de escenario y no un modelo de IA.

## Responsabilidades y estructura objetivo

| Zona                               | Responsabilidad                                 | Límite                                                  |
| ---------------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| Frontend `src/app`                 | Routing y composición de páginas                | Sin negocio ni acceso directo a persistencia            |
| Frontend `presentation`            | Screen, hook, View y modelos presentables       | Views sin transporte; hooks con casos de uso inyectados |
| Frontend `domain`                  | Entidades, contratos y casos de uso del cliente | TypeScript portable, sin React/Next/fetch               |
| Frontend `data` / `infrastructure` | Mapping de DTOs y adapters de transporte        | No imponer contrato HTTP al backend unilateralmente     |
| Frontend `di`                      | Composición separada servidor/cliente           | Sin secretos en navegador ni instancias cruzando RSC    |
| Backend `<feature>.domain`         | Entidades, invariantes y políticas              | Java puro sin Spring/JPA/Jackson                        |
| Backend `<feature>.application`    | Casos de uso y puertos de salida                | Sin HTTP, persistencia ni dependencias de frontend      |
| Backend `<feature>.adapter.in`     | REST y entradas autorizadas                     | Valida transporte, mapea y delega                       |
| Backend `<feature>.adapter.out`    | Persistencia y servicios externos               | Implementa puertos, no define políticas                 |
| Backend `<feature>.configuration`  | Beans y composición                             | Spring conecta Java puro con adapters                   |

Frontend vive en `frontend/`; la raíz es un workspace npm. Backend vive en `backend/`; su módulo `radiation` sigue domain/application/adapter/configuration. Esta tabla no obliga a crear carpetas vacías. Un único backend modular es el punto de partida; separar despliegues exige una necesidad demostrada.

## Flujo de integración

```text
View -> Screen/hook -> caso de uso cliente -> contrato cliente
 -> adapter HTTP -> controller Spring -> caso de uso servidor
 -> puerto -> adapter externo/persistencia
```

El retorno separa modelo de persistencia, dominio Java, respuesta HTTP, dominio TypeScript y modelo presentable. Un caso de uso cliente coordina interacción; la autoridad sobre reglas persistidas, permisos e integridad corresponde al backend. No replicar esas reglas como autoridad en el navegador.

Un Server Component puede consumir la API Java mediante una composición server-only. El navegador puede consumirla directamente si el esquema de autenticación/origen acordado lo permite. Elegir ese recorrido por feature; no introducir BFF, doble API o acceso a la base de datos desde Next por defecto.

## Contratos compartidos

Monitoreo diario es el único formulario de salud de la tripulación. Las sesiones asistidas anteriores se leen desde Tripulación → Historial. [El contrato personal](../contracts/openapi.yaml) sigue pendiente de proveedor.

Cuando una feature necesite integración, crear o actualizar `docs/contracts/openapi.yaml` como contrato HTTP único y añadir ejemplos sintéticos coherentes. La versión actual contiene operaciones ambientales implementadas y una operación raíz personal todavía provisional; no asumir que un proveedor implementa esta última. Usar una versión OpenAPI compatible con las herramientas seleccionadas. Si se genera desde Java, documentar origen y actualización; evitar mantener dos contratos divergentes.

Para cada operación acordar:

- método, ruta, parámetros, request/response, status y códigos estables de error;
- identificadores (incluido tratamiento de enteros que excedan precisión JS), enums, null/ausencia, fechas ISO 8601 con zona, unidades y precisión;
- límites, orden, paginación y semántica de reintento/idempotencia cuando aplique;
- autenticación, autorización y política CORS/CSRF según el mecanismo elegido.

Java y TypeScript no comparten entidades internas; el contrato de red coordina ambos. Clientes generados, si se adoptan, quedan en data/infrastructure y no llegan a Views. Validar en ambos límites; la validación de UX no sustituye la del servidor.

Si se necesita tiempo real, documentar transporte (SSE/WebSocket), esquema de eventos, timestamp, secuencia/duplicados, reanudación y reconexión. No crear brokers, STOMP o eventos sin un requisito real.

## Cambios coordinados

1. Leer este documento, el contrato existente y consumidores afectados antes de cambiar una frontera.
2. Actualizar contrato, controller/mappers Java y cliente/mappers TypeScript dentro del alcance autorizado. Si el otro componente no existe, registrar lo pendiente y no afirmar integración terminada.
3. Mantener compatibilidad durante cambios aditivos. Para rupturas, migrar consumidores conocidos y documentar la transición; no cambiar nombres o unidades silenciosamente.
4. Validar payloads representativos con pruebas de contrato en ambos lados cuando haya implementación. Incluir entrada inválida y error recuperable; probar un recorrido integrado cuando ambas aplicaciones existan.
5. Actualizar este documento si cambia una decisión o ubicación real; distinguir objetivo, implementado y pendiente.

Las skills se informan mediante este documento común y sus referencias cruzadas. No necesitan cargarse recursivamente entre sí para una tarea interna de una sola capa.

## Implementación de frontend

Los contratos de reutilización de los componentes visuales compartidos están en `docs/development/reusable-3d.md`. `StationModel` reside ahora en `presentation/shared/scene` y no depende de la feature de mapa. `PlanetSurface`, `ShuttleExteriorModel` y `SpaceBackdrop` mantienen el mismo límite visual, sin repositorios ni navegación. El resumen de cambios de Tierra y explorador está en `docs/development/earth-and-explorer-delivery.md`.

El explorador incorpora `launch-sites`, una feature independiente de catálogo histórico de sitios y videos. Screen/ViewModel/View y `LoadLaunchSites -> LaunchSitesRepository -> LocalLaunchSitesRepository`, compuestos en DI. No añade endpoints ni estado al flujo de misión. La URL conserva pestaña y sitio; el globo y el reproductor se cargan bajo demanda. `presentation/shared/scene/PlanetSurface` comparte texturas planetarias locales entre ambos visores, con liberación y fallback. Documentación en `frontend/src/presentation/features/launch-sites/README.md`.

La guía operativa y los ciclos de vida de estado se documentan en `docs/development/frontend.md`. Los siguientes incrementos están en `docs/development/roadmap.md`. `MissionWorkspaceProvider` conserva el estado del flujo entre rutas y compone los casos de uso; el layout y las páginas Next permanecen delgadas.

## Reglas compartidas para nuevas contribuciones

El contrato está en `AGENTS.md` y `frontend/AGENTS.md`; el onboarding está en `CONTRIBUTING.md`. Las skills portables de `.agents/skills/` acompañan al código y conocen la estructura de la otra capa. Para nuevas vistas usar Screen -> useNombreViewModel -> View. El hook `useMission.ts` mantiene el nombre actual como ViewModel de misión; no es un contenedor obligatorio para todas las features. Consultar `docs/development/screens-and-flows.md`.

Las mejoras de producto propuestas a partir de las capturas del reto están en `docs/product/dashboard-proposal.md` y se distinguen de esta implementación actual.

El explorador incluye navegación visual por niveles de zoom y un marco de seguimiento Tierra–Marte, encapsulados en componentes de la feature. El modelo solar es una representación del cliente con radios medios y fases simuladas; no altera entidades ni contratos de misión.

La feature `crew-health` añade Screen/ViewModel/View propios, casos de uso portables y adapter de registro local por hábitat. Consume contexto presentable de misión y mantiene sus registros y revisiones separados del diario previo. Las fuentes HHC son educativas; no hay reglas clínicas ni endpoints de salud implementados. Detalle: `frontend/src/presentation/features/crew-health/README.md`.

Las secciones del menú tienen features de presentación independientes: `space-map`, `mission-overview`, `crew`, `daily-check`, `observations`, `simulation` y `sources`. `mission` coordina el flujo existente, sin una View monolítica. `crew-health` y el historial, incluida la referencia de Inspiration4, se integran en `crew`. Componentes de misión usados entre features viven en `presentation/shared/mission`; `useMission` conserva su nombre y ownership. Ver `docs/development/features-map.md`.

La portada `/` es la feature `landing`, independiente del flujo de misión. Screen traduce navegación; `useLandingViewModel` posee estado visual de movimiento/pausa/logo; View representa el hero y las capas decorativas. Las rutas de misión y sus providers permanecen intactos. Las ilustraciones se sirven localmente desde `public/backgrounds/` y `public/brand/`.

La carga del Tumi es UI compartida en `presentation/shared/loading`, con variantes explícitas `fullscreen` y `content`. La introducción de 3000 ms se inicia únicamente desde el CTA de portada y su ViewModel. El provider de misión conserva la carga real sin retrasos visuales. Los Screens coordinan la navegación con `useTransition` y muestran espera dentro del contenido, preservando el shell. `/loading-preview` es una herramienta de revisión permanente.

Las muestras sintéticas pueden incluir `Sample.measurement`, un contrato cuantitativo portable definido en `domain/measurements/HealthMeasurement.ts`. Los adaptadores lo construyen y presentación prepara su trazabilidad en Historial. La fuente de signos vitales personales todavía no está seleccionada; el contrato interno no los conecta a NASA. La integración ambiental RadLab tiene un contrato separado. Ver `docs/development/measurement-contract.md`.

## Backend ambiental RadLab

La composición conecta `GetRadiationSeries` con `RadLabClient` y `FileRadiationArchive`. Dominio y aplicación son Java puros. El repositorio de archivo conserva CSV original, hash y consultas versionadas mediante actualización atómica; no es una base clínica. No hay borrado automático ni TTL. Solo ISS/Columbus, DosTel1 y DosTel2, periodos históricos de hasta 24 h. No se sigue una redirección ni se desactiva TLS.

La zona de los timestamps originales sin offset se interpreta mediante configuración (UTC por defecto) y se declara como hipótesis, conservando el texto original. No hay dosis personales, inferencias clínicas ni asociación con tripulantes ficticios. CORS permite orígenes de desarrollo explícitos; no implementa autenticación. Contrato único en `docs/contracts/openapi.yaml`, guía de frontend y límites en [radlab-backend.md](../development/radlab-backend.md).
