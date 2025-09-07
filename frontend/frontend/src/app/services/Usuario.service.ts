import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { Usuario } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class UsuarioServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}/usuarios`;
  }

  // Crear un nuevo usuario
  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  // Obtener todos los usuarios
  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  // Obtener usuario por ID
  getUsuarioById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  // Actualizar usuario por ID
  updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }
  // Activar usuario
  activarUsuario(idUsuario: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${idUsuario}/activar`, {});
  }
  // Activar usuario
  desactivarUsuario(idUsuario: number): Observable<Usuario> {
    return this.http.patch<Usuario>(`${this.apiUrl}/${idUsuario}/desactivar`, {});
  }
}
