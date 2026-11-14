import { useState, useSyncExternalStore } from 'react';
import { useLoadingDelayViewModel } from '../../shared/loading/useLoadingDelayViewModel';

function subscribeMotionAvailability(onChange: () => void) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  preference.addEventListener('change', onChange);
  document.addEventListener('visibilitychange', onChange);
  return () => {
    preference.removeEventListener('change', onChange);
    document.removeEventListener('visibilitychange', onChange);
  };
}
function motionUnavailable() {
  return document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
export function useLandingViewModel() {
  const unavailable = useSyncExternalStore(
    subscribeMotionAvailability,
    motionUnavailable,
    () => true,
  );
  const [launching, setLaunching] = useState(false);
  const launchPending = useLoadingDelayViewModel(launching);
  const [paused, setPaused] = useState(false);
  const [logoRevision, setLogoRevision] = useState(0);
  return {
    launching,
    launchReady: launching && !launchPending,
    onBeginMission: () => setLaunching(true),
    motionActive: !unavailable && !paused,
    paused,
    logoRevision,
    onToggleMotion: () => setPaused((value) => !value),
    onReplayLogo: () => setLogoRevision((value) => value + 1),
  };
}
