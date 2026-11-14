import type { MissionActions, MissionData, MissionSection } from './types';
import type { CrewEntryAnchor } from '../../shared/missionRoutes';
import { MissionOverviewScreen } from '../mission-overview/MissionOverviewScreen';
import { CrewScreen } from '../crew/CrewScreen';
import { HabitatScreen } from '../habitat/HabitatScreen';
import { HistoryScreen } from '../history/HistoryScreen';
import { DailyCheckScreen } from '../daily-check/DailyCheckScreen';
import { ObservationsScreen } from '../observations/ObservationsScreen';
import { SimulationScreen } from '../simulation/SimulationScreen';
import { SourcesScreen } from '../sources/SourcesScreen';
export function MissionFeatureScreen({
  section,
  data,
  actions,
  saving,
  habitatId,
  onNavigate,
}: {
  section: MissionSection;
  data: MissionData;
  actions: MissionActions;
  saving: boolean;
  habitatId: string;
  onNavigate(section: MissionSection, anchor?: CrewEntryAnchor): void;
}) {
  switch (section) {
    case 'overview':
      return (
        <MissionOverviewScreen
          data={data}
          actions={actions}
          habitatId={habitatId}
          onNavigate={onNavigate}
        />
      );
    case 'crew':
      return (
        <CrewScreen data={data} actions={actions} habitatId={habitatId} onNavigate={onNavigate} />
      );
    case 'habitat':
      return (
        <HabitatScreen
          data={data}
          actions={actions}
          habitatId={habitatId}
          onNavigate={onNavigate}
        />
      );
    case 'history':
      return (
        <HistoryScreen crew={data.selected} metric={data.metric} onSelect={actions.selectMetric} />
      );
    case 'journal':
      return <DailyCheckScreen data={data} saving={saving} onSave={actions.saveCheck} />;
    case 'observations':
      return (
        <ObservationsScreen
          observations={data.observations}
          pendingCount={data.pendingCount}
          saving={saving}
          onReview={actions.reviewObservation}
        />
      );
    case 'simulation':
      return <SimulationScreen selected={data.scenario} onSelect={actions.selectScenario} />;
    case 'sources':
      return <SourcesScreen habitatId={habitatId} />;
  }
}
