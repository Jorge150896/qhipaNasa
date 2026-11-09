export interface KeyValueStorage {
  read(key: string): string | null;
  write(key: string, value: string): void;
}
