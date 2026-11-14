'use client';
import dynamic from 'next/dynamic';
import '../human-hologram.css';
import type { HologramProps } from './HumanHologramScene';
const Scene = dynamic(() => import('./HumanHologramScene'), {
  ssr: false,
  loading: () => (
    <div className="telemetry-viewport scene-fallback">Preparando holograma humano 3D…</div>
  ),
});
export function HumanHologramSlot(props: HologramProps) {
  return (
    <div className="human-hologram-shell">
      <Scene {...props} />
    </div>
  );
}
