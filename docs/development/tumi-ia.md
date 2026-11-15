# Tumi IA: guía de entrega y reutilización

Estado de la entrega del 15 de noviembre de 2026. Esta guía reúne el acompañante flotante, sus expresiones, conversación y controles. El detalle de implementación está en el [README de la feature](../../frontend/src/presentation/features/cursor-assistant/README.md); las ejecuciones y capturas están en [verificación](../qa/verification.md).

## Qué puede hacer

Tumi aparece como una cabeza tecnológica dorada con visor oscuro y rasgos turquesa. Se desplaza de forma moderada por espacios libres, observa el puntero, parpadea, inclina la cabeza y mueve suavemente el tocado. Al pulsarlo abre una conversación cerca de su posición y suspende los recorridos. Puede arrastrarse manualmente a otra zona libre.

El acompañante está disponible en portada, explorador y misión. En misión ofrece acceso al chat contextual existente. Solo hay una instancia del acompañante por página. El Tumi del loader y la guía de misión conservan sus funciones; esta entrega no modifica los modelos 3D ni los registros de salud.

## Controles finales

| Control                            | Resultado                                                   |
| ---------------------------------- | ----------------------------------------------------------- |
| Pulsar o tocar la cabeza           | Abre o cierra la conversación                               |
| Campo «Mensaje para Tumi» y Enviar | Envía hasta 600 caracteres a la guía local                  |
| X de la cabecera                   | Cierra la conversación y devuelve el foco a Tumi            |
| Escape                             | Cierra la conversación abierta                              |
| Ojo tachado                        | Oculta el personaje y cierra/cancela la conversación activa |
| Mostrar Tumi                       | Restaura la mascota                                         |
| Escuchar saludo / Detener voz      | Inicia o detiene explícitamente el saludo del navegador     |
| Abrir chat contextual      | Abre el chat contextual de misión                           |

Se retiraron el botón de pausa manual y la X inferior. El cierre permanece únicamente en la cabecera. Los iconos mantienen nombres accesibles, tooltip y objetivos de pulsación de 44 px. El movimiento se suspende automáticamente al conversar, ocultar la mascota o usar la guía contextual.

Desde el panel flotante o el chat contextual, **Guía local** hace que Tumi acompañe el mouse y explique los controles al pasar sobre ellos. **Salir de guía** devuelve al acompañante a su modo autónomo. En pantallas de hasta 600 px, el acompañante queda a media altura en el borde derecho. En táctil, el primer toque muestra la explicación y el segundo activa el control.

## Movimiento autónomo

- Tamaño actual: 75 px de ancho en escritorio y 64 px en móvil.
- Primera decisión de recorrido a los 9 segundos; siguientes cada 9–20 segundos.
- Prioriza bordes, mantiene un margen geométrico de 8 px respecto a obstáculos y revisa destino y recorrido.
- Considera controles, formularios, menús, encabezados, párrafos y elementos marcados con `data-tumi-avoid`.
- Un lugar sin recorrido libre no se fuerza. Si todo está ocupado, puede quedarse quieto o dejar un acceso compacto «Abrir Tumi».
- El arrastre distingue clic de movimiento con un umbral de 6 px y conserva la ubicación unos 30 segundos, salvo colisión o cambio de tamaño.
- Los cambios de layout pueden requerir recolocación inmediata para despejar controles; los recorridos libres usan interpolación suave.

El arrastre usa Pointer Events y captura del puntero. Los gestos normales de scroll móvil no hacen que Tumi persiga el dedo. Con movimiento reducido se desactivan viajes y animaciones, conservando interacción manual y conversación. No hay frames continuos mientras reposa; la pestaña oculta detiene los recorridos efectivos. La prevención de obstáculos es geométrica, no una comprensión semántica de toda la interfaz.

## Expresiones y emociones del texto

