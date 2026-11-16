'use client';

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  defaultAppLanguage,
  isAppLanguage,
  type AppLanguage,
} from '@/domain/assistant/AppLanguage';
import { createAppPreferenceStorage } from '@/di/createAppPreferenceStorage.client';
import { translateAppText } from './translateAppText';

const key = 'astra.language.v1';

function createLanguageStore() {
  const storage = createAppPreferenceStorage();
  const listeners = new Set<() => void>();
  let current: AppLanguage | undefined;
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    snapshot() {
      if (current) return current;
      try {
        const saved = storage.read(key);
        return isAppLanguage(saved) ? saved : defaultAppLanguage;
      } catch {
        return defaultAppLanguage;
      }
    },
    select(language: AppLanguage) {
      current = language;
      try {
        storage.write(key, language);
      } catch {
        // The preference remains available for this visit.
      }
      listeners.forEach((listener) => listener());
    },
  };
}

const context = createContext<{
  language: AppLanguage;
  selectLanguage(language: AppLanguage): void;
}>({ language: 'es', selectLanguage() {} });

export function AppLanguageProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createLanguageStore);
  const language = useSyncExternalStore(store.subscribe, store.snapshot, () => defaultAppLanguage);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <context.Provider value={{ language, selectLanguage: store.select }}>
      {children}
    </context.Provider>
  );
}

export function useAppLanguage() {
  return useContext(context);
}

export function useTranslation() {
  const { language } = useAppLanguage();
  return useCallback(<T,>(value: T) => translateAppText(value, language), [language]);
}

export function LocalizedText({ children }: { children: string }) {
  const t = useTranslation();
  return t(children);
}
