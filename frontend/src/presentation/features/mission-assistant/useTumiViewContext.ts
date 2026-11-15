'use client';

import { useContext, useEffect } from 'react';
import { AssistantActionsContext } from './AssistantActionsContext';

export function useTumiViewContext(view: string | undefined, facts: string[], priority = 0) {
  const register = useContext(AssistantActionsContext)?.registerView;
  const details = facts.join('\n').slice(0, 4200);
  useEffect(() => {
    if (view) return register?.({ view, details }, priority);
  }, [register, view, details, priority]);
}
