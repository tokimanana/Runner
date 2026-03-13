import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { redirectIfAuthenticatedGuard } from './core/guards/redirect-if-authenticated.guard';

export const routes: Routes = [
  {
    path: 'login',
    canMatch: [redirectIfAuthenticatedGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'login',
    redirectTo: '/dashboard',
  },
  {
    path: '',
    loadComponent: () =>
      import('./core/shell/shell.component').then((m) => m.ShellComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
