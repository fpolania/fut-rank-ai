import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { Timestamp } from '@angular/fire/firestore';

import { MatchService } from '../../core/services/match.service';

import { RatingService } from '../../core/services/rating.service';
import { LoadingService } from '../../core/services/loading.service';
import {
  errorAlert,
  successAlert,
  warningAlert,
} from '../../core/utils/alert.util';
import { PlayerService } from '../../core/services/player.service';
import { AiService } from '../../core/services/ai.service';
import { BAD_WORDS } from '../../core/constants/bad-words.constant';

@Component({
  selector: 'app-rate-player-detail',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './rate-player-detail.component.html',
  styleUrl: './rate-player-detail.component.css',
})
export class RatePlayerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private matchService = inject(MatchService);
  private ratingService = inject(RatingService);
  private loadingService = inject(LoadingService);
  private playerService = inject(PlayerService);
  private aiService = inject(AiService);
  playersForm: FormGroup = new FormGroup({});
  badWords = BAD_WORDS;
  matchId: string | null = null;
  match: any;
  players: any[] = [];
  currentPlayerDocument: string = '';
  alreadyRated = false;

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('id');
    this.currentPlayerDocument =
      JSON.parse(sessionStorage.getItem('teamPlayer') || 'null')?.document ||
      '12345678';
    if (this.matchId) {
      this.getMatch();
    }
  }

  getMatch() {
    if (!this.matchId) return;
    this.loadingService.show();
    this.matchService.getMatchById(this.matchId).subscribe({
      next: async (match: any) => {
        try {
          this.match = match;
          const currentPlayer = JSON.parse(
            sessionStorage.getItem('teamPlayer') || 'null',
          );
          const ratings = await new Promise<any[]>((resolve) => {
            this.ratingService
              .getMatchRatings(this.matchId!)
              .subscribe((data) => resolve(data));
          });
          this.players = match.players
            .filter((player: any) => player.attended === true)
            .map((player: any) => {
              const playerRating = ratings.find(
                (rating: any) => rating.playerId === player.playerId,
              );
              const alreadyRated =
                playerRating?.data?.some(
                  (item: any) => item.ratedBy === currentPlayer.document,
                ) || false;
              return {
                ...player,
                alreadyRated,
                newRating: null,
                comment: '',
                isMvp: false,
                wasRated: false,
              };
            });
          const availablePlayers = this.players.filter(
            (player: any) =>
              player.playerId !== this.currentPlayerDocument &&
              !player.alreadyRated,
          );
          if (!availablePlayers.length) {
            warningAlert(
              'Calificaciones completas ⚽🔥',
              'Ya calificaste a todos los jugadores de este partido.',
            );
            this.router.navigate(['/rate-players']);
          }
        } catch (error) {
          console.error(error);
        } finally {
          this.loadingService.hide();
        }
      },

      error: (error: any) => {
        this.loadingService.hide();

        console.error(error);
      },
    });
  }

  async sendRatings() {
    this.loadingService.show();
    if (!this.matchId) return;
    try {
      const updatedPlayers = [...this.players];
      for (const player of this.players) {
        if (!this.hasPlayerInteraction(player)) continue;
        const playerRating = Number(player.newRating);
        const currentPlayer = await new Promise<any>((resolve) => {
          this.playerService
            .getPlayerById(player.playerId)
            .subscribe((data) => resolve(data));
        });

        const shouldGenerateAi = !currentPlayer.aiInsight;
        const currentRating = await new Promise<any>((resolve) => {
          this.ratingService
            .getRatingByPlayerAndMatch(player.playerId, this.matchId!)
            .subscribe((data) => resolve(data));
        });
        const newData = {
          ratedBy: this.currentPlayerDocument,
          rating: playerRating,
          comment: player.comment || '',
          anonymous: false,
          isMvp: player.isMvp,
          createdAt: Timestamp.now(),
        };

        if (currentRating) {
          const updatedData = [...currentRating.data, newData];
          const total = updatedData.reduce(
            (acc: number, item: any) => acc + item.rating,
            0,
          );

          const averageRating = Number((total / updatedData.length).toFixed(1));

          await this.ratingService.updateRating(currentRating.id, {
            data: updatedData,
            averageRating,
            totalRatings: updatedData.length,
          });
        } else {
          await this.ratingService.addRating({
            playerId: player.playerId,
            matchId: this.matchId,
            playerName: player.name,
            averageRating: playerRating,
            totalRatings: 1,
            createdAt: Timestamp.now(),
            data: [newData],
          });
        }

        const playerRatings = await new Promise<any[]>((resolve) => {
          this.ratingService
            .getPlayerRatings(player.playerId)
            .subscribe((data) => resolve(data));
        });

        const totalGlobal = playerRatings.reduce(
          (acc, rating) => acc + rating.averageRating,
          0,
        );

        const globalAverage = playerRatings.length
          ? Number((totalGlobal / playerRatings.length).toFixed(1))
          : 0;

        if (shouldGenerateAi) {
          const response: any = await this.aiService.generatePlayerInsight(
            {
              ...player,
              averageRating: globalAverage,
              totalMvpVotes: player.isMvp ? 1 : 0,
              totalMatches: playerRatings.length,
            },
            [player.comment || ''],
          );

          await this.playerService.updatePlayer(player.playerId, {
            aiInsight: response.data.insight,
            aiUpdatedAt: new Date(),
          });
        }

        await this.playerService.updatePlayer(player.playerId, {
          averageRating: globalAverage,
        });

        const playerIndex = updatedPlayers.findIndex(
          (current) => current.playerId === player.playerId,
        );
        if (playerIndex !== -1) {
          updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            rating: globalAverage,
          };
        }
      }

      const matchRatings = await new Promise<any[]>((resolve) => {
        this.ratingService
          .getMatchRatings(this.matchId!)
          .subscribe((data) => resolve(data));
      });
      const mvpMap = new Map<string, number>();
      for (const rating of matchRatings) {
        const totalVotes = rating.data.filter((item: any) => item.isMvp).length;
        mvpMap.set(rating.playerId, totalVotes);
      }

      let winnerId = '';
      let maxVotes = 0;
      mvpMap.forEach((votes, playerId) => {
        if (votes > maxVotes) {
          maxVotes = votes;
          winnerId = playerId;
        }
      });

      if (winnerId) {
        const currentPlayer = await new Promise<any>((resolve) => {
          this.playerService
            .getPlayerById(winnerId)
            .subscribe((data) => resolve(data));
        });

        await this.playerService.updatePlayer(winnerId, {
          mvps: currentPlayer.mvps + 1,
        });
      }

      const cleanPlayers = updatedPlayers.map((player) => ({
        playerId: player.playerId,
        name: player.name,
        photo: player.photo,
        position: player.position,
        team: player.team,
        goals: player.goals,
        assists: player.assists,
        rating: player.rating || 0,
        attended: player.attended,
      }));

      await this.matchService.updateMatch(this.matchId, {
        players: cleanPlayers,
      });
      successAlert(
        'Calificación registrada ⭐🔥',
        'La IA analizó el rendimiento correctamente.',
      );
    } catch (error) {
      errorAlert(
        'No se pudo registrar 😮‍💨',
        'Ocurrió un error enviando la calificación.',
      );
      console.error(error);
    } finally {
      this.loadingService.hide();
    }
  }
  hasPlayerInteraction(player: any): boolean {
    return (
      player.newRating !== null || !!player.comment?.trim() || player.isMvp
    );
  }

  sanitizeComment(player: any): void {
    let comment = player.comment || '';
    this.badWords.forEach((word) => {
      const regex = new RegExp(word, 'gi');
      comment = comment.replace(regex, '');
    });

    comment = comment.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,]/g, '');
    comment = comment.replace(/\s+/g, ' ');
    comment = comment.substring(0, 180);
    player.comment = comment.trim();
  }
  canSendRatings(): boolean {
    const validPlayers = this.players.filter((player) => {
      const hasRating = player.newRating !== null;
      const hasComment = !!player.comment?.trim();
      const validComment = !player.invalidComment;
      return hasRating && hasComment && validComment;
    });
    return validPlayers.length > 0;
  }
  validateComment(player: any): void {
    const comment = (player.comment || '').trim().toLowerCase();
    if (!comment) {
      player.invalidComment = false;
      return;
    }
    if (comment.length < 5) {
      player.invalidComment = true;
      return;
    }

    const validTextRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,]+$/;
    const hasValidText = validTextRegex.test(comment);
    const hasBadWords = this.badWords.some((word) => comment.includes(word));
    player.invalidComment = !hasValidText || hasBadWords;
  }
}
