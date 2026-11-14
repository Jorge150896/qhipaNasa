import { visionActivities } from '../visionActivities';

export function VisionActivityIllustration({
  id,
}: {
  id: (typeof visionActivities)[number]['id'];
}) {
  return (
    <span className={`crew-vision-illustration crew-vision-${id}`} aria-hidden="true">
      <span>{id === 'near' ? 'Aa' : ''}</span>
    </span>
  );
}

export function VisionObservationGuide() {
  return (
    <ul className="crew-vision-guide" aria-label="Qué puedes observar">
      {visionActivities.map(({ id, label, prompt }) => (
        <li key={id}>
          <VisionActivityIllustration id={id} />
          <strong>{label}</strong>
          <small>{prompt}</small>
        </li>
      ))}
    </ul>
  );
}
