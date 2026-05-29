import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';

import { PlayerService } from '../../core/services/player.service';

import { MatchService } from '../../core/services/match.service';

import { Player } from '../../core/interfaces/player.interface';

import { Match } from '../../core/interfaces/match.interface';
import { LoadingService } from '../../core/services/loading.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private playerService = inject(PlayerService);
  private matchService = inject(MatchService);
  private loadingService = inject(LoadingService);
authService = inject(AuthService);
  players: Player[] = [];
  matches: Match[] = [];
  topPlayers: Player[] = [];
  totalMatches = 0;
  totalPlayers = 0;
  totalMvps = 0;
  currentUser: any = null;
  averageRating = 0;

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getPlayers() {
    this.loadingService.show();
    this.playerService.getPlayers(this.currentUser.teamId).subscribe({
      next: (players) => {
        this.players = players;
        this.totalPlayers = players.length;
        this.totalMvps = players.reduce((acc, player) => acc + player.mvps, 0);
        const totalRatings = players.reduce(
          (acc, player) => acc + player.averageRating,
          0,
        );
        this.averageRating = players.length
          ? Number((totalRatings / players.length).toFixed(1))
          : 0;
        this.topPlayers = [...players]
          .sort((a, b) => b.averageRating - a.averageRating)
          .slice(0, 3);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error(error);
        this.loadingService.hide();
      },
    });
  }

  getMatches() {
    this.matchService.getMatches(this.currentUser.teamId).subscribe({
      next: (matches) => {
        this.matches = matches;
        this.totalMatches = matches.length;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getCurrentUser() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
        if(this.currentUser.uid){
         this.getMatches();
         this.getPlayers();
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
}