La emoción es independiente del desplazamiento. El catálogo admite alegría, sonrisa, guiño, sorpresa, curiosidad, pensamiento, entendimiento, enfoque, aprobación, motivación, logro, dudas, confusión, preocupación, tristeza, enojo leve, cansancio, sueño, saludo, despedida y otras variantes de presentación. Las expresiones comparten rasgos vectoriales; no son 30 sprites independientes.

El detector local reconoce señales sencillas en español, con acentos/mayúsculas normalizados y algunos emojis:

| Mensaje de ejemplo              | Reacción                                  |
| ------------------------------- | ----------------------------------------- |
| Estoy feliz, ¡lo logré!         | Alegría                                   |
| Hoy me siento triste 😢         | Gesto apenado y respuesta cálida          |
| Estoy enojado 😡                | Enojo leve y respuesta tranquila          |
| No estoy triste, estoy contenta | Alegría                                   |
| Estoy feliz pero también triste | Comprensión, sin asumir una emoción única |
| ¿Dónde está el mapa?            | Expresión neutral y orientación local     |

El resultado describe señales del texto. No conoce realmente el estado emocional de una persona, no es diagnóstico y puede fallar con ironía, citas, ambigüedad, otros idiomas o negaciones complejas. No se guarda un perfil emocional. Tras enviar, Tumi muestra pensamiento y después la reacción al mensaje; un mensaje posterior sin señales vuelve a neutral.

En autonomía, otra temporización cambia el rostro sin reiniciar la ruta: primera variación en 8–12 segundos y siguientes cada 8–15. Evita repetir la expresión anterior y utiliza emociones suaves; con inactividad aparecen cansancio o sueño. No elige tristeza ni enojo al azar. Se suspende al conversar, pausar internamente, hablar, ocultarse, utilizar la guía contextual, ocultar la pestaña o activar movimiento reducido.

## Conversación y límites actuales

El panel mantiene hasta 40 mensajes en memoria durante la visita del componente. En modo local, las respuestas salen de la guía integrada y el panel muestra «Sin IA conectada». Cuando se activa GPT en desarrollo, el panel identifica ese modo y envía el mensaje escrito y el contexto acotado de la vista al backend.

La guía local responde sobre navegación, mapa espacial, lugares de la Tierra, tripulación y monitoreo diario. Los mensajes emocionales reciben reconocimiento orientativo y tranquilo; las preguntas explícitas de navegación conservan prioridad. Las preguntas abiertas fuera del alcance explican que todavía no hay un modelo de IA conectado.

Cerrar, ocultar o desmontar aborta la operación. Un resultado tardío no puede reabrir ni actualizar una conversación cerrada. Un error recuperable conserva la pregunta para volver a enviarla. El saludo con voz requiere una acción explícita y depende de las voces disponibles y de las políticas del navegador; su calidad audible no es idéntica entre dispositivos.

## Estructura para mantenimiento

| Archivo o zona                            | Responsabilidad                                                |
| ----------------------------------------- | -------------------------------------------------------------- |
| `CursorAssistantScreen.tsx`               | Composición, capacidades inyectadas y acceso al chat de misión |
| `useCursorAssistantViewModel.ts`          | Estado, mensajes, cancelación, voz y reacción emocional        |
| `components/CursorAssistantView.tsx`      | Panel y callbacks accesibles                                   |
| `shared/tumi/TumiTechPortrait.tsx`         | Cabeza SVG, expresiones y rasgos del personaje                 |
| `useTumiMotion.ts`                        | Geometría del viewport, obstáculos, recorridos y arrastre      |
| `behavior.ts`                             | Máquina de estados y comprobaciones geométricas portables      |
| `emotions.ts`                             | Traducción de señales textuales y variedad facial autónoma     |
| `domain/assistant/TumiConversation.ts`    | Puerto asíncrono cancelable y mensajes                         |
| `domain/assistant/detectTextEmotion.ts`   | Heurística textual portable y reconocimiento local             |
| `data/assistant/LocalTumiConversation.ts` | Respuestas locales de demostración                             |
| `di/createTumiDependencies.client.ts`     | Composición del adapter actual                                 |
| `infrastructure/speech/browserVoice.ts`   | Voz del navegador y cancelación de la locución propia          |
| `cursor-assistant.css`                    | Movimiento, panel, tamaños y accesibilidad visual              |

