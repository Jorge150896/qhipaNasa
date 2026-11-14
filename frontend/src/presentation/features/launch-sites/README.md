# Sitios de lanzamiento

Cada punto visible tiene una card compacta individual (`LaunchPointCard`) con nombre, categoría, línea de conexión y acceso al detalle. Las cards viven en el portal HTML independiente y se ocultan por oclusión en el hemisferio posterior. El catálogo de ocho lugares conserva sus coordenadas; ya no se agrupan los puntos cercanos. Al seleccionar un lugar se monta un único reproductor en la tarjeta ampliada dentro del visor, con espacio reservado en escritorio y posición inferior hasta 1100 px. Cerrar el detalle conserva las cards compactas.

En ambas pestañas de Tierra, seleccionar un marcador o lugar entrega el foco a la tarjeta y la desplaza a la vista, también en móvil y al recuperar una selección por URL. Se respeta movimiento reducido. Las etiquetas individuales del globo muestran el nombre completo.

El video de despegue aparece inmediatamente después del nombre del lugar seleccionado, antes de los datos de la instalación. La lista, los grupos del globo y las tarjetas de la vista general indican la misión disponible. El reproductor muestra fecha y origen real del despegue; las sedes sin plataforma conservan el video de una misión relacionada y explican esa relación. Solo se monta un reproductor a la vez.

## Vista general de la Tierra

El menú vertical compartido ofrece «Tierra» desde el explorador y las pantallas de misión. Abre `/explore?destination=earth&tab=earth` y permanece activo también en la pestaña de despegues y al seleccionar un lugar. «Mapa espacial» conserva su acceso y estado activo independiente. Screen traduce `onOpenEarth` a navegación; el shell no conoce rutas ni modifica el estado de misión.

La opción «Ver todo de la Tierra» se ofrece en el detalle de Tierra y su tarjeta 3D. La tercera pestaña «Todo de la Tierra» abre `/explore?destination=earth&tab=earth`; `site=<id>` conserva la ficha seleccionada. `EarthOverview` es una View presentacional dentro del mismo flujo y usa el mismo catálogo/caso de uso/ViewModel: tres sitios de lanzamiento, cinco sedes NASA y tres videos históricos únicos. Sus botones emiten intención de selección al Screen, que actualiza la URL. No carga un reproductor por tarjeta: el único iframe continúa en la ficha elegida. Las URLs anteriores `tab=launches` se conservan.

En modo general, seleccionar un lugar o video lleva visualmente a la ficha y le entrega el foco, respetando movimiento reducido. La navegación sigue en Screen; el desplazamiento/foco es comportamiento visual local de View. Cerrar la selección mantiene la vista general. El selector de pestañas admite las tres opciones con flechas, Home y End. No se crea un provider, repositorio ni ViewModel duplicado.

## Globo de despegues y sedes NASA

Entrada: `/explore?destination=earth&tab=launches`; `&site=kennedy`, `vandenberg` o `kourou` abre una ficha. El explorador ofrece pestañas accesibles y un acceso desde Tierra. URL inexistente: mensaje visible y catálogo utilizable. Volver al mapa preserva el destino Tierra.

También admite `site=nasa-hq`, `johnson`, `goddard`, `marshall` y `jpl`. Son cinco sedes seleccionadas, no un directorio exhaustivo de NASA. Kennedy conserva su identidad de sitio de lanzamiento dentro del centro NASA; Vandenberg y Kourou no se presentan como sedes de NASA. Se preservan los identificadores y enlaces anteriores.

Cada ficha muestra nombre completo, categoría, ciudad/región/país, función principal, descripción y fuente oficial del lugar. `kind` distingue sitio, centro/laboratorio y sede central. `pad: null` significa que el lugar seleccionado no es una plataforma; no se inventa una. `summary` describe la instalación, mientras `description` describe la misión. `videoLocation`, `videoRelation` y `relationSourceUrl` identifican el origen real del video y justifican su relación con el lugar seleccionado. El título del iframe usa el lugar real del despegue, también para sedes de investigación o administración.

