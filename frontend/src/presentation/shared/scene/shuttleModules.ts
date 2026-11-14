export const shuttleModules = [
  { id: 'cockpit', shortName: 'Cabina', code: '01', z: -2.96, color: '#6ecde2' },
  { id: 'habitat', shortName: 'Descanso', code: '02', z: -1.48, color: '#bf91fa' },
  { id: 'exercise', shortName: 'Ejercicio', code: '03', z: 0, color: '#f1b27c' },
  { id: 'laboratory', shortName: 'Laboratorio', code: '04', z: 1.48, color: '#81d6ba' },
  { id: 'life-support', shortName: 'Soporte vital', code: '05', z: 2.96, color: '#91a9f3' },
] as const;

export type ShuttleModuleId = (typeof shuttleModules)[number]['id'];
export const shuttleModuleWidth = 1.45;
export const shuttleModuleLength = 1.42;
export const shuttleDeckLength = 7.4;
