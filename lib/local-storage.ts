const STORAGE_PREFIX = 'ims';

export const storage = {
  getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(`${STORAGE_PREFIX}:${key}`);
    return item ? JSON.parse(item) : null;
  },

  setItem(key: string, value: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value));
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${STORAGE_PREFIX}:${key}`);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage)
      .filter(key => key.startsWith(`${STORAGE_PREFIX}:`))
      .forEach(key => localStorage.removeItem(key));
  }
};