import { Request, Response } from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import PDFDocument from 'pdfkit';
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
//const ID_INSTANCE = "7105309578";
const ID_INSTANCE = "7105309584";
// const API_TOKEN_INSTANCE = "13cf8fdf2a3348fa9e802e080eb072d7b42acc76c6964d1f90";
const API_TOKEN_INSTANCE = "bfb0408724134cb59d908715edf9e3967519705a04be4227b5";

// Función para generar PDF en formato voucher
// export const generarPDFComprobante = async (comprobante: any, venta: any, pedido: any, detallesVenta: any[]): Promise<string> => {
//   return new Promise((resolve, reject) => {
//     try {
//       // Crear nombre de archivo único
//       const filename = `comprobante_${comprobante.numserie}.pdf`;
//      /// path.join(__dirname, "../../dist/uploads");
//       const filePath = path.join(__dirname, "../../dist/uploads", filename);
//       console.log(filePath)
//       // Crear directorio si no existe
//       if (!fs.existsSync(path.dirname(filePath))) {
//         fs.mkdirSync(path.dirname(filePath), { recursive: true });
//       }

//       // Crear documento PDF (tamaño voucher: 80mm ancho ≈ 226.77 puntos)
//       const doc = new PDFDocument({ 
//         size: [226.77, 600], // Ancho fijo, alto variable
//         margin: 10 
//       });

//       // Pipe el PDF a un archivo
//       const stream = fs.createWriteStream(filePath);
//       doc.pipe(stream);

//       // Estilos
//       const fontSizeSmall = 8;
//       const fontSizeNormal = 10;
//       const fontSizeLarge = 12;
//       const lineHeight = 5;

//       // Encabezado
//       doc.fontSize(fontSizeLarge)
//          .font('Helvetica-Bold')
//          .text('MI EMPRESA', { align: 'center' });
      
//       doc.moveDown(0.5);
//       doc.fontSize(fontSizeNormal)
//          .text('RUC: 20123456789', { align: 'center' });
      
//       doc.moveDown(0.5);
//       doc.text('BOLETA DE VENTA ELECTRÓNICA', { align: 'center' });
      
//       // Línea separadora
//       doc.moveTo(doc.x, doc.y + lineHeight)
//          .lineTo(doc.x + 206.77, doc.y + lineHeight)
//          .stroke();
      
//       doc.moveDown();

//       // Información del comprobante
//       doc.fontSize(fontSizeNormal)
//          .font('Helvetica-Bold')
//          .text(`${comprobante.TipoComprobante?.nombre || 'BOLETA'}: ${comprobante.numserie}`, { align: 'left' });
      
//       doc.font('Helvetica')
//          .fontSize(fontSizeSmall)
//          .text(`Fecha: ${new Date(venta.fechaventa).toLocaleDateString()}`, { align: 'left' });
      
//       doc.moveDown();

//       // Información del cliente
//       doc.font('Helvetica-Bold')
//          .text('CLIENTE:', { align: 'left' });
      
//       doc.font('Helvetica')
//          .text(`${pedido.Persona?.nombre || 'CLIENTE GENERAL'}`, { align: 'left' });
      
//       if (pedido.Persona?.documento) {
//         doc.text(`DOC: ${pedido.Persona.documento}`, { align: 'left' });
//       }
      
//       doc.moveDown();

//       // Línea separadora
//       doc.moveTo(doc.x, doc.y + lineHeight)
//          .lineTo(doc.x + 206.77, doc.y + lineHeight)
//          .stroke();
      
//       doc.moveDown();

//       // Detalles de productos
//       doc.font('Helvetica-Bold')
//          .text('DESCRIPCIÓN', 10, doc.y, { width: 120, align: 'left' })
//          .text('CANT', 130, doc.y, { width: 30, align: 'right' })
//          .text('TOTAL', 160, doc.y, { width: 50, align: 'right' });
      
//       doc.moveDown(0.5);

