'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { createLaunchSitesDependencies } from '@/di/createLaunchSitesDependencies.client';
import { useLaunchSitesViewModel } from './useLaunchSitesViewModel';
import { LaunchSitesView } from './components/LaunchSitesView';
import './launch-sites.css';

const LaunchGlobe = dynamic(() => import('./components/LaunchGlobe'), {
  ssr: false,
  loading: () => <p role="status">Preparando la Tierra…</p>,
});

export function LaunchSitesScreen({
  selectedId,
  onSelect,
  onCloseVideo,
  overview = false,
}: {
  selectedId?: string;
  onSelect(id: string): void;
  onCloseVideo(): void;
  overview?: boolean;
}) {
  const dependencies = useMemo(() => createLaunchSitesDependencies(), []);
  const model = useLaunchSitesViewModel(dependencies, selectedId);
  if (model.status === 'loading') return <p role="status">Cargando sitios de lanzamiento…</p>;
  if (model.status === 'error')
    return (
      <div role="alert">
        <p>No pudimos cargar los sitios de lanzamiento.</p>
        <button className="button secondary" onClick={model.retry}>
          Reintentar
        </button>
      </div>
    );
  if (!model.sites.length) return <p>No hay sitios de lanzamiento disponibles.</p>;
  return (
    <LaunchSitesView
      overview={overview}
      sites={model.sites}
      selected={model.selected}
      invalidSelection={model.invalidSelection}
      onSelect={onSelect}
      onCloseVideo={onCloseVideo}
      globe={<LaunchGlobe sites={model.sites} selected={model.selected} onSelect={onSelect} />}
    />
  );
}
