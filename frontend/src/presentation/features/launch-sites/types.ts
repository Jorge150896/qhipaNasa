import type { ReactNode } from 'react';

export interface LaunchSiteData {
  id: string;
  name: string;
  fullName: string;
  kind: 'launch-site' | 'nasa-center' | 'headquarters';
  category: string;
  symbol: string;
  summary: string;
  role: string;
  facilityUrl: string;
  region: string;
  pad: string | null;
  latitude: number;
  longitude: number;
  coordinates: string;
  coordinateSource: string;
  mission: string;
  date: string;
  description: string;
  embedUrl: string;
  watchUrl: string;
  credit: string;
  sourceUrl: string;
  videoLocation: string;
  videoRelation: string;
  relationSourceUrl: string;
}

export interface LaunchSitesViewProps {
  sites: LaunchSiteData[];
  selected: LaunchSiteData | null;
  invalidSelection: boolean;
  globe: ReactNode;
  onSelect(id: string): void;
  onCloseVideo(): void;
}
