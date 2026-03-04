import { inject, Injectable } from '@angular/core';
import { environment } from '@/environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginResponse } from './models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly http = inject(HttpClient);

  login(email: string, password: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      email,
      password,
    });
  }
}
