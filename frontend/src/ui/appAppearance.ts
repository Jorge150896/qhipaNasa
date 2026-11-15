export const appearanceStorageKey = 'astra.appearance';
export type AppAppearance = 'light' | 'dark';

const appearanceChange = 'astra:appearance-change';

export function getAppearance(): AppAppearance {
  return document.documentElement.dataset.appearance === 'dark' ? 'dark' : 'light';
}

export function setAppearance(appearance: AppAppearance) {
  document.documentElement.dataset.appearance = appearance;
  try {
    window.localStorage.setItem(appearanceStorageKey, appearance);
  } catch {
    // The active theme still works with browser storage turned off.
  }
  window.dispatchEvent(new Event(appearanceChange));
}

export function subscribeAppearance(notify: () => void) {
  window.addEventListener(appearanceChange, notify);
  return () => window.removeEventListener(appearanceChange, notify);
}
