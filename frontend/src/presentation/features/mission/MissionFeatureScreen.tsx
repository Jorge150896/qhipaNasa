import type { MissionActions, MissionData, MissionSection } from './types';
import type { CrewEntryAnchor } from '../../shared/missionRoutes';
import { CrewScreen } from '../crew/CrewScreen';
import { DailyCheckScreen } from '../daily-check/DailyCheckScreen';
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
    case 'crew':
      return (
        <CrewScreen data={data} actions={actions} habitatId={habitatId} onNavigate={onNavigate} />
      );
    case 'journal':
      return <DailyCheckScreen data={data} saving={saving} onSave={actions.saveCheck} />;
    case 'simulation': {
      const signal =
        data.scenario === 'sensor-gap'
          ? data.crew
              .flatMap((person) => person.metrics.map((metric) => ({ person, metric })))
              .find(({ metric }) => metric.id === 'oxygen' && metric.qualityTone === 'attention')
          : undefined;
      function openSignalEvidence(personId: string) {
        actions.selectCrew(personId);
        actions.selectMetric('oxygen');
        onNavigate('crew', 'crew-history');
      }
      return (
        <SimulationScreen
          selected={data.scenario}
          onSelect={actions.selectScenario}
          signal={signal && { personId: signal.person.id, metric: signal.metric }}
          onOpenSignalEvidence={openSignalEvidence}
          onOpenResult={() => (signal ? openSignalEvidence(signal.person.id) : onNavigate('crew'))}
        />
      );
    }
    case 'sources':
      return <SourcesScreen habitatId={habitatId} />;
  }
}
