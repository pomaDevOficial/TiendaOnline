"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lote_controller_1 = require("../controllers/lote.controller");
const LoteRouter = (0, express_1.Router)();
LoteRouter.post('/', lote_controller_1.createLote); // Crear un nuevo lote
LoteRouter.post('/completo', lote_controller_1.createLoteCompleto); // Crear lote completo con detalles y movimientos
LoteRouter.get('/', lote_controller_1.getLotes); // Obtener la lista de todos los lotes
LoteRouter.get('/buscar', lote_controller_1.getLotesBuscar); // 👈 Nueva ruta de búsqueda
LoteRouter.get('/:id/info', lote_controller_1.getLoteObtenerInformacion);
LoteRouter.get('/disponibles', lote_controller_1.getLotesDisponibles);
LoteRouter.get('/eliminados', lote_controller_1.getLotesEliminados);
LoteRouter.get('/producto/:idproducto', lote_controller_1.getLotesByProducto);
LoteRouter.get('/:id', lote_controller_1.getLoteById);
LoteRouter.put('/:id', lote_controller_1.updateLote);
LoteRouter.patch('/:id/estado', lote_controller_1.cambiarEstadoLote);
LoteRouter.patch('/:id/eliminar', lote_controller_1.deleteLote);
LoteRouter.patch('/:id/restaurar', lote_controller_1.restaurarLote);
exports.default = LoteRouter;
