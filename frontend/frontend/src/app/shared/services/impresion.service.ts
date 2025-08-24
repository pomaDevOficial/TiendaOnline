import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

@Injectable({
  providedIn: 'root',
})
export class ImpresionService {
  constructor() {}

  // Método para imprimir un documento PDF
  imprimir(entidad: string, encabezado: string[], cuerpo: Array<any>, titulo: string, guardar?: boolean) {
    // Formatear el documento
    const doc = new jsPDF({
      orientation: "landscape", // Cambiar la orientación a horizontal
        // orientation: "portrait",
        unit: "px",
        format: 'a4'
    });
  
    // Agregar el título al documento
    doc.text(titulo, doc.internal.pageSize.width / 2, 20, {
        align: 'center',
    });

    // Agregar la tabla al documento
    autoTable(doc, {

        head: [encabezado],
        body: cuerpo,
        
    });

    // Guardar el documento si guardar es verdadero
    if (guardar) {
        const hoy = new Date();
        doc.save(entidad + "_" + hoy.getDate() + (hoy.getMonth() + 1) + hoy.getFullYear() + "_" + hoy.getTime() + '.pdf');
    } else {
        // Hacer algo si no se quiere guardar el documento (opcional)
    }
}

async generarComprobante(comprobante: any, detallesVenta: any[], tipoComprobante: number) {
  const doc = new jsPDF();

  try {
    // Configuración inicial
    doc.setFont('helvetica');
    let currentY = 15;

    // 1. Ruta relativa del logo (desde tu componente)
    const logoPath = '../../../../assets/img/login/logo menenses.png'; // Ajusta según tu estructura
    
    // 2. Convertir a Base64 (método para Angular)
    const logoBase64 = await this.convertImageToBase64(logoPath);
    
    // 3. Insertar logo (centrado, 3cm de ancho)
    const logoWidth = 40;
    const logoHeight = 35;
   // doc.addImage(logoBase64, 'png', (210 - logoWidth)/2, currentY, logoWidth, logoHeight);

    doc.addImage(logoBase64, 'png', 15, currentY, logoWidth, logoHeight);
    currentY +=  12;
    

    // Encabezado - Nombre del negocio
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MINIMARKET', 80, currentY, { align: 'center' });
    currentY += 5;// Espacio adicional
    doc.text('"Menenses"', 80, currentY, { align: 'center' });
    currentY += 6;

    // Información de contacto
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('JR 28 de julio, MZ 35, LT 16', 80, currentY, { align: 'center' });
    currentY += 5;
    doc.text('Teléfono(s): 964 811 589', 80, currentY, { align: 'center' });
    currentY += -20;

    // // Línea divisoria
    // doc.line(10, currentY, 200, currentY);
    // currentY += 5;

// Título del comprobante
const titulo = tipoComprobante === 1 ? 'BOLETA ELECTRÓNICA' :
               tipoComprobante === 2 ? 'FACTURA ELECTRÓNICA' :
               tipoComprobante === 3 ? 'NOTA DE CRÉDITO ELECTRÓNICA' : 'DOCUMENTO';

// Configuración del recuadro
const boxWidth = 80;
const boxHeight = 25;
const boxX = 110; // Posición X para centrar (210mm - 80mm)/2
const boxY = currentY - 5;

// Dibujar el recuadro
doc.setDrawColor(0); // Color negro para el borde
doc.rect(boxX, boxY, boxWidth, boxHeight);

// Configurar texto dentro del recuadro (centrado)
doc.setFontSize(12);
doc.setFont('helvetica', 'bold');
doc.text(titulo, boxX + boxWidth/2, boxY + 8, { align: 'center' });

doc.setFontSize(10);
doc.text(`N°: ${comprobante.num_serie || 'BK01-00000054'}`, boxX + boxWidth/2, boxY + 15, { align: 'center' });
doc.text(`RUC: 10739447009`, boxX + boxWidth/2, boxY + 20, { align: 'center' });

currentY += boxHeight + 10; // Ajustar posición Y para el siguiente elemento



doc.setFontSize(10);
doc.setFont('helvetica', 'bold');
doc.text('DATOS DEL CLIENTE', 33, currentY, { align: 'center' });
currentY += 3;// Espacio adicional

    // Línea divisoria
    doc.line(10, currentY, 200, currentY);
    currentY += 7;

    // Datos del cliente en una tabla simple
    const clienteData = [
      `SR (ES)         : ${comprobante.Venta?.Cliente?.nombre || comprobante.Venta?.Cliente?.razon_social|| 'CLIENTES VARIOS' } ${comprobante.Venta?.Cliente?.apellido|| ''}                                       FECHA: ${comprobante.Venta?.fecha_venta || '26/02/2025 22:53:00'}`,
      `RUC/DNI       : ${comprobante.Venta?.Cliente?.dni || comprobante.Venta?.Cliente?.ruc || '00000000'}                                                                          COND. PAGO: ${comprobante.Venta?.pago === 'CREDITO' ? 'CRÉDITO' : 'EFECTIVO'}`,
      `DIRECCIÓN  : ${comprobante.Venta?.Cliente?.direccion || 'S/N'}`,
      `VENDEDOR  : ${comprobante.Venta?.Empleado?.nombre || 'alexandra'} ${comprobante.Venta?.Empleado?.apellido || ''}`,
      `FORMA PAGO: ${comprobante.Venta?.pago === 'CREDITO' ? 'CRÉDITO' : 'CONTADO'}                                                                             TIPO MONEDA: SOLES `,
    ];

    doc.setFontSize(10);
    clienteData.forEach((line) => {
    doc.setFont('helvetica', 'normal');
      doc.text(line, 15, currentY);
      currentY += 7;
    });

  
    // Línea divisoria
   doc.line(10, currentY, 200, currentY);
   currentY += 5;
    // Encabezados de la tabla de productos
    doc.setFont('helvetica', 'bold');
    doc.text('CANT.', 15, currentY);
    doc.text('PRODUCTO', 35, currentY);
    doc.text('UNIDAD.M.', 95, currentY);
    doc.text('MARCA', 120, currentY);
    doc.text('PRECIO', 140, currentY);
    doc.text('DSCTO.', 160, currentY);
    doc.text('SUB TOTAL', 195, currentY, { align: 'right' });

    currentY += 4;
    doc.line(10, currentY, 200, currentY);
    currentY += 5;

    // Productos
    doc.setFont('helvetica', 'normal');
    detallesVenta.forEach(detalle => {
      doc.text(`${parseFloat(detalle.cantidad).toFixed(2)}`, 15, currentY);
      doc.text(detalle.descripcion || 'PRODUCTO', 35, currentY);
      doc.text(detalle.unidad || 'UND', 100, currentY);
      doc.text(detalle.marca || '-', 120, currentY);
      doc.text(`${parseFloat(detalle.precio_unitario).toFixed(2)}`, 140, currentY);
      doc.text('0.00', 160, currentY);
      doc.text(`${parseFloat(detalle.subtotal).toFixed(2)}`, 195, currentY, { align: 'right' });
      currentY += 5;
    });

    currentY += 2;
    doc.line(10, currentY, 200, currentY);
    currentY += 5;

    // Totales
    const subtotal = detallesVenta.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const igv = Number(comprobante.igv) || 0;
    const total = subtotal + igv;

    doc.text(`SUB TOTAL (S/) : ${subtotal.toFixed(2)}`, 195, currentY, { align: 'right' });
    currentY += 6;
    doc.text(`IGV : ${igv.toFixed(2)}`, 195, currentY, { align: 'right' });
    currentY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL (S/) : ${total.toFixed(2)}`, 195, currentY, { align: 'right' });
    currentY += 10;

    // Monto en letras
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Son : ${this.numeroALetras(total)} CON 00/100 SOLES`, 15, currentY);
    currentY += 15;

    // Pie de página con QR (opcional)
    if (tipoComprobante !== 3) {
      const qrText = JSON.stringify({
        tipo: titulo,
        serie: comprobante.num_serie,
        correlativo: comprobante.numero,
        //fecha: comprobante.Venta?.fecha_venta,
        cliente: comprobante.Venta?.Cliente?.nombre || 'CLIENTES VARIOS',
        ruc_cliente: comprobante.Venta?.Cliente?.dni || comprobante.Venta?.Cliente?.ruc || '00000000',
        direccion: comprobante.Venta?.Cliente?.direccion || 'S/N',
        producto: detallesVenta.map((item) => item.descripcion).join(', '),
        unidad: detallesVenta.map((item) => item.unidad).join(', '),
        marca: detallesVenta.map((item) => item.marca).join(', '),
        cantidad: detallesVenta.map((item) => item.cantidad).join(', '),
        precio: detallesVenta.map((item) => item.precio_unitario).join(', '),
        descuento: detallesVenta.map((item) => item.descuento).join(', '),
        subtotal: detallesVenta.map((item) => item.subtotal).join(', '),
        igv: igv.toFixed(2),
        vendedor: `${comprobante.Venta?.Empleado?.nombre || 'alexandra'} ${comprobante.Venta?.Empleado?.apellido || ''}`,
        tipo_comprobante: tipoComprobante,
        numero: comprobante.numero,
        fecha: comprobante.Venta?.fecha_venta,
        total: total.toFixed(2),
        ruc: '10739447009'
      });

      const qrImage = await this.generarQRCode(qrText);
      doc.addImage(qrImage, 'PNG', 160, currentY - 20, 40, 40); // Resta 15 unidades a la posición Y
    }

    // Guardar PDF
    doc.save(`${titulo}_${comprobante.num_serie || 'BK01-00000054'}.pdf`);

  } catch (error) {
    console.error('Error al generar el comprobante:', error);
  }
}


