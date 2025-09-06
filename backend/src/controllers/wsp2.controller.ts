import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import twilio from "twilio";
import axios from "axios";
import FormData from "form-data";
import Comprobante from "../models/comprobante.model";
import Venta from "../models/venta.model";
import Pedido from "../models/pedido.model";
import Persona from "../models/persona.model";
import TipoComprobante from "../models/tipo_comprobante.model";
import DetalleVenta from "../models/detalle_venta.model";
import PedidoDetalle from "../models/pedido_detalle.model";
import LoteTalla from "../models/lote_talla.model";
import Lote from "../models/lote.model";
import Producto from "../models/producto.model";

// Config Twilio - USAR SANDBOX FIJO
const client = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
const fromWhatsApp = 'whatsapp:+14155238886'; // Número fijo del sandbox

// --- Función para formatear números de teléfono ---
const formatearNumeroWhatsApp = (phone: string): string => {
  if (!phone) throw new Error('Número de teléfono es requerido');
  
  // Limpiar el número
  let numeroLimpio = phone.replace(/\D/g, '');
  
  // Si es número peruano de 9 dígitos, agregar código de país
  if (numeroLimpio.length === 9 && !numeroLimpio.startsWith('51')) {
    numeroLimpio = '51' + numeroLimpio;
  }
  
  return `whatsapp:+${numeroLimpio}`;
};

