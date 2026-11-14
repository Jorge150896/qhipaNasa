import { TumiLoader } from '../../../shared/loading/TumiLoader';
import type { LoadingPreviewData } from '../types';
export function LoadingPreviewView({ paused, onToggle, onBack }: LoadingPreviewData) {
  return (
    <main className="loading-preview-page">
      <TumiLoader variant="fullscreen" paused={paused} busy={false} />
      <div className="loading-preview-controls">
        <span>Vista previa · bucle continuo</span>
        <button onClick={onToggle} aria-pressed={paused}>
          {paused ? 'Reanudar animación' : 'Pausar animación'}
        </button>
        <button onClick={onBack}>Volver a la portada</button>
      </div>
    </main>
  );
}
