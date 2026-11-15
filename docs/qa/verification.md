# Verificación de la base frontend

## Tripulación simplificada (2026-11-15)

Se retiraron la pestaña y el panel «Salud por sistemas», los botones inferiores «Ver corazón», «Ver visión» y «Ver ejercicio», la leyenda de interacción/referencia del visor y el pie de página general solo en Tripulación. Se mantienen Ahora, Historial, Personalización, puntos 3D, lecturas HTML, fichas, módulos y Monitoreo diario. El portal del visor permanece independiente.

`CrewHealthScreen` conserva la lectura de registros para las fichas y la línea de tiempo, sin construir el panel retirado. Los accesos «Ver mis autorregistros» y el ancla antigua `#crew-health-history` abren Historial; `#crew-health` y `#crew-health-review` abren Ahora. No se modifican claves, esquemas ni contenido de storage.

Build, TypeScript y ESLint aprobados. Las 104 pruebas unitarias pasaron al repetir con dos workers tras un timeout inicial del formulario bajo carga. El primer typecheck encontró tipos generados de Next desactualizados; el build los regeneró y el typecheck posterior pasó. `npm run check` queda detenido en formato global por 287 archivos con diferencias existentes; no se reformateó el proyecto completo.

Se aprobaron nueve casos E2E distintos sobre el build actualizado: siete en puerto 3076 y los dos restantes al repetir en 3077. Se ajustó la espera del GLB a su carga asíncrona y la expectativa del título del pulso, que ahora se selecciona desde su botón HTML en lugar del acceso corporal retirado. Cubren escritorio, móvil, recarga, registros persistidos e incompatibles, enlaces anteriores, modelos y hologramas, fallos de GLB/WebGL y sincronización de módulos. Los escenarios del panel eliminado fueron sustituidos por los de la interfaz actual; las pruebas unitarias de datos permanecen.

Capturas revisadas: `crew-simplified-desktop.png` y `crew-simplified-mobile.png`. No se ejecutó toda la suite E2E del proyecto.

## Entrega de Tumi en juanluis3 (2026-11-15)

Se consolidaron uso, arquitectura, evolución, recursos, límites de detección emocional, accesibilidad y futura integración en [la guía de Tumi IA](../development/tumi-ia.md), con referencias desde README, documentación frontend y arquitectura. El panel final conserva ojo tachado para ocultar y X únicamente en la cabecera; se retiraron la pausa manual y la X inferior. La pausa al abrir conversación sigue siendo automática.

TypeScript y ESLint aprobados; `npm run check` se detiene en formato global por 279 archivos preexistentes. El build actualizado de los controles finales pasó. Los cuatro casos de `cursor-assistant.spec.ts` pasaron en el puerto 3075: tono triste/feliz/enojado/neutral, conversación y controles, chat de misión y recarga, autonomía/arrastre y móvil táctil con movimiento reducido. La ejecución unitaria completa más reciente aprobó 107 pruebas. Se actualizaron las capturas de Tumi con los controles finales. No se declara aprobada la suite E2E completa del proyecto ni el formato global.

## Reacciones emocionales de Tumi (2026-11-15)

Detección local orientativa de señales de alegría, tristeza, enojo y mezcla en texto español/emojis, con normalización, negaciones cercanas y algunas exclusiones de terceros. El rostro se ajusta tras responder y vuelve a neutral ante mensajes sin señales. El adapter local ofrece respuestas cálidas y tranquilas a mensajes emocionales; una consulta explícita de navegación conserva prioridad. Sin proveedor de IA, perfil emocional, almacenamiento de estas inferencias ni diagnóstico. Ironía, citas y negaciones complejas pueden interpretarse mal.

Temporizador facial independiente: primera variación en 8–12 segundos y siguientes cada 8–15, sin repetición inmediata. Emociones suaves y cansancio/sueño tras inactividad, sin tristeza/enojo aleatorios. Se suspende durante conversación, pausa, voz, ocultación, guía contextual, pestaña oculta o movimiento reducido.

