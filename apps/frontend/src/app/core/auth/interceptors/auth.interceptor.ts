import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, switchMap, take } from 'rxjs';
import { selectAccessToken } from '../store/auth.selectors';

export function authInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const store = inject(Store);

  return store.select(selectAccessToken).pipe(
    take(1),
    switchMap((token) => {
      if (!token) return next(req);

      const newReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });

      return next(newReq);
    })
  );
}
