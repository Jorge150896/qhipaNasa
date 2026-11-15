# Desarrollo del frontend

## Acompañante animado Tumi

La [guía completa de Tumi IA](tumi-ia.md) reúne uso, arquitectura, evolución, recursos y reutilización. Los controles finales ofrecen ojo tachado para ocultar y X únicamente en la cabecera; se retiraron la pausa manual y la X inferior. La suspensión del movimiento durante la conversación sigue siendo automática.

`cursor-assistant` presenta Tumi IA como cabeza tecnológica vectorial basada en la nueva referencia del usuario, con expresiones, máquina de estados, recorridos autónomos moderados, prevención geométrica de obstáculos y arrastre. El panel cercano permite conversar con una guía local identificada como «Sin IA conectada». El puerto cancelable `TumiConversation` queda preparado para otro adapter mediante DI; no existe integración con un modelo de IA. El host cubre páginas generales y `MissionAssistantScreen` compone la instancia de misión con acceso a su chat contextual. Se conservan pausa, ocultación, teclado y movimiento reducido. El loader anterior y los modelos 3D no cambian. Alcance y límites en `frontend/src/presentation/features/cursor-assistant/README.md`.

Monitoreo asistido tiene un flujo independiente de preparación/captura/revisión/guardado, adapters de demo/API y registro local por hábitat. La API es configurable y su contrato sigue provisional; ver [uso, arquitectura y límites](monitoring.md). No comparte las capturas con el snapshot sintético del dashboard.

## Decisiones implementadas

El mapa mantiene el tema Qhipa Pacha y añade la pestaña de despegues de Tierra (`tab=launches`, `site=<id>`). El nuevo catálogo y su estado se aíslan en `launch-sites`, sin modificar `useMission` ni claves del diario. Al cambiar de sitio o salir se desmonta el video; el globo tiene lista HTML equivalente. El botón «Acercar a…» pausa el mapa para inspeccionar el objeto y «Volver a la misión» restaura su encuadre. Fuentes, límites, coordenadas y ciclo de vida en `frontend/src/presentation/features/launch-sites/README.md`.

Workspace npm en la raíz y aplicación en `frontend/`. Next.js 16.4.5 y React 19.3.1 con TypeScript estricto. CSS propio, Lucide, Three.js, React Three Fiber y Drei. No hay servicios remotos ni variables de entorno necesarias para ejecutar la demo.

`src/app/mission/layout.tsx` es Server Component y monta una isla cliente: `MissionWorkspaceProvider`. Esta isla conserva selección, escenario, snapshot y diario al navegar entre las secciones de misión. Las rutas y el layout raíz permanecen de servidor.

## Flujo de una operación

```text
DailyCheckView / JournalForm
 -> callback de DailyCheckScreen / useMission
 -> RecordDailyCheck
 -> CrewJournalRepository
 -> LocalCrewJournalRepository
 -> KeyValueStorage
 -> BrowserStorage
```

La carga sigue `LoadMission -> MissionRepository -> SimulatedMissionRepository`. El mapper `mapMissionPresentation` transforma el snapshot y el diario en props independientes del transporte: formatos, etiquetas, gráficos y estados de calidad. El provider compone mediante la factory de `src/di` y comparte estado/acciones de presentación, no un service locator.

## Estado: propietario y ciclo de vida

- Provider de misión: propietario de snapshot, escenario, persona, zona, indicador, diario y mensajes. Se monta una vez por flujo; salir de `/mission` lo desmonta.
- Hook: ejecuta casos de uso, cancela/descarta cargas obsoletas al cambiar escenario o desmontar y muestra errores de lectura/escritura.
- Screen: navegación y modo puramente visual (astronauta/nave). La sección de hábitat inicia con la nave y permite alternar al astronauta.
- Formulario: campos locales por persona. Cambiar de persona descarta un borrador sin guardar. Guardar actualiza un registro por persona/día UTC.
- Diario: clave `astra.demo.journal.v1`, esquema versionado validado con Zod. Se conservan hasta 300 chequeos y 500 revisiones. Writer: adapter local; reader: casos de uso de diario; reset: ninguno automático. Un error o formato incompatible se informa, sin sobrescribirlo.
- Recarga/URL directa: escenario y selecciones vuelven a sus defaults; chequeos y revisiones se recuperan del navegador. La fecha de mediciones permanece en el escenario; no se disfraza como tiempo real.

