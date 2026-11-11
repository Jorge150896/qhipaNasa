# Verificación de la base frontend

Checks locales: TypeScript, ESLint, formato Prettier, 39 pruebas de dominio/repositorios/presentación y movimientos espaciales y build de producción con las ocho secciones originales, explorador y rutas por hábitat.

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
