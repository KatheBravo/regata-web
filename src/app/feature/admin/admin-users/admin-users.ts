import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// Servicios
import { AdminS } from '../service/admin/admin-s';
import { Auth } from '../../auth/service/auth/auth';

// Dynamic form
import { DynamicFormDialog } from '../../../shared/dynamic-form-dialog/dynamic-form-dialog';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Validators } from '@angular/forms';

import Swal from 'sweetalert2';

// RxJS
import { Observable, Subject, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  role: string;
  activo: boolean;
  creadoEn?: string;
  actualizadoEn?: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    MatFormFieldModule,
  ],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
  changeDetection: ChangeDetectionStrategy.OnPush, // ✅ importante
})
export class AdminUsers implements OnInit {
  displayedColumns: string[] = ['nombre', 'role', 'activo', 'creadoEn', 'acciones'];

  // Stream para la tabla
  usuarios$!: Observable<Usuario[]>;

  // Trigger para recargar
  private readonly reload$ = new Subject<void>();

  constructor(
    private adminS: AdminS,
    private auth: Auth,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.usuarios$ = this.reload$.pipe(
      // dispara una primera vez al suscribirse el template
      startWith(void 0),
      switchMap(() =>
        this.adminS.getUsuarios().pipe(
          map((data: Usuario[]) => (data || []).filter((u) => u.id !== 1)), // ocultar admin base
          catchError((err) => {
            console.error('Error cargando usuarios', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error cargando usuarios.',
            });
            return of([]); // devolvemos array vacío para que el template no reviente
          })
        )
      )
    );
  }

  private reload(): void {
    this.reload$.next();
  }

  // ==========================
  //  Logout
  // ==========================
  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // ==========================
  //  Crear usuario
  // ==========================
  onCreateUser(): void {
    const dialogRef = this.dialog.open(DynamicFormDialog, {
      width: '480px',
      data: {
        model: {
          nombre: '',
          email: '',
          password: '',
          role: 'PLAYER',
          activo: true,
        },
        title: 'Crear usuario',
        icon: 'person_add',
        labels: {
          nombre: 'Nombre',
          email: 'Correo',
          password: 'Contraseña',
          role: 'Rol',
          activo: 'Estado',
        },
        fieldConfig: {
          nombre: {
            type: 'text',
            validators: [Validators.required, Validators.minLength(2)],
          },
          email: {
            type: 'email',
            validators: [Validators.required, Validators.email],
          },
          password: {
            type: 'password',
            validators: [Validators.required, Validators.minLength(6)],
          },
          role: {
            type: 'text',
          },
          activo: {
            type: 'Estado', // para slide-toggle
          },
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload: any = {
        nombre: result.nombre,
        email: result.email,
        password: result.password,
        role: result.role || 'PLAYER',
        activo: result.activo ?? true,
      };

      this.adminS.createUsuario(payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Usuario creado',
            timer: 1800,
            showConfirmButton: false,
          });
          this.reload(); // ✅ refresca la tabla
        },
        error: (err) => {
          console.error('Error creando usuario', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear el usuario.',
          });
        },
      });
    });
  }

  // ==========================
  //  Editar usuario
  // ==========================
  onEditUser(user: Usuario): void {
    const dialogRef = this.dialog.open(DynamicFormDialog, {
      width: '480px',
      data: {
        model: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          role: user.role,
          activo: user.activo,
          creadoEn: user.creadoEn,
          actualizadoEn: user.actualizadoEn,
        },
        title: 'Editar usuario',
        icon: 'edit',
        labels: {
          nombre: 'Nombre',
          email: 'Correo',
          role: 'Rol',
          activo: 'Estado',
          creadoEn: 'Creado',
          actualizadoEn: 'Actualizado',
        },
        readonlyFields: ['id', 'creadoEn', 'actualizadoEn'],
        fieldConfig: {
          nombre: {
            type: 'text',
            validators: [Validators.required, Validators.minLength(2)],
          },
          email: {
            type: 'email',
            validators: [Validators.required, Validators.email],
          },
          role: {
            type: 'text',
          },
          activo: {
            type: 'Estado',
          },
        },
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const payload: any = {
        nombre: result.nombre,
        email: result.email,
        role: result.role,
        activo: result.activo,
      };

      this.adminS.updateUsuario(user.id, payload).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Usuario actualizado',
            timer: 1800,
            showConfirmButton: false,
          });
          this.reload();
        },
        error: (err) => {
          console.error('Error actualizando usuario', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el usuario.',
          });
        },
      });
    });
  }

  // ==========================
  //  Activar / desactivar
  // ==========================
  onToggleActivo(user: Usuario): void {
    const nuevoEstado = !user.activo;

    this.adminS.patchUsuario(user.id, { activo: nuevoEstado }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: nuevoEstado ? 'Usuario activado' : 'Usuario desactivado',
          timer: 1500,
          showConfirmButton: false,
        });
        this.reload();
      },
      error: (err) => {
        console.error('Error cambiando estado', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cambiar el estado del usuario.',
        });
      },
    });
  }

  // ==========================
  //  Eliminar usuario
  // ==========================
  onDeleteUser(user: Usuario): void {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Se eliminará "${user.nombre}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.adminS.deleteUsuario(user.id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Usuario eliminado',
            timer: 1800,
            showConfirmButton: false,
          });
          this.reload();
        },
        error: (err) => {
          console.error('Error eliminando usuario', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el usuario.',
          });
        },
      });
    });
  }
}