TypeScript, ESLint, build y 107 pruebas unitarias aprobados. Cuatro E2E aprobados sobre el build actualizado en puerto 3074: secuencia tristeza/alegría/enojo/negación-neutral y respuestas correspondientes, controles/chat de misión/recarga, autonomía/arrastre y móvil táctil con movimiento reducido. Captura de enojo revisada: `tumi-emotion-angry.png`; también se conserva `tumi-emotion-sad.png`. El formato de los archivos de la entrega pasa por separado. `npm run check` sigue detenido en formato global; no se reformatearon archivos ajenos ni se ejecutó toda la suite E2E del proyecto.

## Tumi IA autónomo y conversación local (2026-11-15)

Nueva cabeza tecnológica vectorial basada en la lámina de expresiones del usuario; se conserva la referencia original en `public/brand/tumi-ia-expression-reference.jpeg`. Se revisó un fotograma del video de 4,15 segundos como referencia de reacción facial. No es una copia exacta de píxeles ni una malla 3D. El loader y los modelos de misión permanecen intactos.

Máquina de estados, emociones independientes, decisiones espaciadas de movimiento, selección de destinos/recorridos libres, arrastre con permanencia temporal, pausa y ocultación. Panel próximo con mensajes, espera, cierre/minimización y acceso al chat contextual de misión. Adapter local cancelable bajo el puerto `TumiConversation`; la UI informa que no hay IA conectada. No hay llamadas a un proveedor ni persistencia de conversación.

TypeScript, ESLint, 91 pruebas unitarias y build aprobados. Tres E2E aprobados sobre el build final en puerto 3073: conversación y estados, pausa/ocultar/restaurar, acceso al chat de misión y recarga; autonomía y arrastre con permanencia; móvil táctil, movimiento reducido, respuesta fuera del alcance local, Escape y ancho sin desbordamiento. Capturas revisadas: `tumi-ia-desktop.png` y `tumi-ia-mobile.png`. No se ejecutó toda la suite del proyecto.

Las primeras ejecuciones detectaron un destino repetido sin alternativa, Escape después de perder foco al enviar y un panel que cambiaba de posición al crecer el contenido. Se añadieron destinos cercanos seguros, Escape mientras el panel está abierto y reserva estable de espacio para colocarlo. La prueba de pausa comprueba también el estado antes de cerrar.

`npm run check` se ejecutó: TypeScript y ESLint pasan; el formato global se detiene por 279 archivos existentes. Los archivos de esta entrega pasan Prettier por separado. La prevención de obstáculos es geométrica: si no hay recorrido libre, el personaje permanece quieto o deja un acceso compacto; no comprende semánticamente todo el contenido ni garantiza adaptación a cualquier overlay de terceros.

## Recorte alfa de Tumi (2026-11-15)

Se sustituyó el JPEG usado por el acompañante por `tumi-cursor-clean.png`, derivado transparente generado con la herramienta integrada de edición; se conserva el original y se documenta el prompt en `public/brand/tumi-cursor-clean.md`. PNG RGBA de 1412 × 1114 con fondo alfa cero; se retiró el `drop-shadow` CSS. Se mantiene tamaño visual de 75 px, capas de animación y contorno propio del dibujo. No se declara identidad exacta de píxeles entre la edición y su fuente.

TypeScript, ESLint y build aprobados. Dos casos E2E aprobados en puerto 3063: fuente PNG, lectura de alfa transparente, ausencia de filtro CSS, seguimiento/pausa/acceso a chat y móvil con movimiento reducido. Captura de escritorio revisada sobre fondo oscuro. No se ejecutó toda la suite. `npm run check` se detiene por formato preexistente en 282 archivos ajenos al cambio.

## Tumi 75 px y seguimiento direccional (2026-11-15)

