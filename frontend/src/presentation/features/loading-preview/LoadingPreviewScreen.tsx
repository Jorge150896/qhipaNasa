'use client';
import { useRouter } from 'next/navigation';
import { LoadingPreviewView } from './components/LoadingPreviewView';
import { useLoadingPreviewViewModel } from './useLoadingPreviewViewModel';
export function LoadingPreviewScreen() {
  const router = useRouter();
  const model = useLoadingPreviewViewModel();
  return <LoadingPreviewView {...model} onBack={() => router.push('/')} />;
}
