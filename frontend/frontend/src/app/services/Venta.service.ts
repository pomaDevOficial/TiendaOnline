import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { Venta } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class VentaServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}api/v1/ventas`;
  }

  // Crear una nueva venta
  createVenta(venta: Venta): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, venta);
  }

  // Obtener todas las ventas
  getVentas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(this.apiUrl);
  }

  // Obtener ventas registradas
  getVentasRegistradas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/registradas`);
  }

  // Obtener ventas anuladas
  getVentasAnuladas(): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/anuladas`);
  }

  // Obtener ventas por usuario
  getVentasByUsuario(idUsuario: number): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/usuario/${idUsuario}`);
  }

  // Obtener ventas por pedido
  getVentasByPedido(idPedido: number): Observable<Venta[]> {
    return this.http.get<Venta[]>(`${this.apiUrl}/pedido/${idPedido}`);
  }

  // Obtener una venta por ID
  getVentaById(id: number): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  // Actualizar una venta
  updateVenta(id: number, venta: Venta): Observable<Venta> {
    return this.http.put<Venta>(`${this.apiUrl}/${id}`, venta);
  }

  // Anular una venta
  anularVenta(id: number): Observable<Venta> {
    return this.http.patch<Venta>(`${this.apiUrl}/${id}/anular`, {});
  }

  // Restaurar una venta
  restaurarVenta(id: number): Observable<Venta> {
    return this.http.patch<Venta>(`${this.apiUrl}/${id}/restaurar`, {});
  }
}
