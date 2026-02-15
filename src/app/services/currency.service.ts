import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { StorageService } from './storage.service';
import { API_BASE_URL } from '../config/api.config';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

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
export class CurrencyService {
  private readonly http = inject(HttpClient);
  private readonly storageService = inject(StorageService);
  private readonly storageKey = 'currency';
  private readonly storageCurrencyCode = 'XAF';

  private currencies: Currency[] = [
    { code: 'EUR', symbol: 'EUR', name: 'Euro', rate: 1 },
    { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.09 },
    { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA', rate: 655.957 },
    { code: 'GBP', symbol: 'GBP', name: 'Pound Sterling', rate: 0.86 },
    { code: 'JPY', symbol: 'JPY', name: 'Japanese Yen', rate: 161.78 },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', rate: 0.94 }
  ];

  private currentCurrency = signal<Currency>(this.loadCurrency());

  getCurrencies(): Currency[] {
    return this.currencies;
  }

  getCurrentCurrency() {
    return this.currentCurrency.asReadonly();
  }

  getStorageCurrency(): Currency {
    return this.getCurrencyByCode(this.storageCurrencyCode) || this.currencies[0];
  }

  async setCurrency(code: string): Promise<void> {
    const currency = this.currencies.find((c) => c.code === code);
    if (!currency) {
      return;
    }

    this.currentCurrency.set(currency);
    this.storageService.setJson(this.storageKey, currency);

    await this.savePreferences(currency.code);
  }

  convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
    const amountInEUR = amount / fromCurrency.rate;
    return amountInEUR * toCurrency.rate;
  }

  convertDisplayToStorage(amount: number): number {
    return this.convertAmount(amount, this.currentCurrency(), this.getStorageCurrency());
  }

  convertStorageToDisplay(amount: number): number {
    return this.convertAmount(amount, this.getStorageCurrency(), this.currentCurrency());
  }

  async syncPreferencesFromApi(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<PreferencesData>>(`${API_BASE_URL}/preferences`)
      );

      const currency = this.currencies.find((item) => item.code === response.data.currency_code);
      if (currency) {
        this.currentCurrency.set(currency);
        this.storageService.setJson(this.storageKey, currency);
      }
    } catch {
      // Keep cached currency on transient backend errors.
    }
  }

  private async savePreferences(currencyCode: string): Promise<void> {
    const theme = this.storageService.getItem('theme') === 'dark' ? 'dark' : 'light';

    try {
      await firstValueFrom(
        this.http.put(`${API_BASE_URL}/preferences`, {
          currency_code: currencyCode,
          theme
        })
      );
    } catch {
      // Keep local preference even if backend is temporarily unavailable.
    }
  }

  private loadCurrency(): Currency {
    return this.storageService.getJson<Currency>(this.storageKey, this.getStorageCurrency());
  }

  private getCurrencyByCode(code: string): Currency | undefined {
    return this.currencies.find((item) => item.code === code);
  }
}
