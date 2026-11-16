import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { mapDailyCheckAttachment } from '../mapDailyCheckAttachment';

export function CheckAttachments({
  data,
}: {
  data: NonNullable<ReturnType<typeof mapDailyCheckAttachment>>;
}) {
  const t = useTranslation();
  return (
    <div className="daily-check-attachments">
      <p className="sub">
        {t('Datos sintéticos · Instantánea del ')}
        {t(data.timestamp)}
      </p>
      <h5>{t('Lecturas corporales')}</h5>
      <dl className="daily-check-sensors">
        {data.readings.map(({ label, value, detail }) => (
          <div key={label}>
            <dt>{t(label)}</dt>
            <dd>{t(value)}</dd>
            <dd className="sub">{t(detail)}</dd>
          </div>
        ))}
      </dl>
      <h5>{t('Entorno del módulo')}</h5>
      <dl className="daily-check-summary">
        {data.environment.map(({ label, value }) => (
          <div key={label}>
            <dt>{t(label)}</dt>
            <dd>{t(value)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
