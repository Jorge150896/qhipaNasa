import { scenarioOptions } from '../../mission/constants';
import type { ScenarioKey } from '../../mission/types';
import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
export function SimulationView({
  selected,
  onSelect,
  onOpenResult,
  hasSignal,
}: {
  selected: ScenarioKey;
  hasSignal: boolean;
  onOpenResult(): void;
  onSelect(id: ScenarioKey): void;
}) {
  return (
    <>
      <div className="scenario-grid">
        {scenarioOptions.map((item, i) => (
          <button
            key={item.id}
            className="scenario-card"
            aria-pressed={selected === item.id}
            onClick={() => onSelect(item.id)}
          >
            <Icon name={i === 0 ? 'orbit' : i === 1 ? 'clock' : 'radio'} size={28} />
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            <span className="scenario-choice">
              {selected === item.id ? (
                <>
                  <Icon name="checked" />
                  Escenario activo
                </>
              ) : (
                <>
                  Activar escenario
                  <Icon name="arrow" />
                </>
              )}
            </span>
          </button>
        ))}
      </div>
      <Panel>
        <div className="panel-heading">
          <Icon name="sliders" />
          <h3>Resultado del escenario</h3>
          <button type="button" className="button secondary" onClick={onOpenResult}>
            {hasSignal ? 'Ver historial de SpO₂' : 'Abrir Tripulación'}
          </button>
        </div>
        <p className="sub">Cambiar de escenario conserva tus registros locales.</p>
      </Panel>
    </>
  );
}
