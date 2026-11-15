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
}: {
  selectedId?: string;
  onSelect(id: string): void;
  onCloseVideo(): void;
}) {
  const dependencies = useMemo(() => createLaunchSitesDependencies(), []);
  const model = useLaunchSitesViewModel(dependencies, selectedId);
  if (model.status === 'loading') return <p role="status">Cargando centros en Tierra…</p>;
  if (model.status === 'error')
    return (
      <div role="alert">
        <p>No pudimos cargar los centros en Tierra.</p>
        <button className="button secondary" onClick={model.retry}>
          Reintentar
        </button>
      </div>
    );
  if (!model.sites.length) return <p>No hay centros disponibles.</p>;
  return (
    <LaunchSitesView
      sites={model.sites}
      selected={model.selected}
      invalidSelection={model.invalidSelection}
      onSelect={onSelect}
      onCloseVideo={onCloseVideo}
      globe={<LaunchGlobe sites={model.sites} selected={model.selected} onSelect={onSelect} />}
    />
  );
}
