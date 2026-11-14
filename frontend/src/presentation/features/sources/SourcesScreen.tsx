import { missionRoute } from '../../shared/missionRoutes';
import { SourcesView } from './components/SourcesView';

export function SourcesScreen({ habitatId }: { habitatId: string }) {
  return <SourcesView nasaHistoryHref={`${missionRoute(habitatId, 'history')}#nasa-history`} />;
}
