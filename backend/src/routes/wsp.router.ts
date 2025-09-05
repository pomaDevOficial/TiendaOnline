// routes/wsp.ts
import { Router } from 'express';
import { enviarArchivoWSP, enviarComprobanteWSP, reenviarComprobanteWSP, sendWhatsAppMessage} from '../controllers/wsp.controller';

const routerWsp = Router();

routerWsp.post('/wsp/enviar-comprobante', enviarComprobanteWSP);
routerWsp.post('/ws/enviarNumero', sendWhatsAppMessage);
routerWsp.post('/wsp/reenviar-comprobante', reenviarComprobanteWSP);

export default routerWsp;
