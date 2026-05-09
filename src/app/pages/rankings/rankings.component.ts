import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';
import { PlayerService } from '../../core/services/player.service';
import { Player } from '../../core/interfaces/player.interface';



@Component({
  selector: 'app-rankings',
  imports: [
    CommonModule
  ],
  templateUrl: './rankings.component.html',
  styleUrl: './rankings.component.css'
})
export class RankingsComponent implements OnInit {
  selectedFilter =
    'Todos';
  players: Player[] = [];
  topPlayers: Player[] = [];

  private playerService = inject(PlayerService);
  ngOnInit(): void {
    this.getPlayers();
  }

  filterRanking(
    filter: string
  ) {
    this.selectedFilter =
      filter;
    switch (filter) {
      case 'MVPs':
        this.players =
          [...this.players]
            .sort(
              (
                a,
                b
              ) =>
                b.mvps -
                a.mvps
            );
        break;
      default:
        this.players =
          [...this.players]
            .sort(
              (
                a,
                b
              ) =>
                b.averageRating -
                a.averageRating
            );

        break;
    }
  }

  getPlayers() {
    this.playerService
      .getPlayers()
      .subscribe({
        next: (players) => {
          this.players =
            [...players]
              .sort(
                (
                  a,
                  b
                ) =>

                  b.averageRating -
                  a.averageRating
              );
          this.topPlayers =
            this.players.slice(0, 3);
          this.filterRanking(
            this.selectedFilter
          );
        },
        error: (error: any) => {
          console.error(error);
        }
      });

  }

}