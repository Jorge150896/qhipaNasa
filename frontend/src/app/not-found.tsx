'use client';
import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import Link from 'next/link';
export default function NotFound() {
  const t = useTranslation();
  return (
    <main className="standalone-state">
      <span className="eyebrow">ASTRA / 404</span>
      <h1>{t('Fuera de la ruta de misión.')}</h1>
      <p>{t('Esta sección no existe.')}</p>
      <Link className="button primary" href="/mission/crew">
        {t('Volver al centro de misión')}
      </Link>
    </main>
  );
}
