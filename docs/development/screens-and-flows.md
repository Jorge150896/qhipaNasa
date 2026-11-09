# Pantallas, ViewModels y flujos

## Patrón de trabajo

La arquitectura sigue el reparto de responsabilidades observado en scotia. En ASTRA los hooks nuevos se nombran explícitamente `use<Nombre>ViewModel`. No significa crear una clase ViewModel ni copiar dependencias de React Native.

```text
Route/Page
  -> FeatureScreen
       -> useFeatureViewModel(dependencies)
       -> FeatureView(data, callbacks)

useFeatureViewModel -> UseCase -> Repository contract
                                     ^ implementación en data
```

El hook devuelve datos y acciones; Screen los conecta a la View. La View no conoce cómo se obtuvieron los datos.

| Pieza                  | Contiene                                                                                  | No contiene                                        |
| ---------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------- |
| Route/Page             | Parámetros de ruta, límites Next y montaje de Screen                                      | Negocio, HTTP o lógica completa de pantalla        |
| Screen                 | Dependencias, hook, composición visual, navegación y modales                              | Fetch, storage, SDKs y reglas del dominio          |
| useFeatureViewModel    | Estado, acciones, derivaciones, validación de UX, cancelación y ejecución de casos de uso | JSX, router o construcción de repositorios         |
| types.ts               | Modelo presentable `FeatureData` y callbacks locales                                      | DTOs externos o dependencias de infraestructura    |
| View                   | HTML accesible, datos preparados y callbacks de intención                                 | Repositorios, rutas, casos de uso, HTTP o secretos |
| Mapper de presentación | Formatos, etiquetas y estados a partir de dominio                                         | Transporte o reglas persistidas del servidor       |
| Use Case               | Operación de aplicación y reglas portables necesarias                                     | React, Next, URLs o mecanismos técnicos            |
| Factory/DI             | Conexión de contratos con implementaciones                                                | Negocio o transformación de respuestas             |

## Nueva vista simple

Ejemplo de nombres para una futura vista de detalle, no una feature ya implementada:

```text
src/presentation/features/crew/detail/
  CrewDetailScreen.tsx
  useCrewDetailViewModel.ts
  types.ts
  components/
    CrewDetailView.tsx
```

`CrewDetailData` describe datos listos para la vista. La View recibe `data` y callbacks como `onOpenHistory` o `onRetry`. Screen traduce una intención de navegación a la ruta correspondiente. El ViewModel recibe, por ejemplo, un caso de uso de carga; no busca dependencias globales.

Añadir `constants.ts` si hay colecciones/copys presentacionales reales, mapper si la conversión lo necesita y factory si existen dependencias que componer. No crear un Controller paralelo ni cuatro archivos vacíos para representar una pantalla estática.

## Flujos de varias pantallas

```text
src/presentation/features/<feature>/<flow>/
  use<Flow>ViewModel.ts                 solo si existe estado compartido real
  use<Flow>Navigation.ts                solo si hay varias transiciones
  components/                          compartidos de este flujo
  <step-one>/
    FeatureFlowStepOneScreen.tsx
    useFeatureFlowStepOneViewModel.ts
    types.ts
    components/FeatureFlowStepOneView.tsx
  <step-two>/
    ...
```

No generar todos estos archivos automáticamente. Cada pantalla conserva su Screen/ViewModel/View cuando posee lógica propia. Si un flujo comparte estado, decidir si basta elevarlo a su dueño o si requiere un provider; no introducir un store global por defecto.

Antes de implementarlo, dejar claro:

- Cómo se entra, avanza, vuelve, termina y cancela el flujo.
- Qué estado es local a una pantalla y cuál cruza pasos.
- Quién escribe/lee cada estado y cuándo se limpia.
- Qué sucede con recarga, URL directa o acceso sin un paso anterior.
- Cómo se cancelan operaciones y se descartan respuestas obsoletas.
- Qué pasa ante guardado fallido, error recuperable o datos ausentes.

Estas decisiones viven en el README local del flujo cuando sean necesarias para mantenerlo. No hay un número obligatorio de providers, factories o casos de uso.

## Referencia implementada: misión

En `frontend/src/presentation/features/mission/`:

- `MissionScreen.tsx` conecta navegación, carga/error y shell. `MissionFeatureScreen.tsx` elige el Screen de cada sección.
- `useMission.ts` es el ViewModel existente del flujo. Conserva ese nombre para evitar un refactor ajeno a una feature nueva.
- `MissionWorkspaceProvider.tsx` compone dependencias y conserva estado entre rutas de misión.
- `mapMissionPresentation.ts` prepara `MissionData`.
- Las features `mission-overview`, `crew`, `habitat`, `history`, `daily-check`, `observations`, `simulation` y `sources` poseen sus Screens y Views. El dashboard compartido vive en `presentation/shared/mission/`.
- `frontend/src/di/createMissionDependencies.client.ts` conecta casos de uso con repositorios de simulación y diario local.

El caso real no exige que una nueva feature amplíe `useMission` ni que copie todas sus dependencias. Extraer una feature independiente cuando tenga estado y responsabilidades propios; compartir únicamente lo que tenga consumidores reales.

## SOLID al revisar una pantalla

Comprobar que cambiar una fuente de datos afecte al adapter/composición y no a View; que cada hook reciba contratos pequeños; que una implementación conserve unidades, ausencia, errores y cancelación; que reglas y transporte no aparezcan en componentes. Evitar interfaces, herencia y factories que no aporten un límite real.

Para coordinar Java consultar `docs/architecture/system.md` y las referencias cruzadas de las skills locales. El servidor conserva autoridad sobre permisos y datos persistidos.

La organización por menú implementada está en [features-map.md](features-map.md). `useMission` conserva el estado del flujo compartido y las operaciones existentes; `useCrewViewModel` administra la selección corporal privada de Tripulación. `useMissionDashboardViewModel` comparte el modo visual entre los tres consumidores del dashboard. No se agregan hooks vacíos a pantallas que consumen el modelo existente ni a Fuentes, que es estática.
