# Consola de misión y Tumi · entrega Fabian3

Estado documentado al 15 de noviembre de 2026. Esta entrega reúne el resumen corporal de Centro de Misión, el estilo compartido, la navegación inferior y la guía contextual de Tumi.

## Comportamiento disponible

- Centro de Misión muestra astronauta central, indicadores circulares de cobertura, seguimiento y contexto ambiental. Los registros y tendencias se abren en «Registros, tendencias y seguimiento».
- Los arcos describen muestras presentes en la serie sintética, no porcentajes de salud ni rangos clínicos. Radiación indica que la vista no consultó lecturas ambientales y que no existe dosimetría personal.
- Misión, Mapa y Tierra comparten fondo atenuado, cabecera compacta y paneles ligeros. Cada sección conserva su distribución y controles; Tumi conserva su diseño propio.
- La barra inferior incluye Mapa, Tierra, las nueve secciones y Tumi. Identifica la sección activa, se desplaza horizontalmente en móvil y reserva espacio para el contenido y el chat.
- Tumi conserva conversación y modo de guía entre apartados y hábitats. «¿Qué puedo hacer aquí?» explica el apartado abierto, también sin telemetría. Recargar reinicia la conversación; la portada no muestra el chat.

## Ayuda discreta

«Guía con el puntero» se activa voluntariamente desde el chat. Solo explica controles registrados de navegación, lecturas, comparación y revisión/guardado. El fondo y los controles sin explicación propia no generan mensajes genéricos.

Con ratón espera una pausa de 900 ms; desplazarse más de 8 px reinicia la espera. Dentro de la misma vista deja al menos 1800 ms entre apariciones. Salir del control, hacer clic, desplazar la página o cambiar de vista cancela la sugerencia pendiente. El foco intencional por teclado ofrece ayuda inmediata; Escape sale de la guía. En táctil se conserva el primer toque para explicar y el segundo para usar el control. Movimiento reducido mantiene la explicación sin desplazar el robot.

El catálogo y las respuestas son locales y deterministas. No se añaden aprendizaje automático, proveedor de IA ni APIs.

## Responsabilidades y estado

| Pieza                                       | Responsabilidad                                                                                                                              |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `mission-overview`                          | Screen/ViewModel/View del resumen; `mapAstronautOverview` prepara cobertura, identidad y ambiente. La elección de peligro es visual y local. |
| `MissionScene` / `AstronautModel`           | Recursos locales, fallback y portal independiente de hotspots. El resumen desactiva el balanceo y conserva controles manuales.               |
| `MissionShell` / `MissionNavigationDock`    | Composición, intenciones de navegación, apartado activo y host del acceso a Tumi.                                                            |
| `MissionAssistantProvider`                  | Isla cliente del layout raíz de servidor; conserva Tumi durante la navegación.                                                               |
| `MissionWorkspaceProvider`                  | Publica la instantánea del hábitat y la retira al desmontarse; mantiene los datos del flujo de misión.                                       |
| `MissionAssistantScreen` / ViewModel / View | Conectan contexto, conversación, dictado local y representación del chat.                                                                    |
| `AssistantCoachmark`                        | Espera visual, cancelación, posición, foco y limpieza de listeners y temporizadores.                                                         |

Una muestra elegida explícitamente conserva su persona y hora identificadas hasta quitarla o reemplazarla. El explorador no reutiliza la instantánea del hábitat anterior como si fuera propia. No cambian claves ni esquemas de almacenamiento de diarios o autorregistros.

## Validación registrada

El último `npm run check` aprobó TypeScript, ESLint, formato, 92 pruebas unitarias en 18 archivos y build. Las tres pruebas de `assistantCoachmark.test.tsx` verifican pausa del puntero, exclusión de fondo/controles comunes, cancelación y separación de sugerencias.

La suite general de navegador ejecutó 61 casos: 58 aprobaron y tres detectaron aserciones desactualizadas del resumen (dos títulos anteriores y un panel plegado que la prueba no abría). Se corrigieron y se repitieron las cuatro suites afectadas: 21 casos aprobados sobre el build actualizado. Tras el ajuste final de discreción se reconstruyó y se ejecutó `mission-assistant.spec.ts`: 11 casos aprobados, incluyendo todos los apartados, Mapa/Tierra, entrada directa, móvil, recarga, teclado, táctil y muestras. No se registra otra ejecución completa de los 61 casos después del último ajuste.

Comandos desde la raíz, con Node compatible con `.nvmrc` y Chrome instalado:

```bash
npm run check
PLAYWRIGHT_PORT=3107 npm run test:e2e
# Para filtrar, pasar los argumentos directamente al workspace:
PLAYWRIGHT_PORT=3107 npm run test:e2e --workspace frontend -- mission-assistant.spec.ts
```

Usar un puerto libre y build actualizado, sin detener servidores ajenos. Las capturas `astronaut-overview-*.png`, `navigation-dock-*.png` y `lab-console-*.png` en `docs/qa/` documentan revisiones visuales del trabajo acumulado. Ver [uso de Tumi](../../frontend/src/presentation/features/mission-assistant/README.md) y [guía de QA](../qa/verification.md).

## Pendientes y límites

El consumo web de radiación ambiental continúa pendiente; este cambio no integra el backend Java existente. No hay datos personales reales, sincronización, modo offline completo ni interpretación médica validada. El fundamento y alcance de radiación se detallan en [la propuesta de Fabian3](../product/radiation-focus-fabian3.md).
