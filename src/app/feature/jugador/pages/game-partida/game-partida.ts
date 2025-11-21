import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import {
  PartidaS,
  EstadoPartidaDto,
  ParticipanteDto,
  PartidaEstado,
  TurnoRequest,
} from '../../services/partida/partida-s';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-game-partida',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './game-partida.html',
  styleUrl: './game-partida.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamePartida implements OnInit, OnDestroy {
  partidaId!: number;
  partida: EstadoPartidaDto | null = null;

  loading = false;
  autoRefreshMs = 1500;
  private intervalId: any = null;

  // Mapa: layout en líneas + diccionario posición → participantes
  participantsByPos = new Map<string, ParticipanteDto[]>();

  // Para tabla lateral de participantes
  participantesColumns: string[] = ['jugador', 'barco', 'estado', 'pos'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private partidaS: PartidaS,
    private cdr: ChangeDetectorRef
  ) {}

  // ───────────────── lifecycle ─────────────────
  ngOnInit(): void {
    // leer /inicio/partidas/:id/game
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam || isNaN(Number(idParam))) {
      Swal.fire({
        icon: 'error',
        title: 'Partida inválida',
        text: 'El ID de partida en la URL no es válido.',
      }).then(() => this.router.navigate(['/inicio/partidas']));
      return;
    }

    this.partidaId = Number(idParam);
    this.loadEstado(true);
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  // ───────────────── helpers de sesión ─────────────────
  private decodeUsuarioIdFromToken(): number | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      const payload = JSON.parse(payloadJson);

      if (payload.sub) {
        return Number(payload.sub);
      }
      if (payload.userId) {
        return Number(payload.userId);
      }
      return null;
    } catch {
      return null;
    }
  }

  get currentUsuarioId(): number | null {
    return this.decodeUsuarioIdFromToken();
  }

  get miParticipante(): ParticipanteDto | null {
    if (!this.partida || !this.partida.participantes) return null;
    const uid = this.currentUsuarioId;
    if (!uid) return null;
    return this.partida.participantes.find((p) => p.usuarioId === uid) ?? null;
  }

  get puedoJugar(): boolean {
    const p = this.partida;
    const me = this.miParticipante;
    if (!p || !me) return false;
    if (p.estado !== 'RUNNING') return false;
    if (!me.vivo || me.llegoMeta) return false;
    return true;
  }

  // ¿Soy host de esta partida?
  get esHost(): boolean {
    if (!this.partida) return false;
    const uid = this.currentUsuarioId;
    return uid != null && this.partida.hostUsuarioId === uid;
  }

  private setLoading(value: boolean): void {
    this.loading = value;
    this.cdr.markForCheck();
  }

  private setPartida(estado: EstadoPartidaDto | null): void {
    this.partida = estado;
    this.rebuildParticipantsPos();
    this.handleAutoRefresh();
    this.cdr.markForCheck();
  }

  // ───────────────── cargar estado ─────────────────
  loadEstado(initial = false): void {
    this.setLoading(true);
    this.partidaS.getEstado(this.partidaId).subscribe({
      next: (estado) => {
        this.setLoading(false);
        this.setPartida(estado);

        // Si entras a una partida en WAITING y no eres participante → solo observas
        if (initial && estado.estado === 'WAITING') {
          const me = this.miParticipante;
          if (!me) {
            Swal.fire({
              icon: 'info',
              title: 'Partida en espera',
              text: 'La partida aún no ha iniciado o no te has unido desde el lobby.',
            });
          }
        }
      },
      error: (err) => {
        console.error('Error cargando estado de partida en game', err);
        this.setLoading(false);
        this.setPartida(null);
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cargar la partida',
          text:
            err?.error?.message ||
            `No se encontró la partida con ID ${this.partidaId}.`,
        }).then(() => this.router.navigate(['/inicio/partidas']));
      },
    });
  }

  // ───────────────── auto-refresh (polling simple) ─────────────────
  private handleAutoRefresh(): void {
    const estado = this.partida?.estado;

    // Sin estado o partida finalizada → no refrescamos
    if (!estado || estado === 'FINISHED') {
      this.stopAutoRefresh();
      return;
    }

    // WAITING o RUNNING → mantener polling activo
    this.startAutoRefresh();
  }

  private startAutoRefresh(): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.partidaS.getEstado(this.partidaId).subscribe({
        next: (estado) => {
          this.setPartida(estado);
        },
        error: (err) => {
          console.error('Error en auto-refresh de partida', err);
        },
      });
    }, this.autoRefreshMs);
  }

  private stopAutoRefresh(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ───────────────── mapa / posiciones ─────────────────
  private rebuildParticipantsPos(): void {
    this.participantsByPos.clear();
    if (!this.partida) return;
    if (!this.partida.participantes) return;

    for (const p of this.partida.participantes) {
      if (!p.vivo) continue; // barcos muertos no aparecen en el mapa
      const key = `${p.posX},${p.posY}`;
      const list = this.participantsByPos.get(key) ?? [];
      list.push(p);
      this.participantsByPos.set(key, list);
    }
  }

  getRows(): string[] {
    return this.partida?.layout ?? [];
  }

  getChars(row: string): string[] {
    return row.split('');
  }

  getParticipantsAt(x: number, y: number): ParticipanteDto[] {
    const key = `${x},${y}`;
    return this.participantsByPos.get(key) ?? [];
  }

  hasParticipantsAt(x: number, y: number): boolean {
    return this.getParticipantsAt(x, y).length > 0;
  }

  cellClass(char: string): string {
    switch (char) {
      case 'X':
        return 'cell-wall';
      case '.':
        return 'cell-water';
      case 'P':
        return 'cell-start';
      case 'M':
      case 'm':
        return 'cell-goal';
      default:
        return 'cell-water';
    }
  }

  // ───────────────── iniciar partida (host) ─────────────────
  onIniciarPartida(): void {
    if (!this.partida) return;

    if (this.partida.estado !== 'WAITING') {
      Swal.fire({
        icon: 'info',
        title: 'Estado inválido',
        text: 'Solo puedes iniciar partidas que estén en WAITING.',
      });
      return;
    }

    if (!this.esHost) {
      Swal.fire({
        icon: 'error',
        title: 'No eres el host',
        text: 'Solo el host puede iniciar la partida.',
      });
      return;
    }

    const numJugadores = this.partida.participantes?.length ?? 0;
    if (numJugadores < 2) {
      Swal.fire({
        icon: 'warning',
        title: 'Jugadores insuficientes',
        text: 'Se requieren al menos 2 jugadores para iniciar la partida.',
      });
      return;
    }

    this.setLoading(true);
    this.partidaS.startPartida(this.partidaId).subscribe({
      next: (estado) => {
        this.setLoading(false);
        this.setPartida(estado);

        Swal.fire({
          icon: 'success',
          title: 'Partida iniciada',
          timer: 1500,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        console.error('Error iniciando partida (game)', err);
        this.setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            err?.error?.message ||
            'No se pudo iniciar la partida. Verifica el número de jugadores.',
        });
      },
    });
  }

  // ───────────────── enviar turno (movimiento) ─────────────────
  onEnviarTurno(accX: number, accY: number): void {
    if (!this.puedoJugar || !this.partida || !this.miParticipante) {
      return;
    }

    // No enviamos 0,0
    if (accX === 0 && accY === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Movimiento vacío',
        text: 'Debes elegir una aceleración distinta de (0,0).',
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const body: TurnoRequest = {
      participanteId: this.miParticipante.id,
      accX,
      accY,
    };

    this.setLoading(true);
    this.partidaS.enviarTurno(this.partidaId, body).subscribe({
      next: (estado) => {
        this.setLoading(false);
        this.setPartida(estado);
      },
      error: (err) => {
        console.error('Error enviando turno', err);
        this.setLoading(false);
        Swal.fire({
          icon: 'error',
          title: 'Movimiento inválido',
          text:
            err?.error?.message ||
            'No se pudo aplicar el movimiento. Verifica las reglas del modelo de barco.',
        });
      },
    });
  }

  // ───────────────── helpers de vista ─────────────────
  estadoLabel(): string {
    const p = this.partida;
    if (!p) return '';
    switch (p.estado as PartidaEstado) {
      case 'WAITING':
        return 'Esperando jugadores';
      case 'RUNNING':
        return 'En curso';
      case 'FINISHED':
        return 'Finalizada';
      default:
        return p.estado;
    }
  }

  isMine(p: ParticipanteDto): boolean {
    const uid = this.currentUsuarioId;
    if (!uid) return false;
    return p.usuarioId === uid;
  }

  backToLobby(): void {
    // ajusta este path si cambiaste el prefijo en tus rutas
    this.router.navigate(['/inicio/partidas']);
  }
}
