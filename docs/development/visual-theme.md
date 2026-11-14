# Tema visual de Qhipa Pacha

Los anclajes de marca viven en `frontend/src/app/globals.css`: naranja `#FB5607`, morado `#8338EC`, carbón `#212529` y claro `#E9ECEF`. La portada consume los mismos tokens mediante sus alias `--qhipa-*`.

La portada, las secciones de misión, Mapa espacial, Tierra y la carga a pantalla completa usan `SpaceBackground`. El fondo carbón combina nebulosa morada y dos planos de estrellas. Son tres texturas WebP locales de 3840 × 2160 con movimiento CSS lento, centro atenuado y versión estática para movimiento reducido. Cada capa vuelve al mismo fotograma al cerrar su ciclo. Las secciones con menú comparten cabecera, navegación y pie transparentes. La carga dentro de una sección deja ver el fondo de esa pantalla.

- `--surface`, `--surface-raised`, `--line` y `--line-soft`: jerarquía de tarjetas, campos y divisiones.
- `--glass`, `--glass-active` y `--glass-glow`: transparencia de controles y resplandor de navegación y selecciones.
- `--selection-*`: selección de sección, tripulante, indicador, sistema corporal y destino.
- `--accent`, `--accent-hover`: variantes naranja claras para enlaces, gráfica y acentos sobre morado. Acciones primarias usan el naranja de marca con texto carbón.
- `--text`, `--muted`, `--quiet`: contenido en gris claro/lavanda. El carbón se conserva como anclaje y contraste, sin dominar la superficie visual.
- Ámbar y rosa de estados siguen separados de los colores de marca y conservan sus etiquetas. Los colores de marca no determinan gravedad ni normalidad clínica.

Se conservan colores físicos de planetas/modelos y los datos originales. El mapa, tarjetas flotantes, controles de escenas, formularios y salud por sistemas consumen el tema; no cambian contratos, registros o navegación.

El contraste de las superficies translúcidas depende de su composición con el fondo. Las escenas 3D mantienen las superficies de lectura de sus etiquetas y los formularios conservan un fondo de campo más oscuro.

En Tripulación, el Canvas del explorador corporal es transparente y deja ver el mismo fondo del panel. Los signos vitales, la ficha y la personalización usan superficies translúcidas. En escritorio la ficha se abre debajo de los indicadores y el astronauta ocupa la columna derecha. En móvil, el orden es indicadores, visor y ficha. Los puntos interactivos se siguen montando en su portal independiente.

El visor corporal encuadra el volumen completo del traje y limita el acercamiento según el tamaño del área visible. Al seleccionar una región, una luz localizada marca la superficie y vuelve a una intensidad baja. Con movimiento reducido, la luz se mantiene fija.
