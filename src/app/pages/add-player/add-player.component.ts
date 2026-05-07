import { Component, inject }
  from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  Timestamp
} from '@angular/fire/firestore';
import { PlayerService } from '../../core/services/player.service';

@Component({
  selector: 'app-add-player',
  imports: [ReactiveFormsModule],
  templateUrl: './add-player.component.html',
  styleUrl: './add-player.component.css'
})
export class AddPlayerComponent {

  private fb =
    inject(FormBuilder);

  private playerService = inject(PlayerService);

  playerForm =
    this.fb.group({

      name: [
        '',
        Validators.required
      ],

      photo: [
        ''
      ],

      position: [
        '',
        Validators.required
      ],

      preferredFoot: [
        ''
      ]

    });

  async createPlayer() {

    if (
      this.playerForm.invalid
    ) return;

    try {

      const player = {

        name:
          this.playerForm.value.name || '',

        photo:
          this.playerForm.value.photo || '',

        position:
          this.playerForm.value.position || '',

        preferredFoot:
          this.playerForm.value.preferredFoot || '',

        averageRating: 0,

        goals: 0,

        assists: 0,

        mvps: 0,

        matchesPlayed: 0,

        active: true,

        createdAt:
          Timestamp.now()

      };

      await this.playerService
        .addPlayer(player);

      alert(
        'Jugador creado 🔥'
      );

      this.playerForm.reset();

    } catch (error) {

      console.error(error);

    }

  }

}