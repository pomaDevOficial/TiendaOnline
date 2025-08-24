import { Router } from 'express';
import { consultarRUC } from '../controllers/apiruc.controller';

const routerRUC = Router();

// Definición de ruta con parámetro de RUC
routerRUC.get('/:ruc', consultarRUC);

export default routerRUC;