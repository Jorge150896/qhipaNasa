import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
export function TumiModeOptions({
  following,
  onChangeMode,
}: {
  following: boolean;
  onChangeMode(following: boolean): void;
}) {
  const t = useTranslation();
  return (
    <div className="assistant-mode" role="group" aria-label={t('Modo de Nami')}>
      <span>{t('Modo')}</span>
      <button type="button" aria-pressed={!following} onClick={() => onChangeMode(false)}>
        {t('Autónomo')}
      </button>
      <button type="button" aria-pressed={following} onClick={() => onChangeMode(true)}>
        {t('Guía local')}
      </button>
    </div>
  );
}
