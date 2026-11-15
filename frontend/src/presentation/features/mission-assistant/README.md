# Tumi, asistente de misión

El asistente vive en el layout de cada hábitat para conservar la conversación al ocultar el chat y navegar entre sus secciones. `/explore` monta su propia instancia para Mapa espacial, Mapa de Marte y Centros en Tierra, con preguntas de navegación y acceso a Tripulación para consultar lecturas. Cada conversación vive en memoria durante su recorrido y se reinicia al recargar o salir de él.

Las respuestas locales usan la persona seleccionada, la calidad y la hora de su instantánea, el módulo consultado y los chequeos guardados. Las preguntas se reconocen por temas, con ejemplos en el chat. El robot señala controles mediante identificadores de UI y deja que la persona decida si los pulsa.

El dictado requiere un navegador que admita reconocimiento en el dispositivo y un paquete de voz en español. El micrófono se solicita al elegir Dictar. La transcripción queda como borrador hasta pulsar Enviar y la escritura siempre está disponible.

Tumi empieza en modo Autónomo. La Guía local se activa en el chat y acompaña el cursor por el panel. Los controles con ayuda se resaltan al pasar el puntero o recibir foco por teclado. En pantallas táctiles, el primer toque explica el control y el segundo lo usa. «Salir de guía» o Escape devuelven a Tumi al modo Autónomo. Con movimiento reducido se muestran los avisos sin desplazar el robot.

Las tarjetas de telemetría ofrecen «Preguntar por este dato» desde la guía. Con teclado, enfoca la tarjeta y pulsa `?`. El chat conserva la lectura, la persona y la hora de origen hasta quitar el contexto o seleccionar otra tarjeta. «¿Qué cambió?» compara con la primera muestra disponible de la serie y señala cuándo falta una lectura vigente.

## Guía de conocimiento

`missionKnowledge.ts` contiene el catálogo de controles y las preguntas sobre el proyecto. Al cambiar un control o un flujo, revisar las entradas que lo describen.

Al preguntar por las fuentes, la procedencia o el alcance de los datos, Tumi ofrece «Ver Fuentes y alcance». La acción abre la pantalla del hábitat actual. Desde la portada y el mapa abre la de Odyssey.

La guía se ejecuta en el navegador con reglas locales. Tumi contesta preguntas formuladas de distintas maneras dentro de los temas previstos. Puede retomar la última señal explicada mientras sigan seleccionados el mismo tripulante y escenario. El contexto fijado explícitamente desde un control conserva su persona, valor y hora de origen hasta quitarlo o reemplazarlo.

En Tripulación, selecciona un punto de la gráfica y usa «Preguntar a Tumi por esta muestra» desde la línea de tiempo. Si ya elegiste dos horas en «Comparar dos muestras», «Preguntar a Tumi por la comparación» adjunta ese par. La diferencia usa los valores de esas horas. El módulo y la actividad provienen de la instantánea únicamente cuando coincide con la hora de la muestra. «¿Cómo se relaciona la lectura con el entorno?» explica el vínculo por hora UTC y muestra las mediciones ambientales del módulo cuando hay contexto. Tumi identifica las muestras o ubicaciones ausentes y explica el límite de la coincidencia temporal para interpretar causas.

El contenido se distribuye con la app. El historial del chat se mantiene en memoria y el dictado conserva su funcionamiento local cuando lo admite el navegador.
