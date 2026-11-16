'use client';
import { LocalizedText, useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { createLaunchSitesDependencies } from '@/di/createLaunchSitesDependencies.client';
import { useLaunchSitesViewModel } from './useLaunchSitesViewModel';
import { LaunchSitesView } from './components/LaunchSitesView';
import { useTumiViewContext } from '../mission-assistant/useTumiViewContext';
import './launch-sites.css';

const LaunchGlobe = dynamic(() => import('./components/LaunchGlobe'), {
  ssr: false,
  loading: () => (
    <p role="status">
      <LocalizedText>Preparando la Tierra…</LocalizedText>
    </p>
  ),
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
  const t = useTranslation();
  const dependencies = useMemo(() => createLaunchSitesDependencies(), []);
  const model = useLaunchSitesViewModel(dependencies, selectedId);
  const site = model.selected;
  useTumiViewContext('Centros en Tierra', [
    `Lugares disponibles: ${model.sites.map(({ name, category }) => `${name} (${category})`).join(', ')}.`,
    ...(site
      ? [
          `Lugar abierto: ${site.fullName}, ${site.region}. ${site.role}`,
          `Video histórico: ${site.mission}, ${site.date}. Lugar del lanzamiento: ${site.videoLocation}. ${site.videoRelation}`,
        ]
      : []),
  ]);
  if (model.status === 'loading') return <p role="status">{t('Cargando centros en Tierra…')}</p>;
  if (model.status === 'error')
    return (
      <div role="alert">
        <p>{t('No pudimos cargar los centros en Tierra.')}</p>
        <button className="button secondary" onClick={model.retry}>
          {t('Reintentar')}
        </button>
      </div>
    );
  if (!model.sites.length) return <p>{t('No hay centros disponibles.')}</p>;
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
