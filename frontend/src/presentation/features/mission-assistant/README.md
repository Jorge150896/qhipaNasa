# Tumi, asistente de misión

El asistente vive en `MissionAssistantProvider`, montado como isla cliente por el layout raíz. Conserva conversación y modo de guía al navegar entre las secciones, el explorador, Tierra y los distintos hábitats. La conversación vive en memoria y se reinicia al recargar. La portada no muestra el chat: el acceso se monta en el dock del shell. El layout raíz conserva su naturaleza de servidor.

`MissionWorkspaceProvider` publica la instantánea vigente mediante `AssistantMissionContext` y la retira al desmontarse. En el explorador y Tierra no se atribuyen lecturas a una tripulación anterior; siguen disponibles las explicaciones locales de navegación. Un contexto de muestra elegido explícitamente conserva su persona y hora identificadas hasta quitarlo.

Las respuestas locales usan la persona seleccionada, la calidad y la hora de su instantánea, el módulo consultado y los chequeos guardados. Las preguntas se reconocen por temas, con ejemplos en el chat. El robot señala controles mediante identificadores de UI y deja que la persona decida si los pulsa.

El dictado requiere un navegador que admita reconocimiento en el dispositivo y un paquete de voz en español. El micrófono se solicita al elegir Dictar. La transcripción queda como borrador hasta pulsar Enviar y la escritura siempre está disponible.

Tumi empieza en modo Fijo. La Guía con el puntero se activa en el chat y acompaña el cursor por el panel. Solo muestra ayuda en controles registrados, tras una pausa de 900 ms del puntero; recorrer el control reinicia la espera. Deja al menos 1800 ms entre sugerencias. Salir del control, hacer clic, desplazar la página o cambiar de vista cancela la ayuda pendiente. El foco intencional por teclado conserva la explicación inmediata. En pantallas táctiles, el primer toque explica el control y el segundo lo usa. «Salir de guía» o Escape devuelven a Tumi al modo Fijo. Con movimiento reducido se muestran los avisos sin desplazar el robot.

La guía está disponible en los nueve apartados de misión, Mapa y Tierra. Los identificadores explícitos conservan explicaciones específicas para navegación, lecturas, comparación y guardado. El fondo, los campos y los botones sin ayuda propia no generan sugerencias. La explicación general del apartado se consulta voluntariamente en «¿Qué puedo hacer aquí?». El chat y sus controles se excluyen de la inspección. Las explicaciones se distribuyen con la aplicación: no hay aprendizaje automático ni lectura de datos fuera del contexto suministrado.

El shell publica el apartado activo mediante `setSection`. La sugerencia «¿Qué puedo hacer aquí?» usa ese apartado, incluso en Tierra al cambiar de pestaña sin cambiar el pathname. Esta explicación no depende de que haya telemetría cargada.

Las tarjetas de telemetría ofrecen «Preguntar por este dato» desde la guía. Con teclado, enfoca la tarjeta y pulsa `?`. El chat conserva la lectura, la persona y la hora de origen hasta quitar el contexto o seleccionar otra tarjeta. «¿Qué cambió?» compara con la primera muestra disponible de la serie y señala cuándo falta una lectura vigente.

## Guía de conocimiento

Para ampliar la guía, registrar solo controles cuya explicación aporte información adicional a su etiqueta; no asociar el fondo de una sección ni añadir una explicación genérica a todos sus campos. La orientación general pertenece a «¿Qué puedo hacer aquí?». Mantener la espera y cancelación verificadas en `frontend/tests/assistantCoachmark.test.tsx` y los recorridos de `frontend/tests/e2e/mission-assistant.spec.ts`. El resumen de entrega y validaciones está en [mission-console-delivery.md](../../../../../docs/development/mission-console-delivery.md).

`missionKnowledge.ts` contiene el catálogo de controles y las preguntas sobre el proyecto. Al cambiar un control o un flujo, revisar las entradas que lo describen.

La guía se ejecuta en el navegador con reglas locales. Tumi contesta preguntas formuladas de distintas maneras dentro de los temas previstos. Puede retomar la última señal explicada mientras sigan seleccionados el mismo tripulante y escenario. El contexto fijado explícitamente desde un control conserva su persona, valor y hora de origen hasta quitarlo o reemplazarlo.

En Tripulación, selecciona un punto de la gráfica y usa «Preguntar a Tumi por esta muestra» desde la línea de tiempo. Si ya elegiste dos horas en «Comparar dos muestras», «Preguntar a Tumi por la comparación» adjunta ese par. La diferencia usa los valores de esas horas. El módulo y la actividad provienen de la instantánea únicamente cuando coincide con la hora de la muestra. «¿Cómo se relaciona la lectura con el entorno?» explica el vínculo por hora UTC y muestra las mediciones ambientales del módulo cuando hay contexto. Tumi identifica las muestras o ubicaciones ausentes y explica el límite de la coincidencia temporal para interpretar causas.

El contenido se distribuye con la app. El historial del chat se mantiene en memoria y el dictado conserva su funcionamiento local cuando lo admite el navegador.
