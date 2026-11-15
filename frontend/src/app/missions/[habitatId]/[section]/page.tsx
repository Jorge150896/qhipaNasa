import { notFound, redirect } from 'next/navigation';
import { habitatIds, isHabitatId } from '@/domain/explorer/models';
import { missionRoute } from '@/presentation/shared/missionRoutes';
import { MissionScreen } from '@/presentation/features/mission/MissionScreen';
import { sections, type MissionSection } from '@/presentation/features/mission/types';
export function generateStaticParams() {
  return habitatIds
    .filter((habitatId) => habitatId !== 'odyssey')
    .flatMap((habitatId) =>
      [...sections, 'habitat', 'history', 'monitoring', 'overview', 'observations'].map(
        (section) => ({ habitatId, section }),
      ),
    );
}
export default async function Page({
  params,
}: {
  params: Promise<{ habitatId: string; section: string }>;
}) {
  const { habitatId, section } = await params;
  if (!isHabitatId(habitatId)) notFound();
  if (section === 'overview' || section === 'observations') {
    redirect(`${missionRoute(habitatId, 'crew')}/`);
  }
  if (section === 'monitoring') redirect(`${missionRoute(habitatId, 'journal')}/`);
  if (section === 'habitat') redirect(`${missionRoute(habitatId, 'crew')}/#crew-module`);
  if (section === 'history') redirect(`${missionRoute(habitatId, 'crew')}/#crew-history`);
  if (!sections.some((value) => value === section)) notFound();
  if (habitatId === 'odyssey') redirect(`/mission/${section}`);
  return <MissionScreen section={section as MissionSection} habitatId={habitatId} />;
}
