import { useState } from 'react';
import { createCabinHistoryDependencies } from '@/di/createCabinHistoryDependencies';
import { useCabinHistoryViewModel } from './useCabinHistoryViewModel';
import { CabinHistoryView } from './components/CabinHistoryView';
import { useTumiViewContext } from '../mission-assistant/useTumiViewContext';

const { archive } = createCabinHistoryDependencies();

export function CabinHistoryScreen() {
  const [open, setOpen] = useState(false);
  const { data, onSeek, onTogglePlayback } = useCabinHistoryViewModel(archive, open);
  useTumiViewContext(
    open ? 'Archivo histórico de la ISS' : undefined,
    [
      `Archivo de ambiente de cabina de la ISS, separado de la simulación. Selección: ${data.seriesDate}, ${data.currentTime}. ${data.signals.map(({ label, value, unit }) => `${label}: ${value} ${unit}`).join('; ')}. Fuente: ${data.sourceUrl}.`,
    ],
    1,
  );

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
