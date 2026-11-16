'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { createAppPreferenceStorage } from '@/di/createAppPreferenceStorage.client';
import { appBackgrounds, defaultAppBackground, type AppBackground } from './appBackground';

const storageKey = 'astra.appearance.background.v1';

function createBackgroundStore() {
  const storage = createAppPreferenceStorage();
  const listeners = new Set<() => void>();
  let sessionSelection: AppBackground | undefined;

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      if (sessionSelection !== undefined) return sessionSelection;
      try {
        const saved = storage.read(storageKey);
        return appBackgrounds.find(({ id }) => id === saved)?.id ?? defaultAppBackground;
      } catch {
        return defaultAppBackground;
      }
    },
    select(background: AppBackground) {
      sessionSelection = background;
      try {
        storage.write(storageKey, background);
      } catch {
        // The visual preference still applies for this visit.
      }
      listeners.forEach((listener) => listener());
    },
  };
}

const AppBackgroundContext = createContext<{
  background: AppBackground;
  selectBackground(background: AppBackground): void;
} | null>(null);

const getServerBackground = () => defaultAppBackground;

export function AppBackgroundProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createBackgroundStore);
  const background = useSyncExternalStore(store.subscribe, store.getSnapshot, getServerBackground);

  useEffect(() => {
    document.documentElement.dataset.appBackground = background;
  }, [background]);

  return (
    <AppBackgroundContext value={{ background, selectBackground: store.select }}>
      {children}
    </AppBackgroundContext>
  );
}

export function useAppBackground() {
  const value = useContext(AppBackgroundContext);
  if (!value) throw new Error('AppBackgroundProvider is required to customize the app background.');
  return value;
}
