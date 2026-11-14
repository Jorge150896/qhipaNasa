import { useState } from 'react';
import { defaultAvatar, partOptions } from './catalog';
import type { AvatarSelection } from './types';

export function useAvatarViewModel(crewId: string) {
  const [avatars, setAvatars] = useState<Record<string, AvatarSelection>>({});
  const selection = avatars[crewId] ?? defaultAvatar;
  return {
    selection,
    parts: [
      partOptions.decoration.find((part) => part.id === selection.decoration),
      partOptions.tool.find((part) => part.id === selection.tool),
    ],
    select<K extends keyof AvatarSelection>(slot: K, value: AvatarSelection[K]) {
      setAvatars((previous) => ({
        ...previous,
        [crewId]: { ...(previous[crewId] ?? defaultAvatar), [slot]: value },
      }));
    },
    reset() {
      setAvatars((previous) => ({ ...previous, [crewId]: defaultAvatar }));
    },
  };
}
