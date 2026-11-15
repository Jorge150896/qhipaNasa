# Personalización del astronauta

Tripulación abre el editor en la misma página. Los accesorios, las herramientas y los colores del traje se recuerdan por tripulante mientras la pantalla está montada. El visor de salud tiene su propia escena.

Cada accesorio del catálogo declara identificador, nombre, archivo GLB y socket. Los sockets de accesorio flotante, pecho, mano y espalda usan coordenadas locales del astronauta en el sistema de Three.js, con +Y arriba y +Z hacia el frente. Los orígenes de los accesorios se colocan en su punto de montaje. Las herramientas apuntan hacia −Y desde la empuñadura. Para incorporar una pieza compatible, añade su GLB a `frontend/public/models/avatar/` y registra su archivo y socket en el catálogo.

El traje original tiene una sola malla con textura. Las bandas y los controles se personalizan mediante las cuatro combinaciones WebP de la paleta. La vista de personalización clona los materiales y usa la textura seleccionada.

Desde la raíz, `node frontend/scripts/build-avatar-accessories.mjs` regenera los accesorios y `node frontend/scripts/build-avatar-finishes.mjs` regenera las texturas. Los modelos y texturas se cargan bajo demanda. Los controles HTML están disponibles si falla WebGL.

«Fondo de la app» ofrece Órbita y Fondo original. La selección se aplica al visor y al fondo general, incluso en la portada y al cambiar de ruta, hábitat o tripulante. Órbita se aplica al entrar por primera vez y al pulsar «Restablecer». Las preferencias de la versión anterior por Hangar o Predeterminado vuelven a Órbita.

`AppBackgroundProvider` posee la preferencia en el layout raíz. Personalización escribe mediante su callback y el CSS del fondo compartido lee el atributo que aplica el provider. La clave local `astra.appearance.background.v1` permite recuperar el fondo al recargar o abrir una ruta directa. Si el almacenamiento no está disponible, se conserva la selección durante la visita y una recarga vuelve al último valor que se pudo leer, o al fondo predeterminado.
