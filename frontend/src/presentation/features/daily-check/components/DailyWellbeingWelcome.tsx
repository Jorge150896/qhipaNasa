import { useEffect, useId, useState } from 'react';
import { Flower2, MessageCircle, Pause, Play, Send } from 'lucide-react';
import { TumiTechPortrait } from '@/presentation/shared/tumi/TumiTechPortrait';
import type { DailyCheckViewModel } from '../types';

type Mood = DailyCheckViewModel['values']['mood'];
const breathSeconds = 4;

function GuidedBreathing() {
  const [startedAt, setStartedAt] = useState<number>();
  const [elapsed, setElapsed] = useState(0);
  const running = startedAt !== undefined;
  const inhaling = Math.floor(elapsed / breathSeconds) % 2 === 0;
  const phase = inhaling ? 'Inhala' : 'Exhala';

  useEffect(() => {
    if (startedAt === undefined) return;
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((performance.now() - startedAt) / 1000));
    }, 200);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  return (
    <section className="daily-breathing" aria-label="Respiración guiada">
      <h3>
        <Flower2 aria-hidden="true" size={22} /> Respiración guiada
      </h3>
      <div className="daily-breathing-controls" data-phase={running ? phase : undefined}>
        <button
          type="button"
          aria-label={running ? 'Detener respiración guiada' : 'Iniciar respiración guiada'}
          onClick={() => {
            setElapsed(0);
            setStartedAt(running ? undefined : performance.now());
          }}
        >
          {running ? <Pause aria-hidden="true" size={24} /> : <Play aria-hidden="true" size={24} />}
        </button>
        <div>
          <strong aria-live="polite">{phase}</strong>
          <span>{breathSeconds - (elapsed % breathSeconds)} s</span>
        </div>
      </div>
    </section>
  );
}

export function DailyWellbeingWelcome({
  personName,
  mood,
  reply,
}: {
  personName: string;
  mood: Mood;
  reply: string;
}) {
  const portraitId = useId();
  return (
    <div className="daily-welcome">
      <div className="daily-tumi">
        <div className="daily-tumi-art">
          <TumiTechPortrait id={portraitId} emotion={mood === 'low' ? 'understanding' : 'happy'} />
        </div>
        <div className="daily-tumi-bubble">
          <p className="daily-tumi-name">Tumi</p>
          <h3>Hola, {personName.split(' ')[0]}.</h3>
          <p className="daily-tumi-reply" role="status">
            {reply}
          </p>
        </div>
      </div>
      <GuidedBreathing />
    </div>
  );
}

export function DailyWellbeingMessage({ onAsk }: { onAsk(question: string): void }) {
  const [message, setMessage] = useState('');
  function send() {
    if (!message.trim()) return;
    onAsk(message.trim());
    setMessage('');
  }
  return (
    <div className="daily-tumi-message">
      <MessageCircle aria-hidden="true" size={22} />
      <input
        type="text"
        aria-label="Mensaje para Tumi"
        placeholder="Escribe un mensaje a Tumi…"
        value={message}
        maxLength={500}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
          event.preventDefault();
          send();
        }}
      />
      <button
        type="button"
        onClick={send}
        disabled={!message.trim()}
        aria-label="Enviar mensaje a Tumi"
      >
        <Send aria-hidden="true" size={20} />
      </button>
    </div>
  );
}
