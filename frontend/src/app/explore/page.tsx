'use client';
import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { Suspense } from 'react';
import { SpaceExplorerScreen } from '@/presentation/features/space-map/SpaceExplorerScreen';

export default function Page() {
  const t = useTranslation();
  return (
    <Suspense fallback={<p role="status">{t('Preparando mapa espacial…')}</p>}>
      <SpaceExplorerScreen />
    </Suspense>
  );
}
