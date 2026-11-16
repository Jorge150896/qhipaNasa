# Features por sección del menú

En ASTRA cada sección del menú tiene una carpeta de feature propia. Feature es la funcionalidad, Screen conecta el flujo y View dibuja la pantalla. Una feature también puede contener subfuncionalidades; por ejemplo, Tripulación incluye salud por sistemas.

Todas las carpetas de esta tabla están en `frontend/src/presentation/features/`:

| Menú | Carpeta | Screen → View | URL de Odyssey |
| --- | --- | --- | --- |
| Mapa espacial | `space-map/` | `SpaceExplorerScreen` → `SpaceExplorerView` | `/explore` |
| Tripulación | `crew/` | `CrewScreen` → `CrewView` | `/mission/crew` |
| Monitoreo diario | `daily-check/` | `DailyCheckScreen` → `DailyCheckView` | `/mission/journal` |
| Simulación | `simulation/` | `SimulationScreen` → `SimulationView` | `/mission/simulation` |
| Fuentes y alcance | `sources/` | `SourcesScreen` → `SourcesView` | `/mission/sources`, accesible desde Nami |

Otros hábitats conservan `/missions/[habitatId]/[section]` con las mismas secciones. Las rutas anteriores de Entorno e Historial abren la vista correspondiente dentro de Tripulación. `MissionShell` comparte la barra inferior de `MissionNavigationDock` entre misión y explorador. El botón «Más» indica cuando la sección activa está dentro del menú móvil.

## Propiedad del estado y operaciones


- `mission/MissionScreen.tsx`: shell, navegación, mensajes y estados de carga/error. `MissionFeatureScreen.tsx` elige el Screen de cada sección.
- `mission/MissionWorkspaceProvider.tsx` y `mission/useMission.ts`: modelo del flujo existente. Mantienen persona, indicador, zona, escenario, datos, guardado y revisión entre secciones. Salir del hábitat desmonta el provider; los registros persistidos conservan sus claves.
- `space-map/useSpaceExplorerViewModel.ts`: datos, destinos y actualización de registros del mapa.
- `crew/useCrewViewModel.ts`: sistema corporal y modo de visor privados de Tripulación. `crew-health` conserva sus propios casos de uso y `useCrewHealthViewModel` para autorregistros/revisiones por área.
- `presentation/shared/mission/useMissionDashboardViewModel.ts`: modo de visor y etiquetas de hábitat, usado por Tripulación. Se reinicia al salir de la sección.
- Historial, Monitoreo diario y Simulación consumen datos y callbacks del modelo de misión existente. No duplican los casos de uso ni crean ViewModels vacíos. Los formularios conservan sus borradores visuales locales. Fuentes es estática.

Las nuevas funcionalidades autónomas con estado/operaciones usan `NombreScreen.tsx`, `useNombreViewModel.ts`, `types.ts` y `components/NombreView.tsx`. Screen conecta y navega; ViewModel recibe casos de uso inyectados; View representa datos y emite callbacks. Seguir [screens-and-flows.md](screens-and-flows.md).

## Recorridos de misión

- Resumen de misión prioriza los pendientes de la persona seleccionada y enlaza a la observación o al registro correspondiente. «Ubicar mi módulo» abre el visor de Tripulación con la zona de la persona seleccionada. El visor mantiene un selector HTML sincronizado con el visor y una ficha de condiciones y ocupación. También incluye una serie archivada de NASA RadLab.
- Tripulación muestra Ahora e Historial como vistas seleccionables. El enlace directo `#crew-avatar` abre el editor de apariencia. Historial de Tripulación reúne la tendencia, el contexto y origen de cada muestra, la actividad guardada y la referencia de Inspiration4. Las sesiones API conservan su identidad externa. Los registros mantienen sus repositorios y rutas de detalle.
- Tripulación es la entrada de misión. Las antiguas rutas `overview` y `observations` redirigen a Tripulación del mismo hábitat. Simulación muestra el escenario seleccionado y permite repetir la captura de SpO₂ al activar Pérdida de señal. Tierra se abre desde Mapa espacial.

## Dónde trabajar

| Cambio | Ubicación |
| --- | --- |
| Pantalla de una sección | Su feature de la tabla; componentes privados en `components/` |
| Chequeo de sueño, ánimo y fatiga | `daily-check/components/JournalForm.tsx` y `DailyCheckView.tsx`; operación existente en `mission/useMission.ts` |
| Explicación corporal animada | `crew-health/components/HealthSystemIllustration.tsx`; contenido en `crew-health/constants.ts` |
| Tabla del historial | `history/components/HistoryView.tsx` |
| Gráfica y tarjetas compartidas | `presentation/shared/mission/TrendChart.tsx` y `MetricCards.tsx` |
| Astronauta, nave, estaciones y portales 3D | `presentation/shared/scene/`; carga diferida en `presentation/shared/mission/MissionSceneSlot.tsx` |
| Datos/contratos de misión usados por varias vistas | `mission/types.ts`, `mapMissionPresentation.ts`; coordinar consumidores |

Los modelos, dominio, adapters, DI y claves de persistencia no se reorganizan por cada vista. Componentes genéricos siguen en `src/ui`; no moverlos a una sección ni duplicarlos.

## Portada de Qhipa Pacha

`landing/` posee `LandingScreen`, `useLandingViewModel`, `types.ts` y `components/LandingView.tsx`. La ruta `/` presenta la portada y enlaza a las features existentes sin cambiar sus URLs. Recursos y ciclo de movimiento en `frontend/src/presentation/features/landing/README.md`.

## Animación de carga

`loading-preview/` ofrece la vista de revisión `/loading-preview`, con Screen/ViewModel/View y pausa local. El componente reusable del Nami y el temporizador de introducción viven en `presentation/shared/loading/`; consumidores reales: misión, mapa y fallback de rutas. No se duplican operaciones ni datos del provider.

## Sitios de lanzamiento

Centros en Tierra usa `/explore?destination=earth&tab=earth`. Se abre en el explorador desde la pestaña del mismo nombre o desde la ficha y el marcador de Tierra. `space-map` coordina la navegación y conserva `site`, incluso desde enlaces antiguos con `tab=launches`.

`launch-sites` prepara el catálogo en `LaunchSitesScreen` y `useLaunchSitesViewModel`. `LaunchSitesView` comparte el globo y la ficha con `EarthOverview`, que muestra el directorio por función y los videos. La composición permanece en `di/createLaunchSitesDependencies.client.ts`.

Monitoreo diario concentra la entrada de bienestar y observaciones por área. Conserva una entrada por persona y día UTC. El contexto bruto de la instantánea se congela al abrir el formulario y se guarda con cada chequeo. Al editar una entrada con datos adjuntos, se conserva su fuente original. Salud por sistemas consulta las observaciones del chequeo y mantiene disponible el historial de autorregistros anteriores.
