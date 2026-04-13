import { DOCUMENT } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ButtonModule, TooltipModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  private readonly storageKey = 'runner-theme';
  readonly isDark = signal(false);

  constructor() {
    const saved = this.document.defaultView?.localStorage.getItem(
      this.storageKey
    );
    this.isDark.set(saved === 'dark');

    effect(() => {
      this.document.body.classList.toggle('dark-mode', this.isDark());
      this.document.defaultView?.localStorage.setItem(
        this.storageKey,
        this.isDark() ? 'dark' : 'light'
      );
    });
  }

  toggleTheme(): void {
    this.isDark.update((v) => !v);
  }
}
