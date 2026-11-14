# ASTRA: propuesta de explorador espacial 3D

## Intención del usuario

Proponer una vista espacial con Tierra, Luna, Marte, una estación y una nave seleccionables. Al seleccionar un objeto se consulta su contexto y se entra al lugar operativo correspondiente; desde allí se exploran sus tripulantes, indicadores y análisis.

**Actualización — primera implementación:** ya existe `/explore`, con Tierra, Luna, Marte, Aurora y Odyssey, selección 3D/HTML, ficha, cuatro hábitats sintéticos y entrada a sus tripulantes. Se conservan las ocho secciones y el diario original. Hay 12 personas ficticias únicas; Tierra comparte la estación en órbita, sin duplicar su tripulación. Destino en query string y rutas de hábitat recargables. Cámara manual con restablecimiento; el enfoque automático suave sigue como mejora propuesta.

El resto de este documento conserva el análisis y las ideas iniciales. Las rutas y la estructura efectivamente implementadas están en `docs/development/frontend.md`; las propuestas adicionales no se consideran completadas. No es un catálogo de misiones reales.

## Papel dentro del producto

El explorador será una entrada visual a la salud de la tripulación por contexto de misión. Conserva el objetivo del reto: comprender cómo está una persona en un entorno y dar seguimiento a sus mediciones. La información astronómica sirve para orientarse y contextualizar, no para desplazar la tarea de salud.

Mantener acceso directo al dashboard y una lista HTML de destinos. El equipo no debe tener que manipular una escena 3D para abrir una observación pendiente o un registro.

## Tres niveles de navegación

1. **Explorador espacial:** Tierra, Luna, Marte y activos operativos visibles. Escena esquemática con selección, foco de cámara y leyenda.
2. **Lugar operativo:** ficha de una estación, nave, rover o base. Contexto, zonas internas, ambiente, tripulación asignada y observaciones de ese lugar.
3. **Persona:** vista de tripulante/cuerpo ya conocida, con indicadores, historial, chequeo y seguimiento del contexto seleccionado.

Un mundo representa un destino o contexto geográfico. Una nave, estación o base representa un hábitat operativo con tripulación y mediciones. No son la misma entidad.

```text
Explorador
  -> Tierra / Luna / Marte
       -> Ficha y lugares operativos asociados
            -> Estación / nave / base disponible
                 -> Tripulación de ese lugar
                      -> Persona, indicadores, historial y análisis

Explorador -> Nave en tránsito -> Su tripulación
```

La nave en tránsito puede seleccionarse directamente. No se la muestra como aterrizada en Marte solo porque su destino sea Marte.

## Comportamiento de la escena

- Tierra, Luna y Marte con iluminación y superficies reconocibles; modelos de referencia y recursos locales con atribución.
- Estación y nave representadas como objetos operativos seleccionables, con etiquetas cortas y foco visible por teclado.
- Al seleccionar: centrar suavemente la cámara y abrir una ficha lateral. No navegar de inmediato con el primer clic.
- Acción explícita: «Explorar lugar» para una nave/estación o «Ver lugares disponibles» para un mundo.
- Mostrar selección, contexto y procedencia. El estado operativo resumido debe reflejar observaciones y calidad de datos; no usar una puntuación de salud inventada.
- Distancias, tamaños y trayectorias se consideran esquemáticos. No afirmar órbitas reales ni posiciones en vivo sin una fuente, tiempo y método definidos.
- Sin animación continua obligatoria. Respetar movimiento reducido; controles de cámara accesibles y alternativa de lista, especialmente en móvil o sin WebGL.

## Ficha lateral según el tipo de objeto

| Objeto                                  | Información útil                                                                                                         | Siguiente acción                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| Tierra, Luna o Marte                    | Nombre, contexto de misión, lugares operativos asociados, procedencia y límites de la representación                     | Ver lugares disponibles                            |
| Estación                                | Misión, entorno orbital de referencia, tripulación asignada, zonas internas, vigencia y revisiones pendientes            | Entrar a estación                                  |
| Nave                                    | Misión, ubicación/destino de referencia, ambiente interior y tripulación; distinguir tránsito de ubicación en superficie | Entrar a nave                                      |
| Base o rover, si existen en el catálogo | Lugar, contexto, zonas y ocupantes registrados; marcar si es un escenario futuro simulado                                | Entrar al hábitat                                  |
| Objeto sin misión o datos asociados     | Información contextual y estado «sin misión disponible» o «sin datos»                                                    | Volver al explorador; sin botón de acceso ficticio |

No mostrar una atmósfera exterior como si fuera el ambiente dentro de un hábitat, ni estimar el efecto corporal solo por seleccionar un mundo.

## Vista del lugar operativo

