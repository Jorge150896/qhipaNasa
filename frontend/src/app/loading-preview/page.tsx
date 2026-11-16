import type { Metadata } from 'next';
import { LoadingPreviewScreen } from '@/presentation/features/loading-preview/LoadingPreviewScreen';
export const metadata: Metadata = { title: 'Nami · Loading animation' };
export default function Page() {
  return <LoadingPreviewScreen />;
}
