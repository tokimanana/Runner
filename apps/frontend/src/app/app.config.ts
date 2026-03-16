import {
  ApplicationConfig,
  provideZoneChangeDetection,
  isDevMode,
  provideAppInitializer,
  inject,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, tap } from 'rxjs';

import { routes } from './app.routes';
import { AuthEffects } from './core/auth/store/auth.effects';
import { authReducer } from './core/auth/store/auth.reducer';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { AuthService } from './core/auth/auth.service';
import { AuthActions } from './core/auth/store/auth.actions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
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
    provideAppInitializer(() => {
      const store = inject(Store);
      const authService = inject(AuthService);

      return authService.refresh().pipe(
        tap((response) =>
          store.dispatch(
            AuthActions.loginSuccess({
              user: response.user,
              accessToken: response.access_token,
            })
          )
        ),
        catchError(() => EMPTY)
      );
    }),
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
