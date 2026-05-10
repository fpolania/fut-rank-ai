import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

import {
  Timestamp
} from '@angular/fire/firestore';

import { MatchService }
  from '../../core/services/match.service';

import { RatingService }
  from '../../core/services/rating.service';
import { LoadingService } from '../../core/services/loading.service';
import { errorAlert, successAlert } from '../../core/utils/alert.util';
import { PlayerService } from '../../core/services/player.service';
import { AiService } from '../../core/services/ai.service';
import {
  BAD_WORDS
} from '../../core/constants/bad-words.constant';

@Component({
  selector: 'app-rate-player-detail',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl:
    './rate-player-detail.component.html',
  styleUrl:
    './rate-player-detail.component.css'
})
export class RatePlayerDetailComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private matchService = inject(MatchService);
  private ratingService = inject(RatingService);
  private loadingService = inject(LoadingService);
  private playerService = inject(PlayerService);
  private aiService = inject(AiService);

  badWords = BAD_WORDS;
  matchId: string | null = null;
  match: any;
  players: any[] = [];

  ngOnInit(): void {
    this.matchId =
      this.route.snapshot
        .paramMap.get('id');
    if (this.matchId) {
      this.getMatch();
    }
  }

  getMatch() {
    if (!this.matchId)
      return;
    this.matchService
      .getMatchById(this.matchId)
      .subscribe({
        next: (match: any) => {
          this.match = match;
          this.players =
            match.players.map(
              (player: any) => ({
                ...player,
                newRating: 5,
                comment: '',
                isMvp: false,
                wasRated: false
              })
            );
        },
        error: (error: any) => {
          console.error(error);
        }
      });
  }


  async sendRatings() {

    this.loadingService.show();

    if (!this.matchId) return;

    try {

      const updatedPlayers = [...this.players];

      for (const player of this.players) {

        if (!player.wasRated) continue;

        const playerRating =
          Number(player.newRating);

        const currentPlayer =
          await new Promise<any>(
            (resolve) => {

              this.playerService
                .getPlayerById(
                  player.playerId
                )
                .subscribe(
                  data =>
                    resolve(data)
                );

            }
          );

        const shouldGenerateAi =
          !currentPlayer.aiInsight;

        const currentRating =
          await new Promise<any>(
            (resolve) => {

              this.ratingService
                .getRatingByPlayerAndMatch(
                  player.playerId,
                  this.matchId!
                )
                .subscribe(
                  data => resolve(data)
                );

            }
          );

        const newData = {

          ratedBy: 'Pull Request',

          rating: playerRating,

          comment:
            player.comment || '',

          anonymous: false,

          isMvp: player.isMvp,

          createdAt:
            Timestamp.now()

        };

        /* UPDATE */

        if (currentRating) {

          const updatedData = [
            ...currentRating.data,
            newData
          ];

          const total =
            updatedData.reduce(
              (acc: number, item: any) =>
                acc + item.rating,
              0
            );

          const averageRating =
            Number(
              (
                total /
                updatedData.length
              ).toFixed(1)
            );

          await this.ratingService
            .updateRating(
              currentRating.id,
              {
                data: updatedData,
                averageRating,
                totalRatings:
                  updatedData.length
              }
            );

        }

        /* CREATE */

        else {

          await this.ratingService
            .addRating({

              playerId:
                player.playerId,

              matchId:
                this.matchId,

              playerName:
                player.name,

              averageRating:
                playerRating,

              totalRatings: 1,

              createdAt:
                Timestamp.now(),

              data: [newData]

            });

        }

        /* PLAYER RATINGS */

        const playerRatings =
          await new Promise<any[]>(
            (resolve) => {

              this.ratingService
                .getPlayerRatings(
                  player.playerId
                )
                .subscribe(
                  data => resolve(data)
                );

            }
          );

        const totalGlobal =
          playerRatings.reduce(
            (acc, rating) =>
              acc +
              rating.averageRating,
            0
          );

        const globalAverage =
          playerRatings.length

            ? Number(
              (
                totalGlobal /
                playerRatings.length
              ).toFixed(1)
            )

            : 0;

        /* GENERATE AI */

        if (shouldGenerateAi) {

          const response: any =
            await this.aiService
              .generatePlayerInsight(
                {

                  ...player,

                  averageRating:
                    globalAverage,

                  totalMvpVotes:
                    player.isMvp ? 1 : 0,

                  totalMatches:
                    playerRatings.length

                },

                [
                  player.comment || ''
                ]

              );

          await this.playerService
            .updatePlayer(
              player.playerId,
              {

                aiInsight:
                  response.data.insight,

                aiUpdatedAt:
                  new Date()

              }
            );

        }

        /* UPDATE PLAYER */

        await this.playerService
          .updatePlayer(
            player.playerId,
            {

              averageRating:
                globalAverage

            }
          );

        /* UPDATE MATCH PLAYER */

        const playerIndex =
          updatedPlayers.findIndex(
            current =>
              current.playerId ===
              player.playerId
          );

        if (playerIndex !== -1) {

          updatedPlayers[playerIndex] = {

            ...updatedPlayers[playerIndex],

            rating:
              globalAverage

          };

        }

      }

      /* MATCH RATINGS */

      const matchRatings =
        await new Promise<any[]>(
          (resolve) => {

            this.ratingService
              .getMatchRatings(
                this.matchId!
              )
              .subscribe(
                data => resolve(data)
              );

          }
        );

      /* MVP MAP */

      const mvpMap =
        new Map<string, number>();

      for (const rating of matchRatings) {

        const totalVotes =
          rating.data.filter(
            (item: any) =>
              item.isMvp
          ).length;

        mvpMap.set(
          rating.playerId,
          totalVotes
        );

      }

      /* FIND WINNER */

      let winnerId = '';

      let maxVotes = 0;

      mvpMap.forEach(
        (
          votes,
          playerId
        ) => {

          if (votes > maxVotes) {

            maxVotes = votes;

            winnerId = playerId;

          }

        }
      );

      /* UPDATE MVP */

      if (winnerId) {

        const currentPlayer =
          await new Promise<any>(
            (resolve) => {

              this.playerService
                .getPlayerById(
                  winnerId
                )
                .subscribe(
                  data =>
                    resolve(data)
                );

            }
          );

        await this.playerService
          .updatePlayer(
            winnerId,
            {

              mvps:
                currentPlayer.mvps + 1

            }
          );

      }

      /* CLEAN PLAYERS */

      const cleanPlayers =
        updatedPlayers.map(
          player => ({

            playerId:
              player.playerId,

            name:
              player.name,

            photo:
              player.photo,

            position:
              player.position,

            team:
              player.team,

            goals:
              player.goals,

            assists:
              player.assists,

            rating:
              player.rating || 0

          })
        );

      /* UPDATE MATCH */

      await this.matchService
        .updateMatch(
          this.matchId,
          {
            players:
              cleanPlayers
          }
        );

      successAlert(
        'Calificación registrada ⭐🔥',
        'La IA analizó el rendimiento correctamente.'
      );

    }

    catch (error) {

      errorAlert(
        'No se pudo registrar 😮‍💨',
        'Ocurrió un error enviando la calificación.'
      );

      console.error(error);

    }

    finally {

      this.loadingService.hide();

    }

  }
  sanitizeComment(
    player: any
  ): void {

    let comment =
      player.comment || '';

    this.badWords.forEach(
      word => {

        const regex =
          new RegExp(
            word,
            'gi'
          );

        comment =
          comment.replace(
            regex,
            '*'.repeat(
              word.length
            )
          );

      }
    );

    player.comment =
      comment;

  }
}