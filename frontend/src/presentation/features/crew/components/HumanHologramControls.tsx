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
  return (
    <div className="human-hologram-controls">
      <div role="group" aria-label="Modelo corporal">
        <button
          type="button"
          aria-pressed={display === 'astronaut'}
          onClick={() => onDisplayChange('astronaut')}
        >
          Astronauta con traje
        </button>
        <button
          type="button"
          aria-pressed={display === 'hologram'}
          onClick={() => onDisplayChange('hologram')}
        >
          Holograma humano
        </button>
      </div>
      {display === 'hologram' && (
        <>
          <div role="group" aria-label="Apariencia del holograma">
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
                {item.label}
              </button>
            ))}
          </div>
          <small>Modelo de referencia · elección visual por tripulante durante esta visita.</small>
        </>
      )}
    </div>
  );
}
