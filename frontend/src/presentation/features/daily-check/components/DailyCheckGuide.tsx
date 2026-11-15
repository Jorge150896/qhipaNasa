import { useEffect, useId, useRef } from 'react';
import { TumiTechPortrait } from '@/presentation/shared/tumi/TumiTechPortrait';
import { Frown, Meh, Smile, Volume2, VolumeX } from 'lucide-react';
import type { DailyCheckGuideViewModel } from '../types';

const moodIcons = { good: Smile, neutral: Meh, low: Frown };

export function DailyCheckGuide({ guide }: { guide: DailyCheckGuideViewModel }) {
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const chooser = guide.mode === 'choose';
  const question = guide.question;
  const questionId = question?.id;

  useEffect(() => {
    if (questionId) heading.current?.focus({ preventScroll: true });
  }, [questionId]);

  return (
    <section className="daily-guide" id="daily-check-form" aria-labelledby={id}>
      <div className="daily-guide-dialogue">
        <div
          className="daily-guide-portrait"
          data-speaking={guide.speaking}
          data-emotion={guide.reaction?.emotion}
        >
          <TumiTechPortrait
            id={id}
            emotion={guide.reaction?.emotion ?? (chooser ? 'greeting' : 'curious')}
          />
        </div>
        <div className="daily-guide-bubble" key={guide.prompt}>
          {guide.reaction && (
            <p className="daily-guide-reaction" role="status">
              {guide.reaction.text}
            </p>
          )}
          <h3 ref={heading} id={id} tabIndex={-1}>
            {guide.prompt}
          </h3>
        </div>
      </div>
      {chooser ? (
        <>
          <div className="daily-guide-choices">
            <button type="button" className="button secondary" onClick={guide.selectManual}>
              Llenar a mano
            </button>
            <button type="button" className="button primary" onClick={guide.start}>
              Hacerlo con Tumi
            </button>
          </div>
          <button type="button" className="text-button" onClick={guide.listen}>
            {guide.speaking ? 'Detener audio' : 'Escuchar pregunta'}
          </button>
        </>
      ) : (
        question && (
          <>
            {question.kind === 'choices' ? (
              <div className="daily-guide-choices" role="group" aria-labelledby={id}>
                {question.options.map((option) => {
                  const MoodIcon = option.mood && moodIcons[option.mood];
                  return (
                    <button
                      type="button"
                      className="button secondary"
                      key={option.label}
                      data-selected={option.selected || undefined}
                      onClick={() => guide.choose(option)}
                    >
                      {MoodIcon && <MoodIcon size={22} aria-hidden="true" />}
                      {option.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <form
                className="daily-guide-entry"
                onSubmit={(event) => {
                  event.preventDefault();
                  guide.advance();
                }}
              >
                <label>
                  {question.label}
                  {question.kind === 'note' ? (
                    <textarea
                      rows={3}
                      maxLength={400}
                      value={question.value}
                      onChange={(event) => question.change(event.target.value)}
                    />
                  ) : (
                    <input
                      type="number"
                      min={0}
                      max={question.max}
                      step={question.step}
                      required={question.required}
                      value={question.value}
                      onChange={(event) => question.change(event.target.value)}
                    />
                  )}
                </label>
                <button className="button primary" type="submit">
                  {guide.last ? 'Revisar chequeo' : 'Continuar'}
                </button>
              </form>
            )}
            <div className="daily-guide-actions">
              <button
                type="button"
                className="text-button"
                onClick={guide.index ? guide.back : guide.chooseMode}
              >
                {guide.index ? 'Pregunta anterior' : 'Cambiar modo de registro'}
              </button>
              {guide.index > 0 && (
                <button type="button" className="text-button" onClick={guide.selectManual}>
                  Seguir a mano
                </button>
              )}
              <button
                type="button"
                className="text-button"
                aria-pressed={guide.voice}
                onClick={guide.toggleVoice}
              >
                {guide.voice ? (
                  <Volume2 size={16} aria-hidden="true" />
                ) : (
                  <VolumeX size={16} aria-hidden="true" />
                )}
                Voz de Tumi
              </button>
            </div>
          </>
        )
      )}
    </section>
  );
}
