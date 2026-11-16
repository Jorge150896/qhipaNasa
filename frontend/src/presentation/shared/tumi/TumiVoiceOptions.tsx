import { useEffect, useState } from 'react';
import { speechLanguage } from '@/domain/assistant/AppLanguage';
import {
  browserVoices,
  preferredBrowserVoice,
  selectBrowserVoice,
} from '@/infrastructure/speech/browserVoice';
import { useAppLanguage, useTranslation } from '@/presentation/shared/language/AppLanguageProvider';

export function TumiVoiceOptions() {
  const { language } = useAppLanguage();
  return language === 'en' ? <VoiceSelect /> : null;
}

function VoiceSelect() {
  const t = useTranslation();
  const locale = speechLanguage('en');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selected, setSelected] = useState(() => preferredBrowserVoice(locale));

  useEffect(() => {
    const engine = window.speechSynthesis;
    const refresh = () => setVoices(browserVoices(locale));
    engine?.addEventListener?.('voiceschanged', refresh);
    const initial = window.setTimeout(refresh, 0);
    return () => {
      window.clearTimeout(initial);
      engine?.removeEventListener?.('voiceschanged', refresh);
    };
  }, [locale]);

  if (!voices.length) return null;
  return (
    <label className="tumi-voice-select">
      {t('Voz de Nami')}
      <select
        value={voices.some(({ voiceURI }) => voiceURI === selected) ? selected : ''}
        onChange={(event) => {
          setSelected(event.target.value);
          selectBrowserVoice(locale, event.target.value);
        }}
      >
        <option value="">{t('Voz automática')}</option>
        {voices.map(({ voiceURI, name, lang }) => (
          <option key={voiceURI} value={voiceURI}>
            {name} ({lang})
          </option>
        ))}
      </select>
    </label>
  );
}
