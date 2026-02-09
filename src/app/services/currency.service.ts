import { Injectable, signal } from '@angular/core';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Taux par rapport à l'EUR (base)
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private currencies: Currency[] = [
    { code: 'EUR', symbol: '€', name: 'Euro', rate: 1 },
    { code: 'USD', symbol: '$', name: 'Dollar américain', rate: 1.09 },
    { code: 'XAF', symbol: 'FCFA', name: 'Franc CFA', rate: 655.96 },
    { code: 'GBP', symbol: '£', name: 'Livre sterling', rate: 0.86 },
    { code: 'JPY', symbol: '¥', name: 'Yen japonais', rate: 161.78 },
    { code: 'CHF', symbol: 'CHF', name: 'Franc suisse', rate: 0.94 }
  ];

  private currentCurrency = signal<Currency>(this.loadCurrency());

  getCurrencies(): Currency[] {
    return this.currencies;
  }

  getCurrentCurrency() {
    return this.currentCurrency.asReadonly();
  }

  setCurrency(code: string) {
    const currency = this.currencies.find(c => c.code === code);
    if (currency) {
      this.currentCurrency.set(currency);
      this.saveCurrency(currency);
    }
  }

  convertAmount(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
    // Convertir d'abord en EUR (base), puis vers la devise cible
    const amountInEUR = amount / fromCurrency.rate;
    return amountInEUR * toCurrency.rate;
  }

  private saveCurrency(currency: Currency) {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('currency', JSON.stringify(currency));
    }
  }

  private loadCurrency(): Currency {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('currency');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return this.currencies[0]; // EUR par défaut
  }
}
