import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
     const token = this.auth.getToken();
    const authenticated = this.auth.isAuthenticated();

    if (token && authenticated) {
        // Si hay token y no está expirado → redirigir a Admin
        this.router.navigate(['/Admin']);
        return false;
    }

    return true; // Usuario no está logeado → permite acceder a login
  }
}
