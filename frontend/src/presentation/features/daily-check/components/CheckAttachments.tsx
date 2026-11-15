import type { mapDailyCheckAttachment } from '../mapDailyCheckAttachment';

export function CheckAttachments({
  data,
}: {
  data: NonNullable<ReturnType<typeof mapDailyCheckAttachment>>;
}) {
  return (
    <div className="daily-check-attachments">
      <p className="sub">Datos sintéticos · Instantánea del {data.timestamp}</p>
      <h5>Lecturas corporales</h5>
      <dl className="daily-check-sensors">
        {data.readings.map(({ label, value, detail }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
            <dd className="sub">{detail}</dd>
          </div>
        ))}
      </dl>
      <h5>Entorno del módulo</h5>
      <dl className="daily-check-summary">
        {data.environment.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
