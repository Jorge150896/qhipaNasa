export interface LaunchSite {
  id: string;
  name: string;
  fullName: string;
  kind: 'launch-site' | 'nasa-center' | 'headquarters';
  summary: string;
  role: string;
  facilityUrl: string;
  region: string;
  pad: string | null;
  latitude: number;
  longitude: number;
  coordinateSource: string;
  mission: string;
  launchDate: string;
  description: string;
  videoId: string;
  videoCredit: string;
  sourceUrl: string;
  videoLocation: string;
  videoRelation: string;
  relationSourceUrl: string;
}

export interface LaunchSitesRepository {
  load(signal?: AbortSignal): Promise<readonly LaunchSite[]>;
}
