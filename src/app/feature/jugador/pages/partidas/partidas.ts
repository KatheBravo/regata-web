// src/app/feature/jugador/pages/partidas/partidas.ts
import { BarcosS, BarcoDto } from './../../services/barcos/barcos-s';
import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  PartidaS,
  EstadoPartidaDto,
  CreatePartidaRequest,
  JoinPartidaRequest,
  PartidaEstado,
} from '../../services/partida/partida-s';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { DynamicFormDialog } from '../../../../shared/dynamic-form-dialog/dynamic-form-dialog';

@Component({
  selector: 'app-partidas',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDialogModule,
  ],
  templateUrl: './partidas.html',
  styleUrl: './partidas.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Partidas implements OnInit {
  // Partida seleccionada (detalle)
  partidaActual: EstadoPartidaDto | null = null;

  // Listado de partidas disponibles
  partidas: EstadoPartidaDto[] = [];

  loading = false;

  // columnas para la tabla de participantes (detalle)
  participantesColumns: string[] = ['jugador', 'barco', 'estado', 'pos'];

  // columnas para la tabla de partidas (listado)
  partidasColumns: string[] = [
    'id',
    'nombre',
    'estado',
    'jugadores',
    'host',
    'acciones',
  ];

  constructor(
    private partidaS: PartidaS,
    private barcosS: BarcosS,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  // ======== ciclo de vida =========
  ngOnInit(): void {
    // Al abrir la pantalla, cargamos el listado de partidas
    this.loadPartidas();
  }

  // ==========================
  //      Helpers usuario
  // ==========================
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

  get esHost(): boolean {
    if (!this.partidaActual) return false;
    const uid = this.currentUsuarioId;
    return uid != null && this.partidaActual.hostUsuarioId === uid;
  }

  private setLoading(value: boolean): void {
    this.loading = value;
    this.cdr.markForCheck();
  }

  private setPartidaActual(p: EstadoPartidaDto | null): void {
    this.partidaActual = p;
    this.cdr.markForCheck();
  }

  private setPartidas(list: EstadoPartidaDto[]): void {
    this.partidas = list || [];
    this.cdr.markForCheck();
  }

  // ==========================
  //   Carga de partidas
  // ==========================
  loadPartidas(): void {
    this.setLoading(true);
    this.partidaS.listPartidas().subscribe({
      next: (data) => {
        this.setLoading(false);
        this.setPartidas(data || []);
        // Opcional: si no hay partida seleccionada, selecciona la primera
        if (!this.partidaActual && this.partidas.length > 0) {
          this.setPartidaActual(this.partidas[0]);
        }
      },
      error: (err) => {
        console.error('Error listando partidas', err);
        this.setLoading(false);
        this.setPartidas([]);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las partidas disponibles.',
        });
      },
    });
  }

  // ==========================
  //     Crear partida
  // ==========================
  onCrearPartida(): void {
    const usuarioId = this.currentUsuarioId;
    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión inválida',
        text: 'No se pudo determinar tu usuario desde el token.',
      });
      return;
    }

    const dialogRef = this.dialog.open(DynamicFormDialog, {
      width: '460px',
      data: {
        model: {
          nombre: '',
          maxJugadores: 4,
        },
        title: 'Crear nueva partida',
        icon: 'sports_esports',
        labels: {
          nombre: 'Nombre de la partida',
          maxJugadores: 'Máx. jugadores (≥ 2)',
        },
        fieldConfig: {
          nombre: {
            type: 'text',
          },
          maxJugadores: {
            type: 'number',
            validators: [Validators.min(2)],
          },
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const body: CreatePartidaRequest = {
        nombre: result.nombre || undefined,
        maxJugadores:
          result.maxJugadores != null
            ? Number(result.maxJugadores)
            : undefined,
        hostUsuarioId: usuarioId, // para que el backend setee el host
      };

      this.setLoading(true);

      this.partidaS.crearPartida(body).subscribe({
        next: (estado) => {
          this.setLoading(false);

          // Añadimos la nueva partida al listado y la seleccionamos
          this.setPartidas([estado, ...this.partidas]);
          this.setPartidaActual(estado);

          Swal.fire({
            icon: 'success',
            title: 'Partida creada',
            text: `ID: ${estado.id}`,
            timer: 2000,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          console.error('Error creando partida', err);
          this.setLoading(false);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err?.error?.message || 'No se pudo crear la partida.',
          });
        },
      });
    });
  }

  // ==========================
  //   Seleccionar partida de la tabla
  // ==========================
  onSeleccionarPartida(partida: EstadoPartidaDto): void {
    if (!partida) return;
    this.cargarPartida(partida.id);
  }

  private cargarPartida(id: number): void {
    this.setLoading(true);
    this.partidaS.getEstado(id).subscribe({
      next: (estado) => {
        this.setLoading(false);
        this.setPartidaActual(estado);

        // Actualizar también la fila en el listado
        const idx = this.partidas.findIndex((p) => p.id === estado.id);
        if (idx >= 0) {
          const copia = [...this.partidas];
          copia[idx] = estado;
          this.setPartidas(copia);
        }
      },
      error: (err) => {
        console.error('Error cargando estado de partida', err);
        this.setLoading(false);
        this.setPartidaActual(null);
        Swal.fire({
          icon: 'error',
          title: 'No encontrada',
          text: `No se pudo cargar la partida con ID ${id}.`,
        });
      },
    });
  }

  // ==========================
  //   Refrescar estado actual
  // ==========================
  onRefrescarEstado(): void {
    if (!this.partidaActual) return;
    this.cargarPartida(this.partidaActual.id);
  }

  // ==========================
  //   Unirse a partida (desde tabla o detalle)
  // ==========================
  onUnirsePartida(partida?: EstadoPartidaDto): void {
    const target = partida ?? this.partidaActual;
    if (!target) return;

    if (target.estado !== 'WAITING') {
      Swal.fire({
        icon: 'warning',
        title: 'Partida en curso',
        text: 'Solo puedes unirte a partidas en estado WAITING.',
      });
      return;
    }

    const usuarioId = this.currentUsuarioId;
    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión inválida',
        text: 'No se pudo determinar tu usuario desde el token.',
      });
      return;
    }

    const yaDentro = target.participantes.some(
      (p) => p.usuarioId === usuarioId
    );
    if (yaDentro) {
      Swal.fire({
        icon: 'info',
        title: 'Ya estás en la partida',
        text: 'Ya figuras como participante de esta partida.',
      });
      return;
    }

    // 1) Cargar barcos del usuario
    this.setLoading(true);
    this.barcosS.listBarcos(usuarioId).subscribe({
      next: (barcos) => {
        this.setLoading(false);

        if (!barcos || barcos.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin barcos',
            text: 'No tienes barcos creados. Crea uno antes de unirte a una partida.',
          });
          return;
        }

        const options: Record<string, string> = {};
        barcos.forEach((b: BarcoDto) => {
          options[b.id.toString()] = `${b.nombre} — Modelo: ${b.modeloNombre}`;
        });

        // 2) Seleccionar barco desde SweetAlert
        Swal.fire({
          title: 'Selecciona tu barco',
          input: 'select',
          inputOptions: options,
          inputPlaceholder: 'Elige un barco',
          showCancelButton: true,
          confirmButtonText: 'Unirme',
          cancelButtonText: 'Cancelar',
        }).then((res) => {
          if (!res.isConfirmed || !res.value) return;

          const barcoId = Number(res.value);
          if (!Number.isFinite(barcoId)) return;

          const body: JoinPartidaRequest = {
            usuarioId,
            barcoId,
          };

          this.setLoading(true);
          this.partidaS.joinPartida(target.id, body).subscribe({
            next: (estado) => {
              this.setLoading(false);
              this.setPartidaActual(estado);

              // actualizar la fila en el listado
              const idx = this.partidas.findIndex((p) => p.id === estado.id);
              if (idx >= 0) {
                const copia = [...this.partidas];
                copia[idx] = estado;
                this.setPartidas(copia);
              }

              Swal.fire({
                icon: 'success',
                title: 'Te uniste a la partida',
                timer: 2000,
                showConfirmButton: false,
              });
            },
            error: (err) => {
              console.error('Error al unirse a la partida', err);
              this.setLoading(false);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text:
                  err?.error?.message ||
                  'No se pudo unir a la partida. Revisa el barco seleccionado.',
              });
            },
          });
        });
      },
      error: (err) => {
        this.setLoading(false);
        console.error('Error cargando barcos del jugador', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar tus barcos.',
        });
      },
    });
  }

  // ==========================
  //   Iniciar partida (host)
  // ==========================
  onIniciarPartida(): void {
    if (!this.partidaActual) return;

    if (this.partidaActual.estado !== 'WAITING') {
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

    this.setLoading(true);
    this.partidaS.startPartida(this.partidaActual.id).subscribe({
      next: (estado) => {
        this.setLoading(false);
        this.setPartidaActual(estado);

        const idx = this.partidas.findIndex((p) => p.id === estado.id);
        if (idx >= 0) {
          const copia = [...this.partidas];
          copia[idx] = estado;
          this.setPartidas(copia);
        }

        Swal.fire({
          icon: 'success',
          title: 'Partida iniciada',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        console.error('Error iniciando partida', err);
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

  // ==========================
  // helpers de vista
  // ==========================
  isWaiting(p: EstadoPartidaDto): boolean {
    return p.estado === 'WAITING';
  }

  canJoin(p: EstadoPartidaDto): boolean {
    const uid = this.currentUsuarioId;
    if (!uid) return false;
    if (p.estado !== 'WAITING') return false;
    if (p.participantes.some((x) => x.usuarioId === uid)) return false;
    return p.participantes.length < p.maxJugadores;
  }

  estadoLabel(p: EstadoPartidaDto): string {
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
}
