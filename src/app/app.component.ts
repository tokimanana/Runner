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
        <h1>Hotel Management Console</h1>
        <app-hotel-selector></app-hotel-selector>
      </header>
      
      <div class="main-content">
        <app-navigation></app-navigation>
        <app-content-editor></app-content-editor>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem;
    }
    header {
      margin-bottom: 2rem;
    }
    h1 {
      color: #333;
      margin-bottom: 1rem;
    }
    .main-content {
      display: grid;
      grid-template-columns: 250px 1fr;
      gap: 2rem;
      min-height: calc(100vh - 200px);
    }
  `]
})
export class App {
  name = 'Hotel Management Console';
}