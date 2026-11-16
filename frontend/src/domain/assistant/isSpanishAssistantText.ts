/** Catches clearly untranslated replies from the assistant, including mixed-language replies. */
export function isSpanishAssistantText(text: string): boolean {
  const spanishWords =
    /\b(?:una|unas|unos|del|los|las|para|puedes|puedo|quieres|está|estás|están|estaba|tienes|veo|esto|este|esta|aquí|cómo|cuéntame|gracias|chequeo|ánimo|sueño|lectura|autorregistro|muestra|instantánea|pantalla|simulación)\b/gi;
  return /[¿¡]/u.test(text) || (text.match(spanishWords)?.length ?? 0) >= 3;
}
