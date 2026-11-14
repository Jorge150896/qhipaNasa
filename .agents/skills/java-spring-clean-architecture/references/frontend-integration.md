# Conocer el frontend y coordinar contratos

Skill compañera: [next-react-clean-architecture](../../next-react-clean-architecture/SKILL.md). Leerla solo para un cambio de arquitectura conjunto; no cargar skills recursivamente. Los acuerdos comunes están en `docs/architecture/system.md` del proyecto NASA.

## Modelo mental del frontend

```text
src/app -> FeatureScreen -> useFeatureViewModel -> FeatureView
                           -> caso de uso TS -> Repository interface
                                                ^ implementación en data
                           infraestructura HTTP/stream detrás del adapter
```

- Next usa Server Components por defecto; las islas interactivas usan hooks/cliente. DI de servidor y navegador separadas.
- Cada vista nueva conserva Screen, hook `use<Nombre>ViewModel`, View y tipos presentables. Screen conecta dependencias/navegación; ViewModel recibe casos de uso, prepara `FeatureData` y coordina estado/cancelación. View renderiza props, no conoce API. El hook existente `useMission.ts` es el ViewModel del flujo implementado; no se duplica por cambiar la convención de nombres. Consultar `docs/development/screens-and-flows.md`.
- Frontend conserva entidades TypeScript propias: no consume modelos JPA ni clases Java. DTOs de red se validan/mapean en data; los tipos generados no prueban que una respuesta real sea válida.
- Servidor Java decide permisos e integridad; frontend puede anticipar validaciones de UX. Cancelar fetch en cliente no garantiza revertir una escritura ya iniciada.

## Cómo se traduce scotia

Su documentación de arquitectura, DI y workflows fue inspeccionada al crear la skill frontend. Su referencia detallada está en [referencia-scotia.md](../../next-react-clean-architecture/references/referencia-scotia.md).

| Patrón de referencia | Equivalente Java |
| --- | --- |
| Use case sin plataforma | Caso de uso Java sin Spring |
| Repository interface | Puerto de salida de application |
| ApiRepository / adapter | Adapter externo o de persistencia |
| Factory de dependencias | Configuration / beans por constructor |
| DTO -> dominio -> FeatureData | DTO HTTP separado de dominio; FeatureData pertenece al frontend |

La ubicación de los casos de uso difiere intencionalmente: `domain/usecases` en frontend por afinidad con scotia, `application/usecase` en Java. Importa preservar dependencias, no igualar nombres de directorio.

## Trabajo de integración

Consultar el contrato OpenAPI existente antes de cambiar Java o TypeScript. Si aún no existe, definir solo las operaciones solicitadas y documentar ejemplos antes de conectar adapters. Revisar conjuntamente null/ausente, errores, zona horaria, unidades, precisión de IDs y paginación. Un cambio en el contrato debe reflejarse en DTOs, mappers, fixtures sintéticos y pruebas de los consumidores existentes.

No decidir SSE vs WebSocket, browser directo vs Next server ni autenticación por conveniencia unilateral. Elegir según la feature implementada y registrarlo en la fuente compartida. No hace falta que el usuario apruebe cada decisión rutinaria ya autorizada.
