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
import { MonitoringScreen } from '../monitoring/MonitoringScreen';
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
    case 'monitoring':
      return <MonitoringScreen habitatId={habitatId} person={data.selected} />;
    case 'overview':
      return (
        <MissionOverviewScreen
          data={data}
          actions={actions}
          habitatId={habitatId}
          onNavigate={onNavigate}
          onStartSignalDemo={() => {
            if (data.crew[0]) actions.selectCrew(data.crew[0].id);
            actions.selectScenario('sensor-gap');
          }}
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
          openCheck={() => onNavigate('journal')}
          selectCrew={actions.selectCrew}
          openCrew={(id) => {
            actions.selectCrew(id);
            onNavigate('crew');
          }}
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
          onOpenRelated={(item) => {
            actions.selectCrew(item.crewId);
            if (item.category === 'Calidad de datos') {
              actions.selectMetric('oxygen');
              onNavigate('history');
            } else {
              onNavigate('journal');
            }
          }}
        />
      );
    case 'simulation':
      return (
        <SimulationScreen
          selected={data.scenario}
          onSelect={actions.selectScenario}
          onOpenResult={() => {
            if (data.scenario === 'sensor-gap') {
              const item = data.observations.find(
                (observation) => observation.category === 'Calidad de datos',
              );
              if (item) actions.selectCrew(item.crewId);
              actions.selectMetric('oxygen');
              onNavigate('history');
            } else {
              onNavigate(data.scenario === 'sleep-change' ? 'observations' : 'overview');
            }
          }}
        />
      );
    case 'sources':
      return <SourcesScreen habitatId={habitatId} />;
  }
}
