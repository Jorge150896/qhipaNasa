import type { AvatarBackground, AvatarPart, AvatarSelection } from './types';

export const partOptions = {
  decoration: [
    { id: 'probe', label: 'Dron orbital', socket: 'floating', file: 'probe.glb' },
    { id: 'badge', label: 'Insignia frontal', socket: 'chest', file: 'badge.glb' },
    { id: 'beacon', label: 'Baliza flotante', socket: 'floating', file: 'beacon.glb' },
    { id: 'pack', label: 'Mochila propulsora', socket: 'back', file: 'pack.glb' },
  ],
  tool: [
    { id: 'torch', label: 'Linterna', socket: 'hand', file: 'torch.glb' },
    { id: 'scanner', label: 'Escáner', socket: 'hand', file: 'scanner.glb' },
  ],
} satisfies Record<'decoration' | 'tool', AvatarPart[]>;

export const defaultAvatar: AvatarSelection = {
  background: 'studio',
  decoration: '',
  tool: '',
  bands: 'orange',
  controls: 'purple',
};

export const avatarBackgrounds = [
  { id: 'studio', label: 'Estudio orbital' },
  { id: 'orbit', label: 'Órbita' },
  { id: 'hangar', label: 'Hangar' },
] satisfies { id: AvatarBackground; label: string }[];
