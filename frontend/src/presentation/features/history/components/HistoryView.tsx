import type { CrewData, MetricData, SensorKey } from '../../mission/types';
import { Panel } from '@/ui/Panel';
import { Icon } from '@/ui/Icon';
import { TrendChart } from '../../../shared/mission/TrendChart';
export function HistoryView({
  crew,
  metric,
  onSelect,
}: {
  crew: CrewData;
  metric: MetricData;
  onSelect(id: SensorKey): void;
}) {
  return (
    <>
      <Panel>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">{crew.name} · HISTORIAL SINTÉTICO</span>
            <h3>{metric.label}</h3>
          </div>
          <span className={`badge ${metric.qualityTone === 'attention' ? 'amber' : ''}`}>
            {metric.quality}
          </span>
        </div>
        <div className="sensor-tabs">
          {crew.metrics.map((item) => (
            <button
              key={item.id}
              aria-pressed={item.id === metric.id}
              onClick={() => onSelect(item.id)}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>
        <TrendChart metric={metric} />
        <p className="sub">
          Los segmentos se interrumpen cuando falta una muestra. No se interpolan valores ausentes.
        </p>
      </Panel>
      <Panel>
        <div className="panel-heading">
          <Icon name="radio" />
          <h3>Muestras y procedencia</h3>
        </div>
        <div className="table-scroll">
          <table>
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
                <tr key={row.time}>
                  <td className="mono">{row.time}</td>
                  <td>{row.value}</td>
                  <td>
                    <span className={`badge ${row.missing ? 'amber' : ''}`}>
                      {row.missing ? 'Ausente' : 'Disponible'}
                    </span>
                  </td>
                  <td>Sintético</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Serie de demostración de 14 minutos. Sin conexión con una misión real.
        </p>
      </Panel>
    </>
  );
}
