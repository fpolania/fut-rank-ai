import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import { Router, RouterLink } from '@angular/router';
import { MatchService } from '../../core/services/match.service';
import { Match } from '../../core/interfaces/match.interface';

@Component({
  selector: 'app-matches',
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './matches.component.html',
  styleUrl: './matches.component.css'
})
export class MatchesComponent
  implements OnInit {
  private matchService = inject(MatchService);
  private router = inject(Router);
  matches: Match[] = [];

  ngOnInit(): void {
    this.getMatches();
  }

  getMatches() {
    this.matchService
      .getMatches()
      .subscribe({
        next: (matches) => {
          this.matches =
            matches;
        },
        error: (error) => {
          console.error(error);
        }
      });
  }

  openMatch(match: Match) {
    this.router.navigate([
      '/match-detail',
      match.id
    ]);
  }

}