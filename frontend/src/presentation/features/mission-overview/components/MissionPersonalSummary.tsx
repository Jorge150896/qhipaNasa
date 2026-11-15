import { Icon } from '@/ui/Icon';
import type { ReactNode } from 'react';
import type { SensorKey } from '../../mission/types';
import type { MissionPersonalSummary as Summary } from '../types';

export function MissionPersonalSummary({
  data,
  signalPanel,
  onStartSignalDemo,
  onOpenModule,
  onOpenRecord,
  onReviewSignal,
  onOpenDailyCheck,
  onOpenObservation,
  onStartMonitoring,
}: {
  data: Summary;
  signalPanel?: ReactNode;
  onStartSignalDemo?(): void;
  onOpenModule(): void;
  onOpenRecord(): void;
  onReviewSignal(id: SensorKey): void;
  onOpenDailyCheck(): void;
  onOpenObservation(id: string): void;
  onStartMonitoring(): void;
}) {
  return (
    <section className="mission-personal-summary" aria-labelledby="mission-personal-title">
      <div className="mission-personal-heading">
        <h1 id="mission-personal-title">Mi estado</h1>
        {onStartSignalDemo && (
          <button type="button" className="text-button" onClick={onStartSignalDemo}>
            Probar pérdida de señal
          </button>
        )}
      </div>
      {signalPanel}
      <section className="panel mission-priorities" aria-labelledby="mission-priorities-title">
        <h2 id="mission-priorities-title">
          <Icon name="alert" size={19} /> {signalPanel ? 'Otros pendientes' : 'Pendientes'}
        </h2>
        {data.pending.length ? (
          <ul>
            {data.pending.map((item, index) => (
              <li key={item.key}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
                <button
                  type="button"
                  className={`button ${index === 0 && !signalPanel ? 'primary' : 'secondary'}`}
                  onClick={() => {
                    const action = item.action;
                    if (action.kind === 'observation') onOpenObservation(action.id);
                    else if (action.kind === 'signal') onReviewSignal(action.id);
                    else onOpenDailyCheck();
                  }}
                >
                  {item.actionLabel} <Icon name="arrow" size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Al día con las revisiones y el chequeo de hoy.</p>
        )}
      </section>
      <section className="panel mission-context" aria-labelledby="mission-context-title">
        <h2 id="mission-context-title">Contexto y actividad reciente</h2>
        <dl>
          <div>
            <dt>Ubicación y actividad</dt>
            <dd>
              {data.location} · {data.activity}
            </dd>
            <button type="button" className="text-button" onClick={onOpenModule}>
              Ubicar mi módulo <Icon name="arrow" size={14} />
            </button>
          </div>
          {data.todayCheck && (
            <div>
              <dt>Chequeo diario</dt>
              <dd>Registrado hoy</dd>
              <button type="button" className="text-button" onClick={onOpenDailyCheck}>
                Consultar chequeo <Icon name="arrow" size={14} />
              </button>
            </div>
          )}
          <div>
            <dt>Último autorregistro corporal</dt>
            <dd>
              {data.record.title}
              {data.record.detail && <small>{data.record.detail}</small>}
            </dd>
            <button type="button" className="text-button" onClick={onOpenRecord}>
              {data.record.available ? 'Nuevo autorregistro' : 'Abrir autorregistros'}{' '}
              <Icon name="arrow" size={14} />
            </button>
          </div>
        </dl>
      </section>
      <button type="button" className="button secondary" onClick={onStartMonitoring}>
        Iniciar monitoreo
      </button>
    </section>
  );
}
