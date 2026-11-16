interface RecognitionResult extends ArrayLike<{ transcript: string }> {
  isFinal?: boolean;
}

interface LocalRecognition {
  lang: string;
  processLocally?: boolean;
  continuous?: boolean;
  interimResults?: boolean;
  onresult: ((event: { results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onnomatch?: (() => void) | null;
  onend: (() => void) | null;
  onaudiostart?: (() => void) | null;
  onaudioend?: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type LanguageOptions = { langs: string[]; processLocally: true };
type RecognitionConstructor = {
  new (): LocalRecognition;
  available?(
    options: LanguageOptions,
  ): Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
  install?(options: LanguageOptions): Promise<boolean>;
};

type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor;
  webkitSpeechRecognition?: RecognitionConstructor;
};

export function startLocalDictation(
  callbacks: {
    onText(text: string): void;
    onStatus(message: string): void;
    onEnd(): void;
    onCapture?(active: boolean): void;
    onPreview?(text: string): void;
  },
  fallback = 'Puedes escribir tu pregunta.',
  language?: 'es-ES' | 'en-US',
) {
  const speechWindow = window as SpeechWindow;
  const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  if (!Recognition) {
    callbacks.onStatus(`El dictado local no está disponible aquí. ${fallback}`);
    return;
  }

  const recognition = new Recognition();
  if (!('processLocally' in recognition)) {
    callbacks.onStatus(`Este navegador no ofrece dictado en el dispositivo. ${fallback}`);
    return;
  }

  recognition.lang = language ?? 'es-ES';
  const languageLabel = language === 'en-US' ? 'inglés' : 'español';
  recognition.processLocally = true;
  if (callbacks.onPreview) {
    recognition.continuous = true;
    recognition.interimResults = true;
  }
  recognition.onresult = ({ results }) => {
    const phrases = Array.from(results);
    const finalText: string[] = [];
    const interimText: string[] = [];
    for (const phrase of phrases) {
      const text = phrase[0]?.transcript.trim();
      if (text) (phrase.isFinal === false ? interimText : finalText).push(text);
    }
    if (finalText.length) callbacks.onText(finalText.join(' '));
    if (interimText.length) callbacks.onPreview?.([...finalText, ...interimText].join(' '));
  };
  recognition.onnomatch = () =>
    callbacks.onStatus(`Escuché audio, pero no pude distinguir las palabras. ${fallback}`);
  recognition.onerror = ({ error }) =>
    callbacks.onStatus(
      error === 'language-not-supported'
        ? `Falta el paquete de voz en ${languageLabel} del navegador. ${fallback}`
        : error === 'not-allowed'
          ? `El navegador no permitió usar el micrófono. ${fallback}`
          : error === 'audio-capture'
            ? `El navegador no pudo acceder al micrófono. Revisa qué micrófono está seleccionado. ${fallback}`
            : error === 'no-speech'
              ? `El micrófono se abrió, pero no detectó tu voz. ${fallback}`
              : `No pude captar lo que dijiste. Puedes volver a dictar. ${fallback}`,
    );
  let timeLimit: number | undefined;
  let settleLimit: number | undefined;
  recognition.onend = () => {
    window.clearTimeout(timeLimit);
    window.clearTimeout(settleLimit);
    callbacks.onEnd();
  };
  recognition.onaudiostart = () => {
    callbacks.onCapture?.(true);
    if (recognition.continuous) timeLimit = window.setTimeout(stopCapture, 30_000);
  };
  recognition.onaudioend = () => {
    callbacks.onCapture?.(false);
    if (recognition.continuous) waitForResult();
  };

  let cancelled = false;
  let started = false;
  function finish(message: string) {
    if (cancelled) return;
    callbacks.onStatus(message);
    callbacks.onEnd();
  }

  async function prepare() {
    try {
      if (language && Recognition?.available) {
        const options: LanguageOptions = { langs: [language], processLocally: true };
        const availability = await Recognition.available(options);
        if (cancelled) return;
        if (availability !== 'available') {
          if (availability === 'unavailable' || !Recognition.install) {
            finish(`El dictado local en ${languageLabel} no está disponible aquí. ${fallback}`);
            return;
          }
          callbacks.onStatus(`Preparando el dictado en ${languageLabel}…`);
          const installed = await Recognition.install(options);
          finish(
            installed
              ? 'El paquete está listo. Pulsa «Reintentar micrófono».'
              : `No pude descargar el paquete de ${languageLabel}. ${fallback}`,
          );
          return;
        }
      }
      recognition.start();
      started = true;
    } catch {
      finish(`No se pudo iniciar el dictado. ${fallback}`);
    }
  }
  void prepare();
  function cancel() {
    cancelled = true;
    window.clearTimeout(timeLimit);
    window.clearTimeout(settleLimit);
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onnomatch = null;
    recognition.onend = null;
    recognition.onaudiostart = null;
    recognition.onaudioend = null;
    if (started) recognition.abort();
  }
  function waitForResult() {
    window.clearTimeout(timeLimit);
    window.clearTimeout(settleLimit);
    settleLimit = window.setTimeout(() => {
      cancel();
      callbacks.onEnd();
    }, 3500);
  }
  function stopCapture() {
    waitForResult();
    recognition.stop();
  }
  return {
    cancel,
    finishCapture() {
      if (started) {
        stopCapture();
      } else {
        cancel();
        callbacks.onEnd();
      }
    },
  };
}
