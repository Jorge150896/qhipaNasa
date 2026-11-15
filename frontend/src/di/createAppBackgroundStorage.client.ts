import { BrowserStorage } from '@/infrastructure/storage/BrowserStorage';
import type { KeyValueStorage } from '@/infrastructure/storage/KeyValueStorage';

export function createAppBackgroundStorage(): KeyValueStorage {
  return new BrowserStorage();
}