numeroALetras(num: number): string {
  // Convertir a string y separar parte entera y decimal
  const numStr = num.toFixed(2);
  const [enteroStr, decimalStr] = numStr.split('.');
  const entero = parseInt(enteroStr);
  const decimal = parseInt(decimalStr);

  // Arrays de palabras
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = ['', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  
  // Convertir parte entera
  let letras = '';
  
  // Miles
  if (entero >= 1000) {
    const miles = Math.floor(entero / 1000);
    letras += (miles === 1 ? 'MIL' : this.convertirGrupo(miles) + ' MIL') + ' ';
  }
  
  // Centenas, decenas y unidades
  const resto = entero % 1000;
  if (resto > 0) {
    letras += this.convertirGrupo(resto) + ' ';
  }
  
  // Moneda
  letras += 'SOLES';
  
  // Centavos
  if (decimal > 0) {
    letras += ' CON ' + this.convertirGrupo(decimal) + ' CENTIMOS';
  }
  
  return letras;
}

// Función auxiliar para convertir grupos de 3 dígitos
private convertirGrupo(num: number): string {
  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  
  const c = Math.floor(num / 100);
  const d = Math.floor((num % 100) / 10);
  const u = num % 10;
  
  let grupo = '';
  
  // Centenas
  if (c > 0) {
    grupo += centenas[c] + ' ';
  }
  
  // Decenas y unidades
  if (d === 1) {
    grupo += especiales[u] + ' ';
  } else if (d === 2 && u > 0) {
    grupo += (u === 1 ? 'VEINTIUN' : 'VEINTI' + unidades[u]) + ' ';
  } else if (d > 1) {
    grupo += decenas[d];
    if (u > 0) {
      grupo += ' Y ' + (u === 1 ? 'UN' : unidades[u]);
    }
    grupo += ' ';
  } else if (u > 0) {
    grupo += unidades[u] + ' ';
  }
  
  return grupo.trim();
}

  async generarQRCode(text: string): Promise<string> {
    try {
      return await QRCode.toDataURL(text, { width: 150 });
    } catch (error) {
      console.error('Error al generar QR:', error);
      return '';
    }
  }

// Método para convertir imagen a Base64 (Angular)
private async convertImageToBase64(imagePath: string): Promise<string> {
  try {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error al convertir imagen:', error);
    return ''; // Retorna cadena vacía si falla
  }
}
}