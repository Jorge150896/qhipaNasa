import { useEffect, useMemo, useState } from 'react';
import type { LoadSpaceExplorer } from '@/domain/usecases/LoadSpaceExplorer';
import { mapExplorerPresentation } from './mapExplorerPresentation';
import type { DestinationKey } from './types';
import { useAppLanguage } from '@/presentation/shared/language/AppLanguageProvider';
export function useSpaceExplorerViewModel(
  dependencies: { loadExplorer: LoadSpaceExplorer },
  selectedId: DestinationKey,
) {
  const { language } = useAppLanguage();
  const [result, setResult] = useState<Awaited<ReturnType<LoadSpaceExplorer['execute']>> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    void dependencies.loadExplorer
      .execute(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;
        setResult(result);
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
  const data = useMemo(
    () => result && mapExplorerPresentation(result, language),
    [result, language],
  );
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
