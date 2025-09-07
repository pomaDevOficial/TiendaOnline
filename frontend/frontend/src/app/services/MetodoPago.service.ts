import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { MetodoPago } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class MetodoPagoServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}/metodopagos`;
  }

  // Crear un nuevo método de pago
  createMetodoPago(metodo: MetodoPago): Observable<MetodoPago> {
    return this.http.post<MetodoPago>(this.apiUrl, metodo);
  }

  // Obtener todos los métodos de pago
  getMetodosPago(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(this.apiUrl);
  }

  // Obtener métodos de pago registrados (activos/no eliminados)
  getMetodosPagoRegistrados(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${this.apiUrl}/registrados`);
  }

  // Obtener métodos de pago eliminados
  getMetodosPagoEliminados(): Observable<MetodoPago[]> {
    return this.http.get<MetodoPago[]>(`${this.apiUrl}/eliminados`);
  }

  // Obtener un método de pago por ID
  getMetodoPagoById(id: number): Observable<MetodoPago> {
    return this.http.get<MetodoPago>(`${this.apiUrl}/${id}`);
  }

  // Verificar si ya existe un método de pago por nombre
  verificarNombreMetodoPago(nombre: string): Observable<{ exists: boolean }> {
    return this.http.get<{ exists: boolean }>(`${this.apiUrl}/verificar-nombre/${nombre}`);
  }

  // Actualizar un método de pago
  updateMetodoPago(id: number, metodo: MetodoPago): Observable<MetodoPago> {
    return this.http.put<MetodoPago>(`${this.apiUrl}/${id}`, metodo);
  }

  // Eliminar lógicamente un método de pago
  deleteMetodoPago(id: number): Observable<MetodoPago> {
    return this.http.patch<MetodoPago>(`${this.apiUrl}/${id}/eliminar`, {});
  }

  // Restaurar un método de pago eliminado
  restaurarMetodoPago(id: number): Observable<MetodoPago> {
    return this.http.patch<MetodoPago>(`${this.apiUrl}/${id}/restaurar`, {});
  }
}
