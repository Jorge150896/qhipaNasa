import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
const source =
  'https://atmos.nmsu.edu/PDS/data/PDS4/msl_rems_bundle/data_calibrated/SOL_00001_00089/SOL00010/';

export function MarsWeatherReference() {
  const t = useTranslation();
  return (
    <section className="fleet-habitat" aria-label={t('Condiciones exteriores del cráter Gale')}>
      <h3>{t('Condiciones exteriores · Cráter Gale')}</h3>
      <p>{t('Archivo histórico · Curiosity REMS · sol 10, 23:06 hora solar media local')}</p>
      <div className="fleet-status-grid">
        <div>
          <strong>−62,9 °C</strong>
          <span>{t('Temperatura estimada del aire')}</span>
        </div>
        <div>
          <strong>755,08 Pa</strong>
          <span>{t('Presión exterior')}</span>
        </div>
      </div>
      <a href={source}>{t('Consultar la muestra de NASA PDS')}</a>
    </section>
  );
}
