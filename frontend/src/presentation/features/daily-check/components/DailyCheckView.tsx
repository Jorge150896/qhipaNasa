import { useTranslation } from '@/presentation/shared/language/AppLanguageProvider';
import type { MissionData } from '../../mission/types';
import type { DailyCheckGuideViewModel, DailyCheckViewModel } from '../types';
import { Panel } from '@/ui/Panel';
import { Icon } from '@/ui/Icon';
import { CheckAttachments } from './CheckAttachments';
import { JournalForm } from './JournalForm';
import { DailyCheckGuide } from './DailyCheckGuide';

export function DailyCheckView({
  data,
  saving,
  model,
  guide,
}: {
  data: MissionData;
  saving: boolean;
  model: DailyCheckViewModel;
  guide: DailyCheckGuideViewModel;
}) {
  const t = useTranslation();
  const readings = model.step < 2 && guide.mode === 'manual' ? model.attachment : undefined;
  return (
    <div className="journal-layout daily-check-layout" data-readings={Boolean(readings)}>
      <Panel>
        {guide.active ? (
          <DailyCheckGuide guide={guide} />
        ) : (
          <JournalForm
            personName={data.selected.name}
            saving={saving}
            updating={data.todayCheck}
            model={model}
            guide={guide}
          />
        )}
      </Panel>
      {readings && (
        <Panel className="daily-readings">
          <div className="panel-heading">
            <Icon name="heart" />
            <h3>{t('Lecturas del cuerpo y del entorno')}</h3>
          </div>
          <p className="sub">{t('Estas lecturas se adjuntan al guardar tu registro.')}</p>
          <CheckAttachments data={readings} />
        </Panel>
      )}
    </div>
  );
}
