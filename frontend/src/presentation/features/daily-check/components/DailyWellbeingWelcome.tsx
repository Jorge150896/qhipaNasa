import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useEffect, useId, useState } from 'react';
import { Flower2, Pause, Play, Volume2 } from 'lucide-react';
import { TumiTechPortrait, type TumiEmotion } from '@/presentation/shared/tumi/TumiTechPortrait';

const breathSeconds = 4;

function GuidedBreathing() {
  const t = useTranslation();
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
    <section className="daily-breathing" aria-label={t('Respiración guiada')}>
      <h3>
        <Flower2 aria-hidden="true" size={22} />
        {t(' Respiración guiada')}
      </h3>
      <div className="daily-breathing-controls" data-phase={running ? phase : undefined}>
        <button
          type="button"
          aria-label={t(running ? 'Detener respiración guiada' : 'Iniciar respiración guiada')}
          onClick={() => {
            setElapsed(0);
            setStartedAt(running ? undefined : performance.now());
          }}
        >
          {running ? <Pause aria-hidden="true" size={24} /> : <Play aria-hidden="true" size={24} />}
        </button>
        <div>
          <strong aria-live="polite">{t(phase)}</strong>
          <span>{breathSeconds - (elapsed % breathSeconds)} s</span>
        </div>
      </div>
    </section>
  );
}

export function DailyWellbeingWelcome({
  personName,
  result = false,
  audioLabel,
  reply,
  words,
  spokenWords,
  speaking,
  emotion,
  playing,
  audioStatus,
  onToggleAudio,
}: {
  personName: string;
  result?: boolean;
  audioLabel: string;
  reply: string;
  words: string[];
  spokenWords?: number;
  speaking: boolean;
  emotion: TumiEmotion;
  playing: boolean;
  audioStatus: string;
  onToggleAudio(): void;
}) {
  const t = useTranslation();
  const portraitId = useId();
  return (
    <div className="daily-welcome" data-result={result || undefined}>
      <div className="daily-tumi">
        <div className="daily-tumi-art" data-speaking={speaking} data-emotion={emotion}>
          <TumiTechPortrait id={portraitId} emotion={emotion} />
        </div>
        <div className="daily-tumi-bubble">
          <p className="daily-tumi-name">Nami</p>
          <h3>{t(result ? 'Chequeo completo' : `Hola, ${personName.split(' ')[0]}.`)}</h3>
          {spokenWords !== undefined && (
            <p className="daily-tumi-reply daily-tumi-transcript">
              <span className="sr-only">{reply}</span>
              {words.map((word, index) => (
                <span
                  aria-hidden="true"
                  key={index}
                  data-visible={index < spokenWords}
                  data-current={speaking && index + 1 === spokenWords}
                >
                  {word}
                </span>
              ))}
            </p>
          )}
          {result && spokenWords === undefined && !playing && !audioStatus && (
            <p className="daily-tumi-reply">{reply}</p>
          )}
          <button
            type="button"
            className="button secondary daily-tumi-audio"
            onClick={onToggleAudio}
          >
            {playing ? (
              <Pause aria-hidden="true" size={18} />
            ) : (
              <Volume2 aria-hidden="true" size={18} />
            )}
            {t(playing ? 'Detener audio' : audioLabel)}
          </button>
          {audioStatus && (
            <div className="daily-tumi-reply" role="status">
              <p>{t(audioStatus)}</p>
              <details>
                <summary>{t('Leer respuesta')}</summary>
                <p>{reply}</p>
              </details>
            </div>
          )}
        </div>
      </div>
      {!result && <GuidedBreathing />}
    </div>
  );
}