Retrato aumentado de 60 a 75 px de ancho sin sustituir la imagen. Separación reducida, inclinación y giro suaves según dirección horizontal, retorno a ángulo neutro en reposo y asentamiento de posición tras detenerse. En táctil, gestos pasivos sobre contenido, liberación al soltar/cancelar y exclusión de controles. TypeScript, ESLint y build aprobados. En puerto 3061 pasaron táctil, voz, evitación de botones y movimiento reducido; la prueba de escritorio detectó un asentamiento incompleto con pocos cuadros. Tras ajustar el asentamiento pasó el caso completo de escritorio, con derecha/izquierda y retorno neutro, en puerto 3062. No se ejecutó la suite completa. El check global se detiene por formato preexistente en 283 archivos fuera de la feature.

## Tumi compacto y expresivo (2026-11-15)

Personaje reducido a 96 × 80 px, recorte SVG suavizado por curvas, bienvenida breve, reposo discreto y capas independientes de sombrero y boca usando la referencia original. Saludo con voz solo tras pulsar «Escuchar saludo»; cancelación al ocultar/desmontar, preferencia por voz española local y sincronización temporal de boca con eventos de reproducción. Las voces dependen del navegador y no se verificó calidad audible en todos los sistemas.

TypeScript, ESLint, 87 pruebas unitarias y build aprobados. Cuatro casos de `cursor-assistant.spec.ts` aprobados sobre producción (puerto 3060): seguimiento y acceso al chat existente, voz sin autoplay con eventos simulados, botón libre en el destino del personaje, móvil y movimiento reducido. Captura de escritorio revisada visualmente. Los eventos de voz se sustituyen en el E2E; no se certifica el motor de síntesis del sistema. Prettier pasa en los archivos del cambio; `npm run check` sigue detenido por formato preexistente en 283 archivos ajenos. No se ejecutó la suite completa de navegador.

## Acompañante del cursor (2026-11-15)

Imagen JPEG original conservada y recortada visualmente mediante SVG. Seguimiento con separación, retraso, inclinación y reposo; pausa, ocultación y acceso al chat local de misión. TypeScript, ESLint, 87 pruebas unitarias y build aprobados. Los dos recorridos del acompañante pasan: escritorio con acceso al chat (puerto 3058) y móvil/movimiento reducido tras esperar hidratación (puerto 3059). Las primeras ejecuciones detectaron un cálculo de suavizado dependiente del ritmo de cuadros y una lectura de posición anterior a la hidratación; se corrigieron. No se ejecutó toda la suite E2E. Capturas `cursor-assistant-desktop.png` y `cursor-assistant-mobile.png`, revisadas visualmente. `npm run check` se detiene por diferencias preexistentes de formato en 283 archivos fuera de esta feature; los archivos nuevos y modificados del asistente pasan Prettier. El servidor local del puerto 3000 respondió HTTP 200 e incluye la referencia de Tumi.

Cierre documental y reutilización 3D (2026-11-14): se extrajo `StationModel` a componentes compartidos sin cambiar su geometría. Se añadieron guías de entrega y reutilización con contratos, ejemplo, recursos, licencias y límites. TypeScript, ESLint, 53 pruebas unitarias y build aprobados; cuatro recorridos de `visual-models.spec.ts` aprobados sobre producción (puerto 3054). El check global se detiene en Prettier por 176 archivos con formato preexistente. No se ejecutó toda la suite de navegador. Se verificó main sin commits pendientes mediante SSH por 443 con la identidad de host GitHub ya confiada.

Cards individuales junto a todos los puntos (2026-11-14): `LaunchPointCard` reemplaza la agrupación visual en el globo. Cada punto frontal mantiene nombre y acceso al detalle, con línea de conexión y oclusión posterior. La ficha ampliada reserva espacio para un único video. TypeScript, ESLint, 53 pruebas unitarias y build pasan; seis E2E de `launch-sites.spec.ts` pasan sobre producción (puerto 3052), incluidos ocho lugares en móvil, recarga, selección por card, textura fallida y alternativa sin WebGL. Se corrigió la prueba de centrado para medir el punto geográfico, dado que ahora la card está desplazada a su costado. El check global se detiene por formato preexistente en 176 archivos. No se ejecutó la suite completa.

