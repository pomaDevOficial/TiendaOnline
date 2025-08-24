import { Router } from 'express';
import { consultarDNI } from '../controllers/apidni.controller';

const RouterDni = Router();

// Definición de ruta con parámetro de DNI
RouterDni.get('/:dni', consultarDNI);

export default RouterDni;