'use client';
import { useEffect, useState } from 'react';
import { useMissionDashboardViewModel } from '../../shared/mission/useMissionDashboardViewModel';
import { MissionSceneSlot } from '../../shared/mission/MissionSceneSlot';
import { HabitatView } from './components/HabitatView';
import { CabinHistoryScreen } from './CabinHistoryScreen';
import { useHabitatViewModel } from './useHabitatViewModel';
import type { HabitatScreenProps } from './types';
import './habitat.css';

export function HabitatScreen({
  data,
  actions,
  habitatId,
  openCrew,
  selectCrew,
  openCheck,
}: HabitatScreenProps) {
  const { habitatKind } = useMissionDashboardViewModel(habitatId, 'ship');
  const [occupiedEntry, setOccupiedEntry] = useState(false);
  const habitat = useHabitatViewModel(data, habitatKind === 'ship', occupiedEntry);
  useEffect(() => {
    let frame: number;
    const deadline = performance.now() + 700;
    function focusOccupiedModule() {
      if (window.location.hash !== '#occupied-module') {
        if (performance.now() < deadline) frame = requestAnimationFrame(focusOccupiedModule);
        return;
      }
      setOccupiedEntry(true);
      const inspector = document.getElementById('occupied-module');
      inspector?.focus({ preventScroll: true });
      inspector?.scrollIntoView({ block: 'start' });
    }
    frame = requestAnimationFrame(focusOccupiedModule);
    return () => cancelAnimationFrame(frame);
  }, []);
  function selectZone(id: string) {
    setOccupiedEntry(false);
    actions.selectZone(id);
  }
  return (
    <HabitatView
      data={habitat}
      onSelectZone={selectZone}
      onOpenCrew={openCrew}
      onSelectCrew={selectCrew}
      onOpenCheck={openCheck}
      archive={<CabinHistoryScreen />}
      scene={
        <MissionSceneSlot
          habitatKind={habitatKind}
          martian={habitatId === 'ares'}
          mode="ship"
          selectedSensor={data.metric.id}
          selectedZone={habitat.zone.id}
          modules={habitat}
          showModuleCamera
          onSelectSensor={actions.selectMetric}
          onSelectZone={selectZone}
        />
      }
    />
  );
}
