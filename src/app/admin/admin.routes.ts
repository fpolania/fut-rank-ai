import { Routes } from '@angular/router';

import { AdminPlansComponent } from './pages/plans/admin-plans/admin-plans.component';

import { AdminSubscriptionsComponent } from './pages/subscriptions/admin-subscriptions/admin-subscriptions.component';

import { AdminTeamsComponent } from './pages/teams/admin-teams/admin-teams.component';

import { adminGuard } from './guards/admin.guard';

export const adminRoutes: Routes = [
  {
    path: '',

    canActivate: [adminGuard],

    children: [

      {
        path: 'plans',

        component: AdminPlansComponent,
      },

      {
        path: 'teams',

        component: AdminTeamsComponent,
      },

      {
        path: 'subscriptions',

        component: AdminSubscriptionsComponent,
      },
    ],
  },
];