//       // Línea separadora
//       doc.moveTo(doc.x, doc.y + lineHeight)
//          .lineTo(doc.x + 206.77, doc.y + lineHeight)
//          .stroke();
      
//       doc.moveDown(0.5);
//       // Productos
//       detallesVenta.forEach(detalle => {
//         const producto = detalle.PedidoDetalle?.LoteTalla?.Lote?.Producto?.nombre || 'Producto';
//         const cantidad = detalle.PedidoDetalle?.cantidad || 0;
//         const precio = detalle.precio_venta_real || 0;
//         const total = cantidad * precio;

//         doc.font('Helvetica')
//            .fontSize(fontSizeSmall)
//            .text(producto.substring(0, 20), 10, doc.y, { width: 120, align: 'left' })
//            .text(cantidad.toString(), 130, doc.y, { width: 30, align: 'right' })
//            .text(`S/. ${total}`, 160, doc.y, { width: 50, align: 'right' });
        
//         doc.moveDown(0.5);
//       });

//       // Línea separadora
//       doc.moveTo(doc.x, doc.y + lineHeight)
//          .lineTo(doc.x + 206.77, doc.y + lineHeight)
//          .stroke();
      
//       doc.moveDown();

//       // Totales
//       doc.font('Helvetica-Bold')
//          .text(`SUBTOTAL: S/. ${(comprobante.total - comprobante.igv)}`, { align: 'right' });
      
//       doc.text(`IGV (18%): S/. ${comprobante.igv}`, { align: 'right' });
      
//       doc.fontSize(fontSizeLarge)
//          .text(`TOTAL: S/. ${comprobante.total}`, { align: 'right' });
      
//       doc.moveDown();

//       // Pie de página
//       doc.fontSize(fontSizeSmall)
//          .font('Helvetica')
//          .text('¡Gracias por su compra!', { align: 'center' });
      
//       doc.text('Contacto: +51 987 654 321', { align: 'center' });

//       // Finalizar documento
//       doc.end();

//       // Cuando se termine de generar el PDF
//       stream.on('finish', () => {
//         resolve(filename);
//       });

//       stream.on('error', (error) => {
//         reject(error);
//       });

//     } catch (error) {
//       reject(error);
//     }
//   });
// };

// Constantes para el layout del PDF
const PDF_CONFIG = {
  width: 226.77,
  height: 700,
  margin: 15,
  fontSizes: {
    small: 7.5,
    normal: 7, // Aún más pequeño para encabezados
    large: 11,
  },
  columns: {
    description: { x: 15, width: 90 },
    quantity: { x: 110, width: 25 },
    unitPrice: { x: 140, width: 35 },
    total: { x: 180, width: 30 },
  },
  lineSpacing: 0.5,
};

// Función auxiliar para dibujar línea separadora
const drawSeparator = (doc: any, y: number) => {
  doc.moveTo(PDF_CONFIG.margin, y)
     .lineTo(PDF_CONFIG.width - PDF_CONFIG.margin, y)
     .stroke();
};

// Función auxiliar para agregar texto con wrapping
const addWrappedText = (
  doc: any,
  text: string,
  x: number,
  y: number,
  options: any
) => {
  const maxWidth = options.width || 100;
  const lines = doc.heightOfString(text, { width: maxWidth }) / doc.currentLineHeight();
  if (lines > 1) {
    doc.text(text, x, y, { ...options, width: maxWidth });
  } else {
    doc.text(text, x, y, options);
  }
};

