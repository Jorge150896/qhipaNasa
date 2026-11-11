import { useEffect, useState } from 'react';

/** Minimum intro per mount; does not extend requests or retry failed operations. */
export function useLoadingDelayViewModel(active = true) {
  const [introPending, setIntroPending] = useState(true);
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setIntroPending(false), 3000);
    return () => window.clearTimeout(timer);
  }, [active]);
  return active && introPending;
}