// --- Función corregida para subir archivo a file.io ---
export const subirArchivoAFileIO = async (filePath: string): Promise<string> => {
  try {
    // Verificar que el archivo existe antes de subirlo
    if (!fs.existsSync(filePath)) {
      throw new Error(`El archivo no existe: ${filePath}`);
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    
    // Configuraciones adicionales para file.io
    formData.append('expires', '1w'); // El archivo expira en 1 semana
    formData.append('maxDownloads', '10'); // Máximo 10 descargas
    formData.append('autoDelete', 'true'); // Auto eliminar después de expirar

    console.log('Subiendo archivo a file.io:', filePath);

    const response = await axios.post('https://file.io', formData, {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json',
      },
      timeout: 60000, // Aumentar timeout a 60 segundos
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log('Respuesta completa de file.io:', JSON.stringify(response.data, null, 2));

    // Verificar que la respuesta sea exitosa
    if (!response.data) {
      throw new Error('Respuesta vacía de file.io');
    }

    // Manejar la estructura de respuesta según la documentación de file.io
    let fileUrl: string;

    if (response.data.success === true && response.data.link) {
      // Caso principal: respuesta exitosa con link
      fileUrl = response.data.link;
    } else if (response.data.success === false) {
      // Caso de error del servidor
      const errorMsg = response.data.message || response.data.error || 'Error desconocido en file.io';
      throw new Error(`Error de file.io: ${errorMsg}`);
    } else if (response.data.link) {
      // Caso alternativo: respuesta tiene link directo
      fileUrl = response.data.link;
    } else if (typeof response.data === 'string' && response.data.startsWith('http')) {
      // Caso: respuesta es directamente la URL
      fileUrl = response.data;
    } else {
      // Caso: formato no reconocido
      console.error('Formato de respuesta no esperado:', response.data);
      throw new Error(`Formato de respuesta no reconocido de file.io: ${JSON.stringify(response.data)}`);
    }

    // Validar que la URL obtenida sea válida
    if (!fileUrl || !fileUrl.startsWith('http')) {
      throw new Error(`URL inválida obtenida de file.io: ${fileUrl}`);
    }

    console.log('✅ Archivo subido exitosamente. URL:', fileUrl);
    
    // Verificar que la URL sea accesible (opcional)
    try {
      const testResponse = await axios.head(fileUrl, { timeout: 10000 });
      console.log('✅ URL verificada, status:', testResponse.status);
    } catch (verifyError) {
      console.warn('⚠️  No se pudo verificar la URL, pero continuando:', verifyError);
    }

    return fileUrl;

  } catch (error: any) {
    console.error('❌ Error subiendo archivo a file.io:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Errores específicos de file.io
      if (error.response.status === 413) {
        throw new Error('Archivo demasiado grande para file.io (máximo ~100MB)');
      } else if (error.response.status === 400) {
        throw new Error('Archivo inválido o formato no soportado');
      } else if (error.response.status === 429) {
        throw new Error('Demasiadas solicitudes a file.io. Intenta más tarde');
      }
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout subiendo archivo a file.io. El archivo puede ser demasiado grande');
    }
    
    if (error.code === 'ENOTFOUND') {
      throw new Error('No se pudo conectar a file.io. Verifica tu conexión a internet');
    }

    throw new Error(`Error subiendo archivo: ${error.message}`);
  }
};

// --- Función mejorada para enviar archivo por WhatsApp ---
export const enviarArchivoWSP = async (phone: string, filename: string, caption: string = "📄 Comprobante de Venta") => {
  const filePath = path.join(__dirname, "../uploads", filename);
  
  // Verificar que el archivo existe
  if (!fs.existsSync(filePath)) {
    throw new Error(`El archivo ${filename} no existe en ${filePath}`);
  }

  // Verificar el tamaño del archivo (Twilio tiene límite de ~5MB)
  const stats = fs.statSync(filePath);
  const fileSizeInMB = stats.size / (1024 * 1024);
  console.log(`Tamaño del archivo: ${fileSizeInMB.toFixed(2)} MB`);
  
  if (fileSizeInMB > 5) {
    throw new Error(`Archivo demasiado grande (${fileSizeInMB.toFixed(2)}MB). Máximo permitido: 5MB`);
  }

  try {
    // 1. Subir el archivo a file.io
    console.log('📤 Subiendo archivo a file.io...');
    const fileUrl = await subirArchivoAFileIO(filePath);
    console.log('✅ Archivo disponible en URL:', fileUrl);

    // 2. Pausa breve para que el servicio procese
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 3. Formatear número de WhatsApp
    const toNumber = formatearNumeroWhatsApp(phone);
    console.log('📱 Enviando WhatsApp de:', fromWhatsApp, 'a:', toNumber);

    // 4. Enviar mensaje por WhatsApp con el archivo
    const result = await client.messages.create({
      from: fromWhatsApp,
      to: toNumber,
      body: caption,
      mediaUrl: [fileUrl],
    });

    console.log('✅ Mensaje WhatsApp enviado exitosamente. SID:', result.sid);
    return result;

  } catch (error: any) {
    console.error('❌ Error en enviarArchivoWSP:', error.message);
    
    // Manejo específico de errores de Twilio
    if (error.code === 20404) {
      throw new Error('Error de configuración Twilio: Verifica el número from y los permisos de WhatsApp');
    } else if (error.code === 21608) {
      throw new Error('Número no verificado en Twilio Sandbox. Debes enviar "join timberwolf-mastiff" al +14155238886');
    } else if (error.code === 63016 || error.code === 63003) {
      throw new Error('No se pudo acceder al archivo. El archivo puede haber expirado o la URL no es válida');
    } else if (error.code === 21610) {
      throw new Error('Número de WhatsApp inválido o no existe');
    }
    
    throw error;
  }
};
// --- Función para formatear números sin toFixed ---
const formatearNumero = (valor: any): string => {
  if (valor === null || valor === undefined) return "0.00";
  
  const num = parseFloat(valor);
  if (isNaN(num)) return "0.00";
  
  // Redondear a 2 decimales sin toFixed
  const redondeado = Math.round(num * 100) / 100;
  const partes = redondeado.toString().split('.');
  
  if (partes.length === 1) {
    return partes[0] + ".00";
  } else if (partes[1].length === 1) {
    return partes[0] + "." + partes[1] + "0";
  } else {
    return partes[0] + "." + partes[1].substring(0, 2);
  }
};

// --- Generar PDF del comprobante ---
export const generarPDFComprobante = async (comprobante: any, venta: any, pedido: any, detallesVenta: any[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const filename = `comprobante_${comprobante.numserie}_${Date.now()}.pdf`;
      const filePath = path.join(__dirname, "../uploads", filename);

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      const doc = new PDFDocument({ size: [226.77, 600], margin: 10 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      const totalComprobante = parseFloat(comprobante.total || 0);
      const igvComprobante = parseFloat(comprobante.igv || 0);
      const subtotalComprobante = totalComprobante - igvComprobante;

      // Encabezado
      doc.fontSize(12).font("Helvetica-Bold").text("MI EMPRESA", { align: "center" });
      doc.moveDown().fontSize(10).text("RUC: 20123456789", { align: "center" });
      doc.moveDown().text("BOLETA DE VENTA ELECTRÓNICA", { align: "center" });

      doc.moveDown();
      doc.font("Helvetica-Bold").text(`${comprobante.TipoComprobante?.nombre || "BOLETA"}: ${comprobante.numserie}`);
      
      const fechaVenta = venta?.fechaventa ? new Date(venta.fechaventa).toLocaleDateString() : "-";
      doc.font("Helvetica").fontSize(8).text(`Fecha: ${fechaVenta}`);

      // Cliente
      doc.moveDown().font("Helvetica-Bold").text("CLIENTE:");
      const nombreCliente = `${pedido.Persona?.nombres || ''} ${pedido.Persona?.apellidos || ''}`.trim() || "CLIENTE GENERAL";
      doc.font("Helvetica").text(nombreCliente);
      if (pedido.Persona?.nroidentidad) doc.text(`DOC: ${pedido.Persona.nroidentidad}`);

      // Detalles
      doc.moveDown();
      doc.font("Helvetica-Bold").text("DESCRIPCIÓN", 10, doc.y, { width: 120 })
        .text("CANT", 130, doc.y, { width: 30, align: "right" })
        .text("TOTAL", 160, doc.y, { width: 50, align: "right" });

      detallesVenta.forEach((d) => {
        const prod = d.PedidoDetalle?.LoteTalla?.Lote?.Producto?.nombre || "Producto";
        const cant = parseFloat(d.PedidoDetalle?.cantidad || 0);
        const precio = parseFloat(d.precio_venta_real || 0);
        const total = cant * precio;

        doc.font("Helvetica").fontSize(8)
          .text(prod.substring(0, 20), 10, doc.y, { width: 120 })
          .text(cant.toString(), 130, doc.y, { width: 30, align: "right" })
          .text(`S/. ${formatearNumero(total)}`, 160, doc.y, { width: 50, align: "right" });
      });

      // Totales
      doc.moveDown();
      doc.font("Helvetica-Bold").text(`SUBTOTAL: S/. ${formatearNumero(subtotalComprobante)}`, { align: "right" });
      doc.text(`IGV (18%): S/. ${formatearNumero(igvComprobante)}`, { align: "right" });
      doc.fontSize(12).text(`TOTAL: S/. ${formatearNumero(totalComprobante)}`, { align: "right" });

      doc.end();

      stream.on("finish", () => resolve(filename));
      stream.on("error", reject);
    } catch (err) {
      reject(err);
    }
  });
};

// --- Limpiar archivos temporales ---
const limpiarArchivoTemporal = (filename: string) => {
  try {
    const filePath = path.join(__dirname, "../uploads", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Archivo temporal eliminado:', filename);
    }
  } catch (error) {
    console.error('Error eliminando archivo temporal:', error);
  }
};

// --- Enviar comprobante ---
export const enviarComprobanteWSP = async (req: Request, res: Response): Promise<void> => {
  let filename: string | null = null;
  
  try {
    const { idComprobante } = req.body;
    
    if (!idComprobante) {
      res.status(400).json({ error: "ID de compprobante requerido" });
      return;
    }

    // Obtener comprobante con relaciones
    const comprobante = await Comprobante.findByPk(idComprobante, {
      include: [
        { 
          model: Venta, 
          as: "Venta",
          include: [
            { 
              model: Pedido, 
              as: "Pedido",
              include: [
                { 
                  model: Persona, 
                  as: "Persona",
                  attributes: ['id', 'nombres', 'apellidos', 'nroidentidad', 'telefono']
                }
              ] 
            }
          ] 
        },
        { 
          model: TipoComprobante, 
          as: "TipoComprobante"
        }
      ],
    });

    if (!comprobante) {
      res.status(404).json({ error: "Comprobante no encontrado" });
      return;
    }

    // Obtener detalles de venta
    const detalles = await DetalleVenta.findAll({
      where: { idventa: comprobante.Venta?.id },
      include: [
        { 
          model: PedidoDetalle, 
          as: "PedidoDetalle",
          include: [
            { 
              model: LoteTalla, 
              as: "LoteTalla",
              include: [
                { 
                  model: Lote, 
                  as: "Lote",
                  include: [
                    { 
                      model: Producto, 
                      as: "Producto"
                    }
                  ] 
                }
              ] 
            }
          ] 
        }
      ],
    });

    // Generar PDF
    filename = await generarPDFComprobante(comprobante, comprobante.Venta, comprobante.Venta?.Pedido, detalles);

    let telefono = comprobante?.Venta?.Pedido?.Persona?.telefono;
    if (!telefono) {
      if (filename) limpiarArchivoTemporal(filename);
      res.status(400).json({ error: "El cliente no tiene teléfono registrado" });
      return;
    }

    // Limpiar y formatear teléfono
    telefono = telefono.replace(/\D/g, '');
    if (telefono.length === 9) {
      telefono = '51' + telefono; // Código de país Perú
    }

    let result;
    try {
      result = await enviarArchivoWSP(telefono, filename, `📄 ${comprobante.TipoComprobante?.nombre || "Comprobante"} ${comprobante.numserie}`);
      
      // SOLO eliminar después de enviar exitosamente
      limpiarArchivoTemporal(filename);

      res.json({ 
        success: true, 
        message: "Comprobante enviado exitosamente",
        data: {
          comprobante: {
            id: comprobante.id,
            numserie: comprobante.numserie,
            total: comprobante.total
          },
          cliente: {
            nombre: `${comprobante.Venta?.Pedido?.Persona?.nombres || ''} ${comprobante.Venta?.Pedido?.Persona?.apellidos || ''}`.trim(),
            telefono: telefono
          }
        }
      });
      
    } catch (whatsappError: any) {
      // Eliminar archivo en caso de error
      if (filename) limpiarArchivoTemporal(filename);
      
      console.log('Error enviando archivo, intentando solo texto:', whatsappError.message);
      
      const fechaVenta = comprobante.Venta?.fechaventa
        ? new Date(comprobante.Venta.fechaventa).toLocaleDateString()
        : "-";
      
      // Fallback: mensaje de texto
      const mensajeTexto = `📄 Comprobante ${comprobante.TipoComprobante?.nombre || "BOLETA"} ${comprobante.numserie}
      
Cliente: ${comprobante.Venta?.Pedido?.Persona?.nombres || ''} ${comprobante.Venta?.Pedido?.Persona?.apellidos || ''}
Total: S/. ${formatearNumero(comprobante.total)}
Fecha: ${fechaVenta}

⚠️ El archivo PDF no pudo enviarse. Contacte con soporte.`;

      const toNumber = formatearNumeroWhatsApp(telefono);
      
      result = await client.messages.create({
        from: fromWhatsApp,
        to: toNumber,
        body: mensajeTexto
      });

      res.json({ 
        success: true, 
        message: "Mensaje enviado (sin archivo adjunto)",
        data: result
      });
    }

  } catch (err: any) {
    if (filename) limpiarArchivoTemporal(filename);
    console.error('Error en enviarComprobanteWSP:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- Reenviar comprobante ---
export const reenviarComprobanteWSP = async (req: Request, res: Response): Promise<void> => {
  let filename: string | null = null;
  
  try {
    const { idComprobante } = req.params;
    
    if (!idComprobante) {
      res.status(400).json({ error: "ID de comprobante requerido" });
      return;
    }

    // Obtener comprobante
    const comprobante = await Comprobante.findByPk(idComprobante, {
      include: [
        { 
          model: Venta, 
          as: "Venta",
          include: [
            { 
              model: Pedido, 
              as: "Pedido",
              include: [
                { 
                  model: Persona, 
                  as: "Persona",
                  attributes: ['id', 'nombres', 'apellidos', 'telefono']
                }
              ] 
            }
          ] 
        },
        { 
          model: TipoComprobante, 
          as: "TipoComprobante"
        }
      ],
    });

    if (!comprobante) {
      res.status(404).json({ error: "Comprobante no encontrado" });
      return;
    }

    // Verificar teléfono
    let telefono = comprobante.Venta?.Pedido?.Persona?.telefono;
    if (!telefono) {
      res.status(400).json({ error: "El cliente no tiene número de teléfono registrado" });
      return;
    }

    // Limpiar y formatear teléfono
    telefono = telefono.replace(/\D/g, '');
    if (telefono.length === 9) {
      telefono = '51' + telefono;
    }

    console.log('Enviando a teléfono:', telefono);

    // Obtener detalles
    const detalles = await DetalleVenta.findAll({
      where: { idventa: comprobante.Venta?.id },
      include: [
        { 
          model: PedidoDetalle, 
          as: "PedidoDetalle",
          include: [
            { 
              model: LoteTalla, 
              as: "LoteTalla",
              include: [
                { 
                  model: Lote, 
                  as: "Lote",
                  include: [
                    { 
                      model: Producto, 
                      as: "Producto"
                    }
                  ] 
                }
              ] 
            }
          ] 
        }
      ],
    });

    // Generar PDF
    filename = await generarPDFComprobante(comprobante, comprobante.Venta, comprobante.Venta?.Pedido, detalles);

    try {
      // Enviar por WhatsApp
      const result = await enviarArchivoWSP(telefono, filename, `📄 Reenvío ${comprobante.TipoComprobante?.nombre || "Comprobante"} ${comprobante.numserie}`);

      // SOLO eliminar después de enviar exitosamente
      limpiarArchivoTemporal(filename);

      res.json({ 
        success: true, 
        message: "Comprobante reenviado exitosamente"
      });
    } catch (error: any) {
      // Eliminar archivo en caso de error
      if (filename) limpiarArchivoTemporal(filename);
      
      const fechaVenta = comprobante.Venta?.fechaventa
        ? new Date(comprobante.Venta.fechaventa).toLocaleDateString()
        : "-";
      
      // Fallback a mensaje de texto
      const mensajeTexto = `📄 Reenvío Comprobante ${comprobante.TipoComprobante?.nombre || "BOLETA"} ${comprobante.numserie}
      
Cliente: ${comprobante.Venta?.Pedido?.Persona?.nombres || ''} ${comprobante.Venta?.Pedido?.Persona?.apellidos || ''}
Total: S/. ${formatearNumero(comprobante.total)}
Fecha: ${fechaVenta}

⚠️ El archivo PDF no pudo enviarse. Contacte con soporte.`;

      const toNumber = formatearNumeroWhatsApp(telefono);
      
      const result = await client.messages.create({
        from: fromWhatsApp,
        to: toNumber,
        body: mensajeTexto
      });

      res.json({ 
        success: true, 
        message: "Mensaje reenviado (sin archivo adjunto)"
      });
    }
  } catch (err: any) {
    if (filename) limpiarArchivoTemporal(filename);
    console.error('Error en reenviarComprobanteWSP:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- Enviar mensaje simple ---
export const sendWhatsAppMessage = async (req: Request, res: Response): Promise<void> => {
  const { phone, message } = req.body;
  
  if (!phone || !message) {
    res.status(400).json({ error: "Falta número o mensaje" });
    return;
  }

  try {
    const toNumber = formatearNumeroWhatsApp(phone);
    
    const response = await client.messages.create({
      from: fromWhatsApp,
      to: toNumber,
      body: message,
    });
    
    res.json({ success: true, sid: response.sid });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// --- Enviar archivo genérico ---
export const sendFileWhatsApp = async (req: Request, res: Response): Promise<void> => {
  const { phone, filename } = req.body;
  
  if (!phone || !filename) {
    res.status(400).json({ error: "Falta número o archivo" });
    return;
  }

  try {
    const response = await enviarArchivoWSP(phone, filename, "📎 Archivo enviado");
    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Enviar solo mensaje de texto
export const enviarMensajeTextoWSP = async (req: Request, res: Response): Promise<void> => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    res.status(400).json({ error: "Falta número o mensade" });
    return;
  }

  try {
    const toNumber = formatearNumeroWhatsApp(phone);
    
    const responseMsg = await client.messages.create({
      from: fromWhatsApp,
      to: toNumber,
      body: message,
    });

    res.status(200).json({
      success: true,
      message: "Mensaje enviado correctamente",
      sid: responseMsg.sid,
    });
  } catch (error: any) {
    console.error("Error enviando mensaje:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Error al enviar mensaje",
    });
  }
};