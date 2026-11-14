# Personalización del astronauta

Tripulación abre el editor en la misma página. La selección se recuerda por tripulante mientras la pantalla está montada. El visor de salud tiene su propia escena.

Cada accesorio del catálogo declara identificador, nombre, archivo GLB y socket. Los sockets de accesorio flotante, pecho, mano y espalda usan coordenadas locales del astronauta en el sistema de Three.js, con +Y arriba y +Z hacia el frente. Los orígenes de los accesorios se colocan en su punto de montaje. Las herramientas apuntan hacia −Y desde la empuñadura. Para incorporar una pieza compatible, añade su GLB a `frontend/public/models/avatar/` y registra su archivo y socket en el catálogo.

El traje original tiene una sola malla con textura. Las bandas y los controles se personalizan mediante las cuatro combinaciones WebP de la paleta. La vista de personalización clona los materiales y usa la textura seleccionada.

Desde la raíz, `node frontend/scripts/build-avatar-accessories.mjs` regenera los accesorios y `node frontend/scripts/build-avatar-finishes.mjs` regenera las texturas. Los modelos y texturas se cargan bajo demanda. Los controles HTML están disponibles si falla WebGL.

Los fondos Estudio orbital, Órbita y Hangar se definen en el catálogo y CSS con su identificador. Pueden usar imágenes locales como una capa de fondo, con `background-size: cover`, sin tocar el GLB.
