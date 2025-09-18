import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces
interface Persona {
  nombres: string;
  apellidos: string;
  nroidentidad?: string;
  correo: string;
  telefono: string;
}

interface MetodoPago {
  id: number;
}

interface Producto {
  loteTalla: { id: number };
  cantidad: number;
  precio: number;
  subtotal: number;
}

interface PedidoData {
  persona: Persona;
  metodoPago: MetodoPago;
  productos: Producto[];
  total: number;
  idusuario: string;
  fechaventa?: string;
}

interface PedidoResponse {
  msg: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = 'http://localhost:3000/api/v1/pedidos';

  constructor(private http: HttpClient) {}

  /**
   * Crear pedido con comprobante
   */
  crearPedidoConComprobante(
    persona: Persona,
    metodoPago: MetodoPago,
    productos: Producto[],
    total: number,
    idusuario: string,
    comprobante: File
  ): Observable<PedidoResponse> {
    const formData = new FormData();

    // Agregar datos del pedido
    formData.append('persona', JSON.stringify(persona));
    formData.append('metodoPago', JSON.stringify(metodoPago));
    formData.append('productos', JSON.stringify(productos));
    formData.append('total', total.toString());
    formData.append('idusuario', idusuario);

    // Agregar el comprobante (solo una imagen)
    if (comprobante) {
      formData.append('imagen', comprobante);
    }

    return this.http.post<PedidoResponse>(`${this.apiUrl}/create/comprobante-imagen`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && error.error.msg) {
        errorMessage = error.error.msg;
      } else {
        errorMessage = `Código de error: ${error.status}, Mensaje: ${error.message}`;
      }
    }

    console.error('Error en PedidoService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}