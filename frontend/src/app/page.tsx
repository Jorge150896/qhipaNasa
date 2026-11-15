import type { Metadata } from 'next';
import { MissionAssistantScreen } from '@/presentation/features/mission-assistant/MissionAssistantScreen';
import { LandingScreen } from '@/presentation/features/landing/LandingScreen';
export const metadata: Metadata = {
  title: 'Qhipa Pacha · Tu bienestar, en otra órbita',
  description:
    'Explora la demostración de bienestar y salud de tripulación espacial de Qhipa Pacha.',
};
export default function Home() {
  return (
    <MissionAssistantScreen data={null} landing>
      <LandingScreen />
    </MissionAssistantScreen>
  );
}
