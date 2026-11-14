import { Icon } from '@/ui/Icon';
import {
  MissionDashboardView,
  type MissionDashboardProps,
} from '../../../shared/mission/MissionDashboardView';
export function HabitatView({ dashboard }: { dashboard: MissionDashboardProps }) {
  return (
    <>
      <MissionDashboardView {...dashboard} />
      <div className="zone-cards">
        {dashboard.data.zones.map((zone) => (
          <button
            className="zone-card"
            key={zone.id}
            aria-pressed={zone.id === dashboard.data.selectedZone.id}
            onClick={() => dashboard.actions.selectZone(zone.id)}
          >
            <Icon name="rocket" />
            <h3>{zone.name}</h3>
            <p>{zone.description}</p>
            <span>{zone.occupants}</span>
          </button>
        ))}
      </div>
    </>
  );
}
