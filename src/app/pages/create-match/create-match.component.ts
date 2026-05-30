import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlayerService } from '../../core/services/player.service';
import { Player } from '../../core/interfaces/player.interface';
import { MatchService } from '../../core/services/match.service';
import { Timestamp } from '@angular/fire/firestore';
import { MatchPlayer } from '../../core/interfaces/match.interface';
import { LoadingService } from '../../core/services/loading.service';
import {
  errorAlert,
  successAlert,
  warningAlert,
} from '../../core/utils/alert.util';
import { CompetitionService } from '../../core/services/competition.service';
import { Competition } from '../../core/interfaces/competition.interface';
import { TeamSettingsService } from '../../core/services/settings.service';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../admin/services/subscription.service';

@Component({
  selector: 'app-create-match',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-match.component.html',
  styleUrl: './create-match.component.css',
})
export class CreateMatchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private playerService = inject(PlayerService);
  private matchService = inject(MatchService);
  private loadingService = inject(LoadingService);
  private competitionService = inject(CompetitionService);
  authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  players: Player[] = [];
  selectedPlayers: Player[] = [];
  selectedMatchType = 'FUT5';
  matchTypes: any = [];
  competitions: Competition[] = [];
  selectedCompetition: Competition | null = null;
  teamName: string = '';
  currentUser: any = null;
  matchForm = this.fb.group({
    name: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    field: ['', Validators.required],
    competitionId: ['', Validators.required],
  });
  ngOnInit(): void {
    this.getCurrentUser();
  }

  getCompetitions() {
    this.loadingService.show();
    this.competitionService.getCompetitions(this.currentUser.teamId).subscribe({
      next: (competitions) => {
        this.competitions = competitions.filter((c) => c.active);
      },
      error: (error) => {
        console.error(error);
      },
    });
    this.loadingService.hide();
  }
  getCurrentUser() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.currentUser.uid) {
          this.getName(this.currentUser.teamId);
          this.getCompetitions();
          this.getPlayers();
        }
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  async getName(teamId: string) {
    this.teamName = await this.authService.getTeamName(teamId);
    this.getTypesFut();
  }
  getTypesFut() {
    const subscription =
      this.subscriptionService.getCurrentSubscription() as any;
    if (!subscription?.types) {
      return;
    }
    this.matchTypes = subscription.types
      .split('-')
      .map((type: string) => type.trim());
  }
  getPlayers() {
    this.loadingService.show();
    this.playerService.getPlayers(this.currentUser.teamId).subscribe({
      next: (players) => {
        this.players = players;
      },
      error: (error) => {
        console.error(error);
      },
    });
    this.loadingService.hide();
  }
  selectMatchType(type: string) {
    this.selectedMatchType = type;
    this.selectedPlayers = [];
  }
  togglePlayer(player: Player) {
    const exists = this.selectedPlayers.some((p) => p.id === player.id);
    if (exists) {
      this.selectedPlayers = this.selectedPlayers.filter(
        (p) => p.id !== player.id,
      );
      return;
    }
    const limit = this.selectedMatchType === 'FUT5' ? 8 : 14;
    if (this.selectedPlayers.length >= limit) {
      warningAlert(
        'Plantilla completa ⚽🔥',
        `Solo puedes convocar ${limit} jugadores para el cotejo.`,
      );
      return;
    }
    this.selectedPlayers.push(player);
  }
  isSelected(player: Player) {
    return this.selectedPlayers.some((p) => p.id === player.id);
  }
  competitionSelected(event: any) {
    const competitionId = event.target.value;
    this.selectedCompetition =
      this.competitions.find((c) => c.id === competitionId) || null;
  }
  async createMatch() {
    debugger;
    if (this.matchForm.invalid) {
      this.matchForm.markAllAsTouched();
      return;
    }
    if (this.selectedPlayers.length === 0) {
      warningAlert(
        'Selecciona jugadores ⚽🔥',
        'Debes seleccionar al menos un jugador para crear el partido.',
      );
      return;
    }
    try {
      this.loadingService.show();
      const players: MatchPlayer[] = this.selectedPlayers.map((player) => ({
        playerId: player.id || '',
        name: player.name,
        photo: player.photo,
        position: player.position,
        team: this.teamName as any,
        rating: player.averageRating,
        goals: 0,
        assists: 0,
        isMvp: false,
        attended: true,
        teamId: player.teamId,
      }));
      const title = this.matchForm.value.name || '';
      const splitTitle = title.split(/vs/i);
      let teamA = splitTitle[0]?.trim() || this.teamName;
      let teamB = splitTitle[1]?.trim() || 'Rival';

      const isPullRequestOnRight = teamB
        .toLowerCase()
        .includes(this.teamName.toLowerCase());
      if (isPullRequestOnRight) {
        const temp = teamA;
        teamA = teamB;
        teamB = temp;
      }

      const match = {
        title,
        type: this.selectedMatchType,
        formation: this.selectedMatchType,
        field: this.matchForm.value.field || '',
        date: this.matchForm.value.date || '',
        time: this.matchForm.value.time || '',
        teamA,
        teamB,
        scoreA: 0,
        scoreB: 0,
        mvpPlayerId: '',
        players,
        createdBy: this.matchForm.value.name,
        finished: false,
        createdAt: Timestamp.now(),
        finishedAt: null,
        competitionId: this.matchForm.value.competitionId || '',
        competitionName: this.selectedCompetition?.name || '',
        status: 'En curso',
        teamId: this.currentUser.teamId,
      };

      await this.matchService.addMatch(match as any);
      successAlert(
        'Partido Creado ⚽🔥',
        `El squad ${this.teamName} fue creado correctamente.`,
      );

      this.matchForm.reset();
      this.selectedPlayers = [];
      this.selectedCompetition = null;
    } catch (error) {
      errorAlert(
        'No se pudo crear el squad 😮‍💨',
        'Verifica la información e inténtalo nuevamente.',
      );
      console.error(error);
    } finally {
      this.loadingService.hide();
    }
  }
}
