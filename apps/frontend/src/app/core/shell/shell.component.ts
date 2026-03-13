import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="flex h-screen">
      <main class="flex-1 overflow-auto p-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ShellComponent {}
