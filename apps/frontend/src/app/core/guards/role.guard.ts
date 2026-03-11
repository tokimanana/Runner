// apps/frontend/src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, take } from 'rxjs';
import { selectUserRole } from '../auth/store/auth.selectors';

export const RoleGuard = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as string[];

  return store.select(selectUserRole).pipe(
    take(1),
    map((role) => {
      if (!requiredRoles || requiredRoles.includes(role!)) return true;
      return router.createUrlTree(['/dashboard']);
    })
  );
};
