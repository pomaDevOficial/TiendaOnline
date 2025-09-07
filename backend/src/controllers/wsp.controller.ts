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
export const generarPDFComprobante = async (comprobante: any, venta: any, pedido: any, detallesVenta: any[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      // Crear nombre de archivo único
      const filename = `comprobante_${comprobante.numserie}.pdf`;
     /// path.join(__dirname, "../../dist/uploads");
      const filePath = path.join(__dirname, "../../dist/uploads", filename);
      console.log(filePath)
      // Crear directorio si no existe
      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      // Crear documento PDF (tamaño voucher: 80mm ancho ≈ 226.77 puntos)
      const doc = new PDFDocument({ 
        size: [226.77, 600], // Ancho fijo, alto variable
        margin: 10 
      });

      // Pipe el PDF a un archivo
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Estilos
      const fontSizeSmall = 8;
      const fontSizeNormal = 10;
      const fontSizeLarge = 12;
      const lineHeight = 5;

      // Encabezado
      doc.fontSize(fontSizeLarge)
         .font('Helvetica-Bold')
         .text('MI EMPRESA', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.fontSize(fontSizeNormal)
         .text('RUC: 20123456789', { align: 'center' });
      
      doc.moveDown(0.5);
      doc.text('BOLETA DE VENTA ELECTRÓNICA', { align: 'center' });
      
      // Línea separadora
      doc.moveTo(doc.x, doc.y + lineHeight)
         .lineTo(doc.x + 206.77, doc.y + lineHeight)
         .stroke();
      
      doc.moveDown();

      // Información del comprobante
      doc.fontSize(fontSizeNormal)
         .font('Helvetica-Bold')
         .text(`${comprobante.TipoComprobante?.nombre || 'BOLETA'}: ${comprobante.numserie}`, { align: 'left' });
      
      doc.font('Helvetica')
         .fontSize(fontSizeSmall)
         .text(`Fecha: ${new Date(venta.fechaventa).toLocaleDateString()}`, { align: 'left' });
      
      doc.moveDown();

      // Información del cliente
      doc.font('Helvetica-Bold')
         .text('CLIENTE:', { align: 'left' });
      
      doc.font('Helvetica')
         .text(`${pedido.Persona?.nombre || 'CLIENTE GENERAL'}`, { align: 'left' });
      
      if (pedido.Persona?.documento) {
        doc.text(`DOC: ${pedido.Persona.documento}`, { align: 'left' });
      }
      
      doc.moveDown();

      // Línea separadora
      doc.moveTo(doc.x, doc.y + lineHeight)
         .lineTo(doc.x + 206.77, doc.y + lineHeight)
         .stroke();
      
      doc.moveDown();

      // Detalles de productos
      doc.font('Helvetica-Bold')
         .text('DESCRIPCIÓN', 10, doc.y, { width: 120, align: 'left' })
         .text('CANT', 130, doc.y, { width: 30, align: 'right' })
         .text('TOTAL', 160, doc.y, { width: 50, align: 'right' });
      
      doc.moveDown(0.5);

      // Línea separadora
      doc.moveTo(doc.x, doc.y + lineHeight)
         .lineTo(doc.x + 206.77, doc.y + lineHeight)
         .stroke();
      
      doc.moveDown(0.5);
      // Productos
      detallesVenta.forEach(detalle => {
        const producto = detalle.PedidoDetalle?.LoteTalla?.Lote?.Producto?.nombre || 'Producto';
        const cantidad = detalle.PedidoDetalle?.cantidad || 0;
        const precio = detalle.precio_venta_real || 0;
        const total = cantidad * precio;

        doc.font('Helvetica')
           .fontSize(fontSizeSmall)
           .text(producto.substring(0, 20), 10, doc.y, { width: 120, align: 'left' })
           .text(cantidad.toString(), 130, doc.y, { width: 30, align: 'right' })
           .text(`S/. ${total}`, 160, doc.y, { width: 50, align: 'right' });
        
        doc.moveDown(0.5);
      });

      // Línea separadora
      doc.moveTo(doc.x, doc.y + lineHeight)
         .lineTo(doc.x + 206.77, doc.y + lineHeight)
         .stroke();
      
      doc.moveDown();

      // Totales
      doc.font('Helvetica-Bold')
         .text(`SUBTOTAL: S/. ${(comprobante.total - comprobante.igv)}`, { align: 'right' });
      
      doc.text(`IGV (18%): S/. ${comprobante.igv}`, { align: 'right' });
      
      doc.fontSize(fontSizeLarge)
         .text(`TOTAL: S/. ${comprobante.total}`, { align: 'right' });
      
      doc.moveDown();

      // Pie de página
      doc.fontSize(fontSizeSmall)
         .font('Helvetica')
         .text('¡Gracias por su compra!', { align: 'center' });
      
      doc.text('Contacto: +51 987 654 321', { align: 'center' });

      // Finalizar documento
      doc.end();

      // Cuando se termine de generar el PDF
      stream.on('finish', () => {
        resolve(filename);
      });

      stream.on('error', (error) => {
        reject(error);
      });

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