'use client';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { destinationIds } from '@/domain/explorer/models';
import { createSpaceExplorerDependencies } from '@/di/createSpaceExplorerDependencies.client';
import { TumiLoader } from '../../shared/loading/TumiLoader';
import { earthCentersRoute, missionRoute } from '@/presentation/shared/missionRoutes';
import { MissionShell } from '../mission/components/MissionShell';
import { useTumiViewContext } from '../mission-assistant/useTumiViewContext';
import { useSpaceExplorerViewModel } from './useSpaceExplorerViewModel';
import { SpaceExplorerView } from './components/SpaceExplorerView';
import './explorer.css';
import type { DestinationKey, ExplorerPanel } from './types';
import { ExplorerTabs } from './components/ExplorerTabs';
import '../launch-sites/launch-sites.css';
const LaunchSitesScreen = dynamic(
  () => import('../launch-sites/LaunchSitesScreen').then((module) => module.LaunchSitesScreen),
  {
    loading: () => <p role="status">Preparando sitios de lanzamiento…</p>,
  },
);
const SpaceMapScene = dynamic(() => import('./components/SpaceMapScene'), {
  ssr: false,
  loading: () => (
    <div className="fleet-scene fleet-loading" role="status">
      Preparando mapa espacial…
    </div>
  ),
});
export function SpaceExplorerScreen() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const panel =
    tab === 'earth' || tab === 'launches' ? 'earth' : tab === 'mars' ? 'mars' : 'network';
  const showsEarth = panel === 'earth';
  const destination = showsEarth
    ? 'earth'
    : panel === 'mars'
      ? 'mars'
      : (destinationIds.find((id) => id === searchParams.get('destination')) ?? 'ship');
  const launchSite = searchParams.get('site') ?? undefined;
  const router = useRouter();
  useEffect(() => {
    if (tab !== 'launches') return;
    const canonical = new URLSearchParams(searchParams.toString());
    canonical.set('destination', 'earth');
    canonical.set('tab', 'earth');
    router.replace(`/explore?${canonical}`, { scroll: false });
  }, [router, searchParams, tab]);
  const [navigationPending, startNavigation] = useTransition();
  const navigateTo = (path: string) => startNavigation(() => router.push(path));
  const [visibleCard, setVisibleCard] = useState<DestinationKey | null>(null);
  const dependencies = useMemo(() => createSpaceExplorerDependencies(), []);
  const model = useSpaceExplorerViewModel(dependencies, destination);
  const selected = model.selected;
  useTumiViewContext(
    showsEarth ? undefined : panel === 'mars' ? 'Mapa de Marte' : 'Mapa espacial',
    selected
      ? [
          `Destino seleccionado: ${selected.name} (${selected.category}). ${selected.subtitle}`,
          `Hábitats que se pueden abrir: ${selected.habitats.map(({ name, location }) => `${name} (${location})`).join(', ') || 'ninguno para este destino'}.`,
          `Destinos visibles: ${model.data?.destinations.map(({ name }) => name).join(', ') ?? ''}.`,
        ]
      : ['Cargando destinos.'],
  );
  const select = (id: DestinationKey) => {
    setVisibleCard(id);
    if (panel === 'mars' && id === 'mars') return;
    router.replace(`/explore?destination=${id}`, { scroll: false });
  };
  const openEarthCenters = () => router.push(earthCentersRoute, { scroll: false });
  function selectPanel(next: ExplorerPanel) {
    if (next === panel) return;
    setVisibleCard(null);
    const path =
      next === 'network'
        ? panel === 'mars'
          ? '/explore'
          : `/explore?destination=${destination}`
        : next === 'mars'
          ? '/explore?destination=mars&tab=mars'
          : earthCentersRoute;
    router.push(path, { scroll: false });
  }
  return (
    <MissionShell
      section={showsEarth ? 'earth' : 'explorer'}
      missionName="Red de exploración"
      onOpenExplorer={() => navigateTo('/explore')}
      onNavigate={(section) => navigateTo(missionRoute('odyssey', section))}
    >
      <ExplorerTabs active={panel} onSelect={selectPanel} />
      <div id="explorer-panel" role="tabpanel" aria-labelledby={`explorer-tab-${panel}`}>
        {showsEarth ? (
          <LaunchSitesScreen
            selectedId={launchSite}
            onSelect={(id) =>
              router.push(`${earthCentersRoute}&site=${encodeURIComponent(id)}`, { scroll: false })
            }
            onCloseVideo={() => router.push(earthCentersRoute, { scroll: false })}
          />
        ) : model.loading || navigationPending ? (
          <TumiLoader
            title="Conectando la tripulación con su mundo…"
            description="Cargando escenarios sintéticos y registros locales."
          />
        ) : model.error || !model.data || !model.selected ? (
          <div className="loading-state" role="alert">
            <h1>No pudimos cargar el mapa</h1>
            <button className="button primary" onClick={model.refresh}>
              Reintentar
            </button>
          </div>
        ) : (
          <SpaceExplorerView
            data={model.data}
            selected={model.selected}
            onSelect={select}
            onOpenCrew={(id) => navigateTo(missionRoute(id, 'crew'))}
            onRefresh={model.refresh}
            onOpenEarthCenters={openEarthCenters}
            scene={
              <SpaceMapScene
                key={panel}
                destinations={model.data.destinations}
                selected={model.selected.id}
                initialFocus={panel === 'mars' ? 'mars' : undefined}
                onSelect={select}
                visibleCard={visibleCard}
                onDismissCard={() => setVisibleCard(null)}
                onOpenEarthCenters={openEarthCenters}
              />
            }
          />
        )}
      </div>
    </MissionShell>
  );
}
