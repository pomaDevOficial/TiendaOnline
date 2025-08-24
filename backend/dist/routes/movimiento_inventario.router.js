"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const movimiento_lote_controller_1 = require("../controllers/movimiento_lote.controller");
const MovimientoLoteRouter = (0, express_1.Router)();
MovimientoLoteRouter.post('/', movimiento_lote_controller_1.createMovimientoLote); // Crear un nuevo movimiento
MovimientoLoteRouter.get('/', movimiento_lote_controller_1.getMovimientosLote); // Obtener todos los movimientos
MovimientoLoteRouter.get('/registrados', movimiento_lote_controller_1.getMovimientosRegistrados); // Obtener movimientos registrados/actualizados
MovimientoLoteRouter.get('/eliminados', movimiento_lote_controller_1.getMovimientosEliminados); // Obtener movimientos eliminados
MovimientoLoteRouter.get('/lote-talla/:idlote_talla', movimiento_lote_controller_1.getMovimientosByLoteTalla); // Obtener movimientos por lote_talla
MovimientoLoteRouter.get('/:id', movimiento_lote_controller_1.getMovimientoLoteById); // Obtener un movimiento por ID
MovimientoLoteRouter.put('/:id', movimiento_lote_controller_1.updateMovimientoLote); // Actualizar un movimiento por ID
MovimientoLoteRouter.patch('/:id/eliminar', movimiento_lote_controller_1.deleteMovimientoLote); // Eliminar lógicamente un movimiento
MovimientoLoteRouter.patch('/:id/restaurar', movimiento_lote_controller_1.restaurarMovimientoLote); // Restaurar un movimiento eliminado
exports.default = MovimientoLoteRouter;
