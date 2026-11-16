'use client';

import { useEffect, useEffectEvent } from 'react';
import { speechLanguage } from '@/domain/assistant/AppLanguage';
import { useAppLanguage } from '@/presentation/shared/language/AppLanguageProvider';
import { speakInBrowser } from '@/infrastructure/speech/browserVoice';
import { startLocalDictation } from '@/infrastructure/speech/localDictation';
import { useTumiReplyAudio } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { useTumiViewContext } from '../mission-assistant/useTumiViewContext';
import type { DailyCheckScreenProps } from './types';
import { DailyCheckView } from './components/DailyCheckView';
import { useDailyCheckViewModel } from './useDailyCheckViewModel';
import { useDailyCheckGuideViewModel } from './useDailyCheckGuideViewModel';
import './daily-check.css';

export function DailyCheckScreen(props: DailyCheckScreenProps) {
  return (
    <div className="daily-wellbeing">
      <DailyCheckSession key={props.data.selected.id} {...props} />
    </div>
  );
}

function DailyCheckSession({ data, saving, onSave }: DailyCheckScreenProps) {
  const { language } = useAppLanguage();
  const audio = useTumiReplyAudio((text, callbacks) =>
    speakInBrowser(text, callbacks, speechLanguage(language)),
  );
  const model = useDailyCheckViewModel(data, onSave, audio);
  const guide = useDailyCheckGuideViewModel(model, audio, (callbacks, language) =>
    startLocalDictation(callbacks, 'Puedes responder en la pantalla.', language),
  );
  useTumiViewContext('Monitoreo diario', [
    guide.active && guide.mode === 'choose'
      ? 'Pantalla actual: elección entre llenar el chequeo a mano o hacerlo con Nami.'
      : `Paso actual: ${['Contexto', 'Autoevaluación', 'Confirmación', 'Resultado'][model.step]}.`,
    guide.active && guide.mode === 'guided' && guide.prompt
      ? `Pregunta del chequeo guiado: ${guide.prompt}`
      : '',
    'Las respuestas y notas del formulario se guardan localmente y no forman parte de este contexto.',
  ]);
  const openEntry = useEffectEvent(() => {
    const id = window.location.hash.slice(1);
    if (id.startsWith('check-system-')) {
      const area = model.healthAreas.find(({ id: areaId }) => id === `check-system-${areaId}`);
      if (area) {
        guide.selectManual();
        model.selectHealthArea(area.id);
        const form = document.getElementById('daily-check-form');
        requestAnimationFrame(() => {
          const manualForm = document.getElementById('daily-check-form') ?? form;
          manualForm?.focus({ preventScroll: true });
          manualForm?.scrollIntoView({ block: 'start' });
        });
      }
    }
  });
  useEffect(() => {
    openEntry();
  }, []);
  return <DailyCheckView data={data} saving={saving} model={model} guide={guide} />;
}
