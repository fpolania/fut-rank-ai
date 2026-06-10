import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../../core/services/match.service';
import { Match } from '../../core/interfaces/match.interface';
import { AuthService } from '../../core/services/auth.service';
import { errorAlert, successAlert } from '../../core/utils/alert.util';
import { LoadingService } from '../../core/services/loading.service';
import { CompetitionService } from '../../core/services/competition.service';
import { Competition } from '../../core/interfaces/competition.interface';

@Component({
  selector: 'app-matches',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.css',
})
export class MatchesComponent implements OnInit {
  private matchService = inject(MatchService);
  private router = inject(Router);
  private loadingService = inject(LoadingService);
  private competitionService = inject(CompetitionService);
  authService = inject(AuthService);

  matches: Match[] = [];
  filteredMatches: Match[] = [];
  competitions: Competition[] = [];
  selectedFilter = 'Todos';
  currentUser: any = null;
  selectedCompetitionFilter = '';

  ngOnInit(): void {
    this.getCurrentUser();
  }

  applyFilters() {
    this.loadingService.show();
    let filtered = [...this.matches];

    if (this.selectedFilter === 'En curso') {
      filtered = filtered.filter((match) => !match.finished);
    }

    if (this.selectedFilter === 'Finalizados') {
      filtered = filtered.filter((match) => match.finished);
    }

    if (this.selectedCompetitionFilter) {
      filtered = filtered.filter(
        (match) => match.competitionId === this.selectedCompetitionFilter,
      );
    }

    this.filteredMatches = filtered;
    this.loadingService.hide();
  }

  getMatches() {
    this.matchService.getMatches(this.currentUser.teamId).subscribe({
      next: (matches) => {
        this.matches = matches;
        this.filteredMatches = matches;
      },
      error: (error) => {
        console.error(error);
      },
    });
  }
  getCurrentUser() {
    this.authService.currentUser.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (this.currentUser.uid) {
          this.getMatches();
          this.getCompetitions();
        }
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
    if (!match.id) {
      return;
    }
    try {
      this.loadingService.show();
      await this.matchService.deleteMatch(match.id, this.currentUser.teamId);
      successAlert(
        'Partido eliminado ⚽🔥',
        'El partido fue eliminado correctamente.',
      );
    } catch (error) {
      console.error(error);
      errorAlert('Ups 😮‍💨', 'No se pudo eliminar el partido.');
    } finally {
      this.loadingService.hide();
    }
  }

  getCompetitions() {
    this.loadingService.show();
    this.competitionService.getCompetitions(this.currentUser.teamId).subscribe({
      next: (competitions) => {
        this.competitions = competitions.filter((c) => c.active);
        this.loadingService.hide();
      },
      error: (error) => {
        console.error(error);
      },
      complete: () => {
        this.loadingService.hide();
      },
    });
  }
  getCompetitionName(): string {
    const competition = this.competitions.find(
      (c) => c.id === this.selectedCompetitionFilter,
    );
    return competition?.name || '';
  }
}
