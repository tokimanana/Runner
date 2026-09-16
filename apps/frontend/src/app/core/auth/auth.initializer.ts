import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, EMPTY, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { AuthActions } from './store/auth.actions';

export const authInitializer = () => {
  const store = inject(Store);
  const authService = inject(AuthService);

  return authService.refresh().pipe(
    tap((response) =>
      store.dispatch(
        AuthActions.refreshSuccess({
          user: response.user,
        })
      )
    ),
    catchError(() => EMPTY)
  );
};
