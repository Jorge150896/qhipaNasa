# Nami IA: guía de entrega y reutilización

Estado de la entrega del 15 de noviembre de 2026. Esta guía reúne el acompañante flotante, sus expresiones, conversación y controles. El detalle de implementación está en el [README de la feature](../../frontend/src/presentation/features/cursor-assistant/README.md); las ejecuciones y capturas están en [verificación](../qa/verification.md).

## Qué puede hacer

Nami aparece como una cabeza tecnológica dorada con visor oscuro y rasgos turquesa. Se desplaza de forma moderada por espacios libres, observa el puntero, parpadea, inclina la cabeza y mueve suavemente el tocado. Al pulsarlo abre una conversación cerca de su posición y suspende los recorridos. Puede arrastrarse manualmente a otra zona libre.

El acompañante está disponible en el explorador y la misión. En misión ofrece acceso al chat contextual existente. Solo hay una instancia del acompañante por página. El Nami del loader y la guía de misión conservan sus funciones; esta entrega no modifica los modelos 3D ni los registros de salud.

## Controles finales

La cabecera ya no muestra un botón «Nami» y no se crea otro lanzador fijo al retirarlo. El chat contextual se abre desde la mascota flotante mediante «Abrir chat contextual» o desde una ficha de lectura. Se mantiene el control «Salir de guía» mientras ese modo está activo.

| Control                            | Resultado                                                   |
| ---------------------------------- | ----------------------------------------------------------- |
| Pulsar o tocar la cabeza           | Abre o cierra la conversación                               |
| Campo «Mensaje para Nami» y Enviar | Envía hasta 600 caracteres a la guía local                  |
| X de la cabecera                   | Cierra la conversación y devuelve el foco a Nami            |
| Escape                             | Cierra la conversación abierta                              |
| Ojo tachado                        | Oculta el personaje y cierra/cancela la conversación activa |
| Mostrar Nami                       | Restaura la mascota                                         |
| Texto / Audio                     | Elige si Nami lee sus respuestas en voz alta                |
| Escuchar saludo / Detener voz      | Inicia o detiene explícitamente el saludo del navegador     |
| Abrir chat contextual      | Abre el chat contextual de misión                           |

Se retiraron el botón de pausa manual y la X inferior. El cierre permanece únicamente en la cabecera. Los iconos mantienen nombres accesibles, tooltip y objetivos de pulsación de 44 px. El movimiento se suspende automáticamente al conversar, ocultar la mascota o usar la guía contextual.

El globo flotante muestra invitaciones ocasionales. Pulsa el lápiz para preguntar, lee la respuesta en el mismo globo y vuelve a escribir en el campo. **Opciones** reúne el audio, la guía y el acceso al chat contextual.

Desde **Opciones** o el chat contextual, **Guía local** hace que Nami acompañe el mouse y explique los controles al pasar sobre ellos. **Salir de guía** devuelve al acompañante a su modo autónomo. En pantallas de hasta 600 px, Nami queda fijo abajo a la derecha, encima de la barra de navegación cuando está presente. En táctil, el primer toque muestra la explicación y el segundo activa el control.

Nami empieza en **Texto**. En **Audio**, el navegador lee las nuevas respuestas de ambos chats y mantiene la transcripción visible. Cambiar a Texto o cerrar el chat detiene la reproducción. La app abre con el tema oscuro.

En **Monitoreo diario**, elegir Bien, Regular o Triste reproduce una respuesta breve de Nami que invita a contar qué influyó en el ánimo. Durante la lectura, Nami cambia de expresión y las palabras aparecen debajo del saludo. Cuando la voz del navegador no indica el avance exacto, el texto se revela a un ritmo aproximado. El botón de audio permite detener o repetir la respuesta. Si el navegador no puede reproducirla, aparece «Leer respuesta». En Resultado, Nami resume la actividad, el momento y las respuestas principales después de que se guarda el chequeo. El resumen se genera en el navegador y omite las notas.

## Movimiento autónomo

- Tamaño actual: 75 px de ancho en escritorio y 64 px en móvil.
- Primera decisión de recorrido a los 9 segundos; siguientes cada 9–20 segundos.
- Prioriza bordes, mantiene un margen geométrico de 8 px respecto a obstáculos y revisa destino y recorrido.
- Considera controles, formularios, menús, encabezados, párrafos y elementos marcados con `data-tumi-avoid`.
- Un lugar sin recorrido libre no se fuerza. Si todo está ocupado, puede quedarse quieto o dejar un acceso compacto «Abrir Nami».
- El arrastre distingue clic de movimiento con un umbral de 6 px y conserva la ubicación unos 30 segundos, salvo colisión o cambio de tamaño.
- Los cambios de layout pueden requerir recolocación inmediata para despejar controles; los recorridos libres usan interpolación suave.

