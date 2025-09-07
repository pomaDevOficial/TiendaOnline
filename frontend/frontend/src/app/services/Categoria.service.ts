import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria, Marca, Talla } from '../interfaces/interfaces.interface';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}/categorias`;
  }

  getCategorias(): Observable<Talla[]> {
    return this.http.get<Categoria[]>(this.apiUrl+'/registradas');
  }
  createCategoria(marca: Talla): Observable<Talla> {
    return this.http.post<Talla>(this.apiUrl, marca);
  }
  updateCategoria(id: number, talla: Talla): Observable<Marca> {
    return this.http.put<Talla>(`${this.apiUrl}/${id}`, talla);
  }
  eliminarCategoria(id: number, talla:any): Observable<Marca> {
    return this.http.patch<Marca>(`${this.apiUrl}/${id}/eliminar`, talla);
  }
}
