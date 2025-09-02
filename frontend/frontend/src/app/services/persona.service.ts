import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { Persona } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class PersonaServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}api/v1/personas`;
  }

  // Crear una nueva persona
  createPersona(persona: Persona): Observable<Persona> {
    return this.http.post<Persona>(this.apiUrl, persona);
  }

  // Obtener todas las personas
  getPersonas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(this.apiUrl);
  }

  // Obtener solo personas registradas
  getPersonasRegistradas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiUrl}/registradas`);
  }

  // Obtener solo personas eliminadas
  getPersonasEliminadas(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiUrl}/eliminadas`);
  }

  // Verificar si existe una persona por DNI
  verificarDni(nroidentidad: string): Observable<{ existe: boolean }> {
    return this.http.get<{ existe: boolean }>(`${this.apiUrl}/verificar-dni/${nroidentidad}`);
  }

  // Obtener persona por ID
  getPersonaById(id: number): Observable<Persona> {
    return this.http.get<Persona>(`${this.apiUrl}/${id}`);
  }

  // Actualizar persona por ID
  updatePersona(id: number, persona: Persona): Observable<Persona> {
    return this.http.put<Persona>(`${this.apiUrl}/${id}`, persona);
  }

  // Eliminar persona (cambio de estado lógico)
  eliminarPersona(id: number): Observable<Persona> {
    return this.http.patch<Persona>(`${this.apiUrl}/${id}/eliminar`, {});
  }

  // Restaurar persona eliminada
  restaurarPersona(id: number): Observable<Persona> {
    return this.http.patch<Persona>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  // Obtener lista de clientes
  getClientes(): Observable<Persona[]> {
    return this.http.get<Persona[]>(`${this.apiUrl}/clientes`);
  }
}
