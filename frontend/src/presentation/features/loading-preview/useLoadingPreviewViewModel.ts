import { useState } from 'react';
export function useLoadingPreviewViewModel() {
  const [paused, setPaused] = useState(false);
  return { paused, onToggle: () => setPaused((value) => !value) };
}
