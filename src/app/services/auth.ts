import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  userName: string;
  email: string;
  password: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly loginUrl = new URL('Login/login', environment.backendUrl).toString();
  private readonly registerUrl = new URL('Account/register', environment.backendUrl).toString();
  private readonly sessionUrl = new URL('Account/me', environment.backendUrl).toString();
  private readonly logoutUrl = new URL('Login/logout', environment.backendUrl).toString();

  login(request: LoginRequest): Observable<unknown> {
    return this.http.post(this.loginUrl, request, { withCredentials: true });
  }

  register(request: RegisterRequest): Observable<unknown> {
    return this.http.post(this.registerUrl, request, { withCredentials: true });
  }

  getSession(): Observable<unknown> {
    return this.http.get(this.sessionUrl, { withCredentials: true });
  }

  logout(): Observable<unknown> {
    return this.http.post(this.logoutUrl, null, { withCredentials: true });
  }
}