Tarjetas flotantes de Tierra (2026-11-14): ocho lugares comparten una tarjeta anclada a la proyección del marcador en escritorio y situada debajo del globo hasta 1100 px. Nombre, información, cierre y único video conservan selección por URL. TypeScript, ESLint, 53 pruebas unitarias y build aprobados. Los seis casos de `launch-sites.spec.ts` pasaron en el puerto 3048; tras compactar la tarjeta, dos recorridos de móvil/grupos NASA pasaron de nuevo en el puerto 3049. Se revisó la captura `nasa-centers-desktop.png`. Se corrigió una superposición que bloqueaba marcadores y se adaptó la preparación del diario al formulario incorporado desde main. `npm run check` se detuvo en 176 archivos con formato preexistente; el formato de los archivos de esta feature pasa. No se ejecutó la suite completa. La última consulta remota de main no pudo completarse por timeout SSH.

Revisión visual 3D del 2026-11-14: luz lateral, materiales suaves, fondo atenuado y encuadre inicial cercano. TypeScript, ESLint, 53 pruebas unitarias y build aprobados. Cuatro recorridos de `visual-models.spec.ts` aprobados (puerto 3046), incluyendo detalle de Aurora y capturas de los cinco objetos, móvil, recarga y alternativas ante fallos. Se revisaron visualmente las capturas de Tierra, Marte y Aurora. La estación sigue siendo conceptual, no la ISS. `npm run check` se detuvo por formato preexistente; no se ejecutó la suite completa. La consulta remota de main falló por conexión SSH y no se pudo verificar si existen commits nuevos.

## Mapa espacial: revisión del 2026-11-11

Se integró main `c0f641e` en `feature/juanluis`, conservando el exterior mejorado de nave y el nuevo interior modular. TypeScript, ESLint, 53 pruebas unitarias y build aprobados. `npm run check` se detiene en formato (178 archivos, incluidos archivos de main fuera de este ajuste); los archivos de esta mejora pasan Prettier.

Trece casos de `explorer.spec.ts` y `visual-models.spec.ts` pasaron en el puerto 3044. Tras compactar la fila móvil se recompiló y pasaron cuatro recorridos en el puerto 3045: todos los destinos en móvil, zoom por teclado y acceso a tripulación, ampliación/restauración con recarga, y nave modular de Tripulación. Se revisaron las capturas `explorer-mobile.png`, `explorer-expanded-desktop.png` y `explorer-refined-mobile.png`. No se ejecutó la suite completa de otras features. La ampliación es estado visual local sin persistencia y conserva las selecciones por URL.

Checks disponibles: TypeScript, ESLint, formato Prettier, 51 pruebas de dominio/repositorios/presentación, sitios de lanzamiento y movimientos espaciales, y build de producción con las ocho secciones originales, explorador y rutas por hábitat.

En la verificación del 2026-11-11, TypeScript, ESLint, las 51 pruebas y el build pasan. `npm run check` se detiene en Prettier por diferencias preexistentes de formato en 135 archivos fuera de la feature; no se reformatea el resto del proyecto. Este resultado no equivale a un check global aprobado.

Validación actual de videos y detalle 3D: cinco casos de `launch-sites.spec.ts` aprobados en el puerto 3040 y tres casos de `visual-models.spec.ts` aprobados en el puerto 3041 sobre el build actualizado. Incluyen móvil, recarga, ausencia de WebGL, textura opcional fallida, selección de cuatro objetos, retorno y portal de zonas de nave. El primer intento del recorrido 3D agotó el tiempo al cerrar una tarjeta animada; se usa ahora el control HTML fijo de cierre. Las capturas `3d-detail-earth.png`, `3d-detail-moon.png`, `3d-detail-mars.png` y `3d-detail-ship.png` fueron revisadas visualmente. No se volvió a ejecutar la suite completa en esta entrega.