// Función para generar PDF en formato voucher (boleta)
export const generarPDFComprobante = async (
  comprobante: any,
  venta: any,
  pedido: any,
  detallesVenta: any[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const filename = `comprobante_${comprobante.numserie}.pdf`;
      const filePath = path.join(__dirname, "../../dist/uploads", filename);

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      // Documento tipo voucher (80mm de ancho)
      const doc = new PDFDocument({
        size: [PDF_CONFIG.width, PDF_CONFIG.height],
        margin: PDF_CONFIG.margin,
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // ===== Estilos =====
      const fontSizeSmall = PDF_CONFIG.fontSizes.small;
      const fontSizeNormal = PDF_CONFIG.fontSizes.normal;
      const fontSizeLarge = PDF_CONFIG.fontSizes.large;

      // ===== ENCABEZADO =====
      doc.fontSize(fontSizeLarge)
        .font("Helvetica-Bold")
        .text("MI EMPRESA S.A.C.", { align: "center" });

      doc.moveDown(0.3);
      doc.fontSize(fontSizeNormal).font("Helvetica")
        .text("RUC: 20123456789", { align: "center" })
        .text("Av. Principal 123 - Lima", { align: "center" })
        .text("Tel: (01) 234-5678", { align: "center" });

      doc.moveDown(0.5);
      doc.font("Helvetica-Bold")
        .text("BOLETA DE VENTA ELECTRÓNICA", { align: "center" });

      doc.moveDown(0.3);
      doc.font("Helvetica").fontSize(fontSizeNormal)
        .text(`${comprobante.TipoComprobante?.nombre || "BOLETA"}: ${comprobante.numserie}`, { align: "center" });

      // ===== SEPARADOR =====
      doc.moveDown(0.5);
      drawSeparator(doc, doc.y);

      // ===== INFO CLIENTE =====
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(fontSizeNormal).text("CLIENTE:", { align: "left" });
      doc.font("Helvetica").fontSize(fontSizeSmall)
        .text(`${pedido?.Persona?.nombres || "CLIENTE GENERAL"}`, { align: "left" });

      if (pedido?.Persona?.nroidentidad) {
        doc.text(`DOC: ${pedido.Persona.nroidentidad}`, { align: "left" });
      }
      if (pedido?.MetodoPago?.nombre) {
        doc.text(`Método Pago: ${pedido.MetodoPago.nombre}`, { align: "left" });
      }

      doc.text(`Fecha: ${new Date(venta.fechaventa).toLocaleDateString()}`, { align: "left" });

      // ===== SEPARADOR =====
      doc.moveDown(0.5);
      drawSeparator(doc, doc.y);
      var xy = doc.y;
      // ===== DETALLE DE PRODUCTOS =====
      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(PDF_CONFIG.fontSizes.normal);
      doc.text("DESCRIPCIÓN", PDF_CONFIG.columns.description.x, xy, { width: PDF_CONFIG.columns.description.width, align: "left" })
        .text("CANT", PDF_CONFIG.columns.quantity.x, xy, { width: PDF_CONFIG.columns.quantity.width, align: "center" })
        .text("P.U.", PDF_CONFIG.columns.unitPrice.x, xy, { width: PDF_CONFIG.columns.unitPrice.width, align: "center" })
        .text("TOTAL", PDF_CONFIG.columns.total.x, xy, { width: PDF_CONFIG.columns.total.width, align: "center" });

      doc.moveDown(0.3);
      doc.y =xy +15;
      drawSeparator(doc, doc.y);

      doc.moveDown(0.2);

      detallesVenta.forEach(detalle => {
        const producto = detalle.PedidoDetalle?.LoteTalla?.Lote?.Producto?.nombre || "Producto";
        const cantidad = Number(detalle.PedidoDetalle?.cantidad) || 0;
        const precio = Number(detalle.precio_venta_real) || 0;
        const total = cantidad * precio;

        // Guardamos la posición Y actual
        const y = doc.y;

        doc.font("Helvetica").fontSize(fontSizeSmall);

        // Columna 1: descripción con wrapping
        addWrappedText(doc, producto.substring(0, 20), PDF_CONFIG.columns.description.x, y, {
          width: PDF_CONFIG.columns.description.width,
          align: "left"
        });

        // Columna 2: cantidad
        doc.text(cantidad.toFixed(2), PDF_CONFIG.columns.quantity.x, y, {
          width: PDF_CONFIG.columns.quantity.width,
          align: "center"
        });

        // Columna 3: precio unitario
        doc.text(`S/. ${precio.toFixed(2)}`, PDF_CONFIG.columns.unitPrice.x, y, {
          width: PDF_CONFIG.columns.unitPrice.width,
          align: "center"
        });

        // Columna 4: total
        doc.text(`S/. ${total.toFixed(2)}`, PDF_CONFIG.columns.total.x, y, {
          width: PDF_CONFIG.columns.total.width,
          align: "center"
        });

        // Bajamos una línea después de cada item
        doc.moveDown(PDF_CONFIG.lineSpacing);
      });

      // ===== SEPARADOR =====
      doc.moveDown(0.3);
      drawSeparator(doc, doc.y);

      // ===== TOTALES =====
      const totalNum = Number(comprobante.total) || 0;
      const igvNum = Number(comprobante.igv) || 0;
      const subtotal = totalNum - igvNum;

      doc.moveDown(0.5);
      doc.font("Helvetica-Bold").fontSize(fontSizeNormal);
      doc.text(`SUBTOTAL: S/. ${subtotal.toFixed(2)}`, PDF_CONFIG.margin, doc.y, { align: "right", width: PDF_CONFIG.width - 2 * PDF_CONFIG.margin });
      doc.text(`IGV (18%): S/. ${igvNum.toFixed(2)}`, PDF_CONFIG.margin, doc.y, { align: "right", width: PDF_CONFIG.width - 2 * PDF_CONFIG.margin });
      doc.fontSize(fontSizeLarge).text(`TOTAL: S/. ${totalNum.toFixed(2)}`, PDF_CONFIG.margin, doc.y, { align: "right", width: PDF_CONFIG.width - 2 * PDF_CONFIG.margin });

      // ===== PIE =====
      doc.moveDown(1);
      doc.font("Helvetica").fontSize(fontSizeSmall)
        .text("¡Gracias por su compra!", PDF_CONFIG.margin, doc.y, { align: "center", width: PDF_CONFIG.width - 2 * PDF_CONFIG.margin })
        .text("Para consultas: soporte@miempresa.com", PDF_CONFIG.margin, doc.y, { align: "center", width: PDF_CONFIG.width - 2 * PDF_CONFIG.margin })
        .text("Boleta Electrónica", PDF_CONFIG.margin, doc.y, { align: "center", width: PDF_CONFIG.width - 2 * PDF_CONFIG.margin });

      doc.end();

      stream.on("finish", () => resolve(filename));
      stream.on("error", (error) => reject(error));
    } catch (error) {
      reject(error);
    }
  });
};

