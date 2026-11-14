# Integración de main en Fabian · 11 de noviembre de 2026

## Estado de Git y alcance

La base anterior era `61bc8dc`. Se consultó el remoto y Fabian avanzó por fast-forward hasta `origin/main` (`c0f641e`). Los commits incorporados son:

| Commit    | Cambio principal                                                     |
| --------- | -------------------------------------------------------------------- |
| `094246b` | Tema Qhipa Pacha, portada y transiciones de carga.                   |
| `c0f641e` | Ampliación de Tripulación, salud, historial y chequeo por actividad. |

El trabajo local anterior completo quedó en `stash@{0}`, con mensaje `Fabian: full backup before origin/main integration 2026-11-11`. La referencia `backup/fabian-before-main-20261111` conserva ese respaldo, incluidos los archivos que antes no estaban versionados. Puede recuperarse por separado del trabajo integrado.

La implementación activa utiliza los flujos de main. De Fabian se conservaron los tres modelos humanos, licencias, procedencia, script de preparación, shader e interacción del holograma. Las anteriores maquetas de Chequeo Diario y Aurora se retiraron de la copia de trabajo. La rama main local y el remoto no recibieron nuestros cambios ni un push.

## Qué cambia para quien usa la aplicación

### Portada y tema visual

La ruta `/` ahora abre `landing/LandingScreen.tsx`, en lugar de redirigir inmediatamente al centro de misión. La portada permite iniciar la misión, abrir el mapa y consultar Tripulación. La identidad Qhipa Pacha utiliza superficies moradas y acciones naranjas, con un fondo espacial local. Sus tokens se mantienen en `src/app/globals.css`; los detalles están en `visual-theme.md`.

### Carga y navegación

`presentation/shared/loading/TumiLoader` y `TumiHead` proporcionan las transiciones visuales. La introducción mínima de tres segundos pertenece a la entrada desde la portada, no al provider de misión. MissionScreen y SpaceExplorerScreen representan navegación pendiente en el contenido mediante `useTransition`, conservando el menú disponible. `/loading-preview` permite revisar la animación sin depender de una carga real. Se respeta movimiento reducido.

### Centro de misión

`mission-overview/useMissionOverviewViewModel.ts` combina la actividad y ubicación del escenario con el último autorregistro local de la persona seleccionada. Distingue carga, falta de registros y error de lectura. Sus accesos llevan al módulo ocupado o al formulario de Tripulación mediante fragmentos de URL. Las señales sin dato vigente permiten abrir su historial.

### Tripulación

`CrewScreen` compone el visor, las fichas corporales, la línea de tiempo y el área de salud. `useCrewViewModel` administra la selección del sistema, ficha abierta, tendencia, comparación temporal y origen del módulo. `CrewHologram.tsx` es la ficha contextual de main: no es el archivo de la malla humana.

Las fichas permiten inspeccionar una lectura, consultar su tendencia, abrir historial o registrar una observación. La línea de tiempo combina muestras e historiales locales y permite comparar dos muestras del mismo indicador. Una diferencia entre muestras es descriptiva; no constituye una línea de base clínica. Al abrir un módulo desde un registro se conserva su procedencia temporal.

### Módulos y entorno

`ShuttleModuleDeck`, `HabitatCamera` y los marcadores de zona amplían la exploración de nave y hábitats. Las fichas muestran el módulo asignado a la persona, sus condiciones ambientales y ocupantes del escenario. La cámara permite vista general o de módulo. La ubicación simulada y la zona que el usuario explora son conceptos distintos; no hay localización en vivo.

### Salud, visión y ejercicio

`crew-health` añade confirmación antes de guardar y contexto de módulo en autorregistros. Visión distingue leer de cerca, enfocar y mirar a distancia, con preguntas e ilustraciones propias. Ejercicio tiene historial de sesiones y escenas conceptuales de equipos. Los registros de salud mantienen su almacenamiento separado del chequeo diario. No hay evaluaciones instrumentales, diagnósticos automáticos o tratamientos conectados.