## 3D y fallos

`MissionScene` se carga de forma diferida con SSR desactivado únicamente para el visor. El resto de la UI se renderiza normalmente. El GLB incluye su textura y se sirve en `/models/astronaut.glb`; no depende de un CDN. La nave se genera con geometría local y sus hotspots son conceptuales.

El visor tiene Suspense, Error Boundary y fallback cuando no hay WebGL. Sus hotspots usan un portal DOM independiente del Canvas para conservar un ciclo de desmontaje correcto al navegar o cambiar de modelo; las tarjetas de sensores y el selector de zona siguen funcionando. Las bibliotecas 3D no conocen repositorios ni reglas clínicas. La fuente y licencia del asset están en `frontend/public/models/ATTRIBUTION.md`.

El resumen de Centro de misión combina el contexto de la instantánea con el último autorregistro local de la persona seleccionada. El ViewModel consulta el diario por hábitat al montar la vista, por lo que regresar desde Tripulación vuelve a leer lo guardado. Los accesos a Tripulación usan los fragmentos `#crew-module` y `#crew-health-entry` para abrir el visor del módulo asignado o enfocar el formulario. Una entrada directa usa la selección del contexto de misión. Las señales con calidad de atención abren Historial con el indicador seleccionado.

## Incorporar una funcionalidad

1. Revisar su consumidor real y el límite de responsabilidad.
2. Si requiere reglas/operaciones, definir el contrato y caso de uso portable.
3. Implementar el adapter y componerlo sin importar implementaciones desde hooks/Views.
4. Preparar el modelo presentable, estados y callbacks; mantener rutas delgadas.
5. Agregar pruebas de comportamiento y actualizar documentación si cambia un contrato.
6. Ejecutar los checks del README. No agregar carpetas vacías por anticipado.

Para conectar Java, acordar primero operaciones y payloads en OpenAPI. Sustituir el repositorio de simulación o diario por implementaciones HTTP en data e infraestructura, sin cambiar Views. Autorización e integridad persistida serán del servidor.

## Validación

Vitest y Testing Library cubren casos de uso, actualización de registros, persistencia reconstruida, formato incompatible, escritura fallida, cancelación, pérdida de muestras, selección de persona/zona, estados del hook y envío del formulario. ESLint impide imports prohibidos entre capas. El build verifica rutas estáticas y la separación de servidor/cliente.

## Convención para nuevas pantallas y trabajo compartido

Las vistas y flujos nuevos siguen `Screen -> use<Nombre>ViewModel -> View`, con tipos presentables. El hook existente `useMission.ts` mantiene su nombre y cumple el rol de ViewModel del flujo actual. Estructura, estado entre pasos y responsabilidades en [screens-and-flows.md](screens-and-flows.md). Las skills locales en `.agents/skills/` y `CONTRIBUTING.md` son las fuentes de equipo.

## Explorador espacial y múltiples hábitats

`/explore?destination=earth|moon|mars|station|ship` tiene Screen, `useSpaceExplorerViewModel`, View y mapper propios en `presentation/features/space-map`. El destino está en la URL; cambiarlo no asigna ni traslada personas. El hook recibe `LoadSpaceExplorer` y cancela cargas al desmontar. Al volver desde un hábitat se reconstruye su destino en la URL. «Actualizar registros» vuelve a consultar los diarios; la instantánea sintética no avanza de hora.

`LoadSpaceExplorer` consulta `ExplorerRepository`, cuenta personas por identificador y deriva pendientes de chequeo del día UTC, observaciones sin revisar y sensores sin dato actual. `LocalSpaceExplorerRepository` compone catálogo sintético y diarios locales; un diario ilegible produce estado desconocido, sin borrar datos ni bloquear los otros lugares. Tierra y Aurora comparten el hábitat `aurora`; el resumen global no suma las fichas de destinos.