`MissionAssistantScreen` monta el acompañante en portada, explorador y misión y lo suspende mientras el chat contextual o la guía están activos. El modo GPT usa el endpoint local de Spring Boot documentado en OpenAPI.

Ambos chats pueden usar OpenAI mediante `HttpTumiConversation`, que conserva `AbortSignal` y llama a Spring Boot. Cada pantalla aporta un resumen acotado mediante `useTumiViewContext`. En Tripulación se adjuntan los indicadores, el módulo o la muestra y su referencia cuando se seleccionan. El explorador aporta el destino o centro abierto. Las fichas históricas identifican su propia procedencia. El backend añade el catálogo del proyecto y solicita una respuesta breve con una reacción validada. La opción para abrir Fuentes y alcance sigue resolviéndose por una acción local. El diario, los borradores y la transcripción previa quedan fuera de las solicitudes. Consulta el [arranque local](../../backend/README.md#chat-flotante-de-tumi-con-gpt-en-local) y la [activación en GitHub Pages](../../backend/README.md#gpt-en-github-pages). Pages usa la guía local mientras no se configure la URL del backend.

Para incorporar una expresión, ampliar `TumiEmotion`, los rasgos de `TumiTechPortrait` y el mapper correspondiente. Para proteger una zona de la página, añadir `data-tumi-avoid`. No reutilizar el detector como evaluación psicológica ni como regla médica.

## Evolución y recursos conservados

1. Se creó el acompañante con la imagen dorada original, separación respecto al cursor, seguimiento suave, mirada direccional, reposo y acceso al chat de misión.
2. Se ajustaron tamaño, rebotes, tocado, expresión y saludo de voz explícito. El tamaño actual de 75 px reemplaza las solicitudes previas de 10 y 60 px.
3. Se conservó la imagen original y se generó un PNG transparente para eliminar fondo y halo. El recurso y su procedencia siguen disponibles para reutilización.
4. La nueva lámina tecnológica y el video dieron paso al retrato SVG actual, con autonomía, arrastre y panel funcional.
5. Se añadieron reacciones al tono del texto y variación facial autónoma.
6. Los controles quedaron con ojo tachado para ocultar y X superior para cerrar, sin pausa manual ni X inferior.

| Recurso                                          | Uso                                                       |
| ------------------------------------------------ | --------------------------------------------------------- |
| `public/brand/tumi-cursor-reference.jpeg`        | Referencia dorada inicial aportada por el usuario         |
| `public/brand/tumi-cursor-clean.png`             | Derivado transparente de la etapa anterior                |
| `public/brand/tumi-cursor-clean.md`              | Procedencia y prompt de limpieza                          |
| `components/TumiPortrait.tsx`                    | Presentación anterior conservada; no es el retrato activo |
| `public/brand/tumi-ia-expression-reference.jpeg` | Lámina tecnológica aportada por el usuario                |
| `shared/tumi/TumiTechPortrait.tsx`                | Recurso vectorial activo basado en la lámina              |

La interpretación SVG no es una copia idéntica de píxeles ni un modelo 3D. El video original de 4,15 segundos se utilizó como referencia visual; no forma parte del runtime ni se publica con esta entrega. No se asigna una licencia nueva al material aportado por el usuario.

## Verificación y ejecución

Desde la raíz:

```bash
npm ci
npm run dev
npm run check
npm test
npm run build
npm run test:e2e --workspace frontend -- cursor-assistant.spec.ts
```

`npm run check` incluye formato global: si falla, las fases posteriores no se ejecutan y deben verificarse por separado. Consultar el registro de QA para distinguir checks aprobados del bloqueo preexistente de formato. Las pruebas unitarias cubren estados, geometría, cancelación, emociones, negaciones y temporizadores. E2E comprueba conversación, reacciones, navegación/recarga, controles finales, arrastre y móvil táctil con movimiento reducido.
