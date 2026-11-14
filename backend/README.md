# ASTRA · backend de radiación

Java 21 y Spring Boot 3.5.16. Consultas históricas a NASA OSDR RadLab; no contiene datos personales, diagnóstico ni endpoints para los cuatro signos vitales del frontend.

```sh
cd backend
./mvnw verify
./mvnw spring-boot:run
```

Windows: `mvnw.cmd`. Requiere `JAVA_HOME` configurado y red para la primera descarga de Maven/dependencias. El servidor escucha en `127.0.0.1:8080`; no hay que instalar Maven globalmente.

Consultar [uso y contrato para frontend](../docs/development/radlab-backend.md) y [OpenAPI compartido](../docs/contracts/openapi.yaml).

```sh
curl --get 'http://127.0.0.1:8080/api/v1/radiation/readings' \
  --data-urlencode 'instrumentId=DosTel1' \
  --data-urlencode 'from=2022-03-01T00:00:00Z' \
  --data-urlencode 'to=2022-03-01T01:00:00Z'
```

El archivo local se conserva en `backend/data/radlab` cuando se ejecuta desde `backend`. GET puede escribir la copia de la respuesta pública, sin alterar NASA. Una consulta repetida usa esa copia incluso tras reiniciar; no hay caducidad automática. No se sirve una copia distinta ni datos simulados ante errores.
