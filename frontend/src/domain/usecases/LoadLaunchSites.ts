import type { LaunchSitesRepository } from '@/domain/launches/models';

export class LoadLaunchSites {
  constructor(private readonly repository: LaunchSitesRepository) {}

  execute(signal?: AbortSignal) {
    return this.repository.load(signal);
  }
}
