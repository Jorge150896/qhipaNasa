# ASTRA: contrato compartido de desarrollo

## Antes de implementar

Leer `README.md`, `CONTRIBUTING.md` y `docs/architecture/system.md`. La solicitud del usuario define el alcance. Las reglas y skills de este proyecto acompañan al código y no dependen de la configuración personal de quien lo inició.

Aplicar la skill local correspondiente y sus referencias relevantes:

| Trabajo                                  | Skill del proyecto                                       | Documentación adicional                                                                       |
| ---------------------------------------- | -------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Vista, pantalla, flujo o feature web     | `.agents/skills/next-react-clean-architecture/SKILL.md`  | `frontend/AGENTS.md`, `docs/development/frontend.md`, `docs/development/screens-and-flows.md` |
| Módulo o feature Java/Spring Boot        | `.agents/skills/java-spring-clean-architecture/SKILL.md` | Estado real del backend y contrato existente                                                  |
| Contrato/API que afecta ambos lados      | Ambas skills, sin cargarlas recursivamente               | Contrato OpenAPI si existe y consumidores Java/TypeScript                                     |
| Preparar una feature para otro compañero | Skill de la capa involucrada                             | `docs/development/feature-template.md`                                                        |

Si existe una skill personal con el mismo nombre, leer y aplicar expresamente la versión de `.agents/skills/` para este proyecto. Otra herramienta de IA puede leer estos mismos archivos cuando no los descubra automáticamente. No afirmar que una integración existe sin revisar el código.

## Vistas y flujos: patrón obligatorio inspirado en scotia

```text
Route -> FeatureScreen -> useFeatureViewModel -> FeatureView
                              |
                              v
                           Use Case -> Repository interface -> Adapter
```

La flecha hacia View representa los datos/callbacks que Screen le entrega. View no llama al caso de uso.

- **Screen:** conecta dependencias, ViewModel y View; traduce intenciones a navegación y orquesta modales. No hace fetch, lee storage ni implementa reglas de negocio.
- **useFeatureViewModel:** hook que recibe casos de uso/adapters ya compuestos; administra estado, acciones, cancelación y modelo presentable. No navega, renderiza ni construye repositorios.
- **View:** renderiza `data` y emite callbacks explícitos. No conoce servicios, DTOs, SDKs, storage, repositorios ni rutas. Puede contener estado puramente visual local.
- Una nueva vista interactiva con lógica real usa `FeatureScreen.tsx`, `useFeatureViewModel.ts`, `types.ts` y `components/FeatureView.tsx`. Los nombres conservan feature/flujo/paso cuando evitan ambigüedad.
- Flujos grandes se organizan por feature/flujo/pantalla, con propietario del estado, entrada directa, writers/readers, cancelación y limpieza documentados. No volcar todas las features en el provider o ViewModel de misión.
- El hook existente `useMission.ts` cumple el papel de ViewModel de ese flujo. Se conserva su nombre; no duplicarlo ni renombrarlo masivamente al desarrollar una feature. Los hooks nuevos siguen la convención explícita `use<Nombre>ViewModel`.
- Una pantalla estática sin estado ni operaciones puede ser Screen/View de servidor; no crear un ViewModel vacío por ceremonia.

Consultar `docs/development/screens-and-flows.md` para estructura, responsabilidades y ejemplo real.

## Fronteras y alcance

- Frontend vive en `frontend/`; la raíz es un workspace npm. Usar `package-lock.json` y versiones compatibles con su lockfile.
- Antes de usar APIs de Next leer las guías correspondientes en `node_modules/next/dist/docs/` de la versión instalada.
- Dominio sin React, Next, storage ni adapters; repositorios implementan contratos y `src/di` compone dependencias.
- Componentes privados junto a su pantalla; compartidos de flujo en el flujo; componentes de negocio entre features en presentation/shared; UI genérica en src/ui.
- Java/Spring Boot es el backend acordado. No duplicar su negocio en Next. Definir y documentar el contrato necesario al implementar una integración solicitada; no inventar endpoints unilateralmente ni tecnologías futuras.
- No introducir umbrales médicos o respuestas de IA como si estuvieran validados. Mantener el origen sintético, fecha, unidad y calidad de los escenarios de demo.
- Preservar registros y cambios existentes. No borrar datos incompatibles silenciosamente ni anunciar guardado cuando falle storage.
- Modelos 3D y texturas locales con atribución; su fallo no bloquea los controles HTML. Conservar el portal independiente de los hotspots al modificar el visor.
- Implementar solo el cambio solicitado y sus dependencias reales. Las decisiones rutinarias dentro de ese alcance no requieren confirmaciones adicionales. Aclarar requisitos que no se puedan inferir mientras se avanza en trabajo independiente.
- Si cambia un límite compartido, identificar consumidores y mantener documentación y contratos coherentes. Si se usa Git, revisar cambios existentes antes de editar y trabajar en una rama por feature, sin sobrescribir trabajo ajeno.

## Cierre de una entrega

Para código frontend ejecutar `npm run check` desde la raíz. Ante cambios de navegación, 3D o persistencia ejecutar además `npm run test:e2e` sobre el build actualizado, verificando escritorio, móvil y recarga. El uso de almacenamiento de demo no es un modo offline completo.

Probar comportamiento proporcional al riesgo, sin porcentajes heredados de scotia ni tests ceremoniales. Si un check no puede ejecutarse, informar la causa y su alcance; no llamarlo aprobado. Para Java usar el wrapper y los checks definidos cuando exista el backend.

Actualizar documentación si cambia arquitectura, contratos o uso público. Entregar resultado, validaciones y pendientes reales. No copiar material bancario, datos privados ni assets de scotia: la referencia es estructural.
