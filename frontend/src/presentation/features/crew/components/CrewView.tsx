import type { ReactNode } from 'react';
import { Icon } from '@/ui/Icon';
import {
  MissionDashboardView,
  type MissionDashboardProps,
} from '../../../shared/mission/MissionDashboardView';
export function CrewView({
  dashboard,
  healthPanel,
}: {
  dashboard: MissionDashboardProps;
  healthPanel?: ReactNode;
}) {
  return (
    <>
      <div className="health-entry-link">
        <Icon name="heart" />
        <span>Explora indicadores, autorregistros y seguimiento por sistema corporal.</span>
        <a href="#crew-health">
          Explorar salud por sistemas
          <Icon name="arrow" size={14} />
        </a>
      </div>
      <MissionDashboardView {...dashboard} />
      {healthPanel}
    </>
  );
}
