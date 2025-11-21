import { Routes } from '@angular/router';

// Auth
import { Login } from './feature/auth/login/login';

// Admin
import { AdminLayout } from './feature/admin/admin-layout/admin-layout';
import { AdminUsers } from './feature/admin/admin-users/admin-users';
import { AdminModelosBarco } from './feature/admin/admin-modelos-barco/admin-modelos-barco';

// Jugador
import { JugadorLayout } from './feature/jugador/pages/jugador-layout/jugador-layout';
import { Inicio } from './feature/jugador/pages/inicio/inicio';
import { MisBarcos } from './feature/jugador/pages/mis-barcos/mis-barcos';
import { Partidas } from './feature/jugador/pages/partidas/partidas';
import { GamePartida } from './feature/jugador/pages/game-partida/game-partida';

export const routes: Routes = [
  // Raíz -> login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Auth
  { path: 'login', component: Login },

  // ADMIN (layout + rutas hijas)
  {
    path: 'admin',
    component: AdminLayout,
    children: [
      { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
      { path: 'usuarios', component: AdminUsers },
      { path: 'modelos-barco', component: AdminModelosBarco },
    ],
  },

  // JUGADOR (layout + rutas hijas)
  {
    path: 'inicio',
    component: JugadorLayout,
    children: [
      // Dashboard del jugador
      { path: '', component: Inicio },

      // Mis barcos
      { path: 'barcos', component: MisBarcos },

      // Lobby / listado de partidas
      { path: 'partidas', component: Partidas },

      { path: 'partida/:id', component: GamePartida },
    ],
  },

  // Cualquier cosa rara -> login
  { path: '**', redirectTo: 'login' },
];