`nasaCenters.ts` es parte del mismo adapter local, no otro servicio ni otro flujo de misión. Fuentes oficiales de roles/relaciones: https://www.nasa.gov/headquarters/about/, https://www.nasa.gov/missions/artemis/orion/artemis-i-mission-control-at-a-glance/, https://science.nasa.gov/mission/webb/webb-team/, https://www.nasa.gov/reference/space-launch-system/ y https://www.jpl.nasa.gov/news/press_kits/insight/landing/management/. Las coordenadas de las sedes son ubicaciones aproximadas de campus, no plataformas ni posiciones operativas.

Los despegues usan puntos naranjas y las sedes puntos azules. Cada lugar tiene nombre completo visible y selección independiente; la lista HTML sigue disponible sin WebGL. Los desplazamientos de las etiquetas son una disposición visual del catálogo, no cambios de coordenadas geográficas.

`LaunchSitesScreen -> useLaunchSitesViewModel -> LaunchSitesView`. El caso de uso `LoadLaunchSites` recibe `LaunchSitesRepository`; `LocalLaunchSitesRepository` entrega un catálogo histórico, separado de los hábitats sintéticos. DI en `createLaunchSitesDependencies.client.ts`. Sin backend, endpoints, almacenamiento nuevo ni cambios al diario o a `useMission`.

Propiedad: URL (Screen) posee pestaña y sitio; el ViewModel posee carga, error y modelo presentable, cancela al desmontarse y descarta respuestas antiguas. Cámara, zoom y errores del reproductor son estado visual local. Cambiar sitio remonta el reproductor; cerrar ficha/cambiar pestaña lo desmonta y detiene su reproducción. Recarga reconstruye la selección desde URL. La navegación atrás/adelante conserva cada selección.

El globo no gira automáticamente: textura equirectangular y marcadores comparten un sistema de coordenadas fijo (`globeCoordinates.ts`). Norte = +Y, longitud 0 = +X; este = -Z. OrbitControls gira la cámara. Los marcadores del lado posterior se ocultan por oclusión y viven en un portal HTML independiente del Canvas. La cámara se acerca al punto seleccionado; sin WebGL o textura, permanece la lista HTML. Las texturas de `PlanetSurface` se liberan al desmontar. Movimiento reducido elimina la transición de enfoque.

Catálogo inicial, revisado el 2026-11-11, no exhaustivo ni agenda de próximos lanzamientos. Coordenadas aproximadas redondeadas a 3 decimales (grados geográficos); fuentes enlazadas en cada ficha. Fechas históricas mostradas en UTC. Videos de NASA y ESA enlazados en las fuentes de cada misión, integrados sin descarga mediante YouTube en modo de privacidad mejorada. Se carga un solo iframe al seleccionar un sitio, sin autoplay. Requiere internet y permisos del proveedor. Timeout/error de carga ofrece reintento; bloqueos internos del proveedor no son observables entre orígenes, por eso siempre se muestra el enlace al video y la fuente oficial. Una carga del iframe no garantiza reproducción.

Kennedy: Artemis I (NASA), 2022-11-16, LC-39B. Vandenberg: InSight (NASA/JPL), 2018-05-05, SLC-3E. Kourou: James Webb (ESA/CNES/Arianespace), 2021-12-25, ELA-3. Los sitios y videos son reales; no describen la tripulación ficticia de Aurora ni representan posiciones actuales de la ISS. Aurora conserva su identidad de demo y su geometría conceptual.

Texturas: Solar System Scope / INOVE, CC BY 4.0. Procedencia, archivos y límites en `public/textures/ATTRIBUTION.md`. Pruebas: `tests/launchSites.test.tsx` y `tests/e2e/launch-sites.spec.ts`. El E2E sustituye la respuesta del proveedor de video para verificar de forma reproducible la integración; no certifica la disponibilidad de YouTube.
