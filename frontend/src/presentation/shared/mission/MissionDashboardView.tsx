import type { ReactNode } from 'react';
import type { MissionActions, MissionData } from '../../features/mission/types';
import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
import { MetricCards } from './MetricCards';
import { CopilotPanel } from './CopilotPanel';
import { EnvironmentPanel } from './EnvironmentPanel';
import { MissionExplorerPanel } from './MissionExplorerPanel';
import { TrendChart } from './TrendChart';
export interface MissionDashboardProps {
  data: MissionData;
  actions: Pick<MissionActions, 'selectMetric' | 'selectZone'>;
  habitatLabel: string;
  scene: ReactNode;
  layout?: 'overview';
  mode: 'crew' | 'ship';
  onModeChange(mode: 'crew' | 'ship'): void;
  onOpenHistory(): void;
  onOpenDailyCheck(): void;
}
export function MissionDashboardView({
  data,
  actions,
  habitatLabel,
  scene,
  layout,
  mode,
  onModeChange,
  onOpenHistory,
  onOpenDailyCheck,
}: MissionDashboardProps) {
  const metrics = (
    <MetricCards
      metrics={data.selected.metrics}
      selectedId={data.metric.id}
      onSelect={actions.selectMetric}
    />
  );
  const explorer = (
    <MissionExplorerPanel
      crewName={data.selected.name}
      zoneName={data.selectedZone.name}
      metric={data.metric}
      habitatLabel={habitatLabel}
      scene={scene}
      mode={mode}
      onModeChange={onModeChange}
    />
  );

  return (
    <>
      {layout === 'overview' ? (
        <div className="mission-overview-explorer">
          {metrics}
          {explorer}
        </div>
      ) : (
        metrics
      )}
      <div className="dashboard-grid">
        <div className="main-column">
          {layout !== 'overview' && explorer}
          <Panel>
            <div className="panel-heading">
              <div>
                <p className="eyebrow">14 MINUTOS DE HISTORIAL</p>
                <h3>{data.metric.label}</h3>
              </div>
              <button className="text-button" onClick={() => onOpenHistory()}>
                Ver historial
                <Icon name="arrow" size={14} />
              </button>
            </div>
            <TrendChart metric={data.metric} />
          </Panel>
        </div>
        <div className="side-column">
          <EnvironmentPanel
            habitatLabel={habitatLabel}
            zone={data.selectedZone}
            zones={data.zones}
            onSelect={actions.selectZone}
          />
          <CopilotPanel analysis={data.analysis} />
          <Panel className="routine-panel">
            <div className="panel-heading">
              <Icon name="clipboard" />
              <h3>Rutina de hoy</h3>
            </div>
            <p>
              {data.todayCheck
                ? 'Ya hay un chequeo local para este tripulante en el día UTC actual.'
                : 'El descanso y el ánimo también forman parte de la misión.'}
            </p>
            <div className="routine-status">
              <span>Sueño del escenario</span>
              <strong>{data.selected.sleep}</strong>
            </div>
            <button className="button secondary full" onClick={() => onOpenDailyCheck()}>
              {data.todayCheck ? 'Consultar chequeo' : 'Completar chequeo'}
              <Icon name="arrow" size={15} />
            </button>
          </Panel>
        </div>
      </div>
    </>
  );
}
