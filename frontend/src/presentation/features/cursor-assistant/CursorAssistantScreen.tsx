'use client';
import {
  localTumiConversation,
  tumiConversation,
  tumiUsesOpenAi,
} from '@/di/createTumiDependencies.client';
import { useCursorAssistantViewModel } from './useCursorAssistantViewModel';
import { CursorAssistantView } from './components/CursorAssistantView';
import './cursor-assistant.css';
import type { TumiReplyAudio } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { useTumiMotion } from './useTumiMotion';
import type { TumiScreenContext } from '@/domain/assistant/TumiConversation';

export function CursorAssistantScreen({
  onOpenChat,
  following,
  onChangeMode,
  suspended = false,
  getContext,
  viewIntroduction,
  viewPath,
  getLocalReply,
  audio,
}: {
  onOpenChat?(): void;
  following: boolean;
  onChangeMode(following: boolean): void;
  suspended?: boolean;
  getContext(): TumiScreenContext;
  viewIntroduction?: string;
  viewPath: string;
  getLocalReply?(question: string): string | undefined;
  audio: TumiReplyAudio;
}) {
  const model = useCursorAssistantViewModel(
    tumiConversation,
    audio,
    suspended,
    getContext,
    getLocalReply,
    tumiUsesOpenAi ? localTumiConversation : undefined,
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
      viewIntroduction={viewIntroduction}
      viewPath={viewPath}
      usesOpenAi={tumiUsesOpenAi}
      actor={model.actor}
      onDraft={model.setDraft}
      onSend={model.send}
      onReact={model.react}
      onToggle={model.toggle}
      onHide={model.hide}
      onShow={model.show}
      replyFormat={audio.selectedFormat}
      onChangeReplyFormat={audio.select}
      audioStatus={audio.status}
      transcriptText={audio.transcriptText}
      spokenWords={audio.spokenWords}
      onGreet={() => {
        const line = model.data.messages.findLast(({ role }) => role === 'assistant');
        if (line) audio.replayReply(line.text, { transcript: true });
      }}
      onStopVoice={audio.stop}
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
