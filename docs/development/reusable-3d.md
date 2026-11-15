# Reutilizar los modelos 3D

Los modelos del proyecto son componentes React Three Fiber, no archivos GLB exportados. Se pueden reutilizar en otras pantallas sin copiar repositorios, estado de misión ni navegación. No se publica un paquete npm independiente.

## Componentes disponibles

Rutas relativas a `frontend/src/presentation/shared/scene/`:

| Componente | Uso y contrato |
| --- | --- |
| `PlanetSurface` | `kind="earth"`, `"moon"` o `"mars"`, `radius` positivo en unidades de escena. Callbacks opcionales `onTextureReady` y `onTextureError`. No incluye rotación ni controles. |
| `PlanetAtmosphere` | Halo ilustrativo con `radius`; ya está incluido en Tierra. No añadir un segundo halo. |
| `StationModel` | Estación Aurora conceptual. Admite props de `group` para posición, escala, rotación y eventos. La transformación exterior se compone con la orientación original. No representa la ISS real. |
| `ShuttleExteriorModel` | Nave exterior original. `showZones={false}` permite mostrar solo geometría; recibe `selectedZone`, `onSelectZone` y `portal`. Usar un grupo exterior para transformar el modelo. |
| `ShuttleModel` | Selecciona exterior o interior modular al recibir `modules`. Mantiene los contratos de selección y portal. No sustituir el interior por el exterior en Tripulación. |
| `SpaceBackdrop` | Fondo generado localmente; `radius` y `brightness` opcionales. El radio debe quedar dentro del plano lejano de la cámara. |
| `AstronautModel` / `HabitatModel` | Componentes existentes con sensores o módulos. Sus contratos completos están en sus props; para un visor de misión usar `MissionSceneSlot`. |

El astronauta usa `AstronautLighting` y `useAstronautFinish` en el visor de misión y en la vista de personalización. El acabado conserva el GLB y las texturas originales y ajusta el brillo de cada zona a partir de sus colores. Los reflejos se generan con luces locales y se calculan una vez por visor.

`space-map/components/PlanetModel` añade la animación del flujo y depende de su reloj. Para reutilizar una superficie estática, importar `PlanetSurface`. `StationModel` se extrajo del mapa sin cambiar su geometría, para que tenga consumidores independientes.

## Ejemplo mínimo de composición

En una isla cliente, dentro de un visor con fallback de error y de WebGL:

```tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { PlanetSurface } from '@/presentation/shared/scene/PlanetSurface';
import { StationModel } from '@/presentation/shared/scene/StationModel';

export function ExampleScene() {
  return (
    <Canvas camera={{ position: [0, 2, 9], fov: 42 }}
      dpr={[1, 1.5]} frameloop="demand"
      fallback={<p>Usa los controles HTML para continuar.</p>}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[-7, 4, 6]} intensity={2.7} />
      <group position={[-2, 0, 0]}>
        <PlanetSurface kind="earth" radius={1.5} />
      </group>
      <StationModel position={[2, 0, 0]} scale={0.6} />
      <OrbitControls enablePan={false} />
    </Canvas>
  );
}
```

El ejemplo ilustra composición; el consumidor debe añadir Error Boundary, carga diferida del visor, controles HTML equivalentes y pruebas del flujo. `MissionScene` y `LaunchGlobe` muestran implementaciones completas. No colocar hooks de navegación, storage o casos de uso dentro de los modelos.

## Recursos que se deben distribuir

- Copiar `public/textures/` completo, incluida su atribución. `PlanetSurface` usa rutas absolutas `/textures/...`; mantenerlas o adaptar el componente al nuevo host.
- Para el astronauta, incluir `public/models/` y su archivo de atribución.
- Instalar las versiones compatibles fijadas por `package-lock.json`; en este workspace ejecutar `npm ci` desde la raíz.
- Conservar las licencias de Solar System Scope / INOVE (CC BY 4.0) y del astronauta (CC BY 2.0). La procedencia y las transformaciones exactas están en los archivos `ATTRIBUTION.md` de cada carpeta.

La nave, estación y cielo son geometría o gráficos procedimentales del proyecto. No se declaran activos oficiales de NASA ni se asigna una licencia nueva al código. Su redistribución debe respetar la licencia que acuerde el propietario del proyecto.

## Ciclo de vida y límites

`useSceneTexture` libera texturas al desmontar y descarta cargas tardías; la nave y el cielo liberan sus texturas generadas. Mantener instancias estables durante render y evitar un Canvas por tarjeta. Los hotspots HTML usan un portal independiente del Canvas; el consumidor debe conservarlo hasta que se desmonten los hotspots. No reubicar el reproductor de video dentro de Three.js.

Las superficies son ilustraciones educativas: nubes no actuales, relieve lunar/marciano derivado del color y escalas orbitales de demostración. Las coordenadas del globo geográfico sí deben conservar la convención documentada en `launch-sites/components/globeCoordinates.ts`. No aplicar una rotación visual adicional a la Tierra geográfica sin transformar también sus puntos.

Antes de entregar una reutilización: verificar escritorio, móvil, movimiento reducido, recarga y alternativa sin WebGL; ejecutar `npm run check` y, si cambia 3D o navegación, pruebas E2E sobre un build actualizado. Los resultados y limitaciones de esta entrega se registran en `docs/qa/verification.md`.
