import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@/ui/Icon';
import type { useMissionAssistantViewModel } from '../useMissionAssistantViewModel';
import { AssistantRobot } from './AssistantRobot';

export function MissionAssistantView({
  model,
  launcherHost,
  onGuide,
  onOpen,
  onClose,
  following,
  onChangeMode,
}: {
  launcherHost: HTMLDivElement | null;
  model: ReturnType<typeof useMissionAssistantViewModel>;
  onGuide(target: string, explanation: string): void;
  onOpen(): void;
  onClose(): void;
  following: boolean;
  onChangeMode(enabled: boolean): void;
}) {
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const { open, messages } = model;
  const { context } = model;
  useEffect(() => {
    if (open) input.current?.focus({ preventScroll: true });
    else if (restoreFocus.current) launcher.current?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, open]);

  function close() {
    restoreFocus.current = true;
    onClose();
  }

  const dock = (
    <div className="assistant-dock">
      {following && (
        <button type="button" className="assistant-exit-guide" onClick={() => onChangeMode(false)}>
          Salir de guía
        </button>
      )}
      <button
        type="button"
        ref={launcher}
        className="assistant-launcher"
        onClick={onOpen}
        aria-label="Abrir chat de Tumi"
      >
        <AssistantRobot /> <span>Tumi</span>
      </button>
    </div>
  );

  return (
    <div className="mission-assistant">
      {open ? (
        <section
          id="mission-assistant-chat"
          className="assistant-chat"
          aria-labelledby="assistant-title"
          onKeyDown={(event) => {
            if (event.key === 'Escape') close();
          }}
        >
          <header className="assistant-header">
            <AssistantRobot />
            <div>
              <h2 id="assistant-title">Tumi</h2>
              <small>Guía local de Qhipa Pacha</small>
            </div>
            <button
              type="button"
              className="assistant-icon-button"
              aria-label="Ocultar chat"
              onClick={close}
            >
              <Icon name="close" />
            </button>
          </header>
          <div className="assistant-mode" role="group" aria-label="Modo de Tumi">
            <span>Modo</span>
            <button type="button" aria-pressed={!following} onClick={() => onChangeMode(false)}>
              Fijo
            </button>
            <button
              type="button"
              aria-pressed={following}
              onClick={() => {
                restoreFocus.current = true;
                onChangeMode(true);
              }}
            >
              Guía con el puntero
            </button>
          </div>
          {context && (
            <div className="assistant-context" aria-label="Dato en conversación">
              <div>
                <strong>{context.metric.label}</strong>
                <small>
                  {context.crewName} · {context.date} · {context.time}
                </small>
              </div>
              <button type="button" className="text-button" onClick={model.clearContext}>
                Quitar contexto
              </button>
            </div>
          )}
          <div className="assistant-log" role="log" aria-label="Conversación con Tumi" ref={log}>
            <p className="assistant-bubble">
              Soy Tumi. Puedo explicar qué mide una lectura, qué cambió y qué se registró en el
              entorno a la misma hora.
            </p>
            {messages.map(({ id, role, reply }) => (
              <div className="assistant-message" key={id} data-role={role}>
                <p className="assistant-bubble">{reply.text}</p>
                {reply.target && (
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => onGuide(reply.target ?? '', reply.text)}
                  >
                    Señalar en el panel <Icon name="arrow" size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="assistant-suggestions">
            {[
              ...(context
                ? ['¿Qué significa este dato?', '¿Qué cambió?']
                : ['¿Qué significa mi SpO₂?', '¿Dónde hago mi chequeo?']),
              '¿Cómo se relaciona la lectura con el entorno?',
            ].map((question) => (
              <button key={question} type="button" onClick={() => model.ask(question)}>
                {question}
              </button>
            ))}
          </div>
          <form
            className="assistant-form"
            onSubmit={(event) => {
              event.preventDefault();
              model.ask();
            }}
          >
            <input
              ref={input}
              aria-label="Pregunta para Tumi"
              placeholder="Escribe tu pregunta…"
              value={model.draft}
              maxLength={500}
              onChange={(event) => model.setDraft(event.target.value)}
            />
            <button
              className="button secondary"
              type="button"
              aria-pressed={model.listening}
              onClick={model.toggleDictation}
            >
              {model.listening ? 'Detener' : 'Dictar'}
            </button>
            <button className="button primary" type="submit" disabled={!model.draft.trim()}>
              Enviar
            </button>
          </form>
          {(model.voiceStatus || model.listening) && (
            <p className="assistant-voice-status" role="status">
              {model.voiceStatus || 'Escuchando…'}
            </p>
          )}
        </section>
      ) : launcherHost ? (
        createPortal(dock, launcherHost)
      ) : (
        dock
      )}
    </div>
  );
}