La suite completa de 26 recorridos de navegador pasó sobre el build actualizado (puerto 3004). La comprobación móvil reforzada, con globo 3D y alternativa sin WebGL, pasó además por separado en el puerto 3006 con directorio de resultados propio para evitar interferencias del cierre de otra ejecución. Se revisaron visualmente las capturas del mapa y los sitios de lanzamiento en escritorio/móvil. El servidor de desarrollo del puerto 3000 respondió HTTP 200.

### Sitios de lanzamiento

Selección de tarjetas en ambas pestañas: seis casos de `launch-sites.spec.ts` aprobados sobre el build actualizado (puerto 3043). El nuevo recorrido selecciona los ocho lugares en móvil y comprueba nombre completo, foco en la ficha, encabezado dentro del viewport, información y un único reproductor; la recarga recupera la selección. También pasan las 51 pruebas unitarias, TypeScript, ESLint y build. El check global se detiene en 132 archivos con formato preexistente; los archivos de este ajuste pasan Prettier.

Menú vertical «Tierra»: build, TypeScript, ESLint y 51 pruebas unitarias aprobados. `earth-navigation.spec.ts` pasó sobre producción (puerto 3042): entrada desde Selene, opción activa independiente del mapa, teclado, escritorio, móvil y recarga. `npm run check` continúa detenido por formato preexistente fuera de este cambio.

`tests/launchSites.test.tsx` verifica coordenadas respecto de la textura, aislamiento del catálogo, cancelación, descarte de respuestas antiguas, selección por URL, reintento y timeout del reproductor. `tests/e2e/launch-sites.spec.ts` cubre entrada desde Tierra, selección real de marcador, cámara centrada en el sitio, un solo iframe por selección, cierre, recarga, diario anterior intacto, teclado, móvil con/sin WebGL y textura fallida. Capturas: `launch-sites-desktop.png`, `launch-sites-mobile-3d.png` y `launch-sites-mobile.png`. Los E2E sustituyen la respuesta de YouTube; validan integración y enlaces, no disponibilidad ni reproducción del proveedor externo. Las fuentes oficiales permanecen enlazadas en la UI.

