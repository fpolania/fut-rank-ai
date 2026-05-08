import {
  Component,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterLink
} from '@angular/router';
import { Player } from '../../core/interfaces/player.interface';

@Component({
  selector: 'app-players',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css'
})
export class PlayersComponent {
  private router = inject(Router);
  players = [

    {
      id: 'iJmJ5oGHBjILKkwxplZm',
      name: 'Fabian',
      position: 'Delantero',
      rating: 9.4,
      goals: 12,
      mvps: 5,
      photo:
        'https://i.pravatar.cc/150?img=11'
    },

    {
      id: '2',
      name: 'Kevin',
      position: 'Mediocampo',
      rating: 8.9,
      goals: 6,
      mvps: 3,
      photo:
        'https://i.pravatar.cc/150?img=12'
    },

    {
      id: '3',
      name: 'Juan',
      position: 'Defensa',
      rating: 8.7,
      goals: 2,
      mvps: 2,
      photo:
        'https://i.pravatar.cc/150?img=15'
    }

  ];
  editPlayer(player: any) {
    this.router.navigate([
      '/add-player',
      player.id
    ])
  }
  deletePlayer(player: any) {

  }

}