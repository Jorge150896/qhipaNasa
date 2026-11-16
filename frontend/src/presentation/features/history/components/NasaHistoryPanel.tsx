import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
import type { NasaHistoryPanelProps } from '../types';
import styles from './nasa-history.module.css';

export function NasaHistoryPanel({
  data,
  onSelectIndicator,
  onSelectPhase,
}: NasaHistoryPanelProps) {
  const t = useTranslation();
  const { indicator, selectedSample } = data;

  return (
    <div id="nasa-history" className={styles.anchor} tabIndex={-1}>
      <Panel className={styles.panel} label={t('Historial real de Inspiration4')}>
        <div className="panel-heading">
          <div>
            <span className="eyebrow">{t(data.study)}</span>
            <h3>
              {t('Panel metabólico de ')}
              {t(data.mission)}
            </h3>
          </div>
          <span className="badge">{t('Datos históricos de Inspiration4')}</span>
        </div>
        <p className="sub">
          {t('Mediana de ')}
          {data.sampleCount}
          {t(' tripulantes por fase de muestreo.')}
        </p>

        <div
          className={styles.indicators}
          role="group"
          aria-label={t('Indicadores de Inspiration4')}
        >
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
              <strong>{t(item.label)}</strong>
              <small>{t(item.unit)}</small>
            </button>
          ))}
        </div>

        <div className={styles.explorer}>
          <div className={styles.chart}>
            <div className={styles.chartHeading}>
              <h4>
                {t(indicator.label)}
                {t(' por fase')}
              </h4>
              <small>
                {t('Escala de 0 a')}
                {t(data.ceiling)} {t(indicator.unit)}
              </small>
            </div>
            <div className={styles.timeline}>
              {data.groups.map((group) => (
                <div
                  key={group.label}
                  className={styles.phaseGroup}
                  role="group"
                  aria-label={t(group.label)}
                >
                  <h5>{t(group.label)}</h5>
                  <div className={styles.plot}>
                    {group.samples.map((sample) => (
                      <button
                        key={sample.phase}
                        type="button"
                        className={styles.sample}
                        aria-label={t(
                          `${sample.phase}, ${sample.relativeDay}, ${sample.value} ${indicator.unit}`,
                        )}
                        aria-pressed={sample.phase === selectedSample?.phase}
                        onClick={() => onSelectPhase(sample.phase)}
                      >
                        <span className={styles.track} aria-hidden="true">
                          <span className={styles.bar} style={{ height: `${sample.height}%` }}>
                            <span className={styles.barValue}>{t(sample.value)}</span>
                          </span>
                        </span>
                        <span className={styles.phase}>{t(sample.phase)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedSample && (
            <div
              className={styles.sampleDetail}
              role="status"
              aria-label={t('Detalle de la muestra')}
            >
              <div className={styles.detailHeader}>
                <Icon name="clock" size={18} />
                <span>{t(selectedSample.phase)}</span>
              </div>
              <p className={styles.relativeDay}>{t(selectedSample.relativeDay)}</p>
              <strong className={styles.reading}>
                {t(selectedSample.value)} <small>{t(indicator.unit)}</small>
              </strong>
              <p className={styles.detailContext}>
                {t(indicator.label)}
                {t(' · mediana de ')}
                {data.sampleCount}
                {t(' tripulantes')}
              </p>
            </div>
          )}
        </div>

        <details className={styles.disclosure}>
          <summary>{t('Ver tabla y fuentes')}</summary>
          <div className="table-scroll">
            <table
              className={styles.table}
              aria-label={t('Medianas del panel metabólico de Inspiration4')}
            >
              <thead>
                <tr>
                  <th scope="col">{t('Fase')}</th>
                  {data.indicators.map((item) => (
                    <th key={item.id} scope="col">
                      {t(item.label)} <small>{t(item.unit)}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.phase}>
                    <th scope="row" className="mono">
                      {t(row.phase)}
                    </th>
                    {row.values.map((value, index) => (
                      <td key={data.indicators[index].id}>{t(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.links}>
            <a href={data.source} className="text-button" target="_blank" rel="noreferrer">
              {t('Ver estudio NASA OSDR')}
              <Icon name="arrow" size={14} />
            </a>
            <a href={data.download} className="text-button" target="_blank" rel="noreferrer">
              {t('CSV original')}
              <Icon name="download" size={14} />
            </a>
          </div>
        </details>
      </Panel>
    </div>
  );
}
