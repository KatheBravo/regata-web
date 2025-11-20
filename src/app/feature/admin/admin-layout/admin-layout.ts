import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Auth } from '../../auth/service/auth/auth';

@Component({
  selector: 'app-admin-layout',
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayout {
  menuItems = [
    {
      label: 'Usuarios',
      icon: 'group',
      route: '/admin/usuarios',
    },
    {
      label: 'Modelos de barco',
      icon: 'directions_boat',
      route: '/admin/modelos-barco',
    },
  ];

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
