type VoiceLanguage = 'en-US' | 'es-ES';
const voiceKey = (language: VoiceLanguage) => `astra.tumi.voice.${language}`;

export function browserVoices(language: VoiceLanguage): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const locale = language.toLowerCase();
  const matching = window.speechSynthesis
    .getVoices()
    .filter(({ lang }) => lang.toLowerCase().split(/[-_]/)[0] === locale.slice(0, 2));
  return language === 'en-US'
    ? matching.sort((a, b) => voiceRank(b, locale) - voiceRank(a, locale))
    : matching;
}

function voiceRank(voice: SpeechSynthesisVoice, locale: string) {
  const exactLocale = voice.lang.toLowerCase().replace('_', '-') === locale;
  const enhanced = /natural|premium|enhanced|neural|siri|google/i.test(voice.name);
  return Number(exactLocale) * 4 + Number(enhanced) * 2 + Number(voice.localService);
}

export function preferredBrowserVoice(language: VoiceLanguage): string {
  try {
    return window.localStorage.getItem(voiceKey(language)) ?? '';
  } catch {
    return '';
  }
}

export function selectBrowserVoice(language: VoiceLanguage, uri: string) {
  try {
    window.localStorage.setItem(voiceKey(language), uri);
  } catch {
    // Speech can still use the automatically selected voice.
  }
}

/** User-initiated browser speech. No microphone or application audio upload. */
export function speakInBrowser(
  text: string,
  callbacks: {
    onStart(): void;
    onWordBoundary?(charIndex: number): void;
    onEnd(): void;
    onError(message: string): void;
  },
  language: VoiceLanguage = 'es-ES',
): () => void {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
    callbacks.onError('Este navegador no dispone de voz. Puedes seguir usando Nami sin audio.');
    return () => {};
  }
  const engine = window.speechSynthesis;
  if (engine.speaking || engine.pending) {
    callbacks.onError('Hay otra voz en reproducción. Inténtalo al terminar.');
    return () => {};
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  utterance.rate = language === 'en-US' ? 0.9 : 1.02;
  utterance.pitch = language === 'en-US' ? 1 : 1.12;
  let active = true;
  let disposed = false;
  const timer = window.setTimeout(() => {
    if (!active || disposed) return;
    active = false;
    engine.cancel();
    callbacks.onError('No se pudo iniciar la voz. Nami sigue disponible sin audio.');
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
  let voiceLoadTimer: number | undefined;
  function stopWaiting() {
    clearTimeout(voiceLoadTimer);
    engine.removeEventListener?.('voiceschanged', whenVoicesLoad);
  }
  function play() {
    stopWaiting();
    if (!active || disposed) return;
    const voices = engine.getVoices();
    const matching = browserVoices(language);
    const preference = language === 'en-US' ? preferredBrowserVoice(language) : '';
    const defaultVoice =
      language === 'en-US'
        ? matching[0]
        : (matching.find(({ localService }) => localService) ?? matching[0]);
    const voice =
      (preference && matching.find(({ voiceURI }) => voiceURI === preference)) || defaultVoice;
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else if (voices.length) {
      finish();
      callbacks.onError('No hay una voz disponible para este idioma en tu navegador.');
      return;
    }
    try {
      engine.speak(utterance);
    } catch {
      finish();
      callbacks.onError('No se pudo iniciar la voz en este navegador.');
    }
  }
  function whenVoicesLoad() {
    if (engine.getVoices().length) play();
  }

  if (!engine.getVoices().length && engine.addEventListener) {
    engine.addEventListener('voiceschanged', whenVoicesLoad);
    voiceLoadTimer = window.setTimeout(play, 450);
  } else {
    play();
  }
  return () => {
    disposed = true;
    stopWaiting();
    clearTimeout(timer);
    if (active) {
      active = false;
      engine.cancel();
    }
  };
}
