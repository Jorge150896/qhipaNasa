import styles from './measurement-trace.module.css';
import type { CrewData, MetricData, SensorKey } from '../../mission/types';
import { Panel } from '@/ui/Panel';
import { Icon } from '@/ui/Icon';
import { SensorTabs } from '../../../shared/mission/SensorTabs';
import { TrendChart } from '../../../shared/mission/TrendChart';
import { NasaHistoryPanel } from './NasaHistoryPanel';
import type { NasaHistoryPanelProps } from '../types';
export function HistoryView({
  crew,
  metric,
  onSelect,
  nasaHistory,
}: {
  crew: CrewData;
  metric: MetricData;
  onSelect(id: SensorKey): void;
  nasaHistory: NasaHistoryPanelProps;
}) {
  return (
    <>
      <Panel>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">HISTORIAL SINTÉTICO</span>
            <h3>{metric.label}</h3>
          </div>
          <span className={`badge ${metric.qualityTone === 'attention' ? 'amber' : ''}`}>
            {metric.quality}
          </span>
        </div>
        <SensorTabs metrics={crew.metrics} selectedId={metric.id} onSelect={onSelect} />
        <TrendChart metric={metric} />
        <p className="sub">
          Los segmentos se interrumpen cuando falta una muestra. No se interpolan valores ausentes.
        </p>
        <a className="text-button" href="#nasa-history">
          Ver referencias científicas de NASA
          <Icon name="arrow" size={14} />
        </a>
      </Panel>
      <Panel>
        <div className="panel-heading">
          <Icon name="radio" />
          <h3>Muestras y procedencia</h3>
        </div>
        <div className="table-scroll">
          <table aria-label="Muestras y procedencia del tripulante">
            <thead>
              <tr>
                <th>Hora de medición</th>
                <th>{metric.label}</th>
                <th>Calidad</th>
                <th>Origen</th>
              </tr>
            </thead>
            <tbody>
              {metric.history.map((row) => (
                <tr key={row.at}>
                  <td className="mono">{row.time}</td>
                  <td>{row.value}</td>
                  <td>
                    <span className={`badge ${row.missing ? 'amber' : ''}`}>
                      {row.trace?.quality ?? (row.missing ? 'Ausente' : 'Disponible')}
                    </span>
                  </td>
                  <td>
                    <span>{row.trace?.source ?? 'No documentado'}</span>
                    {row.trace ? (
                      <details className={styles.trace}>
                        <summary>Ver origen</summary>
                        <dl className={styles.fields}>
                          {row.trace.fields.map((field) => (
                            <div key={field.label}>
                              <dt>{field.label}</dt>
                              <dd>{field.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    ) : (
                      'Sin trazabilidad disponible'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <NasaHistoryPanel {...nasaHistory} />
    </>
  );
}
