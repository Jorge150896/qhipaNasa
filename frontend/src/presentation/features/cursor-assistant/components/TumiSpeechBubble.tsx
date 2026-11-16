import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { Pencil } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const prompts = [
  '¡Holiii! ¿Te ayudo en algo? :3',
  '¿Tienes alguna duda? Estoy aquí para ayudarte.',
  '¡Pss! ¿Necesitas una manito?',
  '¿Hay algo que te gustaría saber? ✨',
];

export function TumiSpeechBubble({
  enabled,
  introduction,
  viewPath,
  onOpen,
}: {
  enabled: boolean;
  introduction?: string;
  viewPath: string;
  onOpen(): void;
}) {
  const t = useTranslation();
  const bubble = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<{ text: string; view: string; intro?: boolean }>();
  const view = JSON.stringify([viewPath, introduction]);
  const lastView = useRef<string | undefined>(undefined);
  const introduced = useRef(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (lastView.current !== view) {
      lastView.current = view;
      introduced.current = false;
    }
    if (!enabled) return;
    const needsIntroduction = () => introduction && !introduced.current;
    let timer = setTimeout(show, needsIntroduction() ? 650 : 12_000);
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
        if (needsIntroduction()) timer = setTimeout(show, 500);
        else schedule();
        return;
      }
      if (introduction && !introduced.current) {
        introduced.current = true;
        setMessage({ text: introduction, view, intro: true });
        timer = setTimeout(dismiss, 7500);
        return;
      }
      const options = prompts.filter((_, index) => index !== previous);
      const next = options[Math.floor(Math.random() * options.length)];
      previous = prompts.indexOf(next);
      setMessage({ text: next, view });
      timer = setTimeout(dismiss, 7000);
    }
    function reset() {
      clearTimeout(timer);
      setMessage(undefined);
      setLeaving(false);
      if (!document.hidden) timer = setTimeout(show, needsIntroduction() ? 650 : 12_000);
    }
    const frame = requestAnimationFrame(() => {
      setMessage(undefined);
      setLeaving(false);
    });
    document.addEventListener('visibilitychange', reset);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', reset);
    };
  }, [enabled, introduction, view]);

  function open() {
    setMessage(undefined);
    setLeaving(false);
    onOpen();
  }

  return enabled && message?.view === view ? (
    <div
      ref={bubble}
      className="cursor-assistant-bubble"
      data-introduction={message.intro}
      data-leaving={leaving || undefined}
    >
      <span role="status">{t(message.text)}</span>
      <button
        type="button"
        aria-label={t('Escribir a Nami')}
        title={t('Escribir a Nami')}
        onClick={open}
      >
        <Pencil size={17} aria-hidden="true" />
      </button>
    </div>
  ) : null;
}
