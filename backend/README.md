# ASTRA · backend de radiación

Java 21 y Spring Boot 3.5.16. Consultas históricas a NASA OSDR RadLab; no contiene datos personales, diagnóstico ni endpoints para los cuatro signos vitales del frontend.

```sh
cd backend
./mvnw verify
./mvnw spring-boot:run
```

Windows: `mvnw.cmd`. Requiere `JAVA_HOME` configurado y red para la primera descarga de Maven/dependencias. El servidor escucha en `127.0.0.1:8080`; no hay que instalar Maven globalmente.

### Chat flotante de Tumi con GPT en local

Abre `backend/.env.tumi.local` o créalo con permisos privados. Deja una línea `OPENAI_API_KEY=` y escribe tu clave después del igual. Git ignora este archivo. Inicia Spring Boot desde `backend/` con `./mvnw spring-boot:run`. En otra terminal, desde la raíz, ejecuta `NEXT_PUBLIC_TUMI_LOCAL=true npm run dev -- --port 3000`. Abre el Tumi flotante en `http://127.0.0.1:3000`. Para que Spring cargue una clave nueva, reinicia el backend.

El endpoint local `POST /api/v1/tumi/replies` recibe hasta 600 caracteres de mensaje y un resumen acotado de la pantalla. Usa GPT-5.4 mini por defecto. El chat flotante y el contextual usan la integración cuando se activa el modo local con GPT. El contexto puede incluir lecturas simuladas y puntos seleccionados de archivos públicos. El diario, sus borradores y el historial de mensajes quedan fuera de esta llamada. La demo de GitHub Pages usa la guía local. El endpoint de GPT está pensado para desarrollo local y requeriría autenticación y límites de uso antes de publicarlo.

Consultar [uso y contrato para frontend](../docs/development/radlab-backend.md) y [OpenAPI compartido](../docs/contracts/openapi.yaml).

```sh
curl --get 'http://127.0.0.1:8080/api/v1/radiation/readings' \
  --data-urlencode 'instrumentId=DosTel1' \
  --data-urlencode 'from=2022-03-01T00:00:00Z' \
  --data-urlencode 'to=2022-03-01T01:00:00Z'
```

El archivo local se conserva en `backend/data/radlab` cuando se ejecuta desde `backend`. GET puede escribir la copia de la respuesta pública, sin alterar NASA. Una consulta repetida usa esa copia incluso tras reiniciar; no hay caducidad automática. No se sirve una copia distinta ni datos simulados ante errores.
