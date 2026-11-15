import { TumiModeOptions } from '@/presentation/shared/tumi/TumiModeOptions';
import { TumiReplyOptions } from '@/presentation/shared/tumi/TumiReplyOptions';
import type { TumiReplyFormat } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { TumiTechPortrait } from '@/presentation/shared/tumi/TumiTechPortrait';
import { Ellipsis, EyeOff, Send, Volume2, VolumeX, X } from 'lucide-react';
import { Fragment, useEffect, useId, useRef, useState, type RefObject } from 'react';
import type { CursorAssistantData, TumiEmotion } from '../types';
import { TumiSpeechBubble } from './TumiSpeechBubble';

export function CursorAssistantView({
  data,
  viewIntroduction,
  viewPath,
  usesOpenAi,
  actor,
  onDraft,
  onSend,
  onReact,
  onToggle,
  onHide,
  onShow,
  onOpenChat,
  following,
  onChangeMode,
  replyFormat,
  onChangeReplyFormat,
  audioStatus,
  transcriptText,
  spokenWords,
  onGreet,
  onStopVoice,
}: {
  data: CursorAssistantData;
  viewIntroduction?: string;
  viewPath: string;
  usesOpenAi: boolean;
  actor: RefObject<HTMLDivElement | null>;
  onDraft(value: string): void;
  onSend(): void;
  onReact(emotion: TumiEmotion): void;
  onToggle(): void;
  onHide(): void;
  onShow(): void;
  onOpenChat?(): void;
  following: boolean;
  onChangeMode(following: boolean): void;
  replyFormat: TumiReplyFormat;
  onChangeReplyFormat(format: TumiReplyFormat): void;
  audioStatus: string;
  transcriptText?: string;
  spokenWords?: number;
  onGreet(): void;
  onStopVoice(): void;
}) {
  const id = useId();
  const panel = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const message = data.messages.findLast(({ role }) => role === 'assistant');
  const hasReply = Boolean(message && message !== data.messages[0]);
  const words = message?.text.match(/\S+|\s+/g) ?? [];
  const matchingSpeech = message !== undefined && transcriptText === message.text;
  const [revealedMessage, setRevealedMessage] = useState<number>();
  const revealing = data.open && !data.busy && message?.id !== revealedMessage && !matchingSpeech;
  const step = Math.min(125, 7200 / Math.max(words.length, 1));
  useEffect(() => {
    if (!data.open) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onToggle();
      }
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [data.open, onToggle]);
  useEffect(() => {
    if (data.open) (input.current ?? panel.current)?.focus({ preventScroll: true });
    else if (wasOpen.current && !data.hidden) actor.current?.querySelector('button')?.focus();
    wasOpen.current = data.open;
  }, [data.open, data.hidden, actor]);
  if (data.hidden)
    return (
      <button className="cursor-assistant-restore" onClick={onShow}>
        Mostrar Tumi
      </button>
    );
  return (
    <>
      <div
        ref={actor}
        className="cursor-assistant"
        data-paused={data.paused || data.open}
        data-speaking={data.speaking || revealing}
        data-state={data.state}
        data-emotion={data.emotion}
      >
        <button
          className="cursor-assistant-character"
          aria-label="Abrir asistente Tumi"
          aria-expanded={data.open}
          aria-controls={id}
          onClick={onToggle}
          onPointerEnter={() => {
            if (!data.open) onReact('wink');
          }}
          onPointerLeave={() => {
            if (!data.open) onReact('neutral');
          }}
        >
          <TumiTechPortrait id={id} emotion={data.emotion} />
        </button>
        <TumiSpeechBubble
          enabled={!data.open && !following && !data.paused && !data.speaking}
          introduction={viewIntroduction}
          viewPath={viewPath}
          onOpen={onToggle}
        />
      </div>
      <button className="cursor-assistant-restore tumi-safe-launcher" onClick={onToggle}>
        Abrir Tumi
      </button>
      {data.open && (
        <section id={id} ref={panel} className="cursor-assistant-panel" aria-label="Asistente Tumi">
          <div className="tumi-dialogue">
            <div className="tumi-chat-messages" role="log" aria-label="Conversación con Tumi">
              {data.busy ? (
                <p className="tumi-thinking">¡Un momentito, estoy pensando! ✨</p>
              ) : (
                message && (
                  <p key={message.id} data-role="assistant">
                    <span className="sr-only">{message.text}</span>
                    <span
                      aria-hidden="true"
                      data-reveal={matchingSpeech ? 'audio' : revealing ? 'text' : 'done'}
                    >
                      {words.map((word, index) =>
                        index % 2 ? (
                          <Fragment key={index}>{word}</Fragment>
                        ) : (
                          <span
                            className="tumi-chat-word"
                            key={index}
                            data-visible={
                              matchingSpeech ? index / 2 < (spokenWords ?? 0) : undefined
                            }
                            style={{ animationDelay: `${(index / 2) * step}ms` }}
                            onAnimationEnd={
                              index === words.length - 1
                                ? () => setRevealedMessage(message.id)
                                : undefined
                            }
                          >
                            {word}
                          </span>
                        ),
                      )}
                    </span>
                  </p>
                )
              )}
            </div>
            <form
              className="tumi-chat-compose"
              onSubmit={(event) => {
                event.preventDefault();
                onSend();
                input.current?.focus({ preventScroll: true });
              }}
            >
              <label className="sr-only" htmlFor={id + '-message'}>
                Mensaje para Tumi
              </label>
              <input
                ref={input}
                id={id + '-message'}
                value={data.draft}
                onChange={(event) => onDraft(event.target.value)}
                maxLength={600}
                autoComplete="off"
                placeholder="Pregúntame algo…"
              />
              <button
                type="submit"
                className="tumi-icon-button tumi-send"
                aria-label="Enviar"
                title="Enviar"
                disabled={data.busy || !data.draft.trim()}
              >
                <Send size={17} aria-hidden="true" />
              </button>
            </form>
            {data.error && <p role="alert">{data.error}</p>}
          </div>
          <div className="tumi-chat-footer">
            <details className="tumi-chat-options">
              <summary className="tumi-icon-button" title="Opciones">
                <Ellipsis size={20} aria-hidden="true" />
                <span className="sr-only">Opciones</span>
              </summary>
              <div className="tumi-chat-settings">
                <TumiReplyOptions format={replyFormat} onChange={onChangeReplyFormat} />
                <TumiModeOptions following={following} onChangeMode={onChangeMode} />
                <p className="tumi-chat-disclaimer">
                  {usesOpenAi
                    ? 'OpenAI recibe tu mensaje y el contexto de demostración de esta pantalla.'
                    : 'Sin IA conectada · Respuestas locales sobre la web'}
                </p>
                <div className="tumi-chat-controls">
                  {onOpenChat && (
                    <button type="button" onClick={onOpenChat}>
                      Abrir chat contextual
                    </button>
                  )}
                  <button
                    type="button"
                    className="tumi-icon-button"
                    onClick={onHide}
                    aria-label="Ocultar Tumi"
                    title="Ocultar Tumi"
                  >
                    <EyeOff size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </details>
            <button
              type="button"
              className="tumi-icon-button tumi-chat-audio"
              onClick={data.speaking ? onStopVoice : onGreet}
              aria-label={
                data.speaking ? 'Detener voz' : hasReply ? 'Escuchar respuesta' : 'Escuchar saludo'
              }
              title={
                data.speaking ? 'Detener voz' : hasReply ? 'Escuchar respuesta' : 'Escuchar saludo'
              }
            >
              {data.speaking ? (
                <VolumeX size={18} aria-hidden="true" />
              ) : (
                <Volume2 size={18} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              className="tumi-icon-button tumi-close"
              aria-label="Cerrar conversación"
              title="Cerrar conversación"
              onClick={onToggle}
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          {audioStatus && <p role="status">{audioStatus}</p>}
        </section>
      )}
    </>
  );
}