### Chequeo Diario de main

El flujo tiene Screen/ViewModel/View, con `useDailyCheckViewModel` propio. Sus pasos son contexto, autoevaluación, revisión y resultado. Cabina, ejercicio, superficie y EVA muestran campos distintos y una consola de telemetría sintética. Las duraciones se describen como previstas, realizadas o transcurridas según el momento. Los campos vacíos se omiten; un cero introducido se conserva.

La validación de campos permitidos vive en `domain/mission/dailyCheckContext.ts` y el caso de uso. El repositorio acepta `context` y `discomfortRegion` opcionales, mantiene la versión y clave del diario y permite editar el chequeo guardado del día UTC después de recargar. Sigue existiendo un registro por persona/día, no un registro independiente por cada actividad.

### Historial de referencia NASA

Historial incorpora un panel de referencia de Inspiration4 / OSD-575, con glucosa, sodio y potasio. El código empaqueta medianas por fase en `data/health/inspiration4MetabolicHistory.ts`, con enlaces a su procedencia. El panel permite seleccionar indicador y fase y consultar tabla y fuentes. Es una referencia estática separada de los personajes ficticios: no se consulta una API NASA en tiempo real y esas cifras no alimentan alertas de la demo. La documentación del repositorio describe su método de extracción; esta integración revisó su uso en el código, sin volver a auditar el CSV científico original.

## Cómo se conservaron nuestros modelos

En Tripulación, «Modelo corporal» permite elegir «Astronauta con traje» o «Holograma humano». El astronauta de main es la entrada inicial. El holograma conserva las apariencias neutra, masculina y femenina, las lecturas flotantes, giro/zoom y el escaneo que respeta movimiento reducido y visibilidad de pestaña.

Los tres GLB fueron comparados con la copia anterior y se conservaron byte por byte. Su licencia y fuentes permanecen en `frontend/public/models/ATTRIBUTION.md`. Seleccionar una región del holograma utiliza el callback de main para abrir la misma ficha y contexto de telemetría. Si falla el modelo o WebGL, los accesos HTML de main siguen disponibles.

`useCrewHologramViewModel` es propietario solo de representación y apariencia por hábitat/persona durante la visita. Se reinicia al desmontar o recargar, sin cambiar registros, métricas o identidad. Los estilos viven en `crew/human-hologram.css`, separados de los estilos globales de main. El portal de etiquetas sigue fuera del Canvas. Los tipos específicos viven en `hologramTypes.ts` para evitar reemplazar los contratos ampliados de Tripulación.

## Qué permanece pendiente

- El backend Java/Spring Boot, autenticación, sincronización, sensores y alertas operativas continúan pendientes. El copiloto sigue siendo determinista.
- La maqueta anterior de Fabian guardaba medidas en `activity`; main utiliza `context` y `discomfortRegion`. Los datos del navegador no se modificaron durante esta integración. Si se guardaron chequeos con aquel campo experimental, requieren exportación o migración antes de reescribirlos: el lector de main no conserva campos desconocidos al persistir de nuevo. No se ha reintroducido el contrato experimental descartado.
- Las preferencias de apariencia son temporales. Persistirlas o asignarlas a perfiles requiere un contrato explícito.
- El nuevo historial NASA es material de referencia, no una regla clínica ni un sustituto de mediciones individuales.

## Validación de la integración

TypeScript, ESLint, formato, 43 pruebas unitarias y build aprobados mediante las herramientas locales. `npm run check` no pudo iniciarse porque `npm` no está disponible en la terminal; sus herramientas se ejecutaron directamente con el Node disponible. Las 28 pruebas E2E aprobaron sobre el build actualizado, incluyendo escritorio, móvil, recarga, persistencia, fichas y variantes holográficas. La primera ejecución perdió un servidor externo con SIGTERM; la repetición completa mantuvo servidor y pruebas bajo el mismo proceso y terminó sin fallos. Los cambios propios quedan preparados para commit, pendiente de la identidad de autor solicitada al usuario.
