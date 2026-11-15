export const avatarPalette = {
  charcoal: '#212529',
  light: '#E9ECEF',
  purple: '#8338EC',
  orange: '#FB5607',
} as const;

export type SuitColor = 'purple' | 'orange';

export interface AvatarSelection {
  decoration: string;
  tool: string;
  bands: SuitColor;
  controls: SuitColor;
}

export interface AvatarPart {
  id: string;
  label: string;
  socket: 'floating' | 'chest' | 'hand' | 'back';
  file: string;
}
