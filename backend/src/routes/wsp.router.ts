// routes/wsp.ts
import { Router } from 'express';
import { enviarComprobanteWSP, reenviarComprobanteWSP} from '../controllers/wsp.controller';

const routerWsp = Router();

routerWsp.post('/wsp/enviar-comprobante', enviarComprobanteWSP);
routerWsp.post('/wsp/reenviar-comprobante', reenviarComprobanteWSP);

export default routerWsp;
