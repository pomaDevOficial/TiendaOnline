import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { MovimientoLote } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class MovimientoLoteService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}api/v1/movimientoslote`;
  }

  // Crear un nuevo movimiento
  createMovimiento(movimiento: MovimientoLote): Observable<MovimientoLote> {
    return this.http.post<MovimientoLote>(this.apiUrl, movimiento);
  }

  // Obtener todos los movimientos
  getMovimientos(): Observable<MovimientoLote[]> {
    return this.http.get<MovimientoLote[]>(this.apiUrl);
  }

  // Obtener movimientos registrados
  getMovimientosRegistrados(): Observable<MovimientoLote[]> {
    return this.http.get<MovimientoLote[]>(`${this.apiUrl}/registrados`);
  }

  // Obtener movimientos eliminados
  getMovimientosEliminados(): Observable<MovimientoLote[]> {
    return this.http.get<MovimientoLote[]>(`${this.apiUrl}/eliminados`);
  }

  // Obtener movimientos por lote_talla
  getMovimientosByLoteTalla(idlote_talla: number): Observable<MovimientoLote[]> {
    return this.http.get<MovimientoLote[]>(`${this.apiUrl}/lote-talla/${idlote_talla}`);
  }

  // Obtener movimiento por ID
  getMovimientoById(id: number): Observable<MovimientoLote> {
    return this.http.get<MovimientoLote>(`${this.apiUrl}/${id}`);
  }

  // Actualizar un movimiento
  updateMovimiento(id: number, movimiento: MovimientoLote): Observable<MovimientoLote> {
    return this.http.put<MovimientoLote>(`${this.apiUrl}/${id}`, movimiento);
  }

  // Eliminar lógicamente un movimiento
  eliminarMovimiento(id: number): Observable<MovimientoLote> {
    return this.http.patch<MovimientoLote>(`${this.apiUrl}/${id}/eliminar`, {});
  }

  // Restaurar un movimiento eliminado
  restaurarMovimiento(id: number): Observable<MovimientoLote> {
    return this.http.patch<MovimientoLote>(`${this.apiUrl}/${id}/restaurar`, {});
  }
}
