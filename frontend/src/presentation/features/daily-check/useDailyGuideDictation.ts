import { useEffect, useRef, useState } from 'react';
import { speechLanguage } from '@/domain/assistant/AppLanguage';
import { useAppLanguage } from '@/presentation/shared/language/AppLanguageProvider';

export type GuideVoiceLanguage = 'es-ES' | 'en-US';
type DictationSession = { cancel(): void; finishCapture(): void };
type ActiveDictation = {
  controls?: DictationSession;
  heardAudio: boolean;
  finalText: string;
  interimText: string;
  autoFinish?: number;
};
const opening = 'Abriendo el micrófono…';
const hearing = 'Te escucho. Cuando entienda tu respuesta, pasaré a la siguiente pregunta.';
const processing = 'Procesando lo que dijiste…';
export type StartGuideDictation = (
  callbacks: {
    onText(text: string): void;
    onStatus(message: string): void;
    onEnd(): void;
    onCapture(active: boolean): void;
    onPreview(text: string): void;
  },
  language: GuideVoiceLanguage,
) => DictationSession | undefined;

export function useDailyGuideDictation(startDictation: StartGuideDictation) {
  const session = useRef<ActiveDictation | null>(null);
  const [listeningLanguage, setListeningLanguage] = useState<GuideVoiceLanguage>();
  const [capturing, setCapturing] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const { language: appLanguage } = useAppLanguage();
  const [override, setOverride] = useState<{
    appLanguage: typeof appLanguage;
    language: GuideVoiceLanguage;
  }>();
  const language =
    override?.appLanguage === appLanguage ? override.language : speechLanguage(appLanguage);
  const listening = listeningLanguage === language;
  const [transcript, setTranscript] = useState('');
  const [preview, setPreview] = useState('');
  const [status, setStatus] = useState('');
  const [needsReview, setNeedsReview] = useState(false);
  const [canEnterResponse, setCanEnterResponse] = useState(false);

  function cancel() {
    const current = session.current;
    session.current = null;
    window.clearTimeout(current?.autoFinish);
    current?.controls?.cancel();
  }

  useEffect(() => cancel, [language]);

  function reset() {
    cancel();
    setListeningLanguage(undefined);
    setCapturing(false);
    setFinishing(false);
    setTranscript('');
    setPreview('');
    setStatus('');
    setNeedsReview(false);
    setCanEnterResponse(false);
  }

  return {
    listening,
    capturing: listening && capturing,
    finishing: listening && finishing,
    language,
    changeLanguage(value: GuideVoiceLanguage) {
      reset();
      setOverride({ appLanguage, language: value });
    },
    transcript,
    preview,
    status,
    needsReview,
    canEnterResponse,
    enterResponse(value: string) {
      setTranscript(value);
      setNeedsReview(false);
      setStatus('');
    },
    reset,
    stop() {
      if (finishing || !session.current?.controls) return;
      window.clearTimeout(session.current.autoFinish);
      setFinishing(true);
      setStatus(processing);
      session.current.controls.finishCapture();
    },
    start(canAdvance: (text: string) => boolean, accept: (text: string) => void) {
      reset();
      const current: ActiveDictation = { heardAudio: false, finalText: '', interimText: '' };
      function finishAfterPause(milliseconds: number) {
        window.clearTimeout(current.autoFinish);
        current.autoFinish = window.setTimeout(() => {
          if (session.current !== current) return;
          setFinishing(true);
          setStatus(processing);
          current.controls?.finishCapture();
        }, milliseconds);
      }
      session.current = current;
      setListeningLanguage(language);
      setStatus(opening);
      current.controls = startDictation(
        {
          onCapture(active) {
            if (session.current !== current) return;
            if (active) current.heardAudio = true;
            else window.clearTimeout(current.autoFinish);
            setCapturing(active);
            setStatus((previous) =>
              active ? hearing : previous === hearing ? processing : previous,
            );
          },
          onPreview(text) {
            if (session.current !== current || !text.trim()) return;
            finishAfterPause(1800);
            current.interimText = text.trim();
            setPreview(current.interimText);
          },
          onText(text) {
            if (session.current !== current || !text.trim()) return;
            current.finalText = text.trim();
            current.interimText = '';
            setTranscript(current.finalText);
            setPreview('');
            setStatus((previous) => (previous === hearing ? previous : ''));
            finishAfterPause(canAdvance(current.finalText) ? 850 : 1800);
          },
          onStatus(message) {
            if (session.current === current) setStatus(message);
          },
          onEnd() {
            if (session.current !== current) return;
            window.clearTimeout(current.autoFinish);
            session.current = null;
            setListeningLanguage(undefined);
            setCapturing(false);
            setFinishing(false);
            if (!current.interimText && canAdvance(current.finalText)) {
              accept(current.finalText);
              return;
            }
            setCanEnterResponse(!current.finalText || Boolean(current.interimText));
            if (current.interimText) {
              setTranscript(current.interimText);
              setPreview('');
              setNeedsReview(true);
              setStatus('Esto es lo que alcancé a oír. Revísalo antes de usarlo.');
              return;
            }
            setStatus((previous) =>
              previous === hearing || previous === opening || previous === processing
                ? current.finalText
                  ? ''
                  : current.heardAudio
                    ? 'El micrófono se abrió, pero no recibí palabras. Puedes reintentar o usar el dictado del teclado.'
                    : 'El micrófono no llegó a activarse. Revisa el permiso del sitio o usa el dictado del teclado.'
                : previous,
            );
          },
        },
        language,
      );
      if (!current.controls && session.current === current) {
        session.current = null;
        setListeningLanguage(undefined);
        setCanEnterResponse(true);
      }
    },
  };
}
