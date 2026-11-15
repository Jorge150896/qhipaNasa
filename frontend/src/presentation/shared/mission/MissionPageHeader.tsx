import type { MissionActions, MissionData, MissionSection } from '../../features/mission/types';
import { scenarioOptions, sectionTitles } from '../../features/mission/constants';
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
  const scenario = scenarioOptions.find((option) => option.id === data.scenario)?.label;
  const showCrewPicker = !['habitat', 'sources', 'simulation', 'observations'].includes(section);
  const showSnapshot = section === 'crew' || section === 'history' || section === 'observations';
  return (
    <>
      {section !== 'overview' && (
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
          {showSnapshot && (
            <div className="snapshot-time">
              <Icon name="clock" size={15} />
              <div>
                {data.time}
                <span>
                  {data.date} · {scenario}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
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
          {section === 'overview' ? (
            <p className="overview-snapshot-time">
              {data.date} · {data.time} · {scenario}
            </p>
          ) : (
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
