'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AvatarView } from './components/AvatarView';
import { useAvatarViewModel } from './useAvatarViewModel';
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
  const model = useAvatarViewModel(crewId);
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
          onSelect={model.select}
          onReset={model.reset}
          preview={<AvatarPreview selection={model.selection} parts={model.parts} />}
        />
      )}
    </details>
  );
}
