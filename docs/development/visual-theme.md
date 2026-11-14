# Tema visual de Qhipa Pacha

Los anclajes de marca viven en `frontend/src/app/globals.css`: naranja `#FB5607`, morado `#8338EC`, carbón `#212529` y claro `#E9ECEF`. La portada consume los mismos tokens mediante sus alias `--qhipa-*`.

El dashboard utiliza derivados morados luminosos: fondo ciruela, superficies semitransparentes, bordes lavanda y selección violeta. `app-shell::before` incorpora el fondo espacial local de la portada detrás de las superficies legibles. La barra lateral y la cabecera siguen la misma familia; no hay animación de fondo ni nuevos listeners en el dashboard.

- `--surface`, `--surface-raised`, `--line` y `--line-soft`: jerarquía de tarjetas, campos y divisiones.
- `--selection-*`: selección de sección, tripulante, indicador, sistema corporal y destino.
- `--accent`, `--accent-hover`: variantes naranja claras para enlaces, gráfica y acentos sobre morado. Acciones primarias usan el naranja de marca con texto carbón.
- `--text`, `--muted`, `--quiet`: contenido en gris claro/lavanda. El carbón se conserva como anclaje y contraste, sin dominar la superficie visual.
- Ámbar y rosa de estados siguen separados de los colores de marca y conservan sus etiquetas. Los colores de marca no determinan gravedad ni normalidad clínica.

Se conservan colores físicos de planetas/modelos y los datos originales. El mapa, tarjetas flotantes, controles de escenas, formularios y salud por sistemas consumen el tema; no cambian contratos, registros o navegación.

Contrastes de referencia sobre superficie morada opaca `#3B2457`: texto `#E9ECEF` 11,24:1; texto secundario `#C4AED9` 6,60:1; acento `#FFA36E` 6,80:1. Selección `#F4EAFF` sobre `#62329B`: 7,37:1. Son pares principales, no una auditoría completa de accesibilidad de cada elemento.
