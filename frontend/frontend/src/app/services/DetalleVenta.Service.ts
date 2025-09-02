import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { DetalleVenta } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class DetalleVentaServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}api/v1/detalles-venta`;
  }

  // Crear un nuevo detalle de venta
  createDetalleVenta(detalle: DetalleVenta): Observable<DetalleVenta> {
    return this.http.post<DetalleVenta>(this.apiUrl, detalle);
  }

  // Crear múltiples detalles de venta
  createMultipleDetalleVenta(detalles: DetalleVenta[]): Observable<DetalleVenta[]> {
    return this.http.post<DetalleVenta[]>(`${this.apiUrl}/multiple`, detalles);
  }

  // Obtener todos los detalles de venta
  getDetallesVenta(): Observable<DetalleVenta[]> {
    return this.http.get<DetalleVenta[]>(this.apiUrl);
  }

  // Obtener detalles de venta registrados
  getDetallesVentaRegistrados(): Observable<DetalleVenta[]> {
    return this.http.get<DetalleVenta[]>(`${this.apiUrl}/registrados`);
  }

  // Obtener detalles de venta anulados
  getDetallesVentaAnulados(): Observable<DetalleVenta[]> {
    return this.http.get<DetalleVenta[]>(`${this.apiUrl}/anulados`);
  }

  // Obtener detalles de venta por venta
  getDetallesVentaByVenta(idVenta: number): Observable<DetalleVenta[]> {
    return this.http.get<DetalleVenta[]>(`${this.apiUrl}/venta/${idVenta}`);
  }

  // Obtener detalle de venta por ID
  getDetalleVentaById(id: number): Observable<DetalleVenta> {
    return this.http.get<DetalleVenta>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un detalle de venta
  updateDetalleVenta(id: number, detalle: DetalleVenta): Observable<DetalleVenta> {
    return this.http.put<DetalleVenta>(`${this.apiUrl}/${id}`, detalle);
  }

  // Anular un detalle de venta
  anularDetalleVenta(id: number): Observable<DetalleVenta> {
    return this.http.patch<DetalleVenta>(`${this.apiUrl}/${id}/anular`, {});
  }

  // Restaurar un detalle de venta
  restaurarDetalleVenta(id: number): Observable<DetalleVenta> {
    return this.http.patch<DetalleVenta>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  // Eliminar un detalle de venta físicamente
  deleteDetalleVenta(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
