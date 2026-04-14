import { Component, effect, signal } from '@angular/core';
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
  readonly isDark = signal(false);

  constructor() {
    const saved = localStorage.getItem('runner-theme');
    this.isDark.set(saved === 'dark');

    effect(() => {
      document.documentElement.classList.toggle('app-dark', this.isDark());
      localStorage.setItem('runner-theme', this.isDark() ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this.isDark.update((v) => !v);
  }
}
