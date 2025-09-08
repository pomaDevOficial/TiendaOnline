import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { WhatsappService } from '../../../services/whatsapp.service';

@Component({
  selector: 'app-qr',
  
   imports: [ FormsModule, CommonModule],
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.css']
})
export class QrComponent {
 protected readonly title = signal('Envío de WhatsApp');

  number: string = '';
  message: string = '';
  fileName: string = '';
  caption: string = '';
  notificationMessage: string = '';
  response: string = '';
  status: string = 'Verificando...';
  qrImage: string = '';
  isReconnecting: boolean = false;
  private statusInterval: any;

  // Propiedades para grupos
  selectedGroupId: string = '';
  groupMessage: string = '';
  groupFileName: string = '';
  groupCaption: string = '';
  chats: any[] = [];

  constructor(private whatsappService: WhatsappService) {
    this.checkStatus();
    this.startStatusPolling();
  }

  ngOnDestroy() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
  }

  private startStatusPolling() {
    // Verificar estado cada 2 segundos para detección más rápida
    this.statusInterval = setInterval(() => {
      this.checkStatus();
    }, 2000);
  }

  checkStatus() {
    this.whatsappService.getStatus().subscribe({
      next: (res: any) => {
        const newStatus = res.status === 'conectado' ? 'Conectado' : 'Desconectado';

        // Si el estado cambió a conectado, detener el polling y ocultar indicador de reconexión
        if (newStatus === 'Conectado' && this.status !== 'Conectado') {
          console.log('WhatsApp conectado! Deteniendo verificación automática.');
          if (this.statusInterval) {
            clearInterval(this.statusInterval);
            this.statusInterval = null;
          }
          this.isReconnecting = false;
        }

        // Si el estado cambió a desconectado, activar indicador de reconexión
        if (newStatus === 'Desconectado' && this.status === 'Conectado') {
          console.log('WhatsApp desconectado, activando reconexión automática...');
          this.isReconnecting = true;
        }

        this.status = newStatus;

        if (res.qrAvailable && this.status !== 'Conectado') {
          // Mostrar QR automáticamente cuando esté disponible después de desconexión
          console.log('QR disponible, cargando automáticamente...');
          this.loadQR();
          this.isReconnecting = false; // QR disponible, ya no estamos reconectando
        } else if (!res.qrAvailable && this.status === 'Desconectado') {
          this.qrImage = '';
          // Si no hay QR pero estamos desconectados, probablemente estamos esperando reconexión
          this.isReconnecting = true;
        }
      },
      error: (err) => {
        this.status = 'Error de conexión';
        console.error('Error al verificar estado:', err);
        this.isReconnecting = false;
      }
    });
  }

  loadQR() {
    this.whatsappService.getQR().subscribe({
      next: (res: any) => {
        this.qrImage = res.qrImage;
      },
      error: (err) => {
        console.error('Error al obtener QR:', err);
      }
    });
  }

  sendMessage() {
    if (this.status !== 'Conectado') {
      this.response = '🚫 Función deshabilitada: WhatsApp está desconectado. Espera la reconexión automática.';
      return;
    }

    if (!this.number || !this.message) {
      this.response = 'Número y mensaje son requeridos';
      return;
    }

    this.whatsappService.sendMessage(this.number, this.message).subscribe({
      next: (res) => this.response = res.success ? res.message : 'Error: ' + res.error,
      error: (err) => this.response = 'Error: ' + (err.error?.error || err.message)
    });
  }

  sendFile() {
    if (this.status !== 'Conectado') {
      this.response = '🚫 Función deshabilitada: WhatsApp está desconectado. Espera la reconexión automática.';
      return;
    }

    if (!this.number || !this.fileName) {
      this.response = 'Número y nombre del archivo son requeridos';
      return;
    }

    this.whatsappService.sendFile(this.number, this.fileName, this.caption).subscribe({
      next: (res) => this.response = res.success ? res.message : 'Error: ' + res.error,
      error: (err) => this.response = 'Error: ' + (err.error?.error || err.message)
    });
  }

  sendNotification() {
    if (this.status !== 'Conectado') {
      this.response = '🚫 Función deshabilitada: WhatsApp está desconectado. Espera la reconexión automática.';
      return;
    }

    if (!this.notificationMessage) {
      this.response = 'Mensaje de notificación requerido';
      return;
    }

    this.whatsappService.sendNotification(this.notificationMessage).subscribe({
      next: (res) => this.response = res.success ? res.message : 'Error: ' + res.error,
      error: (err) => this.response = 'Error: ' + (err.error?.error || err.message)
    });
  }

  loadChats() {
    if (this.status !== 'Conectado') {
      this.response = '🚫 Función deshabilitada: WhatsApp está desconectado. Espera la reconexión automática.';
      return;
    }

    this.whatsappService.getChats().subscribe({
      next: (res) => {
        if (res.success) {
          this.chats = res.chats;
          this.response = `Cargados ${this.chats.length} chats`;
        } else {
          this.response = 'Error: ' + res.error;
        }
      },
      error: (err) => this.response = 'Error: ' + (err.error?.error || err.message)
    });
  }

  sendToGroup() {
    if (this.status !== 'Conectado') {
      this.response = '🚫 Función deshabilitada: WhatsApp está desconectado. Espera la reconexión automática.';
      return;
    }

    if (!this.selectedGroupId || !this.groupMessage) {
      this.response = 'Grupo y mensaje son requeridos';
      return;
    }

    this.whatsappService.sendToGroup(this.selectedGroupId, this.groupMessage).subscribe({
      next: (res) => this.response = res.success ? res.message : 'Error: ' + res.error,
      error: (err) => this.response = 'Error: ' + (err.error?.error || err.message)
    });
  }

  sendFileToGroup() {
    if (this.status !== 'Conectado') {
      this.response = '🚫 Función deshabilitada: WhatsApp está desconectado. Espera la reconexión automática.';
      return;
    }

    if (!this.selectedGroupId || !this.groupFileName) {
      this.response = 'Grupo y nombre del archivo son requeridos';
      return;
    }

    this.whatsappService.sendFileToGroup(this.selectedGroupId, this.groupFileName, this.groupCaption).subscribe({
      next: (res) => this.response = res.success ? res.message : 'Error: ' + res.error,
      error: (err) => this.response = 'Error: ' + (err.error?.error || err.message)
    });
  }
}
