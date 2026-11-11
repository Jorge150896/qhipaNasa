# Arquitectura compartida del proyecto NASA

## Estado y decisiones

Este documento es la fuente compartida para las skills de frontend y backend. Distingue acuerdos, implementación actual y estructura objetivo incremental.

Confirmado por el usuario:

- Frontend: Next.js App Router, React y TypeScript.
- Backend: Java con Spring Boot.
- Ambos: Clean Architecture y SOLID, organización por funcionalidades y composición explícita.
- Referencia estructural: scotia, adaptada de React Native a web y backend; no reutilizar datos ni reglas bancarias.

Alcance trabajado: salud de la tripulación con contexto ambiental de la nave. Frontend implementado en `frontend/`: Next.js 16.4.5, React 19.3.1, TypeScript, Three.js y React Three Fiber. Incluye ocho secciones por hábitat, modelos 3D locales, escenarios sintéticos, historial, chequeo diario y revisión de observaciones con persistencia en navegador. El explorador `/explore` añade cinco objetos y cuatro hábitats sintéticos con 12 tripulantes únicos. La misión original y su diario se conservan.

Pendiente: backend Java/Spring Boot, base de datos, autenticación, despliegue, endpoints, tiempo real, datos científicos e IA. No generar esas integraciones por anticipado. No hay endpoints implementados. El copiloto usa un análisis determinista de escenario y no un modelo de IA.

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

Frontend vive en `frontend/`; la raíz es un workspace npm. Backend todavía no existe. Esta tabla no obliga a crear carpetas vacías. Un único backend modular es el punto de partida; separar despliegues exige una necesidad demostrada.

## Flujo de integración

```text
View -> Screen/hook -> caso de uso cliente -> contrato cliente
 -> adapter HTTP -> controller Spring -> caso de uso servidor
 -> puerto -> adapter externo/persistencia
```

El retorno separa modelo de persistencia, dominio Java, respuesta HTTP, dominio TypeScript y modelo presentable. Un caso de uso cliente coordina interacción; la autoridad sobre reglas persistidas, permisos e integridad corresponde al backend. No replicar esas reglas como autoridad en el navegador.

Un Server Component puede consumir la API Java mediante una composición server-only. El navegador puede consumirla directamente si el esquema de autenticación/origen acordado lo permite. Elegir ese recorrido por feature; no introducir BFF, doble API o acceso a la base de datos desde Next por defecto.

## Contratos compartidos

Cuando una feature necesite integración, crear o actualizar `docs/contracts/openapi.yaml` como contrato HTTP único y añadir ejemplos sintéticos coherentes. Ese archivo aún no existe: no asumir rutas o campos antes de definirlos. Usar una versión OpenAPI compatible con las herramientas seleccionadas. Si se genera desde Java, documentar origen y actualización; evitar mantener dos contratos divergentes.

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

La guía operativa y los ciclos de vida de estado se documentan en `docs/development/frontend.md`. Los siguientes incrementos están en `docs/development/roadmap.md`. `MissionWorkspaceProvider` conserva el estado del flujo entre rutas y compone los casos de uso; el layout y las páginas Next permanecen delgadas.

## Reglas compartidas para nuevas contribuciones

El contrato está en `AGENTS.md` y `frontend/AGENTS.md`; el onboarding está en `CONTRIBUTING.md`. Las skills portables de `.agents/skills/` acompañan al código y conocen la estructura de la otra capa. Para nuevas vistas usar Screen -> useNombreViewModel -> View. El hook `useMission.ts` mantiene el nombre actual como ViewModel de misión; no es un contenedor obligatorio para todas las features. Consultar `docs/development/screens-and-flows.md`.

Las mejoras de producto propuestas a partir de las capturas del reto están en `docs/product/dashboard-proposal.md` y se distinguen de esta implementación actual.

El explorador incluye navegación visual por niveles de zoom y un marco de seguimiento Tierra–Marte, encapsulados en componentes de la feature. El modelo solar es una representación del cliente con radios medios y fases simuladas; no altera entidades ni contratos de misión.

La feature `crew-health` añade Screen/ViewModel/View propios, casos de uso portables y adapter de registro local por hábitat. Consume contexto presentable de misión y mantiene sus registros y revisiones separados del diario previo. Las fuentes HHC son educativas; no hay reglas clínicas ni endpoints de salud implementados. Detalle: `frontend/src/presentation/features/crew-health/README.md`.

Las secciones del menú tienen features de presentación independientes: `space-map`, `mission-overview`, `crew`, `habitat`, `history`, `daily-check`, `observations`, `simulation` y `sources`. `mission` coordina el flujo existente, sin una View monolítica. `crew-health` es una subfuncionalidad integrada en `crew`. Componentes de misión usados entre features viven en `presentation/shared/mission`; `useMission` conserva su nombre y ownership. Ver `docs/development/features-map.md`.

La portada `/` es la feature `landing`, independiente del flujo de misión. Screen traduce navegación; `useLandingViewModel` posee estado visual de movimiento/pausa/logo; View representa el hero y las capas decorativas. Las rutas de misión y sus providers permanecen intactos. Las ilustraciones se sirven localmente desde `public/backgrounds/` y `public/brand/`.

La carga del Tumi es UI compartida en `presentation/shared/loading`, con variantes explícitas `fullscreen` y `content`. La introducción de 3000 ms se inicia únicamente desde el CTA de portada y su ViewModel. El provider de misión conserva la carga real sin retrasos visuales. Los Screens coordinan la navegación con `useTransition` y muestran espera dentro del contenido, preservando el shell. `/loading-preview` es una herramienta de revisión permanente.
