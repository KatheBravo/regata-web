import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  role?: string; // opcional, por si mandas PLAYER/ADMIN desde front
}

// 👇 coincide con el JSON que mostraste del backend
export interface AuthResponse {
  token: string;
  usuarioId: number;
  nombre: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  /**
   * Si en environment.apiUrl tienes 'http://localhost:8080'
   * esto queda 'http://localhost:8080/api'
   */
  private apiUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient) {}

  // =====================
  //  LOGIN
  // =====================
  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, body);
  }

  // =====================
  //  REGISTER
  // =====================
  register(body: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, body);
  }
}
