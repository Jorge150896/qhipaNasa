import { Icon } from '@/ui/Icon';
import type { SensorKey } from '../../mission/types';
import type { MissionPersonalSummary as Summary } from '../types';

export function MissionPersonalSummary({
  data,
  onOpenModule,
  onOpenRecord,
  onReviewSignal,
}: {
  data: Summary;
  onOpenModule(): void;
  onOpenRecord(): void;
  onReviewSignal(id: SensorKey): void;
}) {
  return (
    <section className="mission-personal-summary" aria-labelledby="mission-personal-title">
      <h1 id="mission-personal-title">Tu resumen de misión</h1>
      <div className="mission-personal-cards">
        <article className="panel mission-personal-card">
          <h3>
            <Icon name="rocket" size={17} /> Tu actividad
          </h3>
          <strong>{data.activity}</strong>
          <p>{data.location} · Instantánea simulada</p>
          <button type="button" className="button secondary" onClick={onOpenModule}>
            Ubicar mi módulo <Icon name="arrow" size={14} />
          </button>
        </article>
        <article className="panel mission-personal-card">
          <h3>
            <Icon name="clipboard" size={17} /> Tus registros
          </h3>
          <strong>{data.record.title}</strong>
          {data.record.detail && <p>{data.record.detail}</p>}
          <button type="button" className="button secondary" onClick={onOpenRecord}>
            {data.record.available ? 'Nuevo autorregistro' : 'Abrir autorregistros'}{' '}
            <Icon name="arrow" size={14} />
          </button>
        </article>
        {data.signals.length > 0 && (
          <article className="panel mission-personal-card mission-personal-attention">
            <h3>
              <Icon name="alert" size={17} /> Datos por revisar
            </h3>
            {data.signals.map((signal) => (
              <div className="mission-personal-signal" key={signal.id}>
                <strong>{signal.label}</strong>
                <p>{signal.quality}</p>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => onReviewSignal(signal.id)}
                >
                  Revisar {signal.label} <Icon name="arrow" size={14} />
                </button>
              </div>
            ))}
          </article>
        )}
      </div>
    </section>
  );
}
