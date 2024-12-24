import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		// Ignore health check endpoints to prevent console spam
		if (request.url.includes('.well-known/health')) {
			return next.handle(request).pipe(
				catchError((error: HttpErrorResponse) => {
					// Silently handle health check errors
					return throwError(() => error);
				})
			);
		}
		
		return next.handle(request);
	}
}