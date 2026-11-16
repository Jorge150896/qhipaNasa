# Vista previa de la carga

`/loading-preview` monta Screen → useLoadingPreviewViewModel → View con pausa/reanudación local y regreso a portada. Es una demostración permanente de la animación, identificada como vista previa y con `aria-busy=false`.

La carga usa el retrato vectorial transparente compartido de Nami. La vista previa permite pausar el gesto de elevación del casco y, con movimiento reducido, conserva una sonrisa estática. La carga de contenido y la carga a pantalla completa comparten el personaje.

Integración actual: `TumiLoader` tiene variantes `fullscreen` y `content` (por defecto). La pantalla completa solo la activa «Iniciar mi misión» desde la portada, con mínimo de tres segundos y limpieza al salir. `LandingScreen` navega cuando su ViewModel indica que la introducción terminó. Misión y mapa ya no agregan esa espera al cargar sus datos.

Dentro del dashboard, cada Screen usa `useTransition` para mostrar el loader en el área de información mientras cambia de ruta. Menú y cabecera permanecen visibles e interactivos; otra selección puede sustituir la navegación pendiente. Las cargas reales de datos también usan la variante de contenido, sin demora artificial. Se retiró el fallback global de `app/loading.tsx` para que no reemplace la pantalla ni el shell en cada cambio. La vista de revisión permanece explícitamente fullscreen y sin límite de tiempo.
