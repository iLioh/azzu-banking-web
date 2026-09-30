import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { SessionService } from './session.service';

export const sessionGuard: CanActivateFn = () => {
  const session = inject(SessionService);
  const router = inject(Router);
  return session.ensureAuthenticated().pipe(
    map((authenticated) => authenticated || router.createUrlTree(['/auth'])),
  );
};
