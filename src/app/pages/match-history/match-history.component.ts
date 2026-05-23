import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router, RouterLink } from '@angular/router';

import { MatchService } from '../../core/services/match.service';

import { Match } from '../../core/interfaces/match.interface';
import { AiService } from '../../core/services/ai.service';
import { RatingService } from '../../core/services/rating.service';
import { PlayerService } from '../../core/services/player.service';
import { LoadingService } from '../../core/services/loading.service';
import {
  errorAlert,
  successAlert,
  warningAlert,
} from '../../core/utils/alert.util';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-match-history',
  imports: [CommonModule],
  templateUrl: './match-history.component.html',
  styleUrl: './match-history.component.css',
})
export class MatchHistoryComponent implements OnInit {
  private matchService = inject(MatchService);
  private aiService = inject(AiService);
  private ratingService = inject(RatingService);
  private playerService = inject(PlayerService);
  private loadingService = inject(LoadingService);
  authService = inject(AuthService);
  matches: Match[] = [];

  filteredMatches: Match[] = [];
  selectedFilter = 'Todos';

  ngOnInit(): void {
    this.getMatches();
  }

  getMatches() {
    this.loadingService.show();
    this.matchService.getMatches().subscribe({
      next: (matches) => {
        this.matches = [...matches].reverse();
        this.filteredMatches = this.matches;
        console.log(this.matches);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error(error);
        this.loadingService.hide();
      },
    });
  }

  filterMatches(filter: string) {
    this.selectedFilter = filter;
    switch (filter) {
      case 'FUT 5':
        this.filteredMatches = this.matches.filter(
          (match) => match.type === 'FUT 5',
        );
        break;
      case 'FUT 8':
        this.filteredMatches = this.matches.filter(
          (match) => match.type === 'FUT 8',
        );
        break;
      default:
        this.filteredMatches = this.matches;
        break;
    }
  }

  async generateAnalysis(match: Match) {
    const canGenerate = this.validateCompetitionDate(match.finishedAt);

    if (!canGenerate) {
      return;
    }

    try {
      this.loadingService.show();

      const listPlayers = match.players.filter(
        (player: any) => player.attended,
      );

      for (const player of listPlayers) {
        const ratings: any = await new Promise((resolve) => {
          this.ratingService
            .getRatingByPlayerAndMatch(player.playerId, match.id as string)
            .subscribe((data) => resolve(data));
        });

        if (!ratings || !ratings.data?.length) {
          continue;
        }

        const currentPlayer: any = await new Promise((resolve) => {
          this.playerService
            .getPlayerById(player.playerId)
            .subscribe((data) => resolve(data));
        });

        const comments = ratings.data
          .map((item: any) => item.comment)
          .filter(Boolean);

        const totalRatings = ratings.data.reduce(
          (acc: number, item: any) => acc + item.rating,

          0,
        );

        const averageRating = Number(
          (totalRatings / ratings.data.length).toFixed(1),
        );

        const totalMvpVotes = ratings.data.filter(
          (item: any) => item.isMvp,
        ).length;

        const response: any = await this.aiService.generatePlayerInsight(
          {
            ...player,

            averageRating,

            totalMvpVotes,

            totalMatches: currentPlayer.matchesPlayed,

            goals: currentPlayer.goals,

            assists: currentPlayer.assists,

            mvps: currentPlayer.mvps,

            position: currentPlayer.position,
          },

          comments,
        );

        await this.playerService.updatePlayer(
          player.playerId,

          {
            aiInsight: response.data.insight,

            aiUpdatedAt: new Date(),
          },
        );

        await this.matchService.updateMatch(
          match.id as string,

          {
            analyzed: true,
          },
        );
      }

      successAlert(
        'Análisis generado 🤖⚽',

        'La IA analizó el partido correctamente.',
      );
    } catch (error) {
      console.error(error);

      errorAlert(
        'Ups 😮‍💨',

        'No se pudo generar el análisis.',
      );
    } finally {
      this.loadingService.hide();
    }
  }

  validateCompetitionDate(finishedAt: any): boolean {
    const finishedDate = finishedAt?.seconds ? finishedAt.seconds * 1000 : 0;
    const availableAt = finishedDate + 86400000;
    const now = Date.now();
    if (now < availableAt) {
      const availableDate = new Date(availableAt).toLocaleString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      warningAlert(
        'Análisis no disponible aún ⚽🤖',
        `El análisis IA estará disponible después del ${availableDate}.`,
      );
      return false;
    }
    return true;
  }
}
