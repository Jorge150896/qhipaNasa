import { useId } from 'react';
import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { Icon } from '@/ui/Icon';

export function FlightEvidence() {
  const t = useTranslation();
  const titleId = useId();

  return (
    <section className="flight-evidence" aria-labelledby={titleId}>
      <div className="flight-evidence__highlight">
        <strong className="flight-evidence__count" aria-hidden="true">
          {t('2 de 7')}
        </strong>
        <div className="flight-evidence__context">
          <h3 id={titleId}>{t('Evidencia de vuelos reales')}</h3>
          <p>
            {t(
              'Durante el programa Shuttle–Mir, dos de los siete astronautas de la NASA que vivieron en la estación espacial Mir reportaron síntomas depresivos subclínicos.',
            )}
          </p>
          <small>{t('Programa Shuttle–Mir · 1995–1998')}</small>
          <a
            href="https://humanresearchroadmap.nasa.gov/evidence/reports/HRP-ER-BMED-HFBP-20250210.pdf#page=28"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="book" size={15} />
            {t('Ver informe de NASA sobre Shuttle–Mir')}
          </a>
        </div>
      </div>
      <details>
        <summary>{t('Ver evidencia de los diarios de la ISS')}</summary>
        <p>
          <strong>{t('545 entradas')}</strong>{' '}
          {t(
            'sobre adaptación a la vida en órbita fueron identificadas en diarios de astronautas de la ISS, con experiencias que iban del desánimo al bienestar.',
          )}
        </p>
        <a
          href="https://ntrs.nasa.gov/api/citations/20150016966/downloads/20150016966.pdf#page=17"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="book" size={15} />
          {t('Ver informe de NASA sobre los diarios')}
        </a>
      </details>
    </section>
  );
}
