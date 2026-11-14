import type { Metadata } from 'next';
import { LoadingPreviewScreen } from '@/presentation/features/loading-preview/LoadingPreviewScreen';
export const metadata: Metadata = { title: 'Qhipa Pacha · Animación de carga' };
export default function Page() {
  return <LoadingPreviewScreen />;
}
