interface LocalRecognition {
  lang: string;
  processLocally?: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
}

type SpeechWindow = Window & {
  SpeechRecognition?: new () => LocalRecognition;
  webkitSpeechRecognition?: new () => LocalRecognition;
};

export function startLocalDictation(callbacks: {
  onText(text: string): void;
  onStatus(message: string): void;
  onEnd(): void;
}) {
  const speechWindow = window as SpeechWindow;
  const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
  if (!Recognition) {
    callbacks.onStatus('El dictado local no está disponible aquí. Puedes escribir tu pregunta.');
    return;
  }

  const recognition = new Recognition();
  if (!('processLocally' in recognition)) {
    callbacks.onStatus(
      'Este navegador no ofrece dictado en el dispositivo. Puedes escribir tu pregunta.',
    );
    return;
  }

  recognition.lang = 'es-ES';
  recognition.processLocally = true;
  recognition.onresult = (event) => callbacks.onText(event.results[0]?.[0]?.transcript ?? '');
  recognition.onerror = ({ error }) =>
    callbacks.onStatus(
      error === 'language-not-supported'
        ? 'Falta el paquete de voz en español del navegador. Puedes escribir tu pregunta.'
        : error === 'not-allowed'
          ? 'El navegador no permitió usar el micrófono. Puedes escribir tu pregunta.'
          : 'No pude captar la pregunta. Puedes volver a dictar o escribir.',
    );
  recognition.onend = callbacks.onEnd;
  try {
    recognition.start();
  } catch {
    callbacks.onStatus('No se pudo iniciar el dictado. Puedes escribir tu pregunta.');
    return;
  }
  return () => {
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
  };
}
