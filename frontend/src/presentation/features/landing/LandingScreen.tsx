'use client';
import { useEffect } from 'react';
import { TumiLoader } from '../../shared/loading/TumiLoader';
import { useRouter } from 'next/navigation';
import { useLandingViewModel } from './useLandingViewModel';
import { LandingView } from './components/LandingView';
import './landing.css';

export function LandingScreen() {
  const router = useRouter();
  const model = useLandingViewModel();
  useEffect(() => {
    if (model.launchReady) router.push('/mission/overview');
  }, [model.launchReady, router]);
  if (model.launching) return <TumiLoader variant="fullscreen" />;
  return (
    <LandingView
      {...model}
      onOpenMission={() => {
        router.prefetch('/mission/overview');
        model.onBeginMission();
      }}
      onOpenExplorer={() => router.push('/explore')}
      onOpenCrew={() => router.push('/mission/crew')}
    />
  );
}
