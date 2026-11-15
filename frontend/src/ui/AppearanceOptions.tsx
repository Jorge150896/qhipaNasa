'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { getAppearance, setAppearance, subscribeAppearance } from './appAppearance';

const defaultAppearance = () => 'light' as const;

export function AppearanceOptions() {
  const appearance = useSyncExternalStore(subscribeAppearance, getAppearance, defaultAppearance);
  return (
    <div
      className="assistant-mode assistant-appearance"
      role="group"
      aria-label="Apariencia de la app"
    >
      <span>Tema</span>
      <button
        type="button"
        aria-pressed={appearance === 'light'}
        onClick={() => setAppearance('light')}
      >
        <Sun aria-hidden="true" size={15} /> Claro
      </button>
      <button
        type="button"
        aria-pressed={appearance === 'dark'}
        onClick={() => setAppearance('dark')}
      >
        <Moon aria-hidden="true" size={15} /> Oscuro
      </button>
    </div>
  );
}
