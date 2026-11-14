import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { isHabitatId } from '@/domain/explorer/models';
import { MissionWorkspaceProvider } from '@/presentation/features/mission/MissionWorkspaceProvider';
export default async function HabitatLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ habitatId: string }>;
}) {
  const { habitatId } = await params;
  if (!isHabitatId(habitatId)) notFound();
  return (
    <MissionWorkspaceProvider key={habitatId} habitatId={habitatId}>
      {children}
    </MissionWorkspaceProvider>
  );
}
