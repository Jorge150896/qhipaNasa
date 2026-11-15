import type { CrewData } from '../mission/types';

export function getTumiCrewNames({ name }: CrewData): string[] {
  const firstName = name.split(' ')[0];
  return name === 'Elena Torres' ? [firstName, 'Lena'] : [firstName];
}
