import { Router } from "express";
import {
    createMovimientoLote,
    getMovimientosLote,
    getMovimientoLoteById,
    updateMovimientoLote,
    deleteMovimientoLote,
    getMovimientosRegistrados,
    getMovimientosEliminados,
    restaurarMovimientoLote,
    getMovimientosByLoteTalla,
    getMovimientosByFecha
} from '../controllers/movimiento_lote.controller';

const MovimientoLoteRouter = Router();

MovimientoLoteRouter.post('/', createMovimientoLote); // Crear un nuevo movimiento
MovimientoLoteRouter.get('/', getMovimientosLote); // Obtener todos los movimientos
MovimientoLoteRouter.get('/fecha', getMovimientosByFecha);
MovimientoLoteRouter.get('/registrados', getMovimientosRegistrados); // Obtener movimientos registrados/actualizados
MovimientoLoteRouter.get('/eliminados', getMovimientosEliminados); // Obtener movimientos eliminados
MovimientoLoteRouter.get('/lote-talla/:idlote_talla', getMovimientosByLoteTalla); // Obtener movimientos por lote_talla
MovimientoLoteRouter.get('/:id', getMovimientoLoteById); // Obtener un movimiento por ID
MovimientoLoteRouter.put('/:id', updateMovimientoLote); // Actualizar un movimiento por ID
MovimientoLoteRouter.patch('/:id/eliminar', deleteMovimientoLote); // Eliminar lógicamente un movimiento
MovimientoLoteRouter.patch('/:id/restaurar', restaurarMovimientoLote); // Restaurar un movimiento eliminado

export default MovimientoLoteRouter;