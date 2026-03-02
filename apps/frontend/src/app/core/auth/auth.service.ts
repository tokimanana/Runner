import { inject, Injectable } from '@angular/core';
import { environment } from '@/environments/environment.prod';
import { HttpClient } from '@angular/common/http';
import { LoginRsponse } from './models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  private accessToken: string | null = null;

  login(email: string, password: string) {
    return this.http.post<LoginRsponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
    });
  }

  logout(): void {
    this.accessToken = null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }
}
