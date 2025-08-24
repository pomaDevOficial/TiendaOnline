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
    cambiarEstadoLote
} from '../controllers/lote.controller';

const LoteRouter = Router();

LoteRouter.post('/', createLote); // Crear un nuevo lote
LoteRouter.get('/', getLotes); // Obtener la lista de todos los lotes
LoteRouter.get('/disponibles', getLotesDisponibles); // Obtener solo lotes disponibles
LoteRouter.get('/eliminados', getLotesEliminados); // Obtener solo lotes eliminados
LoteRouter.get('/producto/:idproducto', getLotesByProducto); // Obtener lotes por producto
LoteRouter.get('/:id', getLoteById); // Obtener un lote por ID
LoteRouter.put('/:id', updateLote); // Actualizar un lote por ID
LoteRouter.patch('/:id/estado', cambiarEstadoLote); // Cambiar estado del lote (disponible/agotado)
LoteRouter.patch('/:id/eliminar', deleteLote); // Eliminar lógicamente un lote (cambiar estado a eliminado)
LoteRouter.patch('/:id/restaurar', restaurarLote); // Restaurar un lote eliminado

export default LoteRouter;