import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
import type { NasaHistoryPanelProps } from '../types';
import styles from './nasa-history.module.css';

export function NasaHistoryPanel({
  data,
  onSelectIndicator,
  onSelectPhase,
}: NasaHistoryPanelProps) {
  const { indicator, selectedSample } = data;

  return (
    <div id="nasa-history" className={styles.anchor} tabIndex={-1}>
      <Panel className={styles.panel} label="Historial real de Inspiration4">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">{data.study}</span>
            <h3>Panel metabólico de {data.mission}</h3>
          </div>
          <span className="badge">Datos históricos de Inspiration4</span>
        </div>
        <p className="sub">Mediana de {data.sampleCount} tripulantes por fase de muestreo.</p>

        <div className={styles.indicators} role="group" aria-label="Indicadores de Inspiration4">
          {data.indicators.map((item) => (
            <button
              className={styles.indicator}
              key={item.id}
              type="button"
              aria-pressed={item.id === indicator.id}
              onClick={() => onSelectIndicator(item.id)}
            >
              <span className={styles.indicatorIcon}>
                <Icon name={item.icon} size={19} />
              </span>
              <strong>{item.label}</strong>
              <small>{item.unit}</small>
            </button>
          ))}
        </div>

        <div className={styles.explorer}>
          <div className={styles.chart}>
            <div className={styles.chartHeading}>
              <h4>{indicator.label} por fase</h4>
              <small>
                Escala de 0 a {data.ceiling} {indicator.unit}
              </small>
            </div>
            <div className={styles.timeline}>
              {data.groups.map((group) => (
                <div
                  key={group.label}
                  className={styles.phaseGroup}
                  role="group"
                  aria-label={group.label}
                >
                  <h5>{group.label}</h5>
                  <div className={styles.plot}>
                    {group.samples.map((sample) => (
                      <button
                        key={sample.phase}
                        type="button"
                        className={styles.sample}
                        aria-label={`${sample.phase}, ${sample.relativeDay}, ${sample.value} ${indicator.unit}`}
                        aria-pressed={sample.phase === selectedSample?.phase}
                        onClick={() => onSelectPhase(sample.phase)}
                      >
                        <span className={styles.track} aria-hidden="true">
                          <span className={styles.bar} style={{ height: `${sample.height}%` }}>
                            <span className={styles.barValue}>{sample.value}</span>
                          </span>
                        </span>
                        <span className={styles.phase}>{sample.phase}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedSample && (
            <div className={styles.sampleDetail} role="status" aria-label="Detalle de la muestra">
              <div className={styles.detailHeader}>
                <Icon name="clock" size={18} />
                <span>{selectedSample.phase}</span>
              </div>
              <p className={styles.relativeDay}>{selectedSample.relativeDay}</p>
              <strong className={styles.reading}>
                {selectedSample.value} <small>{indicator.unit}</small>
              </strong>
              <p className={styles.detailContext}>
                {indicator.label} · mediana de {data.sampleCount} tripulantes
              </p>
            </div>
          )}
        </div>

        <details className={styles.disclosure}>
          <summary>Ver tabla y fuentes</summary>
          <div className="table-scroll">
            <table
              className={styles.table}
              aria-label="Medianas del panel metabólico de Inspiration4"
            >
              <thead>
                <tr>
                  <th scope="col">Fase</th>
                  {data.indicators.map((item) => (
                    <th key={item.id} scope="col">
                      {item.label} <small>{item.unit}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.phase}>
                    <th scope="row" className="mono">
                      {row.phase}
                    </th>
                    {row.values.map((value, index) => (
                      <td key={data.indicators[index].id}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.links}>
            <a href={data.source} className="text-button" target="_blank" rel="noreferrer">
              Ver estudio NASA OSDR <Icon name="arrow" size={14} />
            </a>
            <a href={data.download} className="text-button" target="_blank" rel="noreferrer">
              CSV original <Icon name="download" size={14} />
            </a>
          </div>
        </details>
      </Panel>
    </div>
  );
}
