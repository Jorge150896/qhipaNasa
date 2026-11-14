import { notFound } from 'next/navigation';
import { MissionScreen } from '@/presentation/features/mission/MissionScreen';
import { sections, type MissionSection } from '@/presentation/features/mission/types';
export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}
export default async function MissionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!sections.some((value) => value === section)) notFound();
  return <MissionScreen section={section as MissionSection} />;
}
