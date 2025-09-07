import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { LoteTalla } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class LoteTallaServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}/lotetallas`;
  }

  // Crear un nuevo lote_talla
  createLoteTalla(loteTalla: LoteTalla): Observable<LoteTalla> {
    return this.http.post<LoteTalla>(this.apiUrl, loteTalla);
  }

  // Obtener la lista de todos los lotes_talla
  getLotesTalla(): Observable<LoteTalla[]> {
    return this.http.get<LoteTalla[]>(this.apiUrl);
  }

  // Obtener solo lotes_talla disponibles
  getLotesTallaDisponibles(): Observable<LoteTalla[]> {
    return this.http.get<LoteTalla[]>(`${this.apiUrl}/disponibles`);
  }

  // Obtener solo lotes_talla eliminados
  getLotesTallaEliminados(): Observable<LoteTalla[]> {
    return this.http.get<LoteTalla[]>(`${this.apiUrl}/eliminados`);
  }

  // Obtener lotes_talla por lote
  getLotesTallaByLote(idlote: number): Observable<LoteTalla[]> {
    return this.http.get<LoteTalla[]>(`${this.apiUrl}/lote/${idlote}`);
  }

  // Obtener productos disponibles por talla (para catálogo)
  getProductosDisponiblesPorTalla(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalogo/talla`);
  }

  // CATÁLOGO Y INVENTARIO
  // Catálogo con filtros
  getProductosDisponibles(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/catalogo`, { params });
  }

  // Tallas por producto
  getTallasDisponibles(params?: any): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tallas`, { params });
  }

  // Verificación de stock
  verificarStock(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stock`, { params });
  }

  // Obtener un lote_talla por ID
  getLoteTallaById(id: number): Observable<LoteTalla> {
    return this.http.get<LoteTalla>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un lote_talla por ID
  updateLoteTalla(id: number, loteTalla: LoteTalla): Observable<LoteTalla> {
    return this.http.put<LoteTalla>(`${this.apiUrl}/${id}`, loteTalla);
  }

  // Cambiar estado del lote_talla (disponible/agotado)
  cambiarEstadoLoteTalla(id: number, estado: any): Observable<LoteTalla> {
    return this.http.patch<LoteTalla>(`${this.apiUrl}/${id}/estado`, estado);
  }

  // Eliminar lógicamente un lote_talla (cambiar estado a eliminado)
  deleteLoteTalla(id: number): Observable<LoteTalla> {
    return this.http.patch<LoteTalla>(`${this.apiUrl}/${id}/eliminar`, {});
  }

  // Restaurar un lote_talla eliminado
  restaurarLoteTalla(id: number): Observable<LoteTalla> {
    return this.http.patch<LoteTalla>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  // Agregar stock a un lote_talla específico
  agregarStockPorLoteTalla(stockData: any): Observable<LoteTalla> {
    return this.http.patch<LoteTalla>(`${this.apiUrl}/agregar-stock`, stockData);
  }
}