import { Routes } from '@angular/router';
import { ContentEditorComponent } from './components/content-editor/content-editor.component';
import { MarketConfigComponent } from './components/market-config/market-config.component';
import { CurrencyComponent } from './components/currency/currency.component';
import { AgeCategoryComponent } from './components/age-category/age-category.component';
import { contractRoutes } from './components/contract/contract.routes';

export const routes: Routes = [
  { path: '', component: ContentEditorComponent },
  { path: 'markets', component: MarketConfigComponent },
  { path: 'currency', component: CurrencyComponent },
  { path: 'age-categories', component: AgeCategoryComponent },
  ...contractRoutes,
  { path: '**', redirectTo: '', pathMatch: 'full' }
];