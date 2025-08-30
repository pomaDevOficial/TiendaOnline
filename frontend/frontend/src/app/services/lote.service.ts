import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lote, Marca, Producto } from '../interfaces/interfaces.interface';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoteServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}api/v1/lotes`;
  }

  getLotes(): Observable<Lote[]> {
    return this.http.get<Lote[]>(this.apiUrl+'/disponibles');
  } 
  getinfoLotes(id: number): Observable<Lote[]> {
    return this.http.get<any>(`${this.apiUrl}/${id}/info`);
  }
  
  createLote(producto: Lote): Observable<Lote> {
    return this.http.post<Lote>(`${this.apiUrl}/completo`, producto);
  }

  updateLote(id: number, producto: FormData): Observable<Lote> {
    return this.http.put<Lote>(`${this.apiUrl}/${id}`, producto);
  }
  eliminarLote(id: number, producto:any): Observable<Lote> {
    return this.http.patch<Lote>(`${this.apiUrl}/${id}/eliminar`, producto);
  }
}
