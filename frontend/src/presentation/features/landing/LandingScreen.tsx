'use client';
import { useEffect } from 'react';
import { useAppLanguage } from '@/presentation/shared/language/AppLanguageProvider';
import { TumiLoader } from '../../shared/loading/TumiLoader';
import { useRouter } from 'next/navigation';
import { useLandingViewModel } from './useLandingViewModel';
import { LandingView } from './components/LandingView';
import './landing.css';

export function LandingScreen() {
  const router = useRouter();
  const { language } = useAppLanguage();
  useEffect(() => {
    document.title =
      language === 'en'
        ? 'Qhipa Pacha · Your wellbeing, in another orbit'
        : 'Qhipa Pacha · Tu bienestar, en otra órbita';
  }, [language]);
  const model = useLandingViewModel();
  useEffect(() => {
    if (model.launchReady) router.push('/mission/crew');
  }, [model.launchReady, router]);
  if (model.launching) return <TumiLoader variant="fullscreen" />;
  return (
    <LandingView
      {...model}
      onOpenMission={() => {
        router.prefetch('/mission/crew');
        model.onBeginMission();
      }}
      onOpenExplorer={() => router.push('/explore')}
      onOpenCrew={() => router.push('/mission/crew')}
    />
  );
}
