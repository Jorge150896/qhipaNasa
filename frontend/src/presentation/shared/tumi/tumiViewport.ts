const mobileTumiQuery = '(max-width: 600px)';

export function isTumiMobile() {
  return window.matchMedia(mobileTumiQuery).matches;
}

export function subscribeToTumiViewport(onChange: () => void) {
  const query = window.matchMedia(mobileTumiQuery);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
