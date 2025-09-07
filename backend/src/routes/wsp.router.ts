// routes/wsp.ts
import { Router } from 'express';
import { 
  enviarMensaje,
  enviarComprobante, 
  reenviarComprobante,
  enviarArchivo,
  obtenerEstadoServicio,
  // Funciones legacy para compatibilidad
  sendWhatsAppMessage,
  sendFileWhatsApp
} from '../controllers/wsp.controller';

const routerWsp = Router();

// ============== RUTAS PRINCIPALES ==============

/**
 * @route POST /api/v1/wsp/enviar-mensaje
 * @desc Enviar mensaje simple por WhatsApp
 * @body { phone: string, message: string }
 */
routerWsp.post('/enviar-mensaje', enviarMensaje);

/**
 * @route POST /api/v1/wsp/enviar-comprobante
 * @desc Enviar comprobante por WhatsApp (primera vez)
 * @body { idComprobante: number }
 */
routerWsp.post('/enviar-comprobante', enviarComprobante);

/**
 * @route POST /api/v1/wsp/reenviar-comprobante
 * @desc Reenviar comprobante por WhatsApp
 * @body { idComprobante: number }
 */
routerWsp.post('/reenviar-comprobante', reenviarComprobante);

/**
 * @route POST /api/v1/wsp/enviar-archivo
 * @desc Enviar archivo genérico por WhatsApp
 * @body { phone: string, filename: string }
 */
routerWsp.post('/enviar-archivo', enviarArchivo);

/**
 * @route GET /api/v1/wsp/estado-servicio
 * @desc Obtener estado del servicio WhatsApp (GreenAPI)
 */
routerWsp.get('/estado-servicio', obtenerEstadoServicio);

// ============== RUTAS LEGACY (Compatibilidad) ==============
// Mantener las rutas anteriores para no romper integraciones existentes

routerWsp.post('/send-message', sendWhatsAppMessage);
routerWsp.post('/send-file', sendFileWhatsApp);

// Alias alternativos
routerWsp.post('/mensaje', enviarMensaje);
routerWsp.post('/archivo', enviarArchivo);
routerWsp.post('/comprobante', enviarComprobante);
routerWsp.post('/reenvio-comprobante', reenviarComprobante);

export default routerWsp;