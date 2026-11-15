'use client';

import { useState } from 'react';
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

export function AvatarScreen({ crewId, crewName }: { crewId: string; crewName: string }) {
  const [open, setOpen] = useState(false);
  const appearance = useAppBackground();
  const model = useAvatarViewModel(crewId, appearance.selectBackground);
  useTumiViewContext(
    open ? 'Personalización del astronauta' : undefined,
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
  return (
    <details
      id="crew-avatar"
      className={styles.workshop}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>Personalizar astronauta</summary>
      {open && (
        <AvatarView
          crewName={crewName}
          selection={model.selection}
          background={appearance.background}
          onBackgroundChange={appearance.selectBackground}
          onSelect={model.select}
          onReset={model.reset}
          preview={<AvatarPreview selection={model.selection} parts={model.parts} />}
        />
      )}
    </details>
  );
}
