'use client';
import { LocalizedText } from '@/presentation/shared/language/AppLanguageProvider';
import dynamic from 'next/dynamic';
import '../human-hologram.css';
import type { HologramProps } from './HumanHologramScene';
const Scene = dynamic(() => import('./HumanHologramScene'), {
  ssr: false,
  loading: () => (
    <div className="telemetry-viewport scene-fallback">
      <LocalizedText>Preparando holograma humano 3D…</LocalizedText>
    </div>
  ),
});
export function HumanHologramSlot(props: HologramProps) {
  return (
    <div className="human-hologram-shell">
      <Scene {...props} />
    </div>
  );
}
