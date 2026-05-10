import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { PlayerService }
  from '../../core/services/player.service';

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-builder.component.html',
  styleUrl: './team-builder.component.css'
})

export class TeamBuilderComponent implements OnInit {

  /* INJECTS */
  selectedFormat: 'FUT 5' | 'FUT 8' = 'FUT 5';
  private playerService =
    inject(PlayerService);

  /* STATE */

  players: any[] = [];

  starters: any[] = [];

  substitutes: any[] = [];

  goalkeeper: any[] = [];

  defenders: any[] = [];

  midfielders: any[] = [];

  forwards: any[] = [];
  teamRating = 0;

  isGenerating = false;

  /* FORMATIONS */

  formations = {

    'FUT 5': {
      Arquero: 1,
      Defensa: 1,
      Mediocampo: 2,
      Delantero: 1
    },

    'FUT 8': {
      Arquero: 1,
      Defensa: 3,
      Mediocampo: 3,
      Delantero: 1
    }

  };

  /* INIT */

  ngOnInit(): void {

    this.getPlayers();

  }

  /* GET PLAYERS */

  getPlayers(): void {

    this.playerService
      .getPlayers()
      .subscribe({

        next: (players) => {

          this.players = players
            .map(player => ({
              ...player,
              aiScore: this.calculateAIScore(player),
              aiBadge: this.getAIBadge(player),
              aiInsight: this.getAIInsight(player)
            }))
            .sort((a, b) => b.aiScore - a.aiScore);

          this.generateTeams();

        },

        error: console.error

      });

  }

  /* AI SCORE */

  calculateAIScore(player: any): number {

    const offensiveImpact =
      (player.goals || 0) +
      (player.assists || 0);

    const score =

      (
        player.averageRating * 0.7 +
        offensiveImpact * 0.3
      );

    return Number(score.toFixed(2));

  }

  /* AI BADGE */

  getAIBadge(player: any): string {

    if (player.averageRating >= 9)
      return '🔥 Imparable';

    if (player.averageRating >= 8)
      return '🚀 En forma';

    switch (player.position) {

      case 'Defensa':
        return '🛡️ Muro';

      case 'Mediocampo':
        return '🧠 Cerebro';

      default:
        return '⚽ Determinante';

    }

  }

  /* AI INSIGHT */

  getAIInsight(player: any): string {

    if (player.averageRating >= 9)
      return 'Dominó los últimos partidos';

    switch (player.position) {

      case 'Delantero':
        return 'Gran impacto ofensivo';

      case 'Defensa':
        return 'Solidez defensiva destacada';

      default:
        return 'Buen momento competitivo';

    }

  }

  /* POSITION PLAYERS */

  getPlayersByPosition(position: string, limit: number, selectedPlayers: any[]): any[] {
    const positionPlayers =
      this.players
        .filter(player =>
          player.position === position &&
          !selectedPlayers.some(
            selected =>
              selected.id === player.id
          )
        )
        .sort(
          (a, b) =>
            b.aiScore - a.aiScore
        );
    let finalPlayers =
      positionPlayers.slice(0, limit);
    if (finalPlayers.length < limit) {
      const missing =
        limit - finalPlayers.length;
      const fallbackPlayers =
        this.players
          .filter(player =>
            !selectedPlayers.some(
              selected =>
                selected.id === player.id
            ) &&
            !finalPlayers.some(
              selected =>
                selected.id === player.id
            )
          )
          .sort(
            (a, b) =>
              b.aiScore - a.aiScore
          )
          .slice(0, missing);
      finalPlayers = [
        ...finalPlayers,
        ...fallbackPlayers
      ];
    }
    return finalPlayers;

  }

  /* GENERATE TEAMS */

  generateTeams(): void {

    this.isGenerating = true;

    setTimeout(() => {

      const formation =
        this.formations[this.selectedFormat];

      /* SELECTED PLAYERS */

      const selectedPlayers: any[] = [];

      /* GOALKEEPER */

      this.goalkeeper =
        this.getPlayersByPosition(
          'Arquero',
          formation.Arquero,
          selectedPlayers
        );

      selectedPlayers.push(
        ...this.goalkeeper
      );

      /* DEFENDERS */

      this.defenders =
        this.getPlayersByPosition(
          'Defensa',
          formation.Defensa,
          selectedPlayers
        );

      selectedPlayers.push(
        ...this.defenders
      );

      /* MIDFIELDERS */

      this.midfielders =
        this.getPlayersByPosition(
          'Mediocampo',
          formation.Mediocampo,
          selectedPlayers
        );

      selectedPlayers.push(
        ...this.midfielders
      );

      /* FORWARDS */

      this.forwards =
        this.getPlayersByPosition(
          'Delantero',
          formation.Delantero,
          selectedPlayers
        );

      selectedPlayers.push(
        ...this.forwards
      );

      /* STARTERS */

      this.starters = [

        ...this.goalkeeper,
        ...this.defenders,
        ...this.midfielders,
        ...this.forwards

      ];

      /* SUBSTITUTES */

      this.substitutes =

        this.players.filter(
          player =>

            !this.starters.some(
              starter =>
                starter.id === player.id
            )
        );

      /* TEAM RATING */

      const total =

        this.starters.reduce(
          (acc, player) =>
            acc + player.aiScore,
          0
        );

      this.teamRating =

        this.starters.length

          ? Number(
            (
              total /
              this.starters.length
            ).toFixed(1)
          )

          : 0;

      this.isGenerating = false;

    }, 1200);

  }

}