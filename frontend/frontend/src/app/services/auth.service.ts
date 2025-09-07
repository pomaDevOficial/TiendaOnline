import { Inject, Injectable , InjectionToken, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { NotificationService } from '../shared/services/Notification.service';
import { GlobalService } from '../shared/services/Global.service';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private notify: NotificationService,
    private globalService: GlobalService
  ) {
    this.apiUrl = `${environment.endpoint}`;
  }

  // Método para hacer login y guardar el token
  login(usuario: string, contrasenia: string): Observable<boolean> {
    const credentials = { usuario, contrasenia };

    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.notify.showSuccess('Inicio de Sesión Exitoso');
          console.log("SESION INICIADA");

          // Guardar datos en localStorage
          //if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('idusuario', response.user.id);
            localStorage.setItem('rol', response.user.rol.toString());
            localStorage.setItem('idrol', response.user.idrol);
            localStorage.setItem('usuario', response.user.usuario);
            console.log('Token guardado:', localStorage.getItem('token'));
          //}
          // Redirigir según el rol del usuario
          console.log(response.user.rol)
          if (response.user.idrol === 1) {
            this.globalService.navegar('/Admin');
          }
        } else {
          console.log("SESION NO INICIADA");
          this.notify.showError('Respuesta del servidor no válida');
        }
      }),
      catchError((error) => {
        if (error.status === 404 || error.status === 401) {
          this.notify.showWarning('Usuario o contraseña incorrectos');
        } else {
          this.notify.showError('Error inesperado en el inicio de sesión');
        }
        return of(false);
      })
    );
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      if (!tokenData.exp) {
        console.warn('El token no tiene fecha de expiración.');
        return true;
      }

      const expirationTime = tokenData.exp * 1000;
      const currentTime = new Date().getTime();
      return currentTime > expirationTime;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return true;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    console.log('Token actual:', token);
    console.log('Token expirado:', this.isTokenExpired());
    return !!token && !this.isTokenExpired();
  }

  getUsuario(): string | null {
    if (isPlatformBrowser(this.platformId)) {  // Verificamos si estamos en el navegador
      return localStorage.getItem('usuario');
    }
    return null;  // Si no estamos en el navegador, retornamos null
  }

  getRol(): number {
    if (isPlatformBrowser(this.platformId)) {
      const rol = localStorage.getItem('idrol');
      console.log('Rol en localStorage:', rol);
      return rol ? Number(rol) : 0; // Devuelve 0 si no hay rol
    }
    return 0; // Devuelve 0 si no hay rol
  }

  getIdUsuario(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('idusuario') ? Number(localStorage.getItem('idusuario')) : null;
    }
    return null;
  }

  getEmpleado(): number | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('empleado') ? Number(localStorage.getItem('empleado')) : null;
    }
    return null;
  }

  logout(): void {
  

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('idusuario');
      localStorage.removeItem('rol');
      localStorage.removeItem('idrol');
      localStorage.removeItem('usuario');
    }
    this.notify.showInfo('Sesión cerrada');
    this.globalService.navegar('/login');
  }
}


