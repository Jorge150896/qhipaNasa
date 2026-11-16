'use client';
import { LocalizedText } from '@/presentation/shared/language/AppLanguageProvider';
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type Scene from '../scene/MissionScene';
import { Icon } from '@/ui/Icon';
const MissionScene = dynamic(() => import('../scene/MissionScene'), {
  ssr: false,
  loading: () => (
    <div className="scene-viewport scene-fallback">
      <Icon name="loader" className="spin" />
      <LocalizedText>Preparando visor 3D…</LocalizedText>
    </div>
  ),
});
export function MissionSceneSlot(props: ComponentProps<typeof Scene>) {
  return <MissionScene {...props} />;
}
