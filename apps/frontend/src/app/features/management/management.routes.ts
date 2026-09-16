import { Routes } from '@angular/router';

export const MANAGEMENT_ROUTES: Routes = [
  {
    path: 'hotels',
    loadComponent: () =>
      import('./hotels/hotels.component').then((m) => m.HotelsComponent),
    children: [
      {
        path: '',
        redirectTo: 'hotels-list',
        pathMatch: 'full',
      },
      {
        path: 'hotels-list',
        loadComponent: () =>
          import('./hotels/hotels-list/hotels-list.component').then(
            (m) => m.HotelsListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./hotels/hotels-form/hotels-form.component').then(
            (m) => m.HotelsFormComponent
          ),
      },
      {
        path: ':hotelId/edit',
        loadComponent: () =>
          import('./hotels/hotels-form/hotels-form.component').then(
            (m) => m.HotelsFormComponent
          ),
      },
    ],
  },
  {
    path: 'seasons',
    children: [
      {
        path: '',
        redirectTo: 'seasons-list',
        pathMatch: 'full',
      },
      {
        path: 'seasons-list',
        loadComponent: () =>
          import('./seasons/seasons-list/seasons-list.component').then(
            (m) => m.SeasonsListComponent
          ),
      },
      {
        path: ':seasonId',
        loadComponent: () =>
          import('./seasons/season-detail/season-detail.component').then(
            (m) => m.SeasonDetailComponent
          ),
      },
    ],
  },
  {
    path: 'meal-plans',
    loadComponent: () =>
      import('./meal-plans/meal-plans-list/meal-plans-list.component').then(
        (m) => m.MealPlansListComponent
      ),
  },
  {
    path: 'markets',
    loadComponent: () =>
      import('./markets/markets-list/markets-list.component').then(
        (m) => m.MarketsListComponent
      ),
  },
  {
    path: 'currencies',
    loadComponent: () =>
      import('./currencies/currencies-list/currencies-list.component').then(
        (m) => m.CurrenciesListComponent
      ),
  },
  {
    path: 'supplements',
    loadComponent: () =>
      import('./supplements/supplements-list/supplements-list.component').then(
        (m) => m.SupplementsListComponent
      ),
  },
  {
    path: 'contracts',
    children: [
      {
        path: '',
        redirectTo: 'contracts-list',
        pathMatch: 'full',
      },
      {
        path: 'contracts-list',
        loadComponent: () =>
          import('./contracts/contracts-list/contracts-list.component').then(
            (m) => m.ContractsListComponent
          ),
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./contracts/contract-form/contract-form.component').then(
            (m) => m.ContractFormComponent
          ),
      },
      {
        path: ':contractId/edit',
        loadComponent: () =>
          import('./contracts/contract-form/contract-form.component').then(
            (m) => m.ContractFormComponent
          ),
      },
    ],
  },
];
