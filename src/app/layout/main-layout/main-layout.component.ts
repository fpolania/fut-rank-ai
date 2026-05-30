import { Component, inject, OnInit } from '@angular/core';

import { AsyncPipe, CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import { AuthService } from '../../core/services/auth.service';

import { LoadingService } from '../../core/services/loading.service';

import { TeamSettingsService } from '../../core/services/settings.service';

import {
  errorAlert,
  successAlert,
  warningAlert,
} from '../../core/utils/alert.util';
import { SubscriptionService } from '../../admin/services/subscription.service';

@Component({
  selector: 'app-main-layout',

  standalone: true,

  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    FormsModule,
  ],

  templateUrl: './main-layout.component.html',

  styleUrl: './main-layout.component.css',
})
export class MainLayoutComponent implements OnInit {
  authService = inject(AuthService);
  private loadingService = inject(LoadingService);
  private teamSettingsService = inject(TeamSettingsService);
  private subscriptionService = inject(SubscriptionService);
  sidebarOpen = false;
  openTeamSettings = false;
  teamName = 'NO DEFINIDO';
  currentUser: any = null;
  subscriptionLoaded = false;

  userMenu = [
    {
      label: 'Dashboard',

      icon: '🏠',

      route: '/',
    },

    {
      label: 'Jugadores',

      icon: '👤',

      route: '/players',
    },

    {
      label: 'Partidos',

      icon: '⚽',

      route: '/matches',
    },

    {
      label: 'Calificar',

      icon: '⭐',

      route: '/rate-players',
    },

    {
      label: 'Historial',

      icon: '📜',

      route: '/match-history',
    },

    {
      label: 'Postulaciones',

      icon: '📥',

      route: '/team-applications',
    },
  ];

  captainMenu = [
    {
      label: 'Análisis IA',

      icon: '🤖',

      route: '/ai-analysis',
    },

    {
      label: 'Crear Competencia',

      icon: '🏆',

      route: '/create-competition',
    },

    {
      label: 'Team Builder',

      icon: '🧠',

      route: '/team-builder',
    },

    {
      label: 'Team Access',

      icon: '🔐',

      route: '/team-access',
    },
  ];

  adminMenu = [
    {
      label: 'Plans',

      icon: '💳',

      route: '/admin/plans',
    },

    {
      label: 'Teams',

      icon: '⚽',

      route: '/admin/teams',
    },

    {
      label: 'Subscriptions',

      icon: '💰',

      route: '/admin/subscriptions',
    },
  ];

  ngOnInit(): void {
    this.getCurrentUser();
  }
  getCurrentUser() {
    this.loadingService.show();
    this.authService.currentUser.subscribe({
      next: async (user) => {
        this.currentUser = user;
        if (!this.currentUser?.uid) {
          this.loadingService.hide();
          return;
        }

        try {
          await this.getName(this.currentUser.teamId);
          const subscription =
            await this.subscriptionService.getSubscriptionByTeamId(
              this.currentUser.teamId,
            );
          if (!subscription) {
            this.loadingService.hide();
            warningAlert(
              'Acceso restringido ⚽',
              'No se encontró una suscripción asociada a tu equipo. Comunícate con el administrador.',
            );
            await this.authService.logout();
            return;
          }
          const accessError =
            this.subscriptionService.validateAccess(subscription);
          if (accessError) {
            this.loadingService.hide();
            warningAlert(
              'Suscripción inválida ⚽',
              `${accessError} Comunícate con el administrador.`,
            );
            this.logout();
            return;
          }
          this.subscriptionService.setCurrentSubscription(subscription);
          this.subscriptionLoaded = true;
        } catch (error) {
          console.error(error);
        } finally {
          this.loadingService.hide();
        }
      },
      error: (error) => {
        console.error(error);
        this.loadingService.hide();
      },
    });
  }
  async getName(teamId: string) {
    this.teamName = await this.authService.getTeamName(teamId);
  }

  get currentMenu() {
    let menu = [...this.userMenu];
    if (this.currentUser?.role === 'captain') {
      menu.push(...this.captainMenu);
    }

    if (this.currentUser?.isSuperAdmin) {
      menu.push(...this.adminMenu);
    }
    return menu;
  }

  async saveTeamSettings() {
    try {
      this.loadingService.show();
      await this.teamSettingsService.saveTeamSettings(this.teamName);
      successAlert(
        'Equipo actualizado ⚽🔥',
        'El nombre del equipo fue actualizado correctamente.',
      );

      this.openTeamSettings = false;
    } catch (error) {
      console.error(error);
      errorAlert('Ups 😮‍💨', 'No se pudo actualizar el equipo.');
    } finally {
      this.loadingService.hide();
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}
