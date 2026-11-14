import { scenarioOptions } from '../../mission/constants';
import type { ScenarioKey } from '../../mission/types';
import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
export function SimulationView({
  selected,
  onSelect,
}: {
  selected: ScenarioKey;
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
            <span className="scenario-number">0{i + 1}</span>
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
          <h3>Qué cambia al simular</h3>
        </div>
        <div className="explanation-grid">
          <div>
            <span className="eyebrow">REPRODUCIBLE</span>
            <p>
              Cada escenario genera las mismas lecturas y observaciones. Puedes comparar sus
              resultados sin aleatoriedad.
            </p>
          </div>
          <div>
            <span className="eyebrow">INDEPENDIENTE DEL DIARIO</span>
            <p>
              Los chequeos y las revisiones locales se conservan al cambiar de escenario. No alteran
              la serie sintética.
            </p>
          </div>
          <div>
            <span className="eyebrow">SIN FALSA CONEXIÓN</span>
            <p>
              No hay sensores, WebSockets ni IA activos. La fecha de las muestras permanece visible
              para distinguir el historial del presente.
            </p>
          </div>
        </div>
      </Panel>
    </>
  );
}
