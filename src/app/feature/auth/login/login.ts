import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../service/auth/auth';
import { AdminS } from './../../admin/service/admin/admin-s';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  activeTab: 'login' | 'register' = 'login';

  loginForm: FormGroup;
  registerForm: FormGroup;

  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private auth: Auth,
    private adminS: AdminS,      // 👈 inyectamos AdminS
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    this.registerForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordsMatchValidator,
      }
    );
  }

  setTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  private passwordsMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm
      ? { passwordMismatch: true }
      : null;
  }

  // ======================
  //       LOGIN
  // ======================
  onLogin(): void {
    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { email, password } = this.loginForm.value;

    this.auth.login({ email, password }).subscribe({
      next: (resp) => {
        const token = resp.token;
        const usuarioId = resp.usuarioId;
        this.handleAuthSuccess(token, usuarioId);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message || 'No se pudo iniciar sesión. Intenta de nuevo.';
      },
    });
  }

  // ======================
  //     REGISTRO
  // ======================
  onRegister(): void {
    if (this.registerForm.invalid || this.loading) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { nombre, email, password } = this.registerForm.value;

    this.auth.register({ nombre, email, password, role: 'PLAYER' }).subscribe({
      next: (resp) => {
        const token = resp.token;
        const usuarioId = resp.usuarioId;

        this.successMessage = 'Cuenta creada correctamente.';
        this.handleAuthSuccess(token, usuarioId);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage =
          err?.error?.message ||
          'No se pudo registrar la cuenta. Intenta de nuevo.';
      },
    });
  }

  // ======================
  //  POST LOGIN/REGISTER
  // ======================
  private handleAuthSuccess(token: string, usuarioId?: number): void {
    // 👇 clave alineada con el interceptor
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }

    // Llamamos /api/usuarios/{id} solo si viene el id
    if (usuarioId != null) {
      this.adminS.getUsuario(usuarioId).subscribe({
        next: (usuario) => {
          console.log('Usuario cargado desde /api/usuarios:', usuario);
          // Si tu DTO trae un campo rol/role, puedes usarlo aquí:
          const roleFromApi =
            (usuario.role as string) ||
            (usuario.rol as string) ||
            (usuario.tipo as string) ||
            null;

          this.navigateByRole(roleFromApi, token);
        },
        error: (err) => {
          console.error('Error cargando /api/usuarios/{id}', err);
          // Si falla, navegamos solo con roles del token
          this.navigateByRole(null, token);
        },
      });
    } else {
      // Si no tenemos usuarioId, nos basamos solo en el token
      this.navigateByRole(null, token);
    }
  }

  // Decide la ruta según ADMIN / PLAYER
  private navigateByRole(roleFromApi: string | null, token: string): void {
    const rolesFromToken = this.decodeRoles(token);
    const allRoles = [
      ...(roleFromApi ? [roleFromApi] : []),
      ...rolesFromToken,
    ].map((r) => r.toUpperCase());

    this.loading = false;

    if (allRoles.includes('ADMIN')) {
      this.router.navigate(['/admin-users']);
    } else {
      // PLAYER u otro → inicio
      this.router.navigate(['/inicio']);
    }
  }

  private decodeRoles(token: string): string[] {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return [];
      }

      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(base64);
      const payload = JSON.parse(payloadJson);

      const roles = payload.roles;
      if (Array.isArray(roles)) {
        return roles;
      }
      if (typeof roles === 'string') {
        return [roles];
      }
      return [];
    } catch (e) {
      console.error('Error decodificando token JWT', e);
      return [];
    }
  }

  // Getters para el template
  get loginEmailCtrl() {
    return this.loginForm.get('email');
  }

  get loginPasswordCtrl() {
    return this.loginForm.get('password');
  }

  get regNombreCtrl() {
    return this.registerForm.get('nombre');
  }

  get regEmailCtrl() {
    return this.registerForm.get('email');
  }

  get regPasswordCtrl() {
    return this.registerForm.get('password');
  }

  get regConfirmPasswordCtrl() {
    return this.registerForm.get('confirmPassword');
  }
}
