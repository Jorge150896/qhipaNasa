import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { visionActivities } from '../visionActivities';

export function VisionActivityIllustration({
  id,
}: {
  id: (typeof visionActivities)[number]['id'];
}) {
  const t = useTranslation();
  return (
    <span className={`crew-vision-illustration crew-vision-${id}`} aria-hidden="true">
      <span>{t(id === 'near' ? 'Aa' : '')}</span>
    </span>
  );
}

export function VisionObservationGuide() {
  const t = useTranslation();
  return (
    <ul className="crew-vision-guide" aria-label={t('Qué puedes observar')}>
      {visionActivities.map(({ id, label, prompt }) => (
        <li key={id}>
          <VisionActivityIllustration id={id} />
          <strong>{t(label)}</strong>
          <small>{t(prompt)}</small>
        </li>
      ))}
    </ul>
  );
}
