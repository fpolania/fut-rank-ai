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
  FormsModule
} from '@angular/forms';

import {
  PlayerService
} from '../../core/services/player.service';

import {
  RatingService
} from '../../core/services/rating.service';

import {
  Player
} from '../../core/interfaces/player.interface';

@Component({
  selector: 'app-player-profile',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl:
    './player-profile.component.html',

  styleUrl:
    './player-profile.component.css'
})
export class PlayerProfileComponent
  implements OnInit {

  /* INJECTS */

  private route =
    inject(ActivatedRoute);

  private playerService =
    inject(PlayerService);

  private ratingService =
    inject(RatingService);

  /* DATA */

  ratings: any[] = [];

  playerId: string | null =
    null;

  player!: Player;

  aiInsight = '';

  /* INIT */

  ngOnInit(): void {

    this.playerId =

      this.route
        .snapshot
        .paramMap
        .get('id');

    if (this.playerId) {

      this.getPlayer();

      this.getPlayerComments();

    }

  }

  /* GET PLAYER */

  getPlayer() {

    if (!this.playerId)
      return;

    this.playerService

      .getPlayerById(
        this.playerId
      )

      .subscribe({

        next: (player: any) => {

          this.player =
            player;

          this.aiInsight =

            player.aiInsight || '';

        },

        error: (error: any) => {

          console.error(error);

        }

      });

  }

  /* GET COMMENTS */

  getPlayerComments() {

    if (!this.playerId)
      return;

    this.ratingService

      .getPlayerRatings(
        this.playerId
      )

      .subscribe({

        next: (ratings: any) => {

          this.ratings =
            ratings;

        },

        error: (error: any) => {

          console.error(error);

        }

      });

  }

  /* UPDATE ATTRIBUTES */

  async updateAttribute() {

    if (!this.playerId)
      return;

    try {

      await this.playerService

        .updatePlayer(

          this.playerId,

          {

            speed:
              this.player.speed,

            finishing:
              this.player.finishing,

            vision:
              this.player.vision,

            stamina:
              this.player.stamina,

            defense:
              this.player.defense,

            dribbling:
              this.player.dribbling

          }

        );

    } catch (error) {

      console.error(error);

    }

  }

}