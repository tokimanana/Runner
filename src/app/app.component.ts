import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HotelSelectorComponent } from './components/hotel-selector/hotel-selector.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ContentEditorComponent } from './components/content-editor/content-editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HotelSelectorComponent, NavigationComponent, ContentEditorComponent],
  template: `
    <div class="app-container">
      <header>
        <div class="header-content">
          <h1>Hotel Management Console</h1>
          <app-hotel-selector></app-hotel-selector>
        </div>
        <app-navigation></app-navigation>
      </header>
      
      <main class="main-content">
        <app-content-editor></app-content-editor>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f8fafc;
    }

    .header-content {
      background: #ffffff;
      padding: 1.25rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      margin-bottom: 0.75rem;
      border: 1px solid #f0f0f0;
    }

    header {
      margin-bottom: 0.75rem;
    }

    h1 {
      color: #1e293b;
      margin-bottom: 1rem;
      font-size: 1.75rem;
      font-weight: 600;
    }

    .main-content {
      flex: 1;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      padding: 1.5rem;
      border: 1px solid #f0f0f0;
    }

    @media (max-width: 768px) {
      .app-container {
        padding: 1rem;
      }

      .header-content {
        padding: 1rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class App {
  name = 'Hotel Management Console';
}