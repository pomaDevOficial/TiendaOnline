import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Marca, Talla } from '../interfaces/interfaces.interface';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class TallaServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}api/v1/tallas`;
  }

  getTallas(): Observable<Talla[]> {
    return this.http.get<Talla[]>(this.apiUrl+'/registradas');
  }
  createTalla(marca: Talla): Observable<Talla> {
    return this.http.post<Talla>(this.apiUrl, marca);
  }
  updateTalla(id: number, talla: Talla): Observable<Talla> {
    return this.http.put<Talla>(`${this.apiUrl}/${id}`, talla);
  }
  eliminarTalla(id: number, talla:any): Observable<Talla> {
    return this.http.patch<Talla>(`${this.apiUrl}/${id}/eliminar`, talla);
  }
}
