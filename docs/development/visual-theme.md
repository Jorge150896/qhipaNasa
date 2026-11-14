# Tema visual de Qhipa Pacha

Los anclajes de marca viven en `frontend/src/app/globals.css`: naranja `#FB5607`, morado `#8338EC`, carbón `#212529` y claro `#E9ECEF`. La portada consume los mismos tokens mediante sus alias `--qhipa-*`.

El dashboard utiliza derivados morados luminosos: superficies semitransparentes, bordes lavanda y selección violeta. El panel de misión usa un fondo carbón con nebulosa y dos planos de estrellas. Son tres texturas WebP locales de 3840 × 2160 generadas proceduralmente, con movimiento CSS lento, centro atenuado y versión estática para movimiento reducido. Cada capa vuelve al mismo fotograma al cerrar su ciclo. La portada y el mapa conservan su fondo propio.

- `--surface`, `--surface-raised`, `--line` y `--line-soft`: jerarquía de tarjetas, campos y divisiones.
- `--selection-*`: selección de sección, tripulante, indicador, sistema corporal y destino.
- `--accent`, `--accent-hover`: variantes naranja claras para enlaces, gráfica y acentos sobre morado. Acciones primarias usan el naranja de marca con texto carbón.
- `--text`, `--muted`, `--quiet`: contenido en gris claro/lavanda. El carbón se conserva como anclaje y contraste, sin dominar la superficie visual.
- Ámbar y rosa de estados siguen separados de los colores de marca y conservan sus etiquetas. Los colores de marca no determinan gravedad ni normalidad clínica.

Se conservan colores físicos de planetas/modelos y los datos originales. El mapa, tarjetas flotantes, controles de escenas, formularios y salud por sistemas consumen el tema; no cambian contratos, registros o navegación.

Contrastes de referencia sobre superficie morada opaca `#3B2457`: texto `#E9ECEF` 11,24:1; texto secundario `#C4AED9` 6,60:1; acento `#FFA36E` 6,80:1. Selección `#F4EAFF` sobre `#62329B`: 7,37:1. Son pares principales, no una auditoría completa de accesibilidad de cada elemento.

En Tripulación, el Canvas del explorador corporal es transparente y deja ver el mismo fondo del panel. Los signos vitales, la ficha y la personalización usan superficies translúcidas. En escritorio la ficha se abre debajo de los indicadores y el astronauta ocupa la columna derecha. En móvil, el orden es indicadores, visor y ficha. Los puntos interactivos se siguen montando en su portal independiente.

El visor corporal encuadra el volumen completo del traje y limita el acercamiento según el tamaño del área visible. Al seleccionar una región, una luz localizada marca la superficie y vuelve a una intensidad baja. Con movimiento reducido, la luz se mantiene fija.
