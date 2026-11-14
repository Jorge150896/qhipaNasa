# Etapas siguientes de ASTRA

## Base disponible

Frontend Next.js con nueve secciones, arquitectura por capas, astronauta/nave 3D locales, escenarios deterministas, historial, registro diario y seguimiento persistido en navegador. Copiloto explicativo de escenario.

## Próximo incremento: integración Java

- Elegir una feature vertical concreta, por ejemplo lectura de indicadores e historial.
- Acordar contrato OpenAPI, errores, UTC, unidades, calidad/vigencia, permisos y límites de paginación.
- Implementar el módulo Spring Boot y el adapter HTTP del frontend.
- Trasladar diario y seguimiento al backend cuando estén definidos identidad y persistencia.
- Probar el recorrido Java -> DTO -> dominio TypeScript -> modelo presentable -> UI.

Sin decisión todavía: base de datos, autenticación, hosting y versiones Java/Spring. No deben introducirse como consecuencia automática de preparar frontend.

## Datos científicos y análisis

- Confirmar recursos del reto y documentar cómo fundamentan cada indicador o explicación.
- Definir líneas de base personales y protocolos de revisión con soporte científico; no heredar números de escenarios como umbrales.
- Integrar un modelo de IA mediante un adapter de servidor solo cuando se decidan proveedor, tratamiento de datos y contrato de salida.
- El análisis debe conservar evidencia, datos ausentes, límites y atribución de fuentes. No inferir causalidad de la coincidencia ambiente/salud.

## Capacidades que aún no existen

- Sensores físicos o ingestión de telemetría real.
- Tiempo real mediante SSE/WebSocket y política de reconexión/reanudación.
- Modo offline completo con cache de app, cola de operaciones y reconciliación.
- Informe médico exportable, sincronización remota y control de acceso.
- Modelo humano anatómico, interiores reales de nave o gemelo digital validado.

Implementar cada capacidad a partir de una necesidad concreta y sus consumidores, manteniendo las fronteras actuales.

## Propuesta basada en las capturas del reto

Ver [propuesta de evolución del dashboard](../product/dashboard-proposal.md): fichas explicativas, autoevaluación guiada, historial contextual, seguimiento y copiloto con evidencia. Son propuestas priorizadas, no módulos ya implementados ni instrucciones para construirlos todos a la vez.

Monitoreo asistido ya implementa preparación, captura, repetición y registro local, con un consumidor HTTP configurable. El contrato de API es provisional y no hay proveedor conectado. Ver [configuración, ciclo de vida y límites](monitoring.md).
