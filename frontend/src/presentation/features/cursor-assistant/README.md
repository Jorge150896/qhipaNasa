# Nami IA: mascota y guía local

[Guía completa de entrega, evolución, controles y reutilización](../../../../../docs/development/tumi-ia.md).

El acompañante usa el retrato vectorial compartido de Nami, reconstruido a partir del GIF proporcionado por el usuario. La cabeza conserva su casco dorado, visor oscuro y expresiones turquesa.

## Composición y alcance

`CursorAssistantScreen -> useCursorAssistantViewModel -> CursorAssistantView`. El Screen recibe las dependencias compuestas y el acceso opcional al chat de misión. El ViewModel controla conversación, voz explícita, pausa, ocultación, cancelación y emoción. `useTumiMotion` administra exclusivamente geometría y eventos visuales del navegador; `behavior.ts` contiene las transiciones y comprobaciones geométricas portables.

`MissionAssistantScreen` monta una instancia en el explorador y la misión. Al abrir el chat contextual o la guía, suspende el acompañante. No se alteran lecturas, registros, almacenamiento, rutas ni modelos 3D.

## Estados y personalidad

Estados: reposo, movimiento, reacción, conversación, espera de respuesta, arrastre y pausa. Las intenciones de movimiento se ignoran en conversación/espera/pausa. La emoción es independiente de la locomoción. El retrato vectorial interpreta la referencia, sin fondo raster, contorno blanco ni nuevos brazos/piernas permanentes. No es una reproducción idéntica de píxeles ni una malla 3D.

El catálogo admite neutral, felicidad, alegría, guiño, risa, sorpresa, curiosidad, pensamiento, entendimiento, aprobación, asombro, enfoque, motivación, logro, dudas, confusión, preocupación, tristeza, cansancio, sueño, alerta, saludo, búsqueda, escritura, procesamiento, carga, conexión, despedida y timidez. Las variantes comparten estructura facial; no todas equivalen a sprites distintos ni se activan aleatoriamente en la interfaz. El uso normal enlaza curiosidad/desplazamiento, guiño/hover, saludo/apertura, pensamiento/espera, felicidad/respuesta, preocupación/error, despedida/cierre y sueño/inactividad sin destino disponible. No se atribuyen emociones clínicas ni capacidad real de razonamiento.

## Movimiento y espacio disponible

Primer intento tras 9 segundos; decisiones posteriores cada 9–20 segundos. Solo viaja cuando encuentra destino y recorrido libres; en pantallas ocupadas puede quedarse quieto. Prioriza bordes y reduce el tamaño de 75 a 64 px en móvil. Inspecciona controles, encabezados, párrafos, etiquetas, menús, diálogos y `data-tumi-avoid`, con margen de 8 px. No se leen layout/obstáculos en cada frame; se actualizan al decidir, redimensionar, desplazar, enfocar o cambiar contenido.

La comprobación es geométrica y conservadora, no una comprensión semántica de toda la página. Una franja mínima de 20 px protege los bordes; el botón de restauración respeta safe-area. Si no queda espacio, se retira visualmente el cuerpo y queda un acceso compacto «Abrir Nami». La navegación sigue accesible. Los cambios de layout pueden exigir recolocación inmediata para despejar controles; los viajes autónomos usan interpolación suave. Un destino sin recorrido libre no se fuerza.

Arrastre con Pointer Events, captura del puntero y umbral de 6 px para separar clic/toque. Respeta la posición durante 30 segundos, salvo colisiones o cambio de viewport. En móvil no persigue gestos de scroll. La preferencia de movimiento reducido impide viajes autónomos y animaciones CSS, conservando arrastre manual y conversación. Frames solo mientras viaja; pestaña oculta cancela frames y decisiones efectivas.

## Conversación y futura integración

El globo de Nami aparece brevemente al lado del personaje mientras navegas. Al pulsarlo se abre el chat. El botón «Escuchar respuesta» vuelve a leer la última respuesta con la voz del navegador. El texto hablado desarrolla unidades y separadores que en el chat aparecen abreviados.

`domain/assistant/detectTextEmotion` identifica señales textuales sencillas de alegría, tristeza o enojo en español y algunos emojis. Normaliza acentos/mayúsculas, contempla negaciones cercanas y evita algunos relatos sobre terceros. Señales contradictorias producen una reacción comprensiva; textos sin señales vuelven a neutral. No es IA, diagnóstico ni reconocimiento fiable de sentimientos: puede fallar con ironía, citas, contexto o negaciones complejas. No se crea un perfil emocional ni se guarda el resultado.

Al enviar un mensaje, Nami piensa y después conserva la expresión acorde al tono detectado; el adapter local ofrece una respuesta cálida ante mensajes emocionales. La reacción de enojo es leve y su respuesta permanece tranquila. Una consulta explícita de navegación conserva prioridad sobre la respuesta emocional genérica.

En autonomía, un temporizador independiente varía la expresión cada 8–15 segundos (primera variación en 8–12), evitando repetir inmediatamente la anterior. Usa curiosidad, alegría, guiño, sorpresa, timidez o entusiasmo, y cansancio/sueño tras inactividad. No elige tristeza o enojo al azar. Se suspende durante chat, voz, pausa, ocultación, guía de misión, pestaña oculta o movimiento reducido. Los cambios faciales no reinician el recorrido ni mueven el panel.

Al entrar a una vista de la misión o cambiar de pestaña, Nami presenta la pantalla con un mensaje breve. Cambiar una lectura o un tripulante dentro de la misma vista no repite la presentación. El globo aparece por unos segundos y se puede abrir con el lápiz o pulsando al personaje. Omite las invitaciones mientras hay un campo de texto activo y pausa su cierre si recibe foco. El saludo y la última respuesta aparecen palabra por palabra dentro del mismo globo que contiene el campo de hasta 600 caracteres. La boca acompaña la aparición del texto y el audio. Con movimiento reducido se muestra el texto completo de inmediato. El cierre devuelve el foco a Nami. El icono de ajustes conserva el formato Texto/Audio, la guía, el chat contextual y la opción de ocultar al personaje.

El acompañante reutiliza la configuración de GPT y el contexto de la vista. La guía local orienta sobre la app y pide reformular las dudas que no reconoce. La conversación se conserva en memoria durante la visita.

Cerrar u ocultar Nami, o salir de la pantalla, cancela las consultas pendientes. Los errores recuperables conservan el texto para reintentar.

## Validación

`tests/tumiBehavior.test.ts`: prioridades de estados, separación de obstáculos, límites, aborto del adapter y descarte de respuestas tardías. `tests/e2e/cursor-assistant.spec.ts`: conversación real con guía local, estados de espera, navegación/recarga, pausa/ocultación, chat de misión, autonomía, arrastre y móvil con movimiento reducido. Las pruebas antiguas que exigían persecución constante del cursor o la imagen anterior fueron sustituidas por los criterios actuales.