// Función para enviar archivo por WhatsApp
export const enviarArchivoWSP = async (phone: string, filename: string, caption: string = "📄 Comprobante de Venta"): Promise<any> => {
  const localPath = path.join(__dirname, "../../dist/uploads", filename);
console.log(localPath)
console.log(phone)
  if (!fs.existsSync(localPath)) {
    throw new Error("Archivo no encontrado en el servidor");
  }

  try {
    const form = new FormData();
    form.append("chatId", `${phone}@c.us`);
    form.append("caption", caption);
    form.append("fileName", filename);
    form.append("file", fs.createReadStream(localPath));

    const greenUrl = `https://7105.media.greenapi.com/waInstance${ID_INSTANCE}/sendFileByUpload/${API_TOKEN_INSTANCE}`;

    const sendResponse = await axios.post(greenUrl, form, {
      headers: form.getHeaders(),
    });
    console.log(sendResponse)
    // Eliminar el archivo después de enviarlo
    fs.unlinkSync(localPath);

    return sendResponse.data;
  } catch (error) {
    // Asegurarse de eliminar el archivo incluso si hay error
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    throw error;
  }
};

// ============== CONTROLADORES ==============

// Enviar mensaje simple
export const enviarMensaje = async (req: Request, res: Response): Promise<void> => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    res.status(400).json({ 
      success: false,
      error: 'El número de teléfono y el mensaje son obligatorios' 
    });
    return;
  }

  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({ 
      success: false,
      error: 'Formato de número inválido. Usa formato internacional sin "+" ni espacios (ej: 51987654321)' 
    });
    return;
  }

  const url = `https://7105.api.greenapi.com/waInstance${ID_INSTANCE}/sendMessage/${API_TOKEN_INSTANCE}`;

  const payload = {
    chatId: `${phone}@c.us`,
    message,
    customPreview: {
      title: "Mensaje desde tu app",
      description: "Notificación automática"
    }
  };

  try {
    const response = await axios.post(url, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Mensaje enviado exitosamente',
      data: response.data 
    });
  } catch (error: any) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message || 'Error al enviar mensaje'
    });
  }
};

