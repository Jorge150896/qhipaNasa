import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import { TumiLoader } from '../../../shared/loading/TumiLoader';
import type { LoadingPreviewData } from '../types';
export function LoadingPreviewView({ paused, onToggle, onBack }: LoadingPreviewData) {
  const t = useTranslation();
  return (
    <main className="loading-preview-page">
      <TumiLoader variant="fullscreen" paused={paused} busy={false} />
      <div className="loading-preview-controls">
        <span>{t('Vista previa · bucle continuo')}</span>
        <button onClick={onToggle} aria-pressed={paused}>
          {t(paused ? 'Reanudar animación' : 'Pausar animación')}
        </button>
        <button onClick={onBack}>{t('Volver a la portada')}</button>
      </div>
    </main>
  );
}
