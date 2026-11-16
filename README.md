# Nami

Nami es una aplicación de demostración para registrar el bienestar de una tripulación espacial y explorar cómo cambia con el tiempo. Reúne autorregistros, signos vitales simulados y datos del hábitat. Su asistente flotante, también llamado Nami, guía el chequeo diario, explica las lecturas y ayuda a recorrer la aplicación. La interfaz está disponible en español e inglés.

## Qué puedes explorar

| Sección | Funciones | Ruta local |
| --- | --- | --- |
| **Monitoreo diario** | Completa un único chequeo a mano o con Nami. Registra ánimo, sueño, fatiga, ejercicio y observaciones. El formulario adjunta las lecturas corporales y el contexto ambiental disponibles para la persona seleccionada. | `/mission/journal` |
| **Simulación** | Explora la Ruta emocional, la prueba de hábitos y los escenarios de operación. La demostración de pérdida de señal está disponible en `/mission/simulation#perdida-de-senal`. | `/mission/simulation` |
| **Tripulación** | En **Ahora**, consulta el visor corporal y los módulos del hábitat. En **Historial**, revisa telemetría, autorregistros guardados y la evolución de los 30 días simulados de los tres tripulantes de Odyssey. | `/mission/crew` |
| **Mapa espacial** | Explora la Tierra, la Luna, Marte, la estación y la nave en 3D. Accede a **Centros en Tierra**, al mapa de Marte y a la tripulación de cada hábitat. | `/explore` |

Al elegir **Hacerlo con Nami**, el asistente lee cada pregunta y abre el micrófono al terminar. El dictado se procesa en el dispositivo cuando el navegador lo admite y cuenta con el paquete de español o inglés. Una respuesta clara permite avanzar automáticamente. Puedes pausar la escucha, corregir una transcripción o responder en pantalla. El chequeo completo se revisa antes de guardar.

Nami se desplaza por la interfaz, reacciona al tono del mensaje y ofrece una guía que explica los controles al pasar el cursor. Su animación vectorial transparente se comparte entre la portada, la carga y las vistas de misión. El chat funciona con una guía local y admite una integración opcional con GPT mediante el backend. [Guía del asistente](docs/development/tumi-ia.md)

## Datos y alcance de la demo

- Los tripulantes, sus signos vitales y los escenarios de misión son ficticios. Las lecturas de pulso, temperatura corporal, SpO₂ y respiración muestran fecha, unidad, procedencia y calidad cuando están disponibles. Las muestras ausentes se muestran como tales.
- Los chequeos se guardan en el navegador por hábitat y se pueden consultar al recargar en el mismo dispositivo. La demo carece de sincronización entre dispositivos y de un modo offline completo.
- Las referencias públicas se identifican por separado. Incluyen radiación histórica de la ISS (NASA OSDR RadLab), ambiente de cabina (RR-9), inspiración para el historial de tripulación (Inspiration4) y ambiente exterior de Marte (Curiosity REMS). Estas referencias no representan mediciones de los tripulantes ficticios. [Fuentes y mediciones](docs/development/measurement-contract.md)
- La aplicación es un prototipo educativo de seguimiento y simulación. Usa datos ficticios para probar los formularios y el chat.

## Ejecutar en local

Requisitos de frontend: **Node.js 24** según `.nvmrc`, npm y un navegador moderno. Los visores interactivos usan WebGL y ofrecen alternativas cuando el modelo no se puede cargar.

Desde la raíz:

```bash
npm ci
npm run dev
```

Abre [http://127.0.0.1:3000](http://127.0.0.1:3000) y selecciona **Iniciar mi misión** para entrar a Monitoreo diario. También puedes abrir la vista de revisión de la animación en `/loading-preview`. Para usar otro puerto, ejecuta `npm run dev -- --port 3001`.

```bash
npm run check     # Tipos, lint, formato, pruebas unitarias y build
npm run test:e2e  # Pruebas en Chrome sobre el build de producción
```

### Backend opcional

El backend usa **Java 21 y Spring Boot**. Implementa consultas y archivo de radiación histórica de NASA RadLab y el endpoint de conversación `POST /api/v1/tumi/replies`. El monitoreo personal sigue funcionando con datos de demostración y guardado local en el navegador.

```bash
cd backend
./mvnw verify
./mvnw spring-boot:run
```

El servidor local escucha en `127.0.0.1:8080`. Para habilitar GPT en desarrollo, configura `OPENAI_API_KEY` en el entorno privado de Spring Boot y ejecuta `NEXT_PUBLIC_TUMI_LOCAL=true npm run dev` desde la raíz. El backend recibe el mensaje y un contexto acotado de la vista. El diario, los borradores y la conversación previa quedan fuera de esa solicitud. [Configuración del backend](backend/README.md) · [Contrato OpenAPI](docs/contracts/openapi.yaml)

## Publicación en GitHub Pages

El workflow **GitHub Pages** publica `frontend/out` al actualizar `main` y también se puede lanzar manualmente. En el repositorio, selecciona **GitHub Actions** como origen en **Settings → Pages**.

```bash
GITHUB_PAGES=true npm run build
```

La exportación local usa `/qhipaNasa` como ruta base predeterminada. El workflow obtiene la ruta base desde la configuración de Pages. El sitio estático usa la guía local de Nami. Para activar GPT, configura la variable de repositorio `TUMI_API_URL` con el origen HTTPS de un backend alojado por separado. [Configuración para Pages](backend/README.md#gpt-en-github-pages)

## Código y documentación

- `frontend/` usa Next.js App Router, React, TypeScript y Three.js con React Three Fiber. Las pantallas se organizan por funcionalidad con el patrón Screen → ViewModel → View.
- `backend/` contiene los módulos Java para consultas RadLab y el asistente.
- Consulta [CONTRIBUTING.md](CONTRIBUTING.md), [AGENTS.md](AGENTS.md), la [arquitectura compartida](docs/architecture/system.md) y la [guía de frontend](docs/development/frontend.md) para contribuir.
- Las fuentes y licencias de los recursos 3D se detallan en [Atribuciones de modelos](frontend/public/models/ATTRIBUTION.md). La procedencia del personaje está en [Recursos de marca](frontend/public/brand/README.md).
