import { HttpHandlerFn, HttpRequest } from '@angular/common/http';

export const authInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  return next(req.clone({ withCredentials: true }));
};
