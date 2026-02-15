import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getItem(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(key);
  }

  getJson<T>(key: string, fallback: T): T {
    const raw = this.getItem(key);
    if (!raw) return fallback;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  setJson<T>(key: string, value: T): void {
    this.setItem(key, JSON.stringify(value));
  }

  clearKeys(keys: string[]): void {
    if (!this.isBrowser) return;
    keys.forEach((key) => localStorage.removeItem(key));
  }
}
