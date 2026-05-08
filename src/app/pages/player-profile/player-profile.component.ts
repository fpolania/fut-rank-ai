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



import { PlayerService }
  from '../../core/services/player.service';

import { Player }
  from '../../core/interfaces/player.interface';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-player-profile',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './player-profile.component.html',
  styleUrl: './player-profile.component.css'
})
export class PlayerProfileComponent
  implements OnInit {

  /* INJECTS */

  private route =
    inject(ActivatedRoute);

  private playerService =
    inject(PlayerService);

  /* DATA */

  playerId: string | null =
    null;

  player!: Player;

  doughnutChartData: any;

  lineChartData: any;

  /* CHART OPTIONS */

  chartOptions = {

    responsive: true,

    plugins: {

      legend: {

        labels: {

          color: 'white'

        }

      }

    },

    scales: {

      x: {

        ticks: {

          color: 'white'

        },

        grid: {

          color:
            'rgba(255,255,255,.08)'

        }

      },

      y: {

        ticks: {

          color: '#39ff14'

        },

        grid: {

          color:
            'rgba(255,255,255,.08)'

        }

      }

    }

  };

  /* INIT */

  ngOnInit(): void {

    this.playerId =
      this.route.snapshot
        .paramMap.get('id');

    if (this.playerId) {

      this.getPlayer();

    }

  }

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

  getPlayer() {
    if (!this.playerId)
      return;
    this.playerService
      .getPlayerById(this.playerId)
      .subscribe({
        next: (player: any) => {
          this.player = player;
        },
        error: (error: any) => {
          console.error(error);
        }
      });
  }


}