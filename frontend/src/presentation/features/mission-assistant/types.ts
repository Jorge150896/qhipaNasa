import type { MetricData, ScenarioKey, ZoneData } from '../mission/types';

export interface AssistantReply {
  text: string;
  target?: string;
}

export interface AssistantMessage {
  id: number;
  role: 'user' | 'assistant';
  reply: AssistantReply;
}

export interface AssistantSelection {
  at: string;
  compareFrom?: string;
}

export interface AssistantMetricContext {
  metric: MetricData;
  crewId: string;
  crewName: string;
  scenario: ScenarioKey;
  capturedAt: string;
  date: string;
  time: string;
  activity: string;
  location: string;
  explicitSample: boolean;
  sample?: AssistantSample;
  reference?: AssistantSample;
}

export interface AssistantSample {
  reading: MetricData['history'][number];
  zone?: ZoneData;
  activity?: string;
}
