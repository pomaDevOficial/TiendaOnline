// routes/wsp.ts
import { Router } from 'express';
import { sendFileWhatsApp, sendWhatsAppMessage } from '../controllers/wsp.controller';

const routerWsp = Router();

routerWsp.post('/sendmsg', sendWhatsAppMessage);
routerWsp.post('/sendfile', sendFileWhatsApp);

export default routerWsp;
