import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

export interface ModeloBarco {
  id: number;
  nombre: string;
  color: string;
  descripcion: string;
  velMax: number;
  acelMax: number;
  maniobrabilidad: number;
  creadoEn?: string;
  actualizadoEn?: string;
}


@Injectable({
  providedIn: 'root',
})
export class ModeloBarcoAdminS {
  // Ajusta el path a tu backend si es distinto
  private apiUrl = environment.apiUrl + '/api/modelos';

  constructor(private http: HttpClient) {}

  getModelos(): Observable<ModeloBarco[]> {
    return this.http.get<ModeloBarco[]>(this.apiUrl);
  }

  createModelo(
    body: Omit<ModeloBarco, 'id' | 'creadoEn' | 'actualizadoEn'>
  ): Observable<ModeloBarco> {
    return this.http.post<ModeloBarco>(this.apiUrl, body);
  }

  updateModelo(id: number, body: Partial<ModeloBarco>): Observable<ModeloBarco> {
    return this.http.put<ModeloBarco>(`${this.apiUrl}/${id}`, body);
  }

  patchModelo(id: number, body: Partial<ModeloBarco>): Observable<ModeloBarco> {
    return this.http.patch<ModeloBarco>(`${this.apiUrl}/${id}`, body);
  }

  deleteModelo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
