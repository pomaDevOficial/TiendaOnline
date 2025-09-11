import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode'; // Asegúrate de instalar esta dependencia: npm install qrcode
import Comprobante from '../models/comprobante.model';
import Venta from '../models/venta.model';
import Pedido from '../models/pedido.model';
import Persona from '../models/persona.model';
import TipoComprobante from '../models/tipo_comprobante.model';
import DetalleVenta from '../models/detalle_venta.model';
import PedidoDetalle from '../models/pedido_detalle.model';
import LoteTalla from '../models/lote_talla.model';
import Lote from '../models/lote.model';
import Producto from '../models/producto.model';

// Configuración de GreenAPI
const ID_INSTANCE = "7105309578";
const API_TOKEN_INSTANCE = "13cf8fdf2a3348fa9e802e080eb072d7b42acc76c6964d1f90";

// Función para generar QR
const generarQR = async (datos: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(datos, {
      width: 100,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Error generando QR:', err);
    return '';
  }
};

// Función para generar PDF en formato voucher mejorado
export const generarPDFComprobanteModelo = async (comprobante: any, venta: any, pedido: any, detallesVenta: any[]): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Crear nombre de archivo único
      const filename = `comprobante_${comprobante.numserie}.pdf`;
      const filePath = path.join(__dirname, '../uploads', filename);
      
      // Crear directorio si no existe
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      // Crear documento PDF (tamaño ticket 80mm = 226.77 puntos de ancho)
      const doc = new PDFDocument({ 
        size: [226.77, 800], // Aumentamos el alto inicial
        margin: 8 
      });

      // Pipe el PDF a un archivo
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Configuración de estilos
      const styles = {
        header: { size: 14, font: 'Helvetica-Bold' },
        subheader: { size: 10, font: 'Helvetica-Bold' },
        normal: { size: 9, font: 'Helvetica' },
        small: { size: 7, font: 'Helvetica' },
        tiny: { size: 6, font: 'Helvetica' }
      };

      const pageWidth = 226.77 - 16; // Ancho menos márgenes
      let currentY = 15;

      // === ENCABEZADO EMPRESA ===
      doc.fontSize(styles.header.size)
         .font(styles.header.font)
         .text('MI TIENDA DE ROPA', 8, currentY, { 
           width: pageWidth, 
           align: 'center' 
         });
      
      currentY += 20;

      doc.fontSize(styles.small.size)
         .font(styles.normal.font)
         .text('Av. Principal 123, Lima - Peru', 8, currentY, { 
           width: pageWidth, 
           align: 'center' 
         });
      
      currentY += 12;

      doc.text('Telf: (01) 234-5678 | Cel: 987-654-321', 8, currentY, { 
        width: pageWidth, 
        align: 'center' 
      });
      
      currentY += 12;

      doc.text('RUC: 20123456789', 8, currentY, { 
        width: pageWidth, 
        align: 'center' 
      });
      
      currentY += 15;

      // Línea decorativa
      doc.moveTo(8, currentY)
         .lineTo(pageWidth + 8, currentY)
         .lineWidth(1)
         .stroke();
      
      currentY += 10;

      // === TIPO DE COMPROBANTE ===
      const tipoComprobante = comprobante.TipoComprobante?.nombre || 'BOLETA DE VENTA';
      doc.fontSize(styles.subheader.size)
         .font(styles.subheader.font)
         .text(`${tipoComprobante} ELECTRONICA`, 8, currentY, { 
           width: pageWidth, 
           align: 'center' 
         });
      
      currentY += 15;

      doc.fontSize(styles.normal.size)
         .font(styles.subheader.font)
         .text(`N ${comprobante.numserie}`, 8, currentY, { 
           width: pageWidth, 
           align: 'center' 
         });
      
      currentY += 20;

      // Línea separadora
      doc.moveTo(8, currentY)
         .lineTo(pageWidth + 8, currentY)
         .lineWidth(0.5)
         .stroke();
      
      currentY += 8;

      // === INFORMACIÓN DE LA VENTA ===
      const fechaVenta = new Date(venta.fechaventa);
      const fechaFormateada = fechaVenta.toLocaleDateString('es-PE', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
      const horaFormateada = fechaVenta.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
      });

      doc.fontSize(styles.normal.size)
         .font(styles.normal.font)
         .text(`Fecha: ${fechaFormateada}`, 8, currentY)
         .text(`Hora: ${horaFormateada}`, 8, currentY + 12);
      
      currentY += 30;

      // === INFORMACIÓN DEL CLIENTE ===
      doc.fontSize(styles.subheader.size)
         .font(styles.subheader.font)
         .text('CLIENTE:', 8, currentY);
      
      currentY += 12;

      const clienteNombre = pedido.Persona?.nombres 
        ? `${pedido.Persona.nombres} ${pedido.Persona.apellidos || ''}`.trim()
        : 'CLIENTE GENERAL';

      doc.fontSize(styles.normal.size)
         .font(styles.normal.font)
         .text(clienteNombre.substring(0, 28), 8, currentY);
      
      currentY += 12;

      if (pedido.Persona?.nroidentidad) {
        const tipoDoc = pedido.Persona?.TipoIdentidad?.nombre || 'DOC';
        doc.text(`${tipoDoc}: ${pedido.Persona.nroidentidad}`, 8, currentY);
        currentY += 12;
      }

      if (pedido.Persona?.telefono) {
        doc.text(`Telf: ${pedido.Persona.telefono}`, 8, currentY);
        currentY += 12;
      }
      
      currentY += 8;

      // Línea separadora doble
      doc.moveTo(8, currentY)
         .lineTo(pageWidth + 8, currentY)
         .lineWidth(1)
         .stroke();
      
      currentY += 5;

      doc.moveTo(8, currentY)
         .lineTo(pageWidth + 8, currentY)
         .lineWidth(0.5)
         .stroke();
      
      currentY += 10;

      // === ENCABEZADO DE PRODUCTOS ===
      doc.fontSize(styles.small.size)
         .font(styles.subheader.font)
         .text('DESCRIPCION', 8, currentY, { width: 120, align: 'left' })
         .text('CANT', 130, currentY, { width: 35, align: 'center' })
         .text('P.UNIT', 165, currentY, { width: 30, align: 'right' })
         .text('TOTAL', 195, currentY, { width: 30, align: 'right' });
      
      currentY += 10;

      // Línea separadora
      doc.moveTo(8, currentY)
         .lineTo(pageWidth + 8, currentY)
         .lineWidth(0.5)
         .stroke();
      
      currentY += 8;

      // === DETALLES DE PRODUCTOS ===
      let subtotalGeneral = 0;

      detallesVenta.forEach((detalle, index) => {
        const producto = detalle.PedidoDetalle?.LoteTalla?.Lote?.Producto;
        const nombreProducto = producto?.nombre || 'Producto sin nombre';
        const marca = producto?.Marca?.nombre || '';
        const talla = detalle.PedidoDetalle?.LoteTalla?.Talla?.nombre || '';
        
        const cantidad = detalle.PedidoDetalle?.cantidad || 0;
        const precioUnitario = detalle.precio_venta_real || 0;
        const total = cantidad * precioUnitario;
        subtotalGeneral += total;

        // Formatear números a dos decimales
        const precioFormateado = Math.round(precioUnitario * 100) / 100;
        const totalFormateado = Math.round(total * 100) / 100;

        // Nombre del producto (dividir en líneas si es muy largo)
        let descripcion = nombreProducto;
        if (marca) descripcion += ` ${marca}`;
        if (talla) descripcion += ` - T.${talla}`;

        // Dividir descripción si es muy larga
        const maxChars = 18;
        if (descripcion.length > maxChars) {
          const linea1 = descripcion.substring(0, maxChars);
          const linea2 = descripcion.substring(maxChars, maxChars * 2);
          
          doc.fontSize(styles.small.size)
             .font(styles.normal.font)
             .text(linea1, 8, currentY, { width: 120, align: 'left' });
          currentY += 9;
          
          if (linea2) {
            doc.text(linea2, 8, currentY, { width: 120, align: 'left' });
            currentY += 9;
          }
        } else {
          doc.fontSize(styles.small.size)
             .font(styles.normal.font)
             .text(descripcion, 8, currentY, { width: 120, align: 'left' });
          currentY += 9;
        }

        // Cantidad, precio unitario y total (en la última línea del producto)
        const lineaTotal = currentY - 9;
        doc.text(cantidad.toString(), 130, lineaTotal, { width: 35, align: 'center' })
           .text(precioFormateado.toString(), 165, lineaTotal, { width: 30, align: 'right' })
           .text(totalFormateado.toString(), 195, lineaTotal, { width: 30, align: 'right' });

        // Espacio entre productos
        if (index < detallesVenta.length - 1) {
          currentY += 5;
          // Línea punteada sutil
          doc.moveTo(8, currentY)
             .lineTo(pageWidth + 8, currentY)
             .lineWidth(0.2)
             .dash(2, { space: 2 })
             .stroke()
             .undash();
          currentY += 5;
        } else {
          currentY += 8;
        }
      });

      // === TOTALES ===
      // Línea separadora doble para totales
      doc.moveTo(8, currentY)
         .lineTo(pageWidth + 8, currentY)
         .lineWidth(1)
         .stroke();
      
      currentY += 8;

      // Calcular IGV (0.00 en tu caso)
      const igv = 0.00;
      const total = comprobante.total || 0;
      const subtotal = total - igv;

      doc.fontSize(styles.normal.size)
         .font(styles.normal.font);

      // Mostrar subtotal e IGV (siempre 0.00)
      doc.text('SUBTOTAL:', 120, currentY, { width: 60, align: 'left' })
         .text(`S/ ${subtotal.toString()}`, 180, currentY, { width: 40, align: 'right' });
      currentY += 12;

      // IGV siempre 0.00
      doc.text('IGV (0%):', 120, currentY, { width: 60, align: 'left' })
         .text(`S/ ${igv.toString()}`, 180, currentY, { width: 40, align: 'right' });
      currentY += 15;

      // Total final
      doc.fontSize(styles.subheader.size)
         .font(styles.subheader.font)
         .text('TOTAL:', 120, currentY, { width: 60, align: 'left' })
         .text(`S/ ${total.toString()}`, 180, currentY, { width: 40, align: 'right' });
      
      currentY += 20;

      // === PREPARAR DATOS PARA EL QR ===
      const datosQR = {
        empresa: 'MI TIENDA DE ROPA',
        ruc: '20123456789',
        comprobante: tipoComprobante,
        serie: comprobante.numserie,
        fecha: fechaFormateada,
        hora: horaFormateada,
        cliente: clienteNombre,
        total: total.toString(),
        igv: igv.toString()
      };

      const datosQRString = JSON.stringify(datosQR);
      const qrCodeDataURL = await generarQR(datosQRString);

      // === PIE DE PÁGINA ===
      // Línea decorativa
      doc.moveTo(8, currentY)
         .lineTo(pageWidth + 8, currentY)
         .lineWidth(0.5)
         .stroke();
      
      currentY += 12;

      doc.fontSize(styles.normal.size)
         .font(styles.subheader.font)
         .text('GRACIAS POR SU COMPRA!', 8, currentY, { 
           width: pageWidth, 
           align: 'center' 
         });
      
      currentY += 15;

      // === CÓDIGO QR ===
      if (qrCodeDataURL) {
        // Agregar código QR al PDF
        doc.image(qrCodeDataURL, pageWidth / 2 - 30, currentY, { 
          width: 60, 
          height: 60 
        });
        currentY += 70;
      }

      doc.fontSize(styles.small.size)
         .font(styles.normal.font)
         .text('Su satisfaccion es nuestra prioridad', 8, currentY, { 
           width: pageWidth, 
           align: 'center' 
         });
      
      currentY += 12;

      doc.text('WhatsApp: +51 987-654-321', 8, currentY, { 
        width: pageWidth, 
        align: 'center' 
      });
      
      currentY += 10;

      doc.fontSize(styles.tiny.size)
         .text('Email: ventas@mitienda.com', 8, currentY, { 
           width: pageWidth, 
           align: 'center' 
         });
      
      currentY += 10;

      doc.text('Web: www.mitienda.com', 8, currentY, { 
        width: pageWidth, 
        align: 'center' 
      });

      currentY += 15;
      doc.fontSize(styles.tiny.size)
         .text('----- COMPROBANTE ELECTRONICO -----', 8, currentY, { 
           width: pageWidth, 
           align: 'center' 
         });

      currentY += 8;
      doc.text(`Serie: ${comprobante.numserie}`, 8, currentY, { 
        width: pageWidth, 
        align: 'center' 
      });

      // Finalizar documento
      doc.end();

      // Cuando se termine de generar el PDF
      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};