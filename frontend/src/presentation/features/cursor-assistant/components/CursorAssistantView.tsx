import { AppearanceOptions } from '@/ui/AppearanceOptions';
import { TumiTechPortrait } from './TumiTechPortrait';
import { EyeOff, X } from 'lucide-react';
import { useEffect, useId, useRef, type RefObject } from 'react';
import type { CursorAssistantData, TumiEmotion } from '../types';

export function CursorAssistantView({
  data,
  actor,
  onDraft,
  onSend,
  onReact,
  onToggle,
  onHide,
  onShow,
  onOpenChat,
  onGreet,
  onStopVoice,
}: {
  data: CursorAssistantData;
  actor: RefObject<HTMLDivElement | null>;
  onDraft(value: string): void;
  onSend(): void;
  onReact(emotion: TumiEmotion): void;
  onToggle(): void;
  onHide(): void;
  onShow(): void;
  onOpenChat?(): void;
  onGreet(): void;
  onStopVoice(): void;
}) {
  const id = useId();
  const panel = useRef<HTMLElement>(null);
  const wasOpen = useRef(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
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
    messagesEnd.current?.scrollIntoView({ block: 'nearest' });
  }, [data.messages, data.busy]);
  useEffect(() => {
    if (data.open) panel.current?.querySelector('button')?.focus();
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
        data-speaking={data.speaking}
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
      </div>
      <button className="cursor-assistant-restore tumi-safe-launcher" onClick={onToggle}>
        Abrir Tumi
      </button>
      {data.open && (
        <section id={id} ref={panel} className="cursor-assistant-panel" aria-label="Asistente Tumi">
          <div className="tumi-chat-heading">
            <strong>Tumi</strong>
            <span>Guía local</span>
            <button
              className="tumi-icon-button"
              aria-label="Cerrar conversación"
              title="Cerrar conversación"
              onClick={onToggle}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <AppearanceOptions />
          <p className="tumi-chat-disclaimer">Sin IA conectada · Respuestas locales sobre la web</p>
          <div
            className="tumi-chat-messages"
            role="log"
            aria-label="Conversación con Tumi"
            aria-live="polite"
            aria-relevant="additions"
          >
            {data.messages.map((message) => (
              <p key={message.id} data-role={message.role}>
                <span>{message.role === 'user' ? 'Tú' : 'Tumi'}</span>
                {message.text}
              </p>
            ))}
            {data.busy && <p role="status">Tumi está pensando…</p>}
            <div ref={messagesEnd} />
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSend();
            }}
          >
            <label htmlFor={id + '-message'}>Mensaje para Tumi</label>
            <div className="tumi-chat-compose">
              <input
                id={id + '-message'}
                value={data.draft}
                onChange={(event) => onDraft(event.target.value)}
                maxLength={600}
                autoComplete="off"
                placeholder="¿Qué quieres explorar?"
              />
              <button type="submit" disabled={data.busy || !data.draft.trim()}>
                Enviar
              </button>
            </div>
          </form>
          {data.error && <p role="alert">{data.error}</p>}
          <div className="tumi-chat-controls">
            <button onClick={data.speaking ? onStopVoice : onGreet}>
              {data.speaking ? 'Detener voz' : 'Escuchar saludo'}
            </button>
            {data.voiceStatus && <p role="status">{data.voiceStatus}</p>}
            {onOpenChat && <button onClick={onOpenChat}>Abrir chat contextual</button>}
            <button
              className="tumi-icon-button"
              onClick={onHide}
              aria-label="Ocultar Tumi"
              title="Ocultar Tumi"
            >
              <EyeOff size={20} aria-hidden="true" />
            </button>
          </div>
        </section>
      )}
    </>
  );
}
