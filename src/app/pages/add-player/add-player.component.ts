import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { Timestamp } from '@angular/fire/firestore';
import { PlayerService } from '../../core/services/player.service';
import { UploadFileService } from '../../core/services/upload-file.service';
import { ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../core/services/loading.service';
import {
  errorAlert,
  successAlert,
  warningAlert,
} from '../../core/utils/alert.util';
import { AuthService } from '../../core/services/auth.service';
import { TeamPlayersService } from '../../core/services/team-players.service';

@Component({
  selector: 'app-add-player',
  imports: [ReactiveFormsModule],
  templateUrl: './add-player.component.html',
  styleUrl: './add-player.component.css',
})
export class AddPlayerComponent implements OnInit {
  @ViewChild('photoInput')
  photoInput!: ElementRef<HTMLInputElement>;
  authService = inject(AuthService);
  private teamPlayersService = inject(TeamPlayersService);
  private fb = inject(FormBuilder);
  private fileUpload = inject(UploadFileService);
  private playerService = inject(PlayerService);
  private route = inject(ActivatedRoute);
  private loadingService = inject(LoadingService);
  playerId: string | null = null;
  editMode = false;
  selectedFile!: File;
  previewImage = 'https://i.pravatar.cc/150';
  positions = ['Arquero', 'Defensa', 'Mediocampo', 'Delantero'];
  currentUser: any = null;
  playerForm: FormGroup;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.playerId = params['id'];
      if (this.playerId) {
        this.editMode = true;
        this.loadPlayer();
      }
    });
    this.initForm();
    this.getCurrentUser();
  }
  initForm() {
    this.playerForm = this.fb.group({
      name: ['', [Validators.required]],
      photo: ['', [Validators.required]],
      position: ['', [Validators.required]],
      preferredFoot: ['', [Validators.required]],
      numberDoc: [
        {
          value: '',
          disabled: this.editMode,
        },
        [Validators.required, Validators.pattern(/^[0-9]{6,13}$/)],
      ],
    });
  }
  getCurrentUser() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  async savePlayer() {
    if (this.playerForm.invalid) return;
    try {
      this.loadingService.show();
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
        teamId: this.currentUser.teamId,
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
      this.resetForm();
    } catch (error) {
      errorAlert(
        'No se pudo registrar 😮‍💨',
        'Ocurrió un error creando el jugador.',
      );
      console.error(error);
    } finally {
      this.loadingService.hide();
    }
  }
  async validatePlayerKey(event: any) {
    const document = event.target.value;
    if (!document) {
      return;
    }
    try {
      this.loadingService.show();
      const access =
        await this.teamPlayersService.getPlayerByDocument(document);
      if (!access) {
        warningAlert(
          'Acceso no encontrado',
          'La llave ingresada no existe en Gestión de Accesos. Primero debes ir a la pagina de Team Access para crear el acceso del jugador.',
        );
        this.playerForm.patchValue({
          numberDoc: '',
        });
        return;
      }

      this.playerForm.patchValue({
        numberDoc: access.document,
        name: access.name,
      });

      successAlert(
        'Jugador encontrado ⚽',
        `${access.name} fue encontrado en Gestión de Accesos. La llave fue validada correctamente y ya puedes completar la información restante para registrar al jugador.`,
      );
    } catch (error) {
      console.error(error);
      errorAlert('Error', 'No fue posible validar la llave ingresada.');
    } finally {
      this.loadingService.hide();
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
  resetForm() {
    this.playerForm.reset();
    this.previewImage = 'https://i.pravatar.cc/150';
    this.selectedFile = null as any;
    if (this.photoInput) {
      this.photoInput.nativeElement.value = '';
    }
  }
}
