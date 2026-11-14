import { useEffect, useState } from 'react';
import type { LoadLaunchSites } from '@/domain/usecases/LoadLaunchSites';
import type { LaunchSiteData } from './types';

export function useLaunchSitesViewModel(
  dependencies: { loadSites: LoadLaunchSites },
  selectedId?: string,
) {
  const [sites, setSites] = useState<LaunchSiteData[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const formatter = new Intl.DateTimeFormat('es-PE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    void dependencies.loadSites
      .execute(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setSites(
          result.map((site) => ({
            id: site.id,
            name: site.name,
            fullName: site.fullName,
            kind: site.kind,
            category:
              site.kind === 'launch-site'
                ? 'Sitio de lanzamiento'
                : site.kind === 'headquarters'
                  ? 'Sede central de NASA'
                  : 'Centro o laboratorio de NASA',
            symbol: site.kind === 'launch-site' ? '↗' : '◆',
            summary: site.summary,
            role: site.role,
            facilityUrl: site.facilityUrl,
            region: site.region,
            pad: site.pad,
            latitude: site.latitude,
            longitude: site.longitude,
            coordinates: `${Math.abs(site.latitude).toFixed(3)}° ${site.latitude >= 0 ? 'N' : 'S'} · ${Math.abs(site.longitude).toFixed(3)}° ${site.longitude >= 0 ? 'E' : 'O'}`,
            coordinateSource: site.coordinateSource,
            mission: site.mission,
            date: formatter.format(new Date(`${site.launchDate}T00:00:00Z`)),
            description: site.description,
            embedUrl: `https://www.youtube-nocookie.com/embed/${site.videoId}?rel=0`,
            watchUrl: `https://www.youtube.com/watch?v=${site.videoId}`,
            credit: site.videoCredit,
            sourceUrl: site.sourceUrl,
            videoLocation: site.videoLocation,
            videoRelation: site.videoRelation,
            relationSourceUrl: site.relationSourceUrl,
          })),
        );
        setStatus('ready');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('error');
      });
    return () => controller.abort();
  }, [dependencies, revision]);

  const selected = sites.find((site) => site.id === selectedId) ?? null;
  return {
    sites,
    status,
    selected,
    invalidSelection: status === 'ready' && Boolean(selectedId) && !selected,
    retry() {
      setStatus('loading');
      setRevision((value) => value + 1);
    },
  };
}
