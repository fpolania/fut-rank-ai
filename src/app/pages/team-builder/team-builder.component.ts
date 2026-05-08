import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import { PlayerService }
  from '../../core/services/player.service';

import { Player }
  from '../../core/interfaces/player.interface';

@Component({
  selector: 'app-team-builder',
  imports: [
    CommonModule
  ],
  templateUrl: './team-builder.component.html',
  styleUrl: './team-builder.component.css'
})
export class TeamBuilderComponent
  implements OnInit {

  /* INJECTS */

  private playerService =
    inject(PlayerService);

  /* DATA */

  players: Player[] = [];

  starters: Player[] = [];

  substitutes: Player[] = [];

  goalkeeper: Player[] = [];

  defenders: Player[] = [];

  midfielders: Player[] = [];

  forwards: Player[] = [];

  teamRating = 0;

  selectedFormat = 'FUT 5';

  /* INIT */

  ngOnInit(): void {

    this.getPlayers();

  }

  /* GET PLAYERS */

  getPlayers() {

    this.playerService
      .getPlayers()
      .subscribe({

        next: (players) => {

          this.players =

            [...players]

              .sort(
                (a, b) =>

                  b.averageRating -
                  a.averageRating
              );

          /* AUTO GENERATE */

          this.generateTeams();

        },

        error: (error) => {

          console.error(error);

        }

      });

  }

  /* GENERATE TEAM */

  generateTeams() {

    /* RESET */

    this.goalkeeper = [];

    this.defenders = [];

    this.midfielders = [];

    this.forwards = [];

    this.starters = [];

    this.substitutes = [];

    /* SORT */

    const sortedPlayers =

      [...this.players]

        .sort(
          (a, b) =>

            b.averageRating -
            a.averageRating
        );


    const goalkeepers =

      sortedPlayers.filter(
        player =>

          player.position ===
          'Arquero'
      );

    const defenders =

      sortedPlayers.filter(
        player =>

          player.position ===
          'Defensa'
      );

    const midfielders = sortedPlayers.filter(player => player.position === 'Mediocampo');
    const forwards = sortedPlayers.filter(
      player => player.position === 'Delantero');

    if (this.selectedFormat === 'FUT 5') {
      this.goalkeeper = goalkeepers.slice(0, 1);
      this.defenders = defenders.slice(0, 1);
      this.midfielders = midfielders.slice(0, 2);
      this.forwards = forwards.slice(0, 1);

    }

    if (this.selectedFormat === 'FUT 8') {
      this.goalkeeper =
        goalkeepers.slice(0, 1);
      this.defenders =
        defenders.slice(0, 3);
      this.midfielders =
        midfielders.slice(0, 3);
      this.forwards =
        forwards.slice(0, 1);

    }

    this.starters = [
      ...this.goalkeeper,
      ...this.defenders,
      ...this.midfielders,
      ...this.forwards
    ];

    this.substitutes = sortedPlayers.filter(
      player =>
        !this.starters.some(
          starter =>
            starter.id ===
            player.id
        )
    );

    const total = this.starters.reduce(
      (acc, player) =>

        acc +
        player.averageRating,
      0
    );
    this.teamRating = this.starters.length
      ? Number(
        (
          total /
          this.starters.length
        ).toFixed(1)
      )
      : 0;
  }

}