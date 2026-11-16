import type { AppLanguage } from './AppLanguage';

export function answerAssistantIdentity(question: string, language: AppLanguage = 'es') {
  const text = question
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^nami /, '')
    .replace(/ nami$/, '');
  if (
    !/^(?:como te llamas|cual es tu nombre|quien eres|whats your name|what is your name|who are you)$/.test(
      text,
    )
  )
    return;
  return language === 'en'
    ? 'I’m Nami, your virtual assistant for Qhipa Pacha.'
    : 'Soy Nami, tu asistente virtual de Qhipa Pacha.';
}
