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
    if (!this.matchId)
      return;
    try {
      for (const player of this.players) {
        if (!player.wasRated)
          continue;
        await this.ratingService
          .addRating({
            playerId:
              player.playerId,
            matchId:
              this.matchId,
            ratedBy:
              'fabian',
            rating:
              Number(
                player.newRating
              ),
            comment:
              player.comment || '',
            anonymous:
              false,
            isMvp:
              player.isMvp,
            createdAt:
              Timestamp.now()
          });
      }
      alert(
        'Calificaciones enviadas 🔥'
      );
    } catch (error) {
      console.error(error);
    }
  }

}