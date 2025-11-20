import { Routes } from '@angular/router';

// Auth / jugador
import { Login } from './feature/auth/login/login';

// Admin
import { AdminLayout } from './feature/admin/admin-layout/admin-layout';
import { AdminUsers } from './feature/admin/admin-users/admin-users';
import { AdminModelosBarco } from './feature/admin/admin-modelos-barco/admin-modelos-barco';

// Jugador
import { Inicio } from './feature/jugador/pages/inicio/inicio';
import { MisBarcos } from './feature/jugador/pages/mis-barcos/mis-barcos';
import { Partidas } from './feature/jugador/pages/partidas/partidas';
import { JugadorLayout } from './feature/jugador/pages/jugador-layout/jugador-layout';


export const routes: Routes = [
  // Redirige raíz a login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth
  { path: 'login', component: Login },

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

  // JUGADOR
  {
    path: 'inicio',
    component: JugadorLayout,
    children: [
      // Dashboard del jugador
      { path: '', component: Inicio },

      // Mis barcos
      { path: 'barcos', component: MisBarcos },

      // Lobby/partidas
      { path: 'partidas', component: Partidas },
    ],
  },

  // Cualquier ruta rara -> login
  { path: '**', redirectTo: 'login' },
];
