import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly isDark = signal(false);

  constructor() {
    const saved = localStorage.getItem('runner-theme');
    this.isDark.set(saved === 'dark');

    effect(() => {
      document.documentElement.classList.toggle('app-dark', this.isDark());
      localStorage.setItem('runner-theme', this.isDark() ? 'dark' : 'light');
    });
  }

  toggle(): void {
    this.isDark.update((v) => !v);
  }
}
