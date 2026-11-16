import type { Metadata } from 'next';
import { LandingScreen } from '@/presentation/features/landing/LandingScreen';
export const metadata: Metadata = {
  title: 'Qhipa Pacha · Your wellbeing, in another orbit',
  description: 'Explore Qhipa Pacha’s demo for space crew health and wellbeing.',
};
export default function Home() {
  return <LandingScreen />;
}