`SimulatedHabitatMissionRepository` conserva el generador original para Odyssey y crea las otras tripulaciones con identificadores distintos usando las mismas plantillas de señales. No son fuentes de telemetría independientes reales. Los escenarios iniciales son descanso para Odyssey/Ares, rutina para Aurora y pérdida de señal para Selene. Cambiar escenario en un dashboard es local a ese flujo; al volver al mapa se resume el escenario inicial indicado en cada ficha.

Rutas nuevas: `/missions/:habitatId/:section`, con `aurora`, `selene`, `ares` y las ocho secciones existentes. Layout valida el hábitat y monta un provider identificado por hábitat, para descartar selección y cargas del contexto anterior. Una URL desconocida muestra 404. Odyssey conserva `/mission/:section`; el alias `/missions/odyssey/:section` redirige a la ruta original.

Las claves son `astra.demo.journal.v1` para Odyssey (sin migración) y `astra.demo.journal.v1:<habitatId>` para los nuevos lugares. Guardar, revisar, recargar y leer desde el mapa usan el mismo namespace. Los registros actuales no se copian ni se sobrescriben al abrir otro hábitat.

El mapa 3D se carga solo en cliente. Superficies, estación, nave y módulos son ilustraciones procedurales locales. Selección por objeto/etiqueta o lista HTML equivalente, rotación y zoom manual, restablecer cámara y fallback sin WebGL. El portal DOM de etiquetas sigue separado del Canvas. La geometría de módulos internos es conceptual y no representa interiores reales. La vista corporal reutiliza el astronauta y sus controles actuales.

### Distribución y tránsito ilustrativo

El mapa separa Tierra y Marte; Luna queda próxima a Tierra y Aurora un poco más lejos. `spaceMapLayout.ts` mantiene las coordenadas ilustrativas y la curva Bézier local, sin introducir posiciones orbitales ni reglas en dominio. La cámara ajusta el encuadre según el viewport.

Odyssey recorre un circuito cerrado de ida y vuelta entre Tierra y Marte, con pasos curvos alrededor de ambos planetas y orientación según la tangente. El ciclo completo dura unos 240 segundos de animación activa, a mayor velocidad que el tránsito inicial. Continúa automáticamente, con posición y dirección continuas al reiniciar cada vuelta. «Pausar simulación»/«Reanudar simulación» solo controla el estado visual; «Restablecer vista» reinicia cámara y trayectoria. Salir del mapa o recargar también reinicia la animación. El recorrido no actualiza ubicación operativa, tripulantes, telemetría o historial.

Se conserva `frameloop="demand"`: el objeto invalida mientras avanza y deja de hacerlo al pausar o esconder la pestaña. `prefers-reduced-motion` detiene el recorrido automático. El portal HTML de etiquetas permanece independiente del Canvas, y selección/navegación funcionan con el movimiento detenido.

El circuito discurre ahora en el plano ecuatorial XZ, a la misma altura que los centros de Tierra y Marte. El paso lateral usa profundidad por delante y detrás, con giro horizontal (yaw) estable. Los planetas están más separados y el encuadre inicial es más abierto; se mantiene rotación y zoom manual.

Las tarjetas flotantes del mapa empiezan ocultas, incluso al entrar con un destino en la URL. Screen conserva únicamente la tarjeta visual abierta; seleccionar un modelo o un destino HTML abre una sola tarjeta. Seleccionar otro reemplaza la anterior; su botón de cierre o un clic en espacio vacío la oculta sin cambiar el destino ni la ficha lateral. Los controles HTML siguen disponibles sin WebGL.

### Rotación y órbitas

`SceneMotion` es el propietario de un único reloj visual dentro del Canvas, independiente del provider de misión. `TransitObject` lee el reloj para la nave y los dos satélites; `PlanetModel` lo usa para rotación axial. Pausar/reanudar, movimiento reducido, visibilidad de pestaña y restablecer vista afectan todos los movimientos juntos. No se cambia el snapshot, la ubicación operativa ni la persistencia.

