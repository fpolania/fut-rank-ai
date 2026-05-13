import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';
import { JoinTeamComponent } from './pages/join-team/join-team.component';

export const routes: Routes = [
  { path: 'join-team', component: JoinTeamComponent },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },

  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent,
      ),

    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },

      {
        path: 'rate-players',
        loadComponent: () =>
          import('./pages/rate-players/rate-players.component').then(
            (m) => m.RatePlayersComponent,
          ),
      },
      {
        path: 'rate-players/:id',
        loadComponent: () =>
          import('./pages/rate-player-detail/rate-player-detail.component').then(
            (m) => m.RatePlayerDetailComponent,
          ),
      },
      {
        path: 'player-profile/:id',
        loadComponent: () =>
          import('./pages/player-profile/player-profile.component').then(
            (m) => m.PlayerProfileComponent,
          ),
      },

      {
        path: 'create-match',
        loadComponent: () =>
          import('./pages/create-match/create-match.component').then(
            (m) => m.CreateMatchComponent,
          ),
      },

      {
        path: 'rankings',
        loadComponent: () =>
          import('./pages/rankings/rankings.component').then(
            (m) => m.RankingsComponent,
          ),
      },

      {
        path: 'match-history',
        loadComponent: () =>
          import('./pages/match-history/match-history.component').then(
            (m) => m.MatchHistoryComponent,
          ),
      },

      {
        path: 'team-builder',
        loadComponent: () =>
          import('./pages/team-builder/team-builder.component').then(
            (m) => m.TeamBuilderComponent,
          ),
      },
      {
        path: 'add-player',
        loadComponent: () =>
          import('./pages/add-player/add-player.component').then(
            (m) => m.AddPlayerComponent,
          ),
      },
      {
        path: 'players',
        loadComponent: () =>
          import('./pages/players/players.component').then(
            (m) => m.PlayersComponent,
          ),
      },
      {
        path: 'add-player/:id',
        loadComponent: () =>
          import('./pages/add-player/add-player.component').then(
            (m) => m.AddPlayerComponent,
          ),
      },
      {
        path: 'matches',
        loadComponent: () =>
          import('./pages/matches/matches.component').then(
            (m) => m.MatchesComponent,
          ),
      },
      {
        path: 'match-detail/:id',
        loadComponent: () =>
          import('./pages/match-detail/match-detail.component').then(
            (m) => m.MatchDetailComponent,
          ),
      },
      {
        path: 'team-applications',
        loadComponent: () =>
          import('./pages/team-applications/team-applications.component').then(
            (m) => m.TeamApplicationsComponent,
          ),
      },
      {
        path: 'team-access',
        loadComponent: () =>
          import('./pages/team-access/team-access.component').then(
            (m) => m.TeamAccessComponent,
          ),
      },
    ],
  },
];
