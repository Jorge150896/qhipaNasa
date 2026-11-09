import type { ReactNode } from 'react';
import type { MissionActions, MissionData } from '../../features/mission/types';
import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
import { MetricCards } from './MetricCards';
import { CopilotPanel } from './CopilotPanel';
import { EnvironmentPanel } from './EnvironmentPanel';
import { TrendChart } from './TrendChart';
export interface MissionDashboardProps {
  data: MissionData;
  actions: Pick<MissionActions, 'selectMetric' | 'selectZone'>;
  habitatLabel: string;
  scene: ReactNode;
  mode: 'crew' | 'ship';
  onModeChange(mode: 'crew' | 'ship'): void;
  onOpenHistory(): void;
  onOpenDailyCheck(): void;
  bodyAnchor?: boolean;
}
export function MissionDashboardView({
  data,
  actions,
  habitatLabel,
  scene,
  mode,
  onModeChange,
  onOpenHistory,
  onOpenDailyCheck,
  bodyAnchor,
}: MissionDashboardProps) {
  return (
    <>
      <MetricCards
        metrics={data.selected.metrics}
        selectedId={data.metric.id}
        onSelect={actions.selectMetric}
      />
      <div className="dashboard-grid">
        <div className="main-column">
          <section
            id={bodyAnchor ? 'crew-body' : undefined}
            className="scene-panel"
            aria-label="Explorador tridimensional"
          >
            <div className="scene-panel-header">
              <div>
                <p className="eyebrow">
                  {mode === 'crew' ? 'EXPLORADOR CORPORAL' : 'EXPLORADOR DE HÁBITAT'}
                </p>
                <h3>{mode === 'crew' ? data.selected.name : data.selectedZone.name}</h3>
              </div>
              <div className="segmented">
                <button aria-pressed={mode === 'crew'} onClick={() => onModeChange('crew')}>
                  <Icon name="users" size={14} />
                  Astronauta
                </button>
                <button aria-pressed={mode === 'ship'} onClick={() => onModeChange('ship')}>
                  <Icon name="rocket" size={14} />
                  {habitatLabel}
                </button>
              </div>
            </div>
            {scene}
            <div className="scene-caption">
              <span>
                <Icon name="orbit" size={14} />
                Arrastra para girar · Rueda para acercar
              </span>
              <span>Modelo visual de referencia</span>
            </div>
            <div className="scene-reading">
              <div>
                <span className="eyebrow">{data.metric.label}</span>
                <strong>
                  {data.metric.value}
                  <small>{data.metric.unit}</small>
                </strong>
              </div>
              <div>
                <span className={`badge ${data.metric.qualityTone === 'attention' ? 'amber' : ''}`}>
                  {data.metric.quality}
                </span>
                <p>{data.metric.lastReading}</p>
              </div>
            </div>
          </section>
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
