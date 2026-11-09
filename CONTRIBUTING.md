# Trabajar en ASTRA con el equipo

## Recibir y abrir el proyecto

El enlace temporal de ASTRA permite probar la aplicación; no da acceso al proyecto para editarlo. Para desarrollar, cada compañero necesita una copia de la carpeta del proyecto, incluyendo `AGENTS.md`, `.agents/`, documentación, código, modelos y `package-lock.json`. Puede compartirse por un archivo comprimido u otro medio acordado, sin GitHub. No hace falta compartir `node_modules/`, `.next/`, archivos de entorno personales ni registros de navegador.

Abrir la raíz del proyecto en el editor o Codex, no únicamente `frontend/`. Instalar Node 24 (ver `.nvmrc`), ejecutar `npm ci` y `npm run dev` desde la raíz. Consultar el README para otros comandos.

## Qué leer y qué skill usar

1. `AGENTS.md`: reglas comunes, reparto de responsabilidades y validación.
2. `docs/architecture/system.md`: qué está implementado y cómo se coordinará con Java.
3. Para web, `frontend/AGENTS.md` y `docs/development/screens-and-flows.md`.
4. La skill de la tarea:

| Tarea                             | Nombre                            | Archivo compartido                                       |
| --------------------------------- | --------------------------------- | -------------------------------------------------------- |
| Feature, vista o flujo Next/React | `$next-react-clean-architecture`  | `.agents/skills/next-react-clean-architecture/SKILL.md`  |
| Feature Java/Spring Boot          | `$java-spring-clean-architecture` | `.agents/skills/java-spring-clean-architecture/SKILL.md` |
| Integración completa              | Ambas, según las capas afectadas  | Esos dos archivos y el contrato común                    |

Las skills ya están dentro del proyecto y tienen referencias cruzadas. No necesitan acceso al equipo del autor ni a scotia; la síntesis de sus patrones está incluida. Para este proyecto prevalece la versión local frente a una copia personal desactualizada.

Codex documenta las skills de equipo en `.agents/skills/` y las instrucciones de proyecto en `AGENTS.md`. Su detección depende de la herramienta y de la sesión; si no aparecen al abrir el proyecto, indicar expresamente que lea los archivos anteriores. Otras herramientas de IA pueden seguirlos si se les pide leerlos; no se presupone que los descubran automáticamente. [Documentación oficial de personalización](https://learn.chatgpt.com/docs/customization/overview), [skills](https://learn.chatgpt.com/docs/build-skills).

Consulta el [mapa de features y vistas](docs/development/features-map.md) para identificar qué carpeta y archivos corresponden a cada funcionalidad.

## Pedir una nueva feature a la IA

Ejemplo listo para adaptar:

```text
Lee AGENTS.md, CONTRIBUTING.md y docs/architecture/system.md.
Usa la skill local .agents/skills/next-react-clean-architecture/SKILL.md.
Implementa la feature [nombre] con estos criterios: [comportamientos observables].
Organiza sus vistas en Screen -> use<Nombre>ViewModel -> View, con types.ts.
Si tiene varios pasos, sigue docs/development/screens-and-flows.md.
Revisa consumidores y código vecino; conserva los límites con Java.
Implementa solo esta feature y sus dependencias reales.
Ejecuta los checks pertinentes y entrega cambios, validación y pendientes.
```

Para Java sustituir la skill por `.agents/skills/java-spring-clean-architecture/SKILL.md`. Para una integración definir primero el contrato necesario y migrar los consumidores que existan. No pedir confirmación repetida para decisiones rutinarias dentro de la feature ya autorizada.

Usar `docs/development/feature-template.md` para definir alcance antes de repartir una tarea. No es un formulario obligatorio para una corrección pequeña.

## Trabajar en paralelo sin pisarse

- Acordar la feature/flujo y los archivos que llevará cada persona; no repartir únicamente componentes de una misma pantalla sin definir su contrato de props.
- Identificar archivos compartidos: `domain/mission`, `useMission.ts`, `MissionWorkspaceProvider`, DI, navegación, tipos, CSS global y lockfile. Coordinar cambios en esas fronteras y evitar ampliarlas para features independientes.
- Para flujos nuevos usar carpetas propias con Screen/ViewModel/View por pantalla; documentar propietario y limpieza del estado compartido.
- Si usan Git, una rama por feature y cambios pequeños. No es obligatorio usar GitHub. Sin Git, intercambiar cambios identificables y conservar una copia antes de integrar, evitando sobrescribir carpetas de otros sin comparar.
- Cambios de API: acordar nombres, tipos, unidades, fechas, ausencia y errores en un contrato común. No crear contratos distintos por separado en Java y TypeScript.
- Cambios de dependencias: coordinar edición de package.json y lockfile; usar `npm ci` al recibir una versión del proyecto.

## Terminar una entrega

Para frontend ejecutar `npm run check`. Para navegación, 3D o persistencia también `npm run test:e2e` después del build; requisitos de Chrome/Chromium en `docs/qa/verification.md`. Revisar los estados pertinentes de carga, error, vacío y éxito, teclado, móvil y comportamiento con datos ausentes.

Entregar una descripción breve del comportamiento final, áreas modificadas, checks ejecutados y pendientes reales. Actualizar docs/contratos cuando cambien; no modificar reglas para eludir una validación ni afirmar integración real si solo hay simulación.

## Mantener estas reglas

Las fuentes compartidas son `AGENTS.md`, `frontend/AGENTS.md`, `.agents/skills/` y `docs/`. Cuando cambie una convención, actualizar sus consumidores y referencias cruzadas en el mismo cambio. Las instalaciones personales de skills no se sincronizan automáticamente con esta carpeta.
