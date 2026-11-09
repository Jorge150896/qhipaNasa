'use client';
import { useRouter } from 'next/navigation';
import { Icon } from '@/ui/Icon';
import type { MissionSection } from './types';
import { missionRoute } from '@/presentation/shared/missionRoutes';
import { useMissionWorkspace } from './MissionWorkspaceProvider';
import { MissionShell } from './components/MissionShell';
import { MissionFeatureScreen } from './MissionFeatureScreen';
import { MissionPageHeader } from '../../shared/mission/MissionPageHeader';
export function MissionScreen({
  section,
  habitatId = 'odyssey',
}: {
  section: MissionSection;
  habitatId?: string;
}) {
  const router = useRouter();
  const { data, loading, error, message, saving, actions } = useMissionWorkspace();
  function navigate(next: MissionSection) {
    router.push(missionRoute(habitatId, next));
  }
  return (
    <MissionShell
      section={section}
      onNavigate={navigate}
      pendingCount={data?.pendingCount}
      missionName={data?.name}
      onOpenExplorer={() =>
        router.push(
          `/explore?destination=${habitatId === 'aurora' ? 'station' : habitatId === 'selene' ? 'moon' : habitatId === 'ares' ? 'mars' : 'ship'}`,
        )
      }
    >
      {message && (
        <div
          className={`toast ${message.error ? 'toast-error' : ''}`}
          role={message.error ? 'alert' : 'status'}
        >
          <Icon name={message.error ? 'alert' : 'checked'} />
          <p>{message.text}</p>
          <button aria-label="Cerrar mensaje" onClick={actions.dismissMessage}>
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {loading ? (
        <div className="loading-state" role="status">
          <Icon name="orbit" className="spin" size={38} />
          <h1>Preparando la misión</h1>
          <p>Cargando el escenario y el registro de demostración.</p>
        </div>
      ) : error || !data ? (
        <div className="loading-state" role="alert">
          <Icon name="alert" size={38} />
          <h1>No pudimos abrir la misión</h1>
          <p>{error}</p>
          <button className="button primary" onClick={actions.retry}>
            Volver a intentar
          </button>
        </div>
      ) : (
        <div className="mission-page">
          <MissionPageHeader data={data} section={section} onSelectCrew={actions.selectCrew} />
          <MissionFeatureScreen
            section={section}
            data={data}
            actions={actions}
            saving={saving}
            habitatId={habitatId}
            onNavigate={navigate}
          />
        </div>
      )}
    </MissionShell>
  );
}