`orbitalMotion.ts` mantiene órbitas circulares inclinadas con centro en Tierra. Luna: radio visual 2,05 y periodo de 100 s; Aurora: radio 3 y periodo de 65 s. Los radios preservan la composición visual pedida y no representan distancias físicas; la estación sigue dibujándose algo más lejos que la Luna. Tierra/Mars rotan en 80/100 s de demo. La Luna rota una vez por órbita, con eje coherente con su plano, para mantener una cara hacia Tierra.

El Sol empieza oculto en el detalle y aparece al alejar la cámara. La iluminación de estudio conserva la legibilidad de los modelos. La vista general representa traslación heliocéntrica circular ilustrativa; no calcula eclipses, irradiación ni efemérides. La leyenda explicita tiempos acelerados y ausencia de escala astronómica. Las tarjetas siguen ocultas hasta hacer clic.

`mapCamera.ts` centraliza la cámara inicial: perspectiva oblicua baja con inclinación de unos 24° y giro lateral leve. El mismo cálculo se usa al montar, ajustar tamaño y «Restablecer vista». Rotación manual y zoom siguen disponibles. Los objetos mantienen sus planos orbitales y posiciones de misión.

### Zoom progresivo y seguimiento Tierra–Marte

`solarSystemModel.ts` define ocho radios orbitales medios en UA, redondeados de NASA, con fases iniciales y periodos visuales simulados. Los demás planetas reemplazan el decorado de posiciones arbitrarias por posiciones heliocéntricas circulares.

`solarMissionFrame` obtiene el punto medio Tierra–Marte y un eje que une ambos. Convierte todas las posiciones heliocéntricas a ese marco mediante traslación, rotación y una escala uniforme. Tierra y Marte quedan en las coordenadas locales previas (-6,8/+6,8), por lo que la perspectiva inicial y el seguimiento se conservan mientras cambian las posiciones respecto del Sol. Las distancias solares mantienen sus proporciones en cada instante. La transformación inversa sitúa el recorrido local de la nave entre los planetas en movimiento; sigue siendo ilustrativo, sin física de transferencia.

`SolarNavigation` tiene estado visual propio dentro del Canvas y recibe comandos de zoom de `SpaceMapScene`. Rueda, pellizco, botones y slider controlan la distancia al punto medio. Se revela el contexto entre 1,5 y 4 veces el alejamiento inicial. Vista de misión, contexto solar y sistema solar indican el nivel; «Ver sistema solar» encuadra todas las órbitas y «Volver a la misión» restaura el ángulo sin reiniciar el reloj. «Restablecer vista» reinicia encuadre y animación. Las transiciones de botones son suaves y se desactivan con movimiento reducido. Arrastrar/zoom manual interrumpe la transición sin cambiar el foco.

`SolarOverview` dibuja Sol y órbitas. `SolarSystemReferences` posiciona los seis planetas adicionales mediante el modelo orbital. La Luna y Aurora conservan sus órbitas locales ilustrativas y se ocultan al perder detalle; sus datos siguen disponibles por HTML. Las etiquetas de Tierra y Marte mantienen identificable el foco en vista general. Las tarjetas no aparecen automáticamente.

Los radios de cuerpos y los marcadores se amplían para legibilidad y no comparten la escala de distancias; el tamaño visible del Sol se limita para no engullir los planetas interiores. Los periodos no representan una fecha ni velocidades reales. La UI distingue detalle local ilustrativo, distancias medias en UA, cuerpos ampliados y fases/tiempos simulados. El fondo local de estrellas sigue la cámara para conservarse al alejarse.

No se modifican rutas, contratos, registros, asignaciones de tripulación ni el backend. Fuente de distancias: https://science.nasa.gov/solar-system/planet-sizes-and-locations-in-our-solar-system/

### Salud por sistemas

`CrewHealthScreen` se monta en la sección de Tripulación, con tipos de presentación y dependencias propias. `useCrewHealthViewModel` administra carga, escritura, mensajes y reintento; el mapper filtra por persona/sistema y prepara la lectura conjunta. `CrewScreen` orquesta la selección visual y el desplazamiento desde los puntos 3D. El visor conserva su portal independiente. `MetricData.comparison` añade una comparación descriptiva con la primera muestra de su serie; las muestras ausentes no generan comparación actual.

