import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

@Pipe({
  name: 'customCurrency',
  standalone: true,
  pure: false
})
export class CustomCurrencyPipe implements PipeTransform {
  constructor(private currencyService: CurrencyService) {}

  transform(value: number, decimals: number = 2): string {
    const targetCurrency = this.currencyService.getCurrentCurrency()();

    if (value === null || value === undefined || Number.isNaN(value)) {
      return '';
    }

    const convertedValue = this.roundAmount(this.currencyService.convertStorageToDisplay(value));

    if (targetCurrency.code === 'XAF') {
      const formatted = Math.round(convertedValue)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${formatted} ${targetCurrency.symbol}`;
    }

    const formatted = convertedValue
      .toFixed(decimals)
      .replace(/\B(?=(\d{3})+(?!\.\d))/g, ' ');

    if (targetCurrency.code === 'EUR') {
      return `${formatted} EUR`;
    }

    if (targetCurrency.symbol.length <= 3) {
      return `${targetCurrency.symbol}${formatted}`;
    }

    return `${formatted} ${targetCurrency.symbol}`;
  }

  private roundAmount(value: number): number {
    return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
  }
}

