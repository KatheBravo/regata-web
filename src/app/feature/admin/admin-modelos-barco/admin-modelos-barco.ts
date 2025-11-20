import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  ModeloBarco,
  ModeloBarcoAdminS,
} from './../service/modelo-barco-admin/modelo-barco-admin-s';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';

// Formularios / validaciones
import { Validators } from '@angular/forms';

// RxJS
import {
  Observable,
  Subject,
  of,
  startWith,
  switchMap,
  map,
  catchError,
} from 'rxjs';

// SweetAlert2
import Swal from 'sweetalert2';

// Dynamic form
import { DynamicFormDialog } from '../../../shared/dynamic-form-dialog/dynamic-form-dialog';

@Component({
  selector: 'app-admin-modelos-barco',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
  ],
  templateUrl: './admin-modelos-barco.html',
  styleUrl: './admin-modelos-barco.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminModelosBarco implements OnInit {
  // 👇 columnas alineadas con el JSON real
  displayedColumns: string[] = [
    'nombre',
    'color',
    'velMax',
    'acelMax',
    'maniobrabilidad',
    'acciones',
  ];

  modelos$!: Observable<ModeloBarco[]>;
  private readonly reload$ = new Subject<void>();

  constructor(
    private modeloS: ModeloBarcoAdminS,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // OnPush + observable → sin NG0100 y se carga al instante
    this.modelos$ = this.reload$.pipe(
      startWith(void 0),
      switchMap(() =>
        this.modeloS.getModelos().pipe(
          map((data) => data || []),
          catchError((err) => {
            console.error('Error cargando modelos de barco', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error cargando modelos de barco.',
            });
            return of([]);
          })
        )
      )
    );
  }

  private reload(): void {
    this.reload$.next();
  }

  // ==========================
  //  Crear modelo
  // ==========================
  onCreateModelo(): void {
    const dialogRef = this.dialog.open(DynamicFormDialog, {
      width: '480px',
      data: {
        model: {
          nombre: '',
          color: '#000000',
          descripcion: '',
          velMax: 1,
          acelMax: 1,
          maniobrabilidad: 80,
        },
        title: 'Crear modelo de barco',
        icon: 'directions_boat',
        labels: {
          nombre: 'Nombre',
          color: 'Color',
          descripcion: 'Descripción',
          velMax: 'Velocidad máxima',
          acelMax: 'Aceleración máxima',
          maniobrabilidad: 'Maniobrabilidad',
        },
        fieldConfig: {
          nombre: {
            type: 'text',
            validators: [Validators.required, Validators.minLength(2)],
          },
          color: {
            type: 'COLOR',
            validators: [Validators.required],
          },
          descripcion: {
            type: 'text',
            validators: [Validators.required, Validators.minLength(3)],
          },
          velMax: {
            type: 'number',
            validators: [Validators.required, Validators.min(1), Validators.max(5)],
          },
          acelMax: {
            type: 'number',
            validators: [Validators.required, Validators.min(1), Validators.max(5)],
          },
          maniobrabilidad: {
            type: 'number',
            validators: [Validators.required, Validators.min(0), Validators.max(100)],
          },
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      // 👇 Tipo EXACTO que espera el servicio
      const payload: Omit<ModeloBarco, 'id' | 'creadoEn' | 'actualizadoEn'> = {
        nombre: result.nombre ?? '',
        color: result.color ?? '#000000',
        descripcion: result.descripcion ?? '',
        velMax: Number(result.velMax ?? 1),
        acelMax: Number(result.acelMax ?? 1),
        maniobrabilidad: Number(result.maniobrabilidad ?? 80),
      };

      this.modeloS.createModelo(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Modelo creado',
            timer: 1800,
            showConfirmButton: false,
          });
          this.reload();
        },
        error: (err) => {
          console.error('Error creando modelo', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear el modelo.',
          });
        },
      });
    });
  }


  // ==========================
  //  Editar modelo
  // ==========================
  onEditModelo(modelo: ModeloBarco): void {
    const dialogRef = this.dialog.open(DynamicFormDialog, {
      width: '480px',
      data: {
        model: {
          id: modelo.id,
          nombre: modelo.nombre,
          color: modelo.color,
          descripcion: modelo.descripcion,
          velMax: modelo.velMax,
          acelMax: modelo.acelMax,
          maniobrabilidad: modelo.maniobrabilidad,
          creadoEn: modelo.creadoEn,
          actualizadoEn: modelo.actualizadoEn,
        },
        title: 'Editar modelo de barco',
        icon: 'edit',
        labels: {
          nombre: 'Nombre',
          color: 'Color',
          descripcion: 'Descripción',
          velMax: 'Velocidad máxima',
          acelMax: 'Aceleración máxima',
          maniobrabilidad: 'Maniobrabilidad',
          creadoEn: 'Creado',
          actualizadoEn: 'Actualizado',
        },
        readonlyFields: ['id', 'creadoEn', 'actualizadoEn'],
        fieldConfig: {
          nombre: {
            type: 'text',
            validators: [Validators.required, Validators.minLength(2)],
          },
          color: {
            type: 'COLOR',
            validators: [Validators.required],
          },
          descripcion: {
            type: 'text',
            validators: [Validators.required, Validators.minLength(3)],
          },
          velMax: {
            type: 'number',
            validators: [Validators.required, Validators.min(1), Validators.max(5)],
          },
          acelMax: {
            type: 'number',
            validators: [Validators.required, Validators.min(1), Validators.max(5)],
          },
          maniobrabilidad: {
            type: 'number',
            validators: [Validators.required, Validators.min(0), Validators.max(100)],
          },
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload: Partial<ModeloBarco> = {
        nombre: result.nombre,
        color: result.color,
        descripcion: result.descripcion,
        velMax: Number(result.velMax),
        acelMax: Number(result.acelMax),
        maniobrabilidad: Number(result.maniobrabilidad),
      };

      this.modeloS.updateModelo(modelo.id, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Modelo actualizado',
            timer: 1800,
            showConfirmButton: false,
          });
          this.reload();
        },
        error: (err) => {
          console.error('Error actualizando modelo', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el modelo.',
          });
        },
      });
    });
  }

  // ==========================
  //  Eliminar modelo
  // ==========================
  onDeleteModelo(modelo: ModeloBarco): void {
    Swal.fire({
      title: '¿Eliminar modelo?',
      text: `Se eliminará "${modelo.nombre}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.modeloS.deleteModelo(modelo.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Modelo eliminado',
            timer: 1800,
            showConfirmButton: false,
          });
          this.reload();
        },
        error: (err) => {
          console.error('Error eliminando modelo', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el modelo.',
          });
        },
      });
    });
  }
}
