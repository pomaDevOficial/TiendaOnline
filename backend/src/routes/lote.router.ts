import { Router } from "express";
import {
    createLote,
    getLotes,
    getLoteById,
    updateLote,
    deleteLote,
    getLotesDisponibles,
    getLotesEliminados,
    restaurarLote,
    getLotesByProducto,
    cambiarEstadoLote,
    createLoteCompleto,
    getLoteObtenerInformacion,
    getLotesBuscar   // 👈 importar
} from '../controllers/lote.controller';

const LoteRouter = Router();

LoteRouter.post('/', createLote); // Crear un nuevo lote
LoteRouter.post('/completo', createLoteCompleto); // Crear lote completo con detalles y movimientos

LoteRouter.get('/', getLotes); // Obtener la lista de todos los lotes
LoteRouter.get('/buscar', getLotesBuscar); // 👈 Nueva ruta de búsqueda

LoteRouter.get('/:id/info', getLoteObtenerInformacion); 
LoteRouter.get('/disponibles', getLotesDisponibles); 
LoteRouter.get('/eliminados', getLotesEliminados); 
LoteRouter.get('/producto/:idproducto', getLotesByProducto); 
LoteRouter.get('/:id', getLoteById); 

LoteRouter.put('/:id', updateLote); 
LoteRouter.patch('/:id/estado', cambiarEstadoLote); 
LoteRouter.patch('/:id/eliminar', deleteLote); 
LoteRouter.patch('/:id/restaurar', restaurarLote); 

export default LoteRouter;
