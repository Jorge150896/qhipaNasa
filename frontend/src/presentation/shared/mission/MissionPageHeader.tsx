import type { MissionActions, MissionData, MissionSection } from '../../features/mission/types';
import { sectionTitles } from '../../features/mission/constants';
import { Icon } from '@/ui/Icon';
export function MissionPageHeader({
  data,
  section,
  onSelectCrew,
}: {
  data: MissionData;
  section: MissionSection;
  onSelectCrew: MissionActions['selectCrew'];
}) {
  const title = sectionTitles[section];
  const showCrewPicker = section === 'crew' || section === 'journal' || section === 'simulation';
  return (
    <>
      <div className={`page-heading${section === 'crew' ? ' crew-page-heading' : ''}`}>
        <div>
          {section !== 'crew' && (
            <p className="eyebrow">
              <span className="accent">{data.name.toUpperCase()}</span> / DÍA DE MISIÓN {data.day}
            </p>
          )}
          <h1>{title.title}</h1>
          {section !== 'crew' && <p className="page-description">{title.description}</p>}
        </div>
      </div>
      {showCrewPicker && (
        <div className={`crew-toolbar${section === 'crew' ? ' crew-page-toolbar' : ''}`}>
          <div className="crew-picker" aria-label="Seleccionar tripulante">
            {data.crew.map((person) => (
              <button
                key={person.id}
                aria-label={`${person.name} ${person.role}`}
                aria-pressed={person.id === data.selected.id}
                onClick={() => onSelectCrew(person.id)}
              >
                <span className="avatar">{person.initials}</span>
                <span>
                  {person.name}
                  <small>{person.role}</small>
                </span>
                {person.id === data.selected.id && <Icon name="check" size={15} />}
              </button>
            ))}
          </div>
          {section === 'journal' && (
            <div className="crew-context">
              <span className="status-dot" />
              {data.selected.activity} · {data.selected.location}
            </div>
          )}
        </div>
      )}
    </>
  );
}
