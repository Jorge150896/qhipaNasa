# Entrega de la rama Fabian

## Contenido

La rama incorpora los avances de Monitoreo y los modelos humanos conservados tras integrar `origin/main` en `c0f641e`. La integración previa está documentada en [main-integration-fabian.md](main-integration-fabian.md). Se mantienen colores, imágenes, diario y registros existentes.

- **Tripulación:** opción de holograma humano local con apariencias neutral, masculina y femenina, atribución de assets y controles HTML independientes de WebGL.
- **Trazabilidad:** contrato cuantitativo portable, distinción entre sujetos individuales/agregados, fuente, fecha, unidad, método y ausencia de muestras. Historial permite consultar la procedencia.
- **Monitoreo asistido:** preparación por actividad, equipo y contexto; captura, repetición, consulta periódica, revisión y sesiones locales. Demo explícita y consumidor personal HTTP configurable, sin sustitución de errores por simulación. Ver [monitoreo](monitoring.md).
- **Backend RadLab:** Java 21/Spring Boot 3.5.16, consultas históricas ambientales de DosTel1 y DosTel2, archivo versionado del CSV con SHA-256, errores explícitos y CORS de desarrollo. Ver [backend y uso desde frontend](radlab-backend.md).
- **Contrato compartido:** [OpenAPI](../contracts/openapi.yaml) distingue las operaciones ambientales implementadas de la propuesta de signos vitales personales, todavía sin servidor/proveedor.

## Ejecutar

Frontend desde la raíz:

```sh
npm ci
npm run dev
```

Abrir `/mission/monitoring` o `/missions/aurora/monitoring`. Los registros de demo se guardan en el navegador; lo no guardado se descarta al salir de la pantalla.

Backend, con JDK 21 y `JAVA_HOME`:

```sh
cd backend
./mvnw verify
./mvnw spring-boot:run
```

Escucha en `127.0.0.1:8080`. Catálogo: `GET /api/v1/radiation/instruments`. Serie: `GET /api/v1/radiation/readings?instrumentId=DosTel1&from=2022-03-01T00:00:00Z&to=2022-03-01T01:00:00Z`. La guía enlazada contiene configuración, ejemplo `fetch` y tratamiento de errores para el equipo frontend.

## Validaciones realizadas

- Frontend: tipos, ESLint, formato, build y 75 pruebas unitarias aprobados en la entrega de Monitoreo. La suite completa de navegador obtuvo 30/31; la repetición final sobre el build actualizado de Explorador, Misión y Monitoreo aprobó los 16 casos, incluida la prueba de pausa 3D que había fallado por 0,57 píxeles. Detalle en [monitoring.md](monitoring.md).
- El entorno no disponía de `npm`; esas herramientas frontend se ejecutaron directamente con Node y los paquetes instalados. No se presenta `npm run check` como un comando aprobado.
- Backend: `./mvnw verify` aprobó nueve pruebas y generó el jar. Consulta real por Java con TLS habilitado: HTTP 200 y 65 registros de DosTel1 para la hora de ejemplo. Caché verificada en la segunda consulta y después de reiniciar el jar; CORS permitido y rechazo de origen no listado comprobados.

## Estado de integración y límites

El backend no está desplegado y las pantallas todavía no consumen sus nuevas operaciones ambientales. No apuntar el consumidor de signos vitales personales a RadLab. La integración de una pantalla ambiental debe conservar esta separación.

Las respuestas RadLab son históricas, ambientales y asociadas a instrumentos/módulos, no a astronautas. La zona de timestamps sin offset se interpreta mediante configuración, UTC por defecto, y se identifica como hipótesis, conservando el texto original. La calidad técnica no equivale a normalidad médica. No hay dosis personales, diagnóstico, reglas clínicas validadas ni autorización automática de EVA.

Persistencia local de sesiones y archivo de datos públicos no equivalen a una base clínica segura o a un modo offline completo. Siguen pendientes autenticación, persistencia personal de servidor, sincronización y conexión de sensores personales. La apariencia del holograma no determina características clínicas.
