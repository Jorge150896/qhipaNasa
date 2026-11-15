import { useEffect, useId, useRef } from 'react';
import { TumiTechPortrait } from '@/presentation/shared/tumi/TumiTechPortrait';
import { Icon } from '@/ui/Icon';
import { TumiReplyOptions } from '@/presentation/shared/tumi/TumiReplyOptions';
import type { TumiReplyFormat } from '@/presentation/shared/tumi/useTumiReplyAudio';
import { TumiModeOptions } from '@/presentation/shared/tumi/TumiModeOptions';
import { TumiHead } from '@/presentation/shared/loading/TumiHead';
import type { useMissionAssistantViewModel } from '../useMissionAssistantViewModel';
import { AssistantRobot } from './AssistantRobot';

export function MissionAssistantView({
  model,
  explorer,
  landing,
  onGuide,
  onOpenSources,
  onOpen,
  onClose,
  following,
  onChangeMode,
  replyFormat,
  onChangeReplyFormat,
  audioPlaying,
  audioStatus,
  onStopAudio,
}: {
  model: ReturnType<typeof useMissionAssistantViewModel>;
  explorer: boolean;
  landing: boolean;
  onGuide(target: string, explanation: string): void;
  onOpenSources(): void;
  onOpen(): void;
  onClose(): void;
  following: boolean;
  onChangeMode(enabled: boolean): void;
  replyFormat: TumiReplyFormat;
  onChangeReplyFormat(format: TumiReplyFormat): void;
  audioPlaying: boolean;
  audioStatus: string;
  onStopAudio(): void;
}) {
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const landingLauncher = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  const portraitId = useId();
  const { open, messages } = model;
  const { context } = model;
  useEffect(() => {
    if (open) {
      const active = document.activeElement;
      opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
      (input.current ?? closeButton.current)?.focus({ preventScroll: true });
    } else if (restoreFocus.current) {
      const target = opener.current?.isConnected
        ? opener.current
        : (landingLauncher.current ??
          document.querySelector<HTMLElement>(
            '.cursor-assistant-character,.cursor-assistant-restore',
          ));
      target?.focus({ preventScroll: true });
      restoreFocus.current = false;
    }
  }, [open]);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, open]);

  function close() {
    restoreFocus.current = true;
    onClose();
  }

  const guideControls = (following || landing) && (
    <div className="assistant-dock">
      {following && (
        <button type="button" className="assistant-exit-guide" onClick={() => onChangeMode(false)}>
          Salir de guía
        </button>
      )}
      {landing && (
        <button
          type="button"
          ref={landingLauncher}
          className="assistant-launcher"
          onClick={onOpen}
          aria-label="Abrir chat de Tumi"
        >
          <AssistantRobot /> <span>Tumi</span>
        </button>
      )}
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
            {model.usesOpenAi ? (
              <span className="assistant-gpt-portrait" data-emotion={model.reaction}>
                <TumiTechPortrait id={portraitId} emotion={model.reaction} />
              </span>
            ) : (
              <AssistantRobot />
            )}
            <div>
              <h2 id="assistant-title">Tumi</h2>
              <small>
                {model.usesOpenAi ? 'GPT · Contexto de la pantalla' : 'Guía local de Qhipa Pacha'}
              </small>
            </div>
            <button
              type="button"
              className="assistant-icon-button"
              ref={closeButton}
              aria-label="Ocultar chat"
              onClick={close}
            >
              <Icon name="close" />
            </button>
          </header>
          <TumiReplyOptions format={replyFormat} onChange={onChangeReplyFormat} />
          <TumiModeOptions
            following={following}
            onChangeMode={(enabled) => {
              if (enabled) restoreFocus.current = true;
              onChangeMode(enabled);
            }}
          />
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
            <div className="assistant-welcome">
              <div className="assistant-welcome-art" aria-hidden="true">
                <TumiHead />
              </div>
              <p className="assistant-bubble">
                {landing
                  ? '¡Hola! Soy Tumi. Puedo responderte por texto o audio.'
                  : explorer
                    ? 'Soy Tumi. Puedo guiarte por el mapa y mostrarte dónde consultar las lecturas de una tripulación.'
                    : 'Soy Tumi. Puedo explicar qué mide una lectura, qué cambió y qué se registró en el entorno a la misma hora.'}
              </p>
            </div>
            {messages.map(({ id, role, reply }) => (
              <div className="assistant-message" key={id} data-role={role}>
                <p className="assistant-bubble">{reply.text}</p>
                {reply.destination === 'sources' && (
                  <button className="text-button" type="button" onClick={onOpenSources}>
                    Ver Fuentes y alcance <Icon name="arrow" size={14} />
                  </button>
                )}
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
            {model.busy && (
              <p className="assistant-bubble" role="status">
                Tumi está pensando…
              </p>
            )}
          </div>
          {audioPlaying && (
            <button type="button" className="text-button" onClick={onStopAudio}>
              Detener voz
            </button>
          )}
          {audioStatus && (
            <p className="assistant-voice-status" role="status">
              {audioStatus}
            </p>
          )}
          {model.remoteStatus && (
            <p className="assistant-voice-status" role="status">
              {model.remoteStatus}
            </p>
          )}
          {!landing && (
            <div className="assistant-suggestions">
              {(explorer
                ? ['¿Cómo uso el mapa espacial?', '¿Dónde están los centros en Tierra?']
                : [
                    ...(context
                      ? ['¿Qué significa este dato?', '¿Qué cambió?']
                      : ['¿Qué significa mi SpO₂?', '¿Dónde hago mi chequeo?']),
                    '¿Cómo se relaciona la lectura con el entorno?',
                  ]
              ).map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={model.busy}
                  onClick={() => model.ask(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
          {!landing && (
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
              <button
                className="button primary"
                type="submit"
                disabled={model.busy || !model.draft.trim()}
              >
                Enviar
              </button>
            </form>
          )}
          {(model.voiceStatus || model.listening) && (
            <p className="assistant-voice-status" role="status">
              {model.voiceStatus || 'Escuchando…'}
            </p>
          )}
        </section>
      ) : (
        guideControls
      )}
    </div>
  );
}
