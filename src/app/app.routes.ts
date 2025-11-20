import { Routes } from '@angular/router';
import { Login } from './feature/auth/login/login';
import { AdminUsers } from './feature/admin/admin-users/admin-users';
import { Inicio } from './feature/jugador/pages/inicio/inicio';

export const routes: Routes = [
    { path: '', component: Login },
    { path: 'admin-users', component: AdminUsers },
    { path: 'inicio', component: Inicio }
];
