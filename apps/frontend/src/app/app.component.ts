import { Component, signal, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DOCUMENT } from '@angular/common';
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
  readonly isDark = signal(false);

  constructor() {
    effect(() => {
      this.document.body.classList.toggle('dark-mode', this.isDark());
    });
  }

  toggleTheme(): void {
    this.isDark.update((v) => !v);
  }
}
