import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { MatchService } from '../../core/services/match.service';
import { Match } from '../../core/interfaces/match.interface';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-rate-players',
  imports: [CommonModule],
  templateUrl: './rate-players.component.html',
  styleUrl: './rate-players.component.css',
})
export class RatePlayersComponent implements OnInit {
  private matchService = inject(MatchService);
  private router = inject(Router);

  authService = inject(AuthService);

  matches: Match[] = [];
  currentUser: any = null;

  ngOnInit(): void {
    this.getCurrentUser();
  }

  getCurrentUser() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;

        if (this.currentUser?.uid) {
          this.getMatches();
        }
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  getMatches() {
    this.matchService.getMatches(this.currentUser.teamId).subscribe({
      next: (matches) => {
        this.matches = matches
          .filter((match) => {
            if (!match.finished) {
              return false;
            }
            if (!match.finishedAt) {
              return false;
            }
            const finishDate = match.finishedAt.toDate();
            const now = new Date();

            const diffHours =
              (now.getTime() - finishDate.getTime()) / (1000 * 60 * 60);

            if (diffHours > 24) {
              return false;
            }
            const currentPlayer = match.players.find(
              (player: any) =>
                String(player.playerId) === String(this.currentUser.document),
            );
            return currentPlayer?.attended === true;
          })
          .reverse();

        console.log(this.matches);
      },

      error: (error) => {
        console.error(error);
      },
    });
  }

  openRate(match: Match) {
    this.router.navigate(['/rate-players', match.id]);
  }
}
