'use client';

import { useContext, useEffect } from 'react';
import { AssistantActionsContext } from './AssistantActionsContext';

export function useTumiViewContext(
  view: string | undefined,
  facts: string[],
  priority = 0,
  localAnswer?: (question: string) => string | undefined,
) {
  const register = useContext(AssistantActionsContext)?.registerView;
  const details = facts.join('\n').slice(0, 4200);
  useEffect(() => {
    if (view) return register?.({ view, details }, priority, localAnswer);
  }, [register, view, details, priority, localAnswer]);
}
