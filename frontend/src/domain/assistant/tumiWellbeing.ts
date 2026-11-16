import type { Mood } from '@/domain/mission/models';

export const tumiWellbeingReplies: Record<Mood, string> = {
  good: '¡Qué gusto saber que hoy te sientes bien! ¿Qué fue lo que más te hizo sonreír? Si quieres, podemos pensar cómo repetir ese buen momento.',
  neutral:
    'Gracias por contármelo. Hay días que se sienten un poco mezclados. Si te apetece, cuéntame qué hizo que hoy se sintiera regular.',
  low: 'Gracias por confiarme cómo te sientes. Siento que hoy esté siendo difícil. Podemos ir con calma. Si quieres, cuéntame qué te pesó más hoy.',
};

export function getDirectWellbeingMood(message: string): Mood | undefined {
  if (/[¿?]/.test(message)) return;
  const text = message
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[¡!.\p{Extended_Pictographic}\uFE0F]/gu, '')
    .trim();
  const statement =
    /^(?:(?:hoy|today)\s+)?(?:me siento|estoy|me va|ando|i feel|i am|i m|i'm)\s+(?:(?:muy|un poco|very|a bit)\s+)?(.+?)(?:\s+(?:hoy|today))?$/.exec(
      text,
    );
  if (!statement) return;
  const feeling = statement[1];
  if (/^(?:bien|genial|feliz|alegre|content[oa]|good|well|great|happy)$/.test(feeling))
    return 'good';
  if (/^(?:regular|mas o menos|asi asi|okay|ok|so so)$/.test(feeling)) return 'neutral';
  if (/^(?:triste|mal|desanimad[oa]|decaid[oa]|sad|down|low|bad)$/.test(feeling)) return 'low';
}
