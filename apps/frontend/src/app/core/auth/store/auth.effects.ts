import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../auth.service';
import { AuthActions } from './auth.actions';
import { Router } from '@angular/router';
import { catchError, EMPTY, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ email, password }) =>
        this.authService.login(email, password).pipe(
          map((userCredential) => {
            console.log('Effect: login success');
            return AuthActions.loginSuccess({
              user: userCredential.user,
              accessToken: userCredential.access_token,
            });
          }),
          catchError((error) => {
            return of(AuthActions.loginFailure({ error: error.message }));
          })
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        switchMap(() =>
          this.authService.logout().pipe(
            tap(() => void this.router.navigate(['/login'])),
            catchError(() => {
              void this.router.navigate(['/login']);
              return EMPTY;
            })
          )
        )
      ),
    { dispatch: false }
  );
}
