import { Router } from 'express';
import { consultarDNI ,consultarRUC} from '../controllers/apiSunat.controller';

const routerApiSunat = Router();

// 👉 Consultar DNI
routerApiSunat.get('/dni/:dni', consultarDNI);

// 👉 Consultar RUC
routerApiSunat.get('/ruc/:ruc', consultarRUC);

export default routerApiSunat;
