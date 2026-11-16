import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import styles from './measurement-trace.module.css';
import type { MetricData } from '../../mission/types';
import { Panel } from '@/ui/Panel';
import { Icon } from '@/ui/Icon';

export function MeasurementTracePanel({ metric }: { metric: MetricData }) {
  const t = useTranslation();
  return (
    <Panel>
      <div className="panel-heading">
        <Icon name="radio" />
        <h3>{t('Muestras y procedencia')}</h3>
      </div>
      <div className="table-scroll">
        <table aria-label={t('Muestras y procedencia del tripulante')}>
          <thead>
            <tr>
              <th>{t('Hora de medición')}</th>
              <th>{t(metric.label)}</th>
              <th>{t('Calidad')}</th>
              <th>{t('Origen')}</th>
            </tr>
          </thead>
          <tbody>
            {metric.history.map((row) => (
              <tr key={row.at}>
                <td className="mono">{t(row.time)}</td>
                <td>{t(row.value)}</td>
                <td>
                  <span className={`badge ${row.missing ? 'amber' : ''}`}>
                    {t(row.trace?.quality ?? (row.missing ? 'Ausente' : 'Disponible'))}
                  </span>
                </td>
                <td>
                  <span>{t(row.trace?.source ?? 'No documentado')}</span>
                  {row.trace ? (
                    <details className={styles.trace}>
                      <summary>{t('Ver origen')}</summary>
                      <dl className={styles.fields}>
                        {row.trace.fields.map((field) => (
                          <div key={field.label}>
                            <dt>{t(field.label)}</dt>
                            <dd>{t(field.value)}</dd>
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
