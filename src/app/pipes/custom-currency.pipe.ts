import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'customCurrency',
  standalone: true,
  pure: false
})
export class CustomCurrencyPipe implements PipeTransform {
  private baseCurrency = { code: 'EUR', symbol: '€', name: 'Euro', rate: 1 };

  constructor(private currencyService: CurrencyService) {}

  transform(value: number, decimals: number = 2): string {
    const targetCurrency = this.currencyService.getCurrentCurrency()();
    
    if (value === null || value === undefined) {
      return '';
    }

    // Convertir le montant de EUR vers la devise cible
    const convertedValue = (value / this.baseCurrency.rate) * targetCurrency.rate;
    
    // Formater selon la devise
    let formatted: string;
    if (targetCurrency.code === 'XAF') {
      // Pour FCFA, pas de décimales
      formatted = Math.round(convertedValue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${formatted} ${targetCurrency.symbol}`;
    } else {
      formatted = convertedValue.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\.\d))/g, ' ');
      return `${targetCurrency.symbol}${formatted}`;
    }
  }
}
