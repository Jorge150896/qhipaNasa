import { notFound, redirect } from 'next/navigation';
import { habitatIds, isHabitatId } from '@/domain/explorer/models';
import { MissionScreen } from '@/presentation/features/mission/MissionScreen';
import { sections, type MissionSection } from '@/presentation/features/mission/types';
export function generateStaticParams() {
  return habitatIds
    .filter((habitatId) => habitatId !== 'odyssey')
    .flatMap((habitatId) => sections.map((section) => ({ habitatId, section })));
}
export default async function Page({
  params,
}: {
  params: Promise<{ habitatId: string; section: string }>;
}) {
  const { habitatId, section } = await params;
  if (!isHabitatId(habitatId) || !sections.some((value) => value === section)) notFound();
  if (habitatId === 'odyssey') redirect(`/mission/${section}`);
  return <MissionScreen section={section as MissionSection} habitatId={habitatId} />;
}
