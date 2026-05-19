import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute } from '@angular/router';

import { FormsModule } from '@angular/forms';

import { PlayerService } from '../../core/services/player.service';

import { RatingService } from '../../core/services/rating.service';

import { Player } from '../../core/interfaces/player.interface';
import { AiInsight } from '../../core/interfaces/rating.interface';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { errorAlert, successAlert } from '../../core/utils/alert.util';
import Swal from 'sweetalert2';
import { UploadFileService } from '../../core/services/upload-file.service';
type EditableStatField = 'matchesPlayed' | 'goals' | 'assists' | 'mvps';

@Component({
  selector: 'app-player-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './player-profile.component.html',

  styleUrl: './player-profile.component.css',
})
export class PlayerProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private playerService = inject(PlayerService);
  private ratingService = inject(RatingService);
  private loadingService = inject(LoadingService);

  ratings: any[] = [];
  playerId: string | null = null;
  player!: Player;
  authService = inject(AuthService);
  private fileUpload = inject(UploadFileService);
  user = this.authService.currentUser;
  aiInsight: AiInsight = {
    strengths: [],
    weaknesses: [],
    tips: [],
  };
  visibleComments = 4;
  showAllComments = false;

  stats: {
    label: string;

    field: EditableStatField;
  }[] = [
    {
      label: 'Partidos',
      field: 'matchesPlayed',
    },

    {
      label: 'Goles',
      field: 'goals',
    },

    {
      label: 'Asistencias',
      field: 'assists',
    },

    {
      label: 'MVPs',
      field: 'mvps',
    },
  ];

  ngOnInit(): void {
    this.playerId = this.route.snapshot.paramMap.get('id');
    if (this.playerId) {
      this.getPlayer();
      this.getPlayerComments();
    }
  }
  get displayedComments() {
    if (this.showAllComments) {
      return this.ratings;
    }
    return this.ratings.slice(0, this.visibleComments);
  }
  getPlayer() {
    if (!this.playerId) return;
    this.loadingService.show();
    this.playerService.getPlayerById(this.playerId).subscribe({
      next: (player: any) => {
        this.player = player;
        this.aiInsight = player.aiInsight || {
          strengths: [],
          weaknesses: [],
          tips: [],
        };
        this.loadingService.hide();
      },
      error: (error: any) => {
        console.error(error);
        this.loadingService.hide();
      },
    });
  }
  async changePhoto(event: any) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      this.loadingService.show();
      const photoUrl = await this.fileUpload.uploadFile(file, 'players');
      await this.playerService.updatePlayer(this.playerId!, {
        photo: photoUrl,
      });
      this.player.photo = photoUrl;
      successAlert(
        'Foto actualizada 📸🔥',
        'La foto de perfil fue actualizada correctamente.',
      );
    } catch (error) {
      console.error(error);
      errorAlert('Ups 😮‍💨', 'No se pudo actualizar la foto.');
    } finally {
      this.loadingService.hide();
    }
  }
  getPlayerComments() {
    if (!this.playerId) return;
    this.loadingService.show();
    this.ratingService.getPlayerRatings(this.playerId).subscribe({
      next: (ratings: any) => {
        this.ratings = ratings
          .flatMap((rating: any) => rating.data || [])
          .filter((item: any) => item.comment)
          .sort(
            (a: any, b: any) =>
              new Date(
                b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt,
              ).getTime() -
              new Date(
                a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt,
              ).getTime(),
          );
        this.loadingService.hide();
      },

      error: (error: any) => {
        console.error(error);
        this.loadingService.hide();
      },
    });
  }

  async updateAttribute() {
    if (!this.playerId) return;
    try {
      await this.playerService.updatePlayer(this.playerId, {
        speed: this.player.speed,
        finishing: this.player.finishing,
        vision: this.player.vision,
        stamina: this.player.stamina,
        defense: this.player.defense,
        dribbling: this.player.dribbling,
      });
    } catch (error) {
      console.error(error);
    }
  }
  async editStat(
    field: 'averageRating' | 'matchesPlayed' | 'goals' | 'assists' | 'mvps',

    currentValue: number,
  ) {
    const result = await Swal.fire({
      title: 'Editar estadística ⚽',
      input: 'number',
      inputValue: currentValue,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      background: '#020617',
      color: '#fff',
      confirmButtonColor: '#39ff14',
      cancelButtonColor: '#374151',

      customClass: {
        popup: 'futrank-swal',
        title: 'futrank-title',
        confirmButton: 'futrank-confirm',
        cancelButton: 'futrank-cancel',
        input: 'futrank-input',
      },
    });

    if (result.value === undefined || result.value === null) {
      return;
    }

    try {
      this.loadingService.show();

      const newValue = Number(result.value);

      await this.playerService.updatePlayer(this.playerId!, {
        [field]: newValue,
      });

      (this.player as any)[field] = newValue;

      this.loadingService.hide();

      await successAlert(
        'Estadística actualizada ⚽🔥',
        'Los cambios fueron guardados correctamente.',
      );
    } catch (error) {
      console.error(error);

      this.loadingService.hide();

      await errorAlert('Ups 😮‍💨', 'No se pudo actualizar la estadística.');
    }
  }
}
