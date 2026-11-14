import { Suspense } from 'react';
import { SpaceExplorerScreen } from '@/presentation/features/space-map/SpaceExplorerScreen';

export default function Page() {
  return (
    <Suspense fallback={<p role="status">Preparando mapa espacial…</p>}>
      <SpaceExplorerScreen />
    </Suspense>
  );
}
