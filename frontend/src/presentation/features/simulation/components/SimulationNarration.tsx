import { useEffect, useId, useRef, useState } from 'react';
import { BookOpen, Square, Volume2 } from 'lucide-react';
import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { TumiTechPortrait, type TumiEmotion } from '@/presentation/shared/tumi/TumiTechPortrait';
import type { WellbeingRoute } from '../types';

const routeExpressions: Record<WellbeingRoute, TumiEmotion> = {
  routine: 'happy',
  adjustment: 'thinking',
  support: 'worried',
};

export type SimulationNarrationProps = {
  text: string;
  recommendations: { label: string; text: string }[];
  route: WellbeingRoute;
  playing: boolean;
  spokenWords?: number;
  status: string;
  onPlay(): void;
  onStop(): void;
};

export function SimulationNarration({
  text,
  recommendations,
  route,
  playing,
  spokenWords,
  status,
  onPlay,
  onStop,
}: SimulationNarrationProps) {
  const t = useTranslation();
  const id = useId();
  const section = useRef<HTMLElement>(null);
  const [presentation, setPresentation] = useState<'automatic' | 'reading' | 'compact'>(
    'automatic',
  );
  const sections = [{ label: '', text }, ...recommendations];
  const lines = sections.map(({ label, text }) => (label ? `${label}. ${text}` : text));
  const transcript = lines.join(' ');
  const summaryWords = text.split(/\s+/).length;
  const personalWords = lines[1]?.split(/\s+/).length ?? 0;
  const wordsRead = spokenWords ?? 0;
  const emotion = !playing
    ? 'happy'
    : wordsRead <= summaryWords / 4
      ? 'curious'
      : wordsRead <= summaryWords
        ? routeExpressions[route]
        : wordsRead <= summaryWords + personalWords
          ? 'understanding'
          : 'approved';
  const wordCount = transcript.split(/\s+/).length;
  const compact = presentation === 'compact';
  const finished = !playing && spokenWords === wordCount && presentation === 'automatic';
  let offset = 0;

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const { top } = element.getBoundingClientRect();
    if (top >= 0 && top < window.innerHeight - 144) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    element.scrollIntoView({ block: 'start', behavior: reduced ? 'instant' : 'smooth' });
  }, []);

  function renderWords(value: string) {
    const start = offset;
    const words = value.match(/\S+\s*/g) ?? [];
    offset += words.length;
    return words.map((word, index) => (
      <span key={index} data-visible={!playing || start + index < (spokenWords ?? 0)}>
        {word}
      </span>
    ));
  }

  return (
    <section
      ref={section}
      className="simulation-narration"
      aria-label={t('Resumen de Nami')}
      data-compact={compact}
      data-speaking={playing}
      data-finished={finished}
    >
      <div className="simulation-narration__avatar">
        <TumiTechPortrait id={id} emotion={emotion} decorative />
      </div>
      {compact ? (
        <div className="simulation-narration__actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => setPresentation('reading')}
          >
            <BookOpen size={16} aria-hidden="true" /> {t('Ver resumen')}
          </button>
          <button type="button" className="text-button" onClick={play}>
            <Volume2 size={16} aria-hidden="true" /> {t('Escuchar resumen')}
          </button>
        </div>
      ) : (
        <div
          className="simulation-narration__bubble"
          onAnimationEnd={(event) => {
            if (
              event.target !== event.currentTarget ||
              event.animationName !== 'simulation-bubble-exit'
            )
              return;
            if (event.currentTarget.contains(document.activeElement)) {
              setPresentation('reading');
            } else {
              setPresentation('compact');
            }
          }}
        >
          <div className="simulation-narration__heading">
            <h3>{t('Resumen de Nami')}</h3>
            <button type="button" className="text-button" onClick={playing ? onStop : play}>
              {playing ? (
                <Square size={16} aria-hidden="true" />
              ) : (
                <Volume2 size={16} aria-hidden="true" />
              )}
              {t(playing ? 'Detener audio' : 'Escuchar resumen')}
            </button>
          </div>
          {playing && <span className="sr-only">{transcript}</span>}
          <div className="simulation-narration__transcript" aria-hidden={playing || undefined}>
            {sections.map(({ label, text }) => (
              <p key={label}>
                {label && <strong>{renderWords(`${label} `)}</strong>}
                {renderWords(text)}
              </p>
            ))}
          </div>
          {status && <small role="status">{t(status)}</small>}
        </div>
      )}
    </section>
  );

  function play() {
    setPresentation('automatic');
    onPlay();
  }
}
