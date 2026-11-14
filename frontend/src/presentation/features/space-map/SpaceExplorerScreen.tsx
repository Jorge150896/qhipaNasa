'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { createSpaceExplorerDependencies } from '@/di/createSpaceExplorerDependencies.client';
import { TumiLoader } from '../../shared/loading/TumiLoader';
import { missionRoute } from '@/presentation/shared/missionRoutes';
import { MissionShell } from '../mission/components/MissionShell';
import { useSpaceExplorerViewModel } from './useSpaceExplorerViewModel';
import { SpaceExplorerView } from './components/SpaceExplorerView';
import './explorer.css';
import type { DestinationKey } from './types';
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
export function SpaceExplorerScreen({
  destination = 'ship',
  panel = 'network',
  launchSite,
}: {
  destination?: DestinationKey;
  panel?: 'network' | 'launches' | 'earth';
  launchSite?: string;
}) {
  const router = useRouter();
  const [navigationPending, startNavigation] = useTransition();
  const navigateTo = (path: string) => startNavigation(() => router.push(path));
  const [visibleCard, setVisibleCard] = useState<DestinationKey | null>(null);
  const dependencies = useMemo(() => createSpaceExplorerDependencies(), []);
  const model = useSpaceExplorerViewModel(dependencies, destination);
  const select = (id: DestinationKey) => {
    setVisibleCard(id);
    router.replace(`/explore?destination=${id}`, { scroll: false });
  };
  return (
    <MissionShell
      section={panel === 'network' ? 'explorer' : 'earth'}
      missionName="Red de exploración"
      onOpenExplorer={() => navigateTo('/explore')}
      onOpenEarth={() => navigateTo('/explore?destination=earth&tab=earth')}
      onNavigate={(section) => navigateTo(missionRoute('odyssey', section))}
    >
      <ExplorerTabs
        active={panel}
        onSelect={(next) =>
          router.push(
            next !== 'network'
              ? `/explore?destination=earth&tab=${next}`
              : `/explore?destination=${destination}`,
            { scroll: false },
          )
        }
      />
      <div id="explorer-panel" role="tabpanel" aria-labelledby={`explorer-tab-${panel}`}>
        {panel !== 'network' ? (
          <LaunchSitesScreen
            overview={panel === 'earth'}
            selectedId={launchSite}
            onSelect={(id) =>
              router.push(
                `/explore?destination=earth&tab=${panel}&site=${encodeURIComponent(id)}`,
                { scroll: false },
              )
            }
            onCloseVideo={() =>
              router.push(`/explore?destination=earth&tab=${panel}`, { scroll: false })
            }
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
            onOpenLaunchSites={() =>
              router.push('/explore?destination=earth&tab=launches', { scroll: false })
            }
            onOpenEarthOverview={() =>
              router.push('/explore?destination=earth&tab=earth', { scroll: false })
            }
            scene={
              <SpaceMapScene
                destinations={model.data.destinations}
                selected={model.selected.id}
                onSelect={select}
                visibleCard={visibleCard}
                onDismissCard={() => setVisibleCard(null)}
                onOpenEarthOverview={() =>
                  router.push('/explore?destination=earth&tab=earth', { scroll: false })
                }
              />
            }
          />
        )}
      </div>
    </MissionShell>
  );
}
