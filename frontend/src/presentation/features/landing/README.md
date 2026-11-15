# Portada Qhipa Pacha

Entrada `/` → `LandingScreen` → `useLandingViewModel` → `LandingView`. CTA a `/mission/crew` y navegación secundaria a `/explore`. No modifica providers, escenarios o registros de la aplicación existente.

El hook posee pausa manual y repetición del rebote del logo. `useSyncExternalStore` escucha movimiento reducido y visibilidad de pestaña, con limpieza de listeners. La View mantiene únicamente desplazamientos visuales en propiedades CSS según el puntero, sin re-render continuo. En táctil no hay parallax de puntero. Las capas tienen profundidades distintas; el drift, flotación, destellos y reflejo del CTA usan transform/opacity de CSS. La pausa afecta también pseudo-elementos; movimiento reducido detiene animaciones y transiciones.

Paleta: naranja `#FB5607` para el CTA, morado `#8338EC`, carbón `#212529` y claro `#E9ECEF`. La portada usa el fondo espacial común y una capa propia para el planeta y su parallax.

Assets locales: texturas compartidas `public/backgrounds/mission-*-4k.webp` y la secuencia de 12 fotogramas de Tumi proporcionada por el usuario (`public/brand/tumi-landing-frames.webp`). Dos capas del sprite transparente usan Web Animations para fundir las poses. CSS conserva la flotación y muestra el primer fotograma cuando el sistema pide movimiento reducido. La marca en la cabecera combina el nombre de Qhipa Pacha con el retrato vectorial de Tumi guiñando. Las ilustraciones son decorativas.

«Iniciar mi misión» activa una introducción fullscreen de mínimo 3 s en el ViewModel, solo tras pulsar el CTA. Screen precarga la ruta y navega al terminar; mientras tanto sustituye la portada por el loader, evitando acciones duplicadas. El temporizador se limpia al desmontar. Las entradas por otros enlaces y las secciones internas no activan esa introducción.
