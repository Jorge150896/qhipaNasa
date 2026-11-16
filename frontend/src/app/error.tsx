'use client';
import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
export default function ErrorPage({ reset }: { reset(): void }) {
  const t = useTranslation();
  return (
    <main className="standalone-state">
      <h1>{t('Se interrumpió esta vista.')}</h1>
      <p>{t('Vuelve a intentarlo para retomar la misión.')}</p>
      <button className="button primary" onClick={reset}>
        {t('Reintentar')}
      </button>
    </main>
  );
}
