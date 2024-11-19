import { Routes } from '@angular/router';
import { CurrencyComponent } from './components/currency/currency.component';
import { RatesConfigComponent } from './components/rates-config/rates-config.component';

export const routes: Routes = [
  { path: 'currency', component: CurrencyComponent },
  { path: 'rates', component: RatesConfigComponent },
  { path: '', redirectTo: '/currency', pathMatch: 'full' }
];