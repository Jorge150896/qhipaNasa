'use client';

import { createContext } from 'react';
import type { TumiScreenContext } from '@/domain/assistant/TumiConversation';
import type { SensorKey } from '../mission/types';
import type { AssistantSelection } from './types';

export const AssistantActionsContext = createContext<{
  askAboutReading(id: SensorKey, selection?: AssistantSelection): void;
  askQuestion(question: string): void;
  setLauncherHost(host: HTMLDivElement | null): void;
  registerView(context: TumiScreenContext, priority: number): () => void;
} | null>(null);
