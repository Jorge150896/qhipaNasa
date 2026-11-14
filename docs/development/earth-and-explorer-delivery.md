# Entrega de Tierra y explorador

Rama de trabajo: `feature/juanluis`. Implementación frontend sobre Next.js/React/TypeScript, con componentes Three.js locales. No añade backend ni endpoints.

## Cambios incluidos

- Menú vertical «Tierra» con icono de globo, disponible desde el explorador y las pantallas de misión salvo Tripulación. Abre `/explore?destination=earth&tab=earth`; conserva un estado activo distinto del mapa.
- Tres pestañas: mapa espacial, despegues y vista general de Tierra. Las entradas previas siguen funcionando y el lugar seleccionado se conserva en `site=<id>`.
- Catálogo local de Kennedy, Vandenberg, Kourou, NASA Headquarters, Johnson, Goddard, Marshall y JPL. Incluye nombre completo, función, ubicación aproximada, fuentes oficiales y relación con la misión.
- Card compacta junto a cada punto frontal del globo, con línea de conexión y selección individual. Los lugares próximos ya no se agrupan. Las etiquetas tienen una disposición visual específica para este catálogo; al ampliar el catálogo hay que revisar dicha disposición.
- Una tarjeta ampliada con cierre, información y único video. En escritorio dispone de espacio junto al globo y en pantallas estrechas aparece debajo, dentro del mismo marco. Al cambiar de lugar se reinicia el desplazamiento de la ficha; al cerrar se desmonta el video.
- Tres videos históricos: Artemis I desde Kennedy, InSight desde Vandenberg y Webb desde Kourou. Las sedes sin plataforma muestran una misión relacionada e indican el origen real. Reproducción manual, reintento y enlace externo; necesita conexión y disponibilidad del proveedor.
- Vista general con ocho lugares y tres videos únicos. Mantiene una lista HTML equivalente cuando no hay WebGL o falla una textura.
- Mapa ampliable, destinos accesibles por HTML, fila móvil deslizable, inspección de Tierra/Luna/Marte/Aurora/nave, zoom y pausa. Mejora de iluminación, materiales, nubes, atmósfera y encuadre. Aurora continúa siendo conceptual, no una réplica de la ISS.
- Separación del exterior de nave y el interior modular incorporado desde main, conservando los hotspots y los diarios por hábitat.

## Responsabilidades y estado

`LaunchSitesScreen -> useLaunchSitesViewModel -> LaunchSitesView`. `LoadLaunchSites` depende de `LaunchSitesRepository`; el adapter `LocalLaunchSitesRepository` se compone en DI. La URL posee pestaña y selección. View mantiene foco/desplazamiento; los componentes del globo mantienen cámara y carga visual. No se añadió estado al provider de misión ni se cambiaron claves de storage.

Las cards compactas se renderizan con `LaunchPointCard` dentro de un portal HTML independiente y se ocultan en el hemisferio posterior. El detalle y el iframe son HTML exterior al Canvas. Los controles siguen disponibles ante fallos del renderizador.

## Guías y evidencia

- Reutilización de modelos: [reusable-3d.md](reusable-3d.md).
- Contratos y datos del catálogo: [README de launch-sites](../../frontend/src/presentation/features/launch-sites/README.md).
- Arquitectura: [system.md](../architecture/system.md).
- Historial de validación y capturas: [verification.md](../qa/verification.md).
- Recursos y licencias: `frontend/public/textures/ATTRIBUTION.md` y `frontend/public/models/ATTRIBUTION.md`.

Se conserva el historial de verificaciones con su alcance: una ejecución parcial no equivale a toda la suite aprobada. El check global tiene problemas de formato previos fuera de esta feature; consultar el registro más reciente. Las capturas de pruebas contienen datos ficticios. Los E2E sustituyen el proveedor de video para verificar la integración de forma reproducible y no certifican reproducción externa.
