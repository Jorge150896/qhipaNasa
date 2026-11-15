'use client';
import { tumiConversation } from '@/di/createTumiDependencies.client';
import { useCursorAssistantViewModel } from './useCursorAssistantViewModel';
import { CursorAssistantView } from './components/CursorAssistantView';
import './cursor-assistant.css';
import { speakInBrowser } from '@/infrastructure/speech/browserVoice';
import { useTumiMotion } from './useTumiMotion';

export function CursorAssistantScreen({
  onOpenChat,
  suspended = false,
}: {
  onOpenChat?(): void;
  suspended?: boolean;
}) {
  const model = useCursorAssistantViewModel(tumiConversation, speakInBrowser, suspended);
  useTumiMotion(model.actor, {
    stopped: model.data.paused || suspended,
    open: model.data.open,
    hidden: model.data.hidden,
    dispatch: model.dispatch,
    react: model.react,
  });
  if (suspended) return null;
  return (
    <CursorAssistantView
      data={model.data}
      actor={model.actor}
      onDraft={model.setDraft}
      onSend={model.send}
      onReact={model.react}
      onToggle={model.toggle}
      onHide={model.hide}
      onShow={model.show}
      onGreet={model.greet}
      onStopVoice={model.stopVoice}
      onOpenChat={
        onOpenChat
          ? () => {
              model.close();
              onOpenChat();
            }
          : undefined
      }
    />
  );
}
