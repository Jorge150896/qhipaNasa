---
name: next-react-clean-architecture
description: Desarrolla y revisa el frontend del proyecto NASA con Next.js, React y TypeScript usando Clean Architecture, SOLID y los patrones de scotia adaptados a web. Aplicar a pantallas, flujos, componentes, estado, contratos y arquitectura de este proyecto; coordina contratos con el backend Java y Spring Boot sin duplicar su negocio.
---

# Next.js + React: arquitectura escalable para NASA

## Intención y alcance

Construir un frontend mantenible siguiendo la separación real de `scotia`, adaptada a Next.js App Router. Escalabilidad significa límites claros, cambios localizados y dependencias reemplazables; no generar capas o paquetes futuros.

El usuario confirmó Next.js + React y backend Java con Spring Boot, ambos con Clean Architecture y SOLID. ASTRA ya implementa un frontend de salud de tripulación y contexto ambiental con datos sintéticos; el backend Java todavía está pendiente. Consultar las versiones y el estado real en package-lock.json y docs/architecture/system.md. Implementar la funcionalidad solicitada; definir contratos cuando esa funcionalidad necesite integración. No introducir Server Actions ni BFF por anticipado ni duplicar reglas del servidor.

## Contexto y decisiones

- Leer `AGENTS.md`, `CONTRIBUTING.md`, `frontend/AGENTS.md`, README, package.json, lockfile y documentación aplicable del proyecto antes de editar; respetar sus versiones y convenciones existentes.
- Leer [referencia-scotia.md](references/referencia-scotia.md) al iniciar una base, modificar arquitectura o resolver una separación de responsabilidades. Es una síntesis autosuficiente de documentación y código inspeccionados; el repositorio original no es una dependencia del frontend.
- Leer [next-boundaries.md](references/next-boundaries.md) al modificar rutas, carga de datos, DI, estado o límites servidor/cliente.
- Leer `docs/architecture/system.md` desde la raíz del proyecto NASA: fuente compartida de decisiones y estructura objetivo. Localizarla desde la raíz actual si cambia la ubicación.
- Leer [backend-integration.md](references/backend-integration.md) al tocar contratos, APIs, eventos o arquitectura conjunta.
- Revisar una feature vecina y el UI kit antes de crear patrones. Implementar solo lo pedido y sus dependencias necesarias.
- Comunicar brevemente el cambio, las zonas afectadas y la validación; al finalizar informar resultado, checks y limitaciones reales.

## Código existente como referencia

El frontend vive en `frontend/`; las rutas `src/` de esta skill son relativas a esa carpeta. Antes de una nueva feature revisar `MissionScreen.tsx`, `useMission.ts`, `MissionFeatureScreen.tsx` y `mapMissionPresentation.ts` en `frontend/src/presentation/features/mission/`, además de `frontend/src/di/createMissionDependencies.client.ts`. Las secciones del menú tienen features propias: consultar `docs/development/features-map.md`, `crew/CrewScreen.tsx` y `presentation/shared/mission/MissionDashboardView.tsx`. Son referencias reales, no una obligación de ampliar el hook o provider central para toda funcionalidad nueva. Colocar una feature independiente en su propia carpeta y compartir solo contratos o estado con consumidores reales.

Las skills de `.agents/skills/` son la referencia compartida del proyecto. Si existe una copia personal con el mismo nombre, leer y aplicar expresamente esta versión local. Leer `docs/architecture/system.md` para conocer Java y `docs/development/feature-template.md` cuando se necesite definir una entrega.

## Capas y dependencias obligatorias

```text
src/app/                 rutas, layouts y estados de ruta delgados
src/presentation/        Screens, hooks, Views y modelos presentables
src/domain/              entidades, reglas, contratos y casos de uso
src/data/                DTOs, validación de respuestas, mappers, repositorios
src/infrastructure/      HTTP, streams, storage y SDKs detrás de adapters
src/di/                  composición manual por entorno
src/state/               estado compartido solo cuando hay consumidores reales
```

Materializar únicamente directorios necesarios. Para mantener afinidad con scotia, los casos de uso viven en `domain/usecases/`; no agregar otra capa `application/` con la misma responsabilidad.

Dirección de imports:

- `presentation -> domain`; no importar repositorios concretos ni HTTP desde hooks o Views.
- `data -> domain` y contratos técnicos mínimos de infrastructure cuando hagan falta.
- `infrastructure` implementa mecanismos; no importa presentation, data ni composition roots.
- `domain` no importa React, Next, DOM, fetch, almacenamiento ni SDKs. Usar tipos portables; `AbortSignal` puede aparecer como contrato de cancelación sin acoplar el dominio a un transporte.
- `di` ensambla implementaciones, sin reglas de negocio. Rutas y Screens acceden a los puntos de entrada de composición apropiados para su entorno.
- No usar barrels que introduzcan ciclos o mezclen módulos de servidor con módulos de navegador.

## Patrón de presentación

Para cada vista/flujo nuevo con lógica real aplicar Screen -> hook ViewModel -> View, con `types.ts`. Nombrar los hooks nuevos `use<Nombre>ViewModel`; `useMission.ts` conserva su nombre histórico y cumple ese papel en el flujo ya implementado. Leer `docs/development/screens-and-flows.md` para la organización por feature/flujo/paso, propiedad del estado y navegación. No crear Controller, ViewModel vacío o un único hook global para todas las features.

Para una pantalla interactiva con responsabilidades reales:

