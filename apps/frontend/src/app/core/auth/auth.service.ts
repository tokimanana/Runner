import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { isLoginResponse, LoginResponse } from './models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<unknown>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        map((data) => {
          if (!isLoginResponse(data)) {
            console.error(
              '[AuthService.login] API contract violation — expected LoginResponse shape',
              data
            );
            throw new Error('Authentication failed. Please try again.');
          }
          return data;
        })
      );
  }

  logout(): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/auth/logout`,
      {},
      {
        withCredentials: true,
      }
    );
  }

  refresh(): Observable<LoginResponse> {
    return this.http
      .post<unknown>(
        `${this.apiUrl}/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      )
      .pipe(
        map((data): LoginResponse => {
          if (!isLoginResponse(data)) {
            console.error(
              '[AuthService.refresh] API contract violation — expected LoginResponse shape',
              data
            );
            throw new Error('Session expired. Please login again.');
          }
          return data;
        })
      );
  }
}
