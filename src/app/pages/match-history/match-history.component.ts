import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';

import { MatchService }
from '../../core/services/match.service';

import { Match }
from '../../core/interfaces/match.interface';

@Component({
  selector: 'app-match-history',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './match-history.component.html',
  styleUrl: './match-history.component.css'
})
export class MatchHistoryComponent
implements OnInit {

  /* INJECTS */

  private matchService =
    inject(MatchService);

  private router =
    inject(Router);

  /* DATA */

  matches: Match[] = [];

  filteredMatches: Match[] = [];

  selectedFilter =
    'Todos';

  /* INIT */

  ngOnInit(): void {

    this.getMatches();

  }

  /* GET */

  getMatches() {

    this.matchService
      .getMatches()
      .subscribe({

        next: (matches) => {

          this.matches =

            [...matches]

              .reverse();

          this.filteredMatches =
            this.matches;

        },

        error: (error) => {

          console.error(error);

        }

      });

  }

  /* FILTER */

  filterMatches(
    filter: string
  ) {

    this.selectedFilter =
      filter;

    switch(filter){

      case 'FUT 5':

        this.filteredMatches =

          this.matches.filter(
            match =>
              match.type ===
              'FUT 5'
          );

        break;

      case 'FUT 8':

        this.filteredMatches =

          this.matches.filter(
            match =>
              match.type ===
              'FUT 8'
          );

        break;

      default:

        this.filteredMatches =
          this.matches;

        break;

    }

  }

  /* DETAIL */

  openMatch(
    match: Match
  ) {

    this.router.navigate([
      '/match-detail',
      match.id
    ]);

  }

  /* MVP */

  getMvpName(
    match: Match
  ) {

    const mvp =
      match.players.find(
        (player: any) =>
          player.isMvp
      );

    return mvp
      ? mvp.name
      : 'Sin MVP';

  }

}