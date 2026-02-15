import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { API_BASE_URL } from '../config/api.config';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

interface PreferencesData {
  currency_code: string;
  theme: 'light' | 'dark';
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly storageKey = 'theme';
  private isDark = signal<boolean>(this.loadTheme());

  constructor() {
    this.applyTheme();
  }

  getTheme() {
    return this.isDark.asReadonly();
  }

  async toggleTheme() {
    this.isDark.update((dark) => !dark);
    this.applyTheme();
    this.storageService.setItem(this.storageKey, this.isDark() ? 'dark' : 'light');

    await this.savePreferences();
  }

  private applyTheme() {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('dark-theme', this.isDark());
    }
  }

  async syncPreferencesFromApi(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<PreferencesData>>(`${API_BASE_URL}/preferences`)
      );

      const isDark = response.data.theme === 'dark';
      this.isDark.set(isDark);
      this.storageService.setItem(this.storageKey, isDark ? 'dark' : 'light');
      this.applyTheme();
    } catch {
      // Keep cached theme on transient backend errors.
    }
  }

  private async savePreferences(): Promise<void> {
    const currencyCode = this.storageService.getJson<any>('currency', { code: 'XAF' }).code || 'XAF';

    try {
      await firstValueFrom(
        this.http.put(`${API_BASE_URL}/preferences`, {
          currency_code: currencyCode,
          theme: this.isDark() ? 'dark' : 'light'
        })
      );
    } catch {
      // Keep local preference even if backend is temporarily unavailable.
    }
  }

  private loadTheme(): boolean {
    return this.storageService.getItem(this.storageKey) === 'dark';
  }
}
