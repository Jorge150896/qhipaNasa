/** User-initiated browser speech. No microphone or application audio upload. */
export function speakInBrowser(
  text: string,
  callbacks: {
    onStart(): void;
    onWordBoundary?(charIndex: number): void;
    onEnd(): void;
    onError(message: string): void;
  },
): () => void {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    callbacks.onError('Este navegador no dispone de voz. Puedes seguir usando Tumi sin audio.');
    return () => {};
  }
  const engine = window.speechSynthesis;
  if (engine.speaking || engine.pending) {
    callbacks.onError('Hay otra voz en reproducción. Inténtalo al terminar.');
    return () => {};
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 1.02;
  utterance.pitch = 1.12;
  const voices = engine.getVoices().filter((voice) => voice.lang.startsWith('es'));
  const voice = voices.find((candidate) => candidate.localService) ?? voices[0];
  if (voice) utterance.voice = voice;
  let active = true;
  let disposed = false;
  const timer = window.setTimeout(() => {
    if (!active || disposed) return;
    active = false;
    engine.cancel();
    callbacks.onError('No se pudo iniciar la voz. Tumi sigue disponible sin audio.');
  }, 8000);
  const finish = () => {
    active = false;
    clearTimeout(timer);
  };
  utterance.onstart = () => {
    clearTimeout(timer);
    if (!disposed) callbacks.onStart();
  };
  if (callbacks.onWordBoundary) {
    utterance.onboundary = ({ name, charIndex }) => {
      if (active && !disposed && (!name || name === 'word')) callbacks.onWordBoundary?.(charIndex);
    };
  }
  utterance.onend = () => {
    finish();
    if (!disposed) callbacks.onEnd();
  };
  utterance.onerror = () => {
    finish();
    if (!disposed) callbacks.onError('La reproducción terminó o no está disponible.');
  };
  try {
    engine.speak(utterance);
  } catch {
    finish();
    callbacks.onError('No se pudo iniciar la voz en este navegador.');
  }
  return () => {
    disposed = true;
    clearTimeout(timer);
    if (active) {
      active = false;
      engine.cancel();
    }
  };
}
