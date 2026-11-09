# Definir una feature o flujo

Copiar esta estructura al medio que use el equipo para repartir una tarea. Completar únicamente los apartados que aporten contexto. Los campos entre corchetes son espacios de la plantilla, no funcionalidades pendientes del producto.

## Resultado esperado

- Nombre: [feature/flujo/vista].
- Usuario y necesidad: [quién hace qué y para qué].
- Capa: [frontend / backend / integración].
- Responsable y colaboradores: [personas].
- Alcance: [qué se implementa en esta entrega].

## Comportamiento y aceptación

- Dado [contexto], cuando [acción], entonces [resultado visible].
- Datos disponibles/ausentes: [cómo se presenta cada caso].
- Error y reintento: [comportamiento esperado].
- Persistencia: [qué se conserva y dónde, si corresponde].

## Pantallas y flujo, si aplica

- Pantallas/pasos: [entrada -> pasos -> resultado/cancelación].
- Por pantalla: [NombreScreen, useNombreViewModel, NombreView y NombreData].
- Navegación: [intenciones, parámetros, volver/cerrar y URL directa].
- Estado entre pasos: [propietario, writers, readers y limpieza].
- Recarga y entrada sin estado previo: [fallback esperado].

## Contratos y zonas compartidas

- Entidades/casos de uso/puertos: [solo los necesarios].
- API o props afectadas: [contrato vigente o cambio propuesto].
- Consumidores y archivos compartidos: [qué coordinar con el equipo].
- Datos: [origen, unidad, timestamp y calidad si son mediciones].

## Validación y entrega

- Pruebas de comportamiento: [qué demuestra que funciona].
- Checks: [npm run check y E2E cuando corresponda; wrapper Java si existe].
- Documentación que cambia: [referencias relevantes].
- Dependencias o decisiones pendientes: [qué impide completar una parte, sin simular éxito].

## Prompt de arranque

```text
Lee AGENTS.md, CONTRIBUTING.md y la skill local correspondiente a esta tarea.
Implementa el resultado y los criterios definidos arriba.
Para vistas usa Screen -> useNombreViewModel -> View; conserva los límites entre capas.
Revisa consumidores antes de cambiar contratos y no sobrescribas trabajo ajeno.
Ejecuta la validación pertinente y comunica resultado, evidencia y pendientes.
```
