import { useContext, useMemo } from 'react';
import { monthlyWellbeingDependencies } from '@/di/createMonthlyWellbeingDependencies.client';
import type { MonthlyWellbeing } from '@/domain/mission/monthlyWellbeing';
import { AssistantActionsContext } from '../../mission-assistant/AssistantActionsContext';
import { useTumiViewContext } from '../../mission-assistant/useTumiViewContext';
import { MonthlyWellbeingView } from './components/MonthlyWellbeingView';
import { useMonthlyWellbeingViewModel } from './useMonthlyWellbeingViewModel';
import './monthly-wellbeing.css';

export function MonthlyWellbeingScreen({
  habitatId,
  crewId,
}: {
  habitatId: string;
  crewId: string;
}) {
  const report = useMemo(
    () => monthlyWellbeingDependencies.read(habitatId, crewId),
    [habitatId, crewId],
  );
  return report && <MonthlyWellbeingSession key={crewId} report={report} />;
}

function MonthlyWellbeingSession({ report }: { report: MonthlyWellbeing }) {
  const model = useMonthlyWellbeingViewModel(report);
  const assistant = useContext(AssistantActionsContext);
  useTumiViewContext(
    'Tripulación · Seguimiento de 30 días',
    model.context,
    -1,
    model.answerQuestion,
  );
  return (
    <MonthlyWellbeingView
      model={model}
      onAskTumi={
        assistant
          ? () =>
              assistant.askQuestion(
                `¿Cómo se sintió ${model.reportName} el día ${model.dayNumber} de la simulación, qué podría pasar después y qué recomiendas?`,
              )
          : undefined
      }
    />
  );
}
