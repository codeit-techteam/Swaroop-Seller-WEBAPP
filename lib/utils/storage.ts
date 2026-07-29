import { STORAGE_KEYS } from "@/lib/constants";

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === "undefined") return fallback;
    try {
      const item = window.localStorage.getItem(key);
      if (!item) return fallback;
      return JSON.parse(item) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === "undefined") return;
    window.localStorage.clear();
  },
};

export { STORAGE_KEYS };
