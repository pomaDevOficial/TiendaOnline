import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { Rol } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class RolServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}api/v1/roles`;
  }

  // Crear un nuevo rol
  createRol(rol: Rol): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }

  // Obtener todos los roles
  getRoles(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  // Obtener solo roles registrados (activos/no eliminados)
  getRolesRegistrados(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/registrados`);
  }

  // Obtener solo roles eliminados
  getRolesEliminados(): Observable<Rol[]> {
    return this.http.get<Rol[]>(`${this.apiUrl}/eliminados`);
  }

  // Obtener rol por ID
  getRolById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un rol por ID
  updateRol(id: number, rol: Rol): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${id}`, rol);
  }

  // Eliminar lógicamente un rol (cambiar estado a eliminado)
  deleteRol(id: number): Observable<Rol> {
    return this.http.patch<Rol>(`${this.apiUrl}/${id}/eliminar`, {});
  }

  // Restaurar un rol eliminado
  restaurarRol(id: number): Observable<Rol> {
    return this.http.patch<Rol>(`${this.apiUrl}/${id}/restaurar`, {});
  }
}
