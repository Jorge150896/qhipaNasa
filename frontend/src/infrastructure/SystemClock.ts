import type { Clock } from '@/domain/mission/models';
export const systemClock: Clock = { now: () => new Date() };
