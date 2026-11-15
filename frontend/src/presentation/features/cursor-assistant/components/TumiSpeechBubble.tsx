import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const prompts = [
  '¡Holiii! ¿Te ayudo en algo? :3',
  '¿Tienes alguna duda? Estoy aquí para ayudarte.',
  '¡Pss! ¿Necesitas una manito?',
  '¿Hay algo que te gustaría saber? ✨',
];

export function TumiSpeechBubble({ onOpen }: { onOpen(): void }) {
  const bubble = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string>();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let timer = setTimeout(show, 12_000);
    let previous = -1;

    function schedule() {
      timer = setTimeout(show, 32_000 + Math.random() * 23_000);
    }
    function dismiss() {
      if (bubble.current?.matches(':hover, :focus-within')) {
        timer = setTimeout(dismiss, 1000);
        return;
      }
      setLeaving(true);
      timer = setTimeout(() => {
        setMessage(undefined);
        setLeaving(false);
        schedule();
      }, 180);
    }
    function show() {
      if (
        document.hidden ||
        document.activeElement?.matches('input, textarea, [contenteditable="true"]')
      ) {
        schedule();
        return;
      }
      const options = prompts.filter((_, index) => index !== previous);
      const next = options[Math.floor(Math.random() * options.length)];
      previous = prompts.indexOf(next);
      setMessage(next);
      timer = setTimeout(dismiss, 7000);
    }
    function reset() {
      clearTimeout(timer);
      setMessage(undefined);
      setLeaving(false);
      if (!document.hidden) timer = setTimeout(show, 12_000);
    }
    document.addEventListener('visibilitychange', reset);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', reset);
    };
  }, []);

  return message ? (
    <div ref={bubble} className="cursor-assistant-bubble" data-leaving={leaving || undefined}>
      <span>{message}</span>
      <button type="button" aria-label="Escribir a Tumi" title="Escribir a Tumi" onClick={onOpen}>
        <Pencil size={17} aria-hidden="true" />
      </button>
    </div>
  ) : null;
}
