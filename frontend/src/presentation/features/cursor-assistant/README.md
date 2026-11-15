# Tumi IA: mascota y guía local

[Guía completa de entrega, evolución, controles y reutilización](../../../../../docs/development/tumi-ia.md).

Cabeza tecnológica flotante dorada con visor oscuro y expresiones turquesa, basada en la lámina del usuario del 15 de noviembre de 2026. La referencia original se conserva en `public/brand/tumi-ia-expression-reference.jpeg`. El video adjunto de 4,15 segundos se revisó como referencia de reacción facial; no se reproduce ni se descarga desde servicios externos.

## Composición y alcance

`CursorAssistantScreen -> useCursorAssistantViewModel -> CursorAssistantView`. El Screen recibe las dependencias compuestas y el acceso opcional al chat de misión. El ViewModel controla conversación, voz explícita, pausa, ocultación, cancelación y emoción. `useTumiMotion` administra exclusivamente geometría y eventos visuales del navegador; `behavior.ts` contiene las transiciones y comprobaciones geométricas portables.

Una instancia por página: el host raíz cubre portada/explorador y MissionAssistantScreen monta la de misión, con suspensión mientras se usa el chat médico o la guía contextual. No se alteran lecturas, registros, almacenamiento, rutas ni modelos 3D.

## Estados y personalidad

Estados: reposo, movimiento, reacción, conversación, espera de respuesta, arrastre y pausa. Las intenciones de movimiento se ignoran en conversación/espera/pausa. La emoción es independiente de la locomoción. El retrato vectorial interpreta la referencia, sin fondo raster, contorno blanco ni nuevos brazos/piernas permanentes. No es una reproducción idéntica de píxeles ni una malla 3D.

El catálogo admite neutral, felicidad, alegría, guiño, risa, sorpresa, curiosidad, pensamiento, entendimiento, aprobación, asombro, enfoque, motivación, logro, dudas, confusión, preocupación, tristeza, cansancio, sueño, alerta, saludo, búsqueda, escritura, procesamiento, carga, conexión, despedida y timidez. Las variantes comparten estructura facial; no todas equivalen a sprites distintos ni se activan aleatoriamente en la interfaz. El uso normal enlaza curiosidad/desplazamiento, guiño/hover, saludo/apertura, pensamiento/espera, felicidad/respuesta, preocupación/error, despedida/cierre y sueño/inactividad sin destino disponible. No se atribuyen emociones clínicas ni capacidad real de razonamiento.

## Movimiento y espacio disponible

Primer intento tras 9 segundos; decisiones posteriores cada 9–20 segundos. Solo viaja cuando encuentra destino y recorrido libres; en pantallas ocupadas puede quedarse quieto. Prioriza bordes y reduce el tamaño de 75 a 64 px en móvil. Inspecciona controles, encabezados, párrafos, etiquetas, menús, diálogos y `data-tumi-avoid`, con margen de 8 px. No se leen layout/obstáculos en cada frame; se actualizan al decidir, redimensionar, desplazar, enfocar o cambiar contenido.

La comprobación es geométrica y conservadora, no una comprensión semántica de toda la página. Una franja mínima de 20 px protege los bordes; el botón de restauración respeta safe-area. Si no queda espacio, se retira visualmente el cuerpo y queda un acceso compacto «Abrir Tumi». La navegación sigue accesible. Los cambios de layout pueden exigir recolocación inmediata para despejar controles; los viajes autónomos usan interpolación suave. Un destino sin recorrido libre no se fuerza.

Arrastre con Pointer Events, captura del puntero y umbral de 6 px para separar clic/toque. Respeta la posición durante 30 segundos, salvo colisiones o cambio de viewport. En móvil no persigue gestos de scroll. La preferencia de movimiento reducido impide viajes autónomos y animaciones CSS, conservando arrastre manual y conversación. Frames solo mientras viaja; pestaña oculta cancela frames y decisiones efectivas.

## Conversación y futura integración

`domain/assistant/detectTextEmotion` identifica señales textuales sencillas de alegría, tristeza o enojo en español y algunos emojis. Normaliza acentos/mayúsculas, contempla negaciones cercanas y evita algunos relatos sobre terceros. Señales contradictorias producen una reacción comprensiva; textos sin señales vuelven a neutral. No es IA, diagnóstico ni reconocimiento fiable de sentimientos: puede fallar con ironía, citas, contexto o negaciones complejas. No se crea un perfil emocional ni se guarda el resultado.

Al enviar un mensaje, Tumi piensa y después conserva la expresión acorde al tono detectado; el adapter local ofrece una respuesta cálida ante mensajes emocionales. La reacción de enojo es leve y su respuesta permanece tranquila. Una consulta explícita de navegación conserva prioridad sobre la respuesta emocional genérica.

En autonomía, un temporizador independiente varía la expresión cada 8–15 segundos (primera variación en 8–12), evitando repetir inmediatamente la anterior. Usa curiosidad, alegría, guiño, sorpresa, timidez o entusiasmo, y cansancio/sueño tras inactividad. No elige tristeza o enojo al azar. Se suspende durante chat, voz, pausa, ocultación, guía de misión, pestaña oculta o movimiento reducido. Los cambios faciales no reinician el recorrido ni mueven el panel.

El panel cercano permite enviar hasta 600 caracteres, conserva hasta 40 mensajes en memoria y se cierra con Escape, con devolución de foco. Abrirlo suspende desplazamientos automáticamente; no ofrece un botón de pausa manual. Se puede ocultar la mascota con el ojo tachado y cerrar la conversación únicamente con la X de la cabecera: la X inferior fue retirada. Los iconos mantienen nombres accesibles y área de pulsación de 44 px. No guarda conversaciones ni usa micrófono. La voz de saludo sigue siendo explícita y depende del navegador.

`domain/assistant/TumiConversation` es el puerto asíncrono cancelable. `data/assistant/LocalTumiConversation` implementa orientación determinista sobre la web; `di/createTumiDependencies.client` lo inyecta. La interfaz anuncia «Sin IA conectada». Preguntas abiertas reciben una explicación de ese límite. El chat de misión existente sigue accesible mediante «Conversar con Tumi» y conserva su contexto; no se duplican sus reglas médicas.

Para incorporar IA real, sustituir el adapter mediante DI y acordar el contrato con Java/Spring Boot. No hay endpoint inventado, credenciales en frontend ni petición a un proveedor. Cerrar/ocultar/desmontar aborta la operación; resultados obsoletos no actualizan mensajes. Los errores recuperables conservan el texto para reintentar.

## Validación

`tests/tumiBehavior.test.ts`: prioridades de estados, separación de obstáculos, límites, aborto del adapter y descarte de respuestas tardías. `tests/e2e/cursor-assistant.spec.ts`: conversación real con guía local, estados de espera, navegación/recarga, pausa/ocultación, chat de misión, autonomía, arrastre y móvil con movimiento reducido. Las pruebas antiguas que exigían persecución constante del cursor o la imagen anterior fueron sustituidas por los criterios actuales.
