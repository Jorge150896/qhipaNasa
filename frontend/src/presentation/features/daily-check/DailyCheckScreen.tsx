'use client';

import type { DailyCheckScreenProps } from './types';
import { DailyCheckView } from './components/DailyCheckView';
import { useDailyCheckViewModel } from './useDailyCheckViewModel';
import './daily-check.css';

export function DailyCheckScreen(props: DailyCheckScreenProps) {
  return <DailyCheckSession key={props.data.selected.id} {...props} />;
}

function DailyCheckSession({ data, saving, onSave }: DailyCheckScreenProps) {
  const model = useDailyCheckViewModel(data, onSave);
  return <DailyCheckView data={data} saving={saving} model={model} />;
}