Cabecera: `Explorador > Destino/contexto > Hábitat`, misión, fecha, procedencia y modo demo/real.

Centro: modelo 3D del lugar y selección de sus zonas. Lateral: ambiente de la zona y observaciones pertinentes. Franja de tripulación: únicamente las personas asignadas al lugar en el instante del escenario.

Al seleccionar una persona abrir su vista corporal preservando misión, hábitat y periodo. Un botón permite volver al lugar o al explorador sin perder el foco anterior. El copiloto diferencia un análisis del hábitat completo de uno de una persona.

## Encaje con el código actual

En el punto de partida anterior al explorador había un solo snapshot `odyssey-01` y una tripulación de tres personas. `CrewMember.zoneId` relaciona a cada persona con una zona interior; no existe un catálogo de planetas, múltiples hábitats o asignaciones entre misiones.

Una implementación inicial no debería pintar esa misma tripulación bajo todos los mundos para simular un catálogo. Se puede comenzar con el explorador y un único lugar operativo funcional para Odyssey; otros objetos muestran contexto o ausencia de misión. Si se necesitan más lugares demostrables, incorporar escenarios sintéticos independientes, identificados y coherentes.

Extensiones de modelo propuestas:

- `SpaceLocation`: contexto celestial, por ejemplo Tierra/Luna/Marte, con metadatos de procedencia.
- `MissionHabitat`: activo operativo; tipo, misión, contexto de ubicación, destino opcional y disponibilidad.
- `CrewAssignment`: persona, misión, hábitat e intervalo de asignación, cuando haya más de una misión.
- Snapshot seleccionado por misión/hábitat/tiempo; zonas interiores y lecturas asociadas a ese snapshot.

No añadir estas entidades como carpetas vacías. Implementarlas al materializar el flujo y sus consumidores.

## Rutas y estado propuestos

Ejemplos de la propuesta original; consultar las rutas implementadas en la guía de frontend:

```text
/explore
/explore/locations/:locationId
/missions/:missionId/habitats/:habitatId
/missions/:missionId/habitats/:habitatId/crew/:crewId
```

La URL debe permitir entrada directa y recarga con el contexto correcto. Cambiar de mundo no modifica por sí mismo la ubicación de una persona. Una selección de exploración es distinta de una asignación de tripulación.

El provider de misión actual no debe convertirse en un estado global de todo el universo. Mantener un flujo de explorador separado y cargar la misión/hábitat al entrar. Las claves del diario, selección y revisiones necesitarán considerar misión/hábitat cuando se amplíe el catálogo; preservar o migrar los registros existentes de forma explícita para evitar colisiones.

## Organización frontend

La nueva feature sigue Screen -> useNombreViewModel -> View:

```text
presentation/features/space-map/
  SpaceExplorerScreen.tsx
  useSpaceExplorerViewModel.ts
  types.ts
  components/SpaceExplorerView.tsx
```

Screen decide navegación. ViewModel recibe capacidades de consulta y prepara fichas/selección. View y escena emiten intenciones de selección/apertura y no conocen rutas ni repositorios. El renderizador 3D recibe modelos presentables y callbacks; repositorios y composición mantienen el catálogo reemplazable por Java.

Las vistas de lugar y tripulante siguen la misma separación. Reutilizar componentes de indicadores, gráficos, ambiente y cuerpo; adaptarlos para recibir el contexto correcto, en lugar de duplicar todo el dashboard.

## Primera entrega recomendada

1. Explorador con cinco objetos seleccionables: Tierra, Luna, Marte, una estación conceptual y Odyssey.
2. Ficha lateral y lista accesible equivalentes, con disponibilidad y origen explícitos.
3. Recorrido completo desde Odyssey a su lugar, zonas y tripulación, reutilizando la experiencia actual.
4. Objetos sin datos con estados honestos; sin inventar telemetría para llenarlos.
5. Navegación de vuelta, URL directa, recarga y fallback 3D verificados.

Después: otros hábitats con escenarios propios, filtros por misión, nuevas fuentes y datos reales cuando se acuerde su integración. No crear un simulador orbital ni interiores detallados como dependencia de esta primera entrega.

## Criterios de aceptación

- La ficha y el foco corresponden al objeto seleccionado y no se pierde el acceso por teclado/lista.
- La apertura conserva identificadores de misión y hábitat; nunca muestra otra tripulación por defecto silenciosamente.
- Se distingue ausencia de datos de valor cero y ambiente exterior de interior.
- Volver, recargar o acceder por URL mantiene o reconstruye un estado válido.
- Dos contextos de misión no pisan los registros del diario de la misma persona.
- Un error del modelo 3D permite completar la navegación con HTML.
- La escena no afirma precisión de escala, órbita o posición sin fuente.
- Los recorridos mantienen autoevaluación y seguimiento de salud como tarea final.
