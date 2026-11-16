import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { useEffect, useId, useRef } from 'react';
import { TumiTechPortrait } from '@/presentation/shared/tumi/TumiTechPortrait';
import { Frown, Meh, Mic, Smile, Square, Volume2, VolumeX } from 'lucide-react';
import type { DailyCheckGuideViewModel } from '../types';

const moodIcons = { good: Smile, neutral: Meh, low: Frown };

export function DailyCheckGuide({ guide }: { guide: DailyCheckGuideViewModel }) {
  const t = useTranslation();
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const chooser = guide.mode === 'choose';
  const question = guide.question;
  const questionId = question?.id;
  const { dictation } = guide;

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
              {t(guide.reaction.text)}
            </p>
          )}
          <h3 ref={heading} id={id} tabIndex={-1}>
            {t(guide.prompt)}
          </h3>
        </div>
      </div>
      {chooser ? (
        <>
          <div className="daily-guide-choices">
            <button type="button" className="button secondary" onClick={guide.selectManual}>
              {t('Llenar a mano')}
            </button>
            <button type="button" className="button primary" onClick={guide.start}>
              {t('Hacerlo con Nami')}
            </button>
          </div>
          <button type="button" className="text-button" onClick={guide.listen}>
            {t(guide.speaking ? 'Detener audio' : 'Escuchar pregunta')}
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
                      data-selected={
                        (dictation.listening && dictation.answer && !dictation.preview
                          ? dictation.answer === option.label
                          : option.selected) || undefined
                      }
                      onClick={() => guide.choose(option)}
                    >
                      {MoodIcon && <MoodIcon size={22} aria-hidden="true" />}
                      {t(option.label)}
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
                  {t(question.label)}
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
                  {t(guide.last ? 'Revisar chequeo' : 'Continuar')}
                </button>
              </form>
            )}
            <div className="daily-guide-dictation">
              <div className="daily-guide-mic-controls">
                <select
                  aria-label={t('Idioma del micrófono')}
                  value={dictation.language}
                  onChange={(event) =>
                    dictation.changeLanguage(event.target.value === 'en-US' ? 'en-US' : 'es-ES')
                  }
                >
                  <option value="es-ES">Español</option>
                  <option value="en-US">English</option>
                </select>
                <button
                  type="button"
                  className="button secondary"
                  disabled={dictation.finishing || guide.speaking}
                  onClick={dictation.listening ? dictation.finish : dictation.resume}
                >
                  {dictation.listening ? (
                    <Square size={17} aria-hidden="true" />
                  ) : (
                    <Mic size={17} aria-hidden="true" />
                  )}
                  {t(
                    guide.speaking
                      ? 'Nami está hablando'
                      : dictation.finishing
                        ? 'Procesando…'
                        : dictation.listening
                          ? 'Terminar de hablar'
                          : dictation.microphoneEnabled
                            ? 'Reintentar micrófono'
                            : 'Reanudar micrófono',
                  )}
                </button>
                {dictation.microphoneEnabled && (
                  <button type="button" className="text-button" onClick={dictation.pause}>
                    {t('Pausar micrófono')}
                  </button>
                )}
                {dictation.capturing && (
                  <span className="daily-guide-mic-wave" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </div>
              {(dictation.status || dictation.transcript || dictation.preview) && (
                <div className="daily-guide-voice-result" role="status">
                  {dictation.status && <p>{t(dictation.status)}</p>}
                  {dictation.preview && (
                    <p>
                      {t(dictation.listening ? 'Te oigo decir' : 'Alcancé a oír')} «
                      {dictation.preview}»
                    </p>
                  )}
                  {!dictation.preview &&
                    dictation.transcript &&
                    (dictation.answer ? (
                      <p>
                        {t(dictation.needsReview ? 'Opción para revisar: ' : 'Entendí: ')}
                        <strong>{t(dictation.answer)}</strong>
                      </p>
                    ) : (
                      !dictation.canEnterResponse && (
                        <p>
                          {t('Oí «')}
                          {dictation.transcript}».{t(' ')}
                          {t(
                            question.kind === 'number'
                              ? 'Puedes repetir la cantidad o ingresarla en la pantalla.'
                              : 'Puedes decir una de las opciones o responder en la pantalla.',
                          )}
                        </p>
                      )
                    ))}
                </div>
              )}
              {dictation.canEnterResponse && (
                <label className="daily-guide-entry daily-guide-typed-response">
                  {t('Escribe o usa el dictado del teclado')}
                  <input
                    type="text"
                    maxLength={400}
                    value={dictation.transcript}
                    onChange={(event) => dictation.enterResponse(event.target.value)}
                  />
                  {dictation.transcript && !dictation.answer && (
                    <small>{t('Prueba con una respuesta de esta pregunta.')}</small>
                  )}
                </label>
              )}
              {dictation.answer && !dictation.listening && (
                <button type="button" className="button primary" onClick={dictation.accept}>
                  {t('Usar esta respuesta')}
                </button>
              )}
            </div>
            <div className="daily-guide-actions">
              <button
                type="button"
                className="text-button"
                onClick={guide.index ? guide.back : guide.chooseMode}
              >
                {t(guide.index ? 'Pregunta anterior' : 'Cambiar modo de registro')}
              </button>
              {guide.index > 0 && (
                <button type="button" className="text-button" onClick={guide.selectManual}>
                  {t('Seguir a mano')}
                </button>
              )}
              <button
                type="button"
                className="text-button"
                aria-pressed={guide.voice}
                disabled={dictation.listening}
                onClick={guide.toggleVoice}
              >
                {guide.voice ? (
                  <Volume2 size={16} aria-hidden="true" />
                ) : (
                  <VolumeX size={16} aria-hidden="true" />
                )}
                {t('Voz de Nami')}
              </button>
            </div>
          </>
        )
      )}
    </section>
  );
}
