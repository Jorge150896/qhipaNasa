'use client';

import { useEffect } from 'react';
import type { DailyCheckScreenProps } from './types';
import { DailyCheckView } from './components/DailyCheckView';
import { useDailyCheckViewModel } from './useDailyCheckViewModel';
import './daily-check.css';

export function DailyCheckScreen(props: DailyCheckScreenProps) {
  return <DailyCheckSession key={props.data.selected.id} {...props} />;
}

function DailyCheckSession({ data, saving, onSave }: DailyCheckScreenProps) {
  const model = useDailyCheckViewModel(data, onSave);
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id.startsWith('check-')) document.getElementById(id)?.scrollIntoView({ block: 'center' });
  }, []);
  return <DailyCheckView data={data} saving={saving} model={model} />;
}
