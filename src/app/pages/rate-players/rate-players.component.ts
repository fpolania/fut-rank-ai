import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import { MatchService }
  from '../../core/services/match.service';

import { Match }
  from '../../core/interfaces/match.interface';

@Component({
  selector: 'app-rate-players',
  imports: [
    CommonModule
  ],
  templateUrl: './rate-players.component.html',
  styleUrl: './rate-players.component.css'
})
export class RatePlayersComponent
  implements OnInit {

  /* INJECTS */

  private matchService =
    inject(MatchService);

  private router =
    inject(Router);

  /* DATA */

  matches: Match[] = [];

  /* INIT */

  ngOnInit(): void {

    this.getMatches();

  }

  /* GET MATCHES */

  getMatches() {

    this.matchService
      .getMatches()
      .subscribe({

        next: (matches) => {

          this.matches =

            matches.filter(
              match =>
                match.finished
            )

              .reverse();

        },

        error: (error) => {

          console.error(error);

        }

      });

  }

  /* OPEN */

  openRate(
    match: Match
  ) {

    this.router.navigate([
      '/rate-players',
      match.id
    ]);

  }

}