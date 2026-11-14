import type { MissionData } from '../../features/mission/types';

const signedNumber = new Intl.NumberFormat('es-PE', {
  signDisplay: 'exceptZero',
  maximumFractionDigits: 1,
});

export function formatTelemetryDifference(first: number, second: number, unit: string) {
  const differenceUnit = unit === '%' ? 'puntos porcentuales' : unit;
  return `${signedNumber.format(second - first)} ${differenceUnit}`;
}

export function getTelemetryContext(mission: MissionData, at: string) {
  if (Date.parse(at) !== Date.parse(mission.capturedAt)) return undefined;

  return {
    activity: mission.selected.activity,
    zone: mission.zones.find(({ id }) => id === mission.selected.zoneId),
  };
}
