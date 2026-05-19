import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute } from '@angular/router';

import { MatchService } from '../../core/services/match.service';

import { Match, MatchPlayer } from '../../core/interfaces/match.interface';

import { PlayerService } from '../../core/services/player.service';

import { LoadingService } from '../../core/services/loading.service';

import { successAlert, errorAlert } from '../../core/utils/alert.util';
import { AuthService } from '../../core/services/auth.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-match-detail',
  imports: [CommonModule],
  templateUrl: './match-detail.component.html',

  styleUrl: './match-detail.component.css',
})
export class MatchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private matchService = inject(MatchService);
  private playerService = inject(PlayerService);
  private loadingService = inject(LoadingService);
  authService = inject(AuthService);
  matchId: string | null = null;
  match!: Match;

  ngOnInit(): void {
    this.matchId = this.route.snapshot.paramMap.get('id');

    if (this.matchId) {
      this.getMatch();
    }
  }

  getMatch(): void {
    if (!this.matchId) return;

    this.matchService.getMatchById(this.matchId).subscribe({
      next: (match: any) => {
        this.match = match;
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  increaseGoals(player: MatchPlayer): void {
    player.goals++;

    this.calculateScore();
  }

  decreaseGoals(player: MatchPlayer): void {
    if (player.goals <= 0) return;

    player.goals--;

    this.calculateScore();
  }

  increaseAssists(player: MatchPlayer): void {
    player.assists++;
  }

  decreaseAssists(player: MatchPlayer): void {
    if (player.assists <= 0) return;

    player.assists--;
  }

  calculateScore(): void {
    this.match.scoreA = this.match.players.reduce(
      (acc, player) => acc + player.goals,

      0,
    );
  }

  getMatchResult(): string {
    if (this.match.scoreA > this.match.scoreB) {
      return '🏆 Ganado';
    }

    if (this.match.scoreA < this.match.scoreB) {
      return '💀 Perdido';
    }

    return '🤝 Empatado';
  }

  async updatePlayerStats(player: MatchPlayer): Promise<void> {
    const currentPlayer = await new Promise<any>((resolve) => {
      this.playerService
        .getPlayerById(player.playerId)
        .subscribe((data) => resolve(data));
    });

    const totalMatches = currentPlayer.matchesPlayed + 1;

    await this.playerService.updatePlayerStats(player.playerId, {
      goals: currentPlayer.goals + player.goals,

      assists: currentPlayer.assists + player.assists,

      matchesPlayed: totalMatches,
    });
  }

  async finishMatch(): Promise<void> {
    this.loadingService.show();
    if (!this.matchId || this.match.finished) return;
    try {
      for (const player of this.match.players) {
        if (!player.attended) continue;
        await this.updatePlayerStats(player);
      }
      const result = this.getMatchResult();
      const cleanPlayers = this.match.players.map((player) => ({
        playerId: player.playerId,
        name: player.name,
        photo: player.photo,
        position: player.position,
        team: player.team,
        goals: player.goals,
        assists: player.assists,
        attended: player.attended,
      }));

      this.match.finished = true;
      await this.matchService.updateMatch(this.matchId, {
        finished: true,
        result,
        scoreA: this.match.scoreA,
        scoreB: this.match.scoreB,
        players: cleanPlayers,
        finishedAt: Timestamp.now(),
        status: 'Finalizado',
      });

      successAlert(
        'Partido finalizado ⚽🔥',
        'Las estadísticas fueron actualizadas correctamente.',
      );
    } catch (error) {
      errorAlert('Ups 😮‍💨', 'Ocurrió un error finalizando el partido.');

      console.error(error);
    } finally {
      this.loadingService.hide();
    }
  }

  increaseEnemyScore(): void {
    this.match.scoreB++;
  }

  decreaseEnemyScore(): void {
    if (this.match.scoreB <= 0) return;

    this.match.scoreB--;
  }
}
