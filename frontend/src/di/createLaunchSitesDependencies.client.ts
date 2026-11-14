import { LocalLaunchSitesRepository } from '@/data/launches/LocalLaunchSitesRepository';
import { LoadLaunchSites } from '@/domain/usecases/LoadLaunchSites';

export function createLaunchSitesDependencies() {
  return { loadSites: new LoadLaunchSites(new LocalLaunchSitesRepository()) };
}
