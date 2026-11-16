import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { TumiReplyFormat } from './useTumiReplyAudio';

export function TumiReplyOptions({
  format,
  onChange,
}: {
  format: TumiReplyFormat;
  onChange(format: TumiReplyFormat): void;
}) {
  const t = useTranslation();
  return (
    <div className="assistant-mode" role="group" aria-label={t('Formato de respuesta de Nami')}>
      <span>{t('Respuesta')}</span>
      <button type="button" aria-pressed={format === 'text'} onClick={() => onChange('text')}>
        {t('Texto')}
      </button>
      <button type="button" aria-pressed={format === 'audio'} onClick={() => onChange('audio')}>
        Audio
      </button>
    </div>
  );
}
