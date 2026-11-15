import { useState } from 'react';
import { createCabinHistoryDependencies } from '@/di/createCabinHistoryDependencies';
import { useCabinHistoryViewModel } from './useCabinHistoryViewModel';
import { CabinHistoryView } from './components/CabinHistoryView';

const { archive } = createCabinHistoryDependencies();

export function CabinHistoryScreen() {
  const [open, setOpen] = useState(false);
  const { data, onSeek, onTogglePlayback } = useCabinHistoryViewModel(archive, open);

  return (
    <details
      className="panel cabin-history"
      onToggle={(event) => {
        const next = event.currentTarget.open;
        setOpen(next);
        if (!next) onSeek(data.index);
      }}
    >
      <summary>Ver historial de la ISS</summary>
      <CabinHistoryView data={data} onSeek={onSeek} onTogglePlayback={onTogglePlayback} />
    </details>
  );
}
