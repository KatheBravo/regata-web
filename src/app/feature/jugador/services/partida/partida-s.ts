// src/app/feature/jugador/services/partida/partida-s.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class PartidaS {
  // Base: http://localhost:8080/api/partidas  (según tu environment.apiUrl)
  private readonly baseUrl = `${environment.apiUrl}/api/partidas`;

  constructor(private http: HttpClient) {}

  // ==========================
  //          REST
  // ==========================

  // POST /api/partidas
  // Debe coincidir con CreatePartidaRequest (backend)
  crearPartida(body: CreatePartidaRequest): Observable<EstadoPartidaDto> {
    return this.http.post<EstadoPartidaDto>(this.baseUrl, body);
  }

  // GET /api/partidas
  // Lista partidas disponibles (necesitas el endpoint en backend)
  listPartidas(): Observable<EstadoPartidaDto[]> {
    return this.http.get<EstadoPartidaDto[]>(this.baseUrl);
  }

  // POST /api/partidas/{id}/join
  joinPartida(
    partidaId: number,
    body: JoinPartidaRequest
  ): Observable<EstadoPartidaDto> {
    return this.http.post<EstadoPartidaDto>(
      `${this.baseUrl}/${partidaId}/join`,
      body
    );
  }

  // POST /api/partidas/{id}/start
  startPartida(partidaId: number): Observable<EstadoPartidaDto> {
    return this.http.post<EstadoPartidaDto>(
      `${this.baseUrl}/${partidaId}/start`,
      {}
    );
  }

  // GET /api/partidas/{id}/estado
  getEstado(partidaId: number): Observable<EstadoPartidaDto> {
    return this.http.get<EstadoPartidaDto>(
      `${this.baseUrl}/${partidaId}/estado`
    );
  }

  // POST /api/partidas/{id}/turno
  enviarTurno(
    partidaId: number,
    body: TurnoRequest
  ): Observable<EstadoPartidaDto> {
    return this.http.post<EstadoPartidaDto>(
      `${this.baseUrl}/${partidaId}/turno`,
      body
    );
  }
}

/**
 * Debe reflejar CreatePartidaRequest de Java:
 *
 * public class CreatePartidaRequest {
 *   private String nombre;
 *   private Long mapaId;         // opcional (si null → backend toma el primer mapa)
 *   @Min(2)
 *   private Integer maxJugadores;
 *   @NotNull
 *   private Long hostUsuarioId;  // 👈 obligatorio
 * }
 */
export interface CreatePartidaRequest {
  nombre?: string;
  mapaId?: number;
  maxJugadores?: number;
  // IMPORTANTE: tu backend lo exige → mándalo siempre
  hostUsuarioId: number;
}

/**
 * JoinPartidaRequest:
 *   @NotNull Long usuarioId;
 *   @NotNull Long barcoId;
 */
export interface JoinPartidaRequest {
  usuarioId: number;
  barcoId: number;
}

/**
 * TurnoRequest:
 *   @NotNull Long participanteId;
 *   @NotNull Integer accX;
 *   @NotNull Integer accY;
 */
export interface TurnoRequest {
  participanteId: number;
  accX: number;
  accY: number;
}

/**
 * ParticipanteDto del backend.
 */
export interface ParticipanteDto {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  barcoId: number;
  barcoNombre: string;
  posX: number;
  posY: number;
  velX: number;
  velY: number;
  vivo: boolean;
  llegoMeta: boolean;
  orden: number;
}

/**
 * EstadoPartidaDto del backend.
 *
 * Tiene:
 * - id, nombre, estado (WAITING/RUNNING/FINISHED)
 * - mapaNombre
 * - layout (array de líneas ASCII)
 * - maxJugadores
 * - ganadorParticipanteId (puede ser null)
 * - hostUsuarioId / hostUsuarioNombre (pueden ser null)
 * - participantes: ParticipanteDto[]
 */
export type PartidaEstado = 'WAITING' | 'RUNNING' | 'FINISHED';

export interface EstadoPartidaDto {
  id: number;
  nombre: string;
  estado: PartidaEstado;
  mapaNombre: string;
  layout: string[];
  maxJugadores: number;
  ganadorParticipanteId: number | null;
  hostUsuarioId: number | null;
  hostUsuarioNombre: string | null;
  participantes: ParticipanteDto[];
}
