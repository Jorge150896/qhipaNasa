import type { MissionData } from '../../features/mission/types';
import { Icon } from '@/ui/Icon';
import { Panel } from '@/ui/Panel';
export function CopilotPanel({ analysis }: { analysis: MissionData['analysis'] }) {
  return (
    <Panel className="copilot-panel">
      <div className="panel-heading">
        <span className="icon-chip">
          <Icon name="sparkles" />
        </span>
        <div>
          <h3>Copiloto ASTRA</h3>
          <p className="eyebrow">ANÁLISIS DEL ESCENARIO</p>
        </div>
        <span className="tiny-badge">DEMO</span>
      </div>
      <p>{analysis.summary}</p>
      <div className="recommendation">
        <span className="eyebrow">SIGUIENTE REVISIÓN</span>
        <p>{analysis.recommendation}</p>
      </div>
      <details>
        <summary>Consultar evidencia y límites</summary>
        <ul>
          {analysis.evidence.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          Motor de demostración determinista. No hay un modelo de IA conectado ni una evaluación
          clínica validada.
        </p>
      </details>
    </Panel>
  );
}
