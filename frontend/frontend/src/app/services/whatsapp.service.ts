import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private apiUrl = `${environment.endpointWs}`

  constructor(private http: HttpClient) { }

  sendMessage(number: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send`, { number, message });
  }

  sendFile(number: string, fileName: string, caption?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sendFile`, { number, fileName, caption });
  }

  sendNotification(message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/notify`, { message });
  }

  getStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/status`);
  }

  getQR(): Observable<any> {
    return this.http.get(`${this.apiUrl}/qr`);
  }

  getChats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/chats`);
  }

  sendToGroup(groupId: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sendToGroup`, { groupId, message });
  }

  sendFileToGroup(groupId: string, fileName: string, caption?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sendFileToGroup`, { groupId, fileName, caption });
  }
}