```text
route -> FeatureScreen -> useFeatureViewModel -> FeatureView
                         -> UseCase -> Repository (contrato)
                                       ^ implementación en data
```

Las flechas describen colaboración; el hook prepara props que Screen entrega a View. La View nunca invoca un caso de uso.

```text
src/presentation/features/<feature>/<flow>/<screen>/
  FeatureFlowScreen.tsx
  useFeatureFlowViewModel.ts
  types.ts
  components/FeatureFlowView.tsx
  createFeatureFlowDependencies.client.ts   solo si necesita composición local
  README.md                               si hay contratos/flujos que explicar
```

- Screen conecta dependencias, hook, navegación sencilla y View. No hace fetch, lee storage ni usa SDKs directamente.
- Hook recibe casos de uso/adapters ya compuestos; administra estado, acciones, cancelación y modelos `FeatureData`. No navega, renderiza ni instancia repositorios.
- View recibe `data` y callbacks explícitos; renderiza HTML accesible. No conoce endpoints, DTOs, Next router, repositorios ni reglas de negocio. Interacciones puramente visuales pueden permanecer locales.
- Preparar formatos, etiquetas de negocio y unidades antes de View. Evitar mezclar entidades con DTOs o cadenas ya formateadas.
- Componentes privados junto a su pantalla; compartidos de flujo en el flujo; compartidos de negocio en `presentation/shared`; genéricos en el UI kit existente, o `src/ui` al empezar. Extraer `packages/ui` solo ante una frontera reusable real.
- Usar navegación por intención (`onOpenDetail(id)`); Screen traduce a rutas. Coordinator de flujo solo si hay varias transiciones que lo justifican.
- Pantallas estáticas o resueltas en servidor no requieren hooks, factories ni archivos vacíos. Seguir los límites de Next indicados en la referencia.

## SOLID aplicado

- **SRP:** separar representación, estado, reglas, mapping, transporte y composición. Dividir por motivos de cambio reales.
- **OCP:** incorporar una nueva fuente de datos implementando el contrato consumido; no añadir condicionales de proveedor en Views/hooks.
- **LSP:** adapters intercambiables conservan semántica de unidades, errores, cancelación y orden de resultados. No retornar éxitos falsos para ocultar capacidades ausentes.
- **ISP:** contratos pequeños por capacidad usada; evitar `UniversalRepository`, `BaseService` y contratos CRUD de operaciones inexistentes.
- **DIP:** casos de uso dependen de contratos; factories inyectan implementaciones por constructor o argumentos. Evitar service locators y singletons con estado mutable oculto.

Clases y funciones son válidas; no imponer herencia ni contenedores de DI. Factory local para una feature, factory de flujo para dependencias compartidas y `src/di` para composición transversal. Estabilizar dependencias del cliente para evitar recrear suscripciones en cada render.

## Datos y estados

- Definir contratos internos de frontend desde necesidades confirmadas y respetar el contrato HTTP común con Java; no inventar endpoints unilateralmente. Decodificar datos externos como `unknown` y validarlos en la frontera; un genérico TypeScript no valida JSON.
- Errores técnicos se traducen a errores útiles para presentación; no exponer payloads ni trazas.
- Modelar loading, error recuperable, vacío y éxito. Mantener estado local; URL para filtros compartibles. Estado global solo con consumidores distantes reales y propietario/limpieza documentados.
- Cancelar peticiones y descartar resultados obsoletos. Si se solicita tiempo real, encapsular suscripción/cierre/reconexión en un adapter y limitar historial y frecuencia visual; no abrir sockets desde View ni duplicarlos al remontar.
- Con Java/Spring Boot confirmado pero aún sin implementación, trabajar en UI/contratos solicitados y registrar integración pendiente sin simular éxito real. Si se pide una demo funcional, elegir explícitamente un modo de simulación sintético, determinista e identificado, separado en un adapter; no presentarlo como datos NASA reales ni introducir respuestas falsas escondidas en hooks.
- No copiar material bancario, activos, credenciales ni datos privados de scotia. Usar mediciones sintéticas en ejemplos y tests. Señalar origen, timestamp, unidad y vigencia cuando se implementen mediciones; no inventar límites médicos u operativos.

## Alineación con el reto

Al proponer mejoras del producto leer `docs/product/dashboard-proposal.md`. Priorizar autoevaluación comprensible, explicación de indicadores, seguimiento y evidencia. Las consideraciones opcionales del reto no son requisitos obligatorios. No convertir ejemplos, correlaciones ambientales o salidas de demo en diagnóstico, protocolo clínico o tratamiento validado.

## Validación y entrega

- TypeScript estricto; evitar `any`, conversiones forzadas y `eslint-disable` para saltar límites.
- Al implementar la base, hacer cumplir imports entre capas y límites servidor/cliente con la herramienta existente; configurar reglas de imports si forma parte del alcance, sin introducir un parser casero frágil.
- Probar comportamiento proporcional al riesgo: reglas/casos de uso, mappers inválidos, adapter intercambiable, estados de hooks y flujos críticos. React Testing Library para web; no RNTL. Tests E2E si hay integración de rutas/hidratación que lo justifique.
- Revisar accesibilidad por teclado, etiquetas, errores, responsive y estados. Las alertas no dependen solo de color.
- Ejecutar scripts existentes de typecheck, lint, tests pertinentes y build cuando hay cambios de código. Registrar checks no ejecutables; no afirmar que están verdes.
- No heredar los porcentajes de cobertura de scotia ni crear tests de estructura para alcanzarlos. Actualizar documentación si cambian contratos, uso público o límites.