Los datos de salud se guardan en `astra.demo.health.v1:<habitatId>` sin migrar el diario anterior. Fuentes, funcionamiento y límites en `docs/product/hhc-health-workspace.md` y el README de la feature. La integración de datos reales con Java permanece pendiente.

### Gráfica de telemetría

`TrendChart` representa las mismas muestras sintéticas con puntos, selección HTML por hora y barrido visual continuo de 10 segundos. Las coordenadas se preparan en el mapper, con `y: null` para ausentes; el barrido no genera muestras ni simula un ECG. La pausa es estado visual local, se reinicia al cambiar de serie y respeta movimiento reducido. El historial completo permanece visible y los huecos no se conectan.

Para repartir trabajo consultar [features-map.md](features-map.md): feature, vista y ruta son conceptos distintos.

### Features por sección del menú

Las nueve secciones tienen carpeta propia; `mission/` mantiene el provider, `useMission`, mapper, shell y selección del Screen. La cabecera, tarjetas de sensores, contexto ambiental, gráfica y dashboard compartidos viven en `presentation/shared/mission/`; el visor sigue en `presentation/shared/scene/` y se carga desde `MissionSceneSlot` con SSR desactivado. Las URLs y claves de almacenamiento no cambian.

Cambiar de sección desmonta su estado visual privado: modo de visor, sistema corporal y borradores. Los datos, persona/indicador/zona/escenario y operaciones siguen siendo del provider por hábitat. Las pantallas reciben datos/callbacks del modelo existente; las nuevas operaciones autónomas deben usar casos de uso y ViewModel propios.

### Portada Qhipa Pacha

La ruta raíz monta `landing/LandingScreen.tsx`, con `useLandingViewModel` y `components/LandingView.tsx`. Ofrece entrada al dashboard, mapa y tripulación. Las animaciones de marca, Tumi, estrellas, planeta cercano y reflejo del CTA viven en CSS aislado; el hook administra pausa y disponibilidad de movimiento según sistema/visibilidad. No hay nuevos adapters ni acceso a datos. El parallax de puntero se limita a ratón y se desactiva en pausa/movimiento reducido. Recursos, procedencia y detalles en el README de `landing/`.

### Tema del dashboard

La paleta de Qhipa Pacha y sus roles están en [visual-theme.md](visual-theme.md). El dashboard combina un fondo espacial animado con superficies moradas y acentos naranja. El centro del fondo se atenúa para facilitar la lectura y se usa una composición estática con movimiento reducido. Las variables comunes viven en `globals.css`; salud por sistemas y mapa conservan sus estilos locales con la misma familia visual.

### Cielo compartido de las escenas 3D

`presentation/shared/scene/SpaceBackdrop.tsx` representa el mismo cielo local de estrellas y nebulosas en el mapa general, astronauta, nave, estación y base. La textura se genera de forma determinista, sigue la posición de la cámara y se libera al desmontar. El mapa utiliza radio 12000 y el visor de misión radio 100 para respetar sus planos de recorte; las proporciones angulares del fondo se conservan. La esfera decorativa no participa en raycasting ni tapa modelos mediante escritura de profundidad. No cambia el portal HTML independiente, los controles ni los fallbacks.

### Carga animada del Tumi

`presentation/shared/loading/TumiLoader` representa carga de misión y mapa dentro del contenido; su variante fullscreen se reserva para iniciar misión desde la portada y la vista de revisión. `TumiHead` revela la referencia PNG original en capas SVG: cabeza, tocado, expresión y sombra tienen animaciones coordinadas, con spinner independiente y movimiento reducido. La imagen original se conserva sin redibujar; el loader es una capa de viewport completo y sin bordes. `/loading-preview` permite revisar el bucle sin depender de una carga real.

La introducción mínima de tres segundos pertenece ahora al ViewModel de portada y solo empieza tras «Iniciar mi misión». El provider de misión mantiene únicamente su carga real. Los Screens de misión/mapa usan `useTransition` para representar navegación pendiente dentro del área de información, con el shell interactivo. No hay fallback global a pantalla completa ni bloqueo global del scroll. Detalle en `features/loading-preview/README.md`.


