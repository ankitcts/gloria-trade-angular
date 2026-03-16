import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyFormat', standalone: true })
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, currency = 'USD', compact = false): string {
    if (value == null) return '--';

    if (compact) {
      if (Math.abs(value) >= 1_000_000_000) {
        return `${this.symbol(currency)}${(value / 1_000_000_000).toFixed(2)}B`;
      }
      if (Math.abs(value) >= 1_000_000) {
        return `${this.symbol(currency)}${(value / 1_000_000).toFixed(2)}M`;
      }
      if (Math.abs(value) >= 1_000) {
        return `${this.symbol(currency)}${(value / 1_000).toFixed(2)}K`;
      }
    }

    return `${this.symbol(currency)}${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private symbol(currency: string): string {
    const symbols: Record<string, string> = { INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3' };
    return symbols[currency] || currency + ' ';
  }
}
