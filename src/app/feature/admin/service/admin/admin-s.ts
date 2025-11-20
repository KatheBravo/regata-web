import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class AdminS {
  private apiUrl = environment.apiUrl + '/api';

  constructor(private http: HttpClient) { }

  getUsuarios(options?: {
    role?: string;
    activo?: boolean;
    q?: string;
  }): Observable<any[]> {
    const params: any = {};
    if (options?.role) params.role = options.role;
    if (options?.activo !== undefined) params.activo = options.activo;
    if (options?.q) params.q = options.q;

    return this.http.get<any[]>(`${this.apiUrl}/usuarios`, { params });
  }

  getUsuario(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuarios/${id}`);
  }

  createUsuario(body: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/usuarios`, body);
  }

  updateUsuario(id: number, body: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuarios/${id}`, body);
  }

  patchUsuario(id: number, body: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/usuarios/${id}`, body);
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/usuarios/${id}`);
  }
}
