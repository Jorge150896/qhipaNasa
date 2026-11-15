'use client';
import { StationModel } from '@/presentation/shared/scene/StationModel';
import {
  Component,
  useState,
  useRef,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
  type RefObject,
} from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { mapObjectRadii, mapPositions, transitCurve, transitProgress } from './spaceMapLayout';
import { Html, Line } from '@react-three/drei';
import { ShuttleModel } from '@/presentation/shared/scene/ShuttleModel';
import { Icon } from '@/ui/Icon';
import type { DestinationData, DestinationKey } from '../types';
import { PlanetModel } from './PlanetModel';
import { SpaceBackdrop } from '../../../shared/scene/SpaceBackdrop';
import { SolarSystemReferences } from './SolarSystemReferences';
import { SceneMotion, useSceneMotionClock } from './SceneMotion';
import { orbitalMotion, orbitalPosition, orbitalAngle } from './orbitalMotion';
import { SolarNavigation, useSolarNavigation, type ZoomRequest } from './SolarNavigation';
import { SolarOverview } from './SolarOverview';
import { solarOrbits, type SolarViewLevel } from './solarSystemModel';
import { referencePlanets } from './referencePlanets';
function subscribeReducedMotion(callback: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}
const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const getServerReducedMotion = () => true;
function TransitObject({
  destinationId,
  children,
  model,
  ...props
}: {
  destinationId: DestinationKey;
  children: ReactNode;
  model: ReactNode;
  position: [number, number, number];
  onClick(event: ThreeEvent<MouseEvent>): void;
}) {
  const group = useRef<Group>(null);
  const heading = useRef<Group>(null);
  const elapsed = useSceneMotionClock();
  const navigation = useSolarNavigation();
  const tangent = useRef(new Vector3());
  useFrame(() => {
    if (!group.current) return;
    const view = navigation.current;
    group.current.visible =
      !(destinationId === 'moon' || destinationId === 'station') || view.ratio < 4;
    if ((destinationId === 'earth' || destinationId === 'mars') && heading.current) {
      const radius = mapObjectRadii[destinationId];
      const factor = destinationId === 'earth' ? 0.008 : 0.007;
      heading.current.scale.setScalar(
        1 +
          (Math.min(2.4 / radius, Math.max(1, (view.distance * factor) / radius)) - 1) *
            view.reveal,
      );
    }
    if (destinationId === 'ship') {
      const progress = transitProgress(elapsed.current);
      transitCurve.getPointAt(progress, group.current.position);
      transitCurve.getTangentAt(progress, tangent.current);
      if (heading.current)
        heading.current.rotation.set(0, Math.atan2(-tangent.current.x, -tangent.current.z), 0);
    } else if (destinationId === 'moon' || destinationId === 'station') {
      orbitalPosition(destinationId, elapsed.current, group.current.position);
      if (destinationId === 'station' && heading.current)
        heading.current.rotation.y = -orbitalAngle('station', elapsed.current);
    }
  });
  return (
    <group ref={group} {...props}>
      <group ref={heading}>{model}</group>
      {children}
    </group>
  );
}
function MapFallback() {
  return (
    <div className="fleet-loading" role="status">
      <Icon name="orbit" size={36} />
      <p>El mapa 3D no está disponible.</p>
      <p>Selecciona un destino en los botones inferiores para explorar su tripulación.</p>
    </div>
  );
}
class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <MapFallback /> : this.props.children;
  }
}
function MapObjects({
  destinations,
  selected,
  onSelect,
  portal,
  visibleCard,
  onDismissCard,
  onOpenEarthCenters,
  level,
}: {
  level: SolarViewLevel;
  visibleCard: DestinationKey | null;
  onDismissCard(): void;
  onOpenEarthCenters(): void;
  destinations: DestinationData[];
  selected: DestinationKey;
  onSelect(id: DestinationKey): void;
  portal: RefObject<HTMLElement>;
}) {
  return (
    <>
      {(['moon', 'station'] as const).map((id) => (
        <Line
          key={id}
          points={Array.from({ length: 97 }, (_, index) =>
            orbitalPosition(id, (index / 96) * orbitalMotion[id].period),
          )}
          color={id === 'moon' ? '#4a5969' : '#2f6875'}
          transparent
          opacity={0.55}
          lineWidth={0.7}
        />
      ))}
      <Line
        points={transitCurve.getPoints(80)}
        color="#ae8764"
        dashed
        dashSize={0.12}
        gapSize={0.1}
        lineWidth={1}
      />
      {destinations.map((destination) => (
        <TransitObject
          key={destination.id}
          destinationId={destination.id}
          position={mapPositions[destination.id]}
          model={
            destination.id === 'earth' || destination.id === 'moon' || destination.id === 'mars' ? (
              <PlanetModel kind={destination.id} radius={mapObjectRadii[destination.id]} />
            ) : destination.id === 'station' ? (
              <StationModel />
            ) : (
              <group rotation={[0, -0.5, 0]} scale={0.43}>
                <ShuttleModel
                  portal={portal}
                  selectedZone=""
                  onSelectZone={() => {}}
                  showZones={false}
                />
              </group>
            )
          }
          onClick={(event) => {
            event.stopPropagation();
            onSelect(destination.id);
          }}
        >
          {selected === destination.id && (
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, -(destination.id === 'earth' ? 1.3 : 0.75), 0]}
            >
              <ringGeometry
                args={[
                  destination.id === 'earth' ? 1.3 : 0.85,
                  destination.id === 'earth' ? 1.32 : 0.87,
                  80,
                ]}
              />
              <meshBasicMaterial color="#8ce0da" transparent opacity={0.7} side={2} />
            </mesh>
          )}
          {level !== 'mission' && (destination.id === 'earth' || destination.id === 'mars') && (
            <Html
              portal={portal}
              position={[0, 0.5, 0]}
              center
              zIndexRange={[20, 0]}
              style={{ pointerEvents: 'auto' }}
            >
              <button
                className={`fleet-focus-label fleet-focus-${destination.id}`}
                onClick={() => onSelect(destination.id)}
                aria-label={`Enfocar ${destination.name}`}
              >
                <span /> {destination.name}
              </button>
            </Html>
          )}
          {visibleCard === destination.id &&
            (level === 'mission' || destination.id === 'earth' || destination.id === 'mars') && (
              <Html
                portal={portal}
                position={
                  destination.id === 'moon'
                    ? [0, 1, 0]
                    : destination.id === 'ship'
                      ? [0.6, 0.5, 0]
                      : [
                          0,
                          destination.id === 'earth'
                            ? -1.55
                            : destination.id === 'mars'
                              ? -1.2
                              : -0.9,
                          0,
                        ]
                }
                center
                zIndexRange={[20, 0]}
                style={{ pointerEvents: 'auto' }}
              >
                <div className="fleet-map-callout">
                  {destination.id === 'earth' && (
                    <button className="fleet-earth-overview" onClick={onOpenEarthCenters}>
                      Ver centros en Tierra ↗
                    </button>
                  )}
                  <button
                    className="fleet-map-label"
                    aria-label={`Explorar ${destination.name} en el mapa 3D`}
                    aria-pressed={selected === destination.id}
                    onClick={() => onSelect(destination.id)}
                  >
                    <span>{destination.name}</span>
                    <small>
                      {destination.crewCount} tripulantes <span>↗</span>
                    </small>
                  </button>
                  <button
                    className="fleet-callout-close"
                    aria-label={`Cerrar tarjeta de ${destination.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onDismissCard();
                    }}
                  >
                    ×
                  </button>
                </div>
              </Html>
            )}
        </TransitObject>
      ))}
    </>
  );
}
export default function SpaceMapScene(props: {
  destinations: DestinationData[];
  selected: DestinationKey;
  initialFocus?: DestinationKey;
  visibleCard: DestinationKey | null;
  onDismissCard(): void;
  onOpenEarthCenters(): void;
  onSelect(id: DestinationKey): void;
}) {
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [paused, setPaused] = useState(Boolean(props.initialFocus));
  const [inspection, setInspection] = useState<DestinationKey | null>(props.initialFocus ?? null);
  const [view, setView] = useState<{ level: SolarViewLevel; zoom: number }>({
    level: 'mission',
    zoom: 0,
  });
  const [request, setRequest] = useState<ZoomRequest>(
    props.initialFocus
      ? { action: 'focus', destination: props.initialFocus, version: 0 }
      : { action: 'mission', version: 0 },
  );
  const onViewChange = useCallback(
    (level: SolarViewLevel, zoom: number) =>
      setView((previous) =>
        previous.level === level && previous.zoom === zoom ? previous : { level, zoom },
      ),
    [],
  );
  const navigateZoom = (action: ZoomRequest['action'], value?: number) => {
    if (action === 'mission' || action === 'system' || action === 'slider') setInspection(null);
    setRequest((previous) => ({ action, value, version: previous.version + 1 }));
  };
  const inspect = (id: DestinationKey) => {
    setPaused(true);
    setInspection(id);
    setRequest((previous) => ({ action: 'focus', destination: id, version: previous.version + 1 }));
    props.onSelect(id);
  };
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getServerReducedMotion,
  );
  const motionPaused = paused || reducedMotion;
  return (
    <>
      <div className="fleet-detail-presets" role="group" aria-label="Vistas de detalle 3D">
        <span>Explorar de cerca</span>
        {(
          [
            { id: 'earth', label: 'Tierra' },
            { id: 'moon', label: 'Luna' },
            { id: 'mars', label: 'Marte' },
            { id: 'station', label: 'Aurora' },
            { id: 'ship', label: 'Nave' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            aria-pressed={inspection === item.id}
            onClick={() => inspect(item.id)}
            aria-label={`Ver ${item.label} de cerca`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="fleet-scene" aria-label="Mapa espacial 3D interactivo">
        <div className="starfield" aria-hidden="true" />
        <div className="scene-overlay" ref={setOverlay} />
        <MapBoundary key={attempt}>
          {overlay && (
            <Canvas
              onPointerMissed={props.onDismissCard}
              dpr={[1, 1.5]}
              camera={{ position: [0, 2, 12.5], fov: 45, near: 0.05, far: 25000 }}
              fallback={<MapFallback />}
              gl={{ antialias: true, alpha: true }}
              frameloop="demand"
            >
              <SpaceBackdrop brightness={0.22} />
              <ambientLight intensity={0.28} />
              <hemisphereLight args={['#dce5ef', '#080d19', 0.2]} />
              <directionalLight position={[-7, 4, 6]} intensity={2.7} color="#fffaf3" />
              <directionalLight position={[4, -2, -3]} intensity={0.18} color="#91bcd4" />
              <SceneMotion paused={motionPaused}>
                <SolarNavigation
                  request={request}
                  onViewChange={onViewChange}
                  reducedMotion={reducedMotion}
                >
                  <SolarOverview
                    portal={{ current: overlay }}
                    showLabels={view.level !== 'mission'}
                  />
                  <SolarSystemReferences portal={{ current: overlay }} level={view.level} />
                  <MapObjects {...props} portal={{ current: overlay }} level={view.level} />
                </SolarNavigation>
              </SceneMotion>
            </Canvas>
          )}
        </MapBoundary>
        <div className="fleet-view-mode" role="status">
          <strong>
            {inspection
              ? `Detalle · ${props.destinations.find((destination) => destination.id === inspection)?.name}`
              : view.level === 'mission'
                ? 'Vista de misión'
                : view.level === 'inner'
                  ? 'Contexto solar'
                  : 'Sistema solar'}
          </strong>
          <span>
            {inspection ? 'Inspección pausada · arrastra para rotar' : 'Seguimiento Tierra ↔ Marte'}
          </span>
        </div>
        <div className="fleet-transit-controls">
          <span>Movimientos acelerados · órbitas y tamaños ilustrativos</span>
          <button
            className="fleet-reset"
            disabled={reducedMotion}
            onClick={() => setPaused((value) => !value)}
          >
            {reducedMotion
              ? 'Movimiento reducido activo'
              : paused
                ? 'Reanudar simulación'
                : 'Pausar simulación'}
          </button>
        </div>
        <button
          className="fleet-reset"
          onClick={() => {
            navigateZoom('mission');
            setAttempt((value) => value + 1);
          }}
        >
          <Icon name="refresh" size={13} />
          Restablecer vista
        </button>
      </div>
      <div className="fleet-zoom-toolbar" aria-label="Escala de exploración">
        <div>
          <button onClick={() => inspect(props.selected)}>
            Acercar a{' '}
            {props.destinations.find((destination) => destination.id === props.selected)?.name}
          </button>
          <button onClick={() => navigateZoom('system')}>Ver sistema solar</button>
          <button onClick={() => navigateZoom('mission')}>Volver a la misión</button>
          {props.visibleCard && <button onClick={props.onDismissCard}>Cerrar tarjeta</button>}
        </div>
        <label>
          <button aria-label="Acercar mapa" onClick={() => navigateZoom('in')}>
            +
          </button>
          <span className="sr-only">Nivel de zoom</span>
          <input
            aria-label="Nivel de zoom"
            type="range"
            min="0"
            max="100"
            value={view.zoom}
            onChange={(event) => navigateZoom('slider', Number(event.target.value))}
          />
          <button aria-label="Alejar mapa" onClick={() => navigateZoom('out')}>
            −
          </button>
        </label>
        <p>
          {view.level === 'mission'
            ? 'Detalle local ampliado · rueda o pellizco para alejar'
            : 'Distancias orbitales proporcionales en UA · cuerpos ampliados · fases y tiempos simulados'}
        </p>
      </div>
      {view.level !== 'mission' && (
        <div className="fleet-reference-legend" aria-label="Planetas de referencia">
          <span>ÓRBITAS CON CENTRO EN EL SOL · 1 UA = DISTANCIA MEDIA TIERRA–SOL</span>
          <div>
            {referencePlanets.map((planet) => (
              <span key={planet.id}>
                <i style={{ background: planet.color }} />
                {planet.name} <small>{solarOrbits[planet.id].radiusAU} UA</small>
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
