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
import { successAlert } from '../../core/utils/alert.util';
import { LoadingService } from '../../core/services/loading.service';
import { PlayerFilterPipe } from '../../core/pipes/player-filter.pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-players',
  imports: [
    CommonModule,
    RouterLink,
    PlayerFilterPipe,
    FormsModule
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css'
})
export class PlayersComponent implements OnInit {
  players: Player[] = [];
  searchTerm = '';
  private router = inject(Router);
  private playerService = inject(PlayerService);
  private loadingService = inject(LoadingService);
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
      this.loadingService.show();
      await this.playerService
        .deletePlayer(player.id);
      successAlert(
        'Jugador eliminado 🗑️🔥',
        'El jugador fue eliminado correctamente.'
      );
    } catch (error) {
      console.error(error);
    } finally {
      this.loadingService.hide();
    }
  }

}