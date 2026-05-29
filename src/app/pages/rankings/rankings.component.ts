import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { PlayerService } from '../../core/services/player.service';
import { Player } from '../../core/interfaces/player.interface';
import { LoadingService } from '../../core/services/loading.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-rankings',
  imports: [CommonModule],
  templateUrl: './rankings.component.html',
  styleUrl: './rankings.component.css',
})
export class RankingsComponent implements OnInit {
  private loadingService = inject(LoadingService);
    authService = inject(AuthService);
  selectedFilter = 'Todos';
  players: Player[] = [];
  currentUser: any = null;
  topPlayers: Player[] = [];

  private playerService = inject(PlayerService);
  ngOnInit(): void {
    this.getCurrentUser();
  }
  

  filterRanking(filter: string) {
    this.selectedFilter = filter;
    switch (filter) {
      case 'MVPs':
        this.players = [...this.players].sort((a, b) => b.mvps - a.mvps);
        break;
      default:
        this.players = [...this.players].sort(
          (a, b) => b.averageRating - a.averageRating,
        );

        break;
    }
  }

  getPlayers() {
    this.loadingService.show();
    this.playerService.getPlayers(this.currentUser.teamId).subscribe({
      next: (players) => {
        this.players = [...players].sort(
          (a, b) => b.averageRating - a.averageRating,
        );
        this.topPlayers = this.players.slice(0, 3);
        this.filterRanking(this.selectedFilter);
        this.loadingService.hide();
      },
      error: (error: any) => {
        console.error(error);
        this.loadingService.hide();
      },
    });
  }
  getCurrentUser() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
        if(this.currentUser.uid){
          this.getPlayers();
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
