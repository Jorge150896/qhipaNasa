import type { AppLanguage } from '@/domain/assistant/AppLanguage';
import english from './english.json';

const catalog: Readonly<Record<string, string>> = english;
const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const placeholder = /\{(\d+)\}/g;

const templates = Object.entries(catalog)
  .filter(([source]) => /\{\d+\}/.test(source))
  .map(([source, translation]) => {
    const tokens = source.split(/(\{\d+\})/);
    const literalLength = tokens
      .filter((token) => !/^\{\d+\}$/.test(token))
      .join('')
      .trim().length;
    const indices = Array.from(source.matchAll(placeholder), (match) => match[1]);
    return {
      literalLength,
      translation,
      indices,
      pattern: new RegExp(
        '^' +
          tokens
            .map((token) => (/^\{\d+\}$/.test(token) ? '(.*?)' : escapePattern(token)))
            .join('') +
          '$',
      ),
    };
  })
  .filter(({ literalLength }) => literalLength >= 3)
  .sort((first, second) => second.literalLength - first.literalLength);

function translate(value: string, allowTemplates: boolean): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized) return value;
  const withSpacing = (translated: string) =>
    value.slice(0, value.length - value.trimStart().length) +
    translated +
    value.slice(value.trimEnd().length);
  if (Object.hasOwn(catalog, normalized)) return withSpacing(catalog[normalized]);
  if (!allowTemplates) return value;
  for (const { pattern, translation, indices } of templates) {
    const match = pattern.exec(normalized);
    if (match) {
      return withSpacing(
        translation.replace(placeholder, (_, index: string) => {
          const position = indices.indexOf(index);
          return position === -1 ? '' : translate(match[position + 1], false);
        }),
      );
    }
  }
  return value;
}

export function translateAppText<T>(
  value: T,
  language: AppLanguage,
): T extends string ? string : T {
  return (
    language === 'en' && typeof value === 'string' ? translate(value, true) : value
  ) as T extends string ? string : T;
}
