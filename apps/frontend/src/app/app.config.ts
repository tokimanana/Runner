import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  isDevMode,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import { authInitializer } from './core/auth/auth.initializer';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { refreshInterceptor } from './core/auth/interceptors/refresh.interceptor';
import { AuthEffects } from './core/auth/store/auth.effects';
import { authReducer } from './core/auth/store/auth.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, refreshInterceptor])),
    provideAnimationsAsync(),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
    }),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
        },
      },
    }),
    provideAppInitializer(authInitializer),
  ],
};

// Simulation state — retirer avant merge
// {
//   initialState: {
//     auth: {
//       user: {
//         id: '1',
//         email: 'admin@runner.com',
//         firstName: 'Admin',
//         lastName: 'Runner',
//         role: 'ADMIN',
//         tourOperatorId: '1',
//       },
//       accessToken: 'fake-token',
//       isLoading: false,
//       error: null,
//     },
//   },
// }
