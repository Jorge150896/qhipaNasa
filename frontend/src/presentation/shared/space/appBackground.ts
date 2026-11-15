export const appBackgrounds = [
  { id: 'orbit', label: 'Órbita' },
  { id: 'original', label: 'Fondo original' },
] as const;

export type AppBackground = (typeof appBackgrounds)[number]['id'];

export const defaultAppBackground: AppBackground = 'orbit';
