import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PlayerService } from '../../core/services/player.service';
import { Player } from '../../core/interfaces/player.interface';
import { MatchService } from '../../core/services/match.service';
import { Timestamp } from '@angular/fire/firestore';
import { MatchPlayer } from '../../core/interfaces/match.interface';

@Component({
  selector: 'app-create-match',
  imports: [CommonModule,
    ReactiveFormsModule],
  templateUrl: './create-match.component.html',
  styleUrl: './create-match.component.css'
})
export class CreateMatchComponent implements OnInit {
  private fb = inject(FormBuilder);
  private playerService = inject(PlayerService);
  private matchService = inject(MatchService);
  players: Player[] = [];
  selectedPlayers: Player[] = [];
  selectedMatchType = 'FUT 5';
  matchTypes = [
    'FUT 5',
    'FUT 8'
  ];
  matchForm =
    this.fb.group({
      name: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      field: ['', Validators.required]
    });
  ngOnInit(): void {
    this.getPlayers();
  }
  getPlayers() {
    this.playerService
      .getPlayers()
      .subscribe({
        next: (players) => {
          this.players = players;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }
  selectMatchType(type: string) {
    this.selectedMatchType = type;
    this.selectedPlayers = [];
  }
  togglePlayer(player: Player) {
    const exists =
      this.selectedPlayers
        .some(p => p.id === player.id);
    if (exists) {
      this.selectedPlayers = this.selectedPlayers.filter(
        p => p.id !== player.id);
      return;
    }
    const limit =
      this.selectedMatchType ===
        'FUT 5'
        ? 10
        : 16;

    if (this.selectedPlayers.length >= limit) {
      alert(
        `Solo puedes seleccionar ${limit} jugadores`
      );
      return;
    }
    this.selectedPlayers.push(player);
  }
  isSelected(player: Player) {
    return this.selectedPlayers.some(
      p => p.id === player.id
    );
  }
  async createMatch() {
    if (
      this.matchForm.invalid
    ) {
      this.matchForm.markAllAsTouched();
      return;
    }
    try {
      const players:
        MatchPlayer[] =
        this.selectedPlayers.map(
          (
            player,
            index
          ) => ({
            playerId: player.id || '',
            name: player.name,
            photo: player.photo,
            position: player.position,
            team:
              index < (
                this.selectedPlayers.length / 2
              )
                ? 'A'
                : 'B',
            rating: player.averageRating,
            goals: 0,
            assists: 0,
            isMvp: false
          })
        );
      const title = this.matchForm.value.name || '';
      const splitTitle = title.split(/vs/i);
      const teamA = splitTitle[0]?.trim() || 'Equipo A';
      const teamB = splitTitle[1]?.trim() || 'Equipo B';
      const match = {
        title,
        type: this.selectedMatchType,
        formation: this.selectedMatchType,
        field: this.matchForm.value.field || '',
        date: this.matchForm.value.date || '',
        time: this.matchForm.value.time || '',
        teamA: teamA,
        teamB: teamB,
        scoreA: 0,
        scoreB: 0,
        mvpPlayerId: '',
        players,
        createdBy: this.matchForm.value.name,
        finished: false,
        createdAt: Timestamp.now()
      };

      await this.matchService
        .addMatch(match as any);
      alert(
        'Partido creado 😮‍💨🔥'
      );
      this.matchForm.reset();
      this.selectedPlayers = [];
    } catch (error) {
      console.error(error);
    }
  }
}
