import { shuttleModules } from '../../shared/scene/shuttleModules';
import type { MissionData } from '../mission/types';
import type { HabitatData } from './types';

export function useHabitatViewModel(
  mission: MissionData,
  showCutaway: boolean,
  occupiedEntry: boolean,
): HabitatData {
  const { zones, selected, selectedZone } = mission;
  const zone = (occupiedEntry && zones.find((item) => item.id === selected.zoneId)) || selectedZone;
  const ordered = showCutaway
    ? [
        ...shuttleModules.flatMap((module) => zones.filter((item) => item.id === module.id)),
        ...zones.filter((item) => !shuttleModules.some((module) => module.id === item.id)),
      ]
    : zones;
  return {
    name: mission.name,
    timestamp: `${mission.date} · ${mission.time}`,
    zone,
    zones: ordered.map((item) => ({
      id: item.id,
      name: item.name,
      shortName: shuttleModules.find((module) => module.id === item.id)?.shortName ?? item.name,
    })),
    occupants: mission.crew.filter((person) => person.zoneId === zone.id),
    occupiedId: selected.zoneId,
    crew: mission.crew.map(({ id, name }) => ({ id, name })),
    simulated: {
      person: selected,
      zone: zones.find((item) => item.id === selected.zoneId),
      metrics: selected.metrics.map((metric) => ({
        label: metric.id === 'temperature' ? 'Temperatura corporal' : metric.shortLabel,
        value: metric.value,
        unit: metric.unit,
        quality: metric.quality,
        change: metric.value === '—' ? undefined : metric.comparison?.difference,
      })),
    },
  };
}
