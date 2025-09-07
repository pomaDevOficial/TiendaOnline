import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { TipoComprobante } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class TipoComprobanteServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}/tipocomprobante`;
  }

  // Crear un nuevo tipo de comprobante
  createTipoComprobante(tipo: TipoComprobante): Observable<TipoComprobante> {
    return this.http.post<TipoComprobante>(this.apiUrl, tipo);
  }

  // Obtener todos los tipos de comprobante
  getTiposComprobante(): Observable<TipoComprobante[]> {
    return this.http.get<TipoComprobante[]>(this.apiUrl);
  }

  // Obtener tipos de comprobante registrados
  getTiposComprobanteRegistrados(): Observable<TipoComprobante[]> {
    return this.http.get<TipoComprobante[]>(`${this.apiUrl}/registrados`);
  }

  // Obtener tipos de comprobante eliminados
  getTiposComprobanteEliminados(): Observable<TipoComprobante[]> {
    return this.http.get<TipoComprobante[]>(`${this.apiUrl}/eliminados`);
  }

  // Obtener tipo de comprobante por ID
  getTipoComprobanteById(id: number): Observable<TipoComprobante> {
    return this.http.get<TipoComprobante>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un tipo de comprobante
  updateTipoComprobante(id: number, tipo: TipoComprobante): Observable<TipoComprobante> {
    return this.http.put<TipoComprobante>(`${this.apiUrl}/${id}`, tipo);
  }

  // Eliminar (lógicamente) un tipo de comprobante
  deleteTipoComprobante(id: number): Observable<TipoComprobante> {
    return this.http.patch<TipoComprobante>(`${this.apiUrl}/${id}/eliminar`, {});
  }

  // Restaurar un tipo de comprobante
  restaurarTipoComprobante(id: number): Observable<TipoComprobante> {
    return this.http.patch<TipoComprobante>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  // Verificar si existe un tipo de comprobante por nombre
  verificarNombre(nombre: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/verificar-nombre/${nombre}`);
  }
}
