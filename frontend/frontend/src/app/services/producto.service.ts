import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Marca, Producto } from '../interfaces/interfaces.interface';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}/productos`;
  }

  getProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl+'/registrados');
  }
  
  createProducto(producto: FormData): Observable<Producto> {
    return this.http.post<Producto>(`${this.apiUrl}/con-imagen`, producto);
  }

  updateProducto(id: number, producto: FormData): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}/con-imagen`, producto);
  }
  eliminarProducto(id: number, producto:any): Observable<Producto> {
    return this.http.patch<Producto>(`${this.apiUrl}/${id}/eliminar`, producto);
  }
  // Buscar clientes (para autocomplete o select dinámico)
    buscarProductos(query: string, limit: number = 10): Observable<Producto[]> {
      return this.http.get<Producto[]>(
        `${this.apiUrl}/buscarproductos?q=${encodeURIComponent(query)}&limit=${limit}`
      );
    }
}
