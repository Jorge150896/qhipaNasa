import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { BodyDisplay, HologramAppearance } from '../hologramTypes';
export function HumanHologramControls({
  display,
  appearance,
  onDisplayChange,
  onAppearanceChange,
}: {
  display: BodyDisplay;
  appearance: HologramAppearance;
  onDisplayChange(value: BodyDisplay): void;
  onAppearanceChange(value: HologramAppearance): void;
}) {
  const t = useTranslation();
  return (
    <div className="human-hologram-controls">
      <div role="group" aria-label={t('Modelo corporal')}>
        <button
          type="button"
          aria-pressed={display === 'astronaut'}
          onClick={() => onDisplayChange('astronaut')}
        >
          {t('Astronauta con traje')}
        </button>
        <button
          type="button"
          aria-pressed={display === 'hologram'}
          onClick={() => onDisplayChange('hologram')}
        >
          {t('Holograma humano')}
        </button>
      </div>
      {display === 'hologram' && (
        <>
          <div role="group" aria-label={t('Apariencia del holograma')}>
            {(
              [
                { id: 'neutral', label: 'Neutra' },
                { id: 'masculine', label: 'Masculina' },
                { id: 'feminine', label: 'Femenina' },
              ] as const
            ).map((item) => (
              <button
                type="button"
                key={item.id}
                aria-pressed={appearance === item.id}
                onClick={() => onAppearanceChange(item.id)}
              >
                {t(item.label)}
              </button>
            ))}
          </div>
          <small>
            {t('Modelo de referencia · elección visual por tripulante durante esta visita.')}
          </small>
        </>
      )}
    </div>
  );
}
