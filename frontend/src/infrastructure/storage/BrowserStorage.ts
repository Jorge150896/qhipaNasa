import type { KeyValueStorage } from './KeyValueStorage';
export class BrowserStorage implements KeyValueStorage {
  read(key: string) {
    return window.localStorage.getItem(key);
  }
  write(key: string, value: string) {
    window.localStorage.setItem(key, value);
  }
}
