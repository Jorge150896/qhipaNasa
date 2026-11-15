import { nasaHistoryReference } from '@/di/historyReference';
import { NasaHistoryPanel } from './components/NasaHistoryPanel';
import { useNasaHistoryViewModel } from './useNasaHistoryViewModel';
import { useTumiViewContext } from '../mission-assistant/useTumiViewContext';

export function NasaHistoryScreen() {
  const nasaHistory = useNasaHistoryViewModel(nasaHistoryReference);
  const { mission, study, indicator, selectedSample } = nasaHistory.data;
  useTumiViewContext(
    'Referencia histórica de Inspiration4',
    selectedSample
      ? [
          `Referencia histórica agregada, separada del tripulante ficticio: ${mission}, estudio ${study}. Indicador mostrado: ${indicator.label}. Fase seleccionada ${selectedSample.phase} (${selectedSample.relativeDay}): ${selectedSample.value} ${indicator.unit}.`,
        ]
      : [],
    1,
  );
  return <NasaHistoryPanel {...nasaHistory} />;
}
