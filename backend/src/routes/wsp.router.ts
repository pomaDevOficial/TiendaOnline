// routes/wsp.ts
import { Router } from 'express';
import { sendWhatsAppMessage } from '../controllers/wsp.controller';

const routerWsp = Router();

routerWsp.post('/sendmsg', sendWhatsAppMessage);

export default routerWsp;
