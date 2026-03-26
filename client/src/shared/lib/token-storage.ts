const STORAGE_KEY = 'mini-notion:access-token';

export const tokenStorage = {
  get(): string | null {
    return window.localStorage.getItem(STORAGE_KEY);
  },

  set(token: string): void {
    window.localStorage.setItem(STORAGE_KEY, token);
  },

  clear(): void {
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
