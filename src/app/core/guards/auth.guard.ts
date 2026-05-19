import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';

import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);

  const router = inject(Router);

  return new Promise((resolve) => {
    auth.onAuthStateChanged((user) => {
      if (!user) {
        router.navigate(['/login']);
        resolve(false);
        return;
      }

      resolve(true);
    });
  });
};
