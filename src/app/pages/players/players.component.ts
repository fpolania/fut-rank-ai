import { Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router, RouterLink } from '@angular/router';
import { Player } from '../../core/interfaces/player.interface';
import { PlayerService } from '../../core/services/player.service';
import { successAlert, warningAlert } from '../../core/utils/alert.util';
import { LoadingService } from '../../core/services/loading.service';
import { PlayerFilterPipe } from '../../core/pipes/player-filter.pipe';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../admin/services/subscription.service';

@Component({
  selector: 'app-players',
  imports: [CommonModule, PlayerFilterPipe, FormsModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css',
})
export class PlayersComponent implements OnInit {
  players: Player[] = [];
  currentUser: any = null;
  searchTerm = '';
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private loadingService = inject(LoadingService);
  authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  ngOnInit() {
    this.getCurrentUser();
  }
  getPlayers() {
    this.loadingService.show();
    this.playerService.getPlayers().subscribe({
      next: (players) => {
        this.players = players;
        this.loadingService.hide();
      },
    });
  }
  getCurrentUser() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.currentUser.uid) {
          this.getPlayers();
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  openProfile(player: Player) {
    this.router.navigate(['/player-profile', player.id]);
  }
  editPlayer(player: any) {
    this.router.navigate(['/add-player', player.id]);
  }
  async deletePlayer(player: any) {
    try {
      this.loadingService.show();
      await this.playerService.deletePlayer(player.id);
      successAlert(
        'Jugador eliminado 🗑️🔥',
        'El jugador fue eliminado correctamente.',
      );
    } catch (error) {
      console.error(error);
    } finally {
      this.loadingService.hide();
    }
  }
  validatePlayers() {
    const subscription = this.subscriptionService.getCurrentSubscription();
    if (!subscription) {
      warningAlert(
        'Plan no encontrado ⚽',
        'No se encontró una suscripción activa.',
      );
      return;
    }
    const canCreatePlayer = this.subscriptionService.canCreatePlayer(
      subscription,
      this.players.length,
    );

    if (!canCreatePlayer) {
      warningAlert(
        'Límite alcanzado ⚽',
        `Tu plan permite máximo ${subscription.maxPlayers} jugadores.`,
      );

      return;
    }

    this.router.navigate(['/add-player']);
  }
}
