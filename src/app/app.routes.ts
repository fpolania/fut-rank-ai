import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

export const routes: Routes = [


    {
        path: 'login',
        canActivate: [loginGuard],
        loadComponent: () =>
            import('./pages/login/login.component')
                .then(m => m.LoginComponent)
    },


    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () =>
            import('./layout/main-layout/main-layout.component')
                .then(m => m.MainLayoutComponent),

        children: [

            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full'
            },

            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./pages/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent)
            },

            {
                path: 'rate-players',
                loadComponent: () =>
                    import('./pages/rate-players/rate-players.component')
                        .then(m => m.RatePlayersComponent)
            },

            {
                path: 'player-profile',
                loadComponent: () =>
                    import('./pages/player-profile/player-profile.component')
                        .then(m => m.PlayerProfileComponent)
            },

            {
                path: 'create-match',
                loadComponent: () =>
                    import('./pages/create-match/create-match.component')
                        .then(m => m.CreateMatchComponent)
            },

            {
                path: 'rankings',
                loadComponent: () =>
                    import('./pages/rankings/rankings.component')
                        .then(m => m.RankingsComponent)
            },

            {
                path: 'match-history',
                loadComponent: () =>
                    import('./pages/match-history/match-history.component')
                        .then(m => m.MatchHistoryComponent)
            },

            {
                path: 'team-builder',
                loadComponent: () =>
                    import('./pages/team-builder/team-builder.component')
                        .then(m => m.TeamBuilderComponent)
            },
            {
                path: 'add-player',
                loadComponent: () =>
                    import('./pages/add-player/add-player.component')
                        .then(m => m.AddPlayerComponent)
            },
            {
                path: 'players',
                loadComponent: () =>
                    import('./pages/players/players.component')
                        .then(m => m.PlayersComponent)
            },
            {
                path: 'add-player/:id',
                loadComponent: () =>
                    import('./pages/add-player/add-player.component')
                        .then(m => m.AddPlayerComponent)
            }

        ]

    }

];