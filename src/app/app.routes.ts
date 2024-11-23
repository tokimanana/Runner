import { Routes } from '@angular/router';
import { RatesConfigComponent } from './components/rates-config/rates-config.component';
import { ContentEditorComponent } from './components/content-editor/content-editor.component';
import { MarketConfigComponent } from './components/market-config/market-config.component';
import { CurrencyComponent } from './components/currency/currency.component';

export const routes: Routes = [
  { path: '', component: ContentEditorComponent },
  { path: 'markets', component: MarketConfigComponent },
  { path: 'currency', component: CurrencyComponent },
  { path: 'rates', component: RatesConfigComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];