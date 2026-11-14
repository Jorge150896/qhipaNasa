# RadLab: backend y consumo desde frontend

## Alcance implementado

Backend Java 21/Spring Boot 3.5.16 con dos operaciones GET. Consulta radiación ambiental histórica de DosTel1 y DosTel2 en ISS/Columbus, valida la respuesta CSV y conserva una copia versionada en disco. No incluye base de datos, login, datos de salud personales, alertas clínicas ni UI nueva. La identidad visual y los datos actuales de la web permanecen intactos.

Fuentes oficiales: [API RadLab](https://visualization.osdr.nasa.gov/radlab/gui/data-api/), [descripción NASA](https://science.nasa.gov/reference/osdr-faq/), [timestamp de origen](https://visualization.osdr.nasa.gov/radlab/gui/knowledgebase/timestamp). El endpoint oficial termina en `/radlab/api/`, sin punto final. No requiere API key para las consultas verificadas.

## Arranque

```sh
cd backend
./mvnw verify
./mvnw spring-boot:run
```

Requiere JDK 21 y `JAVA_HOME`. Windows: `mvnw.cmd`. El wrapper descarga Maven y las dependencias en la primera ejecución. No necesita Node ni una base de datos. La primera consulta necesita conectividad con NASA; las consultas exactas ya archivadas se pueden atender sin NASA, pero esto no convierte la web en una aplicación offline completa.

Configuración opcional por variables de entorno:

| Variable                  | Valor inicial                                 | Uso                                                            |
| ------------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| `PORT`                    | `8080`                                        | Puerto Java                                                    |
| `BACKEND_ADDRESS`         | `127.0.0.1`                                   | Interfaz de escucha                                            |
| `FRONTEND_ORIGINS`        | `http://localhost:3000,http://127.0.0.1:3000` | Lista CORS exacta separada por comas                           |
| `RADIATION_ARCHIVE`       | `./data/radlab`                               | Directorio persistente relativo al proceso                     |
| `RADLAB_SOURCE_TIME_ZONE` | `UTC`                                         | Zona asumida para interpretar timestamps originales sin offset |

La API solo expone datos ambientales públicos. CORS no es autenticación. Antes de publicar el servicio, configurar HTTPS, límites de uso y los orígenes reales. No añadir registros personales a estas operaciones públicas.

## Operaciones

`GET /api/v1/radiation/instruments` devuelve el catálogo inicial:

```json
[
  { "id": "DosTel1", "spacecraft": "ISS", "module": "Columbus" },
  { "id": "DosTel2", "spacecraft": "ISS", "module": "Columbus" }
]
```

No asegura que todos los periodos tengan datos. No es el catálogo completo de RadLab.

`GET /api/v1/radiation/readings` recibe tres parámetros obligatorios:

| Parámetro      | Ejemplo                | Regla                                                  |
| -------------- | ---------------------- | ------------------------------------------------------ |
| `instrumentId` | `DosTel1`              | Uno de los instrumentos del catálogo                   |
| `from`         | `2022-03-01T00:00:00Z` | ISO 8601 con zona                                      |
| `to`           | `2022-03-01T01:00:00Z` | Posterior a from, no futuro y máximo 24 h de intervalo |

Periodo inclusivo al inicio y exclusivo al final: `[from,to)`. Se normalizan offsets a instantes. Las filas se ordenan por observación; una serie vacía es un resultado válido, no radiación cero. No hay paginación: el servicio rechaza respuestas mayores de 10000 filas o 4 MiB en vez de truncarlas. Hay timeout de conexión de 5 s, solicitud de 20 s y límite global de espera de 25 s para NASA; no hay reintentos automáticos.

Ejemplo de forma de respuesta (fragmento ilustrativo de una serie, no una promesa de número de registros):

```json
{
  "query": {
    "instrumentId": "DosTel1",
    "from": "2022-03-01T00:00:00Z",
    "to": "2022-03-01T01:00:00Z"
  },
  "source": {
    "name": "NASA OSDR RadLab",
    "requestUrl": "https://visualization.osdr.nasa.gov/radlab/api/?...",
    "fetchedAt": "2026-11-14T17:00:00Z",
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "historical": true,
    "sourceTimeZone": "UTC",
    "timeZoneBasis": "configured-assumption"
  },
  "cacheHit": false,
  "count": 1,
  "readings": [
    {
      "id": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "instrumentId": "DosTel1",
      "spacecraft": "ISS",
      "module": "Columbus",
      "sourceTimestamp": "2022-03-01T00:00:00",
      "observedAt": "2022-03-01T00:00:00Z",
      "indicator": "absorbedDoseRate",
      "value": 6.35004766666667,
      "unit": "µGy/h",
      "quality": "reported"
    }
  ]
}
```

`reported` significa valor conservado de la fuente, no normalidad médica ni certificación de calibración. `NA`, `N/A` y campos vacíos producen `value:null,quality:missing`; cero se conserva. Una fila inválida, negativa, duplicada o de otro instrumento/periodo rechaza la respuesta completa, sin ocultarla ni reemplazarla por demo.

## Ejemplo para el frontend

La web debe usar un adapter ambiental independiente del `HttpMeasurementGateway` personal. Este último solo admite signos vitales y sujetos individuales: no apuntar `NEXT_PUBLIC_MONITORING_API_URL` a esta API.

Configurar en `frontend/.env.local` cuando se implemente la pantalla consumidora:

```dotenv
NEXT_PUBLIC_RADIATION_API_BASE_URL=http://127.0.0.1:8080
```

La variable todavía no tiene consumidor en la aplicación: este incremento entrega backend y documentación. Next incorpora variables públicas al build; nunca colocar secretos en ellas.

Ejemplo mínimo del transporte que el adapter puede encapsular:

```ts
export async function requestRadiation(
  baseUrl: string,
  instrumentId: 'DosTel1' | 'DosTel2',
  from: string,
  to: string,
  signal: AbortSignal,
): Promise<unknown> {
  const url = new URL('/api/v1/radiation/readings', baseUrl);
  url.search = new URLSearchParams({ instrumentId, from, to }).toString();
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(30_000)]),
    cache: 'no-store',
    credentials: 'omit',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`RADIATION_HTTP_${response.status}`);
  return response.json();
}
```

El adapter debe validar el JSON recibido como `unknown` (Zod disponible en frontend), comprobar identidad/periodo/unidad, y mapearlo a su contrato de dominio. El [OpenAPI compartido](../contracts/openapi.yaml) describe todos los campos y errores. Componer dependencias en `src/di`; hook administra estado/cancelación; View solo recibe datos presentables y callbacks.

Estados que debe contemplar la pantalla: carga, datos, ausencia de registros, fallo recuperable y cancelación al cambiar instrumento o periodo. No usar polling de 5 s para volver a descargar históricos; consultar cuando cambien los filtros. Gráfica separada para cada instrumento, huecos explícitos para null, sin interpolación ni suma entre sensores del mismo módulo. Mostrar siempre «Radiación ambiental histórica», fechas originales, zona asumida, instrumento, módulo y procedencia.

| HTTP | `code`                    | Comportamiento sugerido                                          |
| ---- | ------------------------- | ---------------------------------------------------------------- |
| 400  | `INVALID_QUERY`           | Corregir instrumento/periodo; no reintentar automáticamente      |
| 502  | `RADLAB_INVALID_RESPONSE` | Informar incompatibilidad; conservar la selección                |
| 503  | `RADLAB_UNAVAILABLE`      | Permitir reintento manual                                        |
| 503  | `ARCHIVE_UNAVAILABLE`     | No anunciar guardado; revisar acceso/disco o datos incompatibles |

Todos estos errores tienen `{ "code": "...", "message": "..." }`, sin payloads remotos, trazas ni detalles internos.

## Persistencia, procedencia y límites

El archivo local es un repositorio de consultas públicas, no una base clínica. Cada consulta se identifica por instrumento y periodo; la zona configurada separa los directorios. Guarda el CSV original, consulta, transformación, fecha de descarga y SHA-256. Escribe revisiones identificadas por hash y actualiza atómicamente la copia consultable. Si falla la escritura devuelve error. Si encuentra una copia incompatible o corrupta devuelve error conservándola; no la elimina ni hace un fallback silencioso.

`cacheHit:true` significa que se usó la copia persistida, con su fecha de descarga original. Las copias no expiran; no existe endpoint de refresco ni limpieza automática. Para una nueva verificación de un mismo periodo, seleccionar otro directorio `RADIATION_ARCHIVE` y conservar el anterior. El operador debe vigilar espacio, copias de seguridad y ciclo de vida. El filesystem debe soportar movimientos atómicos; no usar almacenamiento efímero si se espera recuperación tras reiniciar.

SHA-256 detecta cambios del contenido archivado; no prueba calibración ni equivale a firma digital de NASA. El cliente mantiene verificación TLS estándar y no sigue redirecciones. Ante errores de certificados, configurar la cadena de confianza del JDK con el responsable del entorno; nunca desactivar TLS ni importar un certificado arbitrario solo para hacer pasar la conexión.

La respuesta actual de NASA no incorpora zona en sus timestamps y su breve documentación no la confirma expresamente. Conservamos el texto original en `sourceTimestamp`; `observedAt` es una interpretación con `RADLAB_SOURCE_TIME_ZONE`, UTC por defecto, señalada por `timeZoneBasis:configured-assumption`. No usar esta hipótesis para atribuir exposición a personas reales sin verificar la convención temporal.

La unidad es tasa de dosis absorbida en µGy/h, no dosis equivalente en µSv/h ni dosis acumulada personal. No convertirlas entre sí, deducir enfermedad, recomendar un tratamiento o autorizar EVA. Tampoco extrapolar los datos de Columbus a los módulos ficticios de Aurora. Mantener los históricos reales y escenarios sintéticos identificados por separado.

## Organización y pruebas

`radiation/domain` conserva modelos Java puros; `application/usecase` coordina lectura/captura; puertos pequeños en `application/port/out`; adapters HTTP, RadLab y archivo; `configuration` compone dependencias y CORS. No hay un backend duplicado en Next.

`./mvnw verify` ejecuta pruebas de dominio, parsing CSV, ausencia/cero, errores HTTP, persistencia tras recrear el repositorio y respuesta REST, sin depender de NASA. La conectividad real se comprueba aparte con el comando del README. Un catálogo accesible no demuestra por sí solo que una consulta remota funciona.

Verificación del 14 de noviembre de 2026: nueve pruebas Java aprobadas y jar ejecutable generado. La consulta real de DosTel1 del 1 de marzo de 2022, entre 00:00 y 01:00 bajo la hipótesis UTC declarada, devolvió HTTP 200 y 65 registros mediante el cliente Java con TLS estándar habilitado. La segunda consulta y una consulta después de reiniciar el jar devolvieron `cacheHit:true`. Se comprobaron el origen CORS permitido de desarrollo y el rechazo HTTP 403 de un origen no listado. No se modificó código frontend en esta entrega ni se ejecutó su suite para atribuirle una integración UI que todavía no existe.
