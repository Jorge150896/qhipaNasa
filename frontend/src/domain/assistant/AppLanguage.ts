export type AppLanguage = 'en' | 'es';

export const defaultAppLanguage: AppLanguage = 'en';

export function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'en' || value === 'es';
}

export function speechLanguage(language: AppLanguage): 'en-US' | 'es-ES' {
  return language === 'en' ? 'en-US' : 'es-ES';
}

export function requestedAppLanguage(message: string): AppLanguage | undefined {
  const text = message
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const request =
    /^(?:(?:por favor|please) )?(?:(?:puedes|podrias|can you|could you) )?(?:cambia(?:r)?|pon(?:er)?|configura|set|change|switch|put) (?:toda |all )?(?:(?:el idioma de |the language of )?(?:la |el |the )?(?:app|aplicacion|interfaz|interface)(?: (?:completa|entera))?|(?:el idioma|the language|language)) (?:a|en|to|in) (espanol|spanish|ingles|english)(?: (?:por favor|please))?$/.exec(
      text,
    );
  if (!request) return;
  return /^(espanol|spanish)$/.test(request[1]) ? 'es' : 'en';
}

export function languageChangeConfirmation(language: AppLanguage) {
  return language === 'en' ? 'The app is now in English.' : 'La aplicación ya está en español.';
}
