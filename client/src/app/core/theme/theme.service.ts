import { Injectable, signal, computed, effect } from '@angular/core';

export type ThemeMode = 'dark' | 'light';

const THEME_KEY = 'gloria_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _mode = signal<ThemeMode>(
    (localStorage.getItem(THEME_KEY) as ThemeMode) || 'dark'
  );

  readonly mode = this._mode.asReadonly();
  readonly isDark = computed(() => this._mode() === 'dark');

  constructor() {
    effect(() => {
      const mode = this._mode();
      localStorage.setItem(THEME_KEY, mode);
      document.body.classList.toggle('dark-theme', mode === 'dark');
      document.body.classList.toggle('light-theme', mode === 'light');
    });
  }

  toggle(): void {
    this._mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  setMode(mode: ThemeMode): void {
    this._mode.set(mode);
  }
}
