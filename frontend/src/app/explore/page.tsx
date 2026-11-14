import { SpaceExplorerScreen } from '@/presentation/features/space-map/SpaceExplorerScreen';
import { destinationIds } from '@/domain/explorer/models';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const { destination } = await searchParams;
  const selected = destinationIds.find((id) => id === destination) ?? 'ship';
  return <SpaceExplorerScreen destination={selected} />;
}