También se verificaron los metadatos públicos de los tres videos mediante oEmbed de YouTube el 2026-11-11: Artemis I (NASA's Kennedy Space Center), InSight (NASA Jet Propulsion Laboratory) y Webb (European Space Agency, ESA). Esta verificación confirma identidad/disponibilidad de metadatos, sin garantizar reproducción en toda región o navegador.

Pruebas de navegador reproducibles:

```bash
npm run build
npm run test:e2e
```

La configuración usa Chrome instalado en el equipo. Para usar el Chromium de Playwright en otro entorno:

```bash
cd frontend
npx playwright install chromium
PLAYWRIGHT_CHANNEL=chromium npm run test:e2e
```

Los casos comprueban carga del GLB local, selección de sensor, cambio de tripulante, nave y zonas, escenario con muestras ausentes, revisión de observaciones, guardado/recarga del diario, URL directa, responsive móvil y fallback ante un asset 3D que falla. El recorrido principal exige ausencia de errores JavaScript.

Las capturas en esta carpeta contienen exclusivamente identidades y mediciones ficticias. Se regeneran al ejecutar las pruebas.

Auditoría de dependencias: sin vulnerabilidades conocidas en dependencias de producción en la verificación inicial. La cadena de herramientas ESLint/typescript-eslint presenta ocho avisos moderados transitivos por minimatch. No se rebajó Next ni se aplicaron cambios mayores automáticos; revisar las actualizaciones upstream al mantener el entorno de desarrollo. El aviso no proviene de los paquetes de ejecución de la app.

## Explorador espacial

Las pruebas de navegador incluyen selección de Luna mediante etiqueta 3D, lista HTML de destinos, contexto al entrar y volver, estación y base con tripulantes distintos, módulos y zonas, recarga de la selección y del diario, conservación exacta del diario original al guardar en Selene, móvil sin desbordamiento, fallback sin WebGL y 404 ante un hábitat desconocido. El recorrido completo exige cero errores JavaScript. Capturas: `explorer-desktop.png` y `explorer-mobile.png`.

Para verificar con otro puerto sin detener un servidor de desarrollo o enlace compartido:

```bash
PLAYWRIGHT_PORT=3002 npm run test:e2e
```

El servidor de pruebas se inicia automáticamente y se cierra al terminar. Comprobar que el puerto escogido esté libre; no reutilizar una instancia con un build antiguo.

La distribución se revisa visualmente en escritorio y móvil: Luna próxima a Tierra, Aurora un poco más lejos y Marte separado. Las pruebas de navegador verifican etiquetas seleccionables, desplazamiento de la nave hacia Marte, pausa estable, reanudación y preferencia de movimiento reducido con selección disponible. La captura `explorer-transit-desktop.png` muestra la nueva distribución.

La trayectoria cerrada tiene pruebas de continuidad de posición y dirección al repetir el ciclo, paso por ambos planetas, separación de sus superficies y dirección de ida y vuelta. El circuito ilustrativo no modifica asignaciones ni datos de misión.

Las pruebas de trayectoria comprueban también altura constante en el plano de los centros y paso por ambos lados en profundidad, para evitar volver al recorrido vertical por arriba y abajo de los planetas.

Tarjetas bajo demanda: carga sin tarjetas flotantes, clic directo en el modelo lunar, selección por lista HTML, una sola tarjeta visible, cierre explícito y cierre por espacio vacío sin alterar el contexto lateral.

Órbitas: pruebas de radio constante respecto de Tierra, cierre del ciclo y cara lunar orientada al planeta. Prueba de navegador adicional para desplazamiento lunar y de estación, pausa global, reanudación, ausencia de Sol y tarjetas bajo demanda, sin errores JavaScript. Captura `explorer-orbits-desktop.png`. Los escenarios y conteos de tripulación se conservan.

La cámara inicial usa la perspectiva oblicua solicitada; restablecer vista reconstruye ese mismo encuadre. El clic directo lunar tras restablecer sigue probado por proyección de esa cámara.

Zoom por niveles: pruebas unitarias del marco Tierra–Marte para distintos tiempos, transformación inversa del recorrido, proporciones de ocho radios solares, revelación gradual y encuadre de todas las órbitas en escritorio/móvil. Navegador cubre zoom con rueda, slider por teclado, vista general con Sol y foco identificable, vuelta al ángulo inicial y acceso a tripulantes. Capturas: `explorer-solar-system-desktop.png`, `explorer-solar-system-mobile.png`, `explorer-zoom-mission.png`. Al inicio no se muestran Sol ni planetas de contexto. La representación no usa posiciones reales para la fecha del navegador.

Salud por sistemas: pruebas de validación, distinción entre duración cero y ausente, preservación de diario previo y datos incompatibles, aislamiento por persona/área/hábitat, revisión diaria, mensajes por scope y escritura fallida. Navegador verifica puntos del astronauta, autorregistro de ejercicio/visión, recarga, cambio de persona, regreso al historial original, móvil sin GLB, errores de registro y persistencia anterior intacta. La explicación visual se prueba en los siete sistemas, con pasos seleccionables, pausa/reanudación, respeto de movimiento reducido y ausencia de escrituras al explorar. Capturas `crew-health-desktop.png`, `crew-health-mobile.png`, `crew-health-cardio-preview.png` y `crew-health-vision-preview.png`.

Gráfica de telemetría: navegador verifica barrido infinito, pausa/reanudación, selección de una muestra, tres ausentes en el escenario de pérdida de señal, movimiento reducido y ancho móvil. El mapper mantiene coordenadas nulas para ausentes. Capturas `telemetry-chart-desktop.png` y `telemetry-chart-mobile.png`. El barrido visual no simula lecturas nuevas.

Separación por menú: se conservan los flujos previos sobre las nuevas carpetas y se prueba navegación + recarga de las ocho secciones de misión en Selene. El mapa conserva sus pruebas de destinos, zoom, 3D y móvil. `mission/` coordina el flujo, las features poseen Screen/View y el contenido transversal vive en `presentation/shared/mission/`.

Portada Qhipa Pacha: 20 pruebas de navegador en total, incluyendo dos de portada (Tumi cargado, parallax de puntero, pausa/reanudación, rebote interactivo del logo, CTA por teclado y navegación; móvil, recarga, movimiento reducido y ausencia de desbordamiento). Capturas `qhipa-landing-desktop.png` y `qhipa-landing-mobile.png`. La batería anterior de misión, explorador, modelos 3D y almacenamiento permanece aprobada. `npm run check` aprobado: TypeScript, ESLint, formato, 36 pruebas unitarias y build.

Tema Qhipa Pacha: revisión visual de dashboard y salud por sistemas con fondo espacial morado, superficies ciruela, selecciones violeta y acentos naranja. Capturas `qhipa-dashboard-theme.png` y `qhipa-health-theme.png`. Pares de contraste principales documentados en `docs/development/visual-theme.md`; no constituyen una auditoría completa de accesibilidad.

Fondo 3D compartido: revisión visual del astronauta y nave con la misma textura procedimental del mapa (`shared-sky-astronaut.png`, `shared-sky-ship.png`). El radio del cielo de misión respeta el far plane de la cámara. Se conservan puntos HTML en portal independiente, controles de giro/zoom y alternativa sin modelo. No se agregan recursos remotos ni datos científicos.

Carga del Tumi: 38 pruebas unitarias en total, incluyendo permanencia mínima de 3000 ms, continuidad al renderizar y limpieza del temporizador. Dos pruebas nuevas de navegador revisan expresión en reposo/salto, elevación de cabeza y sombrero, cierre del ciclo de 3,2 s, spinner independiente, pausa, móvil, recarga y movimiento reducido. Capturas `tumi-loading-rest.png`, `tumi-loading-jump.png` y `tumi-loading-mobile.png`.

Corrección del Tumi original: la referencia raster se conserva idéntica al archivo recibido y se representa mediante capas SVG, sin redibujar cabeza/tocado. El loader cubre el viewport completo sin bordes ni márgenes, también en móvil horizontal. Las pruebas de carga verifican las dimensiones del viewport, recurso original disponible, secuencia de expresión/salto, spinner y retorno. Capturas adicionales `tumi-original-rest.png` y `tumi-original-jump.png`.

Unión natural del tocado: la banda decorada permanece con la frente; solo la corona superior tiene un rebote secundario de 5–7 px en coordenadas del SVG, con solape interno de 4 px. Se eliminaron todas las escalas de la cabeza: las pruebas verifican matrices sin estiramiento/compresión, continuidad de expresión, spinner y pantalla completa en escritorio y móvil horizontal. Las dos pruebas específicas del loader pasan sobre este ajuste final.

Alcance de carga: se verifica la activación fullscreen solo mediante el CTA, mínimo de tres segundos, navegación posterior y espera interna dentro del contenido. Una prueba retiene la respuesta de Historial para verificar menú/cabecera visibles, bounding box dentro de información y selección de otra sección durante la transición. La carga directa y las secciones no disparan fullscreen. Captura `tumi-loading-content.png`.

Validación del alcance final de carga: `npm run check` aprobado (39 pruebas unitarias y build) y 23 pruebas de navegador aprobadas sobre el build actualizado. Se confirmó que una navegación pendiente permite seleccionar otra sección sin ocultar ni bloquear el menú.

Limpieza de los elementos señalados en las capturas: build actualizado aprobado, 104 pruebas unitarias aprobadas y seis pruebas E2E aprobadas (retiro de elementos en escritorio/móvil con recarga, navegación, Tumi y selección corporal desde Personalización, incluido fallo del modelo). TypeScript y ESLint pasaron en la ejecución de check; check completo se detuvo por diferencias de formato preexistentes en 283 archivos. No se reformateó el proyecto completo.

