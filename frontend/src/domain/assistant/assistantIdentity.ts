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
    .replace(/^(?:por favor|please) /, '')
    .replace(/ (?:por favor|please)$/, '');
  const withoutAddress = text.replace(/ nami$/, '');
  const introductionInSpanish =
    /^(?:(?:me puedes |puedes |quiero que me )?(?:habla(?:r|me|s|es)?|cuenta(?:r|me|s|es)?|dime) (?:un poco )?(?:de|sobre|acerca de) (?:ti(?: misma)?|nami)|quien es nami|que es nami|que puedes hacer(?: por mi)?)$/;
  const introductionInEnglish =
    /^(?:(?:(?:can|could|would|will) (?:you|i) )?(?:tell me|say(?: me)?) (?:a little(?: bit)? |a bit |more |something )?about (?:you|yourself|nami)|who is nami|what can you do)$/;
  if (
    [introductionInSpanish, introductionInEnglish].some(
      (pattern) => pattern.test(text) || pattern.test(withoutAddress),
    )
  ) {
    return language === 'en'
      ? 'I’m Nami, the virtual companion in Qhipa Pacha. I can guide your daily check-in, explain what’s on screen and help you explore the simulation. What would you like to try?'
      : 'Soy Nami, tu compañera virtual en Qhipa Pacha. Puedo guiarte en el chequeo diario, explicarte lo que ves en pantalla y ayudarte a explorar la simulación. ¿Qué te gustaría probar?';
  }
  if (
    !/^(?:como te llamas|cual es tu nombre|quien eres|whats your name|what is your name|who are you)$/.test(
      withoutAddress,
    )
  )
    return;
  return language === 'en'
    ? 'I’m Nami, your virtual assistant for Qhipa Pacha.'
    : 'Soy Nami, tu asistente virtual de Qhipa Pacha.';
}