El arrastre usa Pointer Events y captura del puntero. Los gestos normales de scroll móvil no hacen que Nami persiga el dedo. Con movimiento reducido se desactivan viajes y animaciones, conservando interacción manual y conversación. No hay frames continuos mientras reposa; la pestaña oculta detiene los recorridos efectivos. La prevención de obstáculos es geométrica, no una comprensión semántica de toda la interfaz.

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

El resultado describe señales del texto. No conoce realmente el estado emocional de una persona, no es diagnóstico y puede fallar con ironía, citas, ambigüedad, otros idiomas o negaciones complejas. No se guarda un perfil emocional. Tras enviar, Nami muestra pensamiento y después la reacción al mensaje; un mensaje posterior sin señales vuelve a neutral.

En autonomía, otra temporización cambia el rostro sin reiniciar la ruta: primera variación en 8–12 segundos y siguientes cada 8–15. Evita repetir la expresión anterior y utiliza emociones suaves; con inactividad aparecen cansancio o sueño. No elige tristeza ni enojo al azar. Se suspende al conversar, pausar internamente, hablar, ocultarse, utilizar la guía contextual, ocultar la pestaña o activar movimiento reducido.

## Conversación y límites actuales

El panel mantiene hasta 40 mensajes en memoria durante la visita del componente. En modo local, las respuestas salen de la guía integrada y el panel muestra «Sin IA conectada». Cuando se activa GPT en desarrollo, el panel identifica ese modo y envía el mensaje escrito y el contexto acotado de la vista al backend.

La guía local responde sobre navegación, mapa espacial, lugares de la Tierra, tripulación y monitoreo diario. Los mensajes emocionales reciben reconocimiento orientativo y tranquilo; las preguntas explícitas de navegación conservan prioridad. Las preguntas abiertas fuera del alcance explican que todavía no hay un modelo de IA conectado.

Cerrar, ocultar o desmontar aborta la operación. Un resultado tardío no puede reabrir ni actualizar una conversación cerrada. Un error recuperable conserva la pregunta para volver a enviarla. Al entrar en Monitoreo diario, Nami lee la pregunta de entrada si el navegador permite la reproducción automática. El botón «Escuchar pregunta» puede iniciarla manualmente. En inglés, Opciones → Nami’s voice permite elegir y guardar otra voz disponible. El español conserva su selección original.

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

`MissionAssistantScreen` monta el acompañante en el explorador y la misión y lo suspende mientras el chat contextual o la guía están activos. El modo GPT usa el endpoint local de Spring Boot documentado en OpenAPI.

Ambos chats pueden usar OpenAI mediante `HttpTumiConversation`, que conserva `AbortSignal` y llama a Spring Boot. Cada pantalla aporta un resumen acotado mediante `useTumiViewContext`. En Tripulación se adjuntan los indicadores, el módulo o la muestra y su referencia cuando se seleccionan. El explorador aporta el destino o centro abierto. Las fichas históricas identifican su propia procedencia. El backend añade el catálogo del proyecto y solicita una respuesta breve con una reacción validada. La opción para abrir Fuentes y alcance sigue resolviéndose por una acción local. El diario, los borradores y la transcripción previa quedan fuera de las solicitudes. Consulta el [arranque local](../../backend/README.md#chat-flotante-de-tumi-con-gpt-en-local) y la [activación en GitHub Pages](../../backend/README.md#gpt-en-github-pages). Pages usa la guía local mientras no se configure la URL del backend.

Para incorporar una expresión, ampliar `TumiEmotion`, los rasgos de `TumiTechPortrait` y el mapper correspondiente. Para proteger una zona de la página, añadir `data-tumi-avoid`. No reutilizar el detector como evaluación psicológica ni como regla médica.

## Retrato y animación de Nami

`shared/tumi/TumiTechPortrait.tsx` representa la cabeza, el casco y el visor con geometría vectorial basada en el GIF proporcionado por el usuario. `tumi-portrait.css` anima la flotación, la elevación del casco, la sonrisa y el parpadeo en portada y carga. El acompañante, el chat, el chequeo y la simulación comparten el mismo retrato y sus expresiones contextuales. La guía y el desplazamiento conservan sus controladores de movimiento.

El SVG se dibuja sobre transparencia y se renderiza a la resolución de la pantalla. La pausa y la preferencia de movimiento reducido se aplican a las capas animadas. La procedencia se registra en `frontend/public/brand/README.md`.

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
