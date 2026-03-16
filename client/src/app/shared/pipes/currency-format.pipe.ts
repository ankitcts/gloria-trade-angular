import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyFormat', standalone: true })
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, currency = 'INR', compact = false): string {
    if (value == null) return '--';

    if (compact) {
      if (Math.abs(value) >= 1_00_00_000) {
        return `${this.symbol(currency)}${(value / 1_00_00_000).toFixed(2)}Cr`;
      }
      if (Math.abs(value) >= 1_00_000) {
        return `${this.symbol(currency)}${(value / 1_00_000).toFixed(2)}L`;
      }
      if (Math.abs(value) >= 1_000) {
        return `${this.symbol(currency)}${(value / 1_000).toFixed(2)}K`;
      }
    }

    return `${this.symbol(currency)}${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private symbol(currency: string): string {
    const symbols: Record<string, string> = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3' };
    return symbols[currency] || currency + ' ';
  }
}
