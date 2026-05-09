import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute
} from '@angular/router';

import {
  MatchService
} from '../../core/services/match.service';

import {
  Match,
  MatchPlayer
} from '../../core/interfaces/match.interface';

import {
  PlayerService
} from '../../core/services/player.service';

import {
  RatingService
} from '../../core/services/rating.service';

import {
  AiService
} from '../../core/services/ai.service';
import {
  LoadingService
} from '../../core/services/loading.service';
import {
  successAlert,
  errorAlert
} from '../../core/utils/alert.util';

@Component({
  selector: 'app-match-detail',
  imports: [
    CommonModule
  ],
  templateUrl:
    './match-detail.component.html',

  styleUrl:
    './match-detail.component.css'
})
export class MatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private matchService = inject(MatchService);
  private playerService = inject(PlayerService);
  private ratingService = inject(RatingService);
  private aiService = inject(AiService);
  private loadingService = inject(LoadingService);

  matchId: string | null = null;
  match!: Match;

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
        },
        error: (error) => {
          console.error(error);
        }
      });
  }


  setMvp(player: MatchPlayer) {
    this.match.players.forEach(
      p => p.isMvp = false
    );
    player.isMvp = true;
    this.match.mvpPlayerId =
      player.playerId;
  }


  increaseGoals(player: MatchPlayer) {
    player.goals++;
    this.calculateScore();
  }

  decreaseGoals(player: MatchPlayer) {
    if (player.goals <= 0)
      return;
    player.goals--;
    this.calculateScore();
  }

  increaseAssists(player: MatchPlayer) {
    player.assists++;
  }
  decreaseAssists(player: MatchPlayer) {
    if (player.assists <= 0)
      return;
    player.assists--;
  }

  increaseRating(player: MatchPlayer) {
    if (player.rating >= 10)
      return;
    player.rating += 0.1;
    player.rating = Number(
      player.rating.toFixed(1)
    );
  }

  decreaseRating(
    player: MatchPlayer
  ) {

    if (player.rating <= 0)
      return;

    player.rating -= 0.1;

    player.rating = Number(
      player.rating.toFixed(1)
    );

  }

  /* SCORE */

  calculateScore() {

    this.match.scoreA =

      this.match.players

        .reduce(

          (
            acc,
            player
          ) =>

            acc + player.goals,

          0

        );

  }

  /* FINISH MATCH */

  async finishMatch() {
    this.loadingService.show();
    if (
      !this.matchId ||
      this.match.finished
    ) return;
    try {
      for (
        const player
        of this.match.players
      ) {
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
        const totalMatches = currentPlayer.matchesPlayed + 1;
        const averageRating =
          (
            (
              currentPlayer.averageRating *
              currentPlayer.matchesPlayed
            )
            +
            player.rating
          ) / totalMatches;

        await this.playerService.updatePlayerStats(
          player.playerId,
          {
            goals:
              currentPlayer.goals +
              player.goals,
            assists:
              currentPlayer.assists +
              player.assists,
            mvps:
              player.isMvp
                ? currentPlayer.mvps + 1
                : currentPlayer.mvps,
            matchesPlayed:
              totalMatches,
            averageRating:
              Number(
                averageRating.toFixed(1)
              )
          }
        );

        const ratings =
          await new Promise<any[]>(
            (resolve) => {
              this.ratingService
                .getPlayerRatings(
                  player.playerId
                )
                .subscribe(
                  data =>
                    resolve(data)
                );
            }
          );

        const comments = ratings
          .filter(
            rating =>
              rating.comment
          )
          .map(
            rating =>
              rating.comment
          );

        const response: any =
          await this.aiService
            .generatePlayerInsight(
              {
                ...currentPlayer,
                goals:
                  currentPlayer.goals +
                  player.goals,
                assists:
                  currentPlayer.assists +
                  player.assists,
                averageRating:
                  Number(
                    averageRating.toFixed(1)
                  ),
                mvps:
                  player.isMvp
                    ? currentPlayer.mvps + 1
                    : currentPlayer.mvps

              },
              comments
            );

        const aiInsight = response.data.insight;
        await this.playerService
          .updatePlayer(
            player.playerId,
            {
              aiInsight,
              aiUpdatedAt:
                new Date()
            }
          );
      }
      this.match.finished = true;
      await this.matchService
        .updateMatch(
          this.matchId,
          {
            finished: true
          }
        );
      successAlert(
        'Partido finalizado ⚽🔥',
        'La IA generó los insights correctamente.'
      );

    } catch (error) {

      errorAlert(
        'Ups 😮‍💨',
        'Ocurrió un error finalizando el partido.'
      );

    } finally {
      this.loadingService.hide();
    }

  }

  increaseEnemyScore() {
    this.match.scoreB++;
  }
  decreaseEnemyScore() {
    if (
      this.match.scoreB <= 0
    ) return;

    this.match.scoreB--;

  }

}