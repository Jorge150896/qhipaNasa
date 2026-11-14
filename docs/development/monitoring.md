# Sesiones de monitoreo asistido

Implementado en `/mission/monitoring` y `/missions/[habitatId]/monitoring`, también desde «Iniciar monitoreo» del centro de misión. Mantiene imágenes, modelos y paleta Qhipa Pacha. Diario y autorregistros corporales conservan su almacenamiento separado.

## Recorrido y límites

1. Elegir origen, actividad (cabina, ejercicio, superficie o EVA), fase, ubicación y equipo. Confirmar identidad, colocación y contexto.
2. Preparar y capturar manualmente, repetir o consultar cada 5 segundos. Cuatro indicadores muestran unidad, calidad, hora del dispositivo, edad, procedencia y comparación descriptiva. No hay umbrales clínicos. Las actividades comparten esos sensores: no se inventan presión de traje, radiación, recorrido ni conexión con máquinas.
3. Revisar intentos y añadir una nota. Una captura vacía o un indicador omitido no hereda valores anteriores.
4. Guardar explícitamente en este navegador; no se envía al proveedor. Los fallos no se presentan como éxito. Los datos incompatibles bloquean escrituras y se conservan.

Hay 50 sesiones por hábitat como máximo, sin eliminación automática. Cada sesión admite 20 capturas. Lo guardado se recupera al recargar; las capturas abiertas se descartan al salir, cambiar de tripulante/hábitat o recargar. La UI avisa. «Nueva sesión» pide confirmación si hay capturas sin guardar.

## Origen API y demostración

Demo usa `DemoMeasurementGateway`: secuencia sintética determinista con horas de la sesión actual y una ausencia de oxígeno cada cuatro capturas. No reproduce la instantánea histórica de misión ni implica sensores conectados.

API usa `HttpMeasurementGateway`: decodifica JSON desconocido con Zod y `CaptureMonitoring` comprueba integridad. No hay fallback sintético ni proveedor conectado. Requiere identificar expresamente al sujeto de API; nunca asocia automáticamente datos reales con personajes ficticios. Solo esta sección consume API; el resto del dashboard sigue siendo demostración.

Configurar la URL completa en `frontend/.env.local` antes de arrancar desarrollo o compilar:

```dotenv
NEXT_PUBLIC_MONITORING_API_URL=https://proveedor.example.invalid/operacion-acordada
```

Es un ejemplo, no un servicio. Next inserta la variable pública al compilar; reconstruir para cambiarla. No incluir tokens o contraseñas. GET añade `subjectId` y `requestId`, usa `cache: no-store`, omite credenciales y tiene timeout de 10 s. El [OpenAPI provisional](../contracts/openapi.yaml) debe acordarse con el proveedor antes de conectar su API. Pendientes autenticación, autorización y CORS. Un contrato distinto exige cambiar adapter y documentación; la View permanece independiente del DTO.

Muestras repetidas conservan ID/fecha y se identifican como «sin muestra nueva». Se rechazan retrocesos temporales y cambios de valor bajo el mismo ID. `available` describe disponibilidad según la fuente, no vigencia clínica: siempre se muestra la edad, sin un límite universal de salud. Ni la comparación descriptiva ni la calidad autorizan EVA, tratamiento o aptitud física.

## Arquitectura y estado

`MonitoringScreen → useMonitoringViewModel → MonitoringView`; modelos en `domain/monitoring`, casos de uso en `domain/usecases`, adapters en `data/monitoring`, composición en `di/createMonitoringDependencies.client.ts`. El hook posee estado, polling y cancelación; no amplía `useMission` ni su provider. El Screen monta una sesión por hábitat/tripulante. Views solo emiten intenciones.

No hay solicitudes solapadas. Pausar/salir cancela y descarta respuestas tardías. Error detiene polling; reintento explícito. Historial en memoria acotado; gráficas no unen ausencias. `LocalMonitoringJournal` usa `astra.monitoring.v1:<habitatId>`, separado de otros registros. No hay sincronización ni modo offline completo.

Pendientes: proveedor real, almacenamiento seguro de servidor, perfiles autorizados y protocolos/alertas de misión validados. Hasta entonces usar sujetos y datos de prueba. No hay medición por cámara ni diagnóstico automatizado.

## Validación · 13 de noviembre de 2026

Tipos, ESLint, formato, build y 75 pruebas unitarias aprobados. La suite completa de navegador obtuvo 30/31: una comprobación existente de pausa del mapa falló por un desplazamiento de 0,57 píxeles. Sin cambiar ese mapa ni su prueba, la repetición sobre el build final de Explorador, Misión y Monitoreo aprobó los 16 casos, incluyendo pausa 3D, escritorio, móvil, ausencia de API y recuperación de sesiones tras recarga. No se ha probado un proveedor real porque aún no está definido.

`npm run check` no arrancó porque npm no está disponible en esta terminal. Se ejecutaron directamente las herramientas instaladas con `/home/fabian/.codegpt/bin/node`, incluyendo Next y Playwright. Las capturas QA previas se conservaron; las nuevas vistas están en `docs/qa/monitoring-desktop.png` y `monitoring-mobile.png`.
