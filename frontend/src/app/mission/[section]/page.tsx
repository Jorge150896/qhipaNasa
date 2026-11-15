import { notFound, redirect } from 'next/navigation';
import { MissionScreen } from '@/presentation/features/mission/MissionScreen';
import { sections, type MissionSection } from '@/presentation/features/mission/types';
export function generateStaticParams() {
  return [...sections, 'habitat', 'history', 'monitoring', 'overview', 'observations'].map(
    (section) => ({ section }),
  );
}
export default async function MissionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (section === 'overview' || section === 'observations') redirect('/mission/crew/');
  if (section === 'monitoring') redirect('/mission/journal/');
  if (section === 'habitat') redirect('/mission/crew/#crew-module');
  if (section === 'history') redirect('/mission/crew/#crew-history');
  if (!sections.some((value) => value === section)) notFound();
  return <MissionScreen section={section as MissionSection} />;
}
