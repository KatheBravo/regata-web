import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class BarcosS {
  // http://localhost:8080/api/barcos  (según tu environment.apiUrl)
  private readonly baseUrl = `${environment.apiUrl}/api/barcos`;

  constructor(private http: HttpClient) {}

  // ==========================
  //          CRUD
  // ==========================

  // POST /api/barcos
  createBarco(body: CreateBarcoRequest): Observable<BarcoDto> {
    return this.http.post<BarcoDto>(this.baseUrl, body);
  }

  // GET /api/barcos/{id}
  getBarco(id: number): Observable<BarcoDto> {
    return this.http.get<BarcoDto>(`${this.baseUrl}/${id}`);
  }

  // GET /api/barcos?usuarioId=...
  listBarcos(usuarioId?: number): Observable<BarcoDto[]> {
    let params = new HttpParams();
    if (usuarioId != null) {
      params = params.set('usuarioId', usuarioId.toString());
    }
    return this.http.get<BarcoDto[]>(this.baseUrl, { params });
  }

  // PUT /api/barcos/{id}
  updateBarcoPut(id: number, body: UpdateBarcoRequest): Observable<BarcoDto> {
    return this.http.put<BarcoDto>(`${this.baseUrl}/${id}`, body);
  }

  // PATCH /api/barcos/{id}
  updateBarcoPatch(id: number, body: PatchBarcoRequest): Observable<BarcoDto> {
    return this.http.patch<BarcoDto>(`${this.baseUrl}/${id}`, body);
  }

  // DELETE /api/barcos/{id}
  deleteBarco(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

//
// ====== INTERFACES TIPADAS CON TUS DTOs JAVA ======
//

// BarcoDto
export interface BarcoDto {
  id: number;
  nombre: string;

  usuarioId: number;
  usuarioNombre: string;

  modeloId: number;
  modeloNombre: string;

  posX: number;
  posY: number;
  velX: number;
  velY: number;
}

// CreateBarcoRequest
export interface CreateBarcoRequest {
  nombre: string;
  usuarioId: number;
  modeloId: number;

  // opcionales; si no vienen, backend los puede poner en 0
  posX?: number | null;
  posY?: number | null;
  velX?: number | null;
  velY?: number | null;
}

// UpdateBarcoRequest (PUT → todo requerido)
export interface UpdateBarcoRequest {
  nombre: string;
  usuarioId: number;
  modeloId: number;

  posX: number;
  posY: number;
  velX: number;
  velY: number;
}

// PatchBarcoRequest (todo opcional)
export interface PatchBarcoRequest {
  nombre?: string;
  usuarioId?: number;
  modeloId?: number;

  posX?: number | null;
  posY?: number | null;
  velX?: number | null;
  velY?: number | null;
}
