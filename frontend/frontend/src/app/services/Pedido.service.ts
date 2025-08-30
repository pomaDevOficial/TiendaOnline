import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { Pedido, PedidoDetalle } from '../interfaces/interfaces.interface';

@Injectable({
  providedIn: 'root'
})
export class PedidoServicio {
  private apiUrl: string;
  private apiDetalleUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}api/v1/pedidos`;
    this.apiDetalleUrl = `${environment.endpoint}api/v1/pedidos-detalle`;
  }

  // ========== SERVICIOS DE PEDIDOS ==========

  // Crear un nuevo pedido
  createPedido(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  // Obtener todos los pedidos con relaciones
  getPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}?include=Persona,MetodoPago,Estado,Detalles.LoteTalla.Lote.Producto,Detalles.LoteTalla.Talla`);
  }

  // Obtener pedido por ID con todas las relaciones
  getPedidoById(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}?include=Persona,MetodoPago,Estado,Detalles.LoteTalla.Lote.Producto,Detalles.LoteTalla.Talla`);
  }

  // Obtener pedidos cancelados
  getPedidosCancelados(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/cancelados`);
  }

  // Obtener pedidos por estado
  getPedidosByEstado(estado: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/estado/${estado}`);
  }

  // Obtener pedidos por persona
  getPedidosByPersona(idpersona: number): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/persona/${idpersona}`);
  }

  // Actualizar pedido por ID
  updatePedido(id: number, pedido: Pedido): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, pedido);
  }

  // Aprobar pedido
  aprobarPedido(id: number): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/aprobar/${id}`, {});
  }

  // Cambiar estado del pedido
  cambiarEstadoPedido(id: number, estado: string): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/estado`, { estado });
  }

  // Cancelar pedido
  cancelarPedido(id: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/cancelar`, {});
  }

  // Restaurar pedido cancelado
  restaurarPedido(id: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  // Eliminar pedido (físicamente)
  deletePedido(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // ========== SERVICIOS DE DETALLES DE PEDIDOS ==========

  // Crear un nuevo detalle de pedido
  createPedidoDetalle(detalle: PedidoDetalle): Observable<PedidoDetalle> {
    return this.http.post<PedidoDetalle>(this.apiDetalleUrl, detalle);
  }

  // Crear múltiples detalles de pedido
  createMultiplePedidoDetalle(detalles: PedidoDetalle[]): Observable<PedidoDetalle[]> {
    return this.http.post<PedidoDetalle[]>(`${this.apiDetalleUrl}/multiple`, detalles);
  }

  // Obtener todos los detalles de pedidos
  getPedidosDetalle(): Observable<PedidoDetalle[]> {
    return this.http.get<PedidoDetalle[]>(this.apiDetalleUrl);
  }

  // Obtener detalles por pedido
  getDetallesByPedido(idpedido: number): Observable<PedidoDetalle[]> {
    return this.http.get<PedidoDetalle[]>(`${this.apiDetalleUrl}/pedido/${idpedido}`);
  }

  // Obtener detalle de pedido por ID
  getPedidoDetalleById(id: number): Observable<PedidoDetalle> {
    return this.http.get<PedidoDetalle>(`${this.apiDetalleUrl}/${id}`);
  }

  // Actualizar detalle de pedido por ID
  updatePedidoDetalle(id: number, detalle: PedidoDetalle): Observable<PedidoDetalle> {
    return this.http.put<PedidoDetalle>(`${this.apiDetalleUrl}/${id}`, detalle);
  }

  // Eliminar un detalle de pedido
  deletePedidoDetalle(id: number): Observable<any> {
    return this.http.delete(`${this.apiDetalleUrl}/${id}`);
  }

  // Eliminar múltiples detalles de pedido
  deleteMultiplePedidoDetalle(ids: number[]): Observable<any> {
    return this.http.delete(`${this.apiDetalleUrl}`, { body: { ids } });
  }

  // ========== MÉTODOS ADICIONALES ÚTILES ==========

  // Obtener pedidos con filtros avanzados
  getPedidosWithFilters(filters: any): Observable<Pedido[]> {
    let queryParams = '?include=Persona,MetodoPago,Estado,Detalles';
    
    if (filters.estado) {
      queryParams += `&estado=${filters.estado}`;
    }
    
    if (filters.fechaInicio && filters.fechaFin) {
      queryParams += `&fechaInicio=${filters.fechaInicio}&fechaFin=${filters.fechaFin}`;
    }
    
    if (filters.idpersona) {
      queryParams += `&idpersona=${filters.idpersona}`;
    }

    return this.http.get<Pedido[]>(`${this.apiUrl}/filtros${queryParams}`);
  }

  // Obtener estadísticas de pedidos
  getEstadisticasPedidos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/estadisticas`);
  }

  // Generar reporte de pedidos
  generarReportePedidos(formato: string = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reporte?formato=${formato}`, {
      responseType: 'blob'
    });
  }

  // Verificar stock antes de crear pedido
  verificarStock(detalles: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-stock`, { detalles });
  }
}