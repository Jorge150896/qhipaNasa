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

`POST /api/v1/tumi/replies` recibe hasta 600 caracteres de mensaje y un resumen acotado de la pantalla. Usa GPT-5.4 mini por defecto. El chat flotante y el contextual comparten la integración. El contexto puede incluir lecturas simuladas y puntos seleccionados de archivos públicos. El diario, sus borradores y el historial de mensajes quedan fuera de esta llamada.

`TumiVoice.java` define la voz conversada para ambos chats. Tumi empieza por lo que se preguntó, explica qué significa en palabras cotidianas y propone un siguiente paso vinculado a la pantalla o al registro. Los apodos reconocidos, como «Lena» para Elena Torres, se resuelven con la identidad que aporta la app.

Cuando una respuesta parece una ficha de pantalla, Tumi pide una reformulación dentro del mismo límite de espera. Ese mensaje puede usar hasta dos llamadas al proveedor. La cuota pública cuenta mensajes de la app.

### GPT en GitHub Pages

1. Publica el backend Java como servicio HTTPS. En un proveedor con Docker, usa `backend/` como raíz y `Dockerfile` como archivo de imagen. El contenedor escucha en el `PORT` del proveedor o en 8080.
2. En el entorno privado del **servicio** configura `OPENAI_API_KEY` y `TUMI_PUBLIC_ORIGIN` con el origen de Pages, por ejemplo `https://jorge150896.github.io` sin ruta ni barra final. `TUMI_PUBLIC_DAILY_LIMIT` fija el máximo de solicitudes de GPT por instancia y día UTC, con un valor predeterminado de 100. El contador vive en memoria y se reinicia si se reinicia el servicio. El origen permitido limita a los navegadores y se puede falsificar desde otros clientes. Para un uso público sostenido hace falta control de acceso y una cuota persistente.
3. En GitHub, abre **Settings → Secrets and variables → Actions → Variables**. Crea la variable de repositorio `TUMI_API_URL` con el origen HTTPS del backend. Ejecuta de nuevo el workflow **GitHub Pages**. Este paso solo publica el URL del servicio.
4. Abre el chat de la web y comprueba que muestre **Chat con GPT**. Con `TUMI_API_URL` vacío la exportación usa la guía local.

Consultar [uso y contrato para frontend](../docs/development/radlab-backend.md) y [OpenAPI compartido](../docs/contracts/openapi.yaml).

```sh
curl --get 'http://127.0.0.1:8080/api/v1/radiation/readings' \
  --data-urlencode 'instrumentId=DosTel1' \
  --data-urlencode 'from=2022-03-01T00:00:00Z' \
  --data-urlencode 'to=2022-03-01T01:00:00Z'
```

El archivo local se conserva en `backend/data/radlab` cuando se ejecuta desde `backend`. GET puede escribir la copia de la respuesta pública, sin alterar NASA. Una consulta repetida usa esa copia incluso tras reiniciar; no hay caducidad automática. No se sirve una copia distinta ni datos simulados ante errores.
