import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Marca } from '../interfaces/marca.interface';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarcaServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}api/v1/marcas`;
  }

  getMarcas(): Observable<Marca[]> {
    return this.http.get<Marca[]>(this.apiUrl+'/registradas');
  }
  createMarca(marca: Marca): Observable<Marca> {
    return this.http.post<Marca>(this.apiUrl, marca);
  }
  updateMarca(id: number, marca: Marca): Observable<Marca> {
    return this.http.put<Marca>(`${this.apiUrl}/${id}`, marca);
  }
  eliminarMarca(id: number, marca:any): Observable<Marca> {
    return this.http.patch<Marca>(`${this.apiUrl}/${id}/eliminar`, marca);
  }
}