// Enviar comprobante por WhatsApp
export const enviarComprobante = async (req: Request, res: Response): Promise<void> => {
  const { idComprobante } = req.body;

  try {
    if (!idComprobante) {
      res.status(400).json({ 
        success: false,
        error: 'El ID del comprobante es obligatorio' 
      });
      return;
    }

    // Buscar el comprobante con todos los datos relacionados
    const comprobante = await Comprobante.findByPk(idComprobante, {
      include: [
        {
          model: Venta,
          as: 'Venta',
          include: [
            {
              model: Pedido,
              as: 'Pedido',
              include: [
                {
                  model: Persona,
                  as: 'Persona'
                }
              ]
            }
          ]
        },
        {
          model: TipoComprobante,
          as: 'TipoComprobante'
        }
      ]
    });

    if (!comprobante) {
      res.status(404).json({ 
        success: false,
        error: 'Comprobante no encontrado' 
      });
      return;
    }

    // Obtener detalles de la venta
    const detallesVenta = await DetalleVenta.findAll({
      where: { idventa: comprobante.Venta?.id },
      include: [
        {
          model: PedidoDetalle,
          as: 'PedidoDetalle',
          include: [
            {
              model: LoteTalla,
              as: 'LoteTalla',
              include: [
                {
                  model: Lote,
                  as: 'Lote',
                  include: [
                    {
                      model: Producto,
                      as: 'Producto'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    // Generar el PDF del comprobante
    const nombreArchivo = await generarPDFComprobante(
      comprobante, 
      comprobante.Venta, 
      comprobante.Venta?.Pedido, 
      detallesVenta
    );
    
    const telefono = "51" + comprobante?.Venta?.Pedido?.Persona?.telefono;
    let resultadoWSP = null;
    
    if (telefono && comprobante?.Venta?.Pedido?.Persona?.telefono) {
      resultadoWSP = await enviarArchivoWSP(
        telefono,
        nombreArchivo,
        `📄 ${comprobante.TipoComprobante?.nombre || 'Comprobante'} ${comprobante.numserie}`
      );
    } else {
      console.warn("⚠️ El comprobante no tiene número de teléfono, no se envió por WhatsApp.");
      res.status(400).json({
        success: false,
        error: 'El comprobante no tiene un número de teléfono válido asociado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Comprobante enviado exitosamente por WhatsApp',
      data: resultadoWSP
    });

  } catch (error: any) {
    console.error('Error al enviar comprobante:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno al enviar comprobante'
    });
  }
};

// Reenviar comprobante por WhatsApp
export const reenviarComprobante = async (req: Request, res: Response): Promise<void> => {
  const { idComprobante } = req.body;

  try {
    if (!idComprobante) {
      res.status(400).json({ 
        success: false,
        error: 'El ID del comprobante es obligatorio' 
      });
      return;
    }

    // Buscar el comprobante con todos los datos relacionados
    const comprobante = await Comprobante.findByPk(idComprobante, {
      include: [
        {
          model: Venta,
          as: 'Venta',
          include: [
            {
              model: Pedido,
              as: 'Pedido',
              include: [
                {
                  model: Persona,
                  as: 'Persona'
                }
              ]
            }
          ]
        },
        {
          model: TipoComprobante,
          as: 'TipoComprobante'
        }
      ]
    });

    if (!comprobante) {
      res.status(404).json({ 
        success: false,
        error: 'Comprobante no encontrado' 
      });
      return;
    }

    // Obtener detalles de la venta
    const detallesVenta = await DetalleVenta.findAll({
      where: { idventa: comprobante.Venta?.id },
      include: [
        {
          model: PedidoDetalle,
          as: 'PedidoDetalle',
          include: [
            {
              model: LoteTalla,
              as: 'LoteTalla',
              include: [
                {
                  model: Lote,
                  as: 'Lote',
                  include: [
                    {
                      model: Producto,
                      as: 'Producto'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    });

    // Generar el PDF del comprobante
    const nombreArchivo = await generarPDFComprobante(
      comprobante, 
      comprobante.Venta, 
      comprobante.Venta?.Pedido, 
      detallesVenta
    );
    
    const telefono = "51" + comprobante?.Venta?.Pedido?.Persona?.telefono;
    let resultadoWSP = null;
    
    if (telefono && comprobante?.Venta?.Pedido?.Persona?.telefono) {
      resultadoWSP = await enviarArchivoWSP(
        telefono,
        nombreArchivo,
        `🔄 REENVÍO - ${comprobante.TipoComprobante?.nombre || 'Comprobante'} ${comprobante.numserie}`
      );
    } else {
      console.warn("⚠️ El comprobante no tiene número de teléfono, no se envió por WhatsApp.");
      res.status(400).json({
        success: false,
        error: 'El comprobante no tiene un número de teléfono válido asociado'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Comprobante reenviado exitosamente por WhatsApp',
      data: resultadoWSP
    });

  } catch (error: any) {
    console.error('Error al reenviar comprobante:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno al reenviar comprobante'
    });
  }
};

// Enviar archivo genérico por WhatsApp
export const enviarArchivo = async (req: Request, res: Response): Promise<void> => {
  const { phone, filename } = req.body;

  if (!phone || !filename) {
    res.status(400).json({ 
      success: false,
      error: "El número de teléfono y nombre de archivo son obligatorios" 
    });
    return;
  }

  const phoneRegex = /^\d{10,15}$/;
  if (!phoneRegex.test(phone)) {
    res.status(400).json({ 
      success: false,
      error: "Formato de número inválido. Usa formato internacional sin '+' ni espacios (ej: 51987654321)" 
    });
    return;
  }

  try {
    const resultado = await enviarArchivoWSP(
      phone, 
      filename, 
      "📎 Archivo enviado desde tu servidor"
    );
    
    res.status(200).json({
      success: true,
      message: 'Archivo enviado exitosamente por WhatsApp',
      data: resultado,
    });

  } catch (error: any) {
    console.error('Error al enviar archivo:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message || 'Error al enviar archivo',
    });
  }
};

// Estado del servicio WhatsApp
export const obtenerEstadoServicio = async (req: Request, res: Response): Promise<void> => {
  try {
    const url = `https://7105.api.greenapi.com/waInstance${ID_INSTANCE}/getStateInstance/${API_TOKEN_INSTANCE}`;
    
    const response = await axios.get(url);
    
    res.status(200).json({
      success: true,
      message: 'Estado del servicio WhatsApp obtenido',
      data: response.data
    });
  } catch (error: any) {
    console.error('Error al obtener estado del servicio:', error);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message || 'Error al consultar estado del servicio'
    });
  }
};

// ============== FUNCIONES LEGACY (compatibilidad) ==============

// Mantener compatibilidad con nombres anteriores
export const sendWhatsAppMessage = enviarMensaje;
export const enviarComprobanteWSP = enviarComprobante;
export const reenviarComprobanteWSP = reenviarComprobante;
export const sendFileWhatsApp = enviarArchivo;