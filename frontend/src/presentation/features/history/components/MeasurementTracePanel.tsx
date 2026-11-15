import styles from './measurement-trace.module.css';
import type { MetricData } from '../../mission/types';
import { Panel } from '@/ui/Panel';
import { Icon } from '@/ui/Icon';

export function MeasurementTracePanel({ metric }: { metric: MetricData }) {
  return (
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
  );
}
