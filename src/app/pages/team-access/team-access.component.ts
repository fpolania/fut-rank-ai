import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TeamPlayersService } from '../../core/services/team-players.service';
import { TeamPlayer } from '../../core/interfaces/teamPlayer.interface';
import { CommonModule } from '@angular/common';
import {
  errorAlert,
  infoAlert,
  successAlert,
  warningAlert,
} from '../../core/utils/alert.util';
import { LoadingService } from '../../core/services/loading.service';
import { Team } from '../../admin/models/team.interface';
import { AuthService } from '../../core/services/auth.service';
import { TeamService } from '../../admin/services/team.service';

@Component({
  selector: 'app-team-access',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './team-access.component.html',
  styleUrls: ['./team-access.component.css'],
})
export class TeamAccessComponent implements OnInit {
  private fb = inject(FormBuilder);
  private teamPlayersService = inject(TeamPlayersService);
  private loadingService = inject(LoadingService);
  private teamService = inject(TeamService);
  authService = inject(AuthService);
  teamPlayerForm!: FormGroup;
  players: TeamPlayer[] = [];
  currentUser: any = null;
  loading = false;
  editingPlayerId: string | null = null;
  teams: Team[] = [];

  ngOnInit(): void {
    this.initForm();
    this.getCurrentUser();
  }
  getTeams() {
    this.teamService.getTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  initForm(): void {
    this.teamPlayerForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.pattern('^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$'),
        ],
      ],
      document: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(13),
          Validators.pattern(/^[1-9][0-9]{5,12}$/),
        ],
      ],
      role: ['player', [Validators.required]],
      teamId: [''],
    });
  }

  getPlayers(): void {
    this.loadingService.show();
    this.teamPlayersService.getPlayers(this.currentUser.teamId).subscribe({
      next: (response) => {
        this.players = response;
        this.loadingService.hide();
      },
      error: () => {
        this.loadingService.hide();
        errorAlert('Ups 😮‍💨', 'Error cargando jugadores.');
      },
    });
  }
  getCurrentUser() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.currentUser.uid) {
          this.getPlayers();
          this.getTeams();
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  async savePlayer(): Promise<void> {
    if (this.teamPlayerForm.invalid) {
      this.teamPlayerForm.markAllAsTouched();
      return;
    }
    try {
      this.loadingService.show();
      const payload = {
        ...this.teamPlayerForm.getRawValue(),
        teamId: this.currentUser.isSuperAdmin
          ? this.teamPlayerForm.value.teamId
          : this.currentUser.teamId,
      };

      if (this.editingPlayerId) {
        await this.teamPlayersService.updatePlayer(
          this.editingPlayerId,
          payload,
        );
        successAlert('Estado actualizado ⚽', 'Jugador actualizado.');
        this.editingPlayerId = null;
      } else {
        await this.teamPlayersService.createPlayer(payload);
        successAlert('Estado actualizado ⚽', 'Jugador agregado.');
      }
      this.resetForm();
    } catch {
      errorAlert('Ups 😮‍💨', 'No fue posible guardar.');
    } finally {
      this.loadingService.hide();
    }
  }
  generateAccessKey(document: string): string {
    const suffix = Math.floor(100 + Math.random() * 900);
    return `${document}${suffix}`;
  }
  validatePlayer(event: any): void {
    this.teamPlayersService
      .getPlayerByDocument(event.target.value)
      .then((existingPlayer) => {
        if (existingPlayer) {
          const accessKey = this.generateAccessKey(event.target.value);
          this.teamPlayerForm.patchValue({ document: accessKey });
          infoAlert(
            '🔑 Llave generada',
            `La llave ${accessKey} será utilizada por el jugador para ingresar a FutRankAI. Compártela con él y recuerda usar esta misma llave en el campo Documento cuando registres su perfil de jugador.`,
            accessKey,
          );
        }
      });
  }
  editPlayer(player: TeamPlayer): void {
    this.editingPlayerId = player.id || null;
    this.teamPlayerForm.patchValue({
      name: player.name,
      document: player.document,
      role: player.role,
      teamId: player.teamId,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async deletePlayer(player: TeamPlayer): Promise<void> {
    if (!player.id) return;
    try {
      this.loadingService.show();
      await this.teamPlayersService.deletePlayer(
        player.id,
        this.currentUser.teamId,
      );
      this.loadingService.hide();
      successAlert('Estado actualizado ⚽', 'Jugador eliminado.');
    } catch {
      this.loadingService.hide();
      errorAlert('Ups 😮‍💨', 'No fue posible eliminar.');
    }
  }

  resetForm(): void {
    this.teamPlayerForm.reset({
      role: 'player',
    });

    this.editingPlayerId = null;
  }
}
