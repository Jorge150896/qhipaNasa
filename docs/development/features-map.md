# Features por sección del menú

En ASTRA cada sección del menú tiene una carpeta de feature propia. Feature es la funcionalidad, Screen conecta el flujo y View dibuja la pantalla. Una feature también puede contener subfuncionalidades; por ejemplo, Tripulación incluye salud por sistemas.

Todas las carpetas de esta tabla están en `frontend/src/presentation/features/`:

| Menú | Carpeta | Screen → View | URL de Odyssey |
| --- | --- | --- | --- |
| Mapa espacial | `space-map/` | `SpaceExplorerScreen` → `SpaceExplorerView` | `/explore` |
| Centro de misión | `mission-overview/` | `MissionOverviewScreen` → `MissionOverviewView` | `/mission/overview` |
| Tripulación | `crew/` | `CrewScreen` → `CrewView` | `/mission/crew` |
| Entorno de la nave | `habitat/` | `HabitatScreen` → `HabitatView` | `/mission/habitat` |
| Historial | `history/` | `HistoryScreen` → `HistoryView` | `/mission/history` |
| Chequeo diario | `daily-check/` | `DailyCheckScreen` → `DailyCheckView` | `/mission/journal` |
| Observaciones | `observations/` | `ObservationsScreen` → `ObservationsView` | `/mission/observations` |
| Simulación | `simulation/` | `SimulationScreen` → `SimulationView` | `/mission/simulation` |
| Fuentes y alcance | `sources/` | `SourcesScreen` → `SourcesView` | `/mission/sources` |

Otros hábitats conservan `/missions/[habitatId]/[section]` con las mismas secciones. No se cambian URLs al organizar carpetas.

## Propiedad del estado y operaciones

- `mission/MissionScreen.tsx`: shell, navegación, mensajes y estados de carga/error. `MissionFeatureScreen.tsx` elige el Screen de cada sección.
- `mission/MissionWorkspaceProvider.tsx` y `mission/useMission.ts`: modelo del flujo existente. Mantienen persona, indicador, zona, escenario, datos, guardado y revisión entre secciones. Salir del hábitat desmonta el provider; los registros persistidos conservan sus claves.
- `space-map/useSpaceExplorerViewModel.ts`: datos, destinos y actualización de registros del mapa.
- `crew/useCrewViewModel.ts`: sistema corporal y modo de visor privados de Tripulación. `crew-health` conserva sus propios casos de uso y `useCrewHealthViewModel` para autorregistros/revisiones por área.
- `presentation/shared/mission/useMissionDashboardViewModel.ts`: modo de visor y etiquetas de hábitat, reutilizado por Centro, Tripulación y Entorno. Se reinicia al salir de la sección.
- Historial, Chequeo, Observaciones y Simulación consumen datos y callbacks del modelo de misión existente. No duplican los casos de uso ni crean ViewModels vacíos. Los formularios conservan sus borradores visuales locales. Fuentes es estática.

Las nuevas funcionalidades autónomas con estado/operaciones usan `NombreScreen.tsx`, `useNombreViewModel.ts`, `types.ts` y `components/NombreView.tsx`. Screen conecta y navega; ViewModel recibe casos de uso inyectados; View representa datos y emite callbacks. Seguir [screens-and-flows.md](screens-and-flows.md).

## Dónde trabajar

| Cambio | Ubicación |
| --- | --- |
| Pantalla de una sección | Su feature de la tabla; componentes privados en `components/` |
| Chequeo de sueño, ánimo y fatiga | `daily-check/components/JournalForm.tsx` y `DailyCheckView.tsx`; operación existente en `mission/useMission.ts` |
| Explicación corporal animada | `crew-health/components/HealthSystemIllustration.tsx`; contenido en `crew-health/constants.ts` |
| Tabla del historial | `history/components/HistoryView.tsx` |
| Revisión de observaciones | `observations/components/ObservationList.tsx` |
| Gráfica y tarjetas compartidas | `presentation/shared/mission/TrendChart.tsx` y `MetricCards.tsx` |
| Astronauta, nave, estaciones y portales 3D | `presentation/shared/scene/`; carga diferida en `presentation/shared/mission/MissionSceneSlot.tsx` |
| Datos/contratos de misión usados por varias vistas | `mission/types.ts`, `mapMissionPresentation.ts`; coordinar consumidores |

Los modelos, dominio, adapters, DI y claves de persistencia no se reorganizan por cada vista. Componentes genéricos siguen en `src/ui`; no moverlos a una sección ni duplicarlos.
