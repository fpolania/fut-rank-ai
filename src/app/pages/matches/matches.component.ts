import { Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Router, RouterLink } from '@angular/router';
import { MatchService } from '../../core/services/match.service';
import { Match } from '../../core/interfaces/match.interface';
import { AuthService } from '../../core/services/auth.service';
import { errorAlert, successAlert } from '../../core/utils/alert.util';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-matches',
  imports: [CommonModule, RouterLink],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.css',
})
export class MatchesComponent implements OnInit {
  private matchService = inject(MatchService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);

  authService = inject(AuthService);
  matches: Match[] = [];

  ngOnInit(): void {
    this.getMatches();
  }

  getMatches() {
    this.matchService.getMatches().subscribe({
      next: (matches) => {
        this.matches = matches;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }

  openMatch(match: Match) {
    this.router.navigate(['/match-detail', match.id]);
  }
  async deleteMatch(event: Event, match: Match) {
    event.stopPropagation();
    if (!match.id) return;
    try {
      this.loadingService.show();
      await this.matchService.deleteMatch(match.id);
      this.loadingService.hide();
      successAlert(
        'Partido eliminado ⚽🔥',
        'El partido fue eliminado correctamente.',
      );
    } catch (error) {
      console.error(error);
      this.loadingService.hide();
      errorAlert('Ups 😮‍💨', 'No se pudo eliminar el partido.');
    }
  }
}
