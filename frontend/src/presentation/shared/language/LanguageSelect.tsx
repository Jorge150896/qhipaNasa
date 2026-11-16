'use client';

import { isAppLanguage } from '@/domain/assistant/AppLanguage';
import { useAppLanguage } from './AppLanguageProvider';

export function LanguageSelect() {
  const { language, selectLanguage } = useAppLanguage();
  return (
    <select
      className="app-language-select"
      aria-label={language === 'en' ? 'App language' : 'Idioma de la aplicación'}
      value={language}
      onChange={(event) => {
        const selected = event.target.value;
        if (isAppLanguage(selected)) selectLanguage(selected);
      }}
    >
      <option value="en" lang="en">
        English
      </option>
      <option value="es" lang="es">
        Español
      </option>
    </select>
  );
}
