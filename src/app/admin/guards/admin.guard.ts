import { inject } from '@angular/core';

import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export const adminGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = await new Promise<any>((resolve) => {
    authService.currentUser.subscribe(resolve);
  });

  if (user?.isSuperAdmin) {
    return true;
  }
  router.navigateByUrl('/');
  return false;
};
