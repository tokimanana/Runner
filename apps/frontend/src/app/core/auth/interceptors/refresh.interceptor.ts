import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import {
  BehaviorSubject,
  catchError,
  filter,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { AuthService } from '../auth.service';
import { AuthActions } from '../store/auth.actions';

let isRefreshing = false;
const refreshToken$ = new BehaviorSubject<string | null>(null);

export const refreshInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const store = inject(Store);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !req.url.includes('/auth/')
      ) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshToken$.next(null);

          return authService.refresh().pipe(
            switchMap((response) => {
              isRefreshing = false;
              refreshToken$.next(response.access_token);
              store.dispatch(
                AuthActions.loginSuccess({
                  user: response.user,
                  accessToken: response.access_token,
                })
              );
              return next(
                req.clone({
                  headers: req.headers.set(
                    'Authorization',
                    `Bearer ${response.access_token}`
                  ),
                })
              );
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              store.dispatch(AuthActions.logout());
              return throwError(() => refreshError);
            })
          );
        }

        return refreshToken$.pipe(
          filter((token) => token !== null),
          take(1),
          switchMap((token) =>
            next(
              req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`),
              })
            )
          )
        );
      }

      return throwError(() => error);
    })
  );
};
