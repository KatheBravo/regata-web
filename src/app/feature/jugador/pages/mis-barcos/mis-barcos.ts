import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  BarcosS,
  BarcoDto,
  CreateBarcoRequest,
  PatchBarcoRequest,
} from '../../services/barcos/barcos-s';

import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Validators } from '@angular/forms';
import Swal from 'sweetalert2';

import { DynamicFormDialog } from '../../../../shared/dynamic-form-dialog/dynamic-form-dialog';

@Component({
  selector: 'app-mis-barcos',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './mis-barcos.html',
  styleUrl: './mis-barcos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisBarcos implements OnInit {
  displayedColumns: string[] = ['nombre', 'modelo', 'posicion', 'velocidad', 'acciones'];
  barcos: BarcoDto[] = [];
  loading = false;

  constructor(
    private barcosS: BarcosS,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBarcos();
  }

  // ==========================
  //   Helpers
  // ==========================
  private getUsuarioId(): number | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      // ajusta según cómo tengas el JWT (sub / userId / etc.)
      return payload.sub ? Number(payload.sub) : null;
    } catch {
      return null;
    }
  }

  loadBarcos(): void {
    const usuarioId = this.getUsuarioId();
    if (!usuarioId) {
      this.barcos = [];
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();

    this.barcosS.listBarcos(usuarioId).subscribe({
      next: (data) => {
        this.barcos = data || [];
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error cargando barcos del jugador', err);
        this.loading = false;
        this.cdr.markForCheck();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar tus barcos.',
        });
      },
    });
  }

  // ==========================
  //   Crear barco
  // ==========================
  onCreateBarco(): void {
    const usuarioId = this.getUsuarioId();
    if (!usuarioId) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión inválida',
        text: 'No se pudo identificar al usuario para crear el barco.',
      });
      return;
    }

    const dialogRef = this.dialog.open(DynamicFormDialog, {
      width: '480px',
      data: {
        model: {
          nombre: '',
          modeloId: null,
          posX: 0,
          posY: 0,
          velX: 0,
          velY: 0,
        },
        title: 'Crear barco',
        icon: 'directions_boat',
        labels: {
          nombre: 'Nombre del barco',
          modeloId: 'ID del modelo',
          posX: 'Posición X inicial',
          posY: 'Posición Y inicial',
          velX: 'Velocidad X inicial',
          velY: 'Velocidad Y inicial',
        },
        fieldConfig: {
          nombre: {
            type: 'text',
            validators: [Validators.required, Validators.minLength(2)],
          },
          modeloId: {
            type: 'number',
            validators: [Validators.required],
          },
          posX: {
            type: 'number',
          },
          posY: {
            type: 'number',
          },
          velX: {
            type: 'number',
          },
          velY: {
            type: 'number',
          },
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload: CreateBarcoRequest = {
        nombre: result.nombre ?? 'Barco',
        usuarioId,
        modeloId: Number(result.modeloId),
        posX: result.posX !== undefined && result.posX !== null ? Number(result.posX) : 0,
        posY: result.posY !== undefined && result.posY !== null ? Number(result.posY) : 0,
        velX: result.velX !== undefined && result.velX !== null ? Number(result.velX) : 0,
        velY: result.velY !== undefined && result.velY !== null ? Number(result.velY) : 0,
      };

      this.barcosS.createBarco(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Barco creado',
            timer: 1800,
            showConfirmButton: false,
          });
          this.loadBarcos();
        },
        error: (err) => {
          console.error('Error creando barco', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear el barco.',
          });
        },
      });
    });
  }

  // ==========================
  //   Editar barco
  // ==========================
  onEditBarco(barco: BarcoDto): void {
    const dialogRef = this.dialog.open(DynamicFormDialog, {
      width: '480px',
      data: {
        model: {
          id: barco.id,
          nombre: barco.nombre,
          modeloId: barco.modeloId,
          posX: barco.posX,
          posY: barco.posY,
          velX: barco.velX,
          velY: barco.velY,
        },
        title: 'Editar barco',
        icon: 'edit',
        labels: {
          nombre: 'Nombre del barco',
          modeloId: 'ID del modelo',
          posX: 'Posición X',
          posY: 'Posición Y',
          velX: 'Velocidad X',
          velY: 'Velocidad Y',
        },
        readonlyFields: ['id'],
        fieldConfig: {
          nombre: {
            type: 'text',
            validators: [Validators.required, Validators.minLength(2)],
          },
          modeloId: {
            type: 'number',
            validators: [Validators.required],
          },
          posX: {
            type: 'number',
          },
          posY: {
            type: 'number',
          },
          velX: {
            type: 'number',
          },
          velY: {
            type: 'number',
          },
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload: PatchBarcoRequest = {
        nombre: result.nombre,
        modeloId: result.modeloId != null ? Number(result.modeloId) : undefined,
        posX: result.posX != null ? Number(result.posX) : null,
        posY: result.posY != null ? Number(result.posY) : null,
        velX: result.velX != null ? Number(result.velX) : null,
        velY: result.velY != null ? Number(result.velY) : null,
      };

      this.barcosS.updateBarcoPatch(barco.id, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Barco actualizado',
            timer: 1800,
            showConfirmButton: false,
          });
          this.loadBarcos();
        },
        error: (err) => {
          console.error('Error actualizando barco', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el barco.',
          });
        },
      });
    });
  }

  // ==========================
  //   Eliminar barco
  // ==========================
  onDeleteBarco(barco: BarcoDto): void {
    Swal.fire({
      title: '¿Eliminar barco?',
      text: `Se eliminará "${barco.nombre}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((res) => {
      if (!res.isConfirmed) return;

      this.barcosS.deleteBarco(barco.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Barco eliminado',
            timer: 1800,
            showConfirmButton: false,
          });
          this.loadBarcos();
        },
        error: (err) => {
          console.error('Error eliminando barco', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el barco.',
          });
        },
      });
    });
  }
}
