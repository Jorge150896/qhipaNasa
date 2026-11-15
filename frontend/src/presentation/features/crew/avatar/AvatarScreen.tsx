'use client';

import dynamic from 'next/dynamic';
import { AvatarView } from './components/AvatarView';
import { useAvatarViewModel } from './useAvatarViewModel';
import { useAppBackground } from '@/presentation/shared/space/AppBackgroundProvider';
import { appBackgrounds } from '@/presentation/shared/space/appBackground';
import { useTumiViewContext } from '../../mission-assistant/useTumiViewContext';
import styles from './avatar.module.css';

const AvatarPreview = dynamic(
  () => import('./AvatarPreview').then((module) => module.AvatarPreview),
  {
    ssr: false,
    loading: () => <p role="status">Preparando el visor…</p>,
  },
);

export function AvatarScreen({
  active,
  crewId,
  crewName,
}: {
  active: boolean;
  crewId: string;
  crewName: string;
}) {
  const appearance = useAppBackground();
  const model = useAvatarViewModel(crewId, appearance.selectBackground);
  useTumiViewContext(
    active ? 'Personalización del astronauta' : undefined,
    [
      `Equipo visible de ${crewName}: ${
        model.parts
          .filter(Boolean)
          .map((part) => part?.label)
          .join(', ') || 'sin accesorios ni herramientas seleccionados'
      }. Fondo de la app: ${appBackgrounds.find(({ id }) => id === appearance.background)?.label ?? 'sin seleccionar'}.`,
    ],
    1,
  );
  if (!active) return null;

  return (
    <section id="crew-avatar" aria-labelledby="crew-avatar-title" className={styles.workshop}>
      <h2 id="crew-avatar-title" className={styles.title}>
        Personalizar astronauta
      </h2>
      <AvatarView
        crewName={crewName}
        selection={model.selection}
        background={appearance.background}
        onBackgroundChange={appearance.selectBackground}
        onSelect={model.select}
        onReset={model.reset}
        preview={<AvatarPreview selection={model.selection} parts={model.parts} />}
      />
    </section>
  );
}
