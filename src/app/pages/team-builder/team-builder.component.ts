import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { PlayerService } from '../../core/services/player.service';
import { TeamSettingsService } from '../../core/services/settings.service';
import { LoadingService } from '../../core/services/loading.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-builder.component.html',
  styleUrl: './team-builder.component.css',
})
export class TeamBuilderComponent implements OnInit {
  selectedFormat: 'FUT 5' | 'FUT 8' = 'FUT 5';
  private playerService = inject(PlayerService);
  authService = inject(AuthService);

  players: any[] = [];
  starters: any[] = [];
  substitutes: any[] = [];
  goalkeeper: any[] = [];
  defenders: any[] = [];

  midfielders: any[] = [];

  forwards: any[] = [];
  teamRating = 0;
  currentUser: any = null;
  isGenerating = false;
  teamName: string = '';

  formations = {
    'FUT 5': {
      Arquero: 1,
      Defensa: 1,
      Mediocampo: 2,
      Delantero: 1,
    },

    'FUT 8': {
      Arquero: 1,
      Defensa: 3,
      Mediocampo: 3,
      Delantero: 1,
    },
  };

  ngOnInit(): void {
    this.getCurrentUser();
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

  getPlayers(): void {
    this.playerService.getPlayers(this.currentUser.teamId).subscribe({
      next: (players) => {
        this.players = players
          .map((player) => ({
            ...player,
            aiScore: this.calculateAIScore(player),
            aiBadge: this.getAIBadge(player),
            aiInsight: this.getAIInsight(player),
          }))
          .sort((a, b) => b.aiScore - a.aiScore);

        this.generateTeams();
      },
      error: console.error,
    });
  }

  calculateAIScore(player: any): number {
    return Number((player.averageRating || 0).toFixed(2));
  }

  getAIBadge(player: any): string {
    if (player.averageRating >= 9) return '🔥 Imparable';
    if (player.averageRating >= 8) return '🚀 En forma';
    switch (player.position) {
      case 'Defensa':
        return '🛡️ Muro';
      case 'Mediocampo':
        return '🧠 Cerebro';
      default:
        return '⚽ Determinante';
    }
  }

  getAIInsight(player: any): string {
    if (player.averageRating >= 9) return 'Dominó los últimos partidos';
    switch (player.position) {
      case 'Delantero':
        return 'Gran impacto ofensivo';
      case 'Defensa':
        return 'Solidez defensiva destacada';
      default:
        return 'Buen momento competitivo';
    }
  }

  getPlayersByPosition(
    position: string,
    limit: number,
    selectedPlayers: any[],
  ): any[] {
    const positionPlayers = this.players
      .filter(
        (player) =>
          player.position === position &&
          !selectedPlayers.some((selected) => selected.id === player.id),
      )
      .sort((a, b) => b.aiScore - a.aiScore);
    let finalPlayers = positionPlayers.slice(0, limit);
    if (finalPlayers.length < limit) {
      const missing = limit - finalPlayers.length;
      const fallbackPlayers = this.players
        .filter(
          (player) =>
            !selectedPlayers.some((selected) => selected.id === player.id) &&
            !finalPlayers.some((selected) => selected.id === player.id),
        )
        .sort((a, b) => b.aiScore - a.aiScore)
        .slice(0, missing);
      finalPlayers = [...finalPlayers, ...fallbackPlayers];
    }
    return finalPlayers;
  }
  generateTeams(): void {
    this.isGenerating = true;
    setTimeout(() => {
      const formation = this.formations[this.selectedFormat];
      const selectedPlayers: any[] = [];
      this.goalkeeper = this.getPlayersByPosition(
        'Arquero',
        formation.Arquero,
        selectedPlayers,
      );
      selectedPlayers.push(...this.goalkeeper);
      this.defenders = this.getPlayersByPosition(
        'Defensa',
        formation.Defensa,
        selectedPlayers,
      );
      selectedPlayers.push(...this.defenders);

      this.midfielders = this.getPlayersByPosition(
        'Mediocampo',
        formation.Mediocampo,
        selectedPlayers,
      );

      selectedPlayers.push(...this.midfielders);
      this.forwards = this.getPlayersByPosition(
        'Delantero',
        formation.Delantero,
        selectedPlayers,
      );

      selectedPlayers.push(...this.forwards);
      this.starters = [
        ...this.goalkeeper,
        ...this.defenders,
        ...this.midfielders,
        ...this.forwards,
      ];

      this.substitutes = this.players.filter(
        (player) => !this.starters.some((starter) => starter.id === player.id),
      );
      const total = this.starters.reduce(
        (acc, player) => acc + player.aiScore,
        0,
      );

      this.teamRating = this.starters.length
        ? Number((total / this.starters.length).toFixed(1))
        : 0;

      this.isGenerating = false;
    }, 1200);
  }
}
