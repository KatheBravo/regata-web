import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  role?: string; // opcional, según tu backend
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = environment.apiUrl + '/api';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // =====================
  //  LOGIN
  // =====================
  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/login`, body)
      .pipe(
        tap((res) => {
          if (this.isBrowser()) {
            localStorage.setItem('accessToken', res.accessToken);
            if (res.refreshToken) {
              localStorage.setItem('refreshToken', res.refreshToken);
            } else {
              localStorage.removeItem('refreshToken');
            }
          }
        })
      );
  }

  // =====================
  //  REGISTER
  // =====================
  register(body: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, body)
      .pipe(
        tap((res) => {
          if (this.isBrowser()) {
            localStorage.setItem('accessToken', res.accessToken);
            if (res.refreshToken) {
              localStorage.setItem('refreshToken', res.refreshToken);
            } else {
              localStorage.removeItem('refreshToken');
            }
          }
        })
      );
  }

  // =====================
  //  HELPERS PARA EL INTERCEPTOR
  // =====================
  getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('refreshToken');
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
