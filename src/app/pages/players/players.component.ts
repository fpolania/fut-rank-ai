import { Component, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router, RouterLink } from '@angular/router';
import { Player } from '../../core/interfaces/player.interface';
import { PlayerService } from '../../core/services/player.service';
import { successAlert } from '../../core/utils/alert.util';
import { LoadingService } from '../../core/services/loading.service';
import { PlayerFilterPipe } from '../../core/pipes/player-filter.pipe';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-players',
  imports: [CommonModule, RouterLink, PlayerFilterPipe, FormsModule],
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
}
