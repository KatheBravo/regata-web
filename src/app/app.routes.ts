import { Routes } from '@angular/router';

// Auth / jugador
import { Login } from './feature/auth/login/login';
import { Inicio } from './feature/jugador/pages/inicio/inicio';

// Admin
import { AdminLayout } from './feature/admin/admin-layout/admin-layout';
import { AdminUsers } from './feature/admin/admin-users/admin-users';
import { AdminModelosBarco } from './feature/admin/admin-modelos-barco/admin-modelos-barco';

export const routes: Routes = [
  // Redirige raíz a login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth
  { path: 'login', component: Login },

  // Jugador
  { path: 'inicio', component: Inicio },

  // Admin con layout + sidebar
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: AdminUsers },
      { path: 'modelos-barco', component: AdminModelosBarco },
    ],
  },

  // Cualquier ruta rara -> login
  { path: '**', redirectTo: 'login' },
];
