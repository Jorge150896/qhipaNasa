import type { MissionData } from '../mission/types';
import type { AstronautOverviewData } from './types';

/** Coverage describes samples present, never a physiological target or clinical score. */
export function mapAstronautOverview(mission: MissionData): AstronautOverviewData {
  const metrics = mission.selected.metrics.map((metric) => {
    const available = metric.history.filter(
      (sample) => sample.numericValue !== null && !sample.missing,
    ).length;
    return {
      id: metric.id,
      label: metric.shortLabel,
      value: metric.value,
      unit: metric.unit,
      quality: metric.quality,
      available,
      total: metric.history.length,
      coverage: metric.history.length ? available / metric.history.length : 0,
    };
  });
  return {
    name: mission.selected.name,
    role: mission.selected.role,
    activity: mission.selected.activity,
    location: mission.selected.location,
    time: mission.time,
    date: mission.date,
    currentSignals: mission.selected.metrics.filter((metric) => {
      const latest = metric.history.at(-1);
      return latest && latest.numericValue !== null && !latest.missing;
    }).length,
    totalSignals: metrics.length,
    selectedMetric: mission.metric.id,
    metrics,
    environment: { name: mission.selectedZone.name, readings: mission.selectedZone.readings },
  };
}
