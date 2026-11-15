export type TextEmotion = 'neutral' | 'happy' | 'sad' | 'angry' | 'mixed';

/** Small Spanish text heuristic. Describes signals in text, never a person's mental state. */
export function detectTextEmotion(message: string): TextEmotion {
  const text = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es');
  const found = new Set<Exclude<TextEmotion, 'neutral' | 'mixed'>>();
  for (const clause of text.split(/[.!?;,\n]|\b(?:pero|aunque|sin embargo)\b/)) {
    const personal = /\b(?:yo|estoy|siento|soy|tengo|ando|me)\b/.test(clause);
    const reported =
      /\b(?:el|ella|amigo|amiga|hermano|hermana|personaje|pelicula|libro|cancion)\b/.test(clause);
    if (!personal && reported) continue;
    const tokens = clause.match(/[a-z]+|[\u{1F300}-\u{1FAFF}]|[♥❤☹]/gu) ?? [];
    tokens.forEach((token, index) => {
      const before = tokens.slice(Math.max(0, index - 3), index);
      if (before.some((word) => ['no', 'nunca', 'tampoco', 'sin'].includes(word))) return;
      if (
        /^(?:feliz|felices|felicidad|alegre|alegria|content[oa]s?|emocionad[oa]s?|entusiasmad[oa]s?|encanta|genial|celebrando|logre)$/.test(
          token,
        ) ||
        ['😀', '😃', '😄', '😁', '😊', '🥰', '😍', '🥳', '🤩'].includes(token)
      )
        found.add('happy');
      if (
        /^(?:tristes?|tristeza|llorando|llorar|lloro|desanimad[oa]s?|decaid[oa]s?|apenad[oa]s?|nostalgia)$/.test(
          token,
        ) ||
        ['😢', '😭', '😞', '😔', '💔', '☹'].includes(token) ||
        (token === 'mal' && /me siento\s+(?:muy\s+)?mal/.test(clause)) ||
        (/^sol[oa]$/.test(token) &&
          /(?:estoy|siento|ando)\s+(?:(?:muy|tan)\s+)?sol[oa]/.test(clause))
      )
        found.add('sad');
      if (
        /^(?:enojad[oa]s?|enojar|enfado|enfadad[oa]s?|furios[oa]s?|molest[oa]s?|rabia|ira|odio|frustrad[oa]s?|frustracion|colera)$/.test(
          token,
        ) ||
        ['😡', '😠', '🤬', '💢'].includes(token)
      )
        found.add('angry');
    });
  }
  return found.size > 1 ? 'mixed' : (found.values().next().value ?? 'neutral');
}

export function emotionalAcknowledgement(emotion: TextEmotion): string | null {
  switch (emotion) {
    case 'sad':
      return 'Suena a que estás pasando un momento triste. Te escucho; si quieres, cuéntame qué ocurrió.';
    case 'happy':
      return '¡Qué alegría leerte así! Me encanta compartir ese entusiasmo contigo. ¿Quieres contarme qué pasó?';
    case 'angry':
      return 'Parece que algo te ha molestado. Te escucho con calma; podemos ir paso a paso. ¿Qué ocurrió?';
    case 'mixed':
      return 'Suena a que hay emociones mezcladas. Prefiero no asumir cómo te sientes. ¿Quieres contarme un poco más?';
    default:
      return null;
  }
}
