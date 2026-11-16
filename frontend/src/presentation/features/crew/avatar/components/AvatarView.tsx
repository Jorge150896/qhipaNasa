import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { ReactNode } from 'react';
import { Crosshair, Orbit, RotateCcw } from 'lucide-react';
import { appBackgrounds, type AppBackground } from '@/presentation/shared/space/appBackground';
import { partOptions } from '../catalog';
import { avatarPalette, type AvatarSelection, type SuitColor } from '../types';
import styles from '../avatar.module.css';

const finishes = [
  { id: 'bands', label: 'Bandas' },
  { id: 'controls', label: 'Controles del traje' },
] as const;

const colors = [
  { id: 'purple', name: 'Morado' },
  { id: 'orange', name: 'Naranja' },
] as const satisfies readonly { id: SuitColor; name: string }[];

export function AvatarView({
  crewName,
  selection,
  background,
  preview,
  onBackgroundChange,
  onSelect,
  onReset,
}: {
  crewName: string;
  selection: AvatarSelection;
  background: AppBackground;
  onBackgroundChange(background: AppBackground): void;
  preview: ReactNode;
  onSelect<K extends keyof AvatarSelection>(slot: K, value: AvatarSelection[K]): void;
  onReset(): void;
}) {
  const t = useTranslation();
  return (
    <div className={styles.console}>
      <header className={styles.header}>
        <div className={styles.identity}>
          <Crosshair size={19} aria-hidden="true" />
          <h3>
            {t('Equipo de ')}
            {t(crewName)}
          </h3>
        </div>
        <button type="button" className={styles.reset} onClick={onReset}>
          <RotateCcw size={14} aria-hidden="true" />
          {t(' Restablecer')}
        </button>
      </header>
      <div className={styles.layout}>
        <figure className={styles.figure}>
          <div className={styles.preview} data-background={background}>
            {preview}
          </div>
          <figcaption>
            <Orbit size={15} aria-hidden="true" />
            {t(' Arrastra para girar · Desplaza para acercar')}
          </figcaption>
        </figure>
        <div className={styles.equipment}>
          <fieldset>
            <legend>{t('Accesorios')}</legend>
            <div className={styles.choices}>
              <button
                type="button"
                aria-pressed={selection.decoration === ''}
                onClick={() => onSelect('decoration', '')}
              >
                {t('Sin accesorio')}
              </button>
              {partOptions.decoration.map((part) => (
                <button
                  type="button"
                  key={part.id}
                  aria-pressed={selection.decoration === part.id}
                  onClick={() => onSelect('decoration', part.id)}
                >
                  {t(part.label)}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>{t('Herramientas')}</legend>
            <div className={styles.choices}>
              <button
                type="button"
                aria-pressed={selection.tool === ''}
                onClick={() => onSelect('tool', '')}
              >
                {t('Manos libres')}
              </button>
              {partOptions.tool.map((part) => (
                <button
                  type="button"
                  key={part.id}
                  aria-pressed={selection.tool === part.id}
                  onClick={() => onSelect('tool', part.id)}
                >
                  {t(part.label)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className={styles.environment}>
          <fieldset>
            <legend>{t('Colores del traje')}</legend>
            {finishes.map(({ id, label }) => (
              <div key={id} className={styles.finish}>
                <span>{t(label)}</span>
                <div role="group" aria-label={t(label)} className={styles.choices}>
                  {colors.map(({ id: color, name }) => (
                    <button
                      type="button"
                      key={color}
                      aria-pressed={selection[id] === color}
                      onClick={() => onSelect(id, color)}
                    >
                      <span
                        className={styles.swatch}
                        style={{ background: avatarPalette[color] }}
                      />
                      {t(name)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </fieldset>
          <fieldset>
            <legend>{t('Fondo de la app')}</legend>
            <div className={styles.choices}>
              {appBackgrounds.map(({ id, label }) => (
                <button
                  type="button"
                  key={id}
                  aria-pressed={background === id}
                  onClick={() => onBackgroundChange(id)}
                >
                  <span
                    aria-hidden="true"
                    className={styles.backgroundSample}
                    data-background={id}
                  />
                  {t(label)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
    </div>
  );
}
