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
    loadComponent: () =>
      import('./seasons/seasons.component').then((m) => m.SeasonsComponent),
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
        path: 'create',
        loadComponent: () =>
          import('./seasons/seasons-form/seasons-form.component').then(
            (m) => m.SeasonsFormComponent
          ),
      },
      {
        path: ':seasonId/edit',
        loadComponent: () =>
          import('./seasons/seasons-form/seasons-form.component').then(
            (m) => m.SeasonsFormComponent
          ),
      },
    ],
  },
];
