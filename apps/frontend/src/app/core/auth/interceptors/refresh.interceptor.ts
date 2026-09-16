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
let refresh$ = new BehaviorSubject<boolean | null>(null);

export const refreshInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const store = inject(Store);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        req.url.includes('/auth/')
      )
        return throwError(() => error);

      if (!isRefreshing) {
        isRefreshing = true;
        refresh$.next(null);

        return authService.refresh().pipe(
          switchMap((response) => {
            isRefreshing = false;
            refresh$.next(true);
            store.dispatch(AuthActions.refreshSuccess({ user: response.user }));
            return next(req);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refresh$.error(refreshError);
            refresh$ = new BehaviorSubject<boolean | null>(null);
            store.dispatch(AuthActions.logout());
            return throwError(() => refreshError);
          })
        );
      }

      return refresh$.pipe(
        filter((value) => value !== null),
        take(1),
        switchMap(() => next(req))
      );
    })
  );
};
