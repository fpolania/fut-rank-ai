import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';

import { MatchService } from '../../core/services/match.service';

import { Match } from '../../core/interfaces/match.interface';

@Component({
  selector: 'app-rate-players',
  imports: [CommonModule],
  templateUrl: './rate-players.component.html',
  styleUrl: './rate-players.component.css',
})
export class RatePlayersComponent implements OnInit {
  private matchService = inject(MatchService);
  private router = inject(Router);
  matches: Match[] = [];
  ngOnInit(): void {
    this.getMatches();
  }
  getMatches() {
    this.matchService.getMatches().subscribe({
      next: (matches) => {
        this.matches = matches
          .filter((match) => {
            if (!match.finished) return false;
            if (!match.finishedAt) return false;
            const finishDate = match.finishedAt.toDate();
            const now = new Date();
            const diffHours =
              (now.getTime() - finishDate.getTime()) / (1000 * 60 * 60);
            return diffHours <= 24;
          })
          .reverse();
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
