'use client';
import { tumiConversation, tumiUsesOpenAi } from '@/di/createTumiDependencies.client';
import { useCursorAssistantViewModel } from './useCursorAssistantViewModel';
import { CursorAssistantView } from './components/CursorAssistantView';
import './cursor-assistant.css';
import { speakInBrowser } from '@/infrastructure/speech/browserVoice';
import { useTumiMotion } from './useTumiMotion';
import type { TumiScreenContext } from '@/domain/assistant/TumiConversation';

export function CursorAssistantScreen({
  onOpenChat,
  following,
  onChangeMode,
  suspended = false,
  getContext,
}: {
  onOpenChat?(): void;
  following: boolean;
  onChangeMode(following: boolean): void;
  suspended?: boolean;
  getContext(): TumiScreenContext;
}) {
  const model = useCursorAssistantViewModel(
    tumiConversation,
    speakInBrowser,
    suspended,
    getContext,
  );
  useTumiMotion(model.actor, {
    stopped: model.data.paused || suspended || following,
    open: model.data.open,
    hidden: model.data.hidden,
    dispatch: model.dispatch,
    react: model.react,
  });
  if (suspended) return null;
  return (
    <CursorAssistantView
      data={model.data}
      usesOpenAi={tumiUsesOpenAi}
      actor={model.actor}
      onDraft={model.setDraft}
      onSend={model.send}
      onReact={model.react}
      onToggle={model.toggle}
      onHide={model.hide}
      onShow={model.show}
      onGreet={model.greet}
      onStopVoice={model.stopVoice}
      following={following}
      onChangeMode={(enabled) => {
        model.close();
        onChangeMode(enabled);
      }}
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
