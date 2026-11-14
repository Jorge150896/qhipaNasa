# Movimientos espaciales y referencia solar

## Estado actual

La implementación actual tiene niveles de zoom. La vista cercana conserva el encuadre de misión y oculta el Sol; al alejarse aparecen el Sol y los ocho planetas con órbitas circulares, distancias medias proporcionales en UA, cuerpos ampliados y fases/tiempos ilustrativos. La cámara mantiene el foco Tierra–Marte mediante un marco de seguimiento, y permite volver a la perspectiva inicial.

El modelo sustituye los planetas decorativos por posiciones orbitales simuladas. No es una efeméride ni una trayectoria física de la nave. Detalles de implementación y límites en `docs/development/frontend.md`.

## Evaluación anterior

El Sol encaja como referencia visual y de iluminación: ayuda a comprender qué lado de los cuerpos recibe luz y orienta el mapa. Se probó temporalmente como esfera emisiva y dirección de luz, sin convertirlo en hábitat ni ofrecer datos de tripulación ficticios. Se mantiene el enfoque de salud y contextos de misión.

Tierra y Marte rotan sobre su eje. Luna y estación orbitan alrededor de Tierra; la Luna sincroniza su rotación con la órbita. La estación avanza más rápido, con tiempos de demostración independientes de la física real. La pausa es global.

## Límites de la representación

La vista local es esquemática. La vista general conserva proporciones de radios orbitales medios; los tamaños de cuerpos, periodos y fases están adaptados para visualizarse y no constituyen un simulador orbital validado. Se conserva la composición solicitada donde Aurora se dibuja algo más lejos de Tierra que la Luna; eso no representa una estación en órbita terrestre baja. Tampoco se calcula una trayectoria real de transferencia Tierra–Marte. La traslación usa órbitas circulares y fases simuladas, con reloj compartido y encuadre de seguimiento. Usar posiciones reales para una fecha requeriría efemérides.

No inferir exposición solar, radiación ni efectos sobre la salud a partir de esta iluminación. Las mediciones siguen siendo sintéticas del escenario, sin conexión con la animación.

## Referencias consultadas

- [NASA: fases de la Luna](https://science.nasa.gov/moon/moon-phases/): luz solar reflejada y geometría de iluminación.
- [NASA: preguntas sobre la Luna](https://science.nasa.gov/moon/top-moon-questions/): rotación sincronizada y órbita terrestre.
- [NASA: datos de la estación espacial](https://www.nasa.gov/international-space-station/space-station-facts-and-figures/): referencia de estación en órbita alrededor de Tierra. Aurora es ficticia; no se presentan sus parámetros como los de la ISS.

- [NASA: tamaños y ubicaciones planetarias](https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/): referencia de radios orbitales medios.
- [NASA/JPL: escalas de tamaños y distancias](https://www.jpl.nasa.gov/edu/resources/video/solar-system-size-and-distance/): limitaciones de una escala única en pantalla.
