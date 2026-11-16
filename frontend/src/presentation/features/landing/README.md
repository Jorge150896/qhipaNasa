# Portada Qhipa Pacha

Entrada `/` → `LandingScreen` → `useLandingViewModel` → `LandingView`. El botón «Iniciar mi misión» abre Monitoreo diario en `/mission/journal`. El selector de idioma está en la cabecera.

El hook gestiona la repetición del rebote del logo y pausa la animación cuando la pestaña está oculta o el sistema solicita movimiento reducido. `useSyncExternalStore` escucha ambas preferencias y limpia sus listeners. La View mantiene únicamente desplazamientos visuales en propiedades CSS según el puntero, sin re-render continuo. En táctil no hay parallax de puntero. Las capas tienen profundidades distintas; el drift, flotación, destellos y reflejo del CTA usan transform/opacity de CSS. La pausa afecta también pseudo-elementos; movimiento reducido detiene animaciones y transiciones.

Paleta: naranja `#FB5607` para el CTA, morado `#8338EC`, carbón `#212529` y claro `#E9ECEF`. La portada usa el fondo espacial común y una capa propia para el planeta y su parallax.

La portada usa las texturas locales del fondo espacial y el retrato vectorial compartido de Nami. La animación recrea el GIF del usuario con movimiento del casco, transiciones faciales y una pose estática para movimiento reducido.

«Iniciar mi misión» activa una introducción fullscreen de mínimo 3 s en el ViewModel, solo tras pulsar el CTA. Screen precarga la ruta y navega al terminar; mientras tanto sustituye la portada por el loader, evitando acciones duplicadas. El temporizador se limpia al desmontar. Las entradas por otros enlaces y las secciones internas no activan esa introducción.
