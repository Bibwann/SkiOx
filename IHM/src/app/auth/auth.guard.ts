import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const role = this.auth.getRole();
    if (!role) {
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }

    // Determine required role from route path
    const routePath = route.routeConfig?.path ?? '';
    if (routePath.includes('sauveteur') && role !== 'sauveteur') {
      // redirect to the proper module if user authenticated but wrong role
      return this.router.createUrlTree(['/' + role]);
    }
    if (routePath.includes('sportif') && role !== 'sportif') {
      return this.router.createUrlTree(['/' + role]);
    }

    return true;
  }
}
