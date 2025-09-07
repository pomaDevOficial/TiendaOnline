import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';

// Interfaces para las respuestas
export interface WhatsAppResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
  whatsappResponse?: any;
}

export interface EnviarMensajeRequest {
  phone: string;
  message: string;
}

export interface EnviarComprobanteRequest {
  idComprobante: number;
}

export interface EnviarArchivoRequest {
  phone: string;
  filename: string;
}

@Injectable({
  providedIn: 'root'
})
export class WspServicio {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.endpoint}/wsp`;
  }

  /**
   * Enviar mensaje simple por WhatsApp
   * @param phone - Número de teléfono en formato internacional (sin + ni espacios)
   * @param message - Mensaje a enviar
   * @returns Observable con la respuesta del servicio
   */
  enviarMensaje(phone: string, message: string): Observable<WhatsAppResponse> {
    const payload: EnviarMensajeRequest = { phone, message };
    return this.http.post<WhatsAppResponse>(`${this.apiUrl}/enviar-mensaje`, payload);
  }

  /**
   * Enviar comprobante por WhatsApp
   * @param idComprobante - ID del comprobante a enviar
   * @returns Observable con la respuesta del servicio
   */
  enviarComprobante(idComprobante: number): Observable<WhatsAppResponse> {
    const payload: EnviarComprobanteRequest = { idComprobante };
    return this.http.post<WhatsAppResponse>(`${this.apiUrl}/enviar-comprobante`, payload);
  }

  /**
   * Reenviar comprobante por WhatsApp
   * @param idComprobante - ID del comprobante a reenviar
   * @returns Observable con la respuesta del servicio
   */
  reenviarComprobante(idComprobante: number): Observable<WhatsAppResponse> {
    const payload: EnviarComprobanteRequest = { idComprobante };
    return this.http.post<WhatsAppResponse>(`${this.apiUrl}/reenviar-comprobante`, payload);
  }

  /**
   * Enviar archivo genérico por WhatsApp
   * @param phone - Número de teléfono en formato internacional
   * @param filename - Nombre del archivo a enviar
   * @returns Observable con la respuesta del servicio
   */
  enviarArchivo(phone: string, filename: string): Observable<WhatsAppResponse> {
    const payload: EnviarArchivoRequest = { phone, filename };
    return this.http.post<WhatsAppResponse>(`${this.apiUrl}/enviar-archivo`, payload);
  }

  /**
   * Validar formato de número de teléfono
   * @param phone - Número a validar
   * @returns true si el formato es válido
   */
  validarNumeroTelefono(phone: string): boolean {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Obtener estado del servicio WhatsApp
   * @returns Observable con el estado del servicio
   */
  obtenerEstadoServicio(): Observable<WhatsAppResponse> {
    return this.http.get<WhatsAppResponse>(`${this.apiUrl}/estado-servicio`);
  }

  /**
   * Formatear número de teléfono peruano
   * @param telefono - Número de teléfono (puede incluir 51 o no)
   * @returns Número formateado con código de país
   */
  formatearTelefonoPeruano(telefono: string): string {
    // Remover espacios, guiones y otros caracteres
    const numeroLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Si ya tiene código de país 51, devolverlo
    if (numeroLimpio.startsWith('51') && numeroLimpio.length === 11) {
      return numeroLimpio;
    }
    
    // Si es un número peruano de 9 dígitos, agregar código de país
    if (numeroLimpio.length === 9 && numeroLimpio.startsWith('9')) {
      return '51' + numeroLimpio;
    }
    
    return numeroLimpio;
  }
}