import { Component, inject, OnInit } from '@angular/core';

import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Timestamp } from '@angular/fire/firestore';
import { PlayerService } from '../../core/services/player.service';
import { UploadFileService } from '../../core/services/upload-file.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';
import { errorAlert, successAlert } from '../../core/utils/alert.util';

@Component({
  selector: 'app-add-player',
  imports: [ReactiveFormsModule],
  templateUrl: './add-player.component.html',
  styleUrl: './add-player.component.css',
})
export class AddPlayerComponent implements OnInit {
  loading = false;
  playerId: string | null = null;
  editMode = false;
  selectedFile!: File;
  previewImage = 'https://i.pravatar.cc/150';
  positions = ['Arquero', 'Defensa', 'Mediocampo', 'Delantero'];
  private fb = inject(FormBuilder);
  private fileUpload = inject(UploadFileService);
  private playerService = inject(PlayerService);
  private route = inject(ActivatedRoute);
  private loadingService = inject(LoadingService);

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.playerId = params['id'];
      if (this.playerId) {
        this.editMode = true;
        this.loadPlayer();
      }
    });
  }

  playerForm = this.fb.group({
    name: ['', [Validators.required]],
    photo: ['', [Validators.required]],
    position: ['', [Validators.required]],
    preferredFoot: ['', [Validators.required]],
    numberDoc: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
  });

  async savePlayer() {
    if (this.playerForm.invalid) return;
    try {
      this.loading = true;
      let photoURL = this.previewImage;
      if (this.selectedFile) {
        photoURL = await this.fileUpload.uploadFile(
          this.selectedFile,
          'players',
        );
      }
      const player = {
        name: this.playerForm.value.name,
        photo: photoURL,
        position: this.playerForm.value.position,
        preferredFoot: this.playerForm.value.preferredFoot,
        numberDoc: this.playerForm.value.numberDoc,
      };
      if (this.editMode && this.playerId) {
        await this.playerService.updatePlayer(this.playerId, player);
        successAlert(
          'Jugador actualizado ✍️🔥',
          'Los datos del jugador fueron actualizados correctamente.',
        );
      } else {
        await this.playerService.addPlayer(
          this.playerForm.value.numberDoc as any,
          {
            id: this.playerForm.value.numberDoc as any,
            ...(player as any),
            averageRating: 0,
            goals: 0,
            assists: 0,
            mvps: 0,
            matchesPlayed: 0,
            active: true,
            speed: 60,
            finishing: 60,
            vision: 60,
            stamina: 60,
            defense: 60,
            dribbling: 60,
            createdAt: Timestamp.now(),
          },
        );
        successAlert(
          'Jugador registrado ⚽🔥',
          'El jugador fue agregado correctamente al equipo.',
        );
      }
      this.playerForm.reset();
      this.previewImage = 'https://i.pravatar.cc/150';
    } catch (error) {
      errorAlert(
        'No se pudo registrar 😮‍💨',
        'Ocurrió un error creando el jugador.',
      );
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    this.playerForm.patchValue({ photo: file });
    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
  loadPlayer() {
    if (!this.playerId) return;
    this.playerService.getPlayerById(this.playerId).subscribe({
      next: (player: any) => {
        this.playerForm.patchValue({
          name: player.name,
          position: player.position,
          preferredFoot: player.preferredFoot,
          photo: player.photo,
          numberDoc: player.numberDoc,
        });
        this.previewImage = player.photo;
      },
      error: (error: any) => {
        console.error(error);
      },
    });
  }
}
