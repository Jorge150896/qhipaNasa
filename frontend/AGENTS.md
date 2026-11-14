# Frontend ASTRA

Aplicar primero el `AGENTS.md` raíz y la skill local `.agents/skills/next-react-clean-architecture/SKILL.md`. Leer `docs/development/screens-and-flows.md` para vistas y flujos. Todas esas rutas se expresan desde la raíz del proyecto; `src/` de este documento es relativo a `frontend/`.

## Convención de nuevas vistas

```text
src/presentation/features/<feature>/<flow>/<step>/
  FeatureFlowStepScreen.tsx
  useFeatureFlowStepViewModel.ts
  types.ts
  components/
    FeatureFlowStepView.tsx
```

Crear solo la profundidad y los archivos que tengan responsabilidades reales. Una feature simple no requiere flow/step. `constants.ts`, mapper, factory y README local se añaden cuando haya contenido o contratos que explicar.

Screen conecta y navega; ViewModel prepara datos/estado y ejecuta casos de uso inyectados; View renderiza `data` y callbacks. La View no importa HTTP, navegación, repositorios ni SDKs. El estado puramente visual puede ser local a View o a un componente privado.

## Referencia de código existente

- Screen: `src/presentation/features/mission/MissionScreen.tsx`.
- ViewModel del flujo (nombre histórico): `src/presentation/features/mission/useMission.ts`.
- Views por sección: `src/presentation/features/crew/components/CrewView.tsx`, `history/components/HistoryView.tsx` y sus features hermanas; dashboard compartido en `src/presentation/shared/mission/MissionDashboardView.tsx`.
- Tipos y mapping: `types.ts` y `mapMissionPresentation.ts` en esa feature.
- Composición: `src/di/createMissionDependencies.client.ts`.
- Estado entre rutas: `MissionWorkspaceProvider.tsx`, montado por `src/app/mission/layout.tsx`.

No usar el provider de misión como contenedor de features sin relación. Para un flujo nuevo definir propietario, entrada directa, inicio/fin, limpieza y fallback. Una nueva ViewModel de pantalla recibe únicamente las capacidades que consume.

## Next y recursos

Rutas delgadas y Server Components por defecto. Los hooks son de cliente; no mover todo el layout raíz al navegador. Nunca pasar instancias de repositorios/casos de uso por la frontera servidor/cliente. El visor 3D se carga diferido; los modelos permanecen locales con sus atribuciones y fallback.

Usar alias `@/` al cruzar capas y rutas relativas dentro de una feature. No usar imports relativos para eludir las restricciones de ESLint. No instalar paquetes o crear contratos/factories sin una necesidad de la feature.

## Validación

Desde la raíz: `npm run check`. También `npm run test:e2e` si cambia navegación, 3D o persistencia. La configuración de navegador y requisitos están en `docs/qa/verification.md`. No iniciar un segundo servidor de pruebas en un puerto ocupado ni detener uno ajeno; usar el mecanismo de reutilización configurado.


<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
