import {
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';
import { Player } from '../../core/interfaces/player.interface';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-players',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css'
})
export class PlayersComponent implements OnInit {
  players: Player[] = [];
  private router = inject(Router);
  private playerService = inject(PlayerService);

  ngOnInit() {
    this.playerService
      .getPlayers()
      .subscribe({
        next: (players) => {
          this.players = players;
        }
      });
  }

  openProfile(player: Player) {
    this.router.navigate([
      '/player-profile',
      player.id
    ]);

  }
  editPlayer(player: any) {
    this.router.navigate([
      '/add-player',
      player.id
    ])
  }
  async deletePlayer(player: any) {
    try {
      await this.playerService
        .deletePlayer(player.id);
      alert(
        'Jugador eliminado 🔥'
      );
    } catch (error) {
      console.error(error);
    }
  }

}