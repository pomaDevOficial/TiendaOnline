import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class SunatServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}/sunat`;
  }

  // Consultar DNI
  consultarDNI(dni: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dni/${dni}`);
  }

  // Consultar RUC
  consultarRUC(ruc: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/ruc/${ruc}`);
  }
}
