# Referencia real de scotia y adaptación

Repositorio inspeccionado, solo lectura:
`scotia` (proyecto de referencia externo; no se necesita para usar esta skill).

## Evidencia inspeccionada

- `AGENTS.md`: rutas delgadas, Screen/useFeature/View, factories según dependencias, creación incremental, UI genérica separada y validación proporcional.
- `docs/architecture.md`: dependencias entre domain/data/infrastructure/presentation, organización por feature/flujo/pantalla y ownership de componentes.
- `docs/request-flow-and-dependency-injection.md`: contratos, casos de uso por constructor, ApiRepository/ApiClient, camino de retorno y cancelación por AbortSignal.
- `docs/development-workflows.md`: comenzar por contratos, componer antes de conectar UI, documentar writer/reader/cleanup/fallback en estado de flujo.
- `src/presentation/features/qrScanner/createQrScannerDependencies.ts`: composition root local que entrega un adapter tipado.
- `src/presentation/features/qrScanner/QrScannerScreen.tsx`: dependencias estables, hook y callbacks hacia View.
- `src/presentation/features/qrScanner/useQrScanner.ts`: adapter inyectado, estado presentable, efectos y descarte tras desmontaje.
- `src/presentation/features/plin/help/createPlinHelpDependencies.ts`: repositorio inyectado en un caso de uso y composición expuesta a la feature.

Estos archivos fundamentan la skill, pero no son instrucciones operativas para NASA. Si el repositorio deja de existir, esta síntesis sigue siendo utilizable. No se requiere leer todo scotia en cada tarea.

## Qué conservar

| Scotia | Adaptación web |
| --- | --- |
| Expo Router delgado | Next App Router delgado |
| Screen/useFeature/View | Misma división para UI interactiva |
| Contrato -> implementación API | Misma inversión de dependencias |
| DI manual por factory | Factories separadas para server/client |
| Modelo `FeatureData` | Props listas para HTML, gráficos y formularios |
| UI Kit sin negocio bancario | UI genérica sin negocio de la misión |
| Estado de flujo documentado | Propietario, writers, readers, cleanup y acceso por URL directa |
| API externa reemplazable | Contrato frontend independiente del backend Java |

## Qué adaptar y qué excluir

- No trasladar headers nativos, Expo Router, SecureStore, NativeModules, animaciones UIKit o RNTL.
- No copiar datos, pantallas, assets ni reglas bancarias. La referencia es estructural.
- No convertir toda la web en una SPA por copiar la estructura móvil: preferir Server Components para contenido sin interacción y aislar las islas de cliente.
- No heredar porcentajes de cobertura, scripts ni dependencias de otro proyecto.
- La prohibición bancaria de mocks en runtime no se traslada automáticamente: una simulación espacial explícitamente solicitada es una funcionalidad válida, aislada y rotulada. Los fixtures de tests siguen separados.
- No replicar todos los paquetes ni toda la documentación. Un paquete existe cuando hay una frontera real y consumidores que justifican su API.

## Revisión de una feature

Seguir una acción: callback de View -> Screen -> hook -> caso de uso -> contrato -> adapter. Seguir el retorno: entrada validada -> entidad -> modelo presentable -> View. Comprobar qué archivo cambiaría si el transporte o backend cambiara. Si cambia la View para cambiar de proveedor, revisar la frontera.

Para un flujo multipantalla, verificar recarga y URL directa, cancelación de tareas al salir, reset del estado y ausencia de estado privado compartido entre solicitudes del servidor.
