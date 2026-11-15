'use client';

import { useContext, useEffect, useEffectEvent } from 'react';
import { speakInBrowser } from '@/infrastructure/speech/browserVoice';
import { useTumiReplyAudio } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { AssistantActionsContext } from '../mission-assistant/AssistantActionsContext';
import { useTumiViewContext } from '../mission-assistant/useTumiViewContext';
import type { DailyCheckScreenProps } from './types';
import { DailyCheckView } from './components/DailyCheckView';
import { useDailyCheckViewModel } from './useDailyCheckViewModel';
import './daily-check.css';

export function DailyCheckScreen(props: DailyCheckScreenProps) {
  return (
    <div className="daily-wellbeing">
      <DailyCheckSession key={props.data.selected.id} {...props} />
    </div>
  );
}

function DailyCheckSession({ data, saving, onSave }: DailyCheckScreenProps) {
  const audio = useTumiReplyAudio(speakInBrowser);
  const model = useDailyCheckViewModel(data, onSave, audio);
  const askTumi = useContext(AssistantActionsContext)?.askQuestion;
  useTumiViewContext('Monitoreo diario', [
    `Paso actual: ${['Contexto', 'Autoevaluación', 'Confirmación', 'Resultado'][model.step]}.`,
    'Las respuestas y notas del formulario se guardan localmente y no forman parte de este contexto.',
  ]);
  const openEntry = useEffectEvent(() => {
    const id = window.location.hash.slice(1);
    if (id.startsWith('check-system-')) {
      const area = model.healthAreas.find(({ id: areaId }) => id === `check-system-${areaId}`);
      if (area) {
        model.selectHealthArea(area.id);
        const form = document.getElementById('daily-check-form');
        form?.focus({ preventScroll: true });
        form?.scrollIntoView({ block: 'start' });
      }
    } else if (id.startsWith('check-')) {
      document.getElementById(id)?.scrollIntoView({ block: 'center' });
    }
  });
  useEffect(() => {
    openEntry();
  }, []);
  return (
    <DailyCheckView
      data={data}
      saving={saving}
      model={model}
      onAskTumi={
        askTumi
          ? (question) => {
              audio.stop();
              askTumi(question);
            }
          : undefined
      }
    />
  );
}
