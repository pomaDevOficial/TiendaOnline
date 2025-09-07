import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { Comprobante } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class ComprobanteServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}/comprobantes`;
  }

  // Crear un nuevo comprobante
  createComprobante(comprobante: Comprobante): Observable<Comprobante> {
    return this.http.post<Comprobante>(this.apiUrl, comprobante);
  }

  // Crear venta completa con comprobante
  crearVentaCompletaConComprobante(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/venta-completa/admin`, data);
  }

  // Obtener todos los comprobantes
  getComprobantes(): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(this.apiUrl);
  }

  // Obtener comprobantes registrados
  getComprobantesRegistrados(): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(`${this.apiUrl}/registrados`);
  }

  // Obtener comprobantes anulados
  getComprobantesAnulados(): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(`${this.apiUrl}/anulados`);
  }

  // Obtener comprobantes por fecha
  getComprobantesByFecha(fechaInicio: string, fechaFin: string): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(
      `${this.apiUrl}/fecha?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    );
  }

  // Obtener comprobantes por venta
  getComprobantesByVenta(idVenta: number): Observable<Comprobante[]> {
    return this.http.get<Comprobante[]>(`${this.apiUrl}/venta/${idVenta}`);
  }

  // Obtener comprobante por ID
  getComprobanteById(id: number): Observable<Comprobante> {
    return this.http.get<Comprobante>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un comprobante
  updateComprobante(id: number, comprobante: Comprobante): Observable<Comprobante> {
    return this.http.put<Comprobante>(`${this.apiUrl}/${id}`, comprobante);
  }

  // Anular comprobante
  anularComprobante(id: number): Observable<Comprobante> {
    return this.http.patch<Comprobante>(`${this.apiUrl}/${id}/anular`, {});
  }

  // Restaurar comprobante
  restaurarComprobante(id: number): Observable<Comprobante> {
    return this.http.patch<Comprobante>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  // Eliminar comprobante físicamente
  deleteComprobante(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