### Chequeo diario por actividad

`DailyCheckScreen` conecta el estado local de los cuatro pasos con la acción de guardado de `useMission`. El caso de uso `RecordDailyCheck` valida los datos generales y los campos permitidos por actividad. El diario mantiene su clave y versión con `context` y `discomfortRegion` opcionales. Los campos vacíos se omiten y los ceros ingresados se conservan. Al recargar, el chequeo del día UTC se puede editar con sus valores guardados. La consola muestra la instantánea sintética del escenario, separada de las respuestas ingresadas.

# Detalle visual de cuerpos y nave

El visor utiliza luz lateral neutra y relleno tenue, fondo atenuado y encuadre inicial más cercano. Los materiales planetarios limitan el relieve derivado del color a un efecto ilustrativo suave. El acceso de detalle incluye Aurora, estación conceptual que no representa la ISS. No se incorporan modelos remotos ni se altera la posición de los puntos geográficos.

El selector HTML de destinos aparece antes del Canvas. «Ampliar mapa» desplaza la ficha debajo de la escena para aprovechar el ancho; «Restaurar distribución» recupera las columnas. Es estado visual local de `SpaceExplorerView`, se reinicia al recargar y conserva destino, URL y datos. En móvil la distribución sigue una columna y los controles tienen objetivos de al menos 44 px. El interior modular de nave integrado desde main usa `ShuttleModuleDeck`; la vista exterior del mapa conserva `ShuttleExteriorModel`.

El mapa permite inspeccionar Tierra, Luna, Marte y nave con controles HTML. El enfoque pausa la simulación y ajusta la distancia a los límites visuales y al aspecto del viewport. `PlanetSurface` comparte textura, nubes, relieve y atmósfera entre el mapa y el globo geográfico; las capas opcionales fallidas no impiden seleccionar lugares. La nave mantiene sus zonas y el portal HTML independiente. Procedencia y límites de las texturas locales en `frontend/public/textures/ATTRIBUTION.md`.

### Modelos holográficos conservados en Fabian

La integración de origin/main conserva el explorador, fichas, línea de tiempo y formularios de main. Dentro de Tripulación, «Modelo corporal» permite cambiar entre el astronauta con traje existente y el holograma humano local. El astronauta sigue siendo la entrada inicial. El holograma mantiene sus variantes neutra, masculina y femenina, shader, giro, zoom y lecturas sobre el cuerpo; seleccionar una región abre las fichas de salud del flujo actual. Los accesos HTML de main siguen disponibles si falla el modelo o WebGL.

`useCrewHologramViewModel` administra solo representación y apariencia por hábitat/persona durante la visita. No amplía el ViewModel de salud ni modifica dominio, diario o sensores. Al salir de Tripulación o recargar se reinicia. Los estilos viven en `crew/human-hologram.css`. Los recursos y sus licencias están documentados en `public/models/ATTRIBUTION.md`; el portal de etiquetas permanece separado del Canvas. Las maquetas locales anteriores de Chequeo Diario y Aurora no forman parte de esta integración.

### Procedencia verificable de muestras

Historial añade «Ver origen» por muestra, conservando la distribución y el tema actuales. Los adaptadores sintéticos construyen metadatos cuantitativos portables con sujeto, origen, método, unidad, calidad y tiempo. El mapper prepara la ficha para View; las fases de estudio se mantienen como fases y el contexto de la instantánea no se presenta como actividad confirmada de cada muestra histórica. No se modifica la persistencia. Detalle y límites en [measurement-contract.md](measurement-contract.md).

## Consumir radiación ambiental

El backend Java ya ofrece catálogo y series de NASA RadLab. La web todavía no los consume; crear una feature/adapter ambiental separado del consumidor de signos vitales. Ejemplos, CORS, errores, zonas horarias y límites en [radlab-backend.md](radlab-backend.md). El contrato comparte `docs/contracts/openapi.yaml` y no requiere cambiar paleta o modelos.
