import { SpaceExplorerScreen } from '@/presentation/features/space-map/SpaceExplorerScreen';
import { destinationIds } from '@/domain/explorer/models';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string; tab?: string; site?: string }>;
}) {
  const { destination, tab, site } = await searchParams;
  const panel = tab === 'earth' ? 'earth' : tab === 'launches' ? 'launches' : 'network';
  const selected =
    panel !== 'network' ? 'earth' : (destinationIds.find((id) => id === destination) ?? 'ship');
  return <SpaceExplorerScreen destination={selected} panel={panel} launchSite={site} />;
}
