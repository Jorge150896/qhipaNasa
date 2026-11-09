# Verificación de la base frontend

Checks locales: TypeScript, ESLint, formato Prettier, 36 pruebas de dominio/repositorios/presentación y movimientos espaciales y build de producción con las ocho secciones originales, explorador y rutas por hábitat.

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
