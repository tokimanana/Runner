import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { AuthService } from '../auth.service';
import { AuthActions } from './auth.actions';
import { Router } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      tap(() => console.log('Effect: Login démarré')),
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
            console.log('Effect: login failed');
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
        tap(({ accessToken }) => {
          this.authService.setAccessToken(accessToken);
          this.router.navigate(['/dashboard']);
        })
      ),
    { dispatch: false }
  );

  // logout$ = createEffect(() =>
  //   this.actions$.pipe(
  //     ofType(AuthActions.logout),
  //     switchMap(() =>
  //       this.authService.logout().pipe(
  //         map(() => AuthActions.logoutSuccess()),
  //         tap(() => this.router.navigate(['/login']))
  //       )
  //     )
  //   )
  // );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.authService.logout();
          void this.router.navigate(['/login']);
        })
      ),
    { dispatch: false }
  );
}
