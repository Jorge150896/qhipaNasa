import { useEffect, useState } from 'react';
import type { LoadSpaceExplorer } from '@/domain/usecases/LoadSpaceExplorer';
import { mapExplorerPresentation } from './mapExplorerPresentation';
import type { DestinationKey, ExplorerData } from './types';
export function useSpaceExplorerViewModel(
  dependencies: { loadExplorer: LoadSpaceExplorer },
  selectedId: DestinationKey,
) {
  const [data, setData] = useState<ExplorerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void dependencies.loadExplorer
      .execute(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setData(mapExplorerPresentation(result));
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setError(true);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [dependencies, revision]);
  return {
    data,
    selected: data?.destinations.find((destination) => destination.id === selectedId),
    loading,
    error,
    refresh() {
      setLoading(true);
      setError(false);
      setRevision((value) => value + 1);
    },
  };
}
