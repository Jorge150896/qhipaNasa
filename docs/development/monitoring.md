# Monitoreo diario y sesiones anteriores

Monitoreo diario, en `/mission/journal` o `/missions/[habitatId]/journal`, es el formulario de seguimiento de la tripulación. Carga las lecturas corporales y del entorno de la misión y guarda un registro por persona y día UTC. Las rutas anteriores terminadas en `/monitoring` abren este formulario.

En Tripulación → Historial → Actividad guardada se pueden desplegar las sesiones asistidas guardadas con la versión anterior. El registro local conserva su clave `astra.monitoring.v1:<habitatId>`. Las sesiones sintéticas se muestran para el tripulante seleccionado y las sesiones de API con el sujeto externo que figura en cada sesión.

`createMonitoringHistory` compone la lectura del archivo. Simulación ofrece la captura rápida de demostración en Pérdida de señal para comprobar una señal sin guardar una sesión. El [contrato de lecturas personales](../contracts/openapi.yaml) sigue provisional y la interfaz actual no se conecta a un proveedor de salud personal.